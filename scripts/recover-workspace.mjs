/** Verify a downloaded snapshot, restore it into a new local SQLite DB, and emit recovery SQL.
 * Never connects to or overwrites a production database. Existing targets are rejected.
 */
import { readFile,writeFile,access } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { backupToSql } from '../src/api/backup.mjs';
const args=process.argv.slice(2),values={};for(let i=0;i<args.length;i+=2){if(!['--snapshot','--sql','--database','--sha256'].includes(args[i])||!args[i+1])throw Error('Usage: node scripts/recover-workspace.mjs --snapshot FILE --sql NEW.sql --database NEW.sqlite [--sha256 EXPECTED]');values[args[i]]=args[i+1];}
for(const key of ['--snapshot','--sql','--database'])if(!values[key])throw Error('Missing '+key);
const source=path.resolve(values['--snapshot']),sqlPath=path.resolve(values['--sql']),databasePath=path.resolve(values['--database']);
if(new Set([source,sqlPath,databasePath]).size!==3)throw Error('Source and recovery targets must be distinct.');
for(const target of [sqlPath,databasePath]){try{await access(target);throw Error('Recovery targets must be new files: '+target);}catch(e){if(e.code!=='ENOENT')throw e;}}
const bytes=await readFile(source);if(bytes.length>32*1024*1024)throw Error('Snapshot exceeds recovery input limits.');const sha=createHash('sha256').update(bytes).digest('hex');if(values['--sha256']&&sha!==values['--sha256'])throw Error('Snapshot SHA-256 mismatch.');
const snapshot=JSON.parse(bytes.toString('utf8')),sql=await backupToSql(snapshot),sqlite=new DatabaseSync(databasePath);sqlite.exec('PRAGMA foreign_keys=ON; BEGIN IMMEDIATE');
try{sqlite.exec(sql);const integrity=sqlite.prepare('PRAGMA integrity_check').get();if(Object.values(integrity)[0]!=='ok')throw Error('Restored database integrity check failed.');const fks=sqlite.prepare('PRAGMA foreign_key_check').all();if(fks.length)throw Error('Restored foreign keys failed validation.');for(const[table,count]of Object.entries(snapshot.manifest.counts)){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)||sqlite.prepare('SELECT COUNT(*) n FROM "'+table+'"').get().n!==count)throw Error('Restored table count mismatch.');}sqlite.exec('COMMIT');}catch(error){sqlite.exec('ROLLBACK');throw error;}finally{sqlite.close();}
await writeFile(sqlPath,sql,{flag:'wx'});process.stdout.write(JSON.stringify({ok:true,sha256:sha,format:snapshot.manifest.schema_version,migration:snapshot.manifest.migration_version,verified_tables:Object.keys(snapshot.manifest.counts).length,active_sessions_restored:false,database:databasePath,sql:sqlPath,production_writes:false},null,2)+'\n');
