/** Executes the emitted operations controller with synthetic records; no browser or live API. */
import assert from 'node:assert/strict';
import {OPERATIONS_CLIENT} from '../src/admin/operations-client.mjs';
import {WORKBENCH_CLIENT} from '../src/admin/workbench-ui.mjs';
import {DEMO_CLIENT} from '../src/admin/demo-client.mjs';

const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {createOperationsController}=await import(moduleUrl(OPERATIONS_CLIENT.replace("'/admin/assets/workbench.js'",JSON.stringify(moduleUrl(WORKBENCH_CLIENT)))));
const {createDemoWorkspace}=await import(moduleUrl(DEMO_CLIENT));
const prior={document:globalThis.document,fetch:globalThis.fetch};
const networkAttempts=[],results=[],failures=[];
globalThis.fetch=async value=>{networkAttempts.push(String(value));throw Error('No network is allowed in content regression.');};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=value=>String(value).replace(/&(amp|lt|gt|quot|#39);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[key]));
const attrs=html=>Object.fromEntries([...html.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,key,value])=>[key,decode(value)]));
const text=html=>decode(String(html).replace(/<[^>]*>/g,''));
const at='2026-11-04T08:00:00.000Z';
const fixtureReports=[{id:'REPORT-FIRST',title:'October <actual> & records',type:'daily',status:'ready',created_at:at,filters:{from:'2026-10-01',to:'2026-10-31',source_id:'SOURCE-A',currency:'USD'},content_markdown:'# Saved report\nExact first report'},{id:'REPORT-SECOND',title:'November <forecast> & records',type:'weekly',status:'ready',created_at:at,filters:{from:'2026-11-01',to:'2026-11-04',currency:'EUR'},content_markdown:'# Saved report\nExact second report'}];
const fixtureAutomations=[{id:'AUTOMATION-FIRST',name:'Website source <check>',kind:'native_sync',enabled:true,interval_minutes:60,version:3,config:{source_id:'SOURCE-A'}},{id:'AUTOMATION-SECOND',name:'Daily <owner> & report',kind:'report',enabled:false,interval_minutes:1440,version:7,config:{daily_at:'08:15',report_type:'daily',language:'zh',currency:'EUR'}}];

// Only the native form properties read by scheduleFields are needed; submitted data is never sent.
function formFromHtml(html){
 const fields=new Map();
 const make=(name,value)=>{const wrapper={hidden:false};return{name,value,validity:'',closest:selector=>selector==='.form-field'?wrapper:null,setCustomValidity(value){this.validity=value;}};};
 for(const [,source]of html.matchAll(/<input\b([^>]*)>/g)){const a=attrs(source);if(a.name)fields.set(a.name,make(a.name,a.value||''));}
 for(const [,source,body]of html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)){const a=attrs(source),options=[...body.matchAll(/<option\b([^>]*)>/g)],chosen=options.find(row=>/\bselected\b/.test(row[1]))||options[0];if(a.name)fields.set(a.name,make(a.name,attrs(chosen?.[1]||'').value||''));}
 const form={querySelector:selector=>fields.get(selector.match(/^\[name=([^\]]+)\]$/)?.[1])||null};
 for(const field of fields.values())field.form=form;
 return form;
}

async function harness({lang='en',role='owner',tab='reports',testMode=false}={}){
 const listeners={},calls=[],toasts=[],modals=[];
 const page={innerHTML:'',contains(){return true;}},dialog={dataset:{},innerHTML:'',form:null,querySelector(selector){return selector==='[data-op-form=automation]'?this.form:null;}};
 const state={tab,lang,params:new URLSearchParams(),principal:{id:role==='owner'?'owner':'reader',role},timezone:'Asia/Singapore',testMode};
 let demo,reports=structuredClone(fixtureReports),automations=structuredClone(fixtureAutomations);
 if(testMode){
  demo=createDemoWorkspace({now:()=>Date.parse(at),language:()=>lang});
  reports=(await demo.api('operations/reports?limit=100')).data;
  automations=(await demo.api('operations/automations?limit=100')).data;
  assert.ok(reports.length>=2,'The shared Test adapter must supply saved reports.');
  assert.ok(new Set(automations.map(row=>row.kind)).size>=2,'The Test adapter must supply different automation kinds.');
 }
 const fixture=async path=>{
  if(path==='operations/meta')return{data:{ruleTemplates:[],currencies:['USD','EUR']}};
  if(path.startsWith('operations/sources'))return{data:[{id:'SOURCE-A',name:'Source A',kind:'native_website'}]};
  if(path.startsWith('operations/reports?'))return{data:structuredClone(reports),meta:{total:reports.length}};
  if(path.startsWith('operations/reports/')){const row=reports.find(row=>row.id===decodeURIComponent(path.slice('operations/reports/'.length)));assert.ok(row);return{data:structuredClone(row)};}
  if(path.startsWith('operations/automations?'))return{data:structuredClone(automations),meta:{total:automations.length}};
  if(path.startsWith('operations/runs?'))return{data:[],meta:{total:0}};
  throw Error('Unexpected API '+path);
 };
 globalThis.document={addEventListener(name,handler){(listeners[name]??=[]).push(handler);}};
 const controller=createOperationsController({state,page,dialog,api:async(path,options={})=>{calls.push({path,method:options.method||'GET'});assert.equal(options.method||'GET','GET','Opening a record must not write.');return testMode?demo.api(path,options):fixture(path);},esc,icon:()=>'',heading:(title,description,actions='')=>'<header><h1>'+esc(title)+'</h1>'+actions+'</header>',navigate(){throw Error('A name click must use its existing edit or native record route.');},pagination:()=>'',money:String,date:value=>String(value||''),can:permission=>role==='owner'||permission!=='write',t:key=>key,toast:message=>toasts.push(message),showDialog(html){dialog.innerHTML=html;dialog.form=formFromHtml(html);modals.push(html);},dialogHeader:title=>'<h2>'+esc(title)+'</h2>',confirmAction:async()=>true,setFormBusy(){},showFormError(){}});
 const load=async(params='')=>{state.params=new URLSearchParams(params);await controller.loadPage(state.params);};
 const buttons=()=>[...page.innerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([,source,html])=>{const a=attrs(source);return{attributes:a,dataset:{op:a['data-op'],id:a['data-id']},label:text(html),disabled:false,isConnected:true};});
 const click=async button=>{const child={closest:selector=>selector==='[data-op]'?button:null};for(const handler of listeners.click||[])handler({target:child});await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(toasts,[]);};
 return{controller,state,page,dialog,calls,modals,reports,automations,load,buttons,click};
}
async function test(name,fn){try{await fn();results.push({name,passed:true});}catch(error){failures.push({name,error:error.message});results.push({name,passed:false});}}

try{
 await test('report filter guidance is a closed native disclosure while filters, error target and each saved scope stay outside it',async()=>{
  for(const lang of ['en','zh'])for(const testMode of [false,true]){
   const h=await harness({lang,testMode});await h.load('from=2026-11-01&to=2026-11-04');
   const html=h.page.innerHTML,match=html.match(/<details class="operations-context-help"([^>]*)>([\s\S]*?)<\/details>/);
   assert.ok(match);assert.doesNotMatch(match[1],/\bopen\b/);assert.match(match[2],lang==='zh'?/报表筛选说明/:/About report filters/);assert.match(match[2],lang==='zh'?/完全一致/:/match exactly/);
   assert.match(html,/<form data-op-form="filters"/);assert.match(html,/<div id="ops-filter-error"[^>]*role="alert" hidden>/);assert.ok(!match[2].includes('data-op-form="filters"'));assert.ok(!match[2].includes('data-ops-filter-error'));
   assert.ok(html.indexOf('data-op-form="filters"')<match.index);assert.ok(html.includes('2026-11-01'));assert.ok(html.includes('2026-11-04'));assert.ok(!h.calls.some(call=>call.method!=='GET'));
  }
 });
 await test('report titles are the only per-record detail links and open the exact existing controller route without changing saved scope',async()=>{
  for(const lang of ['en','zh'])for(const testMode of [false,true]){
   const h=await harness({lang,testMode});await h.load();const reportsBefore=structuredClone(h.reports),anchors=[...h.page.innerHTML.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([,source,html])=>({attributes:attrs(source),label:text(html)})).filter(row=>row.attributes.class?.includes('operations-record-name'));
   assert.equal(anchors.length,h.reports.length);for(const row of h.reports){const anchor=anchors.find(anchor=>anchor.label===row.title);assert.ok(anchor);const route=new URLSearchParams(anchor.attributes.href.split('?')[1]);assert.equal(anchor.attributes.href.split('?')[0],'#reports');assert.equal(route.get('id'),row.id);assert.equal([...h.page.innerHTML.matchAll(/href="([^"]*)"/g)].filter(([,href])=>decode(href)===anchor.attributes.href).length,1);}
   const row=h.reports.at(-1),anchor=anchors.find(anchor=>anchor.label===row.title);await h.load(anchor.attributes.href.split('?')[1]);assert.ok(h.calls.some(call=>call.path==='operations/reports/'+encodeURIComponent(row.id)));assert.ok(h.page.innerHTML.includes(esc(row.id)));assert.ok(h.page.innerHTML.includes(esc(row.filters.from)));assert.ok(h.page.innerHTML.includes(esc(row.filters.to)));assert.deepEqual(h.reports,reportsBefore);assert.ok(h.calls.every(call=>call.method==='GET'));
  }
 });
 await test('the second automation name edits that exact record and kind through the delegated existing action with no duplicate Edit control',async()=>{
  for(const lang of ['en','zh'])for(const role of ['owner','manager'])for(const testMode of [false,true]){
   const h=await harness({lang,role,tab:'automations',testMode});await h.load();const first=h.automations[0],second=h.automations.find(row=>row.kind!==first.kind);assert.ok(second);
   const editButtons=h.buttons().filter(button=>button.dataset.op==='edit-automation');assert.equal(editButtons.length,h.automations.length);const button=editButtons.find(button=>button.dataset.id===second.id);assert.ok(button);assert.equal(button.label,second.name);assert.ok(button.attributes['aria-label'].includes(second.name));assert.ok(h.buttons().some(button=>button.dataset.op==='run'&&button.dataset.id===second.id));assert.ok(h.buttons().some(button=>button.dataset.op==='toggle'&&button.dataset.id===second.id));
   const requestCount=h.calls.length;await h.click(button);assert.equal(h.modals.length,1);assert.equal(h.state.operationsEdit.id,second.id);assert.equal(h.dialog.form.querySelector('[name=name]').value,second.name);assert.equal(h.dialog.form.querySelector('[name=kind]').value,second.kind);assert.equal(h.calls.length,requestCount);assert.equal(h.controller.isBusy(),false);
  }
 });
 await test('viewer automation names remain plain read-only records with no edit, run or toggle button',async()=>{
  for(const lang of ['en','zh'])for(const testMode of [false,true]){const h=await harness({lang,role:'viewer',tab:'automations',testMode});await h.load();for(const row of h.automations)assert.ok(h.page.innerHTML.includes(esc(row.name)));assert.ok(!h.buttons().some(button=>['edit-automation','run','toggle'].includes(button.dataset.op)));assert.equal(h.modals.length,0);assert.ok(h.calls.every(call=>call.method==='GET'));}
 });
}finally{for(const[key,value]of Object.entries(prior)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
console.log(JSON.stringify({suite:'operations-record-content',passed:results.filter(row=>row.passed).length,failed:failures.length,emitted_controller:true,actual_demo_adapter:true,network_attempts:networkAttempts,production_accessed:false,browser_used:false,results,failures},null,2));
if(failures.length||networkAttempts.length)process.exitCode=1;
