import { ADMIN_STYLES } from './styles.mjs';
import { ADMIN_CLIENT } from './client.mjs';
import { QUOTES_CLIENT } from './quotes-client.mjs';
import { QUOTES_STYLES } from './quotes-styles.mjs';
import { LOGIN_COPY, LOGIN_ERRORS } from './core-extra-locales.mjs';
import { ADMIN_LOCALE_CLIENT } from './locale-assets.mjs';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function getAdminAsset(path) {
  const assets = {
    '/admin/assets/workspace.css': [ADMIN_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/workspace.js': [ADMIN_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/quotes.js': [QUOTES_CLIENT, 'text/javascript; charset=utf-8'],
    '/admin/assets/quotes.css': [QUOTES_STYLES, 'text/css; charset=utf-8'],
    '/admin/assets/locales.js': [ADMIN_LOCALE_CLIENT, 'text/javascript; charset=utf-8'],
  };
  if (!assets[path]) return null;
  return new Response(assets[path][0], { headers: { 'content-type': assets[path][1], 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' } });
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
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">${icons[name] || ''}</svg>`;

export function renderAdminWorkspace({ principal = {}, lang = 'en', csrfToken = '', workspaceName = 'GYUTRON' } = {}) {
  // Keep the HTML bootstrap projection safe even if a caller supplies an
  // internal session object rather than the public identity contract.
  principal = { id: principal.id, name: principal.name, email: principal.email, role: principal.role, expiresAt: principal.expiresAt };
  const navigation = [['overview', 'Overview'], ['customers', 'Customers'], ['pipeline', 'Pipeline'], ['quotes', 'Quotations'], ['tasks', 'Tasks'], ['inbox', 'Inbox'], ['activity', 'Activity'], ['audit', 'Audit log'], ['settings', 'Settings']];
  return `${head('Workspace', lang)}<body class="workspace-body"><a class="skip-link" href="#workspace-main">Skip to content</a>
<div class="app-layout"><aside class="sidebar" id="workspace-sidebar" aria-label="Workspace navigation"><div class="sidebar-brand"><a href="/admin#overview" aria-label="GYUTRON workspace"><img src="/gyutron-logo-light.svg" alt="GYUTRON" width="176" height="23"></a><span class="brand-caption" data-i18n="brandCaption">OPERATIONS WORKSPACE</span></div>
<button class="workspace-switch" type="button" data-go="settings"><span class="workspace-avatar" aria-hidden="true">G</span><span><strong>${esc(workspaceName)}</strong><small data-i18n="workspace">Company workspace</small></span><span aria-hidden="true">⌄</span></button>
<div class="nav-section-label" data-i18n="workspaceNav">WORKSPACE</div><nav class="workspace-nav">${navigation.map(([key, label]) => `${key === 'audit' ? '<div class="nav-section-label nav-section-secondary" data-i18n="management">MANAGEMENT</div>' : ''}<a href="#${key}" data-nav="${key}">${icon(key)}<span data-i18n="nav.${key}">${label}</span>${key === 'inbox' ? '<span class="nav-count" id="inbox-count" hidden></span>' : ''}</a>`).join('')}</nav>
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
