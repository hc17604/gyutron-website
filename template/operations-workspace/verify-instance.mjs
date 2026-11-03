/** Offline entry/lock checks. Does not provision or deploy anything. */
import assert from 'node:assert/strict';
import { readFile,access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(Number(process.versions.node.split('.')[0]),24,'Use Node 24.');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')),lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
assert.equal(pkg.devDependencies.wrangler,'4.93.1');assert.equal(lock.packages['node_modules/wrangler'].version,'4.93.1');assert.equal(lock.packages[''].name,pkg.name);assert.equal(lock.packages[''].version,pkg.version);assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
for(const migration of ['0001_init.sql','0002_order_intents.sql','0003_admin_workspace.sql','0004_admin_identity.sql','0005_crm_relation_guards.sql','0006_operations_quotes.sql','0007_operations.sql','0008_intelligence.sql','0009_workspace_experience.sql','0010_workspace_notifications.sql'])await access(path.join(root,'migrations',migration));
for(const forbidden of ['src/api/forms.mjs','src/api/data.mjs','src/contact-handler.mjs','src/api/order-intents.mjs','shop'])await assert.rejects(access(path.join(root,forbidden)));
const entry=await readFile(path.join(root,'src/worker.mjs'),'utf8');assert.ok(!/handleDataApi|handleFormRequest|handleContactRequest|isShopHost/.test(entry));
const worker=(await import('../src/worker.mjs')).default;
const env={ASSETS:{async fetch(){return new Response('permitted asset');}}},ctx={waitUntil(){}};
async function request(url,method='GET'){return worker.fetch(new Request('https://instance.example.test'+url,{method}),env,ctx);}
const health=await request('/health');assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok'});assert.equal((await request('/')).headers.get('location'),'/admin');
for(const url of ['/api/v1/leads','/api/contact','/api/rfq','/api/order-intents','/shop/','/backup.sql','/.dev.vars'])assert.equal((await request(url,url.startsWith('/api/')?'POST':'GET')).status,404,url);
assert.equal((await request('/admin/api/customers')).status,401);assert.equal((await request('/brand-tokens.css')).status,200);assert.equal((await request('/brand-tokens.css','POST')).status,404);
console.log(JSON.stringify({ok:true,nodeMajor:24,wrangler:'4.93.1',entry:'operations-only',provisionedResources:false,deployed:false}));
