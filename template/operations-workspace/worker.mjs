/** Dedicated Operations instance. No brand-site, Shop or public submission routes. */
import { handleAdmin } from './api/admin.mjs';
import { runBackup } from './api/backup.mjs';
import { runOperationsScheduled } from './platform/operations/scheduler.mjs';
import { CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET } from './admin/charts-runtime-url.mjs';
import { COUNTRY_NAMES } from './admin/country-data.mjs';

const ASSETS = new Set(['/brand-tokens.css','/gyutron-logo-light.svg','/gyutron-logo.svg','/favicon.ico','/favicon-32x32.png','/gyutron-logo-purple.png','/workspace-assets/gyutron-mark.png','/workspace-assets/fonts/inter-latin.woff2','/workspace-assets/fonts/OFL.txt',CHARTS_RUNTIME_ASSET,CHARTS_LICENSE_ASSET,CHARTS_NOTICE_ASSET,'/workspace-assets/flags/LICENSE.txt','/workspace-assets/flags/manifest.json',...Object.keys(COUNTRY_NAMES).map(code=>'/workspace-assets/flags/'+code.toLowerCase()+'.svg')]);
export default {
  async fetch(request,env,ctx) {
    const url = new URL(request.url), read = ['GET','HEAD'].includes(request.method);
    if(url.pathname==='/health') return new Response(read && request.method!=='HEAD' ? JSON.stringify({status:'ok'}) : null,{status:read?200:405,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...(read?{}:{allow:'GET, HEAD'})}});
    if(url.pathname==='/' && read) return new Response(null,{status:302,headers:{location:'/admin','cache-control':'no-store'}});
    if(url.pathname==='/admin'||url.pathname.startsWith('/admin/')) return handleAdmin(request,env,ctx,url);
    if(read && ASSETS.has(url.pathname)) return env.ASSETS.fetch(request);
    return new Response(request.method==='HEAD'?null:'Not found',{status:404,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
  },
  async scheduled(event,env,ctx) { if(!event?.cron||event.cron==='0 18 * * *'){ctx.waitUntil(runBackup(env));return;}ctx.waitUntil(runOperationsScheduled(env)); },
};
