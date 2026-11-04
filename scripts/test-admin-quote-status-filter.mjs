/** Run the shipped quotation controller and Test transport; no browser or live service. */
import assert from 'node:assert/strict';
import {QUOTES_CLIENT} from '../src/admin/quotes-client.mjs';
import {DEMO_CLIENT} from '../src/admin/demo-client.mjs';
import {createWorkspaceTransport} from '../src/admin/test-mode.mjs';

const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {createQuotesController}=await import(moduleUrl(QUOTES_CLIENT));
const {createDemoWorkspace}=await import(moduleUrl(DEMO_CLIENT));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=value=>String(value).replace(/&(amp|lt|gt|quot|#39);/g,(_,key)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[key]));

// The controller's actual HTML is parsed, and its registered document handlers receive
// events from real generated child nodes. Layout and native keyboard activation need UI QA.
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.attributes={};this.dataset={};this.listeners=new Map();this.parentNode=null;this._text='';this._html='';}
 setAttribute(name,value){this.attributes[name]=String(value);if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}hasAttribute(name){return this.getAttribute(name)!==null;}
 get parentElement(){return this.parentNode;}get isConnected(){return Boolean(this.root||this.parentNode?.isConnected);}
 get value(){return this._value??this.getAttribute('value')??this.textContent;}set value(value){this._value=String(value);}
 get textContent(){return this._text+this.children.map(node=>node.textContent).join('');}
 set innerHTML(value){for(const child of this.children)child.parentNode=null;this.children=[];this._html=String(value);parse(this._html,this);}get innerHTML(){return this._html;}
 append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node);}}
 contains(node){return node===this||this.children.some(child=>child.contains(node));}
 matches(selector){return selector.split(',').some(part=>{const pieces=part.trim().split(/\s+(?![^\[]*\])/),last=pieces.pop(),tag=last.match(/^[a-z][\w-]*/i);if(tag&&this.tagName!==tag[0])return false;for(const match of last.matchAll(/\.([\w-]+)/g))if(!(this.getAttribute('class')||'').split(/\s+/).includes(match[1]))return false;for(const match of last.matchAll(/\[([\w-]+)(?:=['"]?([^'"\]]+)['"]?)?\]/g))if(!this.hasAttribute(match[1])||match[2]!==undefined&&this.getAttribute(match[1])!==match[2])return false;let parent=this.parentNode;while(pieces.length){const wanted=pieces.pop();while(parent&&!parent.matches(wanted))parent=parent.parentNode;if(!parent)return false;parent=parent.parentNode;}return true;});}
 closest(selector){let node=this;while(node){if(node.matches(selector))return node;node=node.parentNode;}return null;}
 querySelectorAll(selector){return this.children.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 addEventListener(type,handler){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(handler);}
 async dispatch(type){const event={type,target:this,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;}};for(let node=this;node;node=node.parentNode){for(const handler of node.listeners.get(type)||[])await handler(event);if(event.stopped)break;}return event;}
}
function parse(html,parent){const stack=[parent];for(const token of String(html).match(/<[^>]*>|[^<]+/g)||[]){if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}if(token.startsWith('<')){const match=token.match(/^<([a-z][\w:-]*)([\s\S]*?)\/?\s*>$/i);if(!match)continue;const node=new Element(match[1]);for(const attr of match[2].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))node.setAttribute(attr[1],decode(attr[2]??attr[3]??attr[4]??''));stack.at(-1).append(node);if(!/^(input|img|br|hr|meta|link)$/i.test(match[1])&&!token.endsWith('/>'))stack.push(node);}else{const node=new Element('#text');node._text=decode(token);stack.at(-1).append(node);}}}

const statuses=['draft','issued','accepted','declined'];
const labels={en:['Draft','Issued','Accepted','Declined'],zh:['草稿','已签发','已接受','已拒绝']};
const rows=statuses.map((status,index)=>({public_id:'QUO-'+index,quote_number:'GYU-Q'+index,title:'Configured inspection '+index,recipient_company:'Synthetic customer',customer_id:'CUS-1',opportunity_id:'OPP-1',owner_id:'owner',status,currency:'USD',revision:1,total_minor:12000,created_at:'2026-11-01',updated_at:'2026-11-04',valid_until:'2026-12-01',items:[]}));
const archived={...rows[1],public_id:'QUO-ARCHIVED',archived_at:'2026-11-03'};
const unsupported={...rows[0],public_id:'QUO-UNKNOWN',status:'future <img src=x onerror=bad()>'};
function harness({lang='en',role='owner',demo=false,listRows=[...rows,archived,unsupported]}={}){
 const previous={document:globalThis.document,window:globalThis.window,location:globalThis.location},document=new Element('document'),page=new Element(),dialog=new Element('dialog'),requests=[],navigations=[],liveRequests=[],writes=[];document.root=true;document.append(page,dialog);document.body=document;globalThis.document=document;globalThis.window={addEventListener(){}};globalThis.location={hash:'#quotes'};
 const state={tab:'quotes',lang,testMode:demo,params:new URLSearchParams(),workspaceName:'Synthetic workspace',principal:{id:'owner',role}},workspace=demo?createDemoWorkspace({now:()=>Date.parse('2026-11-04T08:30:00Z'),language:()=>lang}):null;
 const request=createWorkspaceTransport({demo,loadDemo:async()=>workspace,onWrite:value=>writes.push(value),liveRequest:async(path,options)=>{liveRequests.push({path,options});if(path.startsWith('quotes?'))return{data:listRows,meta:{page:Number(new URLSearchParams(path.split('?')[1]).get('page')||1),total:100,pages:10}};if(path.startsWith('quotes/'))return{data:listRows.find(row=>row.public_id===path.slice(7))};throw Error('Unexpected quotation API route: '+path);}});
 const controller=createQuotesController({state,page,dialog,esc,icon:()=>'<svg aria-hidden="true"></svg>',toast(){},can:key=>key==='read'||role==='owner',confirmAction:async()=>{throw Error('Filtering must not ask for a mutation confirmation.');},money:(value,currency)=>currency+' '+value,date:value=>String(value||'—'),heading:(title,description,actions)=>'<div class="page-heading"><h1>'+esc(title)+'</h1>'+actions+'</div>',pagination:()=>'',showDialog(){},dialogHeader:()=>'',showFormError(){},setFormBusy(){},openRecord(){throw Error('Filtering must not open a record.');},navigate:(tab,params)=>navigations.push({tab,params:new URLSearchParams(params)}),api:async(path,options={})=>{requests.push({path,options});return request(path,options);}});
 return{state,page,dialog,controller,requests,navigations,liveRequests,writes,workspace,async load(query=''){state.params=new URLSearchParams(query);globalThis.location.hash='#quotes?'+state.params;await controller.loadPage(state.params);},close(){controller.discardChanges();for(const[key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}};
}

const results=[],networkAttempts=[],persistenceAttempts=[];
const guardedKeys=['fetch','localStorage','sessionStorage','indexedDB'],priorGlobals=new Map(guardedKeys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
const noPersistence=kind=>(...args)=>{persistenceAttempts.push(kind+':'+String(args[0]||''));throw Error('No persistence allowed.');};
Object.defineProperty(globalThis,'fetch',{configurable:true,value:(...args)=>{networkAttempts.push(String(args[0]));throw Error('No network allowed.');}});
for(const key of ['localStorage','sessionStorage'])Object.defineProperty(globalThis,key,{configurable:true,value:{getItem:noPersistence(key+'.read'),setItem:noPersistence(key+'.write'),removeItem:noPersistence(key+'.remove')}});
Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open:noPersistence('indexedDB.open')}});
async function test(name,run){try{await run();results.push({name,passed:true});}catch(error){results.push({name,passed:false,error:error.message,stack:String(error.stack).slice(0,1400)});}}

await test('actual list exposes only supported active statuses as bilingual named native toggle buttons for owner and viewer',async()=>{
 for(const lang of ['en','zh'])for(const role of ['owner','viewer']){const h=harness({lang,role});try{await h.load();const buttons=h.page.querySelectorAll('[data-quote-status-filter]');assert.equal(buttons.length,4);assert.deepEqual(buttons.map(node=>node.dataset.quoteStatusFilter),statuses);buttons.forEach((node,index)=>{assert.equal(node.tagName,'button');assert.equal(node.getAttribute('type'),'button');assert.equal(node.getAttribute('aria-pressed'),'false');assert.equal(node.textContent,labels[lang][index]);assert.equal(node.getAttribute('aria-label'),(lang==='zh'?'按状态筛选：':'Filter by status: ')+labels[lang][index]);assert.equal(node.getAttribute('title'),node.getAttribute('aria-label'));});assert.equal(h.page.querySelector('img'),null);assert.equal(Boolean(h.page.querySelector('[data-quote-new]')),role==='owner');}finally{h.close();}}
});

await test('actual child click changes only status and resets pagination while retaining accepted business scope and read-only permissions',async()=>{
 for(const lang of ['en','zh'])for(const role of ['owner','viewer']){const h=harness({lang,role});try{const scope=new URLSearchParams({q:'Inspection & "safe"',currency:'USD',customer_id:'CUS-1',opportunity_id:'OPP-1',owner_id:'owner',archived:'all',limit:'10',page:'4'});await h.load(scope);const requestCount=h.requests.length;await h.page.querySelector('[data-quote-status-filter=issued] span').dispatch('click');assert.equal(h.requests.length,requestCount,'A click must use the existing navigation path, not issue a parallel request.');assert.equal(h.navigations.length,1);const next=h.navigations[0];assert.equal(next.tab,'quotes');assert.equal(next.params.get('status'),'issued');assert.equal(next.params.has('page'),false);for(const[key,value]of scope)if(key!=='page')assert.equal(next.params.get(key),value);await h.load(next.params);const selected=h.page.querySelector('[data-quote-status-filter=issued]');assert.equal(selected.getAttribute('aria-pressed'),'true');assert.equal(selected.getAttribute('aria-label'),lang==='zh'?'清除状态筛选：已签发':'Clear status filter: Issued');assert.ok(h.page.querySelector('select[data-quote-filter=status] option[value=issued]').hasAttribute('selected'));await selected.dispatch('click');const cleared=h.navigations.at(-1).params;assert.equal(cleared.has('status'),false);assert.equal(cleared.has('page'),false);for(const[key,value]of scope)if(key!=='page')assert.equal(cleared.get(key),value);assert.ok(h.requests.every(row=>!row.options.method||row.options.method==='GET'));assert.deepEqual(h.writes,[]);await h.page.querySelector('[data-quote-clear]').dispatch('click');assert.equal(h.navigations.at(-1).params.size,0,'The existing clear-all control must retain its original behavior.');}finally{h.close();}}
});

await test('archived and unknown rows stay noninteractive and detail documents retain their original status semantics',async()=>{
 for(const lang of ['en','zh']){const h=harness({lang,role:'viewer'});try{await h.load('archived=all');const before=h.navigations.length;await h.page.querySelector('.badge-archived').dispatch('click');assert.equal(h.navigations.length,before);assert.equal(h.page.querySelector('.badge-archived').tagName,'span');await h.page.querySelector('[data-quote-open=QUO-1]').dispatch('click');assert.equal(h.navigations.at(-1).params.get('id'),'QUO-1','Existing record-title navigation must still open the selected quotation.');for(const row of [...rows,archived]){await h.load('id='+row.public_id);assert.equal(h.page.querySelectorAll('[data-quote-status-filter]').length,0);assert.ok(h.page.querySelector('.quote-document-status .badge'));assert.equal(h.page.querySelector('.quote-document-status .badge').tagName,'span');}assert.ok(h.requests.every(row=>!row.options.method||row.options.method==='GET'));}finally{h.close();}}
});

await test('status event delegation ignores unsupported, off-page, other-module and detail targets',async()=>{
 const h=harness();try{await h.load();const injected=new Element('button');injected.setAttribute('data-quote-status-filter','archived');h.page.append(injected);await injected.dispatch('click');assert.equal(h.navigations.length,0);const outside=new Element('button');outside.setAttribute('data-quote-status-filter','draft');globalThis.document.append(outside);await outside.dispatch('click');assert.equal(h.navigations.length,0);const existing=h.page.querySelector('[data-quote-status-filter=draft]');h.state.tab='customers';await existing.dispatch('click');assert.equal(h.navigations.length,0);h.state.tab='quotes';await h.load('id=QUO-0');const detailTarget=new Element('button');detailTarget.setAttribute('data-quote-status-filter','draft');h.page.append(detailTarget);await detailTarget.dispatch('click');assert.equal(h.navigations.length,0);}finally{h.close();}
});

await test('real Test transport filters seeded quotations and clears the selected status without live requests, persistence or writes',async()=>{
 for(const lang of ['en','zh']){const h=harness({lang,role:'viewer',demo:true});try{await h.load('limit=100');const button=h.page.querySelector('[data-quote-status-filter]');assert.ok(button,'The actual demo must expose seeded quotation status controls.');const status=button.dataset.quoteStatusFilter;await button.querySelector('span').dispatch('click');const selected=h.navigations.at(-1).params;assert.equal(selected.get('status'),status);assert.equal(selected.get('limit'),'100');await h.load(selected);const buttons=h.page.querySelectorAll('[data-quote-status-filter]');assert.ok(buttons.length>0);assert.ok(buttons.every(node=>node.dataset.quoteStatusFilter===status&&node.getAttribute('aria-pressed')==='true'));await buttons[0].dispatch('click');assert.equal(h.navigations.at(-1).params.has('status'),false);await h.load(h.navigations.at(-1).params);assert.ok(h.page.querySelectorAll('[data-quote-status-filter]').length>=buttons.length);assert.deepEqual(h.liveRequests,[]);assert.deepEqual(h.writes,[]);assert.ok(h.requests.every(row=>row.path.startsWith('quotes?')&&(!row.options.method||row.options.method==='GET')));}finally{h.close();}}
});

for(const[key,descriptor]of priorGlobals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
const failed=results.filter(row=>!row.passed);
console.log(JSON.stringify({suite:'admin-quote-status-filter',passed:results.length-failed.length,failed:failed.length,actual_emitted_controller:true,actual_test_transport:true,browser_used:false,production_accessed:false,network_attempts:networkAttempts,persistence_attempts:persistenceAttempts,results},null,2));
if(failed.length||networkAttempts.length||persistenceAttempts.length)process.exitCode=1;
