import { WorkspaceError,authorize,text,keys,bool,conflict,audit,identifier,timestamp,rows,base64url,unbase64,pagination } from './common.mjs';

const PROVIDERS=Object.freeze({openai:'https://api.openai.com/v1',deepseek:'https://api.deepseek.com/v1',mistral:'https://api.mistral.ai/v1',openrouter:'https://openrouter.ai/api/v1'});
export function allowedModelHosts(env={}) {
 return [...new Set([...Object.values(PROVIDERS).map(url=>new URL(url).hostname),...String(env.MODEL_API_ALLOWED_HOSTS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)])];
}
export function validateModelEndpoint(input,env={}) {
 if(typeof input!=='string'||/[%\\]/.test(input))throw new WorkspaceError(422,'MODEL_ENDPOINT_NOT_ALLOWED','Use an unescaped HTTPS model API base URL.');
 let url;try{url=new URL(input);}catch{throw new WorkspaceError(422,'MODEL_ENDPOINT_NOT_ALLOWED','Use an allowed HTTPS model API base URL.');}
 const hostname=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443'||url.search||url.hash||!allowedModelHosts(env).includes(hostname)||/^[\d.]+$|:|(?:^|\.)localhost$|(?:^|\.)local$|(?:^|\.)internal$/.test(hostname)||/%|\.\./.test(url.pathname))throw new WorkspaceError(422,'MODEL_ENDPOINT_NOT_ALLOWED','Use an allowed HTTPS model API base URL. Ask your deployment operator to allow a custom provider hostname.');
 return url.href.replace(/\/+$/,'');
}
function encryptionAvailable(env){return typeof env.WORKSPACE_ENCRYPTION_KEY==='string'&&env.WORKSPACE_ENCRYPTION_KEY.length>=32;}
async function masterKey(env) {
 if(!encryptionAvailable(env))throw new WorkspaceError(503,'ENCRYPTION_UNAVAILABLE','Encrypted model storage has not been configured by the deployment operator.');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.WORKSPACE_ENCRYPTION_KEY));return crypto.subtle.importKey('raw',digest,'AES-GCM',false,['encrypt','decrypt']);
}
const aad=row=>new TextEncoder().encode(`intel_model_settings:1:${row.provider}:${row.base_url}:${row.model}`);
export async function encryptModelKey(value,row,env){const iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(row)},await masterKey(env),new TextEncoder().encode(value));return`v1.${base64url(iv)}.${base64url(new Uint8Array(ciphertext))}`;}
export async function decryptModelKey(row,env){if(!row?.key_ciphertext)return'';try{const[format,iv,ciphertext,...extra]=row.key_ciphertext.split('.');if(format!=='v1'||extra.length)throw new Error();const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(iv),additionalData:aad(row)},await masterKey(env),unbase64(ciphertext));return new TextDecoder().decode(plain);}catch(error){if(error instanceof WorkspaceError)throw error;throw new WorkspaceError(503,'MODEL_KEY_UNAVAILABLE','The stored model credential could not be unlocked. Re-enter it or restore the instance encryption key.');}}
export const readModelRow=db=>db.prepare('SELECT * FROM intel_model_settings WHERE id=1').first();
export async function modelSettings(db,env,principal){authorize(principal,'manage');const row=await readModelRow(db);return{provider:row?.provider||'openai',base_url:row?.base_url||PROVIDERS.openai,model:row?.model||'',enabled:Boolean(row?.enabled),key_configured:Boolean(row?.key_ciphertext),version:row?.version||0,last_tested_at:row?.last_tested_at||null,last_test_status:row?.last_test_status||null,encryption_available:encryptionAvailable(env),allowed_hosts:allowedModelHosts(env),external_transmission_requires_consent:true};}
export async function saveModelSettings(db,env,principal,input) {
 authorize(principal,'owner');keys(input,['version','provider','base_url','model','enabled','api_key','clear_key']);
 const previous=await readModelRow(db);if(!Number.isSafeInteger(input.version)||input.version!==(previous?.version||0))conflict();
 const provider=text(input.provider,'provider',40,{required:true});if(![...Object.keys(PROVIDERS),'custom','openai_compatible'].includes(provider))throw new WorkspaceError(422,'VALIDATION_ERROR','Select a supported provider.');
 const next={provider,base_url:validateModelEndpoint(text(input.base_url,'base_url',500,{fallback:PROVIDERS[provider]||'',required:true}),env),model:text(input.model,'model',160,{required:true}),enabled:bool(input,'enabled',false)};
 if(PROVIDERS[provider]&&new URL(next.base_url).hostname!==new URL(PROVIDERS[provider]).hostname)throw new WorkspaceError(422,'MODEL_PROVIDER_MISMATCH','The selected provider does not match this API hostname. Use the matching provider or explicitly choose a custom compatible service.');
 if(!/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,159}$/.test(next.model))throw new WorkspaceError(422,'VALIDATION_ERROR','Use a valid provider model identifier.');
 const supplied=input.api_key===undefined?'':text(input.api_key,'api_key',4096);if(/[\x00-\x20\x7f]/.test(supplied))throw new WorkspaceError(422,'VALIDATION_ERROR','The model credential contains unsupported characters.');
 if(supplied&&bool(input,'clear_key'))throw new WorkspaceError(422,'VALIDATION_ERROR','Choose a new key or clear the old key.');
 const targetChanged=previous&&(provider!==previous.provider||new URL(next.base_url).hostname!==new URL(previous.base_url).hostname);
 if(targetChanged&&previous.key_ciphertext&&!supplied&&!bool(input,'clear_key'))throw new WorkspaceError(422,'MODEL_KEY_REQUIRED','Enter a new API key when changing provider or hostname. The existing credential cannot be transferred to another provider.',{api_key:'Provide the credential for this provider, or clear the stored key and disable it.'});
 const plain=bool(input,'clear_key')?'':supplied||await decryptModelKey(previous,env);
 if(next.enabled&&!plain)throw new WorkspaceError(422,'MODEL_KEY_REQUIRED','Add a model credential before enabling the provider.');
 const ciphertext=plain?await encryptModelKey(plain,next,env):'';
 const statement=previous?db.prepare('UPDATE intel_model_settings SET provider=?,base_url=?,model=?,enabled=?,key_ciphertext=?,version=version+1,last_tested_at=NULL,last_test_status=NULL,updated_by=?,updated_at=? WHERE id=1 AND version=?').bind(provider,next.base_url,next.model,Number(next.enabled),ciphertext,principal.id,timestamp(),input.version):db.prepare('INSERT OR IGNORE INTO intel_model_settings(id,provider,base_url,model,enabled,key_ciphertext,version,updated_by,updated_at) VALUES(1,?,?,?,?,?,1,?,?)').bind(provider,next.base_url,next.model,Number(next.enabled),ciphertext,principal.id,timestamp());
 const result=await db.batch([statement,audit(db,principal,'model.settings.updated','model','1',{provider,model:next.model,enabled:next.enabled},true)]);if(result[0].meta?.changes!==1)conflict();return modelSettings(db,env,principal);
}
async function boundedJson(response,limit=131072) {
 const reader=response.body?.getReader();if(!reader)throw new Error('Empty response');let count=0,chunks=[];try{while(true){const{done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>limit){await reader.cancel();throw new WorkspaceError(502,'MODEL_RESPONSE_TOO_LARGE','The model returned more text than this workspace accepts.');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(count);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new WorkspaceError(502,'MODEL_RESPONSE_INVALID','The model provider returned an invalid response.');}
}
const tokenCount=value=>Number.isSafeInteger(value)&&value>=0?value:null;
export async function callModel(db,env,principal,{messages,kind='chat',run_id=null,config=null,fetcher=globalThis.fetch}) {
 const row=config||await readModelRow(db);if(!row?.enabled||!row.key_ciphertext)throw new WorkspaceError(409,'MODEL_NOT_CONFIGURED','No enabled model provider is configured. Use local analysis or configure a provider.');
 const endpoint=validateModelEndpoint(row.base_url,env);const key=await decryptModelKey(row,env);const started=Date.now();let usage={prompt_tokens:null,completion_tokens:null,total_tokens:null},failure=null;
 try{
  const requestBody=JSON.stringify({model:row.model,messages,...(new URL(endpoint).hostname==='api.openai.com'?{max_completion_tokens:1800}:{max_tokens:1800}),stream:false});if(new TextEncoder().encode(requestBody).byteLength>512*1024)throw new WorkspaceError(422,'MODEL_CONTEXT_LIMIT','The selected model context is too large. Select fewer sources. No external request was sent.');
  const response=await fetcher(endpoint+'/chat/completions',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{'content-type':'application/json',authorization:'Bearer '+key},body:requestBody});
  if(!response.ok){await response.body?.cancel();throw new WorkspaceError(502,response.status===429?'MODEL_RATE_LIMITED':'MODEL_PROVIDER_FAILED','The model provider did not accept this request. Check its availability and your model settings.');}
  const result=await boundedJson(response);const answer=result?.choices?.[0]?.message?.content;if(typeof answer!=='string'||!answer.trim()||answer.length>16000)throw new WorkspaceError(502,'MODEL_RESPONSE_INVALID','The model provider returned an unsupported response.');
  usage={prompt_tokens:tokenCount(result.usage?.prompt_tokens),completion_tokens:tokenCount(result.usage?.completion_tokens),total_tokens:tokenCount(result.usage?.total_tokens)};
  // Even a faulty provider must not echo the bearer credential into a message or log.
  return{answer:answer.trim().replaceAll(key,'[REDACTED CREDENTIAL]'),usage,provider:row.provider,model:row.model};
 }catch(error){failure=error instanceof WorkspaceError?error:new WorkspaceError(502,'MODEL_CONNECTION_FAILED','The model provider could not be reached. No external action was performed.');throw failure;}
 finally{await db.prepare('INSERT INTO intel_model_usage(id,run_id,actor_id,kind,provider,model,status,prompt_tokens,completion_tokens,total_tokens,duration_ms,error_code,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(identifier('USE'),run_id,principal.id,kind,row.provider,row.model,failure?'failed':'succeeded',usage.prompt_tokens,usage.completion_tokens,usage.total_tokens,Math.max(0,Date.now()-started),failure?.code||null,timestamp()).run();}
}
export async function testModel(db,env,principal,input,options={}) {
 authorize(principal,'owner');keys(input,['summary_send_ack']);if(input.summary_send_ack!==true)throw new WorkspaceError(422,'MODEL_CONSENT_REQUIRED','Confirm the test will contact your configured model provider.');
 const config=await readModelRow(db);let result;try{result=await callModel(db,env,principal,{config,messages:[{role:'user',content:'Connectivity test only. Reply with OK. No business data is included.'}],kind:'test',fetcher:options.fetcher});await db.batch([db.prepare("UPDATE intel_model_settings SET last_tested_at=?,last_test_status='succeeded' WHERE id=1 AND version=?").bind(timestamp(),config.version),audit(db,principal,'model.test.succeeded','model','1',{version:config.version})]);return{status:'succeeded',provider:result.provider,model:result.model,version:config.version,usage:result.usage,tested_at:timestamp(),business_data_sent:false};}
 catch(error){if(config)await db.batch([db.prepare("UPDATE intel_model_settings SET last_tested_at=?,last_test_status='failed' WHERE id=1 AND version=?").bind(timestamp(),config.version),audit(db,principal,'model.test.failed','model','1',{version:config.version,code:error.code||'MODEL_PROVIDER_FAILED'})]);throw error;}
}
export async function modelUsage(db,principal,options={}){authorize(principal,'manage');const{page,limit,offset}=pagination(options);const results=await db.batch([db.prepare('SELECT COUNT(*) AS total,COUNT(CASE WHEN status=\'failed\' THEN 1 END) AS failed,SUM(prompt_tokens) AS prompt_tokens,SUM(completion_tokens) AS completion_tokens,SUM(total_tokens) AS total_tokens FROM intel_model_usage'),db.prepare('SELECT * FROM intel_model_usage ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?').bind(limit,offset)]);return{data:rows(results[1]),meta:{...rows(results[0])[0],page,limit,page_size:limit,pages:Math.ceil(Number(rows(results[0])[0]?.total||0)/limit),token_counts_reported_by_provider:true,cost:null,cost_reason:'Provider pricing is not configured.'}};}
