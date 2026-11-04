/** Run isolated release suites and keep a compact, reproducible source manifest. */
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
// The source gate retains the website platform check in addition to all portable suites.
const suites=[
  'smoke-platform.mjs',
  'smoke-admin-api.mjs',
  'smoke-admin-auth.mjs',
  'smoke-admin-quotes.mjs',
  'smoke-admin-backup.mjs',
  'smoke-admin-aggregation.mjs',
  'test-workspace-experience.mjs',
  'test-operations-core.mjs',
  'test-intelligence.mjs',
  'test-intelligence-cross-review.mjs',
  'test-intelligence-crm-controller.mjs',
  'test-operations-intelligence-review.mjs',
  'test-notifications.mjs',
  'test-operations-bulk-ui.mjs',
  'test-operations-license-issuer.mjs',
  'check-admin-frontend.mjs',
  'check-admin-routes.mjs',
  'test-operations-run-ui.mjs',
  'test-operations-run-review.mjs',
  'test-admin-demo.mjs',
  'test-admin-icons.mjs',
  'test-admin-adviser.mjs',
  'test-admin-chart-interactions.mjs',
  'test-adviser-demo.mjs',
  'test-admin-startup.mjs',
  'test-operations-report-filters.mjs',
  'test-admin-polish.mjs',
  'test-admin-analytics-polish.mjs',
];
const results=[],pending=[...suites];
async function run(file){const started=Date.now();return await new Promise(resolve=>{
  const child=spawn(process.execPath,['scripts/'+file],{windowsHide:true,stdio:['ignore','pipe','pipe']}),chunks=[];
  child.stdout.on('data',data=>chunks.push(data));child.stderr.on('data',data=>chunks.push(data));
  child.once('error',error=>resolve({file,ok:false,error:error.message}));
  child.once('exit',code=>resolve({file,ok:code===0,exit_code:code,duration_ms:Date.now()-started,output:Buffer.concat(chunks).toString().slice(-9000)}));
});}
await Promise.all(Array.from({length:3},async()=>{while(pending.length){const result=await run(pending.shift());results.push(result);process.stdout.write(JSON.stringify({file:result.file,ok:result.ok,duration_ms:result.duration_ms})+'\n');}}));
const source_hashes={};
async function hashTree(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())await hashTree(file);else if(/\.(mjs|sql)$/.test(file))source_hashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');}}
for(const dir of ['src','migrations'])await hashTree(dir);
const report={at:new Date().toISOString(),passed:results.filter(row=>row.ok).length,failed:results.filter(row=>!row.ok).length,suites:results.sort((a,b)=>suites.indexOf(a.file)-suites.indexOf(b.file)),source_hashes,production_writes:false};
const output=process.argv[2]||'artifacts/admin-rebuild-20261103/final-source-checks.json';await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
process.stdout.write(JSON.stringify({passed:report.passed,failed:report.failed})+'\n');if(report.failed)process.exitCode=1;
