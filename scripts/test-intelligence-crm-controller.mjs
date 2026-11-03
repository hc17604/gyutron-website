/** Execute the shipped CRM controller against a minimal DOM contract, not a visual browser test. */
import assert from 'node:assert/strict';
process.on('uncaughtException',error=>{console.error(error.name+': '+error.message);process.exit(1);});
import {CRM_EXPERIENCE_CLIENT} from '../src/admin/crm-experience-client.mjs';
const listeners=new Map(),form={dataset:{dirty:'false'},isConnected:true};
const tool={setAttribute(){},open:false,dataset:{busy:'false'},addEventListener(name,fn){const list=listeners.get(name)||[];list.push(fn);listeners.set(name,list);},querySelector(selector){return selector==='form'?form:null;},querySelectorAll(){return[];},close(){this.open=false;},showModal(){this.open=true;}};
const previousDocument=globalThis.document;globalThis.document={getElementById(){return tool;},addEventListener(){},body:{append(){}}};
const needle='return{decorateList,decorateRecord,canLeave,isBusy:';assert.ok(CRM_EXPERIENCE_CLIENT.includes(needle));
const source=CRM_EXPERIENCE_CLIENT.replace(needle,'return{__test:{minorValue,decimalValue},decorateList,decorateRecord,canLeave,isBusy:');
const {createCrmExperienceController}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let decision=false,confirmations=0,toasts=0;const confirmationArgs=[];const state={lang:'zh',principal:{id:'owner'},permissions:{write:true}};
const controller=createCrmExperienceController({state,api:async()=>({}),esc:String,t:key=>key,money:String,date:String,navigate(){},toast(){toasts++;},openRecord(){},confirmAction:async(...args)=>{confirmationArgs.push(args);confirmations++;return decision;}});
let passed=0;function test(name,fn){return Promise.resolve().then(fn).then(()=>{passed++;console.log('PASS '+name);});}
await test('select or checkbox change marks the actual form dirty',()=>{tool.open=true;listeners.get('change')[0]();assert.equal(controller.hasUnsavedChanges(),true);});
await test('declining navigation preserves dirty form and open dialog',async()=>{decision=false;assert.equal(await controller.canLeave(),false);assert.equal(tool.open,true);assert.equal(form.dataset.dirty,'true');assert.equal(confirmations,1);assert.deepEqual(confirmationArgs[0],['放弃尚未保存的修改？','放弃修改']);});
await test('busy operation blocks navigation without discard confirmation',async()=>{tool.dataset.busy='true';assert.equal(controller.isBusy(),true);assert.equal(await controller.canLeave(),false);assert.equal(confirmations,1);assert.equal(toasts,1);tool.dataset.busy='false';});
await test('confirmed discard closes the actual tool',async()=>{decision=true;assert.equal(await controller.canLeave(),true);assert.equal(tool.open,false);assert.equal(controller.hasUnsavedChanges(),false);});
await test('business amounts convert to exact minor strings with explicit currency',()=>{const{minorValue,decimalValue}=controller.__test;assert.equal(minorValue('1234.57','USD'),'123457');assert.equal(minorValue('123457','JPY'),'123457');assert.equal(minorValue('0.01','USD'),'1');assert.equal(minorValue('10000000000.00','USD'),'1000000000000');assert.equal(decimalValue('123457','USD'),'1234.57');assert.equal(decimalValue('123457','JPY'),'123457');assert.throws(()=>minorValue('1.1','JPY'));assert.throws(()=>minorValue('1.001','USD'));assert.throws(()=>minorValue('1',''));assert.throws(()=>minorValue('10000000000.01','USD'));});
globalThis.document=previousDocument;console.log(JSON.stringify({suite:'crm-controller-branches',passed,failed:0,visual_browser_tested:false}));
