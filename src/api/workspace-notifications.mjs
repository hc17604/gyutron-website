import {WorkspaceError,requirePermission} from '../platform/crm/schema.mjs';
import {workspaceDate,workspaceTimeZone} from '../platform/crm/time.mjs';
import {rateLimit} from '../platform/security/ratelimit.mjs';

const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow','content-security-policy':"default-src 'none'; frame-ancestors 'none'"};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:JSON_HEADERS});
const fail=(status,code,message)=>{throw new WorkspaceError(status,code,message);};
const COPY={
 en:{task_overdue:'Overdue task',task_followup:'Task awaiting follow-up',intake_new:'New website enquiry',automation_failed:'Automation failed',automation_queued:'Queued automation needs review',agent_failed:'Your analysis failed',due:'Due',no_due:'No due date is set.',followup:'This unfinished task is assigned to your signed-in identity.',intake:'A new website submission is waiting for review.',failed:'Open the execution history to review the failure.',queued:'This run is queued and was created more than 30 minutes ago.',agent:'Open your private conversation to review this failed analysis.'},
 zh:{task_overdue:'逾期任务',task_followup:'待跟进任务',intake_new:'网站新询盘',automation_failed:'自动化运行失败',automation_queued:'排队运行待检查',agent_failed:'你的分析运行失败',due:'截止日期',no_due:'尚未设置截止日期。',followup:'此未完成任务分配给当前登录身份。',intake:'有新的网站提交等待处理。',failed:'请打开执行历史查看失败详情。',queued:'此运行当前处于排队状态，创建时间已超过 30 分钟。',agent:'请打开仅本人可见的会话查看本次失败分析。'},
};
function notificationQueries(principal,env,at){
 const today=workspaceDate(workspaceTimeZone(env),new Date(at)),cutoff=new Date(Date.parse(at)-30*60000).toISOString();
 const columns=(id,kind,title,source,created,route,metadata)=>`${id} AS id,'${kind}' AS kind,${title} AS record_title,${source} AS source_ref,${created} AS at,${route} AS route,${metadata} AS metadata_json`;
 const queries=[],add=(sql,args=[])=>queries.push({sql,args});
 add('SELECT '+columns("'task:overdue:'||public_id||':'||due_date",'task_overdue','title',"'tasks:'||public_id",'created_at',"'#tasks?record='||public_id||'&record_type=tasks'","json_object('due_date',due_date,'status',status)")+" FROM crm_tasks WHERE archived_at IS NULL AND status!='done' AND owner_id=? AND due_date!='' AND due_date<?",[principal.id,today]);
 add('SELECT '+columns("'task:followup:'||public_id",'task_followup','title',"'tasks:'||public_id",'created_at',"'#tasks?record='||public_id||'&record_type=tasks'","json_object('due_date',due_date,'status',status)")+" FROM crm_tasks WHERE archived_at IS NULL AND status!='done' AND owner_id=? AND (due_date='' OR due_date>=?)",[principal.id,today]);
 for(const[resource,table]of Object.entries({leads:'leads',rfqs:'rfqs',support:'support_requests',downloads:'download_requests'}))add('SELECT '+columns(`'intake:${resource}:'||public_id`,'intake_new',"COALESCE(NULLIF(company,''),NULLIF(name,''),public_id)",`'intake:${resource}:'||public_id`,'created_at',`'#inbox?resource=${resource}&record='||public_id||'&record_type=intake%2F${resource}'`,`json_object('resource','${resource}')`)+` FROM ${table} WHERE status='new'`);
 if(['owner','manager'].includes(principal.role)){
  add('SELECT '+columns("'automation:failed:'||r.id||':'||COALESCE(r.completed_at,r.created_at)",'automation_failed',"COALESCE(a.name,r.kind)","'automation_runs:'||r.id",'COALESCE(r.completed_at,r.created_at)',"'#automations?id='||r.id","json_object('status',r.status)")+" FROM ops_automation_runs r LEFT JOIN ops_automations a ON a.id=r.automation_id WHERE r.status='failed'");
  add('SELECT '+columns("'automation:queued:'||r.id",'automation_queued',"COALESCE(a.name,r.kind)","'automation_runs:'||r.id",'r.created_at',"'#automations?id='||r.id","json_object('status',r.status,'age_basis','created_at')")+" FROM ops_automation_runs r LEFT JOIN ops_automations a ON a.id=r.automation_id WHERE r.status='queued' AND r.created_at<=?",[cutoff]);
 }
 add('SELECT '+columns("'agent:failed:'||r.id",'agent_failed','c.title',"'intelligence_runs:'||r.id",'COALESCE(r.completed_at,r.started_at)',"'#agent?id='||r.conversation_id","json_object('error_code',r.error_code)")+" FROM intel_runs r JOIN intel_conversations c ON c.id=r.conversation_id WHERE r.status='failed' AND r.actor_id=? AND c.owner_id=? AND c.archived_at IS NULL",[principal.id,principal.id]);
 return queries;
}
function output(row,language){const copy=COPY[language],metadata=JSON.parse(row.metadata_json||'{}');let body;
 if(row.kind.startsWith('task_'))body=(row.kind==='task_followup'?copy.followup+' ':'')+(metadata.due_date?copy.due+': '+metadata.due_date:copy.no_due);
 else body=row.kind==='intake_new'?copy.intake:row.kind==='automation_failed'?copy.failed:row.kind==='automation_queued'?copy.queued:copy.agent;
 return{id:row.id,kind:row.kind,title:row.record_title||copy[row.kind],body,source_ref:row.source_ref,at:row.at,route:row.route,read:Boolean(row.read_at),read_at:row.read_at||null,metadata};
}
async function readBody(request){
 if((request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')fail(415,'UNSUPPORTED_MEDIA_TYPE','Send application/json.');
 const reader=request.body?.getReader();if(!reader)fail(400,'INVALID_JSON','A JSON body is required.');const parts=[];let size=0;
 try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();fail(413,'PAYLOAD_TOO_LARGE','The notification request is too large.');}parts.push(value);}}finally{reader.releaseLock();}
 try{const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{fail(400,'INVALID_JSON','Use a valid JSON object.');}
}
export async function handleWorkspaceNotifications(request,env,principal,url=new URL(request.url)){
 if(!(url instanceof URL))url=new URL(request.url);
 const path=url.pathname.replace(/\/+$/,'');if(!['/admin/api/workspace/notifications','/admin/api/workspace/notifications/read'].includes(path))return null;
 try{
  requirePermission(principal);const read=request.method==='GET';
  if(!['GET','HEAD'].includes(request.method)&&(request.headers.get('origin')!==new URL(request.url).origin||['cross-site','none'].includes(request.headers.get('sec-fetch-site'))))fail(403,'INVALID_ORIGIN','Submit this action from the signed-in workspace.');
  if(!env.DB)fail(503,'DATABASE_UNAVAILABLE','Notification storage is unavailable.');
  const throttle=await rateLimit(env,'notifications:'+principal.id+':'+(read?'read':'write'),{limit:read?120:60,windowSeconds:60});if(!throttle.ok)fail(429,'RATE_LIMITED','Wait before checking notifications again.');
  const db=env.DB,at=new Date().toISOString(),queries=notificationQueries(principal,env,at);
  if(path.endsWith('/read')){
   if(request.method!=='POST')fail(405,'METHOD_NOT_ALLOWED','Mark notifications read using POST.');const input=await readBody(request);
   if(Object.keys(input).some(key=>key!=='ids')||!Array.isArray(input.ids)||!input.ids.length||input.ids.length>50||new Set(input.ids).size!==input.ids.length||input.ids.some(id=>typeof id!=='string'||id.length<1||id.length>400||/[\x00-\x1f\x7f]/.test(id)))fail(422,'INVALID_NOTIFICATIONS','Select 1 to 50 distinct notification identifiers.');
   const placeholders=input.ids.map(()=>'?').join(',');
   const result=await db.batch(queries.flatMap(q=>[
    db.prepare(`INSERT OR IGNORE INTO workspace_notification_receipts(principal_id,notification_id,read_at) SELECT ?,n.id,? FROM (${q.sql}) n WHERE n.id IN (${placeholders})`).bind(principal.id,at,...q.args,...input.ids),
    db.prepare(`SELECT n.id FROM (${q.sql}) n WHERE n.id IN (${placeholders}) ORDER BY n.id`).bind(...q.args,...input.ids)
   ]));
   const marked=result.reduce((sum,row,index)=>sum+(index%2===0?Number(row.meta?.changes||0):0),0);
   const ids=[...new Set(result.flatMap((row,index)=>index%2?(row.results||[]).map(item=>item.id):[]))].sort();
   return json({data:{marked_read:marked,ids}});
  }
  if(request.method!=='GET')fail(405,'METHOD_NOT_ALLOWED','Read notifications using GET.');
  const limit=Number(url.searchParams.get('limit')||50);if(!Number.isSafeInteger(limit)||limit<1||limit>100)fail(422,'INVALID_LIMIT','Use a notification limit between 1 and 100.');const language=url.searchParams.get('lang')==='zh'?'zh':'en';
  // D1 restricts compound SELECT terms more tightly than desktop SQLite. Each
  // source is queried independently in the same transaction; at most 9*limit
  // small projections are merged, never full source records or message bodies.
  const result=await db.batch(queries.flatMap(q=>{
   const join=` FROM (${q.sql}) n LEFT JOIN workspace_notification_receipts r ON r.principal_id=? AND r.notification_id=n.id`;
   return [db.prepare('SELECT COUNT(*) AS total,COALESCE(SUM(r.read_at IS NULL),0) AS unread'+join).bind(...q.args,principal.id),db.prepare('SELECT n.*,r.read_at'+join+' ORDER BY (r.read_at IS NULL) DESC,n.at DESC,n.id DESC LIMIT ?').bind(...q.args,principal.id,limit)];
  }));
  let total=0,unread=0;const merged=[];for(let i=0;i<result.length;i+=2){const count=result[i].results?.[0]||{};total+=Number(count.total||0);unread+=Number(count.unread||0);merged.push(...(result[i+1].results||[]));}
  merged.sort((a,b)=>Number(Boolean(a.read_at))-Number(Boolean(b.read_at))||b.at.localeCompare(a.at)||b.id.localeCompare(a.id));
  return json({data:merged.slice(0,limit).map(row=>output(row,language)),meta:{total,unread,limit,generated_at:at,computed:true,task_scope:'assigned_to_principal',identity_scope:'signed_in_principal',queued_threshold_minutes:30}});
 }catch(error){if(error instanceof WorkspaceError)return json({error:{code:error.code,message:error.message}},error.status);console.error('workspace notifications failed',error?.name||'Error');return json({error:{code:'NOTIFICATIONS_UNAVAILABLE',message:'Notifications could not be loaded. Your business records were not changed.'}},503);}
}
