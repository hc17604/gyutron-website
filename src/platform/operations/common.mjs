import { WorkspaceError, requirePermission } from '../crm/schema.mjs';
export const CAP=1000000000000n;
export const CURRENCIES=['USD','EUR','CNY','JPY','GBP','SGD','AUD','CAD','CHF','HKD','KRW'];
export const nowIso=()=>new Date().toISOString();
export const uuid=prefix=>`${prefix}-${crypto.randomUUID()}`;
export const err=(code,message,status=422,fields)=>new WorkspaceError(status,code,message,fields);
export function manager(p){requirePermission(p);if(!['owner','manager'].includes(p.role))throw err('FORBIDDEN','Only owners and managers can manage operating data and automation.',403);}
export function text(v,max=200,required=false){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw err('VALIDATION_ERROR',`Use ${required?'nonempty ':''}text of at most ${max} characters.`);return v.trim();}
export function integer(v,min,max){if(!Number.isSafeInteger(v)||v<min||v>max)throw err('VALIDATION_ERROR',`Use a whole number from ${min} to ${max}.`);return v;}
export function known(input,keys){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!keys.includes(k)))throw err('VALIDATION_ERROR','Unsupported fields in this request.');}
export function version(input,row){integer(input.version,1,Number.MAX_SAFE_INTEGER);if(input.version!==row.version)throw err('VERSION_CONFLICT','This record changed. Reload it before saving.',409);}
export function exact(v){const n=BigInt(v);return {amount_minor_exact:n.toString(),amount_minor:n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):null};}
export function recordMoney(row){const result={...row};for(const field of ['total_minor','amount_minor','unit_price_minor','line_total_minor'])if(typeof result[field]==='number')result[field+'_exact']=String(result[field]);return result;}
export function pagination(o={}){const page=integer(Number(o.page||1),1,100000),limit=integer(Number(o.limit||50),1,100);return {page,limit,offset:(page-1)*limit};}
export function parseJson(s,fallback={}){try{return JSON.parse(s);}catch{return fallback;}}
export function audit(db,p,action,type,id,summary,metadata={}){return db.prepare('INSERT INTO crm_audit(public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(uuid('AUD'),p.id,p.name||p.id,p.role,action,type,id,summary,JSON.stringify(metadata),nowIso());}
export async function one(db,sql,args=[]){return db.prepare(sql).bind(...args).first();}
export async function rows(db,sql,args=[]){return (await db.prepare(sql).bind(...args).all()).results||[];}
export function changed(result){if(result.meta?.changes!==1)throw err('VERSION_CONFLICT','Another request changed this operation. Reload before retrying.',409);}
export async function assertRunLease(db,id,token){if(!await one(db,"SELECT id FROM ops_automation_runs WHERE id=? AND status='running' AND lease_token=? AND lease_until>?",[id,token,nowIso()]))throw err('LEASE_LOST','Execution lease expired. Progress will resume from its durable checkpoint.',409);}
export async function source(db,id){const s=await one(db,'SELECT * FROM ops_data_sources WHERE id=?',[String(id)]);if(!s)throw err('NOT_FOUND','Data source not found.',404);return s;}
export function day(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw err('INVALID_DATE','Use a date in YYYY-MM-DD format.');const d=new Date(value+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw err('INVALID_DATE','Use a valid calendar date.');return value;}
export function timestamp(value){const raw=text(String(value||''),100,true);let s=raw;if(/^\d{4}-\d{2}-\d{2}$/.test(s)){day(s);s+='T00:00:00Z';}else {s=s.replace(/^(\d{4}-\d{2}-\d{2}) /,'$1T').replace(/ ([+-]\d{2})(\d{2})$/,'$1:$2');if(!/(Z|[+-]\d\d:?\d\d)$/.test(s))throw err('INVALID_DATE','Datetime values require an explicit timezone.');day(s.slice(0,10));}const d=new Date(s);if(!Number.isFinite(d.getTime()))throw err('INVALID_DATE','Invalid source date.');return d.toISOString();}
export function minor(value,currency){const s=String(value??'').trim(),digits=['JPY','KRW'].includes(currency)?0:2;if(s.length>64||!(digits===0?/^\d+(?:\.0+)?$/:/^\d+(?:\.\d{1,2})?$/).test(s))throw err('INVALID_AMOUNT',`Use a nonnegative ${currency} decimal with at most ${digits} nonzero fractional digits.`);const [whole,fraction='']=s.split('.');const n=BigInt(whole)*10n**BigInt(digits)+(digits?BigInt(fraction.padEnd(digits,'0')||'0'):0n);if(n>CAP)throw err('INVALID_AMOUNT','Amount exceeds the 1e12 minor-unit limit.');return Number(n);}
