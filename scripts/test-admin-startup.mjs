/** Full browser-client startup from a real Wrangler bundle, with synthetic API replies.
 * No browser, production business request, provisioning or deployment is performed.
 */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';

if(typeof vm.SourceTextModule!=='function'){
  const child=spawnSync(process.execPath,['--experimental-vm-modules',fileURLToPath(import.meta.url),...process.argv.slice(2)],{stdio:'inherit'});
  process.exit(child.status??1);
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratchRoot=path.join(root,'.wrangler','admin-startup-check');mkdirSync(scratchRoot,{recursive:true});
const scratch=mkdtempSync(path.join(scratchRoot,'run-'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const args=process.argv.slice(2),compiledIndex=args.indexOf('--compiled-worker'),workspaceIndex=args.indexOf('--workspace-file');
if(workspaceIndex>=0)assert.ok(args[workspaceIndex+1]&&!args[workspaceIndex+1].startsWith('--'),'--workspace-file requires a local JavaScript file.');
const workspaceFile=workspaceIndex>=0?path.resolve(args[workspaceIndex+1]):null;
let bundle=compiledIndex>=0?path.resolve(args[compiledIndex+1]):null;
let compiledByThisRun=false;
if(!bundle){
  const installed=JSON.parse(readFileSync(path.join(root,'node_modules','wrangler','package.json'),'utf8'));assert.equal(installed.version,'4.93.1');
  let config=path.join(root,'wrangler.toml');
  if(!existsSync(config)){
    config=path.join(scratch,'wrangler.startup.json');
    writeFileSync(config,JSON.stringify({name:'gyutron-startup-check',main:path.join(root,'src','worker.mjs'),compatibility_date:'2026-05-18',compatibility_flags:['nodejs_compat'],keep_names:true},null,2));
  }
  const out=path.join(scratch,'bundle');mkdirSync(out);
  const build=spawnSync(process.execPath,[path.join(root,'node_modules','wrangler','bin','wrangler.js'),'deploy','--dry-run','--config',config,'--outdir',out],{
    cwd:root,encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:8*1024*1024,
    env:{...process.env,CI:'true',WRANGLER_SEND_METRICS:'false',CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_API_KEY:'',CF_API_TOKEN:'',TEMP:scratch,TMP:scratch},
  });
  writeFileSync(path.join(scratch,'wrangler-build.log'),(build.stdout||'')+(build.stderr||''));
  assert.equal(build.status,0,'Real Wrangler startup build failed; see '+path.join(scratch,'wrangler-build.log'));
  bundle=path.join(out,'worker.js');compiledByThisRun=true;
}
const bytes=readFileSync(bundle),esm=path.join(scratch,'compiled-worker.mjs');writeFileSync(esm,bytes);
const worker=(await import(pathToFileURL(esm).href)).default;assert.equal(typeof worker?.fetch,'function');
const assets=new Map();
async function asset(specifier){
  assert.match(specifier,/^\/admin\/assets\/[a-z0-9._-]+\.js$/i,'Only compiled local browser assets may be loaded.');
  if(!assets.has(specifier)){
    const response=await worker.fetch(new Request('https://startup.example.test'+specifier),{}, {waitUntil(){throw Error('Static extraction cannot schedule work.');}});
    assert.equal(response.status,200,specifier);assert.match(response.headers.get('content-type')||'',/javascript/);assets.set(specifier,await response.text());
  }
  return assets.get(specifier);
}
const compiledWorkspace=await asset('/admin/assets/workspace.js');
// A separately downloaded, hash-verified production main client may be executed
// with the compiled bundle's dependency assets. This never changes module loading.
const actual=workspaceFile?readFileSync(workspaceFile,'utf8'):compiledWorkspace;
writeFileSync(path.join(scratch,'workspace.actual.mjs'),actual);
const failures=[],results=[],unhandled=[];
const onUnhandled=error=>unhandled.push(error);
process.on('unhandledRejection',onUnhandled);

async function startup(source,{demo,language,timeoutMs=4000,switchMode=true}={}){
  const nodes=new Map(),listeners=[],requests=[],imports=[],errors=[];let reloadTarget=null,sessionPreference=null;
  class Element{
    constructor(){this.dataset={};this.textContent='';this.innerHTML='';this.value='';this.open=false;this.hidden=false;this.disabled=false;this.isConnected=true;this.attributes={};this.style={};this.options=[{value:'en',remove(){}},{value:'zh',remove(){}}];this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
    addEventListener(){}removeEventListener(){}setAttribute(key,value){this.attributes[key]=String(value);}removeAttribute(key){delete this.attributes[key];}getAttribute(key){return this.attributes[key]??null;}querySelector(){return new Element();}querySelectorAll(){return [];}contains(){return false;}append(){}appendChild(){}insertBefore(){}remove(){}focus(){}close(){this.open=false;}show(){this.open=true;}showModal(){this.open=true;}insertAdjacentHTML(_,html){this.innerHTML+=html;}
  }
  const node=key=>{if(!nodes.has(key))nodes.set(key,new Element());return nodes.get(key);};
  node('workspace-bootstrap').textContent=JSON.stringify({lang:language,workspaceName:'Synthetic startup workspace',csrfToken:'SYNTHETIC-NOT-A-REAL-TOKEN',principal:{id:'owner',name:'Startup fixture',role:'owner'}});
  node('workspace-page').innerHTML='<h1>Overview</h1><p>Loading your workspace…</p>';node('workspace-page').setAttribute('aria-busy','true');
  const document={body:new Element(),head:new Element(),documentElement:new Element(),hidden:false,title:'Startup fixture',getElementById:node,querySelector:node,querySelectorAll:()=>[],createElement:()=>new Element(),addEventListener:(type,handler,capture)=>listeners.push({type,handler,capture}),removeEventListener(){}};
  const base='https://startup.example.test/admin?test='+(demo?'1':'0')+'&lang='+language;
  const location={href:base+'#overview',origin:'https://startup.example.test',pathname:'/admin',search:new URL(base).search,hash:'#overview',assign:target=>{reloadTarget=target;}};
  const deny=kind=>(...values)=>{errors.push({kind,target:String(values[0]??'').slice(0,100)});throw Error('Forbidden startup side effect: '+kind);};
  const context=vm.createContext({URL,URLSearchParams,TextEncoder,TextDecoder,Intl,Date,AbortController,AbortSignal,DOMException,Blob,FormData,Headers,Request,Response,crypto:{randomUUID},document,location,history:{replaceState(){}},navigator:{language,clipboard:{writeText:deny('clipboard')}},localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem:(key,value)=>{assert.equal(key,'gyutron.workspace.test-mode.v1');sessionPreference=value;}},window:{addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}}),print:deny('print'),open:deny('window.open')},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},queueMicrotask,console:{log(){},warn(){},error:message=>errors.push({kind:'console.error',message:String(message).slice(0,200)})}});
  const moduleCache=new Map();
  async function browserModule(specifier){
    if(moduleCache.has(specifier))return moduleCache.get(specifier);
    const pending=(async()=>{const text=await asset(specifier);const module=new vm.SourceTextModule(text,{context,identifier:'compiled'+specifier,importModuleDynamically:async name=>{imports.push(name);return browserModule(name);}});await module.link(browserModule);await module.evaluate({timeout:5000});return module;})();
    moduleCache.set(specifier,pending);return pending;
  }
  // The live-mode server is a synthetic, read-only fixture; no HTTP service is contacted.
  const demoModule=await browserModule('/admin/assets/demo.js');
  const fixture=demoModule.namespace.createDemoWorkspace({language:()=>language});
  context.fetch=async(input,options={})=>{
    const target=String(input);requests.push({path:target,method:options.method||'GET'});
    if(demo)throw Error('Demo startup attempted a real business fetch.');
    assert.ok(target.startsWith('/admin/api/'));assert.ok(['GET','HEAD'].includes(options.method||'GET'),'Startup must not submit writes.');
    if(options.signal?.aborted)throw new DOMException('Fixture request aborted.','AbortError');
    try{return new Response(JSON.stringify(await fixture.api(target.slice('/admin/api/'.length),{...options,body:undefined})),{headers:{'content-type':'application/json'}});}
    catch(error){return new Response(JSON.stringify({error:{code:error.code||'FIXTURE_ERROR',message:error.message}}),{status:error.status||500,headers:{'content-type':'application/json'}});}
  };
  let thrown=null;const unhandledStart=unhandled.length;
  try{new vm.Script(source,{filename:'compiled-workspace-startup.js',importModuleDynamically:async specifier=>{imports.push(specifier);return browserModule(specifier);}}).runInContext(context,{timeout:5000});}catch(error){thrown=error;}
  const deadline=Date.now()+timeoutMs;let ready=false;
  while(!thrown&&Date.now()<deadline){
    await new Promise(resolve=>setImmediate(resolve));
    if(unhandled.length>unhandledStart){thrown=unhandled[unhandledStart];break;}
    ready=node('workspace-page').getAttribute('aria-busy')==='false'&&node('workspace-page').innerHTML.includes('class="metric-grid"')&&!node('workspace-page').innerHTML.includes('Loading your workspace');
    if(ready)break;
  }
  const summary={demo,language,ready,requests,imports,errors,synchronous_error:thrown?{name:thrown.name,message:thrown.message,stack:String(thrown.stack).slice(0,900)}:null,aria_busy:node('workspace-page').getAttribute('aria-busy'),metric_values:[...node('workspace-page').innerHTML.matchAll(/class="metric-value">([^<]*)</g)].map(m=>m[1]),html_bytes:Buffer.byteLength(node('workspace-page').innerHTML),helper_injected:false};
  if(ready&&switchMode){
    const button=node('workspace-test-mode'),event={target:{closest:selector=>selector==='#workspace-test-mode'?button:null},preventDefault(){},stopImmediatePropagation(){this.stopped=true;}};
    for(const listener of listeners.filter(item=>item.type==='click'&&item.capture===true)){listener.handler(event);if(event.stopped)break;}
    const switchDeadline=Date.now()+1000;while(reloadTarget===null&&Date.now()<switchDeadline){await new Promise(resolve=>setImmediate(resolve));if(unhandled.length>unhandledStart){summary.synchronous_error={name:unhandled[unhandledStart].name,message:unhandled[unhandledStart].message};break;}}
    summary.reload_target=reloadTarget;summary.persisted_preference=sessionPreference;
  }
  return summary;
}

for(const language of ['en','zh'])for(const demo of [false,true]){
  let observation;
  try{
    observation=await startup(actual,{demo,language});assert.equal(observation.synchronous_error,null);assert.equal(observation.ready,true,'Complete initialization did not reach the populated overview.');assert.equal(observation.metric_values.length,5);assert.ok(observation.metric_values.every(value=>value&&value!=='—'));assert.deepEqual(observation.errors,[]);
    if(demo){assert.equal(observation.requests.length,0);assert.ok(observation.imports.includes('/admin/assets/demo.js'));}else assert.ok(observation.requests.some(r=>r.path==='/admin/api/bootstrap'));
    const target=new URL(observation.reload_target,'https://startup.example.test');assert.equal(target.searchParams.get('test'),demo?'0':'1');assert.equal(target.hash,'#overview');assert.equal(observation.persisted_preference,demo?'0':'1');
    results.push({name:'compiled complete startup '+language+' mode '+Number(demo),passed:true,...observation});
  }catch(error){failures.push({name:'compiled complete startup '+language+' mode '+Number(demo),error:error.message,observation});}
}
// Negative controls prove that removing initialization or encountering a missing
// bundler helper cannot accidentally pass this fixture.
const call='  initializeWorkspace();';assert.ok(actual.includes(call));
for(const[name,broken]of [['missing helper',actual.replace('(function workspaceClient() {','(function workspaceClient() { __gyutronMissingStartupHelperRegression();')],['initializer omitted',actual.replace(call,'  void 0;')]]){
  try{assert.notEqual(broken,actual);const observation=await startup(broken,{demo:true,language:'en',timeoutMs:150,switchMode:false});assert.equal(observation.ready,false);if(name==='missing helper')assert.equal(observation.synchronous_error?.name,'ReferenceError');results.push({name:'negative control '+name,passed:true,error:observation.synchronous_error?.message||'Did not leave loading state'});}catch(error){failures.push({name:'negative control '+name,error:error.message});}
}
const oldFixture=path.join(root,'.wrangler','loading-debug','live-workspace.mjs');
if(existsSync(oldFixture)){
  try{const old=await startup(readFileSync(oldFixture,'utf8'),{demo:false,language:'en',timeoutMs:150,switchMode:false});assert.equal(old.ready,false);assert.equal(old.synchronous_error?.name,'ReferenceError');assert.match(old.synchronous_error?.message||'',/__name/);results.push({name:'saved actual broken production .9 reproduces startup failure',passed:true,error:old.synchronous_error});}catch(error){failures.push({name:'saved production .9 negative fixture',error:error.message});}
}
await new Promise(resolve=>setImmediate(resolve));process.removeListener('unhandledRejection',onUnhandled);
if(unhandled.length)failures.push({name:'no background unhandled rejections',errors:unhandled.map(error=>({name:error.name,message:error.message}))});
const report={suite:'admin-compiled-full-startup',at:new Date().toISOString(),passed:results.length,failed:failures.length,wrangler:'4.93.1',compiled_by_this_run:compiledByThisRun,compiled_worker:bundle,bundle_sha256:hash(bytes),compiled_workspace_sha256:hash(compiledWorkspace),workspace_source:workspaceFile?'provided_file':'compiled_worker',workspace_file:workspaceFile,executed_workspace_sha256:hash(actual),dynamic_module_source:'compiled_worker',actual_initializer_executed:true,missing_helper_shim_injected:false,browser_used:false,production_business_api_used:false,provisioned:false,deployed:false,results,failures,limitations:['DOM stub verifies startup control flow, populated first view and actual mode-reload handler, not pixels/accessibility.','Live-mode API replies are an isolated read-only in-memory fixture; demo mode must perform zero business fetches.','A workspace file override is a supplied local artifact; independent release hashes must establish its production provenance.']};
writeFileSync(path.join(scratch,'startup-results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,results:results.map(({name,passed,demo,language,metric_values,requests,error})=>({name,passed,demo,language,metric_values,requests,error})),report:path.join(scratch,'startup-results.json')},null,2));
if(failures.length)process.exitCode=1;
