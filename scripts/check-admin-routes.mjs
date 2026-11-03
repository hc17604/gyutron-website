import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { ADMIN_CLIENT } from '../src/admin/client.mjs';
const outputDir=new URL('../artifacts/admin-rebuild-20261103/',import.meta.url);await fs.mkdir(outputDir,{recursive:true});
const source=ADMIN_CLIENT.split('\n').find(line=>line.trim().startsWith("dialog.addEventListener('close',"));
function fixture({route='#customers?status=active&record=A&record_type=customers',current=route,tab='customers',params='status=active&record=A&record_type=customers',open=false}={}){
  let close;
  const location={hash:current},state={tab,params:new URLSearchParams(params),modal:{id:'A'},renderedHash:route};
  const dialog={open,dataset:{recordRoute:route},querySelectorAll:()=>[],addEventListener:(name,callback)=>{close=callback;}};
  const history={replaceState:(a,b,url)=>{location.hash=url;}};
  vm.runInNewContext(source,{dialog,state,location,history,URLSearchParams});
  return {close,location,state,dialog};
}
const results=[];const test=(name,fn)=>{fn();results.push({name,ok:true});};
test('delayed customer close cannot overwrite related pipeline navigation',()=>{const f=fixture({current:'#pipeline?customer_id=C'});f.close();assert.equal(f.location.hash,'#pipeline?customer_id=C');});
test('delayed close cannot clear a new command-search deep link already parsed by router',()=>{const f=fixture({current:'#tasks?record=B&record_type=tasks',tab:'tasks',params:'record=B&record_type=tasks'});f.close();assert.equal(f.location.hash,'#tasks?record=B&record_type=tasks');assert.equal(f.state.params.get('record'),'B');});
test('plain close clears its own record while preserving list filters',()=>{const f=fixture();f.close();assert.equal(f.location.hash,'#customers?status=active');assert.equal(f.state.params.get('record'),null);assert.equal(f.state.renderedHash,f.location.hash);});
test('old event does not clear a newly reopened dialog',()=>{const f=fixture({open:true});f.state.modal={id:'B'};f.close();assert.equal(f.state.modal.id,'B');assert.equal(f.state.params.get('record'),'A');});
test('router-owned close leaves its new URL intact',()=>{const f=fixture({current:'#quotes?id=Q'});f.dialog.dataset.routeClosing='true';f.close();assert.equal(f.location.hash,'#quotes?id=Q');assert.equal(f.dialog.dataset.routeClosing,undefined);});
await fs.writeFile(new URL('frontend-final-route-checks.json',outputDir),JSON.stringify({at:new Date().toISOString(),checks:results.length,results},null,2)+'\n');
console.log(JSON.stringify({checks:results.length,passed:results.length}));
