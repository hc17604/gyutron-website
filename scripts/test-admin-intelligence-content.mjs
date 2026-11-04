/** Shipped intelligence controller content regression; synthetic API and real owner-only Test adapter. */
import assert from 'node:assert/strict';
import {INTELLIGENCE_CLIENT} from '../src/admin/intelligence-client.mjs';
import {WORKBENCH_CLIENT} from '../src/admin/workbench-ui.mjs';
import {DEMO_CLIENT} from '../src/admin/demo-client.mjs';

const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {createIntelligenceController}=await import(moduleUrl(INTELLIGENCE_CLIENT.replace("'/admin/assets/workbench.js'",JSON.stringify(moduleUrl(WORKBENCH_CLIENT)))));
const {createDemoWorkspace}=await import(moduleUrl(DEMO_CLIENT));
const prior={document:globalThis.document,location:globalThis.location,history:globalThis.history,fetch:globalThis.fetch};
const attempts=[],results=[],failures=[];
globalThis.fetch=async value=>{attempts.push(String(value));throw Error('No network is allowed in intelligence content checks.');};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=value=>String(value).replace(/&(amp|lt|gt|quot|#39);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[key]));
const attrs=html=>Object.fromEntries([...html.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,key,value])=>[key,decode(value)]));
const boundary={en:'Backups are private database snapshots. Recovery is an operator-controlled deployment operation and must be verified in an isolated database before replacing live data.',zh:'备份为私有数据库快照。恢复由部署管理员执行，在替换在线数据前需先在隔离数据库验证。'};
const documentRows=[{id:'DOC-FIRST',title:'First <verified> document',filename:'first.md',source_ref:'https://manual.synthetic.invalid/first',created_by:'owner',version:2,updated_at:'2026-11-03T08:00:00Z'},{id:'DOC-SECOND',title:'Second & exact document',filename:'second.txt',source_ref:'https://manual.synthetic.invalid/second',created_by:'owner',version:4,updated_at:'2026-11-04T08:00:00Z'}];
const memoryRows=[{id:'MEM-FIRST',title:'Current business fact',category:'business',source_ref:'Manual record',created_by:'owner',version:1,content:'Exact first business fact',updated_at:'2026-11-04T08:00:00Z'},{id:'MEM-SECOND',title:'Second <exact> & business fact',category:'process',source_ref:'Second manual record',created_by:'owner',version:3,content:'Exact second business fact',updated_at:'2026-11-04T08:00:00Z'}];

async function harness({lang='en',role='owner',tab='memory',params='kind=documents',testMode=false,historyError='',backup={status:'verified',stale:false,retentionOk:true,at:'2026-11-04T07:00:00Z',totalRows:91,schemaVersion:5}}={}){
 assert.ok(!testMode||role==='owner','The real Test adapter represents its existing owner identity, not simulated viewer permissions.');
 const calls=[],listeners={},toasts=[],historyCalls=[],state={lang,tab,params:new URLSearchParams(params),principal:{id:role==='owner'?'owner':'fixture-'+role,role},testMode};
 const page={innerHTML:'',querySelector(){return null;},contains(){return false;}},dialog={dataset:{},innerHTML:'',open:false};
 const demo=testMode?createDemoWorkspace({now:()=>Date.parse('2026-11-04T08:00:00Z'),language:()=>lang}):null;
 const fixture=async path=>{
  if(path==='intelligence/status')return{data:{permissions:{memory_write:role!=='viewer'}}};
  const rowsFor=rows=>rows.map(row=>({...structuredClone(row),...(state.params.get('archived')==='true'?{archived_at:'2026-11-03T08:00:00Z'}:{})}));
  if(path.startsWith('intelligence/documents?'))return{data:rowsFor(documentRows),meta:{total:documentRows.length,page:1}};
  if(path.startsWith('intelligence/memory?'))return{data:rowsFor(memoryRows),meta:{total:memoryRows.length,page:1}};
  if(path.startsWith('intelligence/documents/')){const id=decodeURIComponent(path.slice('intelligence/documents/'.length)),row=rowsFor(documentRows).find(row=>row.id===id);assert.ok(row);return{data:{...row,content:'Exact document '+row.id,sha256:'synthetic-sha256'}};}
  if(path==='system')return{data:{backup:structuredClone(backup),security:{},storage:{privateFiles:true}}};
  if(path==='system/backups')return{data:[{date:'2026-11-04T07:00:00Z',filename:'backup-synthetic-format5.json',verified:true}]};
  throw Error('Unexpected API '+path);
 };
 globalThis.document={addEventListener(name,handler){(listeners[name]??=[]).push(handler);}};
 globalThis.location={origin:'https://workspace.synthetic.invalid',hash:'#'+tab+(params?'?'+params:'')};
 globalThis.history={replaceState(unusedState,unusedTitle,url){historyCalls.push(url);globalThis.location.hash=url;}};
 const t=key=>({verified:lang==='zh'?'已验证':'Verified',noBackup:lang==='zh'?'尚无备份':'No backup',notYetVerified:lang==='zh'?'尚未验证':'Not yet verified'}[key]||key);
 const controller=createIntelligenceController({state,page,dialog,api:async(path,options={})=>{calls.push({path,method:options.method||'GET'});assert.equal(options.method||'GET','GET','Content rendering must never change data.');if(path==='system/backups'&&historyError)throw Error(historyError);return demo?demo.api(path,options):fixture(path);},esc,icon:()=>'',heading:(title,description,actions='')=>'<header><h1>'+esc(title)+'</h1>'+actions+'</header>',navigate(){throw Error('Rendering must not navigate.');},pagination:meta=>'<footer data-row-total="'+Number(meta.total||0)+'"></footer>',toast:message=>toasts.push(message),can:()=>true,confirmAction:async()=>true,showDialog(html){dialog.innerHTML=html;dialog.open=true;},dialogHeader:title=>'<header><h2>'+esc(title)+'</h2></header>',setFormBusy(){},showFormError(){},date:value=>String(value||'—'),t});
 await controller.loadPage(state.params);
 const buttons=()=>[...page.innerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([,source,html])=>{const a=attrs(source);return{attributes:a,dataset:{ai:a['data-ai'],id:a['data-id']},label:decode(html.replace(/<[^>]*>/g,'')),disabled:false,isConnected:true};});
 const click=async button=>{for(const handler of listeners.click||[])handler({target:{closest:selector=>selector==='[data-ai]'?button:null}});await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(toasts,[]);};
 return{state,page,calls,controller,demo,dialog,buttons,click,historyCalls};
}
const assertBoundary=html=>{
 const match=html.match(/<p class="wb-muted backup-recovery-note">([\s\S]*?)<\/p>/);assert.ok(match);assert.doesNotMatch(match[0],/\bhidden\b/);assert.ok(!html.includes('<details'),'Recovery boundaries and current status must remain visible.');
 assert.ok(html.indexOf('backup-recovery-note')>html.indexOf('panel-heading'));return match[1];
};
async function test(name,fn){try{await fn();results.push({name,passed:true});}catch(error){failures.push({name,error:error.message});results.push({name,passed:false});}}

try{
 await test('local document setup is a native closed disclosure while privacy and credential boundaries remain visible siblings',async()=>{
  for(const lang of ['en','zh'])for(const role of ['owner','manager','sales','viewer']){
   const h=await harness({lang,role}),html=h.page.innerHTML,match=html.match(/<details class="knowledge-collector-setup"([^>]*)>([\s\S]*?)<\/details>/);
   assert.ok(match);assert.doesNotMatch(match[1],/\bopen\b/);assert.match(match[2],lang==='zh'?/本地文档文件夹/:/Local document folder/);assert.match(match[2],/href="\/admin\/assets\/local-source-sync\.mjs" download="local-source-sync\.mjs"/);assert.ok(match[2].includes(esc('node local-source-sync.mjs --url https://workspace.synthetic.invalid --folder "D:/Your knowledge" --entity documents --interval 15')));
   const outside=html.replace(match[0],'');assert.match(outside,lang==='zh'?/不会调用外部模型/:/It does not call an external model/);assert.match(outside,/GYUTRON_ADMIN_PASSWORD/);assert.match(outside,lang==='zh'?/仅通过环境变量提供/:/Environment variable only/);assert.ok(!outside.includes('knowledge-collector-setup'));assert.ok(h.calls.every(call=>call.method==='GET'));
  }
 });
 await test('document and memory records, search and existing role-limited editing survive the setup disclosure',async()=>{
  for(const lang of ['en','zh'])for(const role of ['owner','manager','sales','viewer'])for(const documents of [true,false]){
   const h=await harness({lang,role,params:documents?'kind=documents':''}),html=h.page.innerHTML,rows=documents?documentRows:memoryRows;
   for(const row of rows){assert.ok(html.includes(esc(row.title)));assert.match(html,new RegExp('data-ai="memory-detail" data-id="'+row.id+'"'));}
   assert.ok(html.includes('data-ai-form="memory-search"'));assert.ok(html.includes('data-row-total="'+rows.length+'"'));assert.equal(html.includes('data-ai="new-memory"'),role!=='viewer');assert.equal(html.includes('data-ai="edit-memory"'),['owner','manager'].includes(role));if(!documents)assert.ok(!html.includes('knowledge-collector-setup'));
  }
 });
 await test('backup recovery boundary is complete and always visible after history without an extra panel heading in both data modes',async()=>{
  for(const lang of ['en','zh'])for(const testMode of [false,true]){
   const h=await harness({lang,tab:'backup',params:'',testMode}),html=h.page.innerHTML;assert.equal(assertBoundary(html),boundary[lang]);assert.ok(!html.includes(lang==='zh'?'<span>恢复边界</span>':'<span>Recovery boundary</span>'));assert.ok(html.includes('data-ai="backup"'));assert.ok(html.includes('data-ai="verify-backup"'));
   if(testMode){assert.match(html,/data-demo-action="export"/);assert.ok(!html.includes('href="/admin/api/system/backups/'));assert.match(html,lang==='zh'?/当前样本/:/Current sample/);}else{assert.match(html,/href="\/admin\/api\/system\/backups\/backup-synthetic-format5\.json\/sql"/);assert.match(html,lang==='zh'?/有效/:/Current/);}
  }
 });
 await test('backup load errors, missing snapshots and stale freshness remain visible and private history is owner-only',async()=>{
  for(const lang of ['en','zh'])for(const role of ['owner','manager','viewer']){
   const message='Synthetic history <failure> & retry',h=await harness({lang,role,tab:'backup',params:'',historyError:message,backup:{status:'verified',stale:true,retentionOk:false,schemaVersion:5}}),html=h.page.innerHTML;
   assert.equal(assertBoundary(html),boundary[lang]);assert.match(html,lang==='zh'?/已过期/:/Out of date/);assert.equal(h.calls.some(call=>call.path==='system/backups'),role==='owner');assert.equal(html.includes('data-ai="backup"'),role==='owner');if(role==='owner'){assert.ok(html.includes(esc(message)));assert.match(html,/<div class="error-banner"[^>]*role="alert"/);}else{assert.ok(!html.includes(esc(message)));assert.ok(!html.includes('data-ai="verify-backup"'));}
   const missing=await harness({lang,role,tab:'backup',params:'',backup:{status:'none',stale:false}});assert.match(missing.page.innerHTML,lang==='zh'?/尚无备份/:/No backup/);assert.equal(assertBoundary(missing.page.innerHTML),boundary[lang]);
  }
 });
 await test('the real Test adapter retains knowledge rows and simulation boundaries with no collector download or network fallback',async()=>{
  for(const lang of ['en','zh'])for(const documents of [true,false]){
   const h=await harness({lang,testMode:true,params:documents?'kind=documents':''}),resource=documents?'documents':'memory',before=await h.demo.api('intelligence/'+resource+'?page_size=25');assert.ok(before.data.length);for(const row of before.data)assert.ok(h.page.innerHTML.includes(esc(row.title)));assert.ok(!h.page.innerHTML.includes('knowledge-collector-setup'));assert.ok(!h.page.innerHTML.includes('download="local-source-sync.mjs"'));assert.ok(h.calls.every(call=>call.method==='GET'));const after=await h.demo.api('intelligence/'+resource+'?page_size=25');assert.deepEqual(after,before);
  }
 });
 await test('escaped knowledge titles provide one read-details action and open the exact second record without changing scope or write permissions',async()=>{
  for(const lang of ['en','zh'])for(const role of ['owner','manager','viewer'])for(const documents of [true,false])for(const archived of [false,true]){
   const params=new URLSearchParams({q:'retained query',...(documents?{kind:'documents'}:{}),...(archived?{archived:'true'}:{})}),h=await harness({lang,role,params:params.toString()}),rows=documents?documentRows:memoryRows,html=h.page.innerHTML,details=h.buttons().filter(button=>button.dataset.ai==='memory-detail');
   assert.equal(details.length,rows.length);assert.ok(details.every(button=>button.attributes.class.includes('knowledge-record-name')));for(const row of rows){assert.ok(html.includes(esc(row.title)));assert.equal(details.filter(button=>button.dataset.id===row.id).length,1);}
   const second=rows[1],button=details.find(button=>button.dataset.id===second.id);assert.equal(button.label,second.title);assert.ok(!html.includes('<verified>'));assert.ok(!html.includes('<exact>'));const edits=h.buttons().filter(button=>button.dataset.ai==='edit-memory'),restores=h.buttons().filter(button=>button.dataset.ai==='restore-memory');assert.equal(edits.length,role!=='viewer'&&!archived?rows.length:0);assert.equal(restores.length,role!=='viewer'&&archived?rows.length:0);
   const before=h.calls.length;await h.click(button);assert.equal(h.dialog.open,true);assert.equal(h.state.modal.row.id,second.id);assert.equal(h.state.params.get(documents?'document':'record'),second.id);assert.equal(h.state.params.get('q'),'retained query');assert.equal(h.state.params.get('archived'),archived?'true':null);assert.equal(h.state.params.get('kind'),documents?'documents':null);assert.ok(h.dialog.innerHTML.includes(esc(second.title)));assert.ok(h.dialog.innerHTML.includes(documents?'Exact document '+second.id:second.content));assert.equal(button.disabled,false);assert.ok(h.historyCalls.at(-1).startsWith('#memory?'));assert.equal(h.calls.length,before+(documents?1:0));if(documents)assert.equal(h.calls.at(-1).path,'intelligence/documents/'+second.id);assert.ok(h.calls.every(call=>call.method==='GET'));
  }
 });
 await test('real Test-mode memory and document title clicks retain the existing exact detail and local-only route',async()=>{
  for(const lang of ['en','zh'])for(const documents of [true,false]){
   const h=await harness({lang,testMode:true,params:documents?'kind=documents':''}),resource=documents?'documents':'memory',rows=(await h.demo.api('intelligence/'+resource+'?page_size=25')).data;assert.ok(rows.length>=2);const row=rows[1],details=h.buttons().filter(button=>button.dataset.ai==='memory-detail');assert.equal(details.length,rows.length);const button=details.find(button=>button.dataset.id===row.id);assert.ok(button);assert.equal(button.label,row.title);await h.click(button);assert.equal(h.state.modal.row.id,row.id);assert.equal(h.state.params.get(documents?'document':'record'),row.id);assert.ok(h.dialog.innerHTML.includes(esc(row.title)));assert.ok(h.calls.every(call=>call.method==='GET'));assert.deepEqual((await h.demo.api('intelligence/'+resource+'?page_size=25')).data,rows);
  }
 });
}finally{for(const[key,value]of Object.entries(prior)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
console.log(JSON.stringify({suite:'intelligence-content',passed:results.filter(row=>row.passed).length,failed:failures.length,emitted_controller:true,actual_demo_adapter:true,permissions:'synthetic API fixture; the real Test adapter keeps its owner identity',network_attempts:attempts,production_accessed:false,browser_used:false,results,failures},null,2));
if(failures.length||attempts.length)process.exitCode=1;
