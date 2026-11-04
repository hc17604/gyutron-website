/** Assemble a source-only Operations distribution from a committed dependency closure. */
import { readFile,writeFile,mkdir,access,rename,lstat,realpath } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash,randomUUID } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import {CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET} from '../src/admin/charts-runtime-url.mjs';

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const TEMPLATE='template/operations-workspace';
const SMOKES=['smoke-admin-api.mjs','smoke-admin-auth.mjs','smoke-admin-quotes.mjs','smoke-admin-backup.mjs','smoke-admin-aggregation.mjs','test-workspace-experience.mjs','test-operations-core.mjs','test-intelligence.mjs','test-intelligence-cross-review.mjs','test-intelligence-crm-controller.mjs','test-operations-intelligence-review.mjs','test-notifications.mjs','test-operations-bulk-ui.mjs','test-operations-license-issuer.mjs','check-admin-frontend.mjs','check-admin-routes.mjs','test-operations-run-ui.mjs','test-operations-run-review.mjs','test-admin-demo.mjs','test-admin-icons.mjs','test-admin-adviser.mjs','test-admin-chart-interactions.mjs','test-adviser-demo.mjs','test-admin-startup.mjs','test-operations-report-filters.mjs','test-admin-polish.mjs','test-admin-analytics-polish.mjs'];
const TOOLS=['generate-admin-test-mode.mjs','recover-workspace.mjs','check-restored-workspace.mjs','local-source-sync.mjs','issue-instance-license.mjs'];
const MIGRATIONS=['0001_init.sql','0002_order_intents.sql','0003_admin_workspace.sql','0004_admin_identity.sql','0005_crm_relation_guards.sql','0006_operations_quotes.sql','0007_operations.sql','0008_intelligence.sql','0009_workspace_experience.sql','0010_workspace_notifications.sql','0011_analytics_observations.sql'];
const ASSETS=['brand-tokens.css','gyutron-logo-light.svg','gyutron-logo.svg','favicon.ico','favicon-32x32.png','gyutron-logo-purple.png','workspace-assets/gyutron-mark.png','workspace-assets/fonts/inter-latin.woff2','workspace-assets/fonts/OFL.txt',...[CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET].map(asset=>asset.slice(1))];
const DOCS=['admin-commercial-deployment.md','admin-backup-recovery.md','admin-technology-notices.md','admin-demo-mode.md','admin-data-adviser.md','admin-ui-polish.md'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const slash=value=>value.split(path.sep).join('/');
function git(args){const result=spawnSync('git',args,{cwd:REPO,encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});if(result.status!==0)throw Error('Git provenance check failed: '+String(result.stderr||result.error?.message||'unknown error').trim());return result.stdout.trim();}
function safeRelative(value){if(!value||value.startsWith('/')||value.includes('\\')||value.split('/').some(part=>['','..','.'].includes(part))||/^[A-Za-z]:/.test(value))throw Error('Unsafe distribution path: '+value);return value;}
async function exists(value){try{await access(value);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
function runNode(script,args){console.log('[package] START '+path.basename(script)+' (verification limit 10min; outer cleanup allowance 10s)');const result=spawnSync(process.execPath,[script,...args],{cwd:REPO,stdio:'inherit',windowsHide:true,timeout:610000,killSignal:'SIGTERM'});if(result.error||result.status!==0)throw Error('Distribution verification failed'+(result.error?.code==='ETIMEDOUT'?' (outer deadline exceeded)':'')+'. Scratch files are preserved. No release was confirmed.');console.log('[package] PASS '+path.basename(script));}

async function sourceMap(){
  const entry=await readFile(path.join(REPO,TEMPLATE,'worker.mjs'),'utf8');
  const graph=await build({absWorkingDir:REPO,stdin:{contents:entry,resolveDir:path.join(REPO,'src'),sourcefile:'__operations_distribution_entry__.mjs'},entryPoints:[...[...SMOKES,...TOOLS].map(name=>'scripts/'+name),'src/api/admin-quotes.mjs'],outdir:'.wrangler/distribution-graph',bundle:true,write:false,metafile:true,platform:'node',format:'esm',target:'es2024',external:['node:*'],logLevel:'silent'});
  const mapping=new Map();
  for(const input of Object.keys(graph.metafile.inputs)){
    if(path.basename(input)==='__operations_distribution_entry__.mjs'||input==='<stdin>')continue;
    const absolute=path.resolve(REPO,input),relative=slash(path.relative(REPO,absolute));safeRelative(relative);
    if(relative.startsWith('node_modules/'))throw Error('A bundled runtime package requires an explicit distribution/license review: '+relative);
    if(!relative.startsWith('src/')&&![...SMOKES,...TOOLS].some(name=>relative==='scripts/'+name))throw Error('Unexpected dependency outside the Operations source boundary: '+relative);
    mapping.set(relative,relative);
  }
  mapping.delete('src/worker.mjs');mapping.set('src/worker.mjs',TEMPLATE+'/worker.mjs');
  for(const name of ['package.json','package-lock.json','wrangler.example.toml','.gitignore','.node-version','APPLICATION-LICENSE.md','README.md'])mapping.set(name,TEMPLATE+'/'+name);
  mapping.set('scripts/configure-instance.mjs',TEMPLATE+'/configure-instance.mjs');mapping.set('scripts/verify-instance.mjs',TEMPLATE+'/verify-instance.mjs');
  mapping.set('scripts/verify-distribution.mjs','scripts/verify-admin-distribution.mjs');
  for(const name of TOOLS)mapping.set('scripts/'+name,'scripts/'+name);
  for(const name of MIGRATIONS)mapping.set('migrations/'+name,'migrations/'+name);
  for(const name of ASSETS)mapping.set('public/'+name,'public/'+name);
  for(const name of DOCS)mapping.set('docs/'+name,'docs/'+name);
  for(const name of SMOKES)if(!mapping.has('scripts/'+name))throw Error('A required test is missing from the closure: '+name);
  for(const [destination,source]of mapping){safeRelative(destination);if(!(await exists(path.join(REPO,source))))throw Error('Missing distribution source: '+source);}
  return mapping;
}
async function verifyTemplateLock(){
  const pkg=JSON.parse(await readFile(path.join(REPO,TEMPLATE,'package.json'),'utf8')),lock=JSON.parse(await readFile(path.join(REPO,TEMPLATE,'package-lock.json'),'utf8')),upstream=JSON.parse(await readFile(path.join(REPO,'package-lock.json'),'utf8'));
  if(pkg.engines.node!=='>=24 <25'||pkg.devDependencies.wrangler!=='4.93.1'||lock.packages['node_modules/wrangler']?.version!=='4.93.1')throw Error('Distribution runtime versions are not the accepted Node 24 / Wrangler 4.93.1 versions.');
  const normalize=value=>{const copy=structuredClone(value);delete copy.name;delete copy.version;delete copy.packages[''].name;delete copy.packages[''].version;return copy;};
  if(JSON.stringify(normalize(lock))!==JSON.stringify(normalize(upstream)))throw Error('The distribution package lock no longer matches the complete accepted dependency tree. Regenerate and verify it.');
  if(lock.name!==pkg.name||lock.version!==pkg.version||lock.packages[''].name!==pkg.name||lock.packages[''].version!==pkg.version)throw Error('Package and lock identity differ.');
}
function dirtySources(sources){
  const relevant=[...new Set([...sources,'package.json','package-lock.json','wrangler.toml','scripts/package-admin-workspace.mjs','scripts/verify-admin-distribution.mjs','.github/workflows/verify.yml'])];
  return{relevant,dirty:git(['status','--porcelain=v1','--untracked-files=all','--',...relevant])};
}
function assertCommitted(relevant){
  const tracked=new Set(git(['ls-files','--',...relevant]).split('\n').filter(Boolean));
  for(const source of relevant)if(!tracked.has(source))throw Error('Untracked implementation cannot be distributed: '+source);
  const dirty=git(['status','--porcelain=v1','--untracked-files=all','--',...relevant]);if(dirty)throw Error('Relevant implementation has uncommitted changes. Commit the reviewed source before packaging.\n'+dirty);
}
async function assemble(stage,mapping,sourceCommit,preview){
  await mkdir(stage,{recursive:false});
  const records=[],sourceRecords=[];
  for(const [destination,source]of [...mapping].sort(([a],[b])=>a.localeCompare(b))){
    const sourcePath=path.join(REPO,source),info=await lstat(sourcePath);if(!info.isFile()||info.isSymbolicLink())throw Error('Distribution sources must be regular files: '+source);
    const bytes=await readFile(sourcePath),target=path.join(stage,...destination.split('/'));await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'});
    records.push({path:destination,bytes:bytes.length,sha256:sha(bytes),source});sourceRecords.push({path:source,sha256:sha(bytes)});
  }
  const lock=JSON.parse(await readFile(path.join(stage,'package-lock.json'),'utf8'));
  const dependencies=Object.entries(lock.packages).filter(([name])=>name).map(([location,item])=>({location,version:item.version,license:item.license||'Inspect installed package license',integrity:item.integrity||null,resolved:item.resolved||null,optional:Boolean(item.optional)}));
  const dependencyBytes=Buffer.from(JSON.stringify({format:1,nodeMajor:24,wrangler:'4.93.1',includesInstalledDependencies:false,packages:dependencies},null,2)+'\n');await writeFile(path.join(stage,'DEPENDENCY-MANIFEST.json'),dependencyBytes,{flag:'wx'});records.push({path:'DEPENDENCY-MANIFEST.json',bytes:dependencyBytes.length,sha256:sha(dependencyBytes),source:'generated from accepted package-lock.json'});
  const manifest={format:1,product:'GYUTRON Operations',source_commit:sourceCommit,generated_at:new Date().toISOString(),preview_only:preview,node_major:24,wrangler:'4.93.1',migration_max:'0011_analytics_observations.sql',entry:'src/worker.mjs',scope:'dedicated Operations instance; no public forms, Data API or Shop host routing',files:records.sort((a,b)=>a.path.localeCompare(b.path)),source_files:[...new Map(sourceRecords.map(record=>[record.path,record])).values()].sort((a,b)=>a.path.localeCompare(b.path))};
  const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');await writeFile(path.join(stage,'SOURCE-MANIFEST.json'),manifestBytes,{flag:'wx'});
  const checksums=[...manifest.files.map(record=>record.sha256+'  '+record.path),sha(manifestBytes)+'  SOURCE-MANIFEST.json'].sort().join('\n')+'\n';await writeFile(path.join(stage,'FILE-SHA256SUMS.txt'),checksums,{flag:'wx'});
  return manifest;
}

const crcTable=Array.from({length:256},(_,index)=>{let value=index;for(let bit=0;bit<8;bit++)value=(value&1)?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
function crc32(bytes){let value=0xffffffff;for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);return(value^0xffffffff)>>>0;}
async function zip(stage,manifest){
  const local=[],central=[];let offset=0;
  const names=[...manifest.files.map(record=>record.path),'SOURCE-MANIFEST.json','FILE-SHA256SUMS.txt'].sort();
  for(const name of names){const filename=Buffer.from(safeRelative(name),'utf8'),raw=await readFile(path.join(stage,...name.split('/'))),compressed=deflateRawSync(raw,{level:9}),crc=crc32(raw);
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(raw.length,22);header.writeUInt16LE(filename.length,26);local.push(header,filename,compressed);
    const directory=Buffer.alloc(46);directory.writeUInt32LE(0x02014b50,0);directory.writeUInt16LE(20,4);directory.writeUInt16LE(20,6);directory.writeUInt16LE(0x800,8);directory.writeUInt16LE(8,10);directory.writeUInt16LE(0x21,14);directory.writeUInt32LE(crc,16);directory.writeUInt32LE(compressed.length,20);directory.writeUInt32LE(raw.length,24);directory.writeUInt16LE(filename.length,28);directory.writeUInt32LE(offset,42);central.push(directory,filename);offset+=header.length+filename.length+compressed.length;
  }
  const centralBytes=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(centralBytes.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,centralBytes,end]);
}

async function main(){
  if(Number(process.versions.node.split('.')[0])!==24)throw Error('Use Node 24 for reproducible packaging.');
  const args=process.argv.slice(2);if(args.some(arg=>!['--self-check','--install','--skip-tests'].includes(arg)))throw Error('Usage: node scripts/package-admin-workspace.mjs [--self-check] [--install] [--skip-tests]');
  if(args.includes('--skip-tests')&&!args.includes('--self-check'))throw Error('A final distribution cannot skip its smoke tests.');
  const preview=args.includes('--self-check'),mapping=await sourceMap();await verifyTemplateLock();
  const {relevant,dirty}=dirtySources([...mapping.values()]);if(!preview)assertCommitted(relevant);
  const sourceCommit=git(['rev-parse','HEAD']),name='gyutron-operations-'+new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14)+'-'+sourceCommit.slice(0,12);
  const outputRoot=preview?path.join(REPO,'.wrangler','distribution-self-check'):path.resolve(REPO,'..','..','outputs','admin-rebuild-20261103');await mkdir(outputRoot,{recursive:true});
  const stage=path.join(outputRoot,'.staging-'+randomUUID()),manifest=await assemble(stage,mapping,sourceCommit,preview);
  runNode(path.join(REPO,'scripts/verify-admin-distribution.mjs'),['--dir',stage,...(preview?['--allow-preview']:[]),...(!args.includes('--skip-tests')?['--test']:[]),'--build',...(args.includes('--install')?['--install']:[])]);
  if(preview){console.log(JSON.stringify({preview_only:true,source_commit:sourceCommit,relevant_dirty:Boolean(dirty),directory:stage,archive_created:false,provisioned_resources:false,deployed:false},null,2));return;}
  assertCommitted(relevant);
  for(const item of manifest.source_files)if(sha(await readFile(path.join(REPO,item.path)))!==item.sha256)throw Error('Source changed while preparing the distribution: '+item.path);
  const realRoot=await realpath(outputRoot),destination=path.join(outputRoot,name);if(!path.resolve(stage).startsWith(path.resolve(realRoot)+path.sep)||!path.resolve(destination).startsWith(path.resolve(realRoot)+path.sep))throw Error('The distribution paths escaped the intended output directory.');
  if(await exists(destination))throw Error('A release directory with this name already exists. Retry after a second.');
  await rename(stage,destination);
  const archivePath=path.join(outputRoot,name+'.zip'),bytes=await zip(destination,manifest);await writeFile(archivePath,bytes,{flag:'wx'});
  const sourceManifest=await readFile(path.join(destination,'SOURCE-MANIFEST.json')),manifestPath=path.join(outputRoot,name+'.source-manifest.json');await writeFile(manifestPath,sourceManifest,{flag:'wx'});
  const checksumsPath=path.join(outputRoot,name+'.SHA256SUMS.txt');await writeFile(checksumsPath,sha(bytes)+'  '+path.basename(archivePath)+'\n'+sha(sourceManifest)+'  '+path.basename(manifestPath)+'\n',{flag:'wx'});
  runNode(path.join(REPO,'scripts/verify-admin-distribution.mjs'),['--dir',destination,'--archive',archivePath]);
  console.log(JSON.stringify({source_commit:sourceCommit,directory:destination,zip:archivePath,sha256:sha(bytes),source_manifest:manifestPath,checksums:checksumsPath,provisioned_resources:false,deployed:false},null,2));
}
main().catch(error=>{console.error('Operations distribution failed: '+error.message);process.exitCode=1;});
