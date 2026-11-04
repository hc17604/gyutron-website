/** Shared trusted SVG and real-controller chart checks. No browser, network or business writes. */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {ADMIN_ICONS,ADMIN_ICON_HTML,ADMIN_ICON_REVISION,ADMIN_ICON_SOURCES,renderAdminIcon} from '../src/admin/icons.mjs';
import {ADMIN_CLIENT} from '../src/admin/client.mjs';
import {WORKBENCH_CLIENT} from '../src/admin/workbench-ui.mjs';
import {OPERATIONS_CLIENT} from '../src/admin/operations-client.mjs';
import {QUOTES_CLIENT} from '../src/admin/quotes-client.mjs';

let passed=0;const failures=[];
async function test(name,run){try{await run();passed++;}catch(error){failures.push({name,error:error.message});}}
const navigation=['overview','analytics','customers','pipeline','quotes','tasks','inbox','activity','sources','reports','automations','rules','agent','memory','models','users','security','backup','license','health','audit','settings'];
await test('all navigation and licensed actions have the same safe accessible SVG contract',()=>{
 assert.equal(ADMIN_ICON_REVISION,'aa0b77386c07630e5f1a9f877fd3ba4b2a4a1558');
 assert.equal(Object.keys(ADMIN_ICONS).length,63);assert.equal(Object.keys(ADMIN_ICON_SOURCES).length,43);
 for(const name of navigation)assert.ok(Object.hasOwn(ADMIN_ICON_HTML,name),name);
 for(const [name,html]of Object.entries(ADMIN_ICON_HTML)){
  assert.equal(renderAdminIcon(name),html);assert.match(html,/^<svg class="ui-icon"/);
  for(const attribute of ['viewBox="0 0 24 24"','stroke="currentColor"','stroke-width="2.1"','stroke-linecap="square"','stroke-linejoin="miter"','aria-hidden="true"','focusable="false"'])assert.ok(html.includes(attribute),name+' '+attribute);
  assert.ok(!/<(?:script|foreignObject|image|use|style)\b|\s(?:on\w+|href|style)\s*=/i.test(html),name);
 }
 assert.ok(Object.isFrozen(ADMIN_ICONS)&&Object.isFrozen(ADMIN_ICON_HTML)&&Object.isFrozen(ADMIN_ICON_SOURCES));
 const source=readFileSync(new URL('../src/admin/icons.mjs',import.meta.url),'utf8');assert.match(source,/ISC License/);assert.match(source,/MIT License/);
 for(const source of Object.values(ADMIN_ICON_SOURCES)){assert.match(source.file,/^[a-z0-9-]+\.svg$/);assert.match(source.sha256,/^[a-f0-9]{64}$/);}
});
await test('unknown or malicious icon names cannot become HTML or inherited object values',()=>{
 for(const name of ['constructor','__proto__','toString','<img src=x onerror=1>',null,undefined,{},42])assert.equal(renderAdminIcon(name),ADMIN_ICON_HTML['circle-help']);
});
await test('browser embeds the identical SVG map as data, without a serialized helper dependency',()=>{
 const start=ADMIN_CLIENT.indexOf('  const ICONS = '),end=ADMIN_CLIENT.indexOf('  const boot = ',start);assert.ok(start>=0&&end>start);
 const source=ADMIN_CLIENT.slice(start,end);assert.ok(!source.includes('__name'));
 const icon=new vm.Script(source+';icon').runInNewContext();
 for(const name of [...navigation,'plus','bell','printer','filter','archive-restore','constructor'])assert.equal(icon(name),renderAdminIcon(name));
});

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const workbenchUrl='data:text/javascript;base64,'+Buffer.from(WORKBENCH_CLIENT).toString('base64');
const {createWorkbench}=await import(workbenchUrl);
const {createOperationsController}=await import('data:text/javascript;base64,'+Buffer.from(OPERATIONS_CLIENT.replace("'/admin/assets/workbench.js'",JSON.stringify(workbenchUrl))).toString('base64'));
const {createQuotesController}=await import('data:text/javascript;base64,'+Buffer.from(QUOTES_CLIENT).toString('base64'));

await test('workbench buttons keep text, disabled state and delegated attributes while icons remain decorative',()=>{
 const ui=createWorkbench({state:{lang:'en',tab:'sources'},esc,icon:renderAdminIcon});
 const html=ui.button('<Import>', 'data-op="commit" data-id="synthetic"',true,true,'upload');
 assert.match(html,/data-op="commit" data-id="synthetic" disabled/);assert.match(html,/data-icon="upload"/);assert.match(html,/&lt;Import&gt;/);assert.match(html,/<span class="button-label">/);
 const table=ui.table(['Actions'],[{}],()=>[ui.button('Edit','data-op="edit"')+ui.button('Run','data-op="run"')]);assert.match(table,/class="table-action-group"/);
});

const previousDocument=globalThis.document,previousLocation=globalThis.location,previousWindow=globalThis.window;
globalThis.document={addEventListener(){},querySelectorAll(){return[];},querySelector(){return null;}};
globalThis.location={hash:'#analytics',origin:'https://synthetic.example'};
globalThis.window={addEventListener(){}};
const huge='9007199254740993123';
function harness({lang='en',metric='revenue',currency='USD',series,quotes,revenueRows}={}){
 const state={lang,tab:quotes?'quotes':'analytics',params:new URLSearchParams({metric,...(currency?{currency}:{})}),principal:{id:'owner',role:'owner'},timezone:'Asia/Singapore'};
 const page={innerHTML:''},calls=[];
 const observations=series||[{date:'2026-11-01',orders:0,inquiries:2,revenue_by_currency:[{currency:'USD',amount_minor_exact:'0'}]},{date:'2026-11-02',orders:5,inquiries:3,revenue_by_currency:[{currency:'USD',amount_minor_exact:huge}]}];
 const deps={state,page,esc,icon:renderAdminIcon,api:async path=>{calls.push(path);if(path==='operations/meta')return{data:{currencies:['USD','JPY'],ruleTemplates:[]}};if(path.startsWith('operations/sources'))return{data:[]};if(path.startsWith('operations/analytics'))return{data:{counts:{orders:5,inquiries:5,overdue_inquiries:0},revenue_by_currency:revenueRows||[{currency:'USD',amount_minor_exact:huge}],series:observations,by_country:[{name:'<Synthetic market>',count:5}],top_products:[{title:'Synthetic camera',quantity_exact:huge}],reconciliation:{payments_by_currency:[]}}};if(path.startsWith('quotes?'))return{data:quotes,meta:{total:quotes.length,page:1,limit:25}};throw Error('Unexpected API '+path);},heading:(title,description,actions)=>'<h1>'+esc(title)+'</h1>'+(actions||''),pagination:()=>'',money:(value,currency)=>currency+' '+String(value??0),date:value=>String(value??''),can:()=>true,toast(){},navigate(){},dialog:{},showDialog(){},dialogHeader:()=>'',confirmAction:async()=>true,setFormBusy(){},showFormError(){},t:value=>value,localeData:{quotes:{}}};
 return{state,page,calls,controller:quotes?createQuotesController(deps):createOperationsController(deps)};
}
try{
 for(const lang of ['en','zh'])await test('actual '+lang+' analytics shows exact large values, date axes and safe ranked bars',async()=>{
  const h=harness({lang});await h.controller.loadPage(h.state.params);const html=h.page.innerHTML;
  assert.match(html,/class="wb-chart-scroll"/);assert.match(html,/wb-trend-tick-y/);assert.match(html,/wb-trend-tick-x/);assert.match(html,/wb-chart-legend/);
  assert.ok(html.includes('<title>2026-11-02 · USD '+huge+'</title>'));assert.ok(html.includes(huge));
  assert.match(html,/wb-ranking-fill/);assert.ok(html.includes('&lt;Synthetic market&gt;'));assert.ok(html.includes('9,007,199,254,740,993,123'));assert.ok(!html.includes('<Synthetic market>'));
  assert.ok(!/NaN|Infinity|style=|[↗↓←→×]/.test(html));assert.ok(h.calls.every(path=>path.startsWith('operations/')));
 });
 await test('money trend without a selected currency does not combine currency values',async()=>{
  const h=harness({currency:''});await h.controller.loadPage(h.state.params);assert.ok(h.page.innerHTML.includes('Choose a currency'));assert.ok(!h.page.innerHTML.includes('class="wb-trend"'));
 });
 for(const lang of ['en','zh'])await test(lang+' multi-currency KPI shows a count with exact amounts in a closed breakdown',async()=>{
  const rows=['USD','EUR','JPY','SGD','GBP','CNY'].map((currency,index)=>({currency,amount_minor_exact:(BigInt(huge)+BigInt(index)).toString()}));
  const h=harness({lang,currency:'',revenueRows:rows});await h.controller.loadPage(h.state.params);const html=h.page.innerHTML,first=html.slice(html.indexOf('class="wb-kpis"'));
  assert.equal(first.match(/<strong>([^<]*)<\/strong>/)?.[1],lang==='zh'?'6种币种':'6 currencies');
  assert.match(first,/<details class="currency-breakdown">/);assert.ok(!/<details class="currency-breakdown"[^>]*\bopen\b/.test(first));
  const stack=first.match(/<dl class="currency-stack">([\s\S]*?)<\/dl>/)?.[1];assert.ok(stack);assert.equal((stack.match(/<dt>/g)||[]).length,6);
  for(const row of rows)assert.ok(stack.includes('<dt>'+row.currency+'</dt><dd>'+row.currency+' '+row.amount_minor_exact+'</dd>'));
  assert.ok(!html.includes('data-op="refresh"'),'Keep one analytics refresh control in the filter form.');
 });
 await test('selected currency KPI uses only that exact currency value',async()=>{
  const h=harness({currency:'EUR',revenueRows:[{currency:'USD',amount_minor_exact:'12345'},{currency:'EUR',amount_minor_exact:huge}]});await h.controller.loadPage(h.state.params);const first=h.page.innerHTML.slice(h.page.innerHTML.indexOf('class="wb-kpis"'));
  assert.equal(first.match(/<strong>([^<]*)<\/strong>/)?.[1],'EUR '+huge);assert.ok(!first.includes('currency-breakdown'));assert.ok(!first.includes('USD 12345'));
 });
 await test('single zero observation has valid coordinates and truthful zero labels',async()=>{
  const h=harness({metric:'orders',series:[{date:'2026-11-01',orders:0,inquiries:0,revenue_by_currency:[]}]});await h.controller.loadPage(h.state.params);assert.ok(!/NaN|Infinity/.test(h.page.innerHTML));assert.match(h.page.innerHTML,/<title>2026-11-01 · 0<\/title>/);
 });
 await test('quotation list prioritises its human title while retaining identifiers and handlers',async()=>{
  const h=harness({quotes:[{public_id:'QT-SYNTHETIC',quote_number:'QT-TEST-R01',title:'<Inspection pilot>',recipient_company:'Synthetic customer',revision:1,status:'draft',currency:'USD',total_minor:12345,created_at:'2026-11-01',updated_at:'2026-11-02'}]});await h.controller.loadPage(h.state.params);assert.match(h.page.innerHTML,/data-quote-open="QT-SYNTHETIC" title="&lt;Inspection pilot&gt;">&lt;Inspection pilot&gt;<\/button><div class="cell-sub cell-mono">QT-TEST-R01/);assert.match(h.page.innerHTML,/data-icon="plus"/);
 });
}finally{
 if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
 if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;
 if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
}
console.log(JSON.stringify({suite:'admin-trusted-icons-and-chart-contract',passed,failed:failures.length,network_requests:0,browser_used:false,production_writes:false,failures},null,2));if(failures.length)process.exitCode=1;
