/** Explicitly local test harness: no credentials, no production network or data. */
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAdminWorkspace, renderAdminLogin, getAdminAsset } from '../../src/admin/shell.mjs';
import { handleAdminApi } from '../../src/api/admin-api.mjs';
import { handleAdminTeam } from '../../src/api/admin-team.mjs';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys=ON');
for (const name of readdirSync(resolve(root, 'migrations')).filter(name => /^\d+.*\.sql$/.test(name)).sort()) sqlite.exec(readFileSync(resolve(root, 'migrations', name), 'utf8'));
const db = {
  prepare(sql) {
    return { sql, values: [], bind(...values) { this.values=values; return this; },
      async first() { return sqlite.prepare(sql).get(...this.values) || null; },
      async all() { return { success:true,results:sqlite.prepare(sql).all(...this.values),meta:{changes:0} }; },
      async run() { return { success:true,meta:{changes:Number(sqlite.prepare(sql).run(...this.values).changes)} }; },
    };
  },
  async batch(statements) {
    sqlite.exec('BEGIN IMMEDIATE');
    try { const results=[];for(const statement of statements)results.push(/^\s*SELECT\b/i.test(statement.sql)?await statement.all():await statement.run());sqlite.exec('COMMIT');return results; }
    catch(error) { sqlite.exec('ROLLBACK');throw error; }
  },
};
const principal={id:'owner',name:'Local Test Owner',email:'owner@example.test',role:'owner'};
const env={DB:db,ADMIN_WORKSPACE_NAME:'LOCAL TEST WORKSPACE',ADMIN_TIMEZONE:'Asia/Singapore'};
async function api(path,body) {
  const request=new Request('http://127.0.0.1:8791/admin/api/'+path,{method:'POST',headers:{origin:'http://127.0.0.1:8791','content-type':'application/json'},body:JSON.stringify(body)});
  const response=await handleAdminApi(request,env,{},new URL(request.url),principal);
  const result=await response.json();if(!response.ok)throw new Error(JSON.stringify(result));return result.data;
}
const customer=await api('customers',{name:'LOCAL TEST · Meridian Automation',contact_name:'Test Contact',email:'contact@example.test',country:'Singapore',industry:'Industrial automation',status:'active',owner_id:'owner'});
await api('opportunities',{title:'LOCAL TEST · Vision inspection project',customer_id:customer.public_id,stage:'proposal',amount_minor:1280000,currency:'USD',probability:60,expected_close_date:'2026-11-30',owner_id:'owner'});
await api('opportunities',{title:'LOCAL TEST · Japanese engineering trial',customer_id:customer.public_id,stage:'discovery',amount_minor:350000,currency:'JPY',probability:25,owner_id:'owner'});
await api('tasks',{title:'LOCAL TEST · Confirm inspection requirements',customer_id:customer.public_id,due_date:'2026-11-05',priority:'high',owner_id:'owner'});
await api('activities',{subject:'LOCAL TEST · Requirements review',customer_id:customer.public_id,type:'meeting',body:'Local UI test fixture. This record does not exist in production.'});
sqlite.prepare('INSERT INTO rfqs(public_id,name,company,email,product_category,quantity,application_description,status) VALUES(?,?,?,?,?,?,?,?)').run('RFQ-LOCAL-TEST','Test Contact','LOCAL TEST · Meridian Automation','contact@example.test','Machine vision','2','Local test fixture for enquiry conversion.','new');
const contentTypes={'.svg':'image/svg+xml','.css':'text/css; charset=utf-8','.ico':'image/x-icon','.png':'image/png','.js':'text/javascript; charset=utf-8'};
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://127.0.0.1:8791');let response;
    if(url.pathname==='/admin/login-preview')response=new Response(renderAdminLogin({configured:true}),{headers:{'content-type':'text/html; charset=utf-8'}});
    else if(url.pathname==='/admin')response=new Response(renderAdminWorkspace({principal,csrfToken:'local-test-token',workspaceName:'LOCAL TEST WORKSPACE'}),{headers:{'content-type':'text/html; charset=utf-8'}});
    else if(url.pathname.startsWith('/admin/assets/'))response=getAdminAsset(url.pathname);
    else if(url.pathname==='/admin/api/assignees')response=Response.json({data:[{id:'owner',name:'Local Test Owner'}]});
    else if(url.pathname.startsWith('/admin/api/')){
      const chunks=[];for await(const chunk of req)chunks.push(chunk);
      const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
      response=url.pathname.startsWith('/admin/api/team')?await handleAdminTeam(request,env,principal,url):await handleAdminApi(request,env,{},url,principal);
    } else {
      const file=resolve(root,'public','.'+decodeURIComponent(url.pathname));
      if(!file.startsWith(resolve(root,'public')+sep)||!existsSync(file))response=new Response('Not found',{status:404});
      else response=new Response(readFileSync(file),{headers:{'content-type':contentTypes[extname(file)]||'application/octet-stream'}});
    }
    if(!response)response=new Response('Not found',{status:404});
    if(!(response.headers.get('content-type')))response.headers.set('content-type','text/html; charset=utf-8');
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  } catch(error){console.error('Local preview error:',error.message);res.writeHead(500);res.end('Local preview error');}
}).listen(8791,'127.0.0.1',()=>console.log('LOCAL TEST WORKSPACE http://127.0.0.1:8791/admin'));
