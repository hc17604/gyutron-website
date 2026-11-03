import { WorkspaceError,authorize,rows } from '../platform/intelligence/common.mjs';
import { modelSettings,saveModelSettings,testModel,modelUsage,readModelRow } from '../platform/intelligence/models.mjs';
import { listKnowledge,getKnowledge,saveKnowledge,archiveKnowledge } from '../platform/intelligence/knowledge.mjs';
import { licenseState,activateLicense,deactivateLicense,licenseHistory } from '../platform/intelligence/license.mjs';
import { listConversations,createConversation,conversationDetail,archiveConversation,getRun,chat } from '../platform/intelligence/agent.mjs';
import { rateLimit } from '../platform/security/ratelimit.mjs';
const HEADERS={'cache-control':'no-store, private','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow','content-security-policy':"default-src 'none'; frame-ancestors 'none'"};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS});}
function method(){throw new WorkspaceError(405,'METHOD_NOT_ALLOWED','This method is not supported for this route.');}
async function body(request){if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))throw new WorkspaceError(415,'UNSUPPORTED_MEDIA_TYPE','Send application/json.');const reader=request.body?.getReader();if(!reader)throw new WorkspaceError(400,'INVALID_JSON','A JSON body is required.');const chunks=[];let size=0;try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144){await reader.cancel();throw new WorkspaceError(413,'PAYLOAD_TOO_LARGE','This request exceeds 256 KiB.');}chunks.push(value);}}finally{reader.releaseLock();}try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}const input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!input||Array.isArray(input)||typeof input!=='object')throw new Error();return input;}catch{throw new WorkspaceError(400,'INVALID_JSON','Use a valid JSON object.');}}
/** Parent router verifies session + CSRF; this module additionally enforces RBAC and Origin. */
export async function handleIntelligenceApi(request,env,principal,path=new URL(request.url),options={}){
 const url=path instanceof URL?path:new URL(typeof path==='string'&&path.startsWith('http')?path:request.url);
 const pathname=path instanceof URL?path.pathname:typeof path==='string'?path:url.pathname;
 if(!/^\/admin\/api\/intelligence(?:\/|$)/.test(pathname))return null;
 try{
  authorize(principal);if(!['GET','HEAD'].includes(request.method)&&(request.headers.get('origin')!==new URL(request.url).origin||['cross-site','none'].includes(request.headers.get('sec-fetch-site'))))throw new WorkspaceError(403,'INVALID_ORIGIN','Use the signed-in workspace to submit this action.');
  if(request.method==='HEAD')return method();const db=env.DB;if(!db)throw new WorkspaceError(503,'DATABASE_UNAVAILABLE','Workspace storage is unavailable.');const parts=pathname.replace(/^\/admin\/api\/intelligence\/?/,'').split('/').filter(Boolean).map(part=>decodeURIComponent(part));const query={...Object.fromEntries(url.searchParams),...options};const[result,id,action]=parts;
  if(parts.length>3)throw new WorkspaceError(404,'NOT_FOUND','This intelligence route does not exist.');
  const throttle=await rateLimit(env,`intelligence:${principal.id}:${request.method==='GET'?'read':result==='chat'||id==='test'?'analysis':'write'}`,{limit:request.method==='GET'?240:result==='chat'||id==='test'?20:60,windowSeconds:60});if(!throttle.ok)throw new WorkspaceError(429,'RATE_LIMITED','Too many requests. Wait a minute before retrying.');
  if((!result||result==='status')&&parts.length<=1){if(request.method!=='GET')return method();const model=await readModelRow(db),encrypted=typeof env.WORKSPACE_ENCRYPTION_KEY==='string'&&env.WORKSPACE_ENCRYPTION_KEY.length>=32;return json({data:{engine:model?.enabled&&model?.key_ciphertext&&encrypted?'provider_available':'deterministic',model_configured:Boolean(model?.enabled&&model?.key_ciphertext),model_target:model?{provider:model.provider,model:model.model,hostname:new URL(model.base_url).hostname,version:model.version}:null,encryption_available:encrypted,external_transmission_requires_consent:true,permissions:{chat:principal.role!=='viewer',memory_write:principal.role!=='viewer',model_manage:principal.role==='owner',model_read:['owner','manager'].includes(principal.role),license_manage:principal.role==='owner'},context_sources:['crm','memory','rules','documents'],supported_documents:['text/plain','text/markdown'],tools:['read_crm_summary','search_memory','read_business_rules','read_selected_documents','followup_draft','report_draft'],external_actions_available:false}});}
  if(result==='models'){
   if(!id){if(request.method==='GET')return json({data:await modelSettings(db,env,principal)});if(request.method==='PUT')return json({data:await saveModelSettings(db,env,principal,await body(request))});return method();}
   if(id==='test'&&!action){if(request.method!=='POST')return method();return json({data:await testModel(db,env,principal,await body(request),query)});}
   if(id==='usage'&&!action){if(request.method!=='GET')return method();return json(await modelUsage(db,principal,query));}
  }
  if(['memory','documents'].includes(result)){
   if(!id){if(request.method==='GET')return json(await listKnowledge(db,result,query,principal));if(request.method==='POST')return json({data:await saveKnowledge(db,result,null,await body(request),principal)},201);return method();}
   if(!action){if(request.method==='GET')return json({data:await getKnowledge(db,result,id,principal)});if(request.method==='PATCH')return json({data:await saveKnowledge(db,result,id,await body(request),principal)});if(request.method==='DELETE')return json({data:await archiveKnowledge(db,result,id,await body(request),principal)});return method();}
   if(['archive','restore'].includes(action)){if(request.method!=='POST')return method();return json({data:await archiveKnowledge(db,result,id,await body(request),principal,action==='restore')});}
  }
  if(result==='conversations'){
   if(!id){if(request.method==='GET')return json(await listConversations(db,principal,query));if(request.method==='POST')return json({data:await createConversation(db,principal,await body(request))},201);return method();}
   if(!action){if(request.method==='GET')return json({data:await conversationDetail(db,id,principal)});if(request.method==='DELETE')return json({data:await archiveConversation(db,id,principal)});return method();}
   if(action==='archive'){if(request.method!=='POST')return method();return json({data:await archiveConversation(db,id,principal)});}
  }
  if(result==='chat'&&!id){if(request.method!=='POST')return method();return json({data:await chat(db,env,principal,await body(request),query)});}
  if(result==='runs'&&id&&!action){if(request.method!=='GET')return method();return json({data:await getRun(db,id,principal)});}
  if(result==='license'){
   if(!id){if(request.method!=='GET')return method();return json({data:await licenseState(db,env,principal)});}
   if(id==='history'&&!action){if(request.method!=='GET')return method();return json(await licenseHistory(db,principal));}
   if(id==='activate'&&!action){if(request.method!=='POST')return method();return json({data:await activateLicense(db,env,principal,await body(request))});}
   if(id==='deactivate'&&!action){if(request.method!=='POST')return method();return json({data:await deactivateLicense(db,env,principal,await body(request))});}
  }
  if(result==='instance'&&!id){authorize(principal,'manage');if(request.method!=='GET')return method();const migrations=rows(await db.prepare('SELECT name,applied_at FROM d1_migrations ORDER BY id DESC LIMIT 50').all());return json({data:{license:await licenseState(db,env,principal),release:String(options.version||env.WORKSPACE_RELEASE_VERSION||'not_reported'),migrations,upgrade_history_source:'D1 applied migrations',deployment_mode:'independent_instance'}});}
  throw new WorkspaceError(404,'NOT_FOUND','This intelligence route does not exist.');
 }catch(error){if(error instanceof WorkspaceError)return json({error:{code:error.code,message:error.message,...(error.fields?{fields:error.fields}:{})}},error.status);if(error instanceof URIError)return json({error:{code:'INVALID_PATH',message:'This record address is invalid.'}},400);console.error('intelligence operation failed',error?.name||'Error');return json({error:{code:'SERVICE_UNAVAILABLE',message:'The intelligence operation could not be completed. Review its history before retrying.'}},503);}
}
