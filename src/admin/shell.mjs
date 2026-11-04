import { SAAS_STYLES } from './saas-styles.mjs';
import { LAYOUT_CLIENT } from './layout-client.mjs';
import { renderAdminIcon } from './icons.mjs';
import { normalizeWorkspaceLanguage } from './locale-policy.mjs';
import { ADMIN_STYLES } from './styles.mjs';
import { ADMIN_CLIENT } from './client.mjs';
import { DEMO_CLIENT } from './demo-client.mjs';
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
import { ANALYTICS_CLIENT } from './analytics-client.mjs';
import { ANALYTICS_VIEWS_CLIENT } from './analytics-views.mjs';
import { ANALYTICS_STYLES } from './analytics-styles.mjs';
import { ANALYTICS_CHARTS_CLIENT, ANALYTICS_CHART_STYLES } from './analytics-chart-adapter.mjs';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function getAdminAsset(path) {
  const assets = {
    '/admin/assets/design-system.css': [SAAS_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/layout.js': [LAYOUT_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/workspace.css': [ADMIN_STYLES+WORKBENCH_STYLES+CRM_EXPERIENCE_STYLES+NOTIFICATIONS_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/workspace.js': [ADMIN_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/demo.js': [DEMO_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/quotes.js': [QUOTES_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/quotes.css': [QUOTES_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/locales.js': [ADMIN_LOCALE_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/notifications.js': [NOTIFICATIONS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/notifications.css': [NOTIFICATIONS_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/workbench.js': [WORKBENCH_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/operations.js': [OPERATIONS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/analytics.js': [ANALYTICS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/analytics-views.js': [ANALYTICS_VIEWS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/analytics-charts.js': [ANALYTICS_CHARTS_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/analytics.css': [ANALYTICS_STYLES+ANALYTICS_CHART_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/intelligence.js': [INTELLIGENCE_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/local-source-sync.mjs': [LOCAL_SOURCE_SYNC_SCRIPT, 'text/javascript; charset=utf-8'],
    '/admin/assets/crm-experience.js': [CRM_EXPERIENCE_CLIENT, 'text/javascript; charset=utf-8'],
  };
  if (!assets[path]) return null;
  const body=assets[path][1].startsWith('text/css')&&!['/admin/assets/design-system.css','/admin/assets/analytics.css'].includes(path)?'@layer legacy{'+assets[path][0]+'}':assets[path][0];
  return new Response(body, { headers: { 'content-type': assets[path][1], 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff', ...(path==='/admin/assets/local-source-sync.mjs'?{'content-disposition':'attachment; filename=local-source-sync.mjs'}:{}) } });
}

function head(title, lang) {
  return `<!doctype html><html lang="${esc(lang === 'zh' ? 'zh-CN' : lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="light"><title>${esc(title)} · GYUTRON</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/brand-tokens.css"><link rel="preload" href="/workspace-assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/admin/assets/workspace.css"><link rel="stylesheet" href="/admin/assets/design-system.css" data-admin-design></head>`;
}

function navigationGroup(group,items){
  const links=items.map(([key,label])=>`<a href="#${key}" data-nav="${key}"><span class="nav-icon" aria-hidden="true">${renderAdminIcon(key)}</span><span class="nav-link-label" data-i18n="nav.${key}">${label}</span>${key==='inbox'?'<span class="nav-count" id="inbox-count" hidden></span>':''}</a>`).join('');
  return group==='management'?`<details class="nav-group"><summary class="nav-group-title"><span class="nav-group-icon" aria-hidden="true">${renderAdminIcon('settings')}</span><span data-i18n="${group}">Administration</span><span class="nav-group-arrow" aria-hidden="true">${renderAdminIcon('chevron-right')}</span></summary><div class="nav-group-items">${links}</div></details>`:`<div class="nav-section" data-nav-section="${group}"><div class="nav-section-label" data-i18n="${group}">${group==='workspaceNav'?'Workspace':group==='operate'?'Operations':'Intelligence'}</div>${links}</div>`;
}

export function renderAdminWorkspace({ principal = {}, lang = 'en', csrfToken = '', workspaceName = 'GYUTRON' } = {}) {
  lang=normalizeWorkspaceLanguage(lang);
  // Keep the HTML bootstrap projection safe even if a caller supplies an
  // internal session object rather than the public identity contract.
  principal = { id: principal.id, name: principal.name, email: principal.email, role: principal.role, expiresAt: principal.expiresAt };
  const groups=[['workspaceNav',[['overview','Overview'],['analytics','Analytics'],['customers','Customers'],['pipeline','Pipeline'],['quotes','Quotations'],['tasks','Tasks'],['inbox','Inbox'],['activity','Activity']]],['operate',[['sources','Data sources'],['reports','Report center'],['automations','Automations'],['rules','Business rules']]],['intelligence',[['agent','Agent workspace'],['memory','Business memory']]],['management',[['models','Model settings'],['users','Users & access'],['security','Security center'],['backup','Backup & restore'],['license','License'],['health','System health'],['audit','Audit log'],['settings','Preferences']]]];
  return `${head('Workspace', lang)}<body class="workspace-body"><a class="skip-link" href="#workspace-main">Skip to content</a>
<div class="app-layout"><aside class="sidebar" id="workspace-sidebar" aria-label="Workspace navigation">
<a class="workspace-brand" href="#overview" aria-label="GYUTRON"><img src="/gyutron-logo-purple.png" width="1550" height="260" alt="GYUTRON"></a>
<nav class="workspace-nav">${groups.map(([group,items])=>navigationGroup(group,items)).join('')}</nav>
<div class="sidebar-footer"><button type="button" class="sidebar-collapse" id="primary-nav-toggle" aria-controls="workspace-sidebar" aria-expanded="true" aria-label="Collapse navigation" title="Collapse navigation">${renderAdminIcon('chevron-left')}<span class="sidebar-collapse-label">Collapse navigation</span></button><a href="https://www.gyutron.com" target="_blank" rel="noopener"><span data-i18n="openWebsite">Open website</span><span class="sidebar-external-icon" aria-hidden="true">${renderAdminIcon('external-link')}</span></a><div class="sidebar-identity"><span class="identity-avatar" id="sidebar-initials">${esc((principal.name || 'Admin').slice(0, 2).toUpperCase())}</span><div><strong id="sidebar-name">${esc(principal.name || 'Administrator')}</strong><span id="sidebar-role">${esc(principal.role || 'owner')}</span></div><form method="post" action="/admin/logout"><input type="hidden" name="csrf_token" value="${esc(csrfToken)}"><button class="signout-button" type="submit" aria-label="Sign out" title="Sign out">${renderAdminIcon('log-out')}</button></form></div></div></aside>
<div class="workspace-content"><header class="topbar"><button class="icon-button mobile-nav-toggle" type="button" id="mobile-nav-toggle" aria-controls="workspace-sidebar" aria-expanded="false" aria-label="Open navigation">${renderAdminIcon('menu')}</button><div class="breadcrumbs"><span>${esc(workspaceName)}</span><span aria-hidden="true">/</span><strong id="breadcrumb-current">Overview</strong></div><div class="topbar-actions"><button class="search-trigger" id="command-trigger" type="button" aria-label="Search workspace">${renderAdminIcon('search')}<span data-i18n="searchWorkspace">Search workspace</span><kbd>Ctrl K</kbd></button><button class="workspace-test-switch" id="workspace-test-mode" type="button" role="switch" aria-checked="false" aria-label="Test mode" aria-describedby="workspace-test-mode-help"><span class="test-mode-glyph" aria-hidden="true"></span><span class="test-mode-label" data-i18n="testMode">Test mode</span><span class="test-mode-compact" aria-hidden="true">TEST</span><span class="workspace-mode-indicator" id="workspace-mode-indicator" aria-hidden="true">DEMO</span></button><span class="sr-only" id="workspace-test-mode-help" data-i18n="testModeHelp">Use synthetic sample data in this browser.</span><label class="language-label"><span class="sr-only" data-i18n="language">Language</span><select id="workspace-language" aria-label="Language"><option value="en"${lang === 'en' ? ' selected' : ''}>EN</option><option value="zh"${lang === 'zh' ? ' selected' : ''}>中文</option></select></label></div></header>
<main id="workspace-main" tabindex="-1"><div id="workspace-page" aria-live="polite" aria-busy="true"><div class="page-heading"><div><p class="eyebrow">WORKSPACE</p><h1>Overview</h1><p class="page-description">Loading your workspace…</p></div></div><div class="loading-state"><span class="loading-bar"></span></div></div></main><footer class="workspace-footer"><span>GYUTRON <span class="footer-divider">/</span> <span data-i18n="operationsPlatform">Operations platform</span></span><span id="workspace-sync" data-i18n="connecting">Connecting…</span></footer></div></div>
<div class="sidebar-overlay" id="sidebar-overlay" hidden></div><div id="workspace-toast" class="toast" role="status" aria-live="polite" hidden></div><dialog id="record-dialog" class="record-dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog><dialog id="confirmation-dialog" class="confirmation-dialog" aria-labelledby="confirmation-title"><div class="dialog-heading"><h2 id="confirmation-title">Confirm action</h2></div><div class="dialog-body"><p id="confirmation-message" class="note-copy"></p></div><div class="dialog-footer"><button type="button" class="button button-subtle" data-confirm-cancel>Cancel</button><button type="button" class="button button-primary" data-confirm-accept>Confirm</button></div></dialog><dialog id="command-dialog" class="command-dialog" aria-labelledby="command-title" aria-modal="false"><div class="command-header"><h2 class="sr-only" id="command-title">Search workspace</h2><input id="command-input" type="search" autocomplete="off" placeholder="Search customers, opportunities, tasks…" aria-label="Search workspace"><button type="button" class="icon-button" data-close-command aria-label="Close search">${renderAdminIcon('x')}</button></div><div id="command-results" class="command-results"></div><div class="command-footer"><span data-i18n="searchHint">Type to search records, or jump to a page.</span><kbd>ESC</kbd></div></dialog>
<script type="application/json" id="workspace-bootstrap">${json({ principal, lang, csrfToken, workspaceName })}</script><script src="/admin/assets/workspace.js" defer></script><script src="/admin/assets/layout.js" defer></script></body></html>`;
}

export function renderAdminLogin({ error = '', csrfToken = '', lang = 'en', configured = true, teamLogin = false } = {}) {
  lang = normalizeWorkspaceLanguage(lang);
  const copy = LOGIN_COPY[lang];
  const errors = LOGIN_ERRORS[lang];
  const normalizedError = String(error).toLowerCase();
  const errorKey = normalizedError.includes('incorrect') ? 'incorrect' : normalizedError.includes('expired') ? 'expired' : normalizedError.includes('too many') ? 'throttled' : normalizedError.includes('not configured') ? 'unavailable' : 'failed';
  const localizedError = error ? errors[errorKey] : '';
  return `${head(copy.title, lang)}<body class="login-body"><nav class="login-language" aria-label="Language"><a href="/admin?lang=en"${lang==='en'?' aria-current="page"':''}>English</a><a href="/admin?lang=zh"${lang==='zh'?' aria-current="page"':''}>中文</a></nav><main class="login-layout">
<section class="login-brand-panel" aria-label="GYUTRON"><a href="/"><img src="/gyutron-logo-purple.png" width="1550" height="260" alt="GYUTRON"></a><div class="login-brand-copy"><p class="eyebrow">GYUTRON WORKSPACE</p><h1>${copy.slogan}</h1><p>${esc(copy.description)}</p><div class="login-system-lines" aria-hidden="true"><span></span><span></span><span></span></div></div><div class="login-brand-footer"><span>AUTOMATION · VISION · INNOVATION</span><span>01 / OPERATIONS</span></div></section>
<section class="login-form-panel"><div class="login-form-container"><a href="/" class="login-wordmark" aria-label="GYUTRON"><img src="/gyutron-logo-purple.png" width="1550" height="260" alt="GYUTRON"></a><p class="eyebrow">${esc(copy.access)}</p><h2>${esc(copy.title)}</h2><p class="login-intro">${esc(teamLogin === true ? copy.teamIntro : copy.intro)}</p>${localizedError ? `<div class="error-banner" role="alert">${esc(localizedError)}</div>` : ''}${!configured && !error ? `<div class="error-banner" role="alert">${esc(copy.notConfigured)}</div>` : ''}<form method="post" action="/admin/auth/login?lang=${esc(lang)}" class="login-form"><input type="hidden" name="csrf_token" value="${esc(csrfToken)}"><input type="hidden" name="lang" value="${esc(lang)}">${teamLogin === true ? `<label>${esc(copy.workEmail)}<input name="email" aria-label="${esc(copy.workEmail)}" type="email" autocomplete="username" placeholder="you@company.com"><small>${esc(copy.ownerEmailHint)}</small></label>` : ''}<label>${esc(copy.password)}<input name="password" aria-label="${esc(copy.password)}" type="password" autocomplete="current-password" required autofocus></label><button class="button button-primary login-submit" type="submit"${!configured ? ' disabled' : ''}>${esc(copy.button)}<span aria-hidden="true">→</span></button></form><a class="login-back" href="/">← ${esc(copy.back)}</a></div><div class="login-legal">GYUTRON <span>© ${new Date().getUTCFullYear()}</span></div></section>
</main></body></html>`;
}
