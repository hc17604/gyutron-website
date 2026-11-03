import { requirePermission, WorkspaceError } from '../platform/crm/schema.mjs';
import { rateLimit } from '../platform/security/ratelimit.mjs';
import { workspaceTimeZone } from '../platform/crm/time.mjs';
import { workspaceJson, assertWorkspaceOrigin } from './admin-api.mjs';
import { calculateQuote, quoteError } from '../platform/quotes/schema.mjs';
import { getQuote,listQuotes,createQuote,updateQuote,issueQuote,reviseQuote,setQuoteStatus,archiveQuote,quoteSnapshot } from '../platform/quotes/repository.mjs';
import { renderQuoteDocument,renderQuoteReferenceCss,QUOTE_PRINT_CSS,QUOTE_PRINT_JS } from '../platform/quotes/document.mjs';

const MAX_BODY_BYTES=1024*1024;
async function bodyOf(request) {
  if ((request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()!=='application/json') throw quoteError('UNSUPPORTED_MEDIA_TYPE','Send this request as application/json.',null,415);
  if (Number(request.headers.get('content-length') || 0)>MAX_BODY_BYTES) throw quoteError('PAYLOAD_TOO_LARGE','This quotation request exceeds 1 MiB.',null,413);
  const reader=request.body?.getReader(); if(!reader)throw quoteError('INVALID_JSON','A JSON object is required.',null,400);
  const chunks=[];let size=0;
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY_BYTES){await reader.cancel();throw quoteError('PAYLOAD_TOO_LARGE','This quotation request exceeds 1 MiB.',null,413);}chunks.push(value);}}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}
  catch{throw quoteError('INVALID_JSON','Use a valid JSON object.',null,400);}
}
function method(allow){return workspaceJson({error:{code:'METHOD_NOT_ALLOWED',message:'This quotation action does not support this method.'}},405,{allow});}
function failure(error){
  if(error instanceof WorkspaceError)return workspaceJson({error:{code:error.code,message:error.message,...(error.fields?{fields:error.fields}:{})}},error.status);
  if(error instanceof URIError)return workspaceJson({error:{code:'INVALID_PATH',message:'This quotation address is invalid.'}},400);
  if(/Quote requires active|Issued quotation|Active quotations prevent|Quotation history prevents/.test(error?.message || ''))return workspaceJson({error:{code:'QUOTATION_CONFLICT',message:'The quotation or a related record changed. Reload before continuing.'}},409);
  console.error('quotation operation failed',error?.name || 'Error');
  return workspaceJson({error:{code:'SERVICE_UNAVAILABLE',message:'This quotation request could not be completed. Reload the quotation before retrying.'}},503);
}
export async function handleAdminQuotes(request,env,ctx,url=new URL(request.url),principal){
  try{
    requirePermission(principal,'read');assertWorkspaceOrigin(request);
    if(!env.DB)throw quoteError('DATABASE_UNAVAILABLE','Quotation storage is unavailable.',null,503);
    const parts=url.pathname.slice('/admin/api/quotes'.length).split('/').filter(Boolean);
    const options=Object.fromEntries(url.searchParams);
    const throttle=await rateLimit(env,`quotes:${request.method==='GET'?'read':'write'}:${principal.id}`,{limit:request.method==='GET'?240:120,windowSeconds:60});
    if(!throttle.ok)return workspaceJson({error:{code:'RATE_LIMITED',message:'Too many quotation requests. Wait and try again.'}},429,{'retry-after':String(throttle.retryAfter || 60)});
    if(parts.length===0){
      if(request.method==='GET')return workspaceJson(await listQuotes(env.DB,options,principal));
      if(request.method==='POST')return workspaceJson({data:await createQuote(env.DB,env,await bodyOf(request),principal)},201);
      return method('GET, POST');
    }
    if(parts[0]==='calculate'&&parts.length===1){
      if(request.method!=='POST')return method('POST');
      const input=await bodyOf(request);if(Object.keys(input).some(key=>!['currency','items','discount_minor','tax_minor','shipping_minor'].includes(key)))throw quoteError('VALIDATION_ERROR','Use only item and manual amount fields for calculation.');
      return workspaceJson({data:calculateQuote(input)});
    }
    const publicId=decodeURIComponent(parts[0]);
    if(parts.length===1){
      if(request.method==='GET')return workspaceJson({data:await getQuote(env.DB,publicId,principal)});
      if(request.method==='PATCH')return workspaceJson({data:await updateQuote(env.DB,publicId,await bodyOf(request),principal)});
      if(request.method==='DELETE')return workspaceJson({data:await archiveQuote(env.DB,publicId,await bodyOf(request),principal)});
      return method('GET, PATCH, DELETE');
    }
    if(parts.length===2){
      if(request.method!=='POST')return method('POST');const input=await bodyOf(request);
      if(parts[1]==='issue')return workspaceJson(await issueQuote(env.DB,publicId,input,principal,{timeZone:workspaceTimeZone(env)}));
      if(parts[1]==='revise'){const result=await reviseQuote(env.DB,env,publicId,input,principal);return workspaceJson(result,result.meta.already_revised?200:201);}
      if(parts[1]==='status')return workspaceJson(await setQuoteStatus(env.DB,publicId,input,principal));
      if(parts[1]==='restore')return workspaceJson({data:await archiveQuote(env.DB,publicId,input,principal,{restore:true})});
    }
    throw quoteError('NOT_FOUND','This quotation endpoint could not be found.',null,404);
  }catch(error){return failure(error);}
}
export async function handleQuoteDocument(request,env,ctx,url=new URL(request.url),principal){
  try{
    requirePermission(principal,'read');if(!['GET','HEAD'].includes(request.method))return method('GET, HEAD');
    const headers={'cache-control':'no-store, private','x-content-type-options':'nosniff','x-robots-tag':'noindex,nofollow'};
    if(url.pathname==='/admin/quotes/assets/print.css')return new Response(request.method==='HEAD'?null:QUOTE_PRINT_CSS,{headers:{...headers,'content-type':'text/css; charset=utf-8'}});
    if(url.pathname==='/admin/quotes/assets/print.js')return new Response(request.method==='HEAD'?null:QUOTE_PRINT_JS,{headers:{...headers,'content-type':'text/javascript; charset=utf-8'}});
    const match=url.pathname.match(/^\/admin\/quotes\/([^/]+)\/(print|print\.css)$/);if(!match)throw quoteError('NOT_FOUND','This quotation document could not be found.',null,404);
    if(!env.DB)throw quoteError('DATABASE_UNAVAILABLE','Quotation storage is unavailable.',null,503);
    const data=await quoteSnapshot(env.DB,decodeURIComponent(match[1]),principal,{timeZone:workspaceTimeZone(env)});
    const requestedLang=url.searchParams.get('lang'),lang=['en','zh','de','ja'].includes(requestedLang)?requestedLang:'en';
    if(match[2]==='print.css')return new Response(request.method==='HEAD'?null:renderQuoteReferenceCss(data,{lang}),{headers:{...headers,'content-type':'text/css; charset=utf-8'}});
    return new Response(request.method==='HEAD'?null:renderQuoteDocument(data,{lang}),{headers:{...headers,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'"}});
  }catch(error){return failure(error);}
}
