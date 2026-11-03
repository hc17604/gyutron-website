import assert from 'node:assert/strict';
import vm from 'node:vm';
import { ADMIN_CLIENT } from '../../src/admin/client.mjs';
import { QUOTES_CLIENT } from '../../src/admin/quotes-client.mjs';
const calls=[];
const state={modal:{},opportunities:[]};
const dialog={open:true};
let errors=[];
const scope=vm.createContext({WeakMap,state,dialog,api:()=>new Promise((resolve,reject)=>calls.push({resolve,reject})),t:x=>x,attr:x=>x,esc:x=>x,recordId:x=>x.public_id,toast:x=>errors.push(x)});
vm.runInContext(ADMIN_CLIENT.slice(ADMIN_CLIENT.indexOf('  const opportunityLoads='),ADMIN_CLIENT.indexOf('  async function openForm(')),scope);
function fixture(customer='a',selected=''){
  const search={disabled:false};const button={disabled:false};const customerInput={value:customer};
  const opportunity={value:selected,selectedOptions:[{textContent:selected}],disabled:false,innerHTML:'initial',parentElement:{querySelector:()=>search}};
  const form={dataset:{},isConnected:true,querySelector:s=>s.includes('opportunity_id')?opportunity:customerInput,querySelectorAll:()=>[button]};
  return {form,opportunity,search,button,customerInput};
}
let count=0;
const f=fixture('a','existing');const first=scope.refreshOpportunityOptions(f.form,'a');
assert.equal(f.opportunity.disabled,true);assert.equal(f.search.disabled,true);assert.equal(f.button.disabled,true);count++;
f.opportunity.value='latest';f.opportunity.selectedOptions=[{textContent:'Latest choice'}];calls.shift().resolve({data:[{public_id:'latest',title:'Latest choice'}]});await first;
assert.match(f.opportunity.innerHTML,/value="latest" selected/);assert.equal(f.button.disabled,false);assert.equal(f.form.dataset.relationLoading,undefined);count++;
const a=scope.refreshOpportunityOptions(f.form,'a');const reqA=calls.shift();f.customerInput.value='b';f.opportunity.value='';const b=scope.refreshOpportunityOptions(f.form,'b');const reqB=calls.shift();reqA.resolve({data:[{public_id:'stale',title:'Stale'}]});await a;
assert.equal(f.button.disabled,true);assert.ok(!f.opportunity.innerHTML.includes('stale'));count++;
reqB.resolve({data:[{public_id:'b-opportunity',title:'B opportunity'}]});await b;assert.match(f.opportunity.innerHTML,/b-opportunity/);assert.equal(f.button.disabled,false);count++;
const failed=scope.refreshOpportunityOptions(f.form,'b');calls.shift().reject(new Error('Temporary failure'));await failed;
assert.equal(f.opportunity.disabled,false);assert.equal(f.search.disabled,false);assert.equal(f.button.disabled,false);assert.equal(errors.at(-1),'Temporary failure');count++;
const late=scope.refreshOpportunityOptions(f.form,'b');const lateRequest=calls.shift();const before=f.opportunity.innerHTML;state.modal={};lateRequest.resolve({data:[{public_id:'other-dialog',title:'Wrong'}]});await late;assert.equal(f.opportunity.innerHTML,before);count++;
vm.runInContext(QUOTES_CLIENT.match(/  function normalizeCurrencyInput[^\n]+/)[0],vm.createContext({moneyDigits:c=>c==='JPY'?0:2}));
const amounts=vm.createContext({moneyDigits:c=>c==='JPY'?0:2});vm.runInContext(QUOTES_CLIENT.match(/  function normalizeCurrencyInput[^\n]+/)[0],amounts);
for(const [input,currency,expected] of [['0.00','JPY','0'],['100.00','JPY','100'],['000.000','JPY','000'],['  12.00 ','JPY','12'],['12.50','JPY','12.50'],['0.01','JPY','0.01'],['12.00','USD','12.00'],['','JPY','']])assert.equal(amounts.normalizeCurrencyInput(input,currency),expected);
new Function(ADMIN_CLIENT);new Function(QUOTES_CLIENT.replace('export function createQuotesController','function createQuotesController'));
for(const code of [ADMIN_CLIENT,QUOTES_CLIENT]){assert.ok(!/style\s*=\s*["']/i.test(code));assert.ok(!/\bon\w+\s*=\s*["']/i.test(code));assert.ok(!code.includes('window.confirm('));}
const decimal=vm.createContext({moneyDigits:c=>c==='JPY'?0:2,q:x=>x});
vm.runInContext(QUOTES_CLIENT.slice(QUOTES_CLIENT.indexOf('  function minorInput('),QUOTES_CLIENT.indexOf('  function markDirty(')),decimal);
let moneyCases=0;
for(const currency of ['USD','EUR','CNY','JPY','GBP','SGD'])for(const value of [0,1,99,100,123456,1000000000000]){assert.equal(decimal.parseMinor(decimal.minorInput(value,currency),currency),value);moneyCases++;}
for(const [value,currency,expected] of [['.5','USD',50],['1.','USD',100],['','USD',0],['001.20','EUR',120],[' 12 ','JPY',12]]){assert.equal(decimal.parseMinor(value,currency),expected);moneyCases++;}
for(const [value,currency] of [['12.50','JPY'],['0.00','JPY'],['-1','USD'],['1e2','USD'],['1,000','USD'],['NaN','USD'],['Infinity','USD'],['1.001','USD'],['10000000000.01','USD'],['1000000000001','JPY']]){assert.throws(()=>decimal.parseMinor(value,currency));moneyCases++;}
for(const value of ['0','-1','1.5','1e2','9007199254740992']){assert.throws(()=>decimal.quantity(value));moneyCases++;}
for(const [value,expected] of [['1',1],['2',2],['100',100],['9007199254740991',9007199254740991],[' 3 ',3]]){assert.equal(decimal.quantity(value),expected);moneyCases++;}
console.log(JSON.stringify({relationshipAsyncCases:count,jpyNormalizationCases:8,moneyCases,emittedSyntax:'passed',csp:'passed'}));
