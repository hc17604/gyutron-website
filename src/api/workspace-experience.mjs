import { workspaceJson, assertWorkspaceOrigin } from './admin-api.mjs';
import { WorkspaceError, requirePermission, RESOURCES } from '../platform/crm/schema.mjs';
import { getWorkspaceRecord, listWorkspaceRecords, updateWorkspaceRecord, archiveWorkspaceRecord } from '../platform/crm/repository.mjs';
import { listQuotes } from '../platform/quotes/repository.mjs';
import { rateLimit } from '../platform/security/ratelimit.mjs';

const CONTACT_FIELDS=['customer_id','name','job_title','email','phone','is_primary','notes'];
const CONTACT_COLUMNS='public_id,customer_id,name,job_title,email,phone,is_primary,notes,version,archived_at,created_at,updated_at';
const stamp=()=>new Date().toISOString();
const manager=p=>['owner','manager'].includes(p.role);
const fail=(status,code,message,fields)=>{throw new WorkspaceError(status,code,message,fields);};
const literalLike=v=>String(v);
const clean=(v,max)=>typeof v==='string'&&v.trim().length<=max?v.trim():fail(422,'VALIDATION_ERROR','Use a valid text value.');
function version(v){if(!Number.isSafeInteger(v)||v<1)fail(422,'VERSION_REQUIRED','Reload this record before saving.');return v;}
async function body(request){
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))fail(415,'INVALID_CONTENT_TYPE','Use application/json.');
 const reader=request.body?.getReader();if(!reader)fail(400,'INVALID_JSON','A JSON object is required.');let size=0;const parts=[];
 try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();fail(413,'BODY_LIMIT','This request is too large.');}parts.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let pos=0;for(const part of parts){bytes.set(part,pos);pos+=part.length;}
 try{const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!data||typeof data!=='object'||Array.isArray(data))throw Error();return data;}catch{fail(400,'INVALID_JSON','A JSON object is required.');}
}
function audit(db,p,action,type,id,metadata,guard=null){return db.prepare(`INSERT INTO crm_audit(public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) SELECT ?,?,?,?,?,?,?,?,?,?${guard?' WHERE '+guard.sql:''}`).bind('AUD-'+crypto.randomUUID(),p.id,p.name||p.id,p.role,action,type,id,action+' '+type,JSON.stringify(metadata),stamp(),...(guard?.binds||[]));}
const contactOut=r=>r?{...r,is_primary:Boolean(r.is_primary)}:r;
async function contact(db,id){const r=await db.prepare('SELECT '+CONTACT_COLUMNS+' FROM crm_contacts WHERE public_id=?').bind(id).first();if(!r)fail(404,'NOT_FOUND','This contact could not be found.');return contactOut(r);}
function contactPayload(input,partial=false){
 const out={};for(const key of Object.keys(input))if(![...CONTACT_FIELDS,'version'].includes(key))fail(422,'VALIDATION_ERROR','This contact field cannot be changed.',{[key]:'Unsupported field.'});
 for(const key of CONTACT_FIELDS){if(partial&&!Object.hasOwn(input,key))continue;
  if(key==='is_primary'){if(input[key]!=null&&typeof input[key]!=='boolean')fail(422,'VALIDATION_ERROR','Select a valid primary contact state.');out[key]=input[key]?1:0;continue;}
  const max=key==='notes'?10000:key==='email'?320:key==='phone'?80:key==='customer_id'?100:200;
  out[key]=clean(input[key]??'',max);if(['customer_id','name'].includes(key)&&!out[key])fail(422,'VALIDATION_ERROR','Check the highlighted fields.',{[key]:'This field is required.'});
  if(key==='email'&&out[key]){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out[key]))fail(422,'VALIDATION_ERROR','Enter a valid email address.',{email:'Invalid email address.'});out[key]=out[key].toLowerCase();}
 }
 return out;
}
async function writeContact(db,p,id,input,archive=null){
 requirePermission(p,archive===null?'write':'archive');const old=id?await contact(db,id):null;
 if(old)version(input.version);if(old&&archive===null&&old.archived_at)fail(409,'ARCHIVED_RECORD','Restore this contact before editing.');
 const data=archive===null?contactPayload(input,Boolean(old)):{};
 if(old&&data.customer_id&&data.customer_id!==old.customer_id)fail(409,'CONTACT_HISTORY','A contact cannot be moved to another customer; create a new contact to preserve history.');
 const customerId=old?.customer_id||data.customer_id;
 if(archive!==true){const customer=await getWorkspaceRecord(db,'customers',customerId,p);if(customer.archived_at)fail(409,'ARCHIVED_CUSTOMER','Restore the customer before changing its contacts.');}
 if(archive!==null&&Boolean(old.archived_at)!==!archive)fail(409,'ARCHIVE_STATE','The contact archive state changed. Reload it.');
 const token=crypto.randomUUID(),publicId=id||'CON-'+crypto.randomUUID(),now=stamp(),primary=data.is_primary===1;
 const guard={sql:'EXISTS(SELECT 1 FROM crm_contacts WHERE public_id=? AND mutation_token=?)',binds:[publicId,token]},queries=[];
 if(old){if(archive!==null){data.archived_at=archive?now:null;data.is_primary=0;}if(primary)data.is_primary=0;
  const keys=Object.keys(data);if(!keys.length)fail(422,'EMPTY_UPDATE','Choose a contact field to change.');
  queries.push(db.prepare(`UPDATE crm_contacts SET ${keys.map(k=>k+'=?').join(',')},updated_at=?,version=version+1,mutation_token=? WHERE public_id=? AND version=?`).bind(...keys.map(k=>data[k]),now,token,publicId,input.version));
 }else{const row={public_id:publicId,...data,is_primary:0,mutation_token:token,created_at:now,updated_at:now};const keys=Object.keys(row);queries.push(db.prepare(`INSERT INTO crm_contacts(${keys.join(',')}) VALUES(${keys.map(()=>'?').join(',')})`).bind(...keys.map(k=>row[k])));}
 if(primary){queries.push(db.prepare('UPDATE crm_contacts SET is_primary=0,version=version+1,updated_at=? WHERE customer_id=? AND is_primary=1 AND public_id!=? AND '+guard.sql).bind(now,customerId,publicId,...guard.binds));queries.push(db.prepare('UPDATE crm_contacts SET is_primary=1 WHERE public_id=? AND mutation_token=?').bind(publicId,token));}
 queries.push(audit(db,p,archive===true?'archived':archive===false?'restored':old?'updated':'created','contacts',publicId,{before:old,after:{...data,is_primary:primary?1:data.is_primary}},guard));
 const result=await db.batch(queries);if(Number(result[0]?.meta?.changes)!==1)fail(409,'VERSION_CONFLICT','This contact changed in another session. Reload before saving.');return contact(db,publicId);
}
function parsedView(row){if(!row)return row;const {config_json,...rest}=row;return {...rest,config:JSON.parse(config_json)};}
function validateView(input){
 const name=clean(input.name,120);if(!name)fail(422,'VALIDATION_ERROR','Name this view.');
 const resource=clean(input.resource,40);if(!['customers','opportunities','tasks','activities','quotes','intake','audit'].includes(resource))fail(422,'INVALID_RESOURCE','Select a supported list.');
 const visibility=input.visibility||'private';if(!['private','team'].includes(visibility))fail(422,'INVALID_VISIBILITY','Select a supported sharing scope.');
 const config=input.config;if(!config||typeof config!=='object'||Array.isArray(config)||JSON.stringify(config).length>12000)fail(422,'INVALID_VIEW','Use a valid view configuration.');
 const columns=RESOURCES[resource]?.columns||(resource==='quotes'?['public_id','quote_number','title','customer_id','opportunity_id','status','currency','total_minor','created_at','updated_at','owner_id','issued_at','recipient_company']:['public_id','name','company','email','status','country','created_at']);
 const filters=new Set([...(RESOURCES[resource]?.filters||[]),'archived','created_from','created_to','updated_from','updated_to',...(resource==='opportunities'?['amount_min','amount_max','closed']:[]),...(resource==='tasks'?['overdue']:[]),...(resource==='quotes'?['status','currency','customer_id','opportunity_id','owner_id']:[]),...(resource==='intake'?['resource','status']:[])]);
 const allowed=new Set(['q','filters','sort','dir','columns','limit','mode']);if(Object.keys(config).some(k=>!allowed.has(k)))fail(422,'INVALID_VIEW','This view option is not supported.');
 if(config.columns&&(!Array.isArray(config.columns)||!config.columns.length||config.columns.length>30||new Set(config.columns).size!==config.columns.length||config.columns.some(v=>!columns.includes(v))))fail(422,'INVALID_VIEW','Select columns available in this list.');
 if(config.filters&&(!config.filters||typeof config.filters!=='object'||Array.isArray(config.filters)||Object.keys(config.filters).length>30||Object.values(config.filters).some(v=>!['string','number','boolean'].includes(typeof v))))fail(422,'INVALID_VIEW','Use valid filter values.');
 for(const key of ['q','sort','dir','mode'])if(config[key]!=null&&(typeof config[key]!=='string'||config[key].length>300))fail(422,'INVALID_VIEW','Use a valid view option.');
 if(config.sort&&!['id',...columns].includes(config.sort))fail(422,'INVALID_VIEW','Select a sort column available in this list.');
 if(config.dir&&!['asc','desc'].includes(config.dir))fail(422,'INVALID_VIEW','Select ascending or descending order.');
 if(config.mode&&!['table','board'].includes(config.mode))fail(422,'INVALID_VIEW','Select a supported list mode.');
 if(config.limit!=null&&(!Number.isSafeInteger(config.limit)||config.limit<1||config.limit>100))fail(422,'INVALID_VIEW','Select a page size between 1 and 100.');
 for(const[key,value]of Object.entries(config.filters||{})){
  if(!filters.has(key)||String(value).length>200)fail(422,'INVALID_VIEW','This filter is not available for this list.');
  if(/^(created|updated)_(from|to)$/.test(key)&&value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)fail(422,'INVALID_VIEW','Use valid calendar dates in this view.');}
  const rule=RESOURCES[resource]?.fields?.[key];if(rule?.enum&&value&&!rule.enum.includes(value))fail(422,'INVALID_VIEW','Select a supported filter value.');
  if(['closed','overdue'].includes(key)&&!['true','false',true,false].includes(value))fail(422,'INVALID_VIEW','Use a valid boolean filter.');
  if(key==='archived'&&!['true','false','all'].includes(String(value)))fail(422,'INVALID_VIEW','Use a supported archive filter.');
  if(['amount_min','amount_max'].includes(key)&&(!Number.isSafeInteger(Number(value))||Number(value)<0||Number(value)>1000000000000))fail(422,'INVALID_VIEW','Use a valid amount filter.');
 }
 if(['amount_min','amount_max'].some(key=>config.filters?.[key]!==undefined&&config.filters[key]!=='')&&!config.filters?.currency)fail(422,'INVALID_VIEW','Choose a currency before filtering amounts.');
 return{name,resource,visibility,config_json:JSON.stringify(config)};
}
async function views(request,db,p,path,url){
 if(!path[1]&&request.method==='GET'){const resource=url.searchParams.get('resource');if(resource==='audit')requirePermission(p,'audit');const data=await db.prepare("SELECT * FROM workspace_views WHERE (owner_id=? OR visibility='team')"+(resource?' AND resource=?':'')+' ORDER BY updated_at DESC LIMIT 300').bind(p.id,...(resource?[resource]:[])).all();return workspaceJson({data:(data.results||[]).filter(v=>v.resource!=='audit'||manager(p)).map(parsedView)});}
 if(!path[1]&&request.method==='POST'){const input=validateView(await body(request));if(input.visibility==='team'||input.resource==='audit')requirePermission(p,'audit');const count=await db.prepare('SELECT COUNT(*) n FROM workspace_views WHERE owner_id=?').bind(p.id).first();if(count.n>=100)fail(409,'VIEW_LIMIT','Remove an unused view before adding another.');const id='VIEW-'+crypto.randomUUID(),now=stamp();await db.batch([db.prepare('INSERT INTO workspace_views(id,name,resource,visibility,owner_id,config_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,input.name,input.resource,input.visibility,p.id,input.config_json,now,now),audit(db,p,'created','saved_view',id,{name:input.name,visibility:input.visibility})]);return workspaceJson({data:parsedView(await db.prepare('SELECT * FROM workspace_views WHERE id=?').bind(id).first())},201);}
 const existing=await db.prepare('SELECT * FROM workspace_views WHERE id=?').bind(path[1]||'').first();if(!existing||(existing.owner_id!==p.id&&existing.visibility!=='team'))fail(404,'NOT_FOUND','This view could not be found.');
 if(existing.resource==='audit')requirePermission(p,'audit');
 if(request.method==='GET')return workspaceJson({data:parsedView(existing)});
 if(existing.owner_id!==p.id&&!manager(p))fail(403,'FORBIDDEN','Only the creator or a manager can change this shared view.');
 if(existing.visibility==='team')requirePermission(p,'audit');const input=await body(request);version(input.version);
 if(request.method==='DELETE'){const res=await db.batch([db.prepare('DELETE FROM workspace_views WHERE id=? AND version=?').bind(existing.id,input.version),audit(db,p,'deleted','saved_view',existing.id,{name:existing.name},{sql:'changes()=1',binds:[]})]);if(res[0].meta.changes!==1)fail(409,'VERSION_CONFLICT','This view changed. Reload it.');return workspaceJson({data:{id:existing.id,deleted:true}});}
 if(request.method==='PATCH'){const next=validateView({...parsedView(existing),...input});if(next.visibility==='team'||next.resource==='audit')requirePermission(p,'audit');const res=await db.batch([db.prepare('UPDATE workspace_views SET name=?,resource=?,visibility=?,config_json=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(next.name,next.resource,next.visibility,next.config_json,stamp(),existing.id,input.version),audit(db,p,'updated','saved_view',existing.id,{before:parsedView(existing),after:next},{sql:'changes()=1',binds:[]})]);if(res[0].meta.changes!==1)fail(409,'VERSION_CONFLICT','This view changed. Reload it.');return workspaceJson({data:parsedView(await db.prepare('SELECT * FROM workspace_views WHERE id=?').bind(existing.id).first())});}
 fail(405,'METHOD_NOT_ALLOWED','Use the view controls.');
}
async function bulk(request,db,p){
 requirePermission(p,'write');const input=await body(request),{resource,action,records,changes}=input;
 if(!['customers','opportunities','tasks'].includes(resource)||!['update','archive','restore'].includes(action)||!Array.isArray(records)||!records.length||records.length>50||records.some(r=>!r||typeof r!=='object'||Array.isArray(r))||new Set(records.map(r=>r.id)).size!==records.length)fail(422,'INVALID_BULK','Select 1 to 50 distinct records and a supported action.');
 if(records.length>5)fail(422,'BULK_STEP_LIMIT','Submit at most five versioned records in one step. The workspace processes larger selections in bounded steps.');
 if(action!=='update')requirePermission(p,'archive');
 if(action==='update'&&(!changes||typeof changes!=='object'||Array.isArray(changes)||!Object.keys(changes).length||Object.keys(changes).some(k=>!['status','owner_id','stage','priority'].includes(k))))fail(422,'INVALID_BULK','Choose status, stage, priority or owner fields.');
 const results=[];for(const row of records){if(!row||typeof row.id!=='string'||row.id.length>150)fail(422,'INVALID_BULK','Choose valid records.');version(row.version);}
 for(const row of records){try{const data=action==='update'?await updateWorkspaceRecord(db,resource,row.id,{...changes,version:row.version},p):await archiveWorkspaceRecord(db,resource,row.id,{version:row.version},p,{restore:action==='restore'});results.push({id:row.id,ok:true,data});}catch(error){if(error instanceof WorkspaceError)results.push({id:row.id,ok:false,error:{code:error.code,message:error.message,fields:error.fields}});else{console.error('bulk record outcome unconfirmed',error?.name||'Error');results.push({id:row.id,ok:false,error:{code:'OUTCOME_UNCONFIRMED',message:'The outcome for this record could not be confirmed. Reload its current state before retrying.'}});}}}
 return workspaceJson({data:{results,summary:{total:results.length,succeeded:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length}}});
}
async function search(db,p,q){
 q=clean(q||'',200);if(q.length<2)return {data:[],meta:{query:q}};
 const out=[];for(const resource of ['customers','opportunities','tasks','activities']){const result=await listWorkspaceRecords(db,resource,{q,limit:5},p);out.push(...result.data.map(r=>({resource,id:r.public_id,title:r.name||r.title||r.subject,subtitle:r.customer_name||r.email||r.public_id,route:resource==='opportunities'?'pipeline':resource==='activities'?'activity':resource})));}
 const quotes=await listQuotes(db,{q,limit:5},p);out.push(...quotes.data.map(r=>({resource:'quotes',id:r.public_id,title:r.quote_number+' · '+r.title,subtitle:r.recipient_company,route:'quotes'})));
 const contacts=await db.prepare("SELECT public_id,name,email,customer_id FROM crm_contacts WHERE archived_at IS NULL AND EXISTS(SELECT 1 FROM crm_customers parent WHERE parent.public_id=crm_contacts.customer_id AND parent.archived_at IS NULL) AND (instr(lower(name),lower(?))>0 OR instr(lower(email),lower(?))>0) LIMIT 5").bind(literalLike(q),literalLike(q)).all();out.push(...(contacts.results||[]).map(r=>({resource:'contacts',id:r.public_id,title:r.name,subtitle:r.email,route:'customers',customer_id:r.customer_id})));
 for(const row of out){const tab=row.route;if(row.resource==='contacts')row.route='#customers?record='+encodeURIComponent(row.customer_id)+'&record_type=customers';else if(row.resource==='quotes')row.route='#quotes?id='+encodeURIComponent(row.id);else row.route='#'+tab+'?record='+encodeURIComponent(row.id)+'&record_type='+encodeURIComponent(row.resource);}
 const reports=await db.prepare("SELECT id,title,type,created_at FROM ops_reports WHERE instr(lower(title),lower(?))>0 OR instr(lower(content_markdown),lower(?))>0 ORDER BY created_at DESC LIMIT 5").bind(literalLike(q),literalLike(q)).all();out.push(...(reports.results||[]).map(r=>({resource:'reports',id:r.id,title:r.title,subtitle:r.type,route:'#reports?id='+encodeURIComponent(r.id)})));
 for(const [table,resource,param] of [['intel_memory','memory','record'],['intel_documents','documents','document']]){const result=await db.prepare(`SELECT id,title,source_ref FROM ${table} WHERE archived_at IS NULL AND (instr(lower(title),lower(?))>0 OR instr(lower(content),lower(?))>0) ORDER BY updated_at DESC LIMIT 5`).bind(literalLike(q),literalLike(q)).all();out.push(...(result.results||[]).map(r=>({resource,id:r.id,title:r.title,subtitle:r.source_ref,route:'#memory?'+param+'='+encodeURIComponent(r.id)})));}
 return{data:out,meta:{query:q}};
}
async function related(db,p,resource,id){
 if(!['customers','opportunities','tasks','activities'].includes(resource))fail(404,'NOT_FOUND','This record type is not supported.');
 const record=await getWorkspaceRecord(db,resource,id,p),customerId=resource==='customers'?id:record.customer_id,opportunityId=resource==='opportunities'?id:record.opportunity_id;
 const query=opportunityId?{opportunity_id:opportunityId,limit:50}:{customer_id:customerId||'__none__',limit:50};
 const [opportunities,tasks,activities,quotes,contacts]=await Promise.all([
 listWorkspaceRecords(db,'opportunities',{customer_id:customerId||'__none__',limit:50},p),listWorkspaceRecords(db,'tasks',query,p),listWorkspaceRecords(db,'activities',query,p),listQuotes(db,{...query},p),db.prepare('SELECT '+CONTACT_COLUMNS+' FROM crm_contacts WHERE customer_id=? AND archived_at IS NULL ORDER BY is_primary DESC,name LIMIT 51').bind(customerId||'').all()]);
 const parent=resource==='customers'?record:customerId?await getWorkspaceRecord(db,'customers',customerId,p):null;
 return{record,related:{contacts:(contacts.results||[]).slice(0,50).map(contactOut),opportunities:opportunities.data,quotes:quotes.data,tasks:tasks.data,activities:activities.data},meta:{limit:50,customer_archived_at:parent?.archived_at||null,capped:[opportunities,tasks,activities,quotes].some(v=>v.meta.total>50)||(contacts.results||[]).length>50}};
}
export async function handleWorkspaceExperience(request,env,principal,url=new URL(request.url)){
 try{requirePermission(principal);assertWorkspaceOrigin(request);const read=['GET','HEAD'].includes(request.method),throttle=await rateLimit(env,'workspace-experience:'+principal.id+':'+(read?'read':'write'),{limit:read?240:80,windowSeconds:60});if(!throttle.ok)return workspaceJson({error:{code:'RATE_LIMITED',message:'Please wait before trying again.'}},429,{'retry-after':String(throttle.retryAfter||60)});const path=url.pathname.replace(/^\/admin\/api\/workspace\/?/,'').split('/').filter(Boolean).map(decodeURIComponent),db=env.DB;
 if(path[0]==='views'&&path.length<=2)return await views(request,db,principal,path,url);
 if(path[0]==='bulk'&&path.length===1&&request.method==='POST')return await bulk(request,db,principal);
 if(path[0]==='search'&&path.length===1&&request.method==='GET')return workspaceJson(await search(db,principal,url.searchParams.get('q')));
 if(path[0]==='record'&&path.length===3&&request.method==='GET')return workspaceJson({data:await related(db,principal,path[1],path[2])});
 if(path[0]==='contacts'){
  if(path.length===1&&request.method==='GET'){const customer=url.searchParams.get('customer_id'),q=url.searchParams.get('q'),page=Number(url.searchParams.get('page')||1),limit=Number(url.searchParams.get('limit')||50);if(!Number.isSafeInteger(page)||page<1||page>100000||!Number.isSafeInteger(limit)||limit<1||limit>100)fail(422,'INVALID_PAGE','Use a valid page and page size.');const where=['archived_at IS '+(url.searchParams.get('archived')==='true'?'NOT ':'')+'NULL'],binds=[];if(customer){where.push('customer_id=?');binds.push(clean(customer,100));}if(q){where.push("(instr(lower(name),lower(?))>0 OR instr(lower(email),lower(?))>0)");binds.push(literalLike(clean(q,200)),literalLike(clean(q,200)));}const sql=' FROM crm_contacts WHERE '+where.join(' AND '),total=Number((await db.prepare('SELECT COUNT(*) n'+sql).bind(...binds).first()).n),rows=await db.prepare('SELECT '+CONTACT_COLUMNS+sql+' ORDER BY is_primary DESC,name,public_id LIMIT ? OFFSET ?').bind(...binds,limit,(page-1)*limit).all();return workspaceJson({data:(rows.results||[]).map(contactOut),meta:{total,page,limit,pages:Math.ceil(total/limit)}});}
  if(path.length===1&&request.method==='POST')return workspaceJson({data:await writeContact(db,principal,null,await body(request))},201);
  if(path.length===2&&request.method==='GET')return workspaceJson({data:await contact(db,path[1])});
  if(path.length===2&&request.method==='PATCH')return workspaceJson({data:await writeContact(db,principal,path[1],await body(request))});
  if(path.length===2&&request.method==='DELETE')return workspaceJson({data:await writeContact(db,principal,path[1],await body(request),true)});
  if(path.length===3&&path[2]==='restore'&&request.method==='POST')return workspaceJson({data:await writeContact(db,principal,path[1],await body(request),false)});
 }
 fail(404,'NOT_FOUND','This workspace route could not be found.');
 }catch(error){if(error instanceof WorkspaceError)return workspaceJson({error:{code:error.code,message:error.message,...(error.fields?{fields:error.fields}:{})}},error.status);if(error instanceof URIError)return workspaceJson({error:{code:'INVALID_PATH',message:'Invalid record address.'}},400);console.error('workspace experience request failed',error?.name||'Error');return workspaceJson({error:{code:'SERVICE_UNAVAILABLE',message:'This operation could not be completed. Reload before retrying.'}},503);}
}
