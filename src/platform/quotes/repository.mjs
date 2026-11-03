import { requirePermission } from '../crm/schema.mjs';
import { workspaceDate, workspaceTimeZone } from '../crm/time.mjs';
import { sha256Hex } from '../security/hash.mjs';
import { CONTENT_FIELDS, QUOTE_FIELDS, QUOTE_STATUSES, QUOTE_CURRENCIES, validateQuoteInput, validateVersion, calculateQuote, quoteError, quoteMinorDigits } from './schema.mjs';

const stamp = () => new Date().toISOString();
const id = prefix => `${prefix}-${crypto.randomUUID()}`;
const HEADER_COLUMNS = ['public_id','quote_number','family_id','revision','revision_of','status',...Object.keys(QUOTE_FIELDS),'subtotal_minor','total_minor','issued_at','issued_by','outcome_note','outcome_recorded_at','outcome_recorded_by','version','archived_at','created_at','updated_at','snapshot_sha256'];
const ITEMS = 'line_number,sku,description,unit,quantity,unit_price_minor,line_total_minor';
const textDefaults = Object.keys(QUOTE_FIELDS).filter(field => !QUOTE_FIELDS[field].money && !['customer_id','opportunity_id','owner_id','currency','title'].includes(field));
function requireManager(principal) { requirePermission(principal,'read'); if (!['owner','manager'].includes(principal.role)) throw quoteError('FORBIDDEN','Only the workspace owner or a manager can perform this quotation action.',null,403); }
function gate(publicId, token) { return { sql: 'EXISTS(SELECT 1 FROM ops_quotes WHERE public_id = ? AND mutation_token = ?)', binds: [publicId,token] }; }
async function transact(db, statements) {
  const result = await db.batch(statements);
  if (result.some(item => item.success === false)) throw quoteError('STORAGE_UNAVAILABLE','The quotation could not be saved. Reload it before retrying.',null,503);
  return result;
}
function insert(db, table, row, guarded = null) {
  const columns = Object.keys(row);
  return db.prepare(`INSERT INTO ${table} (${columns.join(',')}) SELECT ${columns.map(() => '?').join(',')}${guarded ? ' WHERE ' + guarded.sql : ''}`).bind(...columns.map(column => row[column]),...(guarded?.binds || []));
}
function audit(db, principal, action, publicId, token, metadata = {}) {
  const guarded = gate(publicId,token);
  return insert(db,'crm_audit',{ public_id: id('AUD'),actor_id: principal.id,actor_name: principal.name || principal.id,actor_role: principal.role,action,entity_type: 'quotation',entity_id: publicId,summary: `Quotation ${action}`,metadata_json: JSON.stringify(metadata),created_at: stamp() },guarded);
}
function event(db, principal, action, publicId, token) {
  return insert(db,'events',{ event_id: id('EVT'),event_type: `quote.${action}`,entity_type: 'quotation',entity_id: publicId,source: 'gyutron-admin',payload_json: JSON.stringify({ actor_id: principal.id,source:'admin' }),created_at: stamp() },gate(publicId,token));
}
function itemRows(db, quoteId, items, token) {
  return items.map(item => insert(db,'ops_quote_items',{ public_id: id('QLI'),quote_id: quoteId,...item },gate(quoteId,token)));
}
function conflict() { return quoteError('VERSION_CONFLICT','This quotation changed in another session. Reload it before continuing.',null,409); }
function activeQuote(record) { if (record.archived_at) throw quoteError('ARCHIVED_RECORD','Restore this quotation before changing it.',null,409); }
function rawItem(item) { return { sku:item.sku,description:item.description,unit:item.unit,quantity:item.quantity,unit_price_minor:item.unit_price_minor }; }
function matchingTotals(record, totals) { return ['subtotal_minor','discount_minor','tax_minor','shipping_minor','total_minor'].every(field=>record[field]===totals[field]); }
function matchingItems(items, totals) { return items.length===totals.items.length && items.every((item,index)=>Object.keys(totals.items[index]).every(field=>item[field]===totals.items[index][field])); }

export async function getQuote(db, publicId, principal, { privateSnapshot = false } = {}) {
  requirePermission(principal,'read');
  const columns = [...HEADER_COLUMNS,...(privateSnapshot ? ['snapshot_json'] : [])];
  const results=await transact(db,[
    db.prepare(`SELECT ${columns.join(',')},(SELECT child.public_id FROM ops_quotes child WHERE child.revision_of = ops_quotes.public_id) AS next_revision_id FROM ops_quotes WHERE public_id = ? LIMIT 1`).bind(String(publicId)),
    db.prepare(`SELECT ${ITEMS} FROM ops_quote_items WHERE quote_id = ? ORDER BY line_number`).bind(String(publicId)),
  ]);
  const row=results[0].results?.[0];
  if (!row) throw quoteError('NOT_FOUND','This quotation could not be found.',null,404);
  row.items = results[1].results || [];
  return row;
}
export async function listQuotes(db, options, principal) {
  requirePermission(principal,'read');
  const page = Number(options.page || 1), limit = Number(options.limit || 25);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw quoteError('INVALID_PAGINATION','Use a positive page and a page size from 1 to 100.');
  const where = [], binds = [];
  where.push(options.archived === 'true' ? 'archived_at IS NOT NULL' : options.archived === 'all' ? '1=1' : 'archived_at IS NULL');
  for (const field of ['status','currency','customer_id','opportunity_id','owner_id']) if (options[field]) {
    if ((field === 'status' && !QUOTE_STATUSES.includes(options[field])) || (field === 'currency' && !QUOTE_CURRENCIES.includes(options[field]))) throw quoteError('INVALID_FILTER','Select a supported quotation filter.');
    where.push(`${field} = ?`); binds.push(String(options[field]).slice(0,100));
  }
  if (options.q) { const q = String(options.q).slice(0,200); where.push("(instr(lower(quote_number),lower(?))>0 OR instr(lower(title),lower(?))>0 OR instr(lower(recipient_company),lower(?))>0 OR instr(lower(recipient_name),lower(?))>0)"); binds.push(q,q,q,q); }
  const whereSql = ' WHERE ' + where.join(' AND ');
  const total = Number((await db.prepare('SELECT COUNT(*) AS n FROM ops_quotes' + whereSql).bind(...binds).first())?.n || 0);
  const rows = (await db.prepare(`SELECT ${HEADER_COLUMNS.join(',')} FROM ops_quotes${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...binds,limit,(page-1)*limit).all()).results || [];
  return { data:rows,meta:{total,page,limit,pages:Math.ceil(total/limit)} };
}
async function relationships(db, header) {
  const customer = await db.prepare('SELECT public_id,name,contact_name,email,phone,archived_at FROM crm_customers WHERE public_id = ?').bind(header.customer_id).first();
  if (!customer || customer.archived_at) throw quoteError('INVALID_CUSTOMER','Select an active customer.',{customer_id:'This customer is unavailable.'});
  if (header.opportunity_id) {
    const opportunity = await db.prepare('SELECT public_id,customer_id,archived_at FROM crm_opportunities WHERE public_id = ?').bind(header.opportunity_id).first();
    if (!opportunity || opportunity.archived_at || opportunity.customer_id !== customer.public_id) throw quoteError('INVALID_OPPORTUNITY','Select an active opportunity for this customer.',{opportunity_id:'The opportunity is unavailable or belongs to another customer.'});
  }
  return customer;
}
async function assignOwner(db, header, principal, existing = null) {
  if (!Object.hasOwn(header,'owner_id')) { if (!existing) header.owner_id = principal.id; else return; }
  const owner = header.owner_id || existing?.owner_id || principal.id;
  if (principal.role === 'sales' && owner !== (existing?.owner_id || principal.id)) throw quoteError('FORBIDDEN','Only a manager or owner can reassign quotations.',{owner_id:'Keep the assigned owner.'},403);
  if (owner !== 'owner' && !(await db.prepare('SELECT id FROM admin_users WHERE id=? AND active=1').bind(owner).first())) throw quoteError('INVALID_OWNER','Select an active team member.',{owner_id:'This team member is unavailable.'});
  header.owner_id = owner;
}
function createRow(header, items, env, principal, { familyId, revision = 1, revisionOf = null, quoteNumber } = {}) {
  const now = stamp(), publicId = id('QUO'), token = crypto.randomUUID();
  const base = `QT-${workspaceDate(workspaceTimeZone(env)).replaceAll('-','')}-${crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase()}`;
  const totals = calculateQuote({...header,items});
  const row = { public_id:publicId,quote_number:quoteNumber || `${base}-R01`,family_id:familyId || publicId,revision,revision_of:revisionOf,status:'draft',
    ...header,subtotal_minor:totals.subtotal_minor,total_minor:totals.total_minor,discount_minor:totals.discount_minor,tax_minor:totals.tax_minor,shipping_minor:totals.shipping_minor,
    snapshot_json:null,snapshot_sha256:null,issued_at:null,issued_by:null,outcome_note:'',outcome_recorded_at:null,outcome_recorded_by:null,version:1,mutation_token:token,archived_at:null,created_at:now,updated_at:now };
  return {row,totals,token};
}
export async function createQuote(db, env, input, principal) {
  requirePermission(principal,'write'); const header = validateQuoteInput(input); const customer = await relationships(db,header);
  const defaults = { seller_name:String(env.ADMIN_WORKSPACE_NAME || env.DATA_SOURCE_NAME || 'GYUTRON').slice(0,200),recipient_company:customer.name,recipient_name:customer.contact_name || '',recipient_email:customer.email || '',recipient_phone:customer.phone || '' };
  for (const field of textDefaults) if (!(field in header)) header[field] = defaults[field] || '';
  if (!Object.hasOwn(header,'opportunity_id')) header.opportunity_id = null;
  await assignOwner(db,header,principal);
  const {row,totals,token} = createRow(header,input.items,env,principal);
  await transact(db,[insert(db,'ops_quotes',row),...itemRows(db,row.public_id,totals.items,token),audit(db,principal,'created',row.public_id,token),event(db,principal,'created',row.public_id,token)]);
  return getQuote(db,row.public_id,principal);
}
export async function updateQuote(db, publicId, input, principal) {
  requirePermission(principal,'write'); const clean = validateQuoteInput(input,{partial:true}), existing = await getQuote(db,publicId,principal);
  activeQuote(existing); if (existing.status !== 'draft') throw quoteError('IMMUTABLE_QUOTATION','Issued quotation content is frozen. Create a revision to make changes.',null,409);
  if(input.version!==existing.version)throw conflict();
  if (!Object.keys(clean).length && !Object.hasOwn(input,'items')) throw quoteError('EMPTY_UPDATE','Choose at least one quotation field to change.');
  await relationships(db,{...existing,...clean}); await assignOwner(db,clean,principal,existing);
  const totals = calculateQuote({...existing,...clean,items:Object.hasOwn(input,'items') ? input.items : existing.items.map(rawItem)});
  const patch = {...clean,subtotal_minor:totals.subtotal_minor,total_minor:totals.total_minor,discount_minor:totals.discount_minor,tax_minor:totals.tax_minor,shipping_minor:totals.shipping_minor};
  const columns = Object.keys(patch), token = crypto.randomUUID(), now = stamp(), guarded = gate(publicId,token);
  const result = await transact(db,[
    db.prepare(`UPDATE ops_quotes SET ${columns.map(field=>`${field}=?`).join(',')},version=version+1,mutation_token=?,updated_at=? WHERE public_id=? AND version=? AND status='draft' AND archived_at IS NULL`).bind(...columns.map(field=>patch[field]),token,now,publicId,existing.version),
    db.prepare(`DELETE FROM ops_quote_items WHERE quote_id=? AND ${guarded.sql}`).bind(publicId,...guarded.binds),
    ...itemRows(db,publicId,totals.items,token),audit(db,principal,'updated',publicId,token,{fields:[...columns,'items'],previous_version:input.version}),event(db,principal,'updated',publicId,token),
  ]);
  if (Number(result[0]?.meta?.changes) !== 1) throw conflict(); return getQuote(db,publicId,principal);
}
function snapshotFor(record, principal, {timeZone=workspaceTimeZone()}={}) {
  const header = Object.fromEntries(CONTENT_FIELDS.map(field => [field,record[field]]));
  const issuedAt=stamp();
  return { schema_version:1,quote_id:record.public_id,quote_number:record.quote_number,family_id:record.family_id,revision:record.revision,revision_of:record.revision_of,
    ...header,subtotal_minor:record.subtotal_minor,total_minor:record.total_minor,currency_minor_digits:quoteMinorDigits(record.currency),
    items:record.items.map(item=>({...item})),issuer:{id:principal.id,name:principal.name || principal.id},issued_at:issuedAt,
    timezone:timeZone,issued_date:workspaceDate(timeZone,new Date(issuedAt)),created_date:workspaceDate(timeZone,new Date(record.created_at)) };
}
export async function issueQuote(db, publicId, input, principal, {timeZone=workspaceTimeZone()}={}) {
  requireManager(principal); validateVersion(input); const existing = await getQuote(db,publicId,principal); activeQuote(existing);
  if (existing.status !== 'draft') return {data:existing,meta:{already_issued:true}};
  if(input.version!==existing.version)throw conflict();
  await relationships(db,existing);
  const required = {}; for (const field of ['seller_name','recipient_company']) if (!String(existing[field] || '').trim()) required[field]='Complete this field before issuing.';
  if (Object.keys(required).length) throw quoteError('INCOMPLETE_QUOTATION','Complete the issuer and recipient before issuing.',required);
  const totals=calculateQuote({...existing,items:existing.items.map(rawItem)});
  if(!matchingTotals(existing,totals)||!matchingItems(existing.items,totals))throw quoteError('CALCULATION_INTEGRITY','This draft has inconsistent stored amounts. Reopen and save its items before issuing.',null,503);
  const snapshot = snapshotFor(existing,principal,{timeZone}), json = JSON.stringify(snapshot), hash = await sha256Hex(json), token = crypto.randomUUID();
  const result = await transact(db,[
    db.prepare("UPDATE ops_quotes SET status='issued',snapshot_json=?,snapshot_sha256=?,issued_at=?,issued_by=?,version=version+1,mutation_token=?,updated_at=? WHERE public_id=? AND version=? AND status='draft' AND archived_at IS NULL").bind(json,hash,snapshot.issued_at,principal.id,token,snapshot.issued_at,publicId,existing.version),
    audit(db,principal,'issued',publicId,token,{snapshot_sha256:hash,previous_version:input.version}),event(db,principal,'issued',publicId,token),
  ]);
  const current = await getQuote(db,publicId,principal);
  if (Number(result[0]?.meta?.changes) !== 1 && current.status === 'draft') throw conflict();
  return {data:current,meta:{already_issued:Number(result[0]?.meta?.changes)!==1}};
}
export async function quoteSnapshot(db, publicId, principal, {timeZone=workspaceTimeZone()}={}) {
  const record = await getQuote(db,publicId,principal,{privateSnapshot:true});
  if (record.status === 'draft') return {record,document:snapshotFor(record,{id:record.owner_id,name:''},{timeZone})};
  if (!record.snapshot_json || await sha256Hex(record.snapshot_json) !== record.snapshot_sha256) throw quoteError('SNAPSHOT_INTEGRITY','This issued quotation failed its integrity check. Contact the workspace owner.',null,503);
  let document; try { document=JSON.parse(record.snapshot_json); } catch { throw quoteError('SNAPSHOT_INTEGRITY','This quotation snapshot could not be read.',null,503); }
  try {
    if(document.schema_version!==1||document.quote_id!==record.public_id||document.quote_number!==record.quote_number||document.family_id!==record.family_id||document.revision!==record.revision||document.currency_minor_digits!==quoteMinorDigits(record.currency)||!Array.isArray(document.items)||CONTENT_FIELDS.some(field=>document[field]!==record[field]))throw Error();
    if(typeof document.timezone!=='string'||document.issued_date!==workspaceDate(document.timezone,new Date(document.issued_at))||document.created_date!==workspaceDate(document.timezone,new Date(record.created_at)))throw Error();
    validateQuoteInput({...Object.fromEntries(CONTENT_FIELDS.map(field=>[field,document[field]])),items:document.items.map(rawItem)});
    const totals=calculateQuote({...document,items:document.items.map(rawItem)});
    if(!matchingTotals(document,totals)||!matchingItems(document.items,totals)||!matchingItems(record.items,totals))throw Error();
  }catch{throw quoteError('SNAPSHOT_INTEGRITY','This issued quotation has inconsistent snapshot content. Contact the workspace owner.',null,503);}
  return {record,document};
}
export async function reviseQuote(db, env, publicId, input, principal) {
  requirePermission(principal,'write'); validateVersion(input); const source = await getQuote(db,publicId,principal); activeQuote(source);
  if (source.next_revision_id) return {data:await getQuote(db,source.next_revision_id,principal),meta:{already_revised:true}};
  if(input.version!==source.version)throw conflict();
  if (source.status === 'draft') throw quoteError('DRAFT_REVISION','Edit this draft before issuing it. Only issued quotations can be revised.',null,409);
  if (source.revision >= 10000) throw quoteError('REVISION_LIMIT','This quotation has reached the revision limit.');
  const {document} = await quoteSnapshot(db,publicId,principal), header = Object.fromEntries(Object.keys(QUOTE_FIELDS).map(field=>[field,document[field] ?? source[field]]));
  header.owner_id = principal.id; await relationships(db,header); await assignOwner(db,header,principal);
  const revision = source.revision+1, base = source.quote_number.replace(/-R\d+$/,'');
  const prepared = createRow(header,document.items.map(rawItem),env,principal,{familyId:source.family_id,revision,revisionOf:publicId,quoteNumber:`${base}-R${String(revision).padStart(2,'0')}`});
  const token = crypto.randomUUID(), guarded = gate(publicId,token), {row,totals} = prepared;
  const result = await transact(db,[
    db.prepare("UPDATE ops_quotes SET version=version+1,mutation_token=?,updated_at=? WHERE public_id=? AND version=? AND status!='draft' AND archived_at IS NULL AND NOT EXISTS(SELECT 1 FROM ops_quotes child WHERE child.revision_of=?)").bind(token,stamp(),publicId,source.version,publicId),
    insert(db,'ops_quotes',row,guarded),...itemRows(db,row.public_id,totals.items,prepared.token),
    audit(db,principal,'revision_created',publicId,token,{next_revision_id:row.public_id}),audit(db,principal,'created',row.public_id,prepared.token,{revision_of:publicId}),event(db,principal,'revised',publicId,token),
  ]);
  if (Number(result[0]?.meta?.changes) !== 1) {
    const current = await getQuote(db,publicId,principal);
    if (current.next_revision_id) return {data:await getQuote(db,current.next_revision_id,principal),meta:{already_revised:true}};
    throw conflict();
  }
  return {data:await getQuote(db,row.public_id,principal),meta:{already_revised:false}};
}
export async function setQuoteStatus(db, publicId, input, principal) {
  requireManager(principal); validateVersion(input,['status','note']);
  if (!['accepted','declined'].includes(input.status) || (input.note !== undefined && (typeof input.note !== 'string' || input.note.length>5000))) throw quoteError('VALIDATION_ERROR','Choose accepted or declined and use a note of at most 5000 characters.');
  const record=await getQuote(db,publicId,principal); activeQuote(record); const note=(input.note || '').trim();
  if (record.status===input.status && record.outcome_note===note) return {data:record,meta:{already_recorded:true}};
  if(input.version!==record.version)throw conflict();
  if (record.status!=='issued') throw quoteError('STATUS_TRANSITION','Only an issued quotation can have its external acceptance or decline recorded.',null,409);
  const token=crypto.randomUUID(), now=stamp();
  const result=await transact(db,[db.prepare("UPDATE ops_quotes SET status=?,outcome_note=?,outcome_recorded_at=?,outcome_recorded_by=?,version=version+1,mutation_token=?,updated_at=? WHERE public_id=? AND version=? AND status='issued' AND archived_at IS NULL").bind(input.status,note,now,principal.id,token,now,publicId,record.version),audit(db,principal,input.status,publicId,token,{external_result:true}),event(db,principal,input.status,publicId,token)]);
  if (Number(result[0]?.meta?.changes)!==1) throw conflict(); return {data:await getQuote(db,publicId,principal),meta:{already_recorded:false}};
}
export async function archiveQuote(db, publicId, input, principal, {restore=false}={}) {
  requirePermission(principal,'archive'); validateVersion(input); const record=await getQuote(db,publicId,principal);
  if(input.version!==record.version)throw conflict();
  if (Boolean(record.archived_at)!==restore) throw quoteError('ARCHIVE_STATE_CONFLICT',restore?'This quotation is already active.':'This quotation is already archived.',null,409);
  if (restore && ['draft','issued'].includes(record.status)) await relationships(db,record);
  const token=crypto.randomUUID(), now=stamp(), action=restore?'restored':'archived';
  const result=await transact(db,[db.prepare(`UPDATE ops_quotes SET archived_at=?,version=version+1,mutation_token=?,updated_at=? WHERE public_id=? AND version=? AND archived_at IS ${restore?'NOT ':''}NULL`).bind(restore?null:now,token,now,publicId,record.version),audit(db,principal,action,publicId,token),event(db,principal,action,publicId,token)]);
  if (Number(result[0]?.meta?.changes)!==1) throw conflict(); return getQuote(db,publicId,principal);
}
