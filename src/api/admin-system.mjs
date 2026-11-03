/** Operational metadata only. Raw backups, hashes and secrets are never served by the workspace. */
import { workspaceJson } from './admin-api.mjs';
import { workspaceTimeZone } from '../platform/crm/time.mjs';
import { SESSION_TTL_SECONDS } from '../platform/security/workspace-auth.mjs';
import { verifyPassword } from '../platform/security/admin-auth.mjs';
import { rateLimit } from '../platform/security/ratelimit.mjs';
import { runBackup, backupToSql, MAX_BACKUP_BYTES } from './backup.mjs';
import { sha256Hex } from '../platform/security/hash.mjs';

async function probe(operation, available) {
  const start=Date.now();
  if(!available)return {status:'unavailable',latency_ms:null};
  try{await operation();return {status:'ok',latency_ms:Date.now()-start};}
  catch{return {status:'error',latency_ms:Date.now()-start};}
}
async function operationHealth(db) {
  try {
    const now=new Date().toISOString();
    const [counts,failure,next,sources]=await Promise.all([
      db.prepare("SELECT status,COUNT(*) AS n,SUM(CASE WHEN status='running' AND lease_until<? THEN 1 ELSE 0 END) AS expired_leases,MIN(created_at) AS oldest_at FROM ops_automation_runs WHERE status IN ('queued','running','failed') GROUP BY status").bind(now).all(),
      db.prepare("SELECT id,error,completed_at FROM ops_automation_runs WHERE status='failed' ORDER BY completed_at DESC LIMIT 1").first(),
      db.prepare('SELECT MIN(next_run_at) AS at FROM ops_automations WHERE enabled=1').first(),
      db.prepare('SELECT id,name,kind,last_sync_at FROM ops_data_sources WHERE enabled=1 ORDER BY name LIMIT 100').all(),
    ]);
    return {status:'available',counts:counts.results||[],last_failure:failure||null,next_scheduled_at:next?.at||null,sources:(sources.results||[]).map(source=>({...source,stale:!source.last_sync_at||Date.now()-Date.parse(source.last_sync_at)>(source.kind==='native_website'?3600000:7*86400000)}))};
  } catch {return {status:'unavailable',counts:[],last_failure:null,next_scheduled_at:null,sources:[]};}
}

async function readPassword(request) {
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let length = 0; const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 2048) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    return input && Object.keys(input).length === 1 && typeof input.password === 'string' && new TextEncoder().encode(input.password).length <= 256 ? input.password : null;
  } catch { return null; }
}

async function readVerifiedBackup(env, filename) {
  if(!/^[a-zA-Z0-9_.-]{1,190}\.json$/.test(filename)||filename.includes('..'))throw Error('NOT_FOUND');
  const key='backups/daily/'+filename;
  const markerObject=await env.R2.get('backups/committed/daily/'+filename);
  if(!markerObject)throw Error('NOT_FOUND');
  const marker=JSON.parse(await markerObject.text());
  if(marker.verified!==true||marker.key!==key||!/^[a-f0-9]{64}$/.test(marker.sha256))throw Error('UNVERIFIED');
  const object=await env.R2.get(key);if(!object||object.size>MAX_BACKUP_BYTES)throw Error('UNVERIFIED');
  const text=await object.text();if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES||await sha256Hex(text)!==marker.sha256||object.customMetadata?.sha256!==marker.sha256)throw Error('UNVERIFIED');
  const snapshot=JSON.parse(text);const sql=await backupToSql(snapshot);
  return {snapshot,sql,text,sha256:marker.sha256};
}
async function backupHistory(request,env,principal) {
  if(principal.role!=='owner')return workspaceJson({error:{code:'FORBIDDEN',message:'Only the owner can access recovery files.'}},403);
  if(!env.R2)return workspaceJson({error:{code:'STORAGE_UNAVAILABLE',message:'Recovery storage is unavailable.'}},503);
  const parts=new URL(request.url).pathname.split('/').filter(Boolean).slice(4);
  try{
    if(!parts.length&&request.method==='GET'){
      const entries=[];let cursor,scanned=0;
      do{const page=await env.R2.list({prefix:'backups/committed/daily/',limit:1000,cursor,include:['customMetadata']});entries.push(...page.objects);cursor=page.truncated?page.cursor:undefined;scanned+=page.objects.length;}while(cursor&&scanned<10000);
      const latest=entries.sort((a,b)=>b.key.localeCompare(a.key)).slice(0,100);
      const data=latest.map(item=>({filename:item.key.split('/').at(-1),backup_id:item.customMetadata?.backup_id||null,sha256:item.customMetadata?.sha256||null,verified:true,date:item.key.match(/daily\/(\d{4}-\d{2}-\d{2})/)?.[1]||null}));
      return workspaceJson({data,meta:{limit:100,scanned,incomplete:Boolean(cursor)}});
    }
    if(parts.length!==2||!['verify','sql','json'].includes(parts[1]))return workspaceJson({error:{code:'NOT_FOUND',message:'This recovery route could not be found.'}},404);
    const [filename,action]=parts;
    if(action==='verify'){
      if(request.method!=='POST')return workspaceJson({error:{code:'METHOD_NOT_ALLOWED',message:'Use the recovery verification form.'}},405);
      const limit=await rateLimit(env,'workspace-recovery:'+principal.id,{limit:5,windowSeconds:60});if(!limit.ok)return workspaceJson({error:{code:'RATE_LIMITED',message:'Wait a minute before verifying again.'}},429);
      const password=await readPassword(request);if(password===null||!(await verifyPassword(env,password)))return workspaceJson({error:{code:'REAUTHENTICATION_FAILED',message:'Enter the current owner password.'}},403);
      const value=await readVerifiedBackup(env,filename);
      return workspaceJson({data:{verified:true,sha256:value.sha256,manifest:value.snapshot.manifest,restore:{mode:'new-isolated-database',active_sessions:false}}});
    }
    if(request.method!=='GET')return workspaceJson({error:{code:'METHOD_NOT_ALLOWED',message:'Download recovery files with GET.'}},405);
    const value=await readVerifiedBackup(env,filename),sql=action==='sql';
    return new Response(sql?value.sql:value.text,{headers:{'content-type':sql?'application/sql; charset=utf-8':'application/json; charset=utf-8','content-disposition':'attachment; filename="'+filename.replace(/\.json$/,sql?'.recovery.sql':'.json')+'"','cache-control':'no-store, private','x-content-type-options':'nosniff','x-backup-sha256':value.sha256}});
  }catch(error){const missing=error.message==='NOT_FOUND';return workspaceJson({error:{code:missing?'NOT_FOUND':'BACKUP_UNVERIFIED',message:missing?'This backup is no longer retained.':'The recovery file failed integrity or format validation.'}},missing?404:409);}
}

export async function handleAdminSystem(request, env, principal, version) {
  if (!['owner', 'manager'].includes(principal.role)) return workspaceJson({ error: { code: 'FORBIDDEN', message: 'Your role cannot inspect workspace operations.' } }, 403);
  if(new URL(request.url).pathname.startsWith('/admin/api/system/backups'))return backupHistory(request,env,principal);
  if (new URL(request.url).pathname.endsWith('/backup')) {
    if (principal.role !== 'owner') return workspaceJson({ error: { code: 'FORBIDDEN', message: 'Only the workspace owner can run a manual backup.' } }, 403);
    if (request.method !== 'POST') return workspaceJson({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use the backup confirmation form.' } }, 405);
    const throttle = await rateLimit(env, 'workspace-manual-backup', { limit: 1, windowSeconds: 60 });
    if (!throttle.ok) return workspaceJson({ error: { code: 'RATE_LIMITED', message: 'A backup was requested recently. Wait a minute before retrying.' } }, 429, { 'retry-after': String(throttle.retryAfter || 60) });
    const password = await readPassword(request);
    if (password === null) return workspaceJson({ error: { code: 'INVALID_BODY', message: 'Enter your current owner password.' } }, 422);
    if (!(await verifyPassword(env, password))) return workspaceJson({ error: { code: 'REAUTHENTICATION_FAILED', message: 'The owner password is incorrect.' } }, 403);
    const result = await runBackup(env);
    if (!result.ok) {
      const capacity = ['BACKUP_ROW_LIMIT', 'BACKUP_BYTE_LIMIT'].includes(result.reason);
      return workspaceJson({ error: { code: capacity ? 'BACKUP_CAPACITY' : 'BACKUP_FAILED', message: capacity
        ? 'This workspace has outgrown the application snapshot limit. Use a full database export through your deployment operator.'
        : 'The backup could not be verified. Check storage and retry later.' } }, 503);
    }
    await env.DB.prepare(`INSERT INTO crm_audit (public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(`AUD-${crypto.randomUUID()}`, principal.id, principal.name, principal.role,
      'backup.requested', 'backup', result.backupId, 'Created and verified a manual backup', JSON.stringify({ verified: true, date: result.date }), new Date().toISOString()).run();
    return workspaceJson({ data: { ok: true, verified: true, date: result.date, counts: result.counts } });
  }
  if (request.method !== 'GET') return workspaceJson({ error: { code: 'METHOD_NOT_ALLOWED', message: 'This endpoint is read-only.' } }, 405);
  const [migration, backupEvent, dbProbe, fileProbe, throttleProbe, operations] = await Promise.all([
    env.DB.prepare('SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 1').first(),
    env.DB.prepare("SELECT event_type,created_at,payload_json FROM events WHERE event_type IN ('backup.created','backup.failed') ORDER BY id DESC LIMIT 1").first(),
    probe(()=>env.DB.prepare('SELECT 1 AS healthy').first(),Boolean(env.DB)),
    probe(()=>env.R2.list({prefix:'backups/committed/daily/',limit:1}),Boolean(env.R2?.list)),
    probe(()=>env.RATE_LIMIT.get('__gyutron_health_read_probe__'),Boolean(env.RATE_LIMIT?.get)),
    operationHealth(env.DB),
  ]);
  let payload = {};
  try { payload = JSON.parse(backupEvent?.payload_json || '{}'); } catch { /* Corrupt metadata is reported as unverified. */ }
  const backupAt = backupEvent?.created_at || null;
  const verified = backupEvent?.event_type === 'backup.created' && payload.verified === true;
  const stale = !backupAt || !Number.isFinite(Date.parse(backupAt)) || Date.now() - Date.parse(backupAt) > 26 * 3600 * 1000;
  return workspaceJson({ data: {
    version,
    workspace: { name: String(env.ADMIN_WORKSPACE_NAME || env.DATA_SOURCE_NAME || 'GYUTRON').slice(0, 200), tenancy: 'deployment', timezone: workspaceTimeZone(env) },
    storage: { database: Boolean(env.DB), privateFiles: Boolean(env.R2), requestThrottle: Boolean(env.RATE_LIMIT) },
    probes: {checked_at:new Date().toISOString(),mode:'read',database:dbProbe,privateFiles:fileProbe,requestThrottle:throttleProbe},
    operations,
    migration: { latest: migration?.name || null },
    security: { sessionHours: SESSION_TTL_SECONDS / 3600, idleHours: 2, staffPasswordMinLength: 12,
      ownerCredentialStrong: typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 12,
      ownerMode: 'deployment-secret', namedTeamAccounts: true, rolesEnforcedOnServer: true },
    backup: { status: backupEvent ? (verified ? 'verified' : 'unverified') : 'none', at: backupAt,
      verified, stale, schemaVersion: verified ? payload.schema_version : null,
      failureCode: backupEvent?.event_type === 'backup.failed' && /^BACKUP_[A-Z_]+$/.test(payload.reason || '') ? payload.reason : null,
      totalRows: verified && payload.counts ? Object.values(payload.counts).reduce((sum, n) => sum + (Number.isSafeInteger(n) ? n : 0), 0) : null,
      retentionOk: verified ? payload.retention_ok === true : null },
    session: { expiresAt: principal.expiresAt },
  } });
}
