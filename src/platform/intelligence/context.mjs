/** Bounded, explainable keyword windows. This is not semantic/vector retrieval. */
export const DOCUMENT_MAX_BYTES=200*1024;
export const DOCUMENT_MAX_CHARACTERS=200*1024;
export const MAX_SELECTED_DOCUMENTS=8;
export const DOCUMENT_EXCERPT_CHARACTERS=12000;
export const FACTS_MAX_CHARACTERS=120000;
export const HISTORY_MAX_CHARACTERS=12000;
const STOP=new Set(['what','when','where','which','with','from','this','that','please','about','your','have','does','business','context','根据','我们','怎么','什么','如何','请问','相关','一下','进行','について','ください']);
export function queryTerms(query){const full=String(query).toLowerCase().match(/[\p{L}\p{N}_-]{2,80}/gu)||[];const terms=[];for(const value of full){if(STOP.has(value))continue;if(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value)){if(value.length<=12)terms.push(value);for(let i=0;i<value.length-1;i++){const part=value.slice(i,i+2);if(!STOP.has(part))terms.push(part);}}else terms.push(value);}return[...new Set(terms)].slice(0,32);}
export function excerptForQuery(content,query,maxCharacters=DOCUMENT_EXCERPT_CHARACTERS){
 const lower=content.toLowerCase(),terms=queryTerms(query),positions=terms.map(term=>({term,index:lower.indexOf(term)})).filter(item=>item.index>=0);
 let start=0,score=-1,matched=[];for(const candidate of positions){const candidateStart=Math.max(0,Math.min(content.length-maxCharacters,candidate.index-Math.floor(maxCharacters/2))),end=candidateStart+maxCharacters,hits=positions.filter(item=>item.index>=candidateStart&&item.index<end);if(hits.length>score){start=candidateStart;score=hits.length;matched=hits.map(item=>item.term);}}
 let end=Math.min(content.length,start+maxCharacters);if(start>0&&content.charCodeAt(start)>=0xdc00&&content.charCodeAt(start)<=0xdfff)start++;if(end<content.length&&content.charCodeAt(end)>=0xdc00&&content.charCodeAt(end)<=0xdfff)end--;return{content:content.slice(start,end),excerpt_start:start,excerpt_end:end,source_length:content.length,truncated:content.length>end-start,excerpt_strategy:matched.length?'keyword-window':'leading-window',matched_terms:matched,offset_unit:'utf16_code_units'};
}
export function summarizedRuleConfig(config){let truncated=false;const value={};for(const[key,item]of Object.entries(config||{})){if(Array.isArray(item)){value[key]=item.slice(0,12).map(v=>typeof v==='string'?v.slice(0,200):v);if(item.length>12)truncated=true;}else if(typeof item==='string'){value[key]=item.slice(0,500);if(item.length>500)truncated=true;}else if(['number','boolean'].includes(typeof item)||item===null)value[key]=item;else{value[key]='[structured value omitted]';truncated=true;}}return{config:value,truncated};}
export function boundFacts(facts,citations,query){
 const measure=()=>JSON.stringify(facts).length;let used=measure(),passes=0;
 while(used>FACTS_MAX_CHARACTERS&&passes++<200){const candidates=[...facts.documents,...facts.memory].filter(item=>item.content.length>200).sort((a,b)=>b.content.length-a.content.length);const chosen=candidates[0];if(!chosen)break;const cut=Math.max(200,chosen.content.length-Math.max(500,Math.min(6000,Math.ceil((used-FACTS_MAX_CHARACTERS)/2))));const piece=excerptForQuery(chosen.content,query,cut),oldStart=chosen.excerpt_start||0;Object.assign(chosen,piece,{excerpt_start:oldStart+piece.excerpt_start,excerpt_end:oldStart+piece.excerpt_end,source_length:chosen.source_length,truncated:true,budget_truncated:true});used=measure();}
 if(used>FACTS_MAX_CHARACTERS)throw new Error('Bounded context exceeds the facts limit');
 for(const citation of citations){const item=[...facts.documents,...facts.memory].find(row=>row.id===citation.id);if(!item)continue;const piece=excerptForQuery(item.content,query,1000);Object.assign(citation,{excerpt:piece.content,excerpt_start:(item.excerpt_start||0)+piece.excerpt_start,excerpt_end:(item.excerpt_start||0)+piece.excerpt_end,source_length:item.source_length||item.content.length,truncated:Boolean(item.truncated),excerpt_strategy:item.excerpt_strategy,budget_truncated:Boolean(item.budget_truncated)});}
 return{facts_max_characters:FACTS_MAX_CHARACTERS,facts_characters:used,selected_documents_max:MAX_SELECTED_DOCUMENTS,document_excerpt_max_characters:DOCUMENT_EXCERPT_CHARACTERS,history_max_characters:HISTORY_MAX_CHARACTERS,question_max_characters:6000,provider_request_max_bytes:512*1024};
}
