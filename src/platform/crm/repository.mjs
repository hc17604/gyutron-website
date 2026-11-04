import { eventId } from '../ids.mjs';
import { API_FIELDS, STATUS_VALUES, ACCESS_TYPES } from '../schemas.mjs';
import { WorkspaceError, requirePermission, resourceSpec, validatePayload, STAGES, CURRENCIES } from './schema.mjs';
import { workspaceDate, workspaceDayStart } from './time.mjs';

const INTAKE = Object.freeze({ leads: 'leads', rfqs: 'rfqs', support: 'support_requests', downloads: 'download_requests' });
const MAX_PAGE_SIZE = 100;
function now() { return new Date().toISOString(); }
// Long entropy avoids birthday collisions in large customer/audit datasets.
function publicId(prefix) { return `${prefix}-${now().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().replaceAll('-', '').toUpperCase()}`; }
function nonempty(value, max = 200) { return String(value || '').trim().slice(0, max); }
function int(value, fallback, max) {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1 || n > max) throw new WorkspaceError(422, 'INVALID_PAGINATION', 'Use positive whole page and limit values within the supported range.');
  return n;
}
function pageOptions(options) { return { page: int(options.page, 1, 100000), limit: int(options.limit, 50, MAX_PAGE_SIZE) }; }
function intakeTable(resource) {
  if (!Object.prototype.hasOwnProperty.call(INTAKE, resource)) throw new WorkspaceError(404, 'NOT_FOUND', 'Unknown inbox resource.');
  return INTAKE[resource];
}
function selectColumns(spec, alias = 'r') { return spec.columns.map(c => `${alias}.${c}`).join(', '); }
function likePattern(value) { return value; }
function buildFilters(resource, options = {}, { includeArchived = true } = {}) {
  const spec = resourceSpec(resource), where = [], binds = [];
  if (spec.mutable) {
    if (options.archived === 'true') where.push('r.archived_at IS NOT NULL');
    else if (options.archived === 'all' && includeArchived) { /* explicit all view */ }
    else where.push('r.archived_at IS NULL');
  }
  const q = nonempty(options.q);
  if (q) {
    const contacts=resource==='customers'&&options.with_contacts==='true';
    where.push(`(${spec.search.map(c => `instr(lower(r.${c}),lower(?))>0`).join(' OR ')}${contacts?" OR EXISTS(SELECT 1 FROM crm_contacts contact WHERE contact.customer_id=r.public_id AND contact.archived_at IS NULL AND (instr(lower(contact.name),lower(?))>0 OR instr(lower(contact.email),lower(?))>0))":''})`);
    binds.push(...spec.search.map(() => likePattern(q)));
    if(contacts)binds.push(likePattern(q),likePattern(q));
  }
  for (const key of spec.filters) {
    if (options[key] == null || options[key] === '') continue;
    const value = nonempty(options[key]);
    const rule = spec.fields && spec.fields[key];
    if (rule && rule.enum && !rule.enum.includes(value)) throw new WorkspaceError(422, 'INVALID_FILTER', `Unsupported ${key} filter.`);
    where.push(`r.${key} = ?`); binds.push(value);
  }
  if (resource === 'tasks' && options.overdue === 'true') {
    where.push("r.status != 'done' AND r.due_date != '' AND r.due_date < ?");
    binds.push(workspaceDate(options._timeZone));
  }
  for (const field of ['created_at', 'updated_at']) {
    if (!spec.columns.includes(field)) continue;
    for (const [suffix, operator] of [['from', '>='], ['to', '<']]) {
      const value = options[field.replace('_at','')+'_'+suffix];
      if (!value) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value+'T00:00:00Z')) || new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value) throw new WorkspaceError(422,'INVALID_DATE','Select a valid date range.');
      const day=suffix==='to'?new Date(Date.parse(value+'T00:00:00Z')+86400000).toISOString().slice(0,10):value;
      where.push(`r.${field} ${operator} ?`); binds.push(workspaceDayStart(day,options._timeZone));
    }
  }
  if (resource === 'opportunities') {
    if (['amount_min','amount_max'].some(key=>options[key]!==undefined&&options[key]!=='')&&!options.currency) throw new WorkspaceError(422,'CURRENCY_REQUIRED','Select a currency before filtering by value.');
    if (options.closed === 'false') where.push("r.stage NOT IN ('won','lost')");
    for (const [key,operator] of [['amount_min','>='],['amount_max','<=']]) if (options[key] !== undefined && options[key] !== '') {
      const value=Number(options[key]);if (!Number.isSafeInteger(value)||value<0||value>1000000000000) throw new WorkspaceError(422,'INVALID_AMOUNT','Use a valid amount in minor units.');
      where.push(`r.amount_minor ${operator} ?`);binds.push(value);
    }
  }
  return { whereSql: where.length ? ` WHERE ${where.join(' AND ')}` : '', binds };
}
function joinsFor(resource) {
  if (resource === 'opportunities') return ' LEFT JOIN crm_customers c ON c.public_id = r.customer_id';
  if (['tasks', 'activities'].includes(resource)) return ' LEFT JOIN crm_customers c ON c.public_id = r.customer_id LEFT JOIN crm_opportunities o ON o.public_id = r.opportunity_id';
  return '';
}
function extraColumns(resource) {
  if (resource === 'opportunities') return ', c.name AS customer_name';
  if (['tasks', 'activities'].includes(resource)) return ', c.name AS customer_name, o.title AS opportunity_title';
  return '';
}

export async function listWorkspaceRecords(db, resource, options = {}, principal) {
  requirePermission(principal, resource === 'audit' ? 'audit' : 'read');
  const spec = resourceSpec(resource), { page, limit } = pageOptions(options);
  const { whereSql, binds } = buildFilters(resource, options);
  const countStatement = db.prepare(`SELECT COUNT(*) AS total FROM ${spec.table} r${whereSql}`).bind(...binds);
  const sort=options.sort||'id',direction=(options.dir||'desc').toLowerCase();
  if (!['id',...spec.columns].includes(sort) || !['asc','desc'].includes(direction)) throw new WorkspaceError(422,'INVALID_SORT','Select a supported column and sort order.');
  const contactColumns=resource==='customers'&&options.with_contacts==='true'?",(SELECT name FROM crm_contacts contact WHERE contact.customer_id=r.public_id AND contact.archived_at IS NULL ORDER BY is_primary DESC,id LIMIT 1) primary_contact_name,(SELECT email FROM crm_contacts contact WHERE contact.customer_id=r.public_id AND contact.archived_at IS NULL ORDER BY is_primary DESC,id LIMIT 1) primary_contact_email,(SELECT COUNT(*) FROM crm_contacts contact WHERE contact.customer_id=r.public_id AND contact.archived_at IS NULL) contacts_count":'';
  const pageStatement = db.prepare(`SELECT ${selectColumns(spec)}${extraColumns(resource)}${contactColumns} FROM ${spec.table} r${joinsFor(resource)}${whereSql} ORDER BY r.${sort} ${direction}${sort==='id'?'':', r.id DESC'} LIMIT ? OFFSET ?`).bind(...binds, limit, (page - 1) * limit);
  let totalRow,result,stageCounts;
  if(resource==='opportunities'){
    // Counts and cards share one filtered snapshot, independent of the loaded page.
    const groupedStatement=db.prepare(`SELECT r.stage,COUNT(*) AS count FROM ${spec.table} r${whereSql} GROUP BY r.stage`).bind(...binds);
    const packet=await db.batch([countStatement,pageStatement,groupedStatement]);
    totalRow=packet[0].results?.[0];result=packet[1];stageCounts=Object.fromEntries(STAGES.map(stage=>[stage,0]));
    for(const row of packet[2].results||[])if(Object.hasOwn(stageCounts,row.stage))stageCounts[row.stage]=Number(row.count);
  }else{totalRow=await countStatement.first();result=await pageStatement.all();}
  const total = Number(totalRow?.total || 0);
  return { data: result.results || [], meta: { total, page, limit, pages: Math.ceil(total / limit),...(stageCounts?{stage_counts:stageCounts}:{}) } };
}

export async function getWorkspaceRecord(db, resource, id, principal) {
  requirePermission(principal, resource === 'audit' ? 'audit' : 'read');
  const spec = resourceSpec(resource);
  const row = await db.prepare(`SELECT ${selectColumns(spec)}${extraColumns(resource)} FROM ${spec.table} r${joinsFor(resource)} WHERE r.public_id = ? LIMIT 1`).bind(String(id)).first();
  if (!row) throw new WorkspaceError(404, 'NOT_FOUND', 'The record could not be found.');
  return row;
}

/** Validate relationships against active records; cross-customer links are rejected. */
async function validateRelations(db, resource, payload, existing = {}) {
  const combined = { ...existing, ...payload };
  for (const [field, rule] of Object.entries(resourceSpec(resource).fields || {})) {
    if (!rule.relation || !combined[field]) continue;
    const target = resourceSpec(rule.relation);
    const row = await db.prepare(`SELECT public_id, archived_at${rule.relation === 'opportunities' ? ', customer_id' : ''} FROM ${target.table} WHERE public_id = ? LIMIT 1`).bind(combined[field]).first();
    if (!row || row.archived_at) throw new WorkspaceError(422, 'INVALID_RELATION', 'Select an active related record.', { [field]: 'This record does not exist or has been archived.' });
    if (field === 'opportunity_id' && combined.customer_id && row.customer_id !== combined.customer_id) throw new WorkspaceError(422, 'RELATION_MISMATCH', 'The opportunity belongs to another customer.', { opportunity_id: 'Choose an opportunity for the selected customer.' });
    if (field === 'opportunity_id' && !combined.customer_id) payload.customer_id = row.customer_id;
  }
}

async function validateOwner(db, payload, principal, existing = null) {
  if (!Object.prototype.hasOwnProperty.call(payload, 'owner_id')) return;
  const requested = payload.owner_id || (existing ? existing.owner_id : principal.id);
  if (principal.role === 'sales' && requested !== (existing ? existing.owner_id : principal.id)) throw new WorkspaceError(403, 'OWNER_ASSIGNMENT_FORBIDDEN', 'Only a manager or owner can reassign records.');
  if (requested !== 'owner') {
    const member = await db.prepare('SELECT id FROM admin_users WHERE id = ? AND active = 1 LIMIT 1').bind(requested).first();
    if (!member) throw new WorkspaceError(422, 'INVALID_OWNER', 'Select an active team member.', { owner_id: 'This team member is unavailable.' });
  }
  payload.owner_id = requested;
}

async function assertOpportunityReassignment(db, payload, existing) {
  if (!payload.customer_id || payload.customer_id === existing.customer_id) return;
  const linked = await db.prepare('SELECT (SELECT COUNT(*) FROM crm_tasks WHERE opportunity_id = ?) + (SELECT COUNT(*) FROM crm_activities WHERE opportunity_id = ?) + (SELECT COUNT(*) FROM crm_intake_links WHERE opportunity_id = ?) AS n').bind(existing.public_id, existing.public_id, existing.public_id).first();
  if (Number(linked?.n || 0)) throw new WorkspaceError(409, 'RELATED_RECORDS', 'This opportunity has linked tasks, activities or a source inquiry. Its customer cannot be reassigned.');
}

function auditStatement(db, principal, action, resource, id, summary, metadata = {}, { conditional = false } = {}) {
  const columns = 'public_id, actor_id, actor_name, actor_role, action, entity_type, entity_id, summary, metadata_json, created_at';
  return db.prepare(`INSERT INTO crm_audit (${columns}) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?${conditional ? ' WHERE changes() = 1' : ''}`).bind(
    publicId('AUD'), principal.id, nonempty(principal.name || principal.email || principal.id), principal.role,
    action, resource, id, summary, JSON.stringify(metadata), now(),
  );
}
function eventStatement(db, principal, action, resource, id, conditional = false) {
  return db.prepare(`INSERT INTO events (event_id, event_type, entity_type, entity_id, source, payload_json, created_at) SELECT ?, ?, ?, ?, ?, ?, ?${conditional ? ' WHERE changes() = 1' : ''}`).bind(
    eventId(), `crm.${resource}.${action}`, resource, id, 'gyutron-admin', JSON.stringify({ actor_id: principal.id, source: 'admin' }), now(),
  );
}
async function batch(db, statements) {
  if (!db || typeof db.batch !== 'function') throw new WorkspaceError(503, 'DATABASE_UNAVAILABLE', 'Transactional storage is unavailable. Please try again later.');
  let results;
  try { results = await db.batch(statements); }
  catch (error) {
    if (/Active quotations prevent (?:customer|opportunity) archiving/.test(error?.message || '')) {
      throw new WorkspaceError(409, 'ACTIVE_DEPENDENCIES', 'Archive the active quotations linked to this record before archiving it.');
    }
    if (/Quotation history prevents opportunity customer reassignment/.test(error?.message || '')) {
      throw new WorkspaceError(409, 'RELATED_RECORDS', 'This opportunity has quotation history. Its customer cannot be reassigned.');
    }
    throw error;
  }
  if (results.some(result => result.success === false)) throw new WorkspaceError(503, 'DATABASE_ERROR', 'The change was not saved. Please try again.');
  return results;
}
function assertChanged(result) {
  if (!result?.meta || Number(result.meta.changes) !== 1) throw new WorkspaceError(409, 'VERSION_CONFLICT', 'This record changed in another session. Reload it before saving again.');
}

export async function createWorkspaceRecord(db, resource, input, principal) {
  requirePermission(principal, 'write');
  const spec = resourceSpec(resource);
  if (!spec.fields) throw new WorkspaceError(405, 'READ_ONLY', 'This resource is read-only.');
  const payload = validatePayload(resource, input);
  await validateRelations(db, resource, payload);
  await validateOwner(db, payload, principal);
  if (payload.stage === 'won') payload.probability = 100;
  if (payload.stage === 'lost') payload.probability = 0;
  const stamp = now(), id = publicId(spec.prefix);
  const row = { public_id: id, ...payload, created_at: stamp };
  if (spec.mutable) Object.assign(row, { version: 1, archived_at: null, updated_at: stamp });
  else Object.assign(row, { actor_id: principal.id, actor_name: nonempty(principal.name || principal.email || principal.id), occurred_at: payload.occurred_at || stamp });
  const columns = Object.keys(row);
  await batch(db, [
    db.prepare(`INSERT INTO ${spec.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).bind(...columns.map(c => row[c])),
    auditStatement(db, principal, 'created', resource, id, `Created ${resource === 'activities' ? 'activity' : resource.slice(0, -1)}`, { fields: Object.keys(payload) }),
    eventStatement(db, principal, 'created', resource, id),
  ]);
  return getWorkspaceRecord(db, resource, id, principal);
}

export async function updateWorkspaceRecord(db, resource, id, input, principal) {
  requirePermission(principal, 'write');
  const spec = resourceSpec(resource);
  if (!spec.mutable) throw new WorkspaceError(405, 'READ_ONLY', 'This resource is read-only.');
  const existing = await getWorkspaceRecord(db, resource, id, principal);
  if (existing.archived_at) throw new WorkspaceError(409, 'ARCHIVED_RECORD', 'Restore this record before editing it.');
  const payload = validatePayload(resource, input, { partial: true });
  if (!Object.keys(payload).length) throw new WorkspaceError(422, 'EMPTY_UPDATE', 'Choose at least one field to change.');
  await validateRelations(db, resource, payload, existing);
  await validateOwner(db, payload, principal, existing);
  if (resource === 'opportunities') await assertOpportunityReassignment(db, payload, existing);
  if (resource === 'opportunities' && (payload.stage || existing.stage) === 'won') payload.probability = 100;
  if (resource === 'opportunities' && (payload.stage || existing.stage) === 'lost') payload.probability = 0;
  const columns = Object.keys(payload), stamp = now();
  const statements = [
    db.prepare(`UPDATE ${spec.table} SET ${columns.map(c => `${c} = ?`).join(', ')}, updated_at = ?, version = version + 1 WHERE public_id = ? AND version = ? AND archived_at IS NULL`).bind(...columns.map(c => payload[c]), stamp, id, input.version),
    auditStatement(db, principal, 'updated', resource, id, `Updated ${resource.slice(0, -1)}`, { fields: columns, previous_version: input.version, before: Object.fromEntries(columns.map(key=>[key,existing[key]])), after: payload }, { conditional: true }),
    eventStatement(db, principal, 'updated', resource, id, true),
  ];
  const results = await batch(db, statements); assertChanged(results[0]);
  return getWorkspaceRecord(db, resource, id, principal);
}

export async function archiveWorkspaceRecord(db, resource, id, input, principal, { restore = false } = {}) {
  requirePermission(principal, 'archive');
  const spec = resourceSpec(resource);
  if (!spec.mutable) throw new WorkspaceError(405, 'READ_ONLY', 'This resource is read-only.');
  if (!input || !Number.isSafeInteger(input.version) || input.version < 1 || Object.keys(input).some(k => k !== 'version')) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'Reload the record before changing its archive state.', { version: 'A current record version is required.' });
  const existing = await getWorkspaceRecord(db, resource, id, principal);
  if (Boolean(existing.archived_at) !== restore) throw new WorkspaceError(409, 'ARCHIVE_STATE_CONFLICT', restore ? 'This record is already active.' : 'This record is already archived.');
  if (restore) await validateRelations(db, resource, {}, existing);
  else if (resource === 'customers' || resource === 'opportunities') {
    const sql = resource === 'customers'
      ? "SELECT (SELECT COUNT(*) FROM crm_opportunities WHERE customer_id = ? AND archived_at IS NULL AND stage NOT IN ('won','lost')) + (SELECT COUNT(*) FROM crm_tasks WHERE customer_id = ? AND archived_at IS NULL AND status != 'done') AS n"
      : "SELECT COUNT(*) AS n FROM crm_tasks WHERE opportunity_id = ? AND archived_at IS NULL AND status != 'done'";
    const row = await db.prepare(sql).bind(...(resource === 'customers' ? [id, id] : [id])).first();
    if (Number(row?.n || 0)) throw new WorkspaceError(409, 'ACTIVE_DEPENDENCIES', 'Complete or archive the active related tasks and opportunities before archiving this record.');
  }
  const stamp = now(), action = restore ? 'restored' : 'archived';
  const results = await batch(db, [
    db.prepare(`UPDATE ${spec.table} SET archived_at = ?, updated_at = ?, version = version + 1 WHERE public_id = ? AND version = ? AND archived_at IS ${restore ? 'NOT ' : ''}NULL`).bind(restore ? null : stamp, stamp, id, input.version),
    auditStatement(db, principal, action, resource, id, `${restore ? 'Restored' : 'Archived'} ${resource.slice(0, -1)}`, { previous_version: input.version }, { conditional: true }),
    eventStatement(db, principal, action, resource, id, true),
  ]); assertChanged(results[0]);
  return getWorkspaceRecord(db, resource, id, principal);
}

export async function readWorkspaceDashboard(db, principal, { timeZone } = {}) {
  requirePermission(principal);
  const today = workspaceDate(timeZone);
  const statements = [
    db.prepare('SELECT COUNT(*) AS n FROM crm_customers WHERE archived_at IS NULL'),
    db.prepare("SELECT COUNT(*) AS n FROM crm_opportunities WHERE archived_at IS NULL AND stage NOT IN ('won','lost')"),
    db.prepare("SELECT COUNT(*) AS n FROM crm_tasks WHERE archived_at IS NULL AND status != 'done'"),
    db.prepare("SELECT COUNT(*) AS n FROM crm_tasks WHERE archived_at IS NULL AND status != 'done' AND due_date != '' AND due_date < ?").bind(today),
    db.prepare("SELECT (SELECT COUNT(*) FROM leads WHERE status = 'new') + (SELECT COUNT(*) FROM rfqs WHERE status = 'new') + (SELECT COUNT(*) FROM support_requests WHERE status = 'new') + (SELECT COUNT(*) FROM download_requests WHERE status = 'new') AS n"),
    // Sum integer blocks and remainders independently. Casting inside SQL keeps
    // the driver from rounding a large integer before JavaScript sees it, while
    // the smaller sums avoid the much earlier overflow of SUM(amount_minor).
    db.prepare(`SELECT stage, currency, COUNT(*) AS count,
      CAST(COALESCE(SUM(amount_minor / 1000000),0) AS TEXT) AS amount_minor_blocks,
      CAST(COALESCE(SUM(amount_minor % 1000000),0) AS TEXT) AS amount_minor_remainder
      FROM crm_opportunities WHERE archived_at IS NULL GROUP BY stage,currency`),
    db.prepare('SELECT public_id, subject, type, actor_id, actor_name, customer_id, opportunity_id, occurred_at, created_at FROM crm_activities ORDER BY id DESC LIMIT 8'),
    db.prepare("SELECT public_id, title, status, priority, due_date, owner_id, version FROM crm_tasks WHERE archived_at IS NULL AND status != 'done' ORDER BY CASE WHEN due_date = '' THEN 1 ELSE 0 END, due_date, id DESC LIMIT 8"),
    db.prepare("SELECT 'leads' AS resource, COUNT(*) AS total, SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) AS fresh FROM leads UNION ALL SELECT 'rfqs', COUNT(*), SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) FROM rfqs UNION ALL SELECT 'support', COUNT(*), SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) FROM support_requests UNION ALL SELECT 'downloads', COUNT(*), SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) FROM download_requests"),
  ];
  const results = await batch(db, statements);
  const n = i => Number(results[i].results?.[0]?.n || 0);
  const pipeline = (results[5].results || []).map(row => {
    const exact = BigInt(row.amount_minor_blocks) * 1000000n + BigInt(row.amount_minor_remainder);
    return { stage: row.stage, currency: row.currency, count: Number(row.count),
      amount_minor_exact: exact.toString(), amount_minor: exact <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(exact) : null };
  });
  return {
    counts: { customers: n(0), open_opportunities: n(1), open_tasks: n(2), overdue_tasks: n(3), unread_intake: n(4) },
    pipeline, stages: STAGES,
    recentActivities: results[6].results || [], upcomingTasks: results[7].results || [],
    intake: (results[8].results || []).map(r => ({ ...r, total: Number(r.total || 0), fresh: Number(r.fresh || 0) })),
    generated_at: now(),
  };
}

function intakeSelect(table) { return [...API_FIELDS[table], 'internal_note', ...(table === 'download_requests' ? ['access_type'] : [])].filter((v, i, a) => a.indexOf(v) === i); }
function intakeFilters(table, options) {
  const where = [], binds = [], q = nonempty(options.q);
  if (q) { where.push("(instr(lower(name),lower(?))>0 OR instr(lower(company),lower(?))>0 OR instr(lower(email),lower(?))>0 OR instr(lower(public_id),lower(?))>0)"); binds.push(...Array(4).fill(likePattern(q))); }
  if (options.status) {
    if (!STATUS_VALUES[table].includes(options.status)) throw new WorkspaceError(422, 'INVALID_FILTER', 'Unsupported inbox status.');
    where.push('status = ?'); binds.push(options.status);
  }
  return { whereSql: where.length ? ` WHERE ${where.join(' AND ')}` : '', binds };
}
export async function listIntakeRecords(db, resource, options = {}, principal) {
  requirePermission(principal); const table = intakeTable(resource), { page, limit } = pageOptions(options);
  const { whereSql, binds } = intakeFilters(table, options);
  const totalRow = await db.prepare(`SELECT COUNT(*) AS total FROM ${table}${whereSql}`).bind(...binds).first();
  const result = await db.prepare(`SELECT ${intakeSelect(table).join(', ')} FROM ${table}${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...binds, limit, (page - 1) * limit).all();
  const total = Number(totalRow?.total || 0);
  return { data: result.results || [], meta: { resource, total, page, limit, pages: Math.ceil(total / limit), statuses: STATUS_VALUES[table] } };
}
export async function getIntakeRecord(db, resource, id, principal) {
  requirePermission(principal); const table = intakeTable(resource);
  const row = await db.prepare(`SELECT ${intakeSelect(table).join(', ')} FROM ${table} WHERE public_id = ? LIMIT 1`).bind(String(id)).first();
  if (!row) throw new WorkspaceError(404, 'NOT_FOUND', 'The inbox record could not be found.');
  row.conversion = await db.prepare('SELECT customer_id, opportunity_id, created_at FROM crm_intake_links WHERE source_resource = ? AND source_id = ? LIMIT 1').bind(resource, String(id)).first() || null;
  return row;
}
export async function updateIntakeRecord(db, resource, id, input, principal) {
  requirePermission(principal, 'write'); const table = intakeTable(resource);
  const fields = {}, payload = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'A JSON object is required.');
  for (const key of Object.keys(input)) if (!['status', 'internal_note', 'updated_at', ...(resource === 'downloads' ? ['access_type'] : [])].includes(key)) fields[key] = 'This field cannot be changed.';
  if (typeof input.updated_at !== 'string' || !input.updated_at || input.updated_at.length > 40) fields.updated_at = 'Reload the record before saving.';
  if ('status' in input) { if (!STATUS_VALUES[table].includes(input.status)) fields.status = 'Select a supported status.'; else payload.status = input.status; }
  if ('internal_note' in input) { if (typeof input.internal_note !== 'string' || input.internal_note.length > 10000) fields.internal_note = 'Use a note of at most 10000 characters.'; else payload.internal_note = input.internal_note.trim(); }
  if ('access_type' in input && resource === 'downloads') { if (!ACCESS_TYPES.includes(input.access_type)) fields.access_type = 'Select a supported access type.'; else payload.access_type = input.access_type; }
  if (Object.keys(fields).length) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fields);
  if (!Object.keys(payload).length) throw new WorkspaceError(422, 'EMPTY_UPDATE', 'Choose a field to change.');
  const existing = await getIntakeRecord(db, resource, id, principal), stamp = now();
  // Guarantee the optimistic timestamp advances even for two writes in one ms.
  const updatedAt = stamp > existing.updated_at ? stamp : new Date(Date.parse(existing.updated_at) + 1).toISOString();
  const columns = Object.keys(payload);
  const entityType = resource === 'leads' ? 'lead' : resource === 'rfqs' ? 'rfq' : resource === 'support' ? 'support_request' : 'download_request';
  const statusChanged = payload.status !== undefined && payload.status !== existing.status;
  const results = await batch(db, [
    db.prepare(`UPDATE ${table} SET ${columns.map(c => `${c} = ?`).join(', ')}, updated_at = ? WHERE public_id = ? AND updated_at = ?`).bind(...columns.map(c => payload[c]), updatedAt, id, input.updated_at),
    auditStatement(db, principal, 'updated', `intake.${resource}`, id, 'Updated inbox record', { fields: columns, previous_status: existing.status, status: payload.status || existing.status }, { conditional: true }),
    db.prepare('INSERT INTO events (event_id, event_type, entity_type, entity_id, source, payload_json, created_at) SELECT ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1').bind(eventId(), `${entityType}.${statusChanged ? 'status_changed' : 'updated'}`, entityType, id, 'gyutron-admin', JSON.stringify({ ...(statusChanged ? { old_status: existing.status, new_status: payload.status } : { changed_fields: columns }), source: 'admin', actor_id: principal.id }), updatedAt),
  ]); assertChanged(results[0]);
  return getIntakeRecord(db, resource, id, principal);
}

/** Inquiry conversion is an atomic and idempotent business operation. */
export async function convertIntakeRecord(db, resource, id, input, principal) {
  requirePermission(principal, 'write'); const table = intakeTable(resource);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'A JSON object is required.');
  const allowed = ['create_opportunity', 'customer_id', 'title', 'amount_minor', 'currency', 'expected_close_date'];
  const unknown = Object.keys(input).filter(k => !allowed.includes(k));
  if (unknown.length || ('create_opportunity' in input && typeof input.create_opportunity !== 'boolean')) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'Use the supported conversion options.');
  const optionErrors = {};
  for (const field of ['customer_id', 'title', 'expected_close_date']) if (field in input && (typeof input[field] !== 'string' || input[field].length > (field === 'title' ? 200 : field === 'customer_id' ? 100 : 10))) optionErrors[field] = 'Use a supported text value.';
  if ('amount_minor' in input && (!Number.isSafeInteger(input.amount_minor) || input.amount_minor < 0 || input.amount_minor > 1000000000000)) optionErrors.amount_minor = 'Use a non-negative whole amount in the currency minor unit.';
  if ('currency' in input && !CURRENCIES.includes(input.currency)) optionErrors.currency = 'Select a supported currency.';
  if (Object.keys(optionErrors).length) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'Please check the conversion options.', optionErrors);
  const readLink = () => db.prepare('SELECT source_resource, source_id, customer_id, opportunity_id, created_at FROM crm_intake_links WHERE source_resource = ? AND source_id = ? LIMIT 1').bind(resource, id).first();
  const existing = await readLink();
  if (existing) return { data: existing, meta: { already_converted: true } };
  const source = await getIntakeRecord(db, resource, id, principal);
  if (source.status === 'spam') throw new WorkspaceError(409, 'SPAM_RECORD', 'Review this inquiry and remove its spam status before conversion.');
  const stamp = now(), makeOpportunity = input.create_opportunity ?? resource === 'rfqs';
  let customerId, customerRow = null, opportunityRow = null;
  if (input.customer_id) {
    if (typeof input.customer_id !== 'string' || input.customer_id.length > 100) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'Select a valid existing customer.');
    const customer = await getWorkspaceRecord(db, 'customers', input.customer_id, principal);
    if (customer.archived_at) throw new WorkspaceError(409, 'ARCHIVED_RECORD', 'Restore this customer before linking an inquiry.');
    customerId = customer.public_id;
  } else {
    customerId = publicId('CUS');
    const fields = validatePayload('customers', {
      name: nonempty(source.company || source.name || source.email || `Inquiry ${id}`), contact_name: nonempty(source.name),
      email: source.email || '', phone: source.phone || '', country: source.country || '', industry: source.industry || '',
      notes: nonempty(source.application_description || source.message || '', 10000), owner_id: principal.id,
    });
    await validateOwner(db, fields, principal);
    customerRow = { public_id: customerId, ...fields, version: 1, archived_at: null, created_at: stamp, updated_at: stamp };
  }
  let opportunityId = null;
  if (makeOpportunity) {
    opportunityId = publicId('OPP');
    const fields = validatePayload('opportunities', {
      title: input.title || nonempty([source.company || source.name, source.product_category || source.product_interest || source.product_model || 'New opportunity'].filter(Boolean).join(' · ')),
      customer_id: customerId, amount_minor: input.amount_minor ?? 0, currency: input.currency || 'USD',
      expected_close_date: input.expected_close_date || '', owner_id: principal.id,
      notes: nonempty(source.application_description || source.message || '', 10000),
    });
    await validateOwner(db, fields, principal);
    opportunityRow = { public_id: opportunityId, ...fields, version: 1, archived_at: null, created_at: stamp, updated_at: stamp };
  }
  const insertRow = (target, row) => { const columns = Object.keys(row); return db.prepare(`INSERT INTO ${target} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).bind(...columns.map(c => row[c])); };
  const statements = [];
  if (customerRow) statements.push(insertRow('crm_customers', customerRow));
  if (opportunityRow) statements.push(insertRow('crm_opportunities', opportunityRow));
  statements.push(db.prepare('INSERT INTO crm_intake_links (public_id, source_resource, source_id, customer_id, opportunity_id, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(publicId('LINK'), resource, id, customerId, opportunityId, principal.id, stamp));
  if (source.status === 'new' && STATUS_VALUES[table].includes('reviewing')) {
    const updatedAt = stamp > source.updated_at ? stamp : new Date(Date.parse(source.updated_at) + 1).toISOString();
    statements.push(db.prepare(`UPDATE ${table} SET status = 'reviewing', updated_at = ? WHERE public_id = ? AND status = 'new' AND updated_at = ?`).bind(updatedAt, id, source.updated_at));
  }
  if (customerRow) statements.push(auditStatement(db, principal, 'created', 'customers', customerId, 'Created customer from inquiry', { source_resource: resource, source_id: id }));
  if (opportunityRow) statements.push(auditStatement(db, principal, 'created', 'opportunities', opportunityId, 'Created opportunity from inquiry', { source_resource: resource, source_id: id }));
  statements.push(auditStatement(db, principal, 'converted', `intake.${resource}`, id, 'Converted inquiry to CRM', { customer_id: customerId, opportunity_id: opportunityId }));
  statements.push(eventStatement(db, principal, 'converted', `intake.${resource}`, id));
  try { await batch(db, statements); }
  catch (error) {
    // A concurrent conversion can win the unique source constraint. Its complete
    // transaction is authoritative; our attempted customer/opportunity rolled back.
    const won = await readLink();
    if (won) return { data: won, meta: { already_converted: true } };
    throw error;
  }
  return { data: await readLink(), meta: { already_converted: false } };
}

export async function exportWorkspaceRecords(db, resource, options, principal) {
  requirePermission(principal, 'export');
  let table, columns, whereSql, binds, alias = '';
  if (Object.prototype.hasOwnProperty.call(INTAKE, resource)) {
    table = intakeTable(resource); columns = intakeSelect(table); ({ whereSql, binds } = intakeFilters(table, options));
  } else {
    const spec = resourceSpec(resource);
    if (resource === 'audit') requirePermission(principal, 'audit');
    table = spec.table; columns = spec.columns; alias = ' r'; ({ whereSql, binds } = buildFilters(resource, options));
  }
  const result = await db.prepare(`SELECT ${columns.join(', ')} FROM ${table}${alias}${whereSql} ORDER BY id DESC LIMIT 10001`).bind(...binds).all();
  if ((result.results || []).length > 10000) throw new WorkspaceError(422, 'EXPORT_LIMIT', 'This export exceeds 10000 rows. Apply filters and export again.');
  await batch(db, [auditStatement(db, principal, 'exported', resource, 'collection', `Exported ${resource}`, { rows: (result.results || []).length, filters: Object.keys(options).filter(k => options[k]) })]);
  return { rows: result.results || [], columns };
}
