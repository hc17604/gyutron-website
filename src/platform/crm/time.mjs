/** UTC timestamps for storage, a single deployment timezone for business dates. */
export const DEFAULT_WORKSPACE_TIMEZONE = 'Asia/Singapore';
export function workspaceTimeZone(env = {}) {
  const requested = typeof env.ADMIN_TIMEZONE === 'string' ? env.ADMIN_TIMEZONE : DEFAULT_WORKSPACE_TIMEZONE;
  try { return new Intl.DateTimeFormat('en', { timeZone: requested }).resolvedOptions().timeZone; }
  catch { return DEFAULT_WORKSPACE_TIMEZONE; }
}
export function workspaceDate(timeZone = DEFAULT_WORKSPACE_TIMEZONE, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
