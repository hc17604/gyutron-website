import { WorkspaceError, requirePermission } from '../crm/schema.mjs';
export { WorkspaceError };
export const timestamp = () => new Date().toISOString();
export const identifier = prefix => `${prefix}-${crypto.randomUUID()}`;
export const rows = result => result?.results || [];
export function authorize(principal, action='read') {
 requirePermission(principal);
 if(action==='owner'&&principal.role!=='owner')throw new WorkspaceError(403,'FORBIDDEN','Only the workspace owner can manage this setting.');
 if(action==='manage'&&!['owner','manager'].includes(principal.role))throw new WorkspaceError(403,'FORBIDDEN','A manager role is required.');
 if(action==='write'&&principal.role==='viewer')throw new WorkspaceError(403,'FORBIDDEN','Your role does not permit this action.');
}
export function text(value,field,max,{required=false,fallback=''}={}) {
 if(value===undefined)return fallback;
 if(typeof value!=='string'||value.length>max||value.includes('\0'))throw new WorkspaceError(422,'VALIDATION_ERROR',`Check ${field}.`,{[field]:`Use text of at most ${max} characters.`});
 const clean=value.trim();if(required&&!clean)throw new WorkspaceError(422,'VALIDATION_ERROR',`Check ${field}.`,{[field]:'This field is required.'});return clean;
}
export function version(value){if(!Number.isSafeInteger(value)||value<1)throw new WorkspaceError(422,'VERSION_REQUIRED','Reload this record before saving.');return value;}
export function conflict(){throw new WorkspaceError(409,'VERSION_CONFLICT','This record changed while you were editing. Reload it before saving.');}
export function noSecrets(value) {
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{20,}|\bgh[pousr]_[A-Za-z0-9]{20,}/.test(value))throw new WorkspaceError(422,'SENSITIVE_CONTENT','Remove credentials or private keys before saving this content.');return value;
}
export function keys(input,allowed){for(const key of Object.keys(input))if(!allowed.includes(key))throw new WorkspaceError(422,'VALIDATION_ERROR',`Unsupported field: ${key}.`);}
export function bool(input,key,fallback=false){if(input[key]===undefined)return fallback;if(typeof input[key]!=='boolean')throw new WorkspaceError(422,'VALIDATION_ERROR',`Use a boolean for ${key}.`);return input[key];}
export function parseJson(value,fallback={}){try{return JSON.parse(value);}catch{return fallback;}}
export function audit(db,principal,action,type,id,metadata={},conditional=false) {
 return db.prepare('INSERT INTO crm_audit(public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) '+(conditional?'SELECT ?,?,?,?,?,?,?,?,?,? WHERE changes()=1':'VALUES(?,?,?,?,?,?,?,?,?,?)'))
 .bind(identifier('AUD'),principal.id,principal.name||principal.id,principal.role,action,type,id,action,JSON.stringify(metadata),timestamp());
}
export function pagination(options={}){let page=Number(options.page||1),limit=Number(options.limit||options.page_size||30);if(!Number.isSafeInteger(page)||page<1||page>100000||!Number.isSafeInteger(limit)||limit<1||limit>100)throw new WorkspaceError(422,'INVALID_PAGINATION','Use a page size between 1 and 100.');return{page,limit,offset:(page-1)*limit};}
export const like=value=>`%${value.replace(/[\\%_]/g,'\\$&')}%`;
export function day(value){if(value===null||value==='')return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new WorkspaceError(422,'VALIDATION_ERROR','Use a valid expiry date.');const date=new Date(value+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)throw new WorkspaceError(422,'VALIDATION_ERROR','Use a valid expiry date.');return value;}
export async function sha256(value){const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');}
export function base64url(bytes){let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
export function unbase64(value){if(typeof value!=='string'||!value||!/^[A-Za-z0-9_+\/-]*={0,2}$/.test(value))throw new Error('Invalid encoded value');const normalized=value.replaceAll('-','+').replaceAll('_','/');return Uint8Array.from(atob(normalized+'='.repeat((4-normalized.length%4)%4)),c=>c.charCodeAt(0));}
