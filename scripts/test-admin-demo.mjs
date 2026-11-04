/** Independent client-only demo contract/isolation review. No browser or live service. */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readWorkspaceTestMode,createWorkspaceTransport,switchWorkspaceTestMode} from '../src/admin/test-mode.mjs';
import {STAGES,CURRENCIES,CUSTOMER_STATUSES,TASK_STATUSES,TASK_PRIORITIES,ACTIVITY_TYPES} from '../src/platform/crm/schema.mjs';
import {STATUS_VALUES} from '../src/platform/schemas.mjs';

// Execute the real browser ESM, retaining its export semantics and denying imports.
if (typeof vm.SourceTextModule !== 'function') {
  const child=spawnSync(process.execPath,['--experimental-vm-modules',fileURLToPath(import.meta.url)],{stdio:'inherit'});
  process.exit(child.status??1);
}
const attempts=[];
const deny=kind=>(...args)=>{attempts.push({kind,target:String(args[0]??'').slice(0,180)});throw Error('DEMO_ISOLATION_FORBIDDEN: '+kind);};
const forbiddenStore={getItem:deny('storage.read'),setItem:deny('storage.write'),removeItem:deny('storage.remove'),clear:deny('storage.clear')};
const scope=vm.createContext({URL,URLSearchParams,TextEncoder,TextDecoder,AbortController,AbortSignal,DOMException,Blob,structuredClone,crypto:{randomUUID},
  fetch:deny('fetch'),XMLHttpRequest:deny('XMLHttpRequest'),WebSocket:deny('WebSocket'),EventSource:deny('EventSource'),
  navigator:{sendBeacon:deny('beacon')},localStorage:forbiddenStore,sessionStorage:forbiddenStore,indexedDB:{open:deny('indexedDB')},caches:{open:deny('cache')},
  console:{log(){},warn(){},error(){}},setTimeout,clearTimeout,
},{codeGeneration:{strings:false,wasm:false}});
const {DEMO_CLIENT}=await import('../src/admin/demo-client.mjs');
assert.equal(typeof DEMO_CLIENT,'string','Serve a real ESM demo asset.');
const emitted=new vm.SourceTextModule(DEMO_CLIENT,{context:scope,identifier:'shipped-demo.mjs',importModuleDynamically:deny('dynamic import')});
await emitted.link(deny('module import'));
await emitted.evaluate({timeout:5000});
const {createDemoWorkspace}=emitted.namespace;
assert.equal(typeof createDemoWorkspace,'function');
const plain=value=>JSON.parse(JSON.stringify(value));
const now=()=>Date.parse('2026-11-04T08:30:00.000Z');
let language='en';
const fresh=()=>createDemoWorkspace({now,language:()=>language});
const failures=[];let passed=0;
async function test(name,run){try{await run();passed++;}catch(error){failures.push({name,error:String(error.message),stack:String(error.stack||'').slice(0,1100)});}}
const id=row=>row?.public_id||row?.id;
const list=async(workspace,path)=>{const packet=await workspace.api(path);assert.ok(packet&&Array.isArray(packet.data),path+' must return a data array');return packet;};
const one=async(workspace,path)=>{const packet=await workspace.api(path);assert.ok(packet&&packet.data&&typeof packet.data==='object',path+' must return a data object');return packet.data;};
const send=(workspace,path,method,body)=>workspace.api(path,{method,body});
async function rejects(workspace,path,method,body,status){await assert.rejects(()=>send(workspace,path,method,body),error=>{assert.equal(error.status,status);assert.equal(typeof error.code,'string');assert.ok(error.code);return true;});}
const quoteInput=(customer,overrides={})=>({customer_id:id(customer),title:'Independent synthetic proposal',currency:'USD',seller_name:'Synthetic seller',recipient_company:customer.name,
  items:[{sku:'QA-SCOPE',description:'Synthetic inspection scope',unit:'pcs',quantity:3,unit_price_minor:1999}],discount_minor:100,tax_minor:500,shipping_minor:175,
  terms:'Fictional test terms. No external delivery or payment.',notes:'Printed synthetic note',...overrides});

const MODULE_REQUESTS={
  overview:['dashboard'],analytics:['operations/meta','operations/sources?limit=100','operations/analytics'],
  customers:['customers?limit=25'],pipeline:['opportunities?limit=25'],quotes:['quotes?limit=25'],tasks:['tasks?limit=25'],
  inbox:['intake?resource=leads&limit=25'],activity:['activities?limit=25'],sources:['operations/sources?limit=100','operations/imports','operations/sync-runs'],
  reports:['operations/reports'],automations:['operations/automations','operations/runs'],rules:['operations/rules'],
  agent:['intelligence/status','intelligence/conversations?limit=50','intelligence/documents?page=1&page_size=100'],
  memory:['intelligence/status','intelligence/memory?page=1&page_size=25'],models:['intelligence/models','intelligence/models/usage'],
  users:['system','team'],security:['system'],backup:['system','system/backups'],license:['intelligence/license','intelligence/license/history'],
  health:['system'],audit:['audit?limit=25'],settings:['system','team'],
};

await test('explicit test URL wins over stored mode, invalid inputs never enable testing implicitly',()=>{
  assert.equal(readWorkspaceTestMode('https://ops.example.test/admin?test=1',()=> '0'),true);
  assert.equal(readWorkspaceTestMode('https://ops.example.test/admin?test=0',()=> '1'),false);
  assert.equal(readWorkspaceTestMode('https://ops.example.test/admin',()=> '1'),true);
  for(const value of ['true','yes','on','constructor','__proto__',''])assert.equal(readWorkspaceTestMode('https://ops.example.test/admin?test='+value,()=> '1'),false);
  assert.equal(readWorkspaceTestMode('https://ops.example.test/admin',()=>{throw Error('Storage denied');}),false);
});

await test('demo transport routes every verb locally and never falls through on unknown routes or load failures',async()=>{
  let live=0;const local=[];let writes=0;
  const request=createWorkspaceTransport({demo:true,loadDemo:async()=>({api:async(path,opts)=>{local.push([path,opts.method||'GET']);if(path==='unknown')throw Object.assign(Error('Unknown'),{status:404,code:'NOT_FOUND'});return{data:{demo:true}};}}),liveRequest:async()=>{live++;throw Error('Real API must not run');},onWrite:n=>{writes+=n;assert.ok(writes>=0);}});
  for(const method of ['GET','HEAD','POST','PATCH','PUT','DELETE'])assert.equal((await request('synthetic',{method})).data.demo,true);
  await assert.rejects(()=>request('unknown',{method:'POST'}));assert.equal(local.length,7);assert.equal(live,0);assert.equal(writes,0);
  const unavailable=createWorkspaceTransport({demo:true,loadDemo:async()=>{throw Error('Demo asset unavailable');},liveRequest:()=>{live++;},onWrite:n=>writes+=n});
  await assert.rejects(()=>unavailable('customers',{method:'POST'}));assert.equal(live,0);assert.equal(writes,0);
});

await test('demo transport aborts stale results, never executes an aborted queued mutation, and balances write state',async()=>{
  let release,entered=0,writes=0,blocked=false;
  const request=createWorkspaceTransport({demo:true,loadDemo:()=>new Promise(resolve=>{release=resolve;}),liveRequest:deny('live fallback'),blocked:()=>blocked,onWrite:n=>writes+=n});
  const pending=request('customers',{method:'POST'});assert.equal(writes,1);blocked=true;release({api:()=>{entered++;}});
  await assert.rejects(()=>pending,error=>error.name==='AbortError');assert.equal(entered,0);assert.equal(writes,0);
  let finish;blocked=false;
  const inFlight=createWorkspaceTransport({demo:true,loadDemo:async()=>({api:()=>new Promise(resolve=>{finish=resolve;})}),liveRequest:deny('live fallback'),blocked:()=>blocked,onWrite:n=>writes+=n});
  const active=inFlight('customers',{method:'POST'});await Promise.resolve();assert.equal(typeof finish,'function');blocked=true;finish({data:{committedLocally:true}});
  await assert.rejects(()=>active,error=>error.name==='AbortError');assert.equal(writes,0);
});

await test('live transport never instantiates a demo adapter and counts active writes through rejection',async()=>{
  let adapters=0,writes=0,finish;
  const request=createWorkspaceTransport({demo:false,loadDemo:()=>{adapters++;throw Error('Must not load');},liveRequest:()=>new Promise((_,reject)=>{finish=reject;}),onWrite:n=>writes+=n});
  const pending=request('tasks/X',{method:'PATCH',body:{version:1,status:'done'}});assert.equal(writes,1);finish(Error('Synthetic live transport error'));await assert.rejects(()=>pending);assert.equal(writes,0);assert.equal(adapters,0);
});

await test('mode switching blocks busy writes and dirty cancellation without reload or discarded state',async()=>{
  for(const scenario of [{writes:1,busy:false,leave:true,reason:'busy'},{writes:0,busy:true,leave:true,reason:'busy'},{writes:0,busy:false,leave:false,reason:'declined'}]){
    const calls=[];const result=await switchWorkspaceTestMode({enabled:true,href:'https://ops.example.test/admin#customers?record=REAL',activeWrites:()=>scenario.writes,isBusy:()=>scenario.busy,canLeave:async()=>{calls.push('leave');return scenario.leave;},discard:()=>calls.push('discard'),persist:()=>calls.push('persist'),reload:()=>calls.push('reload')});
    assert.equal(result.changed,false);assert.equal(result.reason,scenario.reason);assert.ok(!calls.includes('discard')&&!calls.includes('reload')&&!calls.includes('persist'));
  }
});

await test('write beginning while a leave confirmation is pending prevents the later reload',async()=>{
  let writes=0,release;const effects=[];const pending=switchWorkspaceTestMode({enabled:true,href:'https://ops.example.test/admin#quotes?id=REAL',activeWrites:()=>writes,isBusy:()=>false,canLeave:()=>new Promise(resolve=>release=resolve),discard:()=>effects.push('discard'),persist:()=>effects.push('persist'),reload:()=>effects.push('reload')});
  writes=1;release(true);assert.equal((await pending).reason,'busy');assert.deepEqual(effects,[]);
});

await test('both mode transitions reload a clean route; denied storage still uses the authoritative URL',async()=>{
  for(const enabled of [true,false]){
    const effects=[];const result=await switchWorkspaceTestMode({enabled,href:'https://ops.example.test/admin?lang=zh&test='+(enabled?'0':'1')+'#customers?record=PRIVATE-ID&view_id=OTHER-MODE',activeWrites:()=>0,isBusy:()=>false,canLeave:async()=>true,discard:()=>effects.push('discard'),persist:()=>{effects.push('persist');throw Error('Storage denied');},reload:url=>effects.push(url)});
    assert.equal(result.changed,true);assert.equal(effects[0],'discard');assert.equal(effects[1],'persist');const target=effects[2];assert.equal(typeof target,'string');assert.ok(!target.includes('PRIVATE-ID')&&!target.includes('OTHER-MODE'));assert.equal(target,'/admin?lang=zh&test='+(enabled?'1':'0')+'#customers');
  }
});

await test('real navigation registry requires demo data for every module, including future additions',async()=>{
  const {renderAdminWorkspace}=await import('../src/admin/shell.mjs');
  const shell=renderAdminWorkspace({principal:{id:'qa-owner',name:'Synthetic QA',role:'owner'}});
  const navigation=[...shell.matchAll(/data-nav="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(navigation.length>=22);assert.equal(new Set(navigation).size,navigation.length);
  const w=fresh();assert.deepEqual([...w.modules].sort(),[...navigation].sort());
  assert.deepEqual(Object.keys(MODULE_REQUESTS).sort(),[...navigation].sort(),'Add explicit endpoint contract assertions for a newly added module.');
  for(const module of navigation)for(const path of MODULE_REQUESTS[module]){
    const packet=await w.api(path);assert.ok(packet&&Object.hasOwn(packet,'data'),module+': '+path+' has no JSON data envelope');
    assert.ok(packet.data!==null&&packet.data!==undefined,module+': '+path+' must not fake successful null data');
    if(Array.isArray(packet.data))assert.ok(packet.data.length>0,module+': '+path+' has no seeded data');
  }
});

await test('module execution and all controller endpoints use zero network or persistent storage',async()=>{
  const w=fresh();for(const paths of Object.values(MODULE_REQUESTS))for(const path of paths)await w.api(path);
  assert.deepEqual(attempts,[]);
  for(const name of ['api','reset','exportData','printQuote'])assert.equal(typeof w[name],'function',name);
});

await test('seeded customer/opportunity/task/activity relations resolve to actual records',async()=>{
  const w=fresh(),customers=(await list(w,'customers?limit=100')).data,opportunities=(await list(w,'opportunities?limit=100')).data;
  assert.ok(customers.length>=40);assert.ok(opportunities.length>=60);
  const customerIds=new Set(customers.map(id)),opportunityIds=new Set(opportunities.map(id));
  for(const row of customers)assert.ok(CUSTOMER_STATUSES.includes(row.status));
  for(const row of opportunities){assert.ok(customerIds.has(row.customer_id),'Dangling opportunity customer');assert.ok(Number.isSafeInteger(row.amount_minor));assert.ok(STAGES.includes(row.stage));assert.ok(CURRENCIES.includes(row.currency));}
  const tasks=(await list(w,'tasks?limit=100')).data,activities=(await list(w,'activities?limit=100')).data;
  assert.ok(tasks.length>=50);assert.ok(activities.length>0);
  for(const row of tasks){assert.ok(TASK_STATUSES.includes(row.status));assert.ok(TASK_PRIORITIES.includes(row.priority));}
  for(const row of activities)assert.ok(ACTIVITY_TYPES.includes(row.type));
  for(const row of [...tasks,...activities]){if(row.customer_id)assert.ok(customerIds.has(row.customer_id));if(row.opportunity_id){assert.ok(opportunityIds.has(row.opportunity_id));const opportunity=opportunities.find(o=>id(o)===row.opportunity_id);if(row.customer_id)assert.equal(row.customer_id,opportunity.customer_id);}}
  for(const path of ['leads','rfqs','support','downloads']){const rows=(await list(w,'intake?resource='+path+'&limit=25')).data;assert.ok(rows.length>0,path+' needs synthetic examples');const table={leads:'leads',rfqs:'rfqs',support:'support_requests',downloads:'download_requests'}[path];for(const row of rows){assert.ok(STATUS_VALUES[table].includes(row.status),path+' contains a non-production state '+row.status);if(row.customer_id)assert.ok(customerIds.has(row.customer_id));if(row.opportunity_id)assert.equal(opportunities.find(o=>id(o)===row.opportunity_id)?.customer_id,row.customer_id,'Converted inbox item links to a different customer.');}}
});

await test('pagination, search and filters operate on the whole synthetic set',async()=>{
  const w=fresh(),a=await list(w,'customers?page=1&limit=7'),b=await list(w,'customers?page=2&limit=7');
  assert.equal(a.data.length,7);assert.equal(b.data.length,7);assert.ok(a.meta.total>14);assert.equal(a.meta.page,1);assert.equal(b.meta.page,2);
  assert.ok(!a.data.some(x=>b.data.some(y=>id(x)===id(y))),'Pages must not repeat the first records.');
  const target=b.data[3],search=await list(w,'customers?q='+encodeURIComponent(target.name));assert.ok(search.data.some(r=>id(r)===id(target)));
  const status=target.status,filtered=await list(w,'customers?status='+encodeURIComponent(status)+'&limit=100');assert.ok(filtered.data.length);assert.ok(filtered.data.every(r=>r.status===status));
  const byCustomer=await list(w,'opportunities?customer_id='+encodeURIComponent(id(target))+'&limit=100');assert.ok(byCustomer.data.every(r=>r.customer_id===id(target)));
  assert.equal((await list(w,'customers?q=INDEPENDENT_QA_DOES_NOT_EXIST_78934')).data.length,0);
});

await test('customer CRUD, CAS conflict, archive and restore persist only within one instance',async()=>{
  const w=fresh(),other=fresh();const payload={name:'Independent demo contract co',contact_name:'Synthetic reviewer',email:'independent@example.test',country:'SG',industry:'Automation',status:'active',notes:'Only in this demo instance'};
  const before=plain(payload),created=(await send(w,'customers','POST',payload)).data;assert.ok(id(created));assert.deepEqual(payload,before);
  let saved=(await send(w,'customers/'+id(created),'PATCH',{version:created.version,notes:'Changed locally'})).data;assert.equal(saved.notes,'Changed locally');assert.ok(saved.version>created.version);
  await rejects(w,'customers/'+id(created),'PATCH',{version:created.version,notes:'Must not overwrite'},409);
  assert.equal((await one(w,'customers/'+id(created))).notes,'Changed locally');
  assert.equal((await list(other,'customers?q=Independent%20demo%20contract')).data.length,0);
  saved=(await send(w,'customers/'+id(created),'DELETE',{version:saved.version})).data;assert.ok(saved.archived_at);
  assert.ok(!(await list(w,'customers?q=Independent%20demo%20contract')).data.some(r=>id(r)===id(created)));
  assert.ok((await list(w,'customers?archived=true&q=Independent%20demo%20contract')).data.some(r=>id(r)===id(created)));
  saved=(await send(w,'customers/'+id(created)+'/restore','POST',{version:saved.version})).data;assert.ok(!saved.archived_at);
  w.reset();assert.equal((await list(w,'customers?q=Independent%20demo%20contract')).data.length,0);
});

await test('callers cannot mutate internal records through returned envelopes or bootstrap references',async()=>{
  const w=fresh(),packet=await list(w,'customers?limit=25'),original=plain(packet.data[0]);packet.data[0].name='MUTATED RETURN';packet.data.push({public_id:'ghost'});packet.meta.total=0;
  assert.deepEqual(plain(await one(w,'customers/'+id(original))),original);
  const boot=await one(w,'bootstrap');boot.principal.role='viewer';boot.permissions={};assert.notEqual((await one(w,'bootstrap')).principal.role,'viewer');
});

await test('contacts and saved views support real versioned editing and customer relationships',async()=>{
  const w=fresh(),customer=(await list(w,'customers?limit=1')).data[0];
  let contact=(await send(w,'workspace/contacts','POST',{customer_id:id(customer),name:'Independent synthetic contact',email:'contact@example.test',job_title:'Engineering',is_primary:true})).data;
  assert.ok(id(contact));let related=await one(w,'workspace/record/customers/'+id(customer));assert.ok(related.related.contacts.some(c=>id(c)===id(contact)));
  contact=(await send(w,'workspace/contacts/'+id(contact),'PATCH',{version:contact.version,job_title:'Purchasing'})).data;assert.equal(contact.job_title,'Purchasing');
  const contacts=(await list(w,'workspace/contacts?customer_id='+encodeURIComponent(id(customer)))).data;assert.equal(contacts.filter(c=>c.is_primary&&!c.archived_at).length,1);
  let view=(await send(w,'workspace/views','POST',{resource:'customers',name:'Independent active accounts',visibility:'private',config:{filters:{status:'active'},columns:['name','status'],sort:'name',dir:'asc',limit:25}})).data;
  assert.ok(view.id);assert.ok((await list(w,'workspace/views?resource=customers')).data.some(v=>v.id===view.id));
  const oldVersion=view.version;view=(await send(w,'workspace/views/'+view.id,'PATCH',{version:view.version,name:'Renamed independent view'})).data;assert.equal(view.name,'Renamed independent view');
  await rejects(w,'workspace/views/'+view.id,'PATCH',{version:oldVersion,name:'Stale'},409);
  await send(w,'workspace/views/'+view.id,'DELETE',{version:view.version});assert.ok(!(await list(w,'workspace/views?resource=customers')).data.some(v=>v.id===view.id));
});

await test('bulk operations return per-record conflicts and honor the bounded five-record contract',async()=>{
  const w=fresh(),tasks=(await list(w,'tasks?limit=6')).data;
  const result=(await send(w,'workspace/bulk','POST',{resource:'tasks',action:'update',records:[{id:id(tasks[0]),version:tasks[0].version},{id:id(tasks[1]),version:tasks[1].version+100}],changes:{priority:'urgent'}})).data;
  assert.equal(result.results.length,2);assert.equal(result.results[0].ok,true);assert.equal(result.results[1].ok,false);assert.equal(result.results[1].error.code,'VERSION_CONFLICT');
  assert.equal((await one(w,'tasks/'+id(tasks[0]))).priority,'urgent');assert.equal((await one(w,'tasks/'+id(tasks[1]))).priority,tasks[1].priority);
  await rejects(w,'workspace/bulk','POST',{resource:'tasks',action:'update',records:tasks.map(t=>({id:id(t),version:t.version})),changes:{priority:'low'}},422);
});

await test('CSV preview does not import records; commit is idempotent and analytics reflects actual imported amounts',async()=>{
  const w=fresh(),source=(await send(w,'operations/sources','POST',{name:'Independent CSV sandbox',kind:'csv_generic'})).data;
  const csv='external_id,order_number,email,status,total,currency,created_at\nINDEPENDENT-ORDER,DEMO-NEW,buyer@example.test,paid,123.45,USD,2026-11-04\nINDEPENDENT-ORDER,DEMO-DUP,buyer@example.test,paid,900,USD,2026-11-04\nINVALID-ORDER,BAD,buyer@example.test,paid,1.001,USD,2026-11-04';
  const staged=(await send(w,'operations/imports/preview','POST',{source_id:id(source),entity:'orders',format:'generic',csv})).data;assert.equal(staged.batch.valid_rows,1);assert.equal(staged.batch.invalid_rows,1);assert.equal(staged.batch.duplicate_rows,1);
  const filter='source_id='+encodeURIComponent(id(source))+'&from=2026-11-01&to=2026-11-04';
  assert.equal((await list(w,'operations/records?entity=orders&'+filter)).data.length,0);
  let batch=staged.batch;for(let i=0;i<10&&batch.status!=='completed';i++)batch=(await send(w,'operations/imports/'+id(batch)+'/commit','POST',{version:batch.version})).data;
  assert.equal(batch.status,'completed');assert.equal(batch.imported_rows,1);await send(w,'operations/imports/'+id(batch)+'/commit','POST',{version:batch.version});
  const orders=(await list(w,'operations/records?entity=orders&'+filter)).data;assert.equal(orders.length,1);assert.equal(orders[0].total_minor,12345);
  const analytics=await one(w,'operations/analytics?'+filter);assert.equal(analytics.counts.orders,1);assert.equal(analytics.revenue_by_currency.find(v=>v.currency==='USD').amount_minor_exact,'12345');
  const artifact=w.exportData('operations/imports/'+id(batch)+'/errors.csv');assert.match(artifact.mime,/csv/);assert.match(artifact.content,/INVALID|1\.001|fraction|invalid/i);
});

await test('fully refunded orders remain in before-refund order value while payment movement is reconciled separately',async()=>{
  const w=fresh(),source=(await send(w,'operations/sources','POST',{name:'Independent refund fixture',kind:'csv_generic'})).data;
  async function imported(entity,csv){let batch=(await send(w,'operations/imports/preview','POST',{source_id:id(source),entity,format:'generic',csv})).data.batch;assert.equal(batch.valid_rows,entity==='orders'?1:2);for(let step=0;step<10&&batch.status!=='completed';step++)batch=(await send(w,'operations/imports/'+id(batch)+'/commit','POST',{version:batch.version})).data;assert.equal(batch.status,'completed');}
  await imported('orders','external_id,status,total,currency,created_at\nREFUNDED-ONE,refunded,100.00,USD,2026-11-04');
  await imported('payments','external_id,order_external_id,status,amount,currency,created_at\nPAID-ONE,REFUNDED-ONE,paid,100.00,USD,2026-11-04\nREFUND-ONE,REFUNDED-ONE,refunded,100.00,USD,2026-11-04');
  const analytics=await one(w,'operations/analytics?source_id='+encodeURIComponent(id(source))+'&from=2026-11-04&to=2026-11-04');
  assert.equal(analytics.counts.orders,1);assert.equal(analytics.revenue_by_currency.find(v=>v.currency==='USD')?.amount_minor_exact,'10000');
  assert.equal(analytics.series[0].revenue_by_currency.find(v=>v.currency==='USD')?.amount_minor_exact,'10000');
  const ledger=analytics.reconciliation.payments_by_currency.find(v=>v.currency==='USD');assert.equal(ledger.paid_minor_exact,'10000');assert.equal(ledger.refunded_minor_exact,'10000');assert.equal(ledger.net_minor_exact,'0');
});

await test('unknown endpoints, unsupported methods and absolute remote URLs fail closed',async()=>{
  const w=fresh();for(const path of ['future-module/records','customers/DOES-NOT-EXIST','operations/future-route','intelligence/future-route']){
    await assert.rejects(()=>w.api(path),error=>{assert.ok([404,405,422].includes(error.status));assert.equal(typeof error.code,'string');return true;});
  }
  for(const path of ['https://example.test/admin/api/customers','//example.test/customers'])await assert.rejects(()=>w.api(path));
  await assert.rejects(()=>w.api('dashboard',{method:'TRACE'}));assert.deepEqual(attempts,[]);
});

await test('aborted calls do not create records and JSON string bodies behave like object bodies',async()=>{
  const w=fresh(),abort=new AbortController();abort.abort();const count=(await list(w,'customers?limit=100')).meta.total;
  await assert.rejects(()=>w.api('customers',{method:'POST',signal:abort.signal,body:{name:'Must not exist'}}),error=>error.name==='AbortError');
  assert.equal((await list(w,'customers?limit=100')).meta.total,count);
  const created=(await w.api('customers',{method:'POST',body:JSON.stringify({name:'JSON body demo customer',status:'prospect'})})).data;
  assert.equal((await one(w,'customers/'+id(created))).name,'JSON body demo customer');
});

await test('quotes use exact minor totals, validate integers and reject subtotal overflow',async()=>{
  const w=fresh(),customer=(await list(w,'customers?limit=1')).data[0],payload=quoteInput(customer);
  const calculated=(await send(w,'quotes/calculate','POST',payload)).data;
  assert.equal(calculated.subtotal_minor,5997);assert.equal(calculated.total_minor,6572);
  const max=(await send(w,'quotes/calculate','POST',quoteInput(customer,{items:[{description:'Free scope',quantity:Number.MAX_SAFE_INTEGER,unit_price_minor:0}],discount_minor:0,tax_minor:0,shipping_minor:0}))).data;assert.equal(max.total_minor,0);
  for(const items of [[{description:'fraction',quantity:1.5,unit_price_minor:1}],[{description:'overflow',quantity:2,unit_price_minor:1000000000000}],[{description:'A',quantity:1,unit_price_minor:600000000000},{description:'B',quantity:1,unit_price_minor:600000000000}]]){
    await rejects(w,'quotes/calculate','POST',quoteInput(customer,{items,discount_minor:400000000000,tax_minor:0,shipping_minor:0}),422);
  }
});

await test('issuing freezes quote data, revisions preserve linkage, and local print escapes content',async()=>{
  const w=fresh(),customer=(await list(w,'customers?limit=1')).data[0];let quote=(await send(w,'quotes','POST',quoteInput(customer,{title:'<script>never_execute()</script>'}))).data;
  quote=(await send(w,'quotes/'+id(quote)+'/issue','POST',{version:quote.version})).data;assert.equal(quote.status,'issued');
  await assert.rejects(()=>send(w,'quotes/'+id(quote),'PATCH',{version:quote.version,title:'Cannot mutate issued'}));
  const frozen=plain(await one(w,'quotes/'+id(quote)));await send(w,'customers/'+id(customer),'PATCH',{version:customer.version,name:'Changed current CRM name'});
  assert.deepEqual(plain(await one(w,'quotes/'+id(quote))),frozen);
  const revision=(await send(w,'quotes/'+id(quote)+'/revise','POST',{version:quote.version})).data;assert.equal(revision.status,'draft');assert.equal(revision.revision,quote.revision+1);assert.equal(revision.family_id,quote.family_id);
  const html=w.printQuote(id(quote),{lang:'en'});assert.equal(typeof html,'string');assert.match(html,/test|demo|fictional/i);assert.ok(!html.includes('<script>never_execute()'));assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!/https?:\/\/|\/admin\/api\//i.test(html),'Local demo print must not include remote resources or live API links.');
});

await test('local export artifacts contain demo records only and cannot fetch live backups',async()=>{
  const w=fresh();const csv=w.exportData('export?resource=customers');assert.equal(typeof csv.content,'string');assert.match(csv.mime,/csv/);assert.ok(csv.content.split('\n').length>20);
  const history=(await list(w,'system/backups')).data;assert.ok(history.length);
  for(const suffix of ['sql','json']){const artifact=w.exportData('system/backups/'+encodeURIComponent(history[0].filename)+'/'+suffix);assert.equal(typeof artifact.content,'string');assert.match(artifact.content,/demo|synthetic|test|fictional/i);}
  await assert.rejects(async()=>w.exportData('system/backups/PRODUCTION-UNKNOWN/json'));
  assert.deepEqual(attempts,[]);
});

await test('reports, automation and rules have real detail histories and deterministic in-memory advancement',async()=>{
  const w=fresh(),rules=(await list(w,'operations/rules')).data;assert.equal(rules.length,13);
  const reports=(await list(w,'operations/reports')).data;const detail=await one(w,'operations/reports/'+id(reports[0]));assert.ok((detail.content_markdown||detail.content||'').length>100);
  const automation=(await list(w,'operations/automations')).data[0];const launch=(await send(w,'operations/automations/'+id(automation)+'/run','POST',{})).data;let run=launch.run||launch;
  for(let step=0;step<64&&!['completed','failed'].includes(run.status);step++){const result=await send(w,'operations/runs/'+id(run)+'/process','POST',{});run=result.data.run||result.data;}
  assert.equal(run.status,'completed');const persisted=await one(w,'operations/runs/'+id(run));assert.equal((persisted.run||persisted).status,'completed');
});

await test('knowledge CRUD and chat retrieve selected sources without an external provider',async()=>{
  const w=fresh();const memory=(await send(w,'intelligence/memory','POST',{title:'Independent sample lead time',content:'Synthetic samples take exactly seven working days.',category:'general',source_ref:'independent-demo-contract'})).data;
  const document=(await send(w,'intelligence/documents','POST',{title:'Independent sample acceptance',filename:'acceptance.md',media_type:'text/markdown',content:'# Acceptance\nTwo stages: factory review, then sample approval.',source_ref:'independent-demo-contract'})).data;
  const chat=(await send(w,'intelligence/chat','POST',{request_id:'independent-chat-1',message:'What is the sample lead time and acceptance process?',language:'en',use_model:false,context:{crm:true,memory:true,rules:true,document_ids:[id(document)]}})).data;
  assert.ok(chat.conversation_id);assert.ok(chat.answer?.length>30);assert.ok(chat.citations?.length);assert.ok(chat.citations.some(c=>c.id===id(document)||c.id===id(memory)),'Citations must include actual selected/stored knowledge.');
  const conversation=await one(w,'intelligence/conversations/'+chat.conversation_id);assert.ok(conversation.messages.length>=2);assert.ok(conversation.runs.length);
  const archived=(await send(w,'intelligence/memory/'+id(memory)+'/archive','POST',{version:memory.version})).data;assert.ok(archived.archived_at);
  assert.deepEqual(attempts,[]);
});

await test('chat context switches actually suppress CRM/rules and selected knowledge is present in the answer',async()=>{
  const w=fresh();const memory=(await send(w,'intelligence/memory','POST',{title:'Zircon pilot preparation policy',content:'Zircon specimens require precisely seven working days.',category:'general'})).data;
  const document=(await send(w,'intelligence/documents','POST',{title:'Zircon acceptance',filename:'zircon.md',content:'Zircon acceptance has two gates: photometric review then sample approval.',media_type:'text/markdown'})).data;
  const response=(await send(w,'intelligence/chat','POST',{request_id:'context-selected',message:'Explain Zircon pilot preparation policy and acceptance',language:'en',use_model:false,context:{crm:false,memory:true,rules:false,document_ids:[id(document)]}})).data;
  assert.match(response.answer,/seven working days/);assert.match(response.answer,/photometric review/);assert.ok(response.citations.some(c=>c.id===id(memory)));assert.ok(response.citations.some(c=>c.id===id(document)));assert.ok(!response.citations.some(c=>/crm|rules|operations_summary/i.test(c.id)));
  const none=(await send(w,'intelligence/chat','POST',{request_id:'context-none',message:'Explain Zircon',language:'en',use_model:false,context:{crm:false,memory:false,rules:false,document_ids:[]}})).data;
  assert.equal(none.citations.length,0);assert.doesNotMatch(none.answer,/seven working days|photometric review|48 customers/);
  const docs=(await list(w,'intelligence/documents?page_size=100')).data.slice(0,9).map(id);await rejects(w,'intelligence/chat','POST',{request_id:'too-many-documents',message:'Must not silently trim selected references',context:{crm:false,memory:false,rules:false,document_ids:docs}},422);
  const before=(await list(w,'intelligence/conversations?limit=100')).meta.total;
  await rejects(w,'intelligence/chat','POST',{request_id:'invalid-document',message:'Unknown document',context:{crm:false,memory:false,rules:false,document_ids:['DOES-NOT-EXIST']}},404);
  assert.equal((await list(w,'intelligence/conversations?limit=100')).meta.total,before,'Rejected context must not create an empty conversation.');
});

await test('demo download rejects absolute schemes and malformed paths instead of returning a success artifact',async()=>{
  const w=fresh();for(const path of ['https://example.test/export?resource=customers','data:text/plain,hello','javascript:alert(1)','customers/%2e%2e/export?resource=customers','export/%ZZ','export?resource=FUTURE'])await assert.rejects(async()=>w.exportData(path));
  for(const path of ['data:text/plain,hello','javascript:alert(1)','customers/%2e%2e/system/backup','customers/%ZZ'])await assert.rejects(()=>w.api(path));
  assert.deepEqual(attempts,[]);
});

await test('license and model projections never claim real activation or leak saved provider secrets',async()=>{
  const w=fresh(),license=await one(w,'intelligence/license');assert.equal(license.signature_verified,false);assert.ok(license.demo||license.simulated||/demo|test|unconfigured|unlicensed/i.test(license.status));
  const models=await one(w,'intelligence/models');for(const key of ['api_key','api_key_ciphertext','key_ciphertext','secret'])assert.ok(!models[key],'Do not return provider secrets: '+key);
  await send(w,'intelligence/models/test','POST',{summary_send_ack:true}).catch(error=>{assert.ok(error.code);});assert.deepEqual(attempts,[]);
});

await test('English and Chinese generated replies and reports follow the selected language',async()=>{
  const answers=[];for(const lang of ['en','zh']){language=lang;const w=fresh();const chat=(await send(w,'intelligence/chat','POST',{request_id:'language-'+lang,message:lang==='zh'?'请汇总当前业务情况':'Summarize current business',language:lang,use_model:false,context:{crm:true,memory:true,rules:true,document_ids:[]}})).data;answers.push(chat.answer);const report=(await send(w,'operations/reports','POST',{type:'daily',language:lang})).data;const full=await one(w,'operations/reports/'+id(report));assert.ok((full.content_markdown||full.content||'').length>50);if(lang==='zh')assert.match(chat.answer,/[\u4e00-\u9fff]/);}
  assert.notEqual(answers[0],answers[1]);language='en';
});

await test('actual lazy controllers render demo data and replace live print/download URLs in both languages',async()=>{
  const [{WORKBENCH_CLIENT},{OPERATIONS_CLIENT},{INTELLIGENCE_CLIENT},{QUOTES_CLIENT}]=await Promise.all([
    import('../src/admin/workbench-ui.mjs'),import('../src/admin/operations-client.mjs'),import('../src/admin/intelligence-client.mjs'),import('../src/admin/quotes-client.mjs'),
  ]);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class Element {
    constructor(){this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.open=false;this.isConnected=true;this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
    addEventListener(){} removeEventListener(){} setAttribute(){} getAttribute(){return null;} querySelector(){return null;} querySelectorAll(){return [];} contains(){return false;} append(){} appendChild(){} remove(){} close(){this.open=false;} showModal(){this.open=true;} insertAdjacentHTML(_,html){this.innerHTML+=html;}
  }
  for(const lang of ['en','zh']){
    language=lang;const w=fresh(),listeners=[],pending=[],calls=[],toasts=[];
    const document={addEventListener:(type,handler)=>listeners.push({type,handler}),removeEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},getElementById(){return null;},createElement:()=>new Element()};
    const context=vm.createContext({URL,URLSearchParams,TextEncoder,TextDecoder,Intl,AbortController,AbortSignal,DOMException,Blob,FormData,setTimeout,clearTimeout,crypto:{randomUUID},document,location:{hash:'#overview',href:'https://demo.example.test/admin?test=1#overview',origin:'https://demo.example.test'},history:{replaceState(){}},window:{addEventListener(){},print(){},open:deny('window.open')},navigator:{clipboard:{writeText:async()=>{}}},fetch:deny('controller fetch')});
    const workbench=new vm.SourceTextModule(WORKBENCH_CLIENT,{context,identifier:'shipped-workbench.mjs'});await workbench.link(deny('unexpected workbench import'));await workbench.evaluate();
    const modules={};for(const [kind,code]of Object.entries({operations:OPERATIONS_CLIENT,intelligence:INTELLIGENCE_CLIENT,quotes:QUOTES_CLIENT})){
      const module=new vm.SourceTextModule(code,{context,identifier:'shipped-'+kind+'.mjs'});await module.link(specifier=>{assert.equal(specifier,'/admin/assets/workbench.js');return workbench;});await module.evaluate();modules[kind]=module.namespace;
    }
    const boot=await one(w,'bootstrap'),state={lang,testMode:true,tab:'overview',params:new URLSearchParams(),principal:boot.principal,permissions:boot.permissions,timezone:'Asia/Singapore',members:[]};
    const page=new Element(),dialog=new Element();const deps={state,page,dialog,api:(path,options)=>{calls.push({path,options});const promise=w.api(path,options);pending.push(promise);return promise;},esc,t:key=>key,toast:message=>toasts.push(message),navigate(){},can:()=>true,confirmAction:async()=>true,money:(amount,currency)=>String(amount??0)+' '+currency,date:value=>String(value??''),heading:(title,description,actions)=>'<h1>'+esc(title)+'</h1><p>'+esc(description)+'</p>'+(actions||''),pagination:meta=>'<p data-total="'+esc(meta?.total||0)+'"></p>',showDialog:html=>{dialog.innerHTML=html;dialog.open=true;},dialogHeader:title=>'<h2>'+esc(title)+'</h2>',setFormBusy(){},showFormError(){},openRecord(){},reload(){},openMemberForm(){},openPasswordForm(){},openBackupForm(){},loadPage(){}};
    assert.equal(typeof modules.operations.createOperationsController,'function');assert.equal(typeof modules.intelligence.createIntelligenceController,'function');assert.equal(typeof modules.quotes.createQuotesController,'function');
    const controllers={operations:modules.operations.createOperationsController(deps),intelligence:modules.intelligence.createIntelligenceController(deps),quotes:modules.quotes.createQuotesController(deps)};
    const routes={operations:['analytics','sources','reports','automations','rules'],intelligence:['agent','memory','models','users','security','backup','license','health'],quotes:['quotes']};
    for(const [kind,tabs]of Object.entries(routes))for(const tab of tabs){state.tab=tab;state.params=new URLSearchParams();page.innerHTML='';await controllers[kind].loadPage(state.params);assert.ok(page.innerHTML.length>100,lang+' '+tab+' did not render');assert.ok(!page.innerHTML.includes('[object Object]'),lang+' '+tab+' leaked an invalid value');assert.doesNotMatch(page.innerHTML,/href=["']\/admin\/(?:api\/|quotes\/|order-intents)/,lang+' '+tab+' contains a real business URL');assert.doesNotMatch(page.innerHTML,/href=["']\/admin\/assets\/local-source-sync\.mjs/,lang+' '+tab+' offers a real collector');}
    const issued=(await list(w,'quotes?limit=100')).data.find(row=>row.status!=='draft'&&!row.archived_at);assert.ok(issued);
    state.tab='quotes';state.params=new URLSearchParams({id:id(issued)});await controllers.quotes.loadPage(state.params);assert.match(page.innerHTML,/data-demo-action="print/);assert.doesNotMatch(page.innerHTML,/href=["']\/admin\/quotes\//);
    const imports=(await list(w,'operations/imports')).data;assert.ok(imports.length);state.tab='sources';state.params=new URLSearchParams({id:id(imports[0])});await controllers.operations.loadPage(state.params);assert.match(page.innerHTML,/data-demo-action="export/);assert.doesNotMatch(page.innerHTML,/href=["']\/admin\/api\//);
    state.tab='memory';state.params=new URLSearchParams({kind:'documents'});await controllers.intelligence.loadPage(state.params);assert.doesNotMatch(page.innerHTML,/href=["']\/admin\/assets\/local-source-sync/);
    async function intelligenceAction(name,recordId=''){
      const start=pending.length,control={dataset:{ai:name,id:recordId},disabled:false,isConnected:true};const event={target:{closest:selector=>selector==='[data-ai]'?control:null},preventDefault(){}};
      for(const listener of listeners.filter(item=>item.type==='click'))listener.handler(event);
      // The shipped delegated listener intentionally does not return its async action.
      // Drain its deterministic confirm -> API -> render microtasks, without timers/network.
      for(let turn=0;turn<8;turn++){await Promise.resolve();await Promise.all(pending.slice(start));}
    }
    state.tab='models';state.params=new URLSearchParams();await controllers.intelligence.loadPage(state.params);await intelligenceAction('test-model');
    assert.match(toasts.at(-1),lang==='zh'?/本地模拟|未联系/:/local demo|no provider/i);assert.doesNotMatch(toasts.at(-1),/Model endpoint responded|模型服务已响应/);
    state.tab='backup';await controllers.intelligence.loadPage(state.params);const backup=(await list(w,'system/backups')).data[0];await intelligenceAction('verify-backup',backup.filename);
    assert.match(dialog.innerHTML,lang==='zh'?/演示校验完成|本地模拟/:/Demo verification|Local simulation/);assert.doesNotMatch(dialog.innerHTML,/name=["']password/);
    const verifyCall=calls.findLast(call=>/system\/backups\/.+\/verify$/.test(call.path));assert.ok(verifyCall);assert.ok(!Object.hasOwn(verifyCall.options.body,'password'));
  }
  language='en';assert.deepEqual(attempts,[]);
});

await test('actual CRM column helpers neither read nor overwrite live column preferences in demo mode',async()=>{
  const {CRM_EXPERIENCE_CLIENT}=await import('../src/admin/crm-experience-client.mjs');
  const stored=new Map([['gyutron.crm.columns.owner.customers','["country"]']]),access=[];
  const state={testMode:true,principal:{id:'owner'}},context=vm.createContext({state,specs:{customers:{fields:['name','country','status']}},demoColumns:new Map(),localStorage:{getItem:key=>{access.push(['read',key]);return stored.get(key)||null;},setItem:(key,value)=>{access.push(['write',key]);stored.set(key,value);}}});
  for(const name of ['columnKey','storeColumns','readColumns']){const line=CRM_EXPERIENCE_CLIENT.split('\n').find(row=>row.includes('function '+name+'('));assert.ok(line,'Retain a reviewable column storage contract.');vm.runInContext(line,context);}
  assert.deepEqual(Array.from(context.readColumns('customers')),['name','country','status']);context.storeColumns('customers',['name','status']);assert.deepEqual(Array.from(context.readColumns('customers')),['name','status']);assert.deepEqual(access,[]);assert.equal(stored.get('gyutron.crm.columns.owner.customers'),'["country"]');
  state.testMode=false;assert.deepEqual(Array.from(context.readColumns('customers')),['country']);state.testMode=true;assert.deepEqual(Array.from(context.readColumns('customers')),['name','status']);assert.equal(access.length,1);
});

await test('actual emitted main client selects demo before business requests and capture guards block live bypasses',async()=>{
  const {ADMIN_CLIENT}=await import('../src/admin/client.mjs');
  const marker='  initializeWorkspace();\n})();';assert.equal(ADMIN_CLIENT.split(marker).length,2,'Update the independent core harness when initialization changes.');
  for(const brokenAsset of [false,true]){
    const listeners=[],nodes=new Map();
    class Node {
      constructor(){this.dataset={};this.textContent='';this.innerHTML='';this.value='';this.open=false;this.hidden=false;this.disabled=false;this.isConnected=true;this.attributes={};this.options=[{value:'en',remove(){}},{value:'zh',remove(){}}];this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
      addEventListener(){} removeEventListener(){} setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k]??null;} querySelector(){return new Node();} querySelectorAll(){return[];} contains(){return false;} append(){} appendChild(){} focus(){} remove(){} close(){this.open=false;} showModal(){this.open=true;} show(){this.open=true;}
    }
    const getNode=key=>{if(!nodes.has(key))nodes.set(key,new Node());return nodes.get(key);};
    getNode('workspace-bootstrap').textContent=JSON.stringify({lang:'en',csrfToken:'DO-NOT-SEND-LIVE-CSRF',principal:{id:'REAL-IDENTITY-MUST-NOT-QUERY',name:'Real identity fixture',role:'owner'}});
    const document={body:new Node(),head:new Node(),documentElement:new Node(),getElementById:getNode,querySelector:getNode,querySelectorAll:()=>[],createElement:()=>new Node(),addEventListener:(type,handler,capture)=>listeners.push({type,handler,capture}),removeEventListener(){}};
    const context=vm.createContext({URL,URLSearchParams,TextEncoder,TextDecoder,Intl,AbortController,AbortSignal,DOMException,Blob,FormData,crypto:{randomUUID},document,location:{href:'https://demo.example.test/admin?test=1#overview',origin:'https://demo.example.test',pathname:'/admin',search:'?test=1',hash:'#overview',assign:deny('unexpected reload')},history:{replaceState(){}},localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},navigator:{language:'en'},window:{addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}})},fetch:deny('core live fetch'),setTimeout:()=>0,clearTimeout(){},console:{log(){},warn(){},error(){}}});
    const demo=new vm.SourceTextModule(DEMO_CLIENT,{context,identifier:'core-real-demo.mjs'});await demo.link(deny('unexpected core demo import'));await demo.evaluate();
    const source=ADMIN_CLIENT.replace(marker,'  globalThis.__coreQa={state,api,exportButton,loadSettings};\n})();');
    const script=new vm.Script(source,{filename:'actual-emitted-workspace.js',importModuleDynamically:async specifier=>{assert.equal(specifier,'/admin/assets/demo.js');if(brokenAsset)throw Error('Synthetic demo asset failed');return demo;}});
    script.runInContext(context,{timeout:5000});const core=context.__coreQa;assert.equal(core.state.testMode,true);
    if(brokenAsset){await assert.rejects(()=>core.api('bootstrap'));assert.deepEqual(attempts,[]);continue;}
    const bootstrap=(await core.api('bootstrap')).data;assert.ok(bootstrap.principal.id!=='REAL-IDENTITY-MUST-NOT-QUERY');core.state.principal=bootstrap.principal;core.state.permissions=bootstrap.permissions;
    assert.ok((await core.api('customers?limit=25')).data.length);await assert.rejects(()=>core.api('UNIMPLEMENTED-FUTURE-MODULE'));
    const exportHtml=core.exportButton('customers');assert.match(exportHtml,/data-demo-action="export/);assert.doesNotMatch(exportHtml,/href=/);
    core.state.tab='settings';await core.loadSettings(core.state.loadId);assert.match(getNode('workspace-page').innerHTML,/data-demo-action="orders/);assert.doesNotMatch(getNode('workspace-page').innerHTML,/href=["']\/admin\/order-intents/);
    for(const type of ['click','auxclick']){
      const handler=listeners.findLast(item=>item.type===type&&item.capture===true)?.handler;assert.equal(typeof handler,'function');let prevented=0,stopped=0;
      const link={href:'https://demo.example.test/admin/api/export?resource=customers',getAttribute:()=>'/admin/api/export?resource=customers'};
      handler({target:{closest:selector=>selector==='a[href]'?link:null},preventDefault(){prevented++;},stopImmediatePropagation(){stopped++;}});assert.equal(prevented,1);assert.equal(stopped,1);
    }
    const submit=listeners.findLast(item=>item.type==='submit'&&item.capture===true)?.handler;let prevented=0,stopped=0;submit({target:{action:'https://demo.example.test/admin/logout'},preventDefault(){prevented++;},stopImmediatePropagation(){stopped++;}});await Promise.resolve();await Promise.resolve();assert.equal(prevented,1);assert.equal(stopped,1);
    assert.deepEqual(attempts,[]);
  }
});

await test('all completed test operations still caused no network or storage access',()=>assert.deepEqual(attempts,[]));

console.log(JSON.stringify({suite:'admin-demo-contract-isolation',passed,failed:failures.length,emitted_esm_vm:true,network_attempts:attempts,production_accessed:false,browser_used:false,failures},null,2));
if(failures.length)process.exitCode=1;
