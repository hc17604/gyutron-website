import { ADMIN_ICON_HTML } from './icons.mjs';
import { WORKSPACE_NAVIGATION_MENUS } from './navigation-menus.mjs';
/** Navigation chrome and read-only presentation; mutations stay in their controllers. */
export const LAYOUT_CLIENT='const WORKSPACE_LAYOUT_ICONS='+JSON.stringify(Object.fromEntries(['overview','analytics','customers','pipeline','quotes','tasks','inbox','activity','sources','reports','automations','rules','agent','memory','models','users','security','backup','license','health','audit','settings'].map(name=>[name,ADMIN_ICON_HTML[name]])))+';\nconst WORKSPACE_NAVIGATION_MENUS='+JSON.stringify(WORKSPACE_NAVIGATION_MENUS)+';\n'+String.raw`
(()=>{
 const sidebar=document.getElementById('workspace-sidebar'),page=document.getElementById('workspace-page');
 const frame=document.querySelector('.app-layout'),preview=document.getElementById('navigation-preview'),desktop=matchMedia('(min-width:1025px)');
 let railOpen=false,railPointer=false,railKeyboard=false,keyboardInput=false,lastNavigationTab=null,previewKey=null,previewSignature='',railOpener=null,enterTimer=null,closeTimer=null;
 const navEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const acceptedTab=()=>document.body?.dataset.workspaceTab||location.hash.slice(1).split('?')[0]||'overview';
 const inNavigation=node=>Boolean(node&&(sidebar?.contains(node)||preview?.contains(node)));
 const primaryLink=key=>Array.from(sidebar?.querySelectorAll('[data-nav]')||[]).find(link=>link.dataset.nav===key);
 function navigationMenu(key){
  if(key==='management')return{title:{en:'Administration',zh:'系统管理'},groups:[{en:'Workspace settings',zh:'工作区设置',items:Array.from(sidebar?.querySelectorAll('.nav-group-items [data-nav]')||[]).filter(link=>!link.hidden).map(link=>({href:link.getAttribute('href'),en:link.querySelector('.nav-link-label')?.textContent||link.dataset.nav,zh:link.querySelector('.nav-link-label')?.textContent||link.dataset.nav}))}]};
  const link=primaryLink(key);return link&&!link.hidden?WORKSPACE_NAVIGATION_MENUS[key]:null;
 }
 function renderNavigationPreview(){
  if(!preview)return;const key=previewKey||acceptedTab(),menu=navigationMenu(key),lang=document.getElementById('workspace-language')?.value==='zh'?'zh':'en';
  if(!desktop.matches||!railOpen||!menu||menu.groups.reduce((count,group)=>count+group.items.length,0)<2){preview.hidden=true;return;}
  const title=menu.title?.[lang]||primaryLink(key)?.querySelector('.nav-link-label')?.textContent||key;
  const signature=key+'|'+lang+'|'+acceptedTab()+'|'+location.hash+'|'+JSON.stringify(menu.groups);
  preview.hidden=false;preview.dataset.module=key;preview.setAttribute('aria-label',title);
  if(signature===previewSignature)return;previewSignature=signature;
  const activeHash=acceptedTab()===key&&location.hash.slice(1).split('?')[0]===key?location.hash:'',scope=new URLSearchParams(activeHash.split('?')[1]||'');
  if(key==='analytics'&&!scope.has('view'))scope.set('view','overview');if(key==='inbox'&&!scope.has('resource'))scope.set('resource','leads');
  let selectedHref=null,selectedWeight=-1;if(activeHash)for(const group of menu.groups)for(const item of group.items){const params=new URLSearchParams(item.href.split('?')[1]||'');if(Array.from(params).every(([name,value])=>scope.get(name)===value)&&params.size>=selectedWeight){selectedHref=item.href;selectedWeight=params.size;}}
  preview.innerHTML='<header class="navigation-preview-heading"><h2 id="navigation-preview-title">'+navEscape(title)+'</h2></header><nav class="navigation-preview-scroll" aria-label="'+navEscape(title)+'">'+menu.groups.map(group=>'<section class="navigation-preview-group">'+(group[lang]?'<h3>'+navEscape(group[lang])+'</h3>':'')+group.items.map(item=>{const label=item[lang]||item.en,selected=item.href===selectedHref;return'<a class="navigation-preview-link" href="'+navEscape(item.href)+'" title="'+navEscape(label)+'"'+(selected?' aria-current="page"':'')+'>'+navEscape(label)+'</a>';}).join('')+'</section>').join('')+'</nav>';
 }
 function syncRail(tab){
  if(!frame)return;const compact=desktop.matches&&!railOpen;
  frame.dataset.secondaryNavigation=String(tab==='analytics');frame.dataset.primaryCompact=String(compact);
  for(const link of sidebar?.querySelectorAll('[data-nav]')||[]){const label=link.querySelector('.nav-link-label')?.textContent?.trim();if(label){link.title=label;const count=link.querySelector('.nav-count');link.setAttribute('aria-label',label+(count&&!count.hidden&&count.textContent.trim()?' · '+count.textContent.trim():''));}const expanded=desktop.matches&&railOpen&&previewKey===link.dataset.nav,menu=navigationMenu(link.dataset.nav),hasChildren=Boolean(menu&&menu.groups.reduce((count,group)=>count+group.items.length,0)>1);link.dataset.navPreview=String(expanded);link.dataset.navHasChildren=String(hasChildren);if(hasChildren&&desktop.matches){link.setAttribute('aria-controls','navigation-preview');link.setAttribute('aria-expanded',String(expanded));}else{link.removeAttribute('aria-controls');link.removeAttribute('aria-expanded');}}
  const summary=sidebar?.querySelector('.nav-group-title');if(summary){summary.title=summary.querySelector('[data-i18n]')?.textContent?.trim()||'';summary.dataset.navPreview=String(railOpen&&previewKey==='management');summary.dataset.currentGroup=String(Boolean(primaryLink(tab)?.closest('.nav-group')));}
  renderNavigationPreview();
 }
 function clearNavigationTimers(){clearTimeout(enterTimer);clearTimeout(closeTimer);enterTimer=null;closeTimer=null;}
 function closeNavigation(returnFocus=false){const opener=railOpener;clearNavigationTimers();railOpen=false;railPointer=false;railKeyboard=false;keyboardInput=false;previewKey=null;previewSignature='';syncNavigation();if(returnFocus&&opener?.isConnected)opener.focus({preventScroll:true});}
 function openNavigation(key,opener){if(!desktop.matches)return;clearTimeout(enterTimer);enterTimer=null;clearTimeout(closeTimer);closeTimer=null;const menu=navigationMenu(key);if(!menu)return;railOpen=true;previewKey=key;if(opener)railOpener=opener;syncNavigation();}
 function queueNavigationClose(){clearTimeout(enterTimer);enterTimer=null;clearTimeout(closeTimer);if(railKeyboard)return;closeTimer=setTimeout(()=>{if(!railPointer&&!railKeyboard)closeNavigation();},200);}
 function previewTarget(target){const link=target?.closest?.('[data-nav]');if(link&&sidebar.contains(link))return{key:link.dataset.nav,node:link};const summary=target?.closest?.('.nav-group-title');return summary&&sidebar.contains(summary)?{key:'management',node:summary}:null;}
 // The expanded primary and its temporary secondary are one pointer/focus region.
 sidebar?.addEventListener('pointerenter',event=>{if(!desktop.matches||event.pointerType==='touch')return;railPointer=true;clearTimeout(closeTimer);const target=previewTarget(event.target);openNavigation(target?.key||previewKey||acceptedTab(),target?.node||primaryLink(acceptedTab()));});
 sidebar?.addEventListener('pointerover',event=>{if(!desktop.matches||event.pointerType==='touch')return;const target=previewTarget(event.target);if(!target)return;clearTimeout(enterTimer);enterTimer=null;if(target.key===previewKey)return;enterTimer=setTimeout(()=>{enterTimer=null;if(railPointer)openNavigation(target.key,target.node);},10);});
 sidebar?.addEventListener('pointerleave',event=>{if(inNavigation(event.relatedTarget))return;railPointer=false;queueNavigationClose();});
 preview?.addEventListener('pointerenter',event=>{if(!desktop.matches||event.pointerType==='touch')return;railPointer=true;clearNavigationTimers();});
 preview?.addEventListener('pointerleave',event=>{if(inNavigation(event.relatedTarget))return;railPointer=false;queueNavigationClose();});
 document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboardInput=true;if(event.key==='Escape'&&railOpen&&inNavigation(event.target)){event.preventDefault();event.stopPropagation();closeNavigation(true);}});
 document.addEventListener('pointerdown',event=>{keyboardInput=false;railKeyboard=false;if(!inNavigation(event.target))closeNavigation();});
 function focusNavigation(event){if(!desktop.matches||!keyboardInput)return;railKeyboard=true;clearTimeout(closeTimer);if(sidebar?.contains(event.target)){const target=previewTarget(event.target);openNavigation(target?.key||previewKey||acceptedTab(),target?.node||primaryLink(acceptedTab()));}}
 function blurNavigation(event){if(inNavigation(event.relatedTarget))return;railKeyboard=false;if(!railPointer)queueNavigationClose();}
 sidebar?.addEventListener('focusin',focusNavigation);preview?.addEventListener('focusin',focusNavigation);sidebar?.addEventListener('focusout',blurNavigation);preview?.addEventListener('focusout',blurNavigation);
 function selectNavigation(event){if(!desktop.matches||!event.target.closest('[data-nav],.workspace-brand,.navigation-preview-link'))return;closeNavigation();document.getElementById('workspace-main')?.focus({preventScroll:true});}
 sidebar?.addEventListener('click',selectNavigation);preview?.addEventListener('click',selectNavigation);
 desktop.addEventListener('change',()=>{closeNavigation();});addEventListener('blur',()=>closeNavigation());
 const commandDialog=document.getElementById('command-dialog'),commandTrigger=document.getElementById('command-trigger');
 function closeCommand(returnFocus=false){if(!commandDialog?.open)return;const opener=commandDialog._workspaceOpener;commandDialog.close();if(returnFocus)(opener?.isConnected?opener:commandTrigger)?.focus();}
 // Keep the compact search panel non-modal; outside interactions remain available.
 commandDialog?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeCommand(true);}});
 commandDialog?.addEventListener('close',()=>{const opener=commandDialog._workspaceOpener;if(document.activeElement===document.body||commandDialog.contains(document.activeElement))(opener?.isConnected?opener:commandTrigger)?.focus();});
 document.addEventListener('pointerdown',event=>{if(commandDialog?.open&&!commandDialog.contains(event.target)&&!commandTrigger?.contains(event.target))closeCommand();});
 document.addEventListener('focusin',event=>{if(commandDialog?.open&&!commandDialog.contains(event.target)&&!commandTrigger?.contains(event.target))closeCommand();});
 function syncNavigation(){
  const tab=acceptedTab();syncRail(tab);
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
 addEventListener('hashchange',()=>{closeNavigation();});syncNavigation();
 if(sidebar)new MutationObserver(syncNavigation).observe(sidebar,{attributes:true,childList:true,subtree:true,attributeFilter:['aria-current']});
 if(page)new MutationObserver(decoratePresentation).observe(page,{childList:true,subtree:true});decoratePresentation();
 if(recordDialog)new MutationObserver(decorateRecordTabs).observe(recordDialog,{childList:true,subtree:true});
 document.getElementById('workspace-language')?.addEventListener('change',()=>{syncNavigation();decorateRecordTabs();});
})();
`;
