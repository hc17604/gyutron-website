import { ADMIN_ICON_HTML } from './icons.mjs';
/** Navigation chrome and read-only presentation; mutations stay in their controllers. */
export const LAYOUT_CLIENT='const WORKSPACE_LAYOUT_ICONS='+JSON.stringify(Object.fromEntries(['overview','analytics','customers','pipeline','quotes','tasks','inbox','activity','sources','reports','automations','rules','agent','memory','models','users','security','backup','license','health','audit','settings'].map(name=>[name,ADMIN_ICON_HTML[name]])))+';\n'+String.raw`
(()=>{
 const sidebar=document.getElementById('workspace-sidebar'),page=document.getElementById('workspace-page');
 const frame=document.querySelector('.app-layout'),desktop=matchMedia('(min-width:1025px)');let railPointer=false,railKeyboard=false,keyboardInput=false,lastNavigationTab=null;
 function syncRail(tab){
  if(!frame)return;const compact=desktop.matches&&!(railPointer||railKeyboard);
  frame.dataset.secondaryNavigation=String(tab==='analytics');frame.dataset.primaryCompact=String(compact);
  for(const link of sidebar?.querySelectorAll('[data-nav]')||[]){const label=link.querySelector('.nav-link-label')?.textContent?.trim();if(label){link.title=label;const count=link.querySelector('.nav-count');link.setAttribute('aria-label',label+(count&&!count.hidden&&count.textContent.trim()?' · '+count.textContent.trim():''));}}
  const summary=sidebar?.querySelector('.nav-group-title');if(summary)summary.title=summary.querySelector('[data-i18n]')?.textContent?.trim()||'';
 }
 // Desktop follows pointer and keyboard focus; the content keeps its 72px rail offset.
 sidebar?.addEventListener('pointerenter',event=>{if(!desktop.matches||event.pointerType==='touch')return;railPointer=true;syncNavigation();});
 sidebar?.addEventListener('pointerleave',()=>{railPointer=false;syncNavigation();});
 document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboardInput=true;});
 document.addEventListener('pointerdown',event=>{keyboardInput=false;railKeyboard=false;if(!sidebar?.contains(event.target))railPointer=false;syncNavigation();});
 sidebar?.addEventListener('focusin',()=>{if(keyboardInput){railKeyboard=true;syncNavigation();}});
 sidebar?.addEventListener('focusout',event=>{if(!sidebar.contains(event.relatedTarget)){railKeyboard=false;syncNavigation();}});
 sidebar?.addEventListener('click',event=>{if(!desktop.matches||!event.target.closest('[data-nav],.workspace-brand'))return;railPointer=false;railKeyboard=false;document.getElementById('workspace-main')?.focus({preventScroll:true});syncNavigation();});
 desktop.addEventListener('change',()=>{railPointer=false;railKeyboard=false;syncNavigation();});
 const commandDialog=document.getElementById('command-dialog'),commandTrigger=document.getElementById('command-trigger');
 function closeCommand(returnFocus=false){if(!commandDialog?.open)return;const opener=commandDialog._workspaceOpener;commandDialog.close();if(returnFocus)(opener?.isConnected?opener:commandTrigger)?.focus();}
 // Keep the compact search panel non-modal; outside interactions remain available.
 commandDialog?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeCommand(true);}});
 commandDialog?.addEventListener('close',()=>{const opener=commandDialog._workspaceOpener;if(document.activeElement===document.body||commandDialog.contains(document.activeElement))(opener?.isConnected?opener:commandTrigger)?.focus();});
 document.addEventListener('pointerdown',event=>{if(commandDialog?.open&&!commandDialog.contains(event.target)&&!commandTrigger?.contains(event.target))closeCommand();});
 document.addEventListener('focusin',event=>{if(commandDialog?.open&&!commandDialog.contains(event.target)&&!commandTrigger?.contains(event.target))closeCommand();});
 function syncNavigation(){
  const tab=document.body?.dataset.workspaceTab||location.hash.slice(1).split('?')[0]||'overview';syncRail(tab);
  const active=Array.from(sidebar?.querySelectorAll('[data-nav]')||[]).find(link=>link.dataset.nav===tab);
  const group=active?.closest('details.nav-group');if(group&&tab!==lastNavigationTab)group.open=true;lastNavigationTab=tab;
  if(page){const params=new URLSearchParams(location.hash.split('?')[1]||'');page.dataset.viewKind=tab==='agent'?'chat':tab==='pipeline'?'board':['overview','analytics'].includes(tab)?'overview':params.has('id')?'detail':['settings','models','security','backup','health','license'].includes(tab)?'settings':'list';}
 }
 function decoratePresentation(){
  const requested=location.hash.slice(1).split('?')[0]||'overview',module=Object.hasOwn(WORKSPACE_LAYOUT_ICONS,requested)?requested:'overview';
  for(const heading of page?.querySelectorAll('.page-heading')||[]){const title=heading.querySelector('h1'),identity=title?.parentElement;if(!title||identity===heading)continue;identity.classList.add('page-title-block');let mark=identity.querySelector('.page-title-icon');if(!mark){mark=document.createElement('span');mark.className='page-title-icon';mark.setAttribute('aria-hidden','true');title.before(mark);}if(mark.dataset.module!==module){mark.dataset.module=module;mark.innerHTML=WORKSPACE_LAYOUT_ICONS[module]||WORKSPACE_LAYOUT_ICONS.overview;}}
  for(const mark of document.querySelectorAll('.activity-mark:empty')){const kind=mark.parentElement.querySelector('[data-record="tasks"]')?'tasks':'activity';mark.innerHTML=WORKSPACE_LAYOUT_ICONS[kind];}
  const stages=Array.from(page?.querySelectorAll('.stage-summary>div')||[]),max=Math.max(1,...stages.map(stage=>Number(stage.querySelector('.stage-count')?.textContent)||0));
  for(const stage of stages){const bar=stage.querySelector('.stage-bar');if(!bar)continue;const count=Number(stage.querySelector('.stage-count')?.textContent)||0,label=stage.querySelector('.stage-label')?.textContent||'',signature=count+'|'+max+'|'+label;if(bar.dataset.presentation===signature)continue;bar.dataset.presentation=signature;bar.setAttribute('role','img');bar.setAttribute('aria-label',label+': '+count);bar.innerHTML='<svg class="stage-bar-chart" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect class="stage-track" width="100" height="4"/><rect class="stage-fill" width="'+Math.max(0,Math.min(100,count/max*100)).toFixed(2)+'" height="4"/></svg>';}
 }
 const recordDialog=document.getElementById('record-dialog');
 function selectRecordTab(body,key,focus=false){
  const available=Array.from(body.querySelectorAll('[data-record-tab]'));if(!available.some(button=>button.dataset.recordTab===key))key='overview';body.dataset.recordSection=key;
  for(const button of available){const selected=button.dataset.recordTab===key;button.setAttribute('aria-selected',String(selected));button.dataset.active=String(selected);button.tabIndex=selected?0:-1;if(selected&&focus)button.focus();}
  for(const panel of body.querySelectorAll('[data-record-panel]'))panel.hidden=panel.dataset.recordPanel!==key;
 }
 function decorateRecordTabs(){
  decoratePresentation();if(!recordDialog?.classList.contains('record-workspace-dialog'))return;
  const body=recordDialog.querySelector('.dialog-body');if(!body)return;
  let tabs=body.querySelector('[data-record-tabs]');
  if(!tabs){const properties=body.querySelector(':scope>.detail-grid');if(!properties)return;const overview=document.createElement('section');overview.className='record-overview-panel';overview.id='record-panel-overview';overview.dataset.recordPanel='overview';overview.setAttribute('role','tabpanel');overview.setAttribute('aria-labelledby','record-tab-overview');overview.tabIndex=0;properties.before(overview);overview.append(properties);for(const notes of body.querySelectorAll(':scope>.detail-notes'))overview.append(notes);
   tabs=document.createElement('div');tabs.className='record-tabs';tabs.dataset.recordTabs='';tabs.setAttribute('role','tablist');for(const key of ['overview','activity','related']){const button=document.createElement('button');button.type='button';button.className='record-tab';button.id='record-tab-'+key;button.dataset.recordTab=key;button.setAttribute('role','tab');button.setAttribute('aria-controls','record-panel-'+key);tabs.append(button);}overview.before(tabs);body.dataset.recordSection='overview';
   tabs.addEventListener('click',event=>{const button=event.target.closest('[data-record-tab]');if(button){selectRecordTab(body,button.dataset.recordTab);body.scrollTop=0;}});
   tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=Array.from(tabs.querySelectorAll('[data-record-tab]')),index=buttons.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;selectRecordTab(body,buttons[next].dataset.recordTab,true);body.scrollTop=0;});
  }
  const zh=document.getElementById('workspace-language')?.value==='zh',labels=zh?{overview:'概览',activity:'活动',related:'联系人与关联'}:{overview:'Overview',activity:'Activity',related:'Contacts & related'};tabs.setAttribute('aria-label',zh?'记录分区':'Record sections');for(const button of tabs.querySelectorAll('[data-record-tab]')){const label=labels[button.dataset.recordTab];if(button.textContent!==label)button.textContent=label;}
  for(const [key,selector]of [['activity','.detail-activities'],['related','[data-crm-record-workspace]']]){const panel=body.querySelector(selector);if(panel){panel.id='record-panel-'+key;panel.dataset.recordPanel=key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','record-tab-'+key);panel.tabIndex=0;}}
  selectRecordTab(body,body.dataset.recordSection||'overview');
  // Replacing the related panel removes its focused action after a contact save/filter.
  // Restore focus only when the browser has lost it; never take it from another dialog/input.
  if(recordDialog.open&&body.dataset.recordSection==='related'&&document.activeElement===document.body&&!Array.from(document.querySelectorAll('dialog[open]')).some(other=>other!==recordDialog))selectRecordTab(body,'related',true);
 }
 addEventListener('hashchange',()=>{railPointer=false;railKeyboard=false;syncNavigation();});syncNavigation();
 if(sidebar)new MutationObserver(syncNavigation).observe(sidebar,{attributes:true,childList:true,subtree:true,attributeFilter:['aria-current']});
 if(page)new MutationObserver(decoratePresentation).observe(page,{childList:true,subtree:true});decoratePresentation();
 if(recordDialog)new MutationObserver(decorateRecordTabs).observe(recordDialog,{childList:true,subtree:true});
 document.getElementById('workspace-language')?.addEventListener('change',decorateRecordTabs);
})();
`;
