import {audit,err,known,nowIso,one,pagination,parseJson,rows,text,uuid,day,source,CURRENCIES} from './common.mjs';
import {operationFilters,readOperationsAnalytics,shiftDay} from './analytics.mjs';
import {workspaceDate} from '../crm/time.mjs';
import {ruleSnapshot} from './rules.mjs';
const COPY={en:{daily:'Daily owner report',weekly:'Weekly operating report',opportunities:'Opportunity review',summary:'Operating summary',orders:'Orders',paid:'Paid orders',inquiries:'New enquiries',open:'Open enquiries',overdue:'Overdue enquiries',revenue:'Paid order value before refunds, by currency',risks:'Rules and follow-up',products:'Product demand',comparison:'Previous period',method:'Deterministic report from stored records. Payments and refunds are reconciled separately, never added to order value. This is not accounting net revenue. No exchange conversion or model-generated claims.'},zh:{daily:'经营日报',weekly:'经营周报',opportunities:'机会分析报告',summary:'经营摘要',orders:'订单',paid:'已付款订单',inquiries:'新增询盘',open:'未处理询盘',overdue:'超期询盘',revenue:'已付订单金额（退款前，按币种分别统计）',risks:'规则与跟进',products:'产品需求',comparison:'上一周期',method:'基于实际存储数据的确定性报告。付款和退款记录单独核对，不与订单金额重复累加，也不代表会计净营收。不进行汇率转换，不产生模型推测。'}};
function amountString(value,currency){const s=BigInt(value).toString(),digits=['JPY','KRW'].includes(currency)?0:2;return digits?s.padStart(digits+1,'0').slice(0,-digits)+'.'+s.padStart(digits+1,'0').slice(-digits):s;}
export function publicReport(r){return {...r,status:'ready',filters:parseJson(r.filters_json),summary:parseJson(r.summary_json),rules_snapshot:parseJson(r.rules_snapshot_json,[]),filters_json:undefined,summary_json:undefined,rules_snapshot_json:undefined};}
export async function generateReport(db,input,p,{timeZone='Asia/Singapore',runId=null,ruleSnapshots=null}={}){
 known(input,['type','language','from','to','source_id','currency','exclude_tests']);const type=input.type||'daily',language=input.language||'en';if(!['daily','weekly','opportunities'].includes(type)||!['en','zh'].includes(language))throw err('INVALID_REPORT','Choose a supported report type and language.');
 if(runId){const existing=await one(db,'SELECT * FROM ops_reports WHERE run_id=?',[runId]);if(existing)return publicReport(existing);}
 const today=workspaceDate(timeZone),end=input.to||(type==='daily'?shiftDay(today,-1):today),start=input.from||(type==='daily'?end:shiftDay(end,type==='weekly'?-6:-29));const filters=operationFilters({...input,from:start,to:end},timeZone),snapshot=ruleSnapshots||await ruleSnapshot(db),summary=await readOperationsAnalytics(db,{...input,from:start,to:end},{timeZone});
 const findingWhere=["status='open'"],findingArgs=[];if(input.source_id){findingWhere.push("(json_extract(evidence_json,'$.source_id')=? OR (?='native-website' AND entity_type!='orders'))");findingArgs.push(input.source_id,input.source_id);}if(input.currency){findingWhere.push("(entity_type!='orders' OR json_extract(evidence_json,'$.currency')=?)");findingArgs.push(input.currency);}const findings=await rows(db,"SELECT rule_id,title,priority,entity_type,entity_id,task_id FROM ops_rule_findings WHERE "+findingWhere.join(' AND ')+" ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 ELSE 2 END,created_at DESC LIMIT 20",findingArgs);summary.open_findings=findings;summary.open_findings_scope={time:'Current open findings at report generation, not newly created findings within the metric period.',source_id:input.source_id||'',currency:input.currency||'',limit:20};summary.method='deterministic';summary.generated_at=nowIso();
 const t=COPY[language],title=`${t[type]} · ${start}${start===end?'':' — '+end}`,lines=[`# ${title}`,'',`${filters.timeZone} · ${input.source_id||'All sources'}${input.currency?' · '+input.currency:''}`,'',`## ${t.summary}`,...[['orders',t.orders],['paid_orders',t.paid],['inquiries',t.inquiries],['open_inquiries',t.open],['overdue_inquiries',t.overdue]].map(([k,label])=>`- ${label}: ${summary.counts[k]} (${t.comparison}: ${summary.comparison[k]})`),'',`## ${t.revenue}`,...(summary.revenue_by_currency.length?summary.revenue_by_currency.map(r=>`- ${r.currency}: ${amountString(r.amount_minor_exact,r.currency)} · ${t.paid}: ${r.paid_orders} · AOV: ${amountString(r.aov_minor_exact,r.currency)}`):['- 0']),'',`## ${t.products}`,...(summary.website.top_products.length?summary.website.top_products.slice(0,10).map(r=>`- ${r.product}: ${r.count}`):['- 0']),'',`## ${t.risks}`,...(findings.length?findings.map(f=>`- [${f.priority}] ${f.title} (${f.entity_type}/${f.entity_id}; ${f.task_id})`):['- 0']),'',t.method];
 const id=uuid('REP'),at=nowIso();await db.batch([db.prepare('INSERT OR IGNORE INTO ops_reports(id,type,title,language,filters_json,summary_json,content_markdown,rules_snapshot_json,created_by,created_at,run_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(id,type,title,language,JSON.stringify(summary.filters),JSON.stringify(summary),lines.join('\n'),JSON.stringify(snapshot.map(r=>({id:r.id,name:r.name,version:r.version,config:r.config}))),p.id,at,runId),db.prepare('INSERT INTO crm_audit(public_id,actor_id,actor_name,actor_role,action,entity_type,entity_id,summary,metadata_json,created_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE changes()=1').bind(uuid('AUD'),p.id,p.name||p.id,p.role,'generated','operating_report',id,'Generated deterministic operating report',JSON.stringify({type,from:start,to:end}),at)]);
 return publicReport(await one(db,'SELECT * FROM ops_reports WHERE '+(runId?'run_id':'id')+'=?',[runId||id]));
}
export async function listReports(db,o={}){
 known(o,['page','limit','type','from','to','source_id','currency']);
 const {page,limit,offset}=pagination(o),from=o.from?day(o.from):'',to=o.to?day(o.to):'',type=o.type||'',sourceId=text(o.source_id||'',100),currency=o.currency||'';
 if(from&&to&&from>to)throw err('INVALID_RANGE','Select an ordered report coverage period.');
 if(type&&!['daily','weekly','opportunities'].includes(type))throw err('INVALID_REPORT','Choose a supported report type.');
 if(currency&&!CURRENCIES.includes(currency))throw err('INVALID_CURRENCY','Select a supported currency.');
 if(sourceId)await source(db,sourceId);
 const where=[],args=[],json="CASE WHEN json_valid(filters_json) THEN filters_json ELSE '{}' END",saved=key=>`json_extract(${json},'$.${key}')`,start=saved('from'),end=saved('to');
 if(type){where.push('type=?');args.push(type);}
 if(sourceId){where.push(saved('source_id')+'=?');args.push(sourceId);}
 if(currency){where.push(saved('currency')+'=?');args.push(currency);}
 if(from||to){
  // A report's creation timestamp cannot substitute for a missing saved business period.
  for(const value of [start,end])where.push(`typeof(${value})='text' AND length(${value})=10 AND date(${value},'+0 days')=${value}`);
  where.push(start+'<='+end);
  if(to){where.push(start+'<=?');args.push(to);}
  if(from){where.push(end+'>=?');args.push(from);}
 }
 const suffix=where.length?' WHERE '+where.join(' AND '):'';
 const result=await db.batch([
  db.prepare('SELECT * FROM ops_reports'+suffix+' ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?').bind(...args,limit,offset),
  db.prepare('SELECT COUNT(*) n FROM ops_reports'+suffix).bind(...args),
 ]),total=Number(result[1].results?.[0]?.n||0);
 return{data:(result[0].results||[]).map(publicReport),meta:{page,limit,total,pages:Math.ceil(total/limit),filters:{from,to,type,source_id:sourceId,currency},date_basis:'saved_coverage_overlap',source_currency_basis:'exact_saved_generation_scope'}};
}
export async function getReport(db,id){const r=await one(db,'SELECT * FROM ops_reports WHERE id=?',[id]);if(!r)throw err('NOT_FOUND','Report not found.',404);return publicReport(r);}
