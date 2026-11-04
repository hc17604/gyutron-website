/** Independent artifact verification. All optional installs/builds run in scratch copies. */
import { readFile,writeFile,mkdir,readdir,lstat,access,copyFile,realpath } from 'node:fs/promises';
import { spawn,spawnSync } from 'node:child_process';
import { createHash,randomUUID } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TOOL_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORTABLE_SUITES=['smoke-admin-api.mjs','smoke-admin-auth.mjs','smoke-admin-quotes.mjs','smoke-admin-backup.mjs','smoke-admin-aggregation.mjs','test-workspace-experience.mjs','test-operations-core.mjs','test-intelligence.mjs','test-intelligence-cross-review.mjs','test-intelligence-crm-controller.mjs','test-operations-intelligence-review.mjs','test-notifications.mjs','test-operations-bulk-ui.mjs','test-operations-license-issuer.mjs','check-admin-frontend.mjs','check-admin-routes.mjs','test-operations-run-ui.mjs','test-operations-run-review.mjs','test-admin-demo.mjs','test-admin-icons.mjs','test-admin-adviser.mjs','test-admin-chart-interactions.mjs','test-adviser-demo.mjs','test-admin-startup.mjs','test-operations-report-filters.mjs','test-admin-polish.mjs','test-admin-analytics-polish.mjs'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const crcTable=Array.from({length:256},(_,index)=>{let value=index;for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
function crc32(bytes){let value=0xffffffff;for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);return(value^0xffffffff)>>>0;}
function safe(value){if(!value||value.startsWith('/')||value.includes('\\')||value.split('/').some(part=>['','..','.'].includes(part))||/^[a-z]:/i.test(value))throw Error('Unsafe artifact path: '+value);return value;}
async function exists(value){try{await access(value);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function walk(root,prefix=''){const files=[];for(const entry of await readdir(path.join(root,prefix),{withFileTypes:true})){const relative=prefix?prefix+'/'+entry.name:entry.name;if(entry.isSymbolicLink())throw Error('Artifact contains a symbolic link: '+relative);if(entry.isDirectory())files.push(...await walk(root,relative));else if(entry.isFile())files.push(safe(relative));else throw Error('Unexpected artifact entry: '+relative);}return files;}
/** Run only the requested validation process, with visible progress and bounded cleanup. */
export async function runValidationCommand(executable,args,cwd,extraEnv={}, {label=path.basename(executable),timeoutMs=120000,heartbeatMs=15000}={}){
 if(!Number.isFinite(timeoutMs)||timeoutMs<=0)throw Error('Validation deadline exceeded before '+label+'. Scratch files are preserved.');
 const started=Date.now();console.log('[validation] START '+label+' (limit '+Math.ceil(timeoutMs/1000)+'s)');
 const child=spawn(executable,args,{cwd,stdio:'inherit',windowsHide:true,shell:false,detached:process.platform!=='win32',env:{...process.env,...extraEnv}});
 await new Promise((resolve,reject)=>{
  let stoppedFor=null,finished=false;
  const stop=reason=>{
   if(finished||stoppedFor)return;stoppedFor=reason;
   if(!child.pid)return;
   if(process.platform==='win32'){
    // PID is supplied by spawn; no shell, command interpolation or filesystem cleanup.
    const killer=path.join(process.env.SystemRoot||'C:\\Windows','System32','taskkill.exe');
    const result=spawnSync(killer,['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true,timeout:5000});
    if(result.status!==0)try{child.kill('SIGKILL');}catch{/* Already exited. */}
   }else try{process.kill(-child.pid,'SIGKILL');}catch{try{child.kill('SIGKILL');}catch{/* Already exited. */}}
  };
  const onInterrupt=()=>stop('interrupted'),onTerminate=()=>stop('terminated');
  process.once('SIGINT',onInterrupt);process.once('SIGTERM',onTerminate);
  const timer=setTimeout(()=>stop('timed out after '+Math.ceil(timeoutMs/1000)+'s'),timeoutMs);
  const heartbeat=setInterval(()=>console.log('[validation] RUNNING '+label+' ('+Math.floor((Date.now()-started)/1000)+'s, pid '+child.pid+')'),heartbeatMs);
  const finish=(error,code,signal)=>{
   if(finished)return;finished=true;clearTimeout(timer);clearInterval(heartbeat);process.removeListener('SIGINT',onInterrupt);process.removeListener('SIGTERM',onTerminate);
   if(error||stoppedFor||code!==0){reject(Error('Validation '+label+' '+(stoppedFor||error?.message||'failed with '+(signal||'exit '+code))+'. Scratch files are preserved.'));return;}
   console.log('[validation] PASS '+label+' ('+((Date.now()-started)/1000).toFixed(1)+'s)');resolve();
  };
  child.once('error',error=>finish(error));child.once('close',(code,signal)=>finish(null,code,signal));
 });
}
async function npmCli(){
 const candidates=[process.env.npm_execpath,path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js')].filter(Boolean);
 for(const directory of (process.env.PATH || '').split(path.delimiter))if(directory){const executable=path.join(directory,process.platform==='win32'?'npm.cmd':'npm');if(await exists(executable)){const resolved=await realpath(executable);candidates.push(resolved,path.join(path.dirname(resolved),'node_modules/npm/bin/npm-cli.js'));}}
 for(const candidate of candidates)if(candidate.endsWith('npm-cli.js')&&await exists(candidate))return candidate;
 throw Error('The npm CLI could not be located. Install Node 24 with npm.');
}
async function verifyArchive(filename,expected){
 const bytes=await readFile(filename);if(bytes.length>64*1024*1024)throw Error('Distribution archive is unexpectedly large.');let end=-1;
 for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset--)if(bytes.readUInt32LE(offset)===0x06054b50){end=offset;break;}
 if(end<0)throw Error('ZIP end record is missing.');const count=bytes.readUInt16LE(end+10),central=bytes.readUInt32LE(end+16);let cursor=central,total=0;const names=new Set();
 for(let index=0;index<count;index++){
  if(bytes.readUInt32LE(cursor)!==0x02014b50)throw Error('Invalid ZIP central directory.');
  const method=bytes.readUInt16LE(cursor+10),crc=bytes.readUInt32LE(cursor+16),packed=bytes.readUInt32LE(cursor+20),size=bytes.readUInt32LE(cursor+24),nameLength=bytes.readUInt16LE(cursor+28),extra=bytes.readUInt16LE(cursor+30),comment=bytes.readUInt16LE(cursor+32),local=bytes.readUInt32LE(cursor+42),name=safe(bytes.subarray(cursor+46,cursor+46+nameLength).toString('utf8'));
  if(names.has(name)||!expected.has(name))throw Error('Unexpected or duplicated ZIP member: '+name);names.add(name);total+=size;if(size>16*1024*1024||total>64*1024*1024)throw Error('ZIP expansion exceeds source artifact bounds.');
  if(bytes.readUInt32LE(local)!==0x04034b50)throw Error('Invalid ZIP local header.');
  const start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28),data=bytes.subarray(start,start+packed),raw=method===8?inflateRawSync(data,{maxOutputLength:16*1024*1024}):method===0?data:null;
  if(!raw||raw.length!==size||crc32(raw)!==crc||sha(raw)!==expected.get(name))throw Error('ZIP member integrity failed: '+name);
  cursor+=46+nameLength+extra+comment;
 }
 if(names.size!==expected.size)throw Error('ZIP omits a manifest file.');return{members:names.size,bytes:bytes.length,sha256:sha(bytes)};
}
async function main(){
 if(Number(process.versions.node.split('.')[0])!==24)throw Error('Use Node 24.');
 const options={};for(let index=2;index<process.argv.length;index++){const arg=process.argv[index];if(['--dir','--archive'].includes(arg)){if(options[arg]||!process.argv[index+1])throw Error('Supply each path once.');options[arg]=path.resolve(process.argv[++index]);}else if(['--allow-preview','--test','--build','--install'].includes(arg))options[arg]=true;else throw Error('Unknown verification option: '+arg);}
 const root=options['--dir'];if(!root)throw Error('Usage: node scripts/verify-admin-distribution.mjs --dir <directory> [--archive <zip>] [--test] [--build] [--install]');
 const manifest=JSON.parse(await readFile(path.join(root,'SOURCE-MANIFEST.json'),'utf8'));
 if(manifest.format!==1||!/^[a-f0-9]{40}$/.test(manifest.source_commit)||!Array.isArray(manifest.files)||manifest.node_major!==24||manifest.wrangler!=='4.93.1')throw Error('Unsupported source manifest.');
 if(manifest.preview_only&&!options['--allow-preview'])throw Error('Preview-only sources are not a commercial release.');
 const expected=new Map(),lower=new Set();for(const item of manifest.files){safe(item.path);if(lower.has(item.path.toLowerCase()))throw Error('Case-insensitive duplicate artifact path.');lower.add(item.path.toLowerCase());const bytes=await readFile(path.join(root,...item.path.split('/')));if(bytes.length!==item.bytes||sha(bytes)!==item.sha256)throw Error('Source integrity failed: '+item.path);expected.set(item.path,item.sha256);}
 for(const name of ['SOURCE-MANIFEST.json','FILE-SHA256SUMS.txt'])expected.set(name,sha(await readFile(path.join(root,name))));
 const files=await walk(root);if(files.length!==expected.size||files.some(file=>!expected.has(file)))throw Error('Artifact contains unexpected files, local state or installed dependencies.');
 for(const file of files)if(/(?:^|\/)(?:\.git|\.wrangler|node_modules|private-recovery|backups)(?:\/|$)|(?:^|\/)\.dev\.vars|(?:^|\/)\.env(?:\.|$)|\.log$|\.pem$|\.key$|wrangler\.toml$/i.test(file))throw Error('Forbidden private/runtime material in artifact: '+file);
 for(const entry of ['src/api/forms.mjs','src/api/data.mjs','src/contact-handler.mjs','src/api/order-intents.mjs','public/index.html'])if(expected.has(entry))throw Error('Brand/Shop/public data source escaped into Operations distribution: '+entry);
 const checksums=(await readFile(path.join(root,'FILE-SHA256SUMS.txt'),'utf8')).trim().split('\n');
 const checksumMap=new Map(checksums.map(line=>{const match=line.match(/^([a-f0-9]{64})  (.+)$/);if(!match)throw Error('Malformed checksum line.');return[match[2],match[1]];}));
 for(const [file,digest]of expected)if(file!=='FILE-SHA256SUMS.txt'&&checksumMap.get(file)!==digest)throw Error('Checksum list differs from manifest: '+file);
 const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')),lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
 if(pkg.devDependencies.wrangler!=='4.93.1'||lock.packages?.['node_modules/wrangler']?.version!=='4.93.1'||pkg.name!==lock.name||pkg.version!==lock.version||pkg.engines.node!=='>=24 <25'||JSON.stringify(pkg.devDependencies)!==JSON.stringify(lock.packages[''].devDependencies))throw Error('Package and complete lock do not match the accepted runtime.');
 if(pkg.scripts?.test!==PORTABLE_SUITES.map(script=>'node scripts/'+script).join(' && '))throw Error('The portable npm test command differs from the accepted validation suite.');
 for(const script of [...PORTABLE_SUITES,'issue-instance-license.mjs'])if(!expected.has('scripts/'+script))throw Error('Required portable validation or operator tool is missing: '+script);
 const config=await readFile(path.join(root,'wrangler.example.toml'),'utf8');for(const marker of ['REPLACE_WORKER_NAME','REPLACE_DATABASE_NAME','REPLACE_D1_DATABASE_ID','REPLACE_KV_NAMESPACE_ID','REPLACE_R2_BUCKET_NAME'])if(!config.includes(marker))throw Error('Configuration must retain obvious resource placeholders.');
 if(/database_id\s*=\s*"[a-f0-9-]{36}"|\bid\s*=\s*"[a-f0-9]{32}"/i.test(config))throw Error('Real-looking resource IDs must not be preconfigured.');
 const upstreamConfig=path.join(TOOL_ROOT,'wrangler.toml');if(await exists(upstreamConfig)){
  const upstream=await readFile(upstreamConfig,'utf8'),ids=[...upstream.matchAll(/\b(?:database_id|id)\s*=\s*"([a-f0-9-]{32,36})"/gi)].map(match=>match[1]);
  for(const item of manifest.files){if(/\.(ico|png)$/i.test(item.path))continue;const text=await readFile(path.join(root,...item.path.split('/')),'utf8');if(ids.some(value=>text.includes(value)))throw Error('Upstream resource ID leaked into artifact: '+item.path);}
 }
 const archive=options['--archive']?await verifyArchive(options['--archive'],expected):null;
 let scratch=null;
 if(options['--test']||options['--build']||options['--install']){
  const deadline=Date.now()+10*60*1000;
  const execute=(executable,args,cwd,extraEnv={},step={})=>runValidationCommand(executable,args,cwd,extraEnv,{...step,timeoutMs:Math.min(step.timeoutMs||120000,deadline-Date.now())});
  scratch=path.join(TOOL_ROOT,'.wrangler','distribution-verification',randomUUID());await mkdir(scratch,{recursive:true});
  console.log('[validation] Scratch: '+scratch);
  for(const file of files){const destination=path.join(scratch,...file.split('/'));await mkdir(path.dirname(destination),{recursive:true});await copyFile(path.join(root,...file.split('/')),destination);}
  const local=path.join(scratch,'.wrangler','local-check');await mkdir(path.join(local,'tmp'),{recursive:true});
  const childEnv={npm_config_cache:path.join(local,'npm-cache'),TEMP:path.join(local,'tmp'),TMP:path.join(local,'tmp')};
  await writeFile(path.join(local,'empty.npmrc'),'');
  if(options['--install'])await execute(process.execPath,[await npmCli(),'ci','--no-audit','--no-fund','--foreground-scripts','--loglevel=http','--timing','--userconfig',path.join(local,'empty.npmrc'),'--registry','https://registry.npmjs.org'],scratch,childEnv,{label:'npm ci (installation scripts enabled)',timeoutMs:5*60*1000});
  await execute(process.execPath,['scripts/verify-instance.mjs'],scratch,childEnv,{label:'verify-instance.mjs'});
  if(options['--test'])for(const script of PORTABLE_SUITES)await execute(process.execPath,['scripts/'+script],scratch,childEnv,{label:script});
  if(options['--build']){
   const quote=value=>JSON.stringify(value),localConfig=path.join(local,'wrangler.local.toml');
   await writeFile(localConfig,`# LOCAL-ONLY dummy IDs; no remote commands are used.\nname="operations-distribution-local-check"\nmain=${quote(path.join(scratch,'src','worker.mjs'))}\ncompatibility_date="2026-05-18"\ncompatibility_flags=["nodejs_compat"]\n[assets]\ndirectory=${quote(path.join(scratch,'public'))}\nbinding="ASSETS"\nrun_worker_first=true\n[[d1_databases]]\nbinding="DB"\ndatabase_name="local_distribution_check"\ndatabase_id="00000000-0000-4000-8000-000000000000"\nmigrations_dir=${quote(path.join(scratch,'migrations'))}\n[[r2_buckets]]\nbinding="R2"\nbucket_name="local-distribution-check"\n[[kv_namespaces]]\nbinding="RATE_LIMIT"\nid="00000000000000000000000000000000"\n`);
   await writeFile(path.join(local,'.dev.vars'),'ADMIN_PASSWORD=local-distribution-test-only\nADMIN_SECRET=local-distribution-secret-only\nIP_HASH_SALT=local-distribution-salt-only\n');
   let wrangler=path.join(scratch,'node_modules','wrangler','bin','wrangler.js');if(!(await exists(wrangler))){if(options['--install'])throw Error('Clean installation did not provide the pinned Wrangler. Scratch files are preserved.');wrangler=path.join(TOOL_ROOT,'node_modules','wrangler','bin','wrangler.js');}if(!(await exists(wrangler)))throw Error('Install the pinned dependencies with --install before building.');
   await execute(process.execPath,[wrangler,'deploy','--dry-run','--config',localConfig,'--outdir',path.join(local,'bundle')],scratch,childEnv,{label:'Wrangler dry-run (local dummy bindings)'});
  }
 }
 console.log(JSON.stringify({ok:true,source_commit:manifest.source_commit,preview_only:Boolean(manifest.preview_only),files:expected.size,archive,scratch,source_directory_unchanged:true,provisioned_resources:false,deployed:false},null,2));
}
const entry=process.argv[1]?path.resolve(process.argv[1]):null,self=fileURLToPath(import.meta.url);
if(entry&&(process.platform==='win32'?entry.toLowerCase()===self.toLowerCase():entry===self))main().catch(error=>{console.error('Operations distribution verification failed: '+error.message);process.exitCode=1;});
