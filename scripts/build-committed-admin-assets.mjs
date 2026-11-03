/** Compile immutable Git inputs for release verification; never provisions or deploys. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, realpath, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runValidationCommand } from './verify-admin-distribution.mjs';

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(args,encoding='utf8')=>execFileSync('git',args,{cwd:REPO,encoding,windowsHide:true,maxBuffer:32*1024*1024,timeout:30000});
const within=(target,root)=>target.startsWith(root+path.sep);
const safe=name=>name&&!name.startsWith('/')&&!name.includes('\\')&&!/^[A-Za-z]:/.test(name)&&!/[\x00-\x1f]/.test(name)&&name.split('/').every(part=>part&&part!=='.'&&part!=='..');

export async function buildCommittedAdminAssets(ref){
 assert.match(ref,/^[a-f0-9]{40}$/);assert.equal(git(['rev-parse',ref+'^{commit}']).trim(),ref);
 const repoReal=await realpath(REPO),base=path.join(repoReal,'.wrangler','production-asset-verification');await mkdir(base,{recursive:true});
 const baseReal=await realpath(base);assert.ok(within(baseReal,repoReal),'Verification scratch must remain inside this repository.');
 if(process.platform==='win32')assert.match(baseReal,/^D:\\/i,'Verification scratch must stay on D:.');
 const task=path.join(baseReal,randomUUID());await mkdir(task);assert.ok(within(await realpath(task),baseReal));
 const source=path.join(task,'source'),bundleDir=path.join(task,'bundle');await mkdir(source);await mkdir(bundleDir);await mkdir(path.join(task,'tmp'));
 // The full Worker source is retained. Public website images (1GB+) are not
 // compilation inputs for dynamic admin assets; committed brand files are enough
 // for the unchanged Wrangler assets binding. Static production files have their
 // own exact Git-blob comparison in the release checker.
 const paths=['src','astro/src/data','package.json','package-lock.json','wrangler.toml','public/brand-tokens.css','public/gyutron-logo.svg','public/gyutron-logo-light.svg','public/favicon.ico','public/favicon-32x32.png','public/gyutron-logo-purple.png','public/workspace-assets'];
 const entries=git(['ls-tree','-r',ref,'--',...paths]).trim().split('\n').map(line=>{const match=line.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/);assert.ok(match&&safe(match[3]),'Only safe regular committed source files may be archived.');return{oid:match[2],name:match[3]};});
 const archive=git(['archive','--format=tar',ref,...paths],null),archiveFile=path.join(task,'source.tar');await writeFile(archiveFile,archive,{flag:'wx'});
 execFileSync('tar',['-xf',archiveFile,'-C',source],{windowsHide:true,timeout:30000,stdio:'pipe'});
 // Git archive may apply the repository's EOL attributes. Restore and verify
 // literal committed blob bytes before compilation, independently of checkout filters.
 const blobs=execFileSync('git',['cat-file','--batch'],{cwd:REPO,input:entries.map(entry=>entry.oid).join('\n')+'\n',windowsHide:true,maxBuffer:32*1024*1024,timeout:30000});
 let cursor=0,archiveChangesCorrected=0;
 for(const entry of entries){const target=path.join(source,...entry.name.split('/'));assert.ok(within(target,source));const info=await lstat(target);assert.ok(info.isFile()&&!info.isSymbolicLink(),'Archived input must be a regular file.');const end=blobs.indexOf(10,cursor),header=blobs.subarray(cursor,end).toString('ascii').match(/^([a-f0-9]{40}) blob (\d+)$/);assert.ok(header&&header[1]===entry.oid,'Committed blob stream is invalid.');const size=Number(header[2]);cursor=end+1;const bytes=blobs.subarray(cursor,cursor+size);cursor+=size;assert.equal(blobs[cursor++],10);const oid=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');assert.equal(oid,entry.oid);if(!(await readFile(target)).equals(bytes))archiveChangesCorrected++;await writeFile(target,bytes);}
 assert.equal(cursor,blobs.length);
 const pkg=JSON.parse(await readFile(path.join(source,'package.json'),'utf8')),lock=JSON.parse(await readFile(path.join(source,'package-lock.json'),'utf8'));
 const installed=JSON.parse(await readFile(path.join(REPO,'node_modules','wrangler','package.json'),'utf8'));
 assert.equal(pkg.devDependencies.wrangler,'4.93.1');assert.equal(lock.packages['node_modules/wrangler'].version,'4.93.1');assert.equal(installed.version,'4.93.1');
 const wrangler=path.join(REPO,'node_modules','wrangler','bin','wrangler.js');
 const env={WRANGLER_SEND_METRICS:'false',CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_API_KEY:'',CF_API_TOKEN:'',TEMP:path.join(task,'tmp'),TMP:path.join(task,'tmp')};
 await runValidationCommand(process.execPath,[wrangler,'deploy','--dry-run','--config',path.join(source,'wrangler.toml'),'--outdir',bundleDir],source,env,{label:'Wrangler 4.93.1 committed-ref asset build',timeoutMs:120000});
 const bundleFile=path.join(bundleDir,'worker.js'),bytes=await readFile(bundleFile),esmFile=path.join(bundleDir,'worker.mjs');await writeFile(esmFile,bytes,{flag:'wx'});
 const worker=(await import(pathToFileURL(esmFile).href)).default;assert.equal(typeof worker?.fetch,'function');
 const shell=await readFile(path.join(source,'src','admin','shell.mjs'),'utf8'),assetPaths=[...new Set([...shell.matchAll(/['"](\/admin\/assets\/[a-zA-Z0-9._-]+)['"]\s*:/g)].map(match=>match[1]))];assert.ok(assetPaths.length>=14,'The committed shell must enumerate all dynamic admin assets.');
 const assets=new Map();for(const asset of assetPaths){const response=await worker.fetch(new Request('https://www.gyutron.com'+asset),{}, {waitUntil(){throw Error('Static asset extraction must not schedule business work.');}});assert.equal(response.status,200,asset);assert.match(response.headers.get('content-type')||'',/^text\/(?:javascript|css)/,asset);assets.set(asset,Buffer.from(await response.arrayBuffer()));}
 return{assets,metadata:{expected_from_compiled_committed_source:true,ref,wrangler:'4.93.1',source_tree:git(['rev-parse',ref+'^{tree}']).trim(),source_files_verified:entries.length,source_bytes_from_git_blobs:true,archive_eol_changes_corrected:archiveChangesCorrected,source_archive_sha256:hash(archive),bundle_sha256:hash(bytes),config_sha256:hash(await readFile(path.join(source,'wrangler.toml'))),asset_count:assets.size,scratch:task,static_asset_scope:'Committed brand assets only; dynamic Worker source is complete. Static production assets are checked separately.',provisioned_resources:false,deployed:false}};
}
