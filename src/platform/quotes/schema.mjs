import { WorkspaceError } from '../crm/schema.mjs';
export const MAX_AMOUNT_MINOR = 1000000000000;
export const QUOTE_STATUSES = Object.freeze(['draft','issued','accepted','declined']);
export const QUOTE_CURRENCIES = Object.freeze(['USD','EUR','CNY','JPY','GBP','SGD']);
export const MONEY_FIELDS = Object.freeze(['discount_minor','tax_minor','shipping_minor']);
export const QUOTE_FIELDS = Object.freeze({
  customer_id: { max: 100, required: true }, opportunity_id: { max: 100, nullable: true }, owner_id: { max: 100 },
  title: { max: 200, required: true, default: 'Quotation' }, currency: { enum: QUOTE_CURRENCIES, default: 'USD' },
  valid_until: { max: 10, date: true }, seller_name: { max: 200 }, seller_email: { max: 320, email: true }, seller_phone: { max: 80 }, seller_address: { max: 2000 },
  recipient_company: { max: 200 }, recipient_name: { max: 200 }, recipient_email: { max: 320, email: true }, recipient_phone: { max: 80 },
  billing_address: { max: 2000 }, shipping_address: { max: 2000 }, terms: { max: 20000 }, notes: { max: 10000 },
  discount_minor: { money: true, default: 0 }, tax_minor: { money: true, default: 0 }, shipping_minor: { money: true, default: 0 },
});
export const CONTENT_FIELDS = Object.freeze(Object.keys(QUOTE_FIELDS).filter(field => field !== 'owner_id'));
export function quoteError(code, message, fields, status = 422) { return new WorkspaceError(status, code, message, fields); }
export function quoteMinorDigits(currency) { return currency === 'JPY' ? 0 : 2; }
function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z'); return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
function amount(value, field, errors) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > MAX_AMOUNT_MINOR) { errors[field] = `Use a whole minor-unit amount from 0 to ${MAX_AMOUNT_MINOR}.`; return 0; }
  return value;
}
export function validateQuoteInput(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw quoteError('VALIDATION_ERROR','A JSON object is required.');
  const errors = {}, clean = {};
  for (const field of Object.keys(input)) if (!Object.hasOwn(QUOTE_FIELDS, field) && field !== 'items' && !(partial && field === 'version')) errors[field] = 'This field cannot be changed.';
  for (const [field, rule] of Object.entries(QUOTE_FIELDS)) {
    const supplied = Object.hasOwn(input,field); if (partial && !supplied) continue;
    if (!supplied) { if (rule.required && rule.default === undefined) errors[field] = 'This field is required.'; else if (rule.default !== undefined) clean[field] = rule.default; continue; }
    const raw = input[field];
    if (rule.money) { clean[field] = amount(raw,field,errors); continue; }
    if ((raw === null || raw === '') && rule.nullable) { clean[field] = null; continue; }
    if (typeof raw !== 'string') { errors[field] = 'Use a text value.'; continue; }
    const value = raw.trim();
    if (rule.required && !value) errors[field] = 'This field is required.';
    else if (rule.max && value.length > rule.max) errors[field] = `Use at most ${rule.max} characters.`;
    else if (rule.enum && !rule.enum.includes(value)) errors[field] = 'Select a supported value.';
    else if (rule.date && value && !calendarDate(value)) errors[field] = 'Enter a valid calendar date.';
    else if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field] = 'Enter a valid email address.';
    else clean[field] = rule.email ? value.toLowerCase() : value;
  }
  if (partial && (!Number.isSafeInteger(input.version) || input.version < 1)) errors.version = 'Reload the quotation before saving; a current version is required.';
  if (!partial && !Object.hasOwn(input,'items')) errors.items = 'Add at least one quotation item.';
  if (Object.keys(errors).length) throw quoteError('VALIDATION_ERROR','Please check the quotation fields.',errors);
  return clean;
}
export function validateVersion(input, additionalFields = []) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Number.isSafeInteger(input.version) || input.version < 1 || Object.keys(input).some(key => !['version',...additionalFields].includes(key))) throw quoteError('VALIDATION_ERROR','Use a current quotation version and supported action fields.',{ version: 'Reload this quotation before continuing.' });
  return input.version;
}

/** Every intermediate uses BigInt, then is checked before any JSON/SQLite number. */
export function calculateQuote(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw quoteError('VALIDATION_ERROR','A JSON object is required.');
  const errors = {}, currency = input.currency === undefined ? 'USD' : input.currency;
  if (!QUOTE_CURRENCIES.includes(currency)) errors.currency = 'Select a supported currency.';
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) errors.items = 'Use between 1 and 50 quotation items.';
  const items = [], cap = BigInt(MAX_AMOUNT_MINOR); let subtotal = 0n;
  if (!errors.items) for (let index = 0; index < input.items.length; index++) {
    const value = input.items[index], prefix = `items.${index}`;
    if (!value || typeof value !== 'object' || Array.isArray(value)) { errors[prefix] = 'Use an item object.'; continue; }
    for (const field of Object.keys(value)) if (!['line_number','sku','description','unit','quantity','unit_price_minor'].includes(field)) errors[`${prefix}.${field}`] = 'This field is not editable.';
    const row = { line_number: index + 1 };
    for (const [field,max] of [['sku',100],['description',2000],['unit',40]]) {
      const raw = value[field] ?? '';
      if (typeof raw !== 'string' || raw.length > max || (field === 'description' && !raw.trim())) errors[`${prefix}.${field}`] = field === 'description' ? 'Describe this item in 1–2000 characters.' : `Use at most ${max} text characters.`;
      else row[field] = raw.trim();
    }
    if (!Number.isSafeInteger(value.quantity) || value.quantity < 1) errors[`${prefix}.quantity`] = 'Use a positive whole quantity within the safe integer range.';
    else row.quantity = value.quantity;
    row.unit_price_minor = amount(value.unit_price_minor,`${prefix}.unit_price_minor`,errors);
    if (row.quantity) {
      const total = BigInt(row.quantity) * BigInt(row.unit_price_minor);
      if (total > cap) errors[`${prefix}.quantity`] = 'This line exceeds the quotation amount limit.';
      else { row.line_total_minor = Number(total); subtotal += total; }
    }
    items.push(row);
  }
  const discount = amount(input.discount_minor ?? 0,'discount_minor',errors), tax = amount(input.tax_minor ?? 0,'tax_minor',errors), shipping = amount(input.shipping_minor ?? 0,'shipping_minor',errors);
  if (subtotal > cap) errors.items = 'The subtotal exceeds the quotation amount limit.';
  if (BigInt(discount) > subtotal) errors.discount_minor = 'The discount cannot exceed the subtotal.';
  const total = subtotal - BigInt(discount) + BigInt(tax) + BigInt(shipping);
  if (total > cap) errors.total_minor = 'The final total exceeds the quotation amount limit.';
  if (Object.keys(errors).length) throw quoteError('VALIDATION_ERROR','Please check item quantities and manual amounts.',errors);
  return { currency, items, subtotal_minor: Number(subtotal), discount_minor: discount, tax_minor: tax, shipping_minor: shipping, total_minor: Number(total) };
}
