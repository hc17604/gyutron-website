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

/** Resolve a business-calendar midnight using the zone's actual offset (including DST). */
export function workspaceDayStart(value,timeZone=DEFAULT_WORKSPACE_TIMEZONE){
  const target=Date.parse(value+'T00:00:00Z');let instant=target;
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  for(let i=0;i<4;i++){const p=Object.fromEntries(formatter.formatToParts(instant).map(part=>[part.type,part.value]));const local=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second),delta=target-local;if(!delta)break;instant+=delta;}
  return new Date(instant).toISOString();
}
