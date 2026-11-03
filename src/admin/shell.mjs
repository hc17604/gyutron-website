import { ADMIN_STYLES } from './styles.mjs';
import { ADMIN_CLIENT } from './client.mjs';
import { QUOTES_CLIENT } from './quotes-client.mjs';
import { QUOTES_STYLES } from './quotes-styles.mjs';
import { LOGIN_COPY, LOGIN_ERRORS } from './core-extra-locales.mjs';
import { ADMIN_LOCALE_CLIENT } from './locale-assets.mjs';
import { WORKBENCH_CLIENT, WORKBENCH_STYLES } from './workbench-ui.mjs';
import { LOCAL_SOURCE_SYNC_SCRIPT } from '../platform/workspace/local-source-tool.mjs';
import { OPERATIONS_CLIENT } from './operations-client.mjs';
import { INTELLIGENCE_CLIENT } from './intelligence-client.mjs';
import { CRM_EXPERIENCE_CLIENT, CRM_EXPERIENCE_STYLES } from './crm-experience-client.mjs';
import { NOTIFICATIONS_CLIENT, NOTIFICATIONS_STYLES } from './notifications-client.mjs';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function getAdminAsset(path) {
  const assets = {
    '/admin/assets/workspace.css': [ADMIN_STYLES+WORKBENCH_STYLES+CRM_EXPERIENCE_STYLES+NOTIFICATIONS_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/workspace.js': [ADMIN_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/quotes.js': [QUOTES_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/quotes.css': [QUOTES_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/locales.js': [ADMIN_LOCALE_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/notifications.js': [NOTIFICATIONS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/notifications.css': [NOTIFICATIONS_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/workbench.js': [WORKBENCH_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/operations.js': [OPERATIONS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/intelligence.js': [INTELLIGENCE_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/local-source-sync.mjs': [LOCAL_SOURCE_SYNC_SCRIPT, 'text/javascript; charset=utf-8'],
    '/admin/assets/crm-experience.js': [CRM_EXPERIENCE_CLIENT, 'text/javascript; charset=utf-8'],
  };
  if (!assets[path]) return null;
  return new Response(assets[path][0], { headers: { 'content-type': assets[path][1], 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff', ...(path==='/admin/assets/local-source-sync.mjs'?{'content-disposition':'attachment; filename=local-source-sync.mjs'}:{}) } });
}

function head(title, lang) {
  return `<!doctype html><html lang="${esc(lang === 'zh' ? 'zh-CN' : lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light"><title>${esc(title)} · GYUTRON</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/brand-tokens.css"><link rel="stylesheet" href="/admin/assets/workspace.css"></head>`;
}

const icons = {
  overview: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  customers: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  pipeline: '<rect x="3" y="4" width="5" height="16"/><rect x="10" y="4" width="5" height="10"/><rect x="17" y="4" width="4" height="13"/>',
  quotes: '<path d="M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h8"/>',
  tasks: '<rect x="4" y="3" width="16" height="18"/><path d="m8 8 1 1 2-2m2 1h3m-8 6 1 1 2-2m2 1h3"/>',
  inbox: '<path d="M4 3h16l2 12v6H2v-6L4 3Zm-2 12h6l2 3h4l2-3h6"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  audit: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16"/><rect x="7" y="3" width="3" height="6"/><rect x="14" y="9" width="3" height="6"/><rect x="7" y="15" width="3" height="6"/>',
  analytics:'<path d="M3 3v18h18M6 15l5-6 4 3 6-8"/>',sources:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',reports:'<path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/>',automations:'<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>',rules:'<path d="M4 5h16M4 12h16M4 19h16M8 2v6M16 9v6M10 16v6"/>',agent:'<rect x="3" y="5" width="18" height="15"/><path d="M12 2v3M7 10h2m6 0h2M8 16h8"/>',memory:'<path d="M4 4h16v16H4zM8 4v16M4 9h4M12 8h5m-5 4h5m-5 4h3"/>',models:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/>',users:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m1-17a4 4 0 0 1 0 8m3 3v6"/>',security:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',backup:'<path d="M3 10a9 9 0 1 1 1 8M3 3v7h7M12 7v6l4 2"/>',license:'<rect x="3" y="5" width="18" height="14"/><path d="M6 9h7M6 13h4m6-4 2 2-2 2-2-2z"/>',health:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">${icons[name] || ''}</svg>`;

export function renderAdminWorkspace({ principal = {}, lang = 'en', csrfToken = '', workspaceName = 'GYUTRON' } = {}) {
  // Keep the HTML bootstrap projection safe even if a caller supplies an
  // internal session object rather than the public identity contract.
  principal = { id: principal.id, name: principal.name, email: principal.email, role: principal.role, expiresAt: principal.expiresAt };
  const groups=[['workspaceNav',[['overview','Overview'],['analytics','Analytics'],['customers','Customers'],['pipeline','Pipeline'],['quotes','Quotations'],['tasks','Tasks'],['inbox','Inbox'],['activity','Activity']]],['operate',[['sources','Data sources'],['reports','Report center'],['automations','Automations'],['rules','Business rules']]],['intelligence',[['agent','Agent workspace'],['memory','Business memory']]],['management',[['models','Model settings'],['users','Users & access'],['security','Security center'],['backup','Backup & restore'],['license','License'],['health','System health'],['audit','Audit log'],['settings','Preferences']]]];
  return `${head('Workspace', lang)}<body class="workspace-body"><a class="skip-link" href="#workspace-main">Skip to content</a>
<div class="app-layout"><aside class="sidebar" id="workspace-sidebar" aria-label="Workspace navigation"><div class="sidebar-brand"><a href="#overview" aria-label="GYUTRON workspace"><img src="/gyutron-logo-light.svg" alt="GYUTRON" width="176" height="23"></a><span class="brand-caption" data-i18n="brandCaption">OPERATIONS WORKSPACE</span></div>
<button class="workspace-switch" type="button" data-go="settings"><span class="workspace-avatar" aria-hidden="true">G</span><span><strong>${esc(workspaceName)}</strong><small data-i18n="workspace">Company workspace</small></span><span aria-hidden="true">⌄</span></button>
<nav class="workspace-nav">${groups.map(([group,items])=>`<div class="nav-section-label nav-section-secondary" data-i18n="${group}">${group.toUpperCase()}</div>${items.map(([key,label])=>`<a href="#${key}" data-nav="${key}">${icon(key)}<span data-i18n="nav.${key}">${label}</span>${key==='inbox'?'<span class="nav-count" id="inbox-count" hidden></span>':''}</a>`).join('')}`).join('')}</nav>
<div class="sidebar-footer"><a href="https://www.gyutron.com" target="_blank" rel="noopener"><span data-i18n="openWebsite">Open website</span><span aria-hidden="true">↗</span></a><div class="sidebar-identity"><span class="identity-avatar" id="sidebar-initials">${esc((principal.name || 'Admin').slice(0, 2).toUpperCase())}</span><div><strong id="sidebar-name">${esc(principal.name || 'Administrator')}</strong><span id="sidebar-role">${esc(principal.role || 'owner')}</span></div><form method="post" action="/admin/logout"><input type="hidden" name="csrf_token" value="${esc(csrfToken)}"><button class="signout-button" type="submit" aria-label="Sign out" title="Sign out">↗</button></form></div></div></aside>
<div class="workspace-content"><header class="topbar"><button class="icon-button mobile-nav-toggle" type="button" id="mobile-nav-toggle" aria-controls="workspace-sidebar" aria-expanded="false" aria-label="Open navigation">☰</button><div class="breadcrumbs"><span>${esc(workspaceName)}</span><span aria-hidden="true">/</span><strong id="breadcrumb-current">Overview</strong></div><div class="topbar-actions"><button class="search-trigger" id="command-trigger" type="button" aria-label="Search workspace"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span data-i18n="searchWorkspace">Search workspace</span><kbd>Ctrl K</kbd></button><label class="language-label"><span class="sr-only" data-i18n="language">Language</span><select id="workspace-language" aria-label="Language"><option value="en"${lang === 'en' ? ' selected' : ''}>EN</option><option value="zh"${lang === 'zh' ? ' selected' : ''}>中文</option><option value="de"${lang === 'de' ? ' selected' : ''}>DE</option><option value="ja"${lang === 'ja' ? ' selected' : ''}>日本語</option></select></label></div></header>
<main id="workspace-main" tabindex="-1"><div id="workspace-page" aria-live="polite" aria-busy="true"><div class="page-heading"><div><p class="eyebrow">WORKSPACE</p><h1>Overview</h1><p class="page-description">Loading your workspace…</p></div></div><div class="loading-state"><span class="loading-bar"></span></div></div></main><footer class="workspace-footer"><span>GYUTRON <span class="footer-divider">/</span> <span data-i18n="operationsPlatform">Operations platform</span></span><span id="workspace-sync" data-i18n="connecting">Connecting…</span></footer></div></div>
<div class="sidebar-overlay" id="sidebar-overlay" hidden></div><div id="workspace-toast" class="toast" role="status" aria-live="polite" hidden></div><dialog id="record-dialog" class="record-dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog><dialog id="confirmation-dialog" class="confirmation-dialog" aria-labelledby="confirmation-title"><div class="dialog-heading"><h2 id="confirmation-title">Confirm action</h2></div><div class="dialog-body"><p id="confirmation-message" class="note-copy"></p></div><div class="dialog-footer"><button type="button" class="button button-subtle" data-confirm-cancel>Cancel</button><button type="button" class="button button-primary" data-confirm-accept>Confirm</button></div></dialog><dialog id="command-dialog" class="command-dialog" aria-labelledby="command-title"><div class="command-header"><h2 class="sr-only" id="command-title">Search workspace</h2><input id="command-input" type="search" autocomplete="off" placeholder="Search customers, opportunities, tasks…" aria-label="Search workspace"><button type="button" class="icon-button" data-close-command aria-label="Close search">×</button></div><div id="command-results" class="command-results"></div><div class="command-footer"><span data-i18n="searchHint">Type to search records, or jump to a page.</span><kbd>ESC</kbd></div></dialog>
<script type="application/json" id="workspace-bootstrap">${json({ principal, lang, csrfToken, workspaceName })}</script><script src="/admin/assets/workspace.js" defer></script></body></html>`;
}

export function renderAdminLogin({ error = '', csrfToken = '', lang = 'en', configured = true, teamLogin = false } = {}) {
  lang = Object.hasOwn(LOGIN_COPY, lang) ? lang : 'en';
  const copy = LOGIN_COPY[lang];
  const errors = LOGIN_ERRORS[lang];
  const normalizedError = String(error).toLowerCase();
  const errorKey = normalizedError.includes('incorrect') ? 'incorrect' : normalizedError.includes('expired') ? 'expired' : normalizedError.includes('too many') ? 'throttled' : normalizedError.includes('not configured') ? 'unavailable' : 'failed';
  const localizedError = error ? errors[errorKey] : '';
  return `${head(copy.title, lang)}<body class="login-body"><main class="login-layout">
<section class="login-brand-panel" aria-label="GYUTRON"><a href="/"><img src="/gyutron-logo-light.svg" width="224" height="28" alt="GYUTRON"></a><div class="login-brand-copy"><p class="eyebrow">GYUTRON WORKSPACE</p><h1>${copy.slogan}</h1><p>${esc(copy.description)}</p><div class="login-system-lines" aria-hidden="true"><span></span><span></span><span></span></div></div><div class="login-brand-footer"><span>AUTOMATION · VISION · INNOVATION</span><span>01 / OPERATIONS</span></div></section>
<section class="login-form-panel"><div class="login-form-container"><div class="login-wordmark">GYUTRON <span>WORKSPACE</span></div><p class="eyebrow">${esc(copy.access)}</p><h2>${esc(copy.title)}</h2><p class="login-intro">${esc(teamLogin === true ? copy.teamIntro : copy.intro)}</p>${localizedError ? `<div class="error-banner" role="alert">${esc(localizedError)}</div>` : ''}${!configured && !error ? `<div class="error-banner" role="alert">${esc(copy.notConfigured)}</div>` : ''}<form method="post" action="/admin/auth/login?lang=${esc(lang)}" class="login-form"><input type="hidden" name="csrf_token" value="${esc(csrfToken)}"><input type="hidden" name="lang" value="${esc(lang)}">${teamLogin === true ? `<label>${esc(copy.workEmail)}<input name="email" aria-label="${esc(copy.workEmail)}" type="email" autocomplete="username" placeholder="you@company.com"><small>${esc(copy.ownerEmailHint)}</small></label>` : ''}<label>${esc(copy.password)}<input name="password" aria-label="${esc(copy.password)}" type="password" autocomplete="current-password" required autofocus></label><button class="button button-primary login-submit" type="submit"${!configured ? ' disabled' : ''}>${esc(copy.button)}<span aria-hidden="true">→</span></button></form><a class="login-back" href="/">← ${esc(copy.back)}</a></div><div class="login-legal">GYUTRON <span>© ${new Date().getUTCFullYear()}</span></div></section>
</main></body></html>`;
}
