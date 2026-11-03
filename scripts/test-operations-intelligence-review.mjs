/** Independent credential-boundary probe. Uses synthetic credentials and an injected fetcher only. */
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {callModel,saveModelSettings,modelSettings} from '../src/platform/intelligence/models.mjs';
const sql=new DatabaseSync(':memory:');for(const file of ['0001_init','0002_order_intents','0003_admin_workspace','0004_admin_identity','0005_crm_relation_guards','0006_operations_quotes','0007_operations','0008_intelligence'])sql.exec(readFileSync(new URL('../migrations/'+file+'.sql',import.meta.url),'utf8'));
const db={prepare(query){return {query,args:[],bind(...args){this.args=args;return this;},async first(){return sql.prepare(query).get(...this.args)||null;},async run(){const r=sql.prepare(query).run(...this.args);return {meta:{changes:Number(r.changes)},success:true};},async all(){return {results:sql.prepare(query).all(...this.args),success:true};}};},async batch(statements){sql.exec('BEGIN');try{const out=statements.map(s=>{if(/^\s*SELECT\b/i.test(s.query))return {results:sql.prepare(s.query).all(...s.args),success:true};const r=sql.prepare(s.query).run(...s.args);return {meta:{changes:Number(r.changes)},success:true};});sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
const env={WORKSPACE_ENCRYPTION_KEY:'synthetic-local-review-encryption-key-only-2026'},owner={id:'owner',role:'owner',name:'Independent review'};
const first='synthetic-provider-one-credential',second='synthetic-provider-two-credential';
await saveModelSettings(db,env,owner,{version:0,provider:'openai',base_url:'https://api.openai.com/v1',model:'synthetic-model',enabled:true,api_key:first});
let rejected=false;try{await saveModelSettings(db,env,owner,{version:1,provider:'deepseek',base_url:'https://api.deepseek.com/v1',model:'synthetic-model',enabled:true});}catch(e){assert.equal(e.status,422);rejected=true;}
if(!rejected){let exposed=false;await callModel(db,env,owner,{messages:[{role:'user',content:'Synthetic protocol probe only.'}],fetcher:async(url,options)=>{exposed=new URL(url).hostname==='api.deepseek.com'&&options.headers.authorization==='Bearer '+first;return new Response(JSON.stringify({choices:[{message:{content:'OK'}}]}));}});console.log(JSON.stringify({passed:false,synthetic_credential_reused_for_other_provider:exposed,external_calls:0}));process.exitCode=1;}
else{
 assert.equal((await modelSettings(db,env,owner)).version,1);
 await saveModelSettings(db,env,owner,{version:1,provider:'openai',base_url:'https://api.openai.com/v1',model:'synthetic-model-v2',enabled:true});
 await saveModelSettings(db,env,owner,{version:2,provider:'deepseek',base_url:'https://api.deepseek.com/v1',model:'synthetic-model',enabled:true,api_key:second});let targetCorrect=false;
 await callModel(db,env,owner,{messages:[{role:'user',content:'Synthetic protocol probe only.'}],fetcher:async(url,options)=>{targetCorrect=new URL(url).hostname==='api.deepseek.com'&&options.headers.authorization==='Bearer '+second;return new Response(JSON.stringify({choices:[{message:{content:'OK'}}]}));}});assert.equal(targetCorrect,true);console.log(JSON.stringify({passed:true,cross_provider_reuse_rejected:true,rejected_write_atomic:true,same_provider_model_change_retains_key:true,new_provider_requires_new_key:true,external_calls:0}));
}
sql.close();
