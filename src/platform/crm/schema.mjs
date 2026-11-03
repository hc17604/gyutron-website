/** All SQL identifiers and writable fields in the CRM are server-owned. */
export const STAGES = Object.freeze(['qualification', 'discovery', 'proposal', 'negotiation', 'won', 'lost']);
export const CURRENCIES = Object.freeze(['USD', 'EUR', 'CNY', 'JPY', 'GBP', 'SGD']);
export const CUSTOMER_STATUSES = Object.freeze(['prospect', 'active', 'inactive']);
export const TASK_STATUSES = Object.freeze(['open', 'in_progress', 'done']);
export const TASK_PRIORITIES = Object.freeze(['low', 'normal', 'high', 'urgent']);
export const ACTIVITY_TYPES = Object.freeze(['note', 'call', 'email', 'meeting']);
export const ROLES = Object.freeze(['owner', 'manager', 'sales', 'viewer']);

const text = (max, extra = {}) => ({ type: 'text', max, ...extra });
export const RESOURCES = Object.freeze({
  customers: {
    table: 'crm_customers', prefix: 'CUS', mutable: true,
    columns: ['public_id', 'name', 'contact_name', 'email', 'phone', 'country', 'industry', 'website', 'status', 'owner_id', 'notes', 'version', 'archived_at', 'created_at', 'updated_at'],
    search: ['name', 'contact_name', 'email', 'country', 'industry'],
    filters: ['status', 'owner_id'],
    fields: {
      name: text(200, { required: true }), contact_name: text(200), email: text(320, { email: true }),
      phone: text(80), country: text(100), industry: text(150), website: text(500, { url: true }),
      status: { enum: CUSTOMER_STATUSES, default: 'prospect' }, owner_id: text(100), notes: text(10000),
    },
  },
  opportunities: {
    table: 'crm_opportunities', prefix: 'OPP', mutable: true,
    columns: ['public_id', 'title', 'customer_id', 'stage', 'amount_minor', 'currency', 'probability', 'expected_close_date', 'owner_id', 'notes', 'version', 'archived_at', 'created_at', 'updated_at'],
    search: ['title', 'notes'], filters: ['stage', 'owner_id', 'customer_id', 'currency'],
    fields: {
      title: text(200, { required: true }), customer_id: text(100, { required: true, relation: 'customers' }),
      stage: { enum: STAGES, default: 'qualification' }, amount_minor: { type: 'integer', min: 0, max: 1000000000000, default: 0 },
      currency: { enum: CURRENCIES, default: 'USD' }, probability: { type: 'integer', min: 0, max: 100, default: 10 },
      expected_close_date: text(10, { date: true }), owner_id: text(100), notes: text(10000),
    },
  },
  tasks: {
    table: 'crm_tasks', prefix: 'TSK', mutable: true,
    columns: ['public_id', 'title', 'customer_id', 'opportunity_id', 'status', 'priority', 'due_date', 'owner_id', 'description', 'version', 'archived_at', 'created_at', 'updated_at'],
    search: ['title', 'description'], filters: ['status', 'priority', 'owner_id', 'customer_id', 'opportunity_id'],
    fields: {
      title: text(200, { required: true }), customer_id: text(100, { relation: 'customers', nullable: true }),
      opportunity_id: text(100, { relation: 'opportunities', nullable: true }), status: { enum: TASK_STATUSES, default: 'open' },
      priority: { enum: TASK_PRIORITIES, default: 'normal' }, due_date: text(10, { date: true }),
      owner_id: text(100), description: text(10000),
    },
  },
  activities: {
    table: 'crm_activities', prefix: 'ACT', mutable: false,
    columns: ['public_id', 'customer_id', 'opportunity_id', 'type', 'subject', 'body', 'occurred_at', 'actor_id', 'actor_name', 'created_at'],
    search: ['subject', 'body', 'actor_name'], filters: ['type', 'customer_id', 'opportunity_id'],
    fields: {
      customer_id: text(100, { relation: 'customers', nullable: true }), opportunity_id: text(100, { relation: 'opportunities', nullable: true }),
      type: { enum: ACTIVITY_TYPES, default: 'note' }, subject: text(200, { required: true }), body: text(10000),
      occurred_at: text(40, { datetime: true }),
    },
  },
  audit: {
    table: 'crm_audit', mutable: false,
    columns: ['public_id', 'actor_id', 'actor_name', 'actor_role', 'action', 'entity_type', 'entity_id', 'summary', 'metadata_json', 'created_at'],
    search: ['actor_name', 'action', 'entity_type', 'entity_id', 'summary'], filters: ['actor_id', 'action', 'entity_type', 'entity_id'],
  },
});

export class WorkspaceError extends Error {
  constructor(status, code, message, fields) { super(message); this.status = status; this.code = code; this.fields = fields; }
}

export function permissionsFor(principal) {
  const known = Boolean(principal && principal.id && ROLES.includes(principal.role));
  const manage = known && ['owner', 'manager'].includes(principal.role);
  return { read: known, write: known && principal.role !== 'viewer', archive: manage, audit: manage, export: manage };
}

export function requirePermission(principal, permission = 'read') {
  if (!permissionsFor(principal).read) throw new WorkspaceError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  if (!permissionsFor(principal)[permission]) throw new WorkspaceError(403, 'FORBIDDEN', 'Your role does not permit this action.');
}

export function resourceSpec(resource) {
  if (!Object.prototype.hasOwnProperty.call(RESOURCES, resource)) throw new WorkspaceError(404, 'NOT_FOUND', 'Unknown workspace resource.');
  return RESOURCES[resource];
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validatePayload(resource, input, { partial = false } = {}) {
  const spec = resourceSpec(resource);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'A JSON object is required.');
  const out = {}, errors = {};
  for (const key of Object.keys(input)) {
    if (key !== 'version' && !Object.prototype.hasOwnProperty.call(spec.fields || {}, key)) errors[key] = 'This field cannot be changed.';
  }
  for (const [key, rule] of Object.entries(spec.fields || {})) {
    if (partial && !Object.prototype.hasOwnProperty.call(input, key)) continue;
    let value = input[key];
    if (value == null || value === '') {
      if (rule.required) { errors[key] = 'This field is required.'; continue; }
      if (partial && value === undefined) continue;
      out[key] = rule.default !== undefined ? rule.default : rule.nullable ? null : '';
      continue;
    }
    if (rule.type === 'integer') {
      if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < rule.min || value > rule.max) errors[key] = `Use a whole number between ${rule.min} and ${rule.max}.`;
      else out[key] = value;
      continue;
    }
    if (typeof value !== 'string') { errors[key] = 'Use a text value.'; continue; }
    value = value.trim();
    if (rule.required && !value) errors[key] = 'This field is required.';
    else if (rule.max && value.length > rule.max) errors[key] = `Use at most ${rule.max} characters.`;
    else if (rule.enum && !rule.enum.includes(value)) errors[key] = 'Select a supported value.';
    else if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[key] = 'Enter a valid email address.';
    else if (rule.date && value && !validDate(value)) errors[key] = 'Enter a valid calendar date.';
    else if (rule.datetime && value && (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !validDate(value.slice(0, 10)) || !Number.isFinite(Date.parse(value)))) errors[key] = 'Enter an ISO date and time.';
    else if (rule.url && value) {
      try { const parsed = new URL(value); if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); out[key] = parsed.href; }
      catch { errors[key] = 'Enter an http or https website URL.'; }
    } else out[key] = rule.email ? value.toLowerCase() : rule.datetime ? new Date(value).toISOString() : value;
    if (!(key in errors) && !(key in out)) out[key] = value;
  }
  if (partial && (!Number.isSafeInteger(input.version) || input.version < 1)) errors.version = 'Reload this record before saving; a version is required.';
  if (Object.keys(errors).length) throw new WorkspaceError(422, 'VALIDATION_ERROR', 'Please check the highlighted fields.', errors);
  return out;
}
