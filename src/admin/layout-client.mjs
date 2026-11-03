import { ADMIN_ICONS } from './icons.mjs';
/** Navigation chrome and read-only presentation; mutations stay in their controllers. */
export const LAYOUT_CLIENT='const WORKSPACE_LAYOUT_ICONS='+JSON.stringify({tasks:ADMIN_ICONS.tasks,activity:ADMIN_ICONS.activity})+';\n'+String.raw`
(()=>{
 const sidebar=document.getElementById('workspace-sidebar'),page=document.getElementById('workspace-page');
 const trigger=document.getElementById('workspace-menu-trigger'),menu=document.getElementById('workspace-menu');
 function closeMenu(returnFocus=false){if(!menu||!trigger)return;menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(returnFocus)trigger.focus();}
 function syncNavigation(){
  const tab=location.hash.slice(1).split('?')[0]||'overview';
  const active=Array.from(sidebar?.querySelectorAll('[data-nav]')||[]).find(link=>link.dataset.nav===tab);
  const group=active?.closest('details.nav-group');if(group)group.open=true;
  if(page){const params=new URLSearchParams(location.hash.split('?')[1]||'');page.dataset.viewKind=tab==='agent'?'chat':tab==='pipeline'?'board':['overview','analytics'].includes(tab)?'overview':params.has('id')?'detail':['settings','models','security','backup','health','license'].includes(tab)?'settings':'list';}
 }
 function decoratePresentation(){
  for(const mark of document.querySelectorAll('.activity-mark:empty')){const kind=mark.parentElement.querySelector('[data-record="tasks"]')?'tasks':'activity';mark.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+WORKSPACE_LAYOUT_ICONS[kind]+'</svg>';}
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
 trigger?.addEventListener('click',()=>{const opening=menu.hidden;closeMenu();if(opening){menu.hidden=false;trigger.setAttribute('aria-expanded','true');menu.querySelector('[role=menuitem]')?.focus();}});
 document.addEventListener('click',event=>{if(!menu?.hidden&&!menu.contains(event.target)&&!trigger.contains(event.target))closeMenu();});
 document.addEventListener('focusin',event=>{if(!menu?.hidden&&!menu.contains(event.target)&&!trigger.contains(event.target))closeMenu();});
 menu?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu(true);return;}const items=Array.from(menu.querySelectorAll('[role=menuitem]'));if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)||!items.length)return;event.preventDefault();const index=items.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next].focus();});
 menu?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
 addEventListener('hashchange',()=>{closeMenu();syncNavigation();});syncNavigation();
 if(sidebar)new MutationObserver(syncNavigation).observe(sidebar,{attributes:true,subtree:true,attributeFilter:['aria-current']});
 if(page)new MutationObserver(decoratePresentation).observe(page,{childList:true,subtree:true});decoratePresentation();
 if(recordDialog)new MutationObserver(decorateRecordTabs).observe(recordDialog,{childList:true,subtree:true});
 document.getElementById('workspace-language')?.addEventListener('change',decorateRecordTabs);
})();
`;
