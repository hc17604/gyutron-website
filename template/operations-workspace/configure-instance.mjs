/** Offline configuration only: never creates resources, authenticates or sets secrets. */
import { readFile,writeFile,access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const allowed=new Set(['worker-name','database-name','database-id','kv-id','r2-bucket','instance-id','workspace-name','time-zone']);
const values={};
for(let index=2;index<process.argv.length;index++){
  const key=process.argv[index].replace(/^--/,'');
  if(!process.argv[index].startsWith('--')||!allowed.has(key)||values[key]!==undefined||!process.argv[index+1]||process.argv[index+1].startsWith('--'))throw Error('Use each documented --name value once. No secret arguments are accepted.');
  values[key]=process.argv[++index];
}
for(const key of ['worker-name','database-name','database-id','kv-id','r2-bucket','instance-id'])if(!values[key]||/REPLACE_|PLACEHOLDER|EXAMPLE/i.test(values[key]))throw Error(`Supply the verified new instance value for --${key}.`);
if(!/^[a-z0-9][a-z0-9-]{0,62}$/.test(values['worker-name']))throw Error('Use a valid lower-case Worker name.');
if(!/^[a-zA-Z0-9_-]{1,64}$/.test(values['database-name']))throw Error('Use a database name of 1–64 letters, digits, underscores or hyphens.');
if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(values['database-id'])||/^0(?:0|-)+$/.test(values['database-id']))throw Error('Supply the actual D1 database UUID.');
if(!/^[a-f0-9]{32}$/i.test(values['kv-id'])||/^0+$/.test(values['kv-id']))throw Error('Supply the actual KV namespace ID.');
if(!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(values['r2-bucket']))throw Error('Supply the actual private R2 bucket name.');
if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(values['instance-id']))throw Error('Use a unique lower-case instance ID.');
const workspace=values['workspace-name']||'GYUTRON';if(!workspace.trim()||workspace.length>200)throw Error('Use a workspace name of 1–200 characters.');
let zone;try{zone=new Intl.DateTimeFormat('en',{timeZone:values['time-zone']||'Asia/Singapore'}).resolvedOptions().timeZone;}catch{throw Error('Supply a valid IANA timezone.');}
const destination=path.join(root,'wrangler.toml');try{await access(destination);throw Error('wrangler.toml already exists. Review it manually or configure a fresh instance directory.');}catch(error){if(error.code!=='ENOENT')throw error;}
let template=await readFile(path.join(root,'wrangler.example.toml'),'utf8');
const replacement={REPLACE_WORKER_NAME:values['worker-name'],REPLACE_DATABASE_NAME:values['database-name'],REPLACE_D1_DATABASE_ID:values['database-id'],REPLACE_R2_BUCKET_NAME:values['r2-bucket'],REPLACE_KV_NAMESPACE_ID:values['kv-id'],REPLACE_WORKSPACE_NAME:workspace.trim(),REPLACE_TIMEZONE:zone,REPLACE_INSTANCE_ID:values['instance-id']};
for(const [key,value]of Object.entries(replacement))template=template.replaceAll('"'+key+'"',JSON.stringify(value));
if(/REPLACE_[A-Z_]+/.test(template))throw Error('The configuration template has unresolved values.');
await writeFile(destination,template,{encoding:'utf8',flag:'wx'});console.log('Created wrangler.toml from explicitly supplied resource values. Resource ownership and privacy must be checked in the intended Cloudflare account.');
