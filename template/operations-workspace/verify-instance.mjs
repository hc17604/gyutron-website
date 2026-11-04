/** Offline entry/lock checks. Does not provision or deploy anything. */
import assert from 'node:assert/strict';
import {CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET} from '../src/admin/charts-runtime-url.mjs';
import { readFile,access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(Number(process.versions.node.split('.')[0]),24,'Use Node 24.');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')),lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
assert.equal(pkg.devDependencies.wrangler,'4.93.1');assert.equal(lock.packages['node_modules/wrangler'].version,'4.93.1');assert.equal(lock.packages[''].name,pkg.name);assert.equal(lock.packages[''].version,pkg.version);assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
for(const migration of ['0001_init.sql','0002_order_intents.sql','0003_admin_workspace.sql','0004_admin_identity.sql','0005_crm_relation_guards.sql','0006_operations_quotes.sql','0007_operations.sql','0008_intelligence.sql','0009_workspace_experience.sql','0010_workspace_notifications.sql','0011_analytics_observations.sql'])await access(path.join(root,'migrations',migration));
for(const forbidden of ['src/api/forms.mjs','src/api/data.mjs','src/contact-handler.mjs','src/api/order-intents.mjs','shop'])await assert.rejects(access(path.join(root,forbidden)));
const entry=await readFile(path.join(root,'src/worker.mjs'),'utf8');assert.ok(!/handleDataApi|handleFormRequest|handleContactRequest|isShopHost/.test(entry));
const worker=(await import('../src/worker.mjs')).default;
const env={ASSETS:{async fetch(request){const pathname=new URL(request.url).pathname;const bytes=await readFile(path.join(root,'public',...pathname.slice(1).split('/')));return new Response(request.method==='HEAD'?null:bytes);}}},ctx={waitUntil(){}};
async function request(url,method='GET'){return worker.fetch(new Request('https://instance.example.test'+url,{method}),env,ctx);}
const health=await request('/health');assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok'});assert.equal((await request('/')).headers.get('location'),'/admin');
for(const url of ['/api/v1/leads','/api/contact','/api/rfq','/api/order-intents','/shop/','/backup.sql','/.dev.vars'])assert.equal((await request(url,url.startsWith('/api/')?'POST':'GET')).status,404,url);
assert.equal((await request('/admin/api/customers')).status,401);assert.equal((await request('/brand-tokens.css')).status,200);assert.equal((await request('/brand-tokens.css','POST')).status,404);
const brandAssets=['/gyutron-logo-purple.png','/workspace-assets/gyutron-mark.png','/workspace-assets/fonts/inter-latin.woff2','/workspace-assets/fonts/OFL.txt',CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET];
for(const asset of brandAssets){const response=await request(asset);assert.equal(response.status,200,asset);assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(path.join(root,'public',...asset.slice(1).split('/'))),asset);const head=await request(asset,'HEAD');assert.equal(head.status,200,asset);assert.equal(await head.text(),'');assert.equal((await request(asset,'POST')).status,404,asset);}
console.log(JSON.stringify({ok:true,nodeMajor:24,wrangler:'4.93.1',entry:'operations-only',brandAssetRoutesVerified:brandAssets.length,brandAssetBodiesMatchPackagedFiles:true,provisionedResources:false,deployed:false}));
