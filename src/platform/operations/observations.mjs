import {parseCsv} from './imports.mjs';
import {CURRENCIES,err,known,manager,one,rows,source,uuid,day,nowIso,pagination} from './common.mjs';
import {sha256Hex} from '../security/hash.mjs';
import {OBSERVATION_METRICS,OBSERVATION_DIMENSIONS,OBSERVATION_SERIES,OBSERVATION_COLUMNS,ADVISER_LIMITS} from './adviser-contract.mjs';
const specFor=key=>OBSERVATION_METRICS.find(metric=>metric.key===key);
export function aggregateDimension(value,key){
 if(typeof value!=='string')throw err('INVALID_DIMENSION','Use aggregate dimension text.');value=value.trim();
 if(value.length>120||/[\u0000-\u001f\u007f@=<>]/u.test(value)||/^[\s]*[+\-@=]/u.test(value)||/https?:|www\.|(?:\d{1,3}\.){3}\d{1,3}|\b(?:api[_ -]?key|password|bearer|secret)\b/i.test(value)||/^(?:\+?\d[\s().-]*){7,}$/.test(value)||/^[a-f0-9:]{8,}$/i.test(value)&&value.includes(':'))throw err('PII_OR_FORMULA','Only non-personal aggregate labels are allowed; no addresses, IPs, phone numbers, URLs, credentials or formulas.');
 if(key==='device'&&value&&!['desktop','mobile','tablet','other','unknown'].includes(value))throw err('INVALID_DIMENSION','Device must be desktop, mobile, tablet, other or unknown.');
 return value;
}
function whole(value,key,{optional=false}={}){const s=String(value??'').trim();if(optional&&!s)return null;if(!/^\d{1,30}$/.test(s))throw err('INVALID_OBSERVATION','Use nonnegative integer strings of at most 30 digits for '+key+'.');return BigInt(s).toString();}
async function enabledSource(db,id){const selected=await source(db,id);if(selected.kind!=='csv_generic'||!selected.enabled)throw err('INVALID_ANALYTICS_SOURCE','Choose an enabled generic CSV source for aggregate metrics.',409);return selected;}
export function observationTemplate(){return OBSERVATION_COLUMNS.join(',')+'\r\n';}
async function validateCsv(input){
 known(input,['source_id','csv','sha256']);if(typeof input.source_id!=='string'||!input.source_id||input.source_id.length>100)throw err('INVALID_SOURCE','Select an aggregate data source.');
 const parsed=parseCsv(input.csv);if(parsed.headers.some(header=>!OBSERVATION_COLUMNS.includes(header)))throw err('INVALID_OBSERVATION_COLUMNS','Use only the aggregate template columns; personal fields are not accepted.');
 for(const required of ['date','metric','unit'])if(!parsed.headers.includes(required))throw err('MISSING_MAPPING','The aggregate CSV requires '+required+'.');
 const normalized=[],errors=[],seen=new Set();
 for(const row of parsed.records){try{
  if(row.error)throw err('INVALID_CSV',row.error);const raw=Object.fromEntries(parsed.headers.map((key,index)=>[key,row.values[index].trim()])),spec=specFor(raw.metric);if(!spec)throw err('INVALID_METRIC','This metric is not in the aggregate import catalog.');
  const date=day(raw.date),date_to=day(raw.date_to||raw.date);if(date_to<date||Date.parse(date_to)-Date.parse(date)>3659*86400000)throw err('INVALID_RANGE','Use an ordered aggregate period of at most 3660 days.');
  if(raw.unit!==spec.unit)throw err('INVALID_UNIT','The metric unit must be '+spec.unit+'.');const series=raw.series||'self';if(!OBSERVATION_SERIES.includes(series))throw err('INVALID_SERIES','Select self, peer_average or peer_leader.');
  const currency=raw.currency||'';if(spec.unit==='minor'?!CURRENCIES.includes(currency):Boolean(currency))throw err('INVALID_CURRENCY','Only minor-unit metrics require a supported currency.');
  let value_exact=null,numerator=null,denominator=null;if(spec.unit==='ratio'){if(raw.value_exact)throw err('INVALID_RATIO','Ratio rows require numerator and denominator, not an averaged value.');numerator=whole(raw.numerator,'numerator');denominator=whole(raw.denominator,'denominator');if(denominator==='0'||BigInt(numerator)>BigInt(denominator))throw err('INVALID_RATIO','Use 0 <= numerator <= denominator with denominator greater than zero.');}else{value_exact=whole(raw.value_exact,'value_exact');if(raw.numerator||raw.denominator)throw err('INVALID_OBSERVATION','Count and minor-unit rows do not take ratio fields.');}
  const dimensions=Object.fromEntries(OBSERVATION_DIMENSIONS.map(key=>[key,aggregateDimension(raw[key]||'',key)])),scope_hash=await sha256Hex(JSON.stringify(dimensions));
  const key=JSON.stringify([date,date_to,raw.metric,currency,series,scope_hash]);if(seen.has(key))throw err('DUPLICATE_OBSERVATION','Duplicate metric/date/series/dimension scope in this CSV.');seen.add(key);
  normalized.push({row_number:row.row_number,date,date_to,metric:spec.key,value_exact,numerator,denominator,unit:spec.unit,currency,series,...dimensions,scope_hash});
 }catch(error){errors.push({row_number:row.row_number,code:error.code||'INVALID_OBSERVATION',message:error.message});}}
 return{sha256:await sha256Hex(input.csv),valid:errors.length===0,total_rows:parsed.records.length,valid_rows:normalized.length,errors,sample:normalized.slice(0,20),columns:OBSERVATION_COLUMNS,source_id:input.source_id,normalized};
}
export async function previewObservations(db,input,principal){manager(principal);await enabledSource(db,input.source_id);const {normalized,...preview}=await validateCsv(input);return preview;}
export async function commitObservations(db,input,principal){
 manager(principal);const validated=await validateCsv(input);if(typeof input.sha256!=='string'||input.sha256!==validated.sha256)throw err('PREVIEW_CHANGED','CSV content changed after preview. Preview the exact content again.',409);
 if(!validated.valid)throw err('OBSERVATION_VALIDATION','Every aggregate row must be valid. Nothing was imported.',422,{rows:validated.errors});
 const existing=await one(db,'SELECT id,source_id,sha256,row_count,status,created_at FROM ops_analytics_imports WHERE source_id=? AND sha256=?',[input.source_id,validated.sha256]);if(existing)return{...existing,already_imported:true};await enabledSource(db,input.source_id);
 const id=uuid('AMIMP'),token=crypto.randomUUID(),at=nowIso(),data=validated.normalized.map(row=>({...row,id:uuid('OBS')}));
 const columns=['id','source_id','date','date_to','metric','value_exact','numerator','denominator','unit','currency','series',...OBSERVATION_DIMENSIONS,'scope_hash','import_id','created_at','updated_at'];
 const select=columns.map(column=>column==='source_id'?'?':column==='import_id'?'?':['created_at','updated_at'].includes(column)?'?':`json_extract(j.value,'$.${column}')`);
 const values=columns.filter(column=>['source_id','import_id','created_at','updated_at'].includes(column)).map(column=>column==='source_id'?input.source_id:column==='import_id'?id:at);
 const updates=['value_exact','numerator','denominator','unit','import_id','updated_at'].map(column=>column+'=excluded.'+column).concat('version=ops_analytics_observations.version+1').join(',');
 try{await db.batch([
  db.prepare("INSERT INTO ops_analytics_imports(id,source_id,sha256,row_count,status,created_by,created_at,mutation_token) SELECT ?,?,?,?,'completed',?,?,? WHERE EXISTS(SELECT 1 FROM ops_data_sources WHERE id=? AND kind='csv_generic' AND enabled=1) ON CONFLICT(source_id,sha256) DO NOTHING").bind(id,input.source_id,validated.sha256,data.length,principal.id,at,token,input.source_id),
  db.prepare(`INSERT INTO ops_analytics_observations(${columns.join(',')}) SELECT ${select.join(',')} FROM json_each(?) j WHERE EXISTS(SELECT 1 FROM ops_analytics_imports WHERE id=? AND mutation_token=?) ON CONFLICT(source_id,date,date_to,metric,currency,series,scope_hash) DO UPDATE SET ${updates}`).bind(...values,JSON.stringify(data),id,token),
  db.prepare("INSERT INTO crm_audit(public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) SELECT ?,?,?,?,'imported','analytics_observation',?,'Imported validated aggregate metrics',?,? WHERE EXISTS(SELECT 1 FROM ops_analytics_imports WHERE id=? AND mutation_token=?)").bind(uuid('AUD'),principal.id,principal.name||principal.id,principal.role,id,JSON.stringify({source_id:input.source_id,sha256:validated.sha256,rows:data.length}),at,id,token),
 ]);}catch(error){if(String(error.message).includes('ANALYTICS_CAPACITY')||String(error.message).includes('ANALYTICS_IMPORT_CAPACITY'))throw err('ANALYTICS_CAPACITY','Aggregate retention capacity reached. Contact the deployment operator.',409);throw error;}
 const saved=await one(db,'SELECT id,source_id,sha256,row_count,status,created_at FROM ops_analytics_imports WHERE source_id=? AND sha256=?',[input.source_id,validated.sha256]);if(!saved)throw err('SOURCE_PAUSED','The source changed or paused; no observations were imported.',409);return{...saved,already_imported:saved.id!==id};
}
export async function observationImports(db,query){known(query,['source_id','page','limit']);const {page,limit,offset}=pagination(query),where=query.source_id?' WHERE source_id=?':'',args=query.source_id?[query.source_id]:[];const result=await db.batch([db.prepare('SELECT id,source_id,sha256,row_count,status,created_at,created_by FROM ops_analytics_imports'+where+' ORDER BY created_at DESC,id LIMIT ? OFFSET ?').bind(...args,limit,offset),db.prepare('SELECT COUNT(*) n FROM ops_analytics_imports'+where).bind(...args)]);return{data:result[0].results||[],meta:{page,limit,total:result[1].results?.[0]?.n||0}};}
export function ratioExact(numerator,denominator,places=12){const n=BigInt(numerator),d=BigInt(denominator);if(!d)return null;const factor=10n**BigInt(places),scaled=(n*factor+d/2n)/d;return (scaled/factor).toString()+'.'+(scaled%factor).toString().padStart(places,'0');}
export function selectedObservationRows(selected,spec,from,to){
 if(spec.aggregation==='period_exact')return selected.filter(row=>row.date===from&&row.date_to===to);
 const exact=selected.filter(row=>row.date===from&&row.date_to===to);
 return exact.length===1&&from!==to?exact:selected.filter(row=>row.date===row.date_to&&row.date>=from&&row.date<=to);
}
export function observationCoverage(selected,spec,from,to){
 const intervals=selectedObservationRows(selected,spec,from,to).map(row=>[row.date,row.date_to]).sort((a,b)=>a[0].localeCompare(b[0])),merged=[];
 for(const interval of intervals){const previous=merged.at(-1);if(previous&&interval[0]<=new Date(Date.parse(previous[1]+'T00:00:00Z')+86400000).toISOString().slice(0,10)){if(interval[1]>previous[1])previous[1]=interval[1];}else merged.push([...interval]);}
 const signature=merged.map(interval=>interval.join('/')).join(',');return{signature,complete:signature===from+'/'+to,periods:merged,requested_from:from,requested_to:to};
}
export function aggregateObservations(selected,spec,from,to){
 const coverage=observationCoverage(selected,spec,from,to);selected=selectedObservationRows(selected,spec,from,to);
 if(spec.aggregation==='period_exact'){if(selected.length!==1)return{value_exact:null,status:'non_additive',reason:'Unique visitors need one observation covering the exact selected period; daily UV is not summed.',coverage};return{value_exact:selected[0].value_exact,status:'available',coverage};}
 if(!selected.length)return{value_exact:null,status:'not_collected',reason:'No observation covers the requested date and dimension scope.',coverage};
 if(spec.aggregation==='weighted_ratio'){const n=selected.reduce((sum,row)=>sum+BigInt(row.numerator),0n),d=selected.reduce((sum,row)=>sum+BigInt(row.denominator),0n);return{value_exact:ratioExact(n,d),numerator_exact:n.toString(),denominator_exact:d.toString(),precision:12,status:'available',coverage};}
 return{value_exact:selected.reduce((sum,row)=>sum+BigInt(row.value_exact),0n).toString(),status:'available',coverage};
}
