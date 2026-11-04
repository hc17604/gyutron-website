/** Offline entry/lock checks. Does not provision or deploy anything. */
import assert from 'node:assert/strict';
import {CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET} from '../src/admin/charts-runtime-url.mjs';
import {COUNTRY_NAMES} from '../src/admin/country-data.mjs';
import {readFile,access,mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(Number(process.versions.node.split('.')[0]),24,'Use Node 24.');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')),lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
assert.equal(pkg.devDependencies.wrangler,'4.93.1');assert.equal(lock.packages['node_modules/wrangler'].version,'4.93.1');assert.equal(lock.packages[''].name,pkg.name);assert.equal(lock.packages[''].version,pkg.version);assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
for(const migration of ['0001_init.sql','0002_order_intents.sql','0003_admin_workspace.sql','0004_admin_identity.sql','0005_crm_relation_guards.sql','0006_operations_quotes.sql','0007_operations.sql','0008_intelligence.sql','0009_workspace_experience.sql','0010_workspace_notifications.sql','0011_analytics_observations.sql'])await access(path.join(root,'migrations',migration));
for(const forbidden of ['src/api/forms.mjs','src/api/data.mjs','src/contact-handler.mjs','src/api/order-intents.mjs','shop'])await assert.rejects(access(path.join(root,forbidden)));
const entry=await readFile(path.join(root,'src/worker.mjs'),'utf8');assert.ok(!/handleDataApi|handleFormRequest|handleContactRequest|isShopHost/.test(entry));
// Exercise the exact Wrangler bundle that an instance deploys, without reading real bindings.
// Preview verification may reuse an ancestor's pinned install; installed kits use their own.
let installRoot=root,wrangler;
while(true){const candidate=path.join(installRoot,'node_modules','wrangler','bin','wrangler.js');try{await access(candidate);assert.equal(JSON.parse(await readFile(path.join(installRoot,'node_modules','wrangler','package.json'),'utf8')).version,'4.93.1');wrangler=candidate;break;}catch(error){if(error.code!=='ENOENT')throw error;}const parent=path.dirname(installRoot);if(parent===installRoot)throw Error('Install the pinned dependencies with npm ci before checking the instance.');installRoot=parent;}
const scratch=path.join(root,'.wrangler','instance-check',randomUUID()),bundle=path.join(scratch,'bundle');await mkdir(scratch,{recursive:true});
const config=path.join(scratch,'wrangler.local.json');
await writeFile(config,JSON.stringify({name:'operations-instance-local-check',main:path.join(root,'src','worker.mjs'),compatibility_date:'2026-05-18',compatibility_flags:['nodejs_compat'],assets:{directory:path.join(root,'public'),binding:'ASSETS',run_worker_first:true}}));
console.log('[instance] Compiling the Operations entry with pinned Wrangler (local dry-run).');
const compiled=spawnSync(process.execPath,[wrangler,'deploy','--dry-run','--config',config,'--outdir',bundle],{cwd:root,encoding:'utf8',windowsHide:true,timeout:110000,maxBuffer:4*1024*1024,env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
await writeFile(path.join(scratch,'wrangler-build.log'),String(compiled.stdout||'')+String(compiled.stderr||''));
assert.equal(compiled.error,undefined,compiled.error?.message);assert.equal(compiled.status,0,'Local Wrangler compilation failed. See '+path.join(scratch,'wrangler-build.log'));
const compiledModule=path.join(scratch,'compiled-worker.mjs');await writeFile(compiledModule,await readFile(path.join(bundle,'worker.js')));
const worker=(await import(pathToFileURL(compiledModule).href)).default;
let assetRequests=0;
const env={ASSETS:{async fetch(request){assetRequests++;const pathname=new URL(request.url).pathname;const bytes=await readFile(path.join(root,'public',...pathname.slice(1).split('/')));return new Response(request.method==='HEAD'?null:bytes);}}},ctx={waitUntil(){}};
async function request(url,method='GET'){return worker.fetch(new Request('https://instance.example.test'+url,{method}),env,ctx);}
const health=await request('/health');assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok'});assert.equal((await request('/')).headers.get('location'),'/admin');
for(const url of ['/api/v1/leads','/api/contact','/api/rfq','/api/order-intents','/shop/','/backup.sql','/.dev.vars'])assert.equal((await request(url,url.startsWith('/api/')?'POST':'GET')).status,404,url);
assert.equal((await request('/admin/api/customers')).status,401);assert.equal((await request('/brand-tokens.css')).status,200);assert.equal((await request('/brand-tokens.css','POST')).status,404);
const brandAssets=['/gyutron-logo-purple.png','/workspace-assets/gyutron-mark.png','/workspace-assets/fonts/inter-latin.woff2','/workspace-assets/fonts/OFL.txt',CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET];
const flagNames=Object.keys(COUNTRY_NAMES).map(code=>code.toLowerCase()+'.svg').sort();assert.equal(flagNames.length,249);
const countryAssets=[...flagNames,'LICENSE.txt','manifest.json'].map(name=>'/workspace-assets/flags/'+name);
const flagManifest=JSON.parse(await readFile(path.join(root,'public','workspace-assets','flags','manifest.json'),'utf8'));
assert.deepEqual(Object.keys(flagManifest.flags).sort(),flagNames);
for(const asset of [...brandAssets,...countryAssets]){const bytes=await readFile(path.join(root,'public',...asset.slice(1).split('/')));if(asset.endsWith('.svg')&&asset.startsWith('/workspace-assets/flags/'))assert.equal(createHash('sha256').update(bytes).digest('hex'),flagManifest.flags[path.basename(asset)],asset);const response=await request(asset);assert.equal(response.status,200,asset);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes,asset);const head=await request(asset,'HEAD');assert.equal(head.status,200,asset);assert.equal(await head.text(),'');assert.equal((await request(asset,'POST')).status,404,asset);}
const rejectedAssets=['/workspace-assets/flags/zz.svg','/workspace-assets/flags/eu.svg','/workspace-assets/flags/DE.svg','/workspace-assets/flags/de.SVG','/workspace-assets/flags/%64%65.svg','/workspace-assets/flags/de.svg/extra','/workspace-assets/flags/package.json','/workspace-assets/flags/manifest.json/extra','/workspace-assets/fonts/unknown.woff2','/workspace-assets/unknown.svg','/index.html','/shop/index.html'];
const beforeRejected=assetRequests;
for(const asset of rejectedAssets)for(const method of ['GET','HEAD','POST']){const response=await request(asset,method);assert.equal(response.status,404,method+' '+asset);if(method==='HEAD')assert.equal(await response.text(),'');}
assert.equal(assetRequests,beforeRejected,'Rejected paths must not reach the static asset binding.');
console.log(JSON.stringify({ok:true,nodeMajor:24,wrangler:'4.93.1',entry:'operations-only',compiledWorkerVerified:true,brandAssetRoutesVerified:brandAssets.length,countryFlagsVerified:flagNames.length,countryAssetRoutesVerified:countryAssets.length,assetGetBodiesMatchPackagedFiles:true,assetHeadBodiesEmpty:true,rejectedAssetPathsVerified:rejectedAssets.length,provisionedResources:false,deployed:false}));
