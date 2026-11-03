/** Exact-money, immutable quotation and transactional revision integration checks. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleAdminQuotes,handleQuoteDocument } from '../src/api/admin-quotes.mjs';
import { calculateQuote,MAX_AMOUNT_MINOR } from '../src/platform/quotes/schema.mjs';
import { sha256Hex } from '../src/platform/security/hash.mjs';
import { renderQuoteReferenceCss } from '../src/platform/quotes/document.mjs';

const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
for(const migration of ['0001_init.sql','0002_order_intents.sql','0003_admin_workspace.sql','0004_admin_identity.sql','0005_crm_relation_guards.sql','0006_operations_quotes.sql'])sqlite.exec(readFileSync(new URL('../migrations/'+migration,import.meta.url),'utf8'));
let beforeBatch=null,batchTail=Promise.resolve();
const db={prepare(sql){return{sql,values:[],bind(...values){this.values=values;return this;},async first(){return sqlite.prepare(sql).get(...this.values)||null;},async all(){return{success:true,results:sqlite.prepare(sql).all(...this.values),meta:{changes:0}};},async run(){return{success:true,meta:{changes:Number(sqlite.prepare(sql).run(...this.values).changes)}};}};},batch(statements){
  const work=async()=>{if(beforeBatch){const hook=beforeBatch;beforeBatch=null;hook();}sqlite.exec('BEGIN IMMEDIATE');try{const results=[];for(const statement of statements)results.push(/^\s*SELECT\b/i.test(statement.sql)?await statement.all():await statement.run());sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}};
  const pending=batchTail.then(work);batchTail=pending.catch(()=>{});return pending;
}};
const principal={id:'owner',name:'Workspace owner',role:'owner'},sales={id:'USR-sales',name:'Sales',role:'sales'},manager={id:'USR-manager',name:'Manager',role:'manager'},viewer={id:'USR-viewer',name:'Viewer',role:'viewer'};
const env={DB:db},time='2026-11-03T00:00:00.000Z';
for(const actor of [sales,manager,viewer])sqlite.prepare('INSERT INTO admin_users(id,email,name,role,password_hash,active,created_at,updated_at) VALUES(?,?,?,?,?,1,?,?)').run(actor.id,actor.id+'@example.test',actor.name,actor.role,'test-only-placeholder',time,time);
for(const [publicId,name]of[['CUS-one','Factory One'],['CUS-two','Factory Two'],['CUS-race','Race Customer']])sqlite.prepare('INSERT INTO crm_customers(public_id,name,contact_name,email,phone,owner_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(publicId,name,'Lin','buyer@example.test','+65 1234 5678','owner',time,time);
sqlite.prepare('INSERT INTO crm_opportunities(public_id,title,customer_id,owner_id,created_at,updated_at) VALUES(?,?,?,?,?,?)').run('OPP-one','Inspection cell','CUS-one','owner',time,time);
let passed=0;const failures=[];async function test(name,fn){try{await fn();passed++;}catch(error){failures.push({name,stack:error.stack});}}
async function api(path='',{method='GET',body,actor=principal,origin='https://www.gyutron.test',stream,headers={}}={}){
 const request=new Request('https://www.gyutron.test/admin/api/quotes'+path,{method,headers:{origin,...(body===undefined&&!stream?{}:{'content-type':'application/json'}),...headers},...(stream?{body:stream,duplex:'half'}:body===undefined?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
 const response=await handleAdminQuotes(request,env,{},new URL(request.url),actor);return{response,data:await response.json()};
}
async function document(publicId,{actor=principal,lang='en',asset,method='GET',referenceCss=false}={}){
 const url=new URL(asset?'https://www.gyutron.test/admin/quotes/assets/'+asset:'https://www.gyutron.test/admin/quotes/'+publicId+'/'+(referenceCss?'print.css':'print')+'?lang='+lang);
 const response=await handleQuoteDocument(new Request(url,{method}),env,{},url,actor);return{response,text:await response.text()};
}
const item=(description='Industrial vision system',quantity=3,price=12500)=>({description,sku:'GY-TEST',unit:'set',quantity,unit_price_minor:price});
const payload=(extra={})=>({customer_id:'CUS-one',opportunity_id:'OPP-one',title:'Industrial inspection proposal',currency:'USD',items:[item(),item('Commissioning',1,5000)],discount_minor:2500,tax_minor:1000,shipping_minor:1500,terms:'Payment and delivery terms to be agreed.\n工厂验收条款。',...extra});
const get=async publicId=>(await api('/'+publicId)).data.data;
let quote,revision;

await test('BigInt money calculation is exact with fixed manual amounts',async()=>{
 const result=calculateQuote(payload());assert.equal(result.subtotal_minor,42500);assert.equal(result.total_minor,42500);assert.equal(result.items[0].line_total_minor,37500);
 const jpy=calculateQuote({currency:'JPY',items:[item('JPY line',7,101)]});assert.equal(jpy.total_minor,707);
 assert.equal(calculateQuote({items:[item('Free scope',Number.MAX_SAFE_INTEGER,0)]}).total_minor,0);
});
await test('unsafe quantities, decimals, negative amounts and intermediate overflow fail closed',async()=>{
 for(const input of [{items:[item('Bad',1.5,1)]},{items:[item('Bad',0,1)]},{items:[item('Bad',Number.MAX_SAFE_INTEGER+1,0)]},{items:[item('Bad',1,0.1)]},{items:[item('Bad',1,-1)]},{items:[item()],discount_minor:-1},{items:[item()],discount_minor:999999},{items:[item('Large',2,MAX_AMOUNT_MINOR)]},{items:[item('One',1,600000000000),item('Two',1,600000000000)],discount_minor:400000000000},{items:[item('Cap',1,MAX_AMOUNT_MINOR)],tax_minor:1}])assert.throws(()=>calculateQuote(input));
 assert.throws(()=>calculateQuote({items:[]}));assert.throws(()=>calculateQuote({items:Array.from({length:51},()=>item())}));
 assert.throws(()=>calculateQuote({items:[{...item(),tax_rate:0.2}]}));
 assert.throws(()=>calculateQuote({currency:'',items:[item()]}));assert.throws(()=>calculateQuote({currency:null,items:[item()]}));
});
await test('calculation API is read-only, role-aware, validates unsupported tax rates',async()=>{
 const before=sqlite.prepare('SELECT COUNT(*) AS n FROM ops_quotes').get().n;
 const r=await api('/calculate',{method:'POST',actor:viewer,body:{currency:'USD',items:[item()]}});assert.equal(r.response.status,200);assert.equal(r.data.data.total_minor,37500);
 assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM ops_quotes').get().n,before);
 assert.equal((await api('/calculate',{method:'POST',body:{items:[item()],tax_bps:200}})).response.status,422);
 assert.equal((await api('/calculate',{method:'POST',body:{items:[item()]},origin:'https://attacker.test'})).response.status,403);
 assert.equal((await api('',{actor:null})).response.status,401);
});
await test('draft creation snapshots customer contact defaults and generates unique reference',async()=>{
 const r=await api('',{method:'POST',actor:sales,body:payload()});assert.equal(r.response.status,201);quote=r.data.data;
 assert.match(quote.quote_number,/^QT-\d{8}-[A-F0-9]{16}-R01$/);assert.equal(quote.revision,1);assert.equal(quote.status,'draft');assert.equal(quote.owner_id,sales.id);
 assert.equal(quote.recipient_company,'Factory One');assert.equal(quote.recipient_name,'Lin');assert.equal(quote.recipient_email,'buyer@example.test');assert.equal(quote.items.length,2);assert.equal(quote.total_minor,42500);
 assert.equal(quote.mutation_token,undefined);assert.equal(quote.snapshot_json,undefined);
});
await test('quote input strictly validates relationships, roles and manual terms',async()=>{
 assert.equal((await api('',{method:'POST',actor:viewer,body:payload()})).response.status,403);
 assert.equal((await api('',{method:'POST',body:payload({customer_id:'CUS-two'})})).response.status,422);
 assert.equal((await api('',{method:'POST',actor:sales,body:payload({owner_id:'owner'})})).response.status,403);
 assert.equal((await api('',{method:'POST',body:payload({valid_until:'2026-02-30'})})).response.status,422);
 assert.equal((await api('',{method:'POST',body:payload({recipient_email:'invalid'})})).response.status,422);
 assert.equal((await api('',{method:'POST',body:payload({subtotal_minor:1})})).response.status,422);
});
await test('draft patches replace multiple lines atomically and stale writes create no ghost rows',async()=>{
 const r=await api('/'+quote.public_id,{method:'PATCH',actor:sales,body:{version:quote.version,items:[item('Updated scope',5,10000)],discount_minor:0}});
 assert.equal(r.response.status,200);quote=r.data.data;assert.equal(quote.items.length,1);assert.equal(quote.version,2);assert.equal(quote.total_minor,52500);
 const audits=sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=?').get(quote.public_id).n;
 const stale=await api('/'+quote.public_id,{method:'PATCH',actor:sales,body:{version:1,items:[item('Stale',1,1)]}});assert.equal(stale.response.status,409);
 assert.equal((await get(quote.public_id)).items[0].description,'Updated scope');assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=?').get(quote.public_id).n,audits);
});
await test('an audit failure rolls back draft header and whole line replacement',async()=>{
 sqlite.exec("CREATE TEMP TRIGGER fail_quote_audit BEFORE INSERT ON crm_audit BEGIN SELECT RAISE(ABORT,'simulated failure'); END");
 const r=await api('/'+quote.public_id,{method:'PATCH',body:{version:quote.version,title:'Must roll back',items:[item('Bad replacement',1,2)]}});
 sqlite.exec('DROP TRIGGER fail_quote_audit');assert.equal(r.response.status,503);
 const current=await get(quote.public_id);assert.equal(current.title,quote.title);assert.equal(current.items[0].description,quote.items[0].description);assert.equal(current.version,quote.version);
});
await test('draft print is protected, clearly marked, Unicode-safe and uses external assets',async()=>{
 const r=await document(quote.public_id);assert.equal(r.response.status,200);assert.ok(r.text.includes('DRAFT — NOT ISSUED'));assert.ok(r.text.includes('工厂验收条款'));
 assert.ok(r.text.includes('/admin/quotes/assets/print.css'));assert.ok(r.text.includes('/admin/quotes/assets/print.js'));assert.ok(!r.text.includes('<style>'));assert.ok(!r.text.includes('onclick='));
 assert.equal((await document(quote.public_id,{actor:null})).response.status,401);
 assert.equal((await document(quote.public_id,{actor:viewer})).response.status,200);
 assert.ok((await document('',{asset:'print.js'})).text.includes('window.print()'));
 assert.ok((await document('',{asset:'print.css'})).text.includes('@page{size:A4'));
});
await test('only owners and managers issue, and concurrent issue is idempotent',async()=>{
 assert.equal((await api('/'+quote.public_id+'/issue',{method:'POST',actor:sales,body:{version:quote.version}})).response.status,403);
 const results=await Promise.all([api('/'+quote.public_id+'/issue',{method:'POST',actor:manager,body:{version:quote.version}}),api('/'+quote.public_id+'/issue',{method:'POST',actor:manager,body:{version:quote.version}})]);
 assert.ok(results.every(r=>r.response.status===200));assert.equal(results.filter(r=>r.data.meta.already_issued===false).length,1);quote=await get(quote.public_id);assert.equal(quote.status,'issued');
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=? AND action='issued'").get(quote.public_id).n,1);
 assert.ok(quote.snapshot_sha256);assert.equal(quote.issued_by,manager.id);
});
await test('issued content and all items are immutable at both API and SQL layers',async()=>{
 assert.equal((await api('/'+quote.public_id,{method:'PATCH',body:{version:quote.version,title:'Drift'}})).response.status,409);
 assert.throws(()=>sqlite.prepare('UPDATE ops_quotes SET seller_address=? WHERE public_id=?').run('Drift',quote.public_id),/immutable/);
 assert.throws(()=>sqlite.prepare('UPDATE ops_quote_items SET description=? WHERE quote_id=?').run('Drift',quote.public_id),/immutable/);
 assert.throws(()=>sqlite.prepare('DELETE FROM ops_quote_items WHERE quote_id=?').run(quote.public_id),/immutable/);
 assert.throws(()=>sqlite.prepare('DELETE FROM ops_quotes WHERE public_id=?').run(quote.public_id),/archived/);
 assert.throws(()=>sqlite.prepare("UPDATE ops_quotes SET status='draft' WHERE public_id=?").run(quote.public_id),/reopened/);
});
await test('issued printing uses frozen recipient, terms and issuer after CRM changes',async()=>{
 sqlite.prepare('UPDATE crm_customers SET name=?,email=? WHERE public_id=?').run('Later renamed company','later@example.test','CUS-one');
 const r=await document(quote.public_id);assert.equal(r.response.status,200);assert.ok(r.text.includes('Factory One'));assert.ok(r.text.includes('buyer@example.test'));assert.ok(!r.text.includes('Later renamed company'));assert.ok(!r.text.includes('later@example.test'));assert.ok(!r.text.includes('DRAFT — NOT ISSUED'));
});
await test('revise creates one unique successor draft under concurrent retries',async()=>{
 const before=quote.version;
 const results=await Promise.all([api('/'+quote.public_id+'/revise',{method:'POST',actor:sales,body:{version:before}}),api('/'+quote.public_id+'/revise',{method:'POST',actor:sales,body:{version:before}})]);
 assert.ok(results.every(r=>[200,201].includes(r.response.status)));assert.equal(new Set(results.map(r=>r.data.data.public_id)).size,1);
 revision=results[0].data.data;assert.equal(revision.status,'draft');assert.equal(revision.revision,2);assert.equal(revision.revision_of,quote.public_id);assert.ok(revision.quote_number.endsWith('-R02'));assert.equal(revision.recipient_company,'Factory One');
 assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM ops_quotes WHERE revision_of=?').get(quote.public_id).n,1);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=? AND action='revision_created'").get(quote.public_id).n,1);
 quote=await get(quote.public_id);
});
await test('50-line drafts remain editable and totals never rely on client-provided sums',async()=>{
 const r=await api('/'+revision.public_id,{method:'PATCH',actor:sales,body:{version:revision.version,items:Array.from({length:50},(_,i)=>item('Line '+i,2,i+1)),discount_minor:0,tax_minor:0,shipping_minor:0}});
 assert.equal(r.response.status,200);revision=r.data.data;assert.equal(revision.items.length,50);assert.equal(revision.subtotal_minor,2550);assert.equal(revision.total_minor,2550);
 assert.equal((await api('/'+revision.public_id,{method:'PATCH',body:{version:revision.version,items:[{...item(),line_total_minor:1}]}})).response.status,422);
});
await test('accepted/declined record only external results and are version checked',async()=>{
 assert.equal((await api('/'+revision.public_id+'/status',{method:'POST',body:{version:revision.version,status:'accepted'}})).response.status,409);
 assert.equal((await api('/'+quote.public_id+'/status',{method:'POST',actor:sales,body:{version:quote.version,status:'accepted'}})).response.status,403);
 const r=await api('/'+quote.public_id+'/status',{method:'POST',actor:manager,body:{version:quote.version,status:'accepted',note:'INTERNAL OUTCOME - separate acceptance note.'}});assert.equal(r.response.status,200);quote=r.data.data;
 const repeat=await api('/'+quote.public_id+'/status',{method:'POST',body:{version:quote.version-1,status:'accepted',note:'INTERNAL OUTCOME - separate acceptance note.'}});assert.equal(repeat.response.status,200);assert.equal(repeat.data.meta.already_recorded,true);
 assert.equal((await api('/'+quote.public_id+'/status',{method:'POST',body:{version:quote.version,status:'declined'}})).response.status,409);
 assert.equal((await api('/'+quote.public_id+'/issue',{method:'POST',body:{version:1}})).data.meta.already_issued,true);
});
await test('soft archive is role-restricted, version checked and reversible',async()=>{
 assert.equal((await api('/'+revision.public_id,{method:'DELETE',actor:sales,body:{version:revision.version}})).response.status,403);
 const archived=await api('/'+revision.public_id,{method:'DELETE',body:{version:revision.version}});assert.equal(archived.response.status,200);revision=archived.data.data;
 assert.ok(revision.archived_at);assert.equal((await api('?archived=true')).data.meta.total,1);
 assert.equal((await api('/'+revision.public_id,{method:'PATCH',body:{version:revision.version,title:'No'}})).response.status,409);
 const restored=await api('/'+revision.public_id+'/restore',{method:'POST',body:{version:revision.version}});assert.equal(restored.response.status,200);revision=restored.data.data;assert.equal(revision.archived_at,null);
});
await test('active quotation guards protect customer and opportunity under SQL races',async()=>{
 assert.throws(()=>sqlite.prepare('UPDATE crm_customers SET archived_at=? WHERE public_id=?').run(time,'CUS-one'),/Active quotations/);
 assert.throws(()=>sqlite.prepare('UPDATE crm_opportunities SET archived_at=? WHERE public_id=?').run(time,'OPP-one'),/Active quotations/);
 assert.throws(()=>sqlite.prepare('UPDATE crm_opportunities SET customer_id=? WHERE public_id=?').run('CUS-two','OPP-one'),/Quotation history/);
 beforeBatch=()=>sqlite.prepare('UPDATE crm_customers SET archived_at=? WHERE public_id=?').run(time,'CUS-race');
 const r=await api('',{method:'POST',body:payload({customer_id:'CUS-race',opportunity_id:null})});assert.equal(r.response.status,409);
 assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM ops_quotes WHERE customer_id=?').get('CUS-race').n,0);
});
await test('list filters, pagination and quote text treat SQL and HTML payloads as data',async()=>{
 const filtered=await api('?opportunity_id=OPP-one&limit=1');assert.equal(filtered.response.status,200);assert.equal(filtered.data.meta.total,2);assert.equal(filtered.data.meta.pages,2);
 assert.equal((await api("?q='OR%201=1--")).data.meta.total,0);assert.equal((await api('?status=bogus')).response.status,422);
 const r=await api('',{method:'POST',body:payload({title:'<script>alert(1)</script>',recipient_company:'<img src=x onerror=alert(1)>',items:[item('安全中文\n</td><script>bad()</script>',1,2501)],currency:'JPY',discount_minor:0,tax_minor:0,shipping_minor:0})});assert.equal(r.response.status,201);
 const page=await document(r.data.data.public_id,{lang:'zh'});assert.ok(page.text.includes('&lt;script&gt;'));assert.ok(page.text.includes('安全中文'));assert.ok(page.text.includes('2,501'));assert.ok(!page.text.includes('2,501.00'));assert.ok(!page.text.includes('<img src=x'));
});
await test('quote JSON body and print routes enforce bounds and method rules',async()=>{
 assert.equal((await api('',{method:'POST',body:'{bad'})).response.status,400);
 assert.equal((await api('',{method:'POST',body:payload(),headers:{'content-length':String(2*1024*1024)}})).response.status,413);
 let pulls=0,cancelled=false;const stream=new ReadableStream({pull(controller){pulls++;controller.enqueue(new Uint8Array(65536));},cancel(){cancelled=true;}});
 assert.equal((await api('',{method:'POST',stream})).response.status,413);assert.equal(cancelled,true);assert.ok(pulls<25);
 assert.equal((await api('/calculate')).response.status,405);assert.equal((await document(quote.public_id,{method:'POST'})).response.status,405);
 const head=await document(quote.public_id,{method:'HEAD'});assert.equal(head.response.status,200);assert.equal(head.text,'');
});
await test('revising a draft cannot branch history and stale revision attempts add no audit',async()=>{
 assert.equal((await api('/'+revision.public_id+'/revise',{method:'POST',body:{version:revision.version}})).response.status,409);
 const again=await api('/'+quote.public_id+'/revise',{method:'POST',body:{version:1}});assert.equal(again.response.status,200);assert.equal(again.data.data.public_id,revision.public_id);
 assert.deepEqual(sqlite.prepare('PRAGMA foreign_key_check').all(),[]);
});
await test('issue refuses corrupted draft totals before freezing a document',async()=>{
 sqlite.prepare('UPDATE ops_quotes SET subtotal_minor=1,total_minor=1 WHERE public_id=?').run(revision.public_id);
 const r=await api('/'+revision.public_id+'/issue',{method:'POST',body:{version:revision.version}});
 assert.equal(r.response.status,503);assert.equal(r.data.error.code,'CALCULATION_INTEGRITY');assert.equal((await get(revision.public_id)).status,'draft');
 sqlite.prepare('UPDATE ops_quotes SET subtotal_minor=?,total_minor=? WHERE public_id=?').run(revision.subtotal_minor,revision.total_minor,revision.public_id);
});
await test('print integrity includes semantic totals and identity, not only matching JSON hash',async()=>{
 const original=sqlite.prepare('SELECT snapshot_json,snapshot_sha256 FROM ops_quotes WHERE public_id=?').get(quote.public_id);
 const guard=sqlite.prepare("SELECT sql FROM sqlite_master WHERE name='ops_quote_frozen_header'").get().sql;
 const corrupted=JSON.parse(original.snapshot_json);corrupted.total_minor=1;const json=JSON.stringify(corrupted),hash=await sha256Hex(json);
 sqlite.exec('DROP TRIGGER ops_quote_frozen_header');sqlite.prepare('UPDATE ops_quotes SET snapshot_json=?,snapshot_sha256=? WHERE public_id=?').run(json,hash,quote.public_id);sqlite.exec(guard);
 const r=await document(quote.public_id);assert.equal(r.response.status,503);assert.ok(r.text.includes('SNAPSHOT_INTEGRITY'));
 sqlite.exec('DROP TRIGGER ops_quote_frozen_header');sqlite.prepare('UPDATE ops_quotes SET snapshot_json=?,snapshot_sha256=? WHERE public_id=?').run(original.snapshot_json,original.snapshot_sha256,quote.public_id);sqlite.exec(guard);
});
await test('future-version requests cannot sign a stale header after a concurrent edit',async()=>{
 const fixture=(await api('',{method:'POST',body:payload({customer_id:'CUS-two',opportunity_id:null,terms:'Original terms'})})).data.data;
 const original=db.batch.bind(db);let injected=false;
 db.batch=async statements=>{const results=await original(statements);if(!injected&&statements[0].sql.startsWith('SELECT public_id,quote_number')&&statements[0].values[0]===fixture.public_id){injected=true;sqlite.prepare('UPDATE ops_quotes SET terms=?,version=version+1 WHERE public_id=?').run('Concurrent terms',fixture.public_id);}return results;};
 let r;
 try{r=await api('/'+fixture.public_id+'/issue',{method:'POST',body:{version:fixture.version+1}});}finally{db.batch=original;}
 assert.equal(injected,true);assert.equal(r.response.status,409);const current=await get(fixture.public_id);assert.equal(current.status,'draft');assert.equal(current.terms,'Concurrent terms');
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM crm_audit WHERE entity_id=? AND action='issued'").get(fixture.public_id).n,0);
 const fresh=await api('/'+fixture.public_id+'/issue',{method:'POST',body:{version:current.version}});assert.equal(fresh.response.status,200);
 assert.ok((await document(fixture.public_id)).text.includes('Concurrent terms'));
 assert.equal((await api('/'+fixture.public_id+'/status',{method:'POST',body:{version:fresh.data.data.version+1,status:'accepted'}})).response.status,409);
 assert.equal((await api('/'+fixture.public_id+'/revise',{method:'POST',body:{version:fresh.data.data.version+1}})).response.status,409);
});
await test('issued business dates and timezone stay frozen across later workspace changes',async()=>{
 const RealDate=Date,originalZone=env.ADMIN_TIMEZONE,instant='2026-11-02T16:30:00.000Z';
 globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[instant]));}static now(){return new RealDate(instant).getTime();}};
 let fixture;
 try{
   env.ADMIN_TIMEZONE='Asia/Singapore';fixture=(await api('',{method:'POST',body:payload({customer_id:'CUS-two',opportunity_id:null})})).data.data;
   assert.ok(fixture.quote_number.startsWith('QT-20261103-'));
   assert.equal((await api('/'+fixture.public_id+'/issue',{method:'POST',body:{version:fixture.version}})).response.status,200);
 }finally{globalThis.Date=RealDate;}
 try{
   env.ADMIN_TIMEZONE='UTC';const r=await document(fixture.public_id);assert.equal(r.response.status,200);assert.ok(r.text.includes('Issue date: 2026-11-03'));
   const snapshot=JSON.parse(sqlite.prepare('SELECT snapshot_json FROM ops_quotes WHERE public_id=?').get(fixture.public_id).snapshot_json);assert.equal(snapshot.timezone,'Asia/Singapore');assert.equal(snapshot.issued_date,'2026-11-03');assert.equal(snapshot.created_date,'2026-11-03');
 }finally{if(originalZone===undefined)delete env.ADMIN_TIMEZONE;else env.ADMIN_TIMEZONE=originalZone;}
});
await test('four print label locales preserve snapshot body, reference and exact stored amounts',async()=>{
 const before=sqlite.prepare('SELECT snapshot_json,snapshot_sha256,total_minor FROM ops_quotes WHERE public_id=?').get(quote.public_id);
 for(const [lang,title]of[['en','Quotation'],['zh','报价单'],['de','Angebot'],['ja','見積書']]){
   const r=await document(quote.public_id,{lang});assert.equal(r.response.status,200);assert.ok(r.text.includes(title));assert.ok(r.text.includes(quote.quote_number));assert.ok(r.text.includes('工厂验收条款'));assert.ok(r.text.includes(lang==='zh'?'lang="zh-CN"':`lang="${lang}"`));
 }
 const after=sqlite.prepare('SELECT snapshot_json,snapshot_sha256,total_minor FROM ops_quotes WHERE public_id=?').get(quote.public_id);assert.deepEqual(after,before);
 const css=(await document('',{asset:'print.css'})).text;assert.ok(css.includes('counter(page)'));assert.ok(css.includes('counter(pages)'));assert.ok(css.includes('footer{display:none}'));assert.ok(!css.includes('position:fixed'));
});
await test('internal external-result notes remain in the workspace and never enter customer print in any locale',async()=>{
 const current=await get(quote.public_id);assert.ok(current.outcome_note.includes('INTERNAL OUTCOME'));
 for(const lang of ['en','zh','de','ja']){const r=await document(quote.public_id,{lang});assert.equal(r.response.status,200);assert.ok(!r.text.includes('INTERNAL OUTCOME'));assert.ok(!r.text.includes(current.outcome_note));}
 assert.equal((await get(quote.public_id)).outcome_note,current.outcome_note);
});
await test('per-document print reference CSS stays authenticated, escaped and outside body content',async()=>{
 const r=await document(quote.public_id,{referenceCss:true,lang:'ja'});assert.equal(r.response.status,200);assert.ok(r.response.headers.get('content-type').includes('text/css'));assert.ok(r.response.headers.get('cache-control').includes('no-store'));assert.ok(r.text.includes('@bottom-left'));assert.ok(r.text.includes(quote.quote_number));assert.ok(r.text.includes('改訂'));
 assert.equal((await document(quote.public_id,{referenceCss:true,actor:null})).response.status,401);assert.equal((await document('missing',{referenceCss:true})).response.status,404);
 const head=await document(quote.public_id,{referenceCss:true,method:'HEAD'});assert.equal(head.response.status,200);assert.equal(head.text,'');
 assert.ok((await document(quote.public_id,{referenceCss:true,lang:'unknown'})).text.includes('Revision'));
 const page=await document(quote.public_id);assert.ok(page.text.includes('/'+quote.public_id+'/print.css?lang=en'));
 const escaped=renderQuoteReferenceCss({document:{quote_number:'Q";\\\n\u0000}body{color:red}',revision:1}});assert.ok(escaped.includes('\\22 '));assert.ok(escaped.includes('\\5c '));assert.ok(escaped.includes('\\a '));assert.ok(!escaped.includes('\n\u0000'));
});

sqlite.close();for(const failure of failures)console.error(`FAIL ${failure.name}\n${failure.stack}`);
console.log(JSON.stringify({passed,failed:failures.length,checks:passed+failures.length,storage:'real SQLite in memory',productionWrites:false},null,2));if(failures.length)process.exitCode=1;
