/** GYUTRON workspace design system. Deliberately unlayered above legacy functional CSS. */
export const SAAS_STYLES = String.raw`
@font-face{font-family:Inter;src:url('/workspace-assets/fonts/inter-latin.woff2') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}
:root{
 --font-ui:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei",sans-serif;
 --font-mono:"SFMono-Regular",Consolas,"Liberation Mono",monospace;
 --ink:#20232b;--muted:#697180;--subtle:#697180;--line:#e6e8ed;--line-strong:#d6dbe3;
 --surface:#fff;--canvas:#f4f5f7;--surface-hover:#f7f8fa;--sidebar:#f7f8fa;--sidebar-line:#e5e7ec;
 --success:#21734e;--danger:#ad3440;--warning:#8b661c;--side-width:232px;
 --radius-sm:0;--radius:0;--radius-lg:0;--motion-fast:160ms;--ease:cubic-bezier(.2,.8,.2,1);
 --shadow-xs:0 1px 2px rgb(24 32 48 / .04);--shadow-popover:0 8px 28px rgb(24 32 48 / .12),0 1px 4px rgb(24 32 48 / .05);
 --shadow-dialog:0 24px 80px rgb(24 32 48 / .18),0 4px 16px rgb(24 32 48 / .06)
}
html,body{font-family:var(--font-ui);font-size:14px;line-height:1.5;letter-spacing:-.01em;color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
body{background:var(--canvas)}
button,input,select,textarea{font:inherit;letter-spacing:inherit;border-radius:0}
button,a,input,select,textarea,summary{transition:background-color var(--motion-fast) var(--ease),border-color var(--motion-fast) var(--ease),color var(--motion-fast) var(--ease),box-shadow var(--motion-fast) var(--ease)}
button:disabled{opacity:.5;cursor:not-allowed}
a{color:inherit}
h1,h2,h3{color:var(--ink);letter-spacing:-.025em;font-weight:600}
h1{font-size:28px;line-height:36px}h2{font-size:16px;line-height:24px}h3{font-size:14px;line-height:22px}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--button-purple-deep);outline-offset:3px}
.sidebar :focus-visible{outline-color:var(--button-purple-deep)}
input,select,textarea{min-height:38px;padding:8px 11px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);font-size:14px;line-height:20px;box-shadow:var(--shadow-xs)}
input:hover,select:hover,textarea:hover{border-color:#bcc3cf}
input:focus,select:focus,textarea:focus{border-color:var(--button-purple-deep);box-shadow:0 0 0 3px var(--button-purple-light)}
input::placeholder,textarea::placeholder{color:var(--subtle)}
input:disabled,select:disabled,textarea:disabled{background:#f6f7f9;color:#7b8391;box-shadow:none}
input[type=checkbox]{width:16px;min-height:16px;height:16px;padding:0;box-shadow:none;accent-color:var(--button-purple-deep)}
textarea{min-height:104px;line-height:22px;resize:vertical}
select{padding-right:30px}
[aria-invalid=true]{border-color:var(--danger);background:#fffafb}
.field-error{font-size:12px;line-height:18px;color:var(--danger)}
.readonly-field{background:#f7f8fa}
svg{width:18px;height:18px}
.skip-link{border-radius:0;box-shadow:var(--shadow-popover);color:var(--button-purple-deep);font-weight:500}

/* Workspace frame and navigation */
.app-layout{display:grid;grid-template-columns:var(--side-width) minmax(0,1fr);min-height:100dvh}
.sidebar{position:fixed;inset:0 auto 0 0;width:var(--side-width);height:100dvh;display:flex;flex-direction:column;overflow:hidden;background:var(--sidebar);color:#5e6675;border:0;z-index:40;scrollbar-width:thin}
.sidebar-brand{display:none}
.sidebar-brand img{display:block;width:158px;height:auto;max-height:30px;object-fit:contain;object-position:left center}
.brand-caption{font-size:10px;line-height:14px;letter-spacing:.07em;color:var(--subtle);margin-top:3px}
/* Same opaque white as the official .site-header; preserve the original full logo. */
.workspace-brand{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:calc(100% - 24px);min-height:56px;margin:12px 12px 14px;padding:12px;border:0;border-radius:0;background:#fff;text-decoration:none}
.workspace-brand img{display:block;width:100%;max-width:184px;height:auto;object-fit:contain}
.identity-avatar img{width:20px;height:20px;object-fit:contain}
.workspace-nav{display:flex;flex-direction:column;gap:2px;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:0 10px 12px}
.nav-section-label{font-size:10px;line-height:16px;letter-spacing:.06em;font-weight:600;color:var(--subtle);padding:0 10px;margin:6px 0 3px}
.nav-section-secondary{margin-top:10px;padding-left:10px}
.workspace-nav>a,.nav-group-items>a{display:flex;align-items:center;gap:10px;min-height:32px;padding:6px 10px;font-size:13px;line-height:20px;font-weight:450;color:#5c6473;border:0;border-radius:0;text-decoration:none}
.workspace-nav>a:hover,.nav-group-items>a:hover{background:#eceef3;color:var(--ink)}
.workspace-nav>a[aria-current=page],.nav-group-items>a[aria-current=page]{background:var(--button-purple-light);color:var(--button-purple-deep);font-weight:600;border:0}
.workspace-nav>a[aria-current=page] svg,.nav-group-items>a[aria-current=page] svg{color:var(--button-purple-deep)}
.workspace-nav svg,.nav-group-items svg{width:16px;height:16px;color:#7d8593;stroke-width:1.65}
.nav-count{font-size:11px;line-height:18px;padding:0 5px;min-width:19px;border-radius:0;background:#e9ebf0;color:#626b7a;font-variant-numeric:tabular-nums}
[aria-current=page] .nav-count{background:#e2d8f3;color:var(--button-purple-deep)}
.nav-group{margin-top:3px}
.nav-group-title{display:flex;align-items:center;gap:8px;min-height:32px;padding:6px 10px;list-style:none;border-radius:0;font-size:12px;line-height:20px;font-weight:500;color:var(--muted);cursor:pointer;user-select:none}
.nav-group-title::-webkit-details-marker{display:none}
.nav-group-title:hover{background:#eceef3;color:var(--ink)}
.nav-group-title svg{width:14px;height:14px;margin-left:auto;transition:transform var(--motion-fast) var(--ease)}
.nav-group[open]>.nav-group-title .nav-group-arrow svg{transform:rotate(90deg)}
.nav-group-items{display:flex;flex-direction:column;gap:2px;margin-top:4px}
.sidebar-footer{margin-top:auto;padding:9px 14px 0;border-top:1px solid var(--sidebar-line);flex-shrink:0}
.sidebar-footer>a{padding:8px 6px;font-size:12px;line-height:18px;color:var(--muted);border:0}
.sidebar-footer>a:hover{color:var(--ink)}
.sidebar-identity{padding:10px 0 12px;gap:8px}
.identity-avatar{width:28px;height:28px;border-radius:0;background:#e9ebf1;color:#596273;font-size:11px;font-weight:600}
.sidebar-identity strong{font-size:12px;line-height:18px;font-weight:500;color:var(--ink)}
.sidebar-identity #sidebar-role{font-size:11px;line-height:15px;color:var(--muted)}
.signout-button{width:28px;height:28px;padding:4px;font-size:17px;color:var(--muted);border-radius:0}
.signout-button:hover{background:#e9ebf1;color:var(--ink)}
.workspace-content{grid-column:2;min-width:0;margin:8px 8px 8px 0;min-height:calc(100dvh - 16px);background:var(--surface);border:1px solid var(--line);border-radius:0;overflow:clip}
.topbar{height:56px;min-height:56px;padding:0 28px;gap:16px;border-bottom:1px solid var(--line);background:#fff;border-radius:0;box-shadow:none}
.breadcrumbs{gap:10px;font-size:13px;line-height:20px;min-width:0;color:var(--muted)}
.breadcrumbs strong{font-weight:500;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.breadcrumbs>span:first-child{color:var(--muted)}
.topbar-actions{gap:12px;flex-shrink:0}
.search-trigger{min-width:210px;min-height:32px;padding:6px 9px;gap:8px;border:1px solid transparent;border-radius:0;font-size:12px;line-height:18px;color:var(--muted)}
.search-trigger:hover{background:var(--surface-hover);border-color:var(--line)}
.search-trigger svg{width:16px;height:16px}
.workspace-test-switch{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex:none;min-height:32px;padding:5px 8px;border:1px solid var(--line);border-radius:0;background:#fff;color:var(--muted);font-size:13px;line-height:20px;font-weight:500;white-space:nowrap}
.workspace-test-switch:hover{background:var(--surface-hover);border-color:var(--line-strong);color:var(--ink)}
.test-mode-glyph{position:relative;display:inline-block;flex:none;width:22px;height:12px;border:1px solid #adb3bf;background:#f4f5f7}
.test-mode-glyph::after{position:absolute;content:"";width:6px;height:6px;left:2px;top:2px;background:#7d8593;transition:transform var(--motion-fast) var(--ease),background-color var(--motion-fast) var(--ease)}
.test-mode-compact,.workspace-mode-indicator{display:none}
.workspace-test-switch[aria-checked=true],.workspace-body[data-test-mode=true] .workspace-test-switch{border-color:#cbbce3;background:var(--button-purple-light);color:var(--button-purple-deep)}
.workspace-test-switch[aria-checked=true] .test-mode-glyph,.workspace-body[data-test-mode=true] .test-mode-glyph{border-color:var(--button-purple-deep);background:#fff}
.workspace-test-switch[aria-checked=true] .test-mode-glyph::after,.workspace-body[data-test-mode=true] .test-mode-glyph::after{background:var(--button-purple-deep);transform:translateX(10px)}
.workspace-test-switch[aria-checked=true] .workspace-mode-indicator,.workspace-body[data-test-mode=true] .workspace-mode-indicator{display:inline-flex}
.workspace-mode-indicator{align-items:center;min-height:16px;padding:1px 4px;border:1px solid #d4c7e8;background:#fff;color:var(--button-purple-deep);font-size:9px;line-height:12px;font-weight:600;letter-spacing:.03em}
kbd{font-family:var(--font-mono);font-size:10px;line-height:15px;padding:1px 4px;border:1px solid var(--line);border-radius:0;background:#fafbfc;color:#697180;box-shadow:0 1px 0 var(--line)}
.language-label select{width:86px;min-height:32px;padding:4px 22px 4px 8px;font-size:12px;line-height:20px;border:1px solid transparent;border-radius:0;color:var(--muted);background:transparent;box-shadow:none}
.language-label select:hover{border-color:var(--line);background:var(--surface-hover)}
.icon-button{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:5px;border:1px solid transparent;border-radius:0;background:transparent;color:var(--muted);font-size:19px}
.icon-button:hover{background:var(--surface-hover);color:var(--ink);border-color:var(--line)}
.mobile-nav-toggle{display:none}
#workspace-main{padding:24px 28px 28px;min-width:0;flex:1}
#workspace-page{min-height:400px}
.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}
.page-heading .eyebrow{display:none}
.page-description{font-size:14px;line-height:22px;color:var(--muted);margin-top:5px;max-width:720px}
.heading-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.eyebrow{font-size:11px;line-height:16px;letter-spacing:.05em;font-weight:500;color:var(--muted)}
.workspace-footer{min-height:38px;margin-top:auto;padding:10px 28px;font-size:11px;line-height:18px;color:var(--subtle);border-top:1px solid var(--line);background:var(--surface)}


/* Actions, forms and shared states */
.button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:7px 12px;border:1px solid var(--line-strong);border-radius:0;background:var(--surface);color:#384151;font-size:13px;line-height:20px;font-weight:500;box-shadow:var(--shadow-xs);white-space:nowrap}
.button:hover{background:#f7f8fa;border-color:#c3c9d4;color:var(--ink)}
.button:active{background:#eef0f4;box-shadow:none}
.button-primary{background:var(--button-purple-deep);border-color:var(--button-purple-deep);color:#fff;box-shadow:0 1px 2px rgb(38 24 66 / .12)}
.button-primary:hover{background:var(--button-purple-deep);border-color:var(--button-purple-deep);color:#fff;box-shadow:0 0 0 3px var(--button-purple-light)}
.button-primary:active{box-shadow:none}
.button-subtle{border-color:transparent;background:transparent;box-shadow:none;color:var(--muted)}
.button-subtle:hover{background:var(--surface-hover);border-color:var(--line);color:var(--ink)}
.button-danger{color:var(--danger);border-color:#e7cbd0;background:#fff;box-shadow:none}
.button-danger:hover{color:var(--danger);border-color:#d7a9b1;background:#fff7f8}
.button-small{min-height:30px;padding:4px 9px;font-size:12px;line-height:20px}
.button .plus{font-size:17px;font-weight:400;line-height:16px}
.text-link,.record-link{font-size:14px;line-height:20px;font-weight:500;color:var(--ink);border-radius:0}
.text-link{color:var(--button-purple-deep);font-size:13px}
.record-link:hover,.text-link:hover{color:var(--button-purple-deep);text-decoration:none}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 20px}
.form-field{min-width:0;font-size:12px;line-height:18px;font-weight:500;color:#505969}
.form-field label,.form-field>label{display:block;margin-bottom:6px;font-size:12px;line-height:18px;font-weight:500}
.form-field input,.form-field select,.form-field textarea{font-size:14px;font-weight:400}
.form-field-wide{grid-column:1/-1}
.form-help,.section-note,.permission-note,.quote-editor-note>span:last-child{font-size:12px;line-height:19px;color:var(--muted);font-weight:400}
.form-help{display:block;margin-top:6px}
.required{color:var(--muted)}
.inline-boolean{font-size:13px;line-height:20px;gap:8px;align-items:center}
.inline-boolean input{flex:none}
.badge{display:inline-flex;align-items:center;justify-content:center;min-height:23px;padding:2px 7px;border:1px solid #e4e7ec;border-radius:0;background:#f6f7f9;color:#687180;font-size:11px;line-height:16px;font-weight:500;letter-spacing:0;white-space:nowrap}
.badge-active,.badge-won,.badge-done,.badge-completed,.badge-replied,.badge-approved,.badge-fulfilled,.badge-accepted,.badge-verified,.badge-ok{color:#297653;background:#eff8f3;border-color:#d9eade}
.badge-prospect,.badge-qualification,.badge-new,.badge-in_progress,.badge-reviewing,.badge-queued,.badge-processing,.badge-running,.badge-issued{color:#52699a;background:#f0f4fc;border-color:#dfe7f6}
.badge-proposal,.badge-negotiation,.badge-draft{color:var(--button-purple-deep);background:var(--button-purple-light);border-color:#e3dbef}
.badge-urgent,.badge-high,.badge-overdue,.badge-failed{color:#ac4b4b;background:#fcf1f1;border-color:#f0dddd}
.badge-inactive,.badge-lost,.badge-closed,.badge-spam,.badge-archived,.badge-low{color:#626c7b;background:#f4f5f7;border-color:#e5e7ec}
.error-banner,.info-banner{padding:12px 14px;border:1px solid #ecd5da;border-radius:0;background:#fff7f8;color:#963741;font-size:13px;line-height:21px;margin-bottom:16px}
.info-banner{border-color:#e3daf0;background:#f8f5fd;color:#5e487f}
.toast{max-width:460px;padding:12px 16px;border:1px solid #d9e5df;border-radius:0;background:#fff;color:#305f48;box-shadow:var(--shadow-popover);font-size:13px;line-height:21px}
.toast-error{border-color:#e8cfd5;color:var(--danger);background:#fffafb}
.loading-state{min-height:230px;border-radius:0}
.loading-bar{height:2px;border-radius:0;background:var(--button-purple-light)}
.loading-bar::after{background:var(--button-purple-deep)}
.empty-state,.wb-empty{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-height:260px;padding:38px 40px;text-align:left;gap:0;background:var(--surface)}
.empty-state h2{font-size:18px;line-height:26px;font-weight:600;letter-spacing:-.02em;margin-bottom:7px}
.empty-state p{font-size:14px;line-height:22px;color:var(--muted);max-width:470px;margin:0}
.empty-state .button{margin-top:18px}
.empty-symbol,.empty-mark{display:none}
.empty-state.empty-state-compact{min-height:150px;padding:24px}
.empty-state.empty-state-command{min-height:160px;padding:24px}
.empty-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:18px}
.empty-actions .button{margin-top:0}

/* Lists and records */
.panel,.data-panel,.wb-panel,.quote-section{background:var(--surface);border:1px solid var(--line);border-radius:0;box-shadow:none;overflow:hidden}
.panel-heading{min-height:55px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid var(--line);background:#fff}
.panel-heading h2,.wb-panel .panel-heading h2{font-size:15px;line-height:22px;font-weight:600}
.panel-heading p{font-size:12px;line-height:18px;color:var(--muted);margin-top:3px}
.panel-body,.wb-body{padding:20px}
.table-wrap{max-width:100%;overflow:auto;scrollbar-width:thin;background:#fff}
table{width:100%;border-collapse:separate;border-spacing:0;font-size:14px;line-height:20px}
th{height:40px;padding:10px 16px;background:#fafbfc;color:#667085;border-bottom:1px solid var(--line);font-size:12px;line-height:18px;letter-spacing:0;text-transform:none;font-weight:500;text-align:left;white-space:nowrap}
td{height:48px;padding:12px 16px;border-bottom:1px solid #edf0f4;font-size:14px;line-height:20px;vertical-align:middle;color:#414a59}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover td{background:#fafbfe}
.cell-primary{max-width:380px;min-width:200px;color:var(--ink)}
.cell-primary .record-link{font-weight:500;overflow-wrap:anywhere}
.cell-sub{font-size:12px;line-height:18px;color:var(--muted);margin-top:3px;overflow-wrap:anywhere}
.cell-mono,.code-label{font-family:var(--font-mono);font-size:11px;line-height:17px;color:var(--muted);letter-spacing:0}
.cell-amount{font-size:14px;font-weight:500;color:#303849;font-variant-numeric:tabular-nums;white-space:nowrap}
td>.button+.button{margin-left:6px}
.cell-actions{padding-left:8px;padding-right:12px;width:45px}
.cell-actions .icon-button{width:28px;height:28px}
.owner-chip{display:inline-flex;align-items:center;gap:7px;font-size:12px;white-space:nowrap;color:#687181}
.owner-chip>span:first-child{width:23px;height:23px;display:grid;place-items:center;border-radius:0;background:#f0f1f5;color:#596477;font-size:9px;line-height:1;flex:none}
.table-footer{padding:12px 16px;border-top:1px solid var(--line);font-size:12px;line-height:20px;background:#fff;color:var(--muted)}
.pagination{display:flex;align-items:center;gap:9px;font-size:12px}
.pagination .button{min-height:30px;padding:4px 9px;font-size:12px}
.filter-toolbar{gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px;padding:0}
.filter-group{gap:8px;align-items:center}
.search-field{min-width:220px;max-width:340px;flex:1}
.search-field input{height:36px;min-height:36px;padding-left:34px;padding-top:7px;padding-bottom:7px;font-size:13px}
.search-field svg{width:16px;height:16px;color:var(--subtle)}
.filter-select{height:36px;min-height:36px;padding-top:7px;padding-bottom:7px;font-size:13px;min-width:130px;max-width:220px}
.view-toggle{gap:2px;padding:3px;border:1px solid var(--line);border-radius:0;background:#f8f9fb}
.view-toggle button{min-height:28px;padding:4px 10px;font-size:12px;border-radius:0;border:0;background:transparent;color:var(--muted)}
.view-toggle button[aria-pressed=true]{background:#fff;color:var(--ink);box-shadow:var(--shadow-xs)}
.intake-tabs{display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin-bottom:16px;padding-bottom:10px}
.intake-tabs button{min-height:34px;padding:6px 12px;border:1px solid transparent;border-radius:0;font-size:13px;color:var(--muted);background:transparent}
.intake-tabs button[aria-pressed=true]{border-color:#e2d9ee;background:var(--button-purple-light);color:var(--button-purple-deep);font-weight:500}
.intake-tabs button:hover{background:#f0f2f6}
.table-task-title{font-size:14px;line-height:20px;font-weight:500}
.task-check{width:17px;height:17px;border:1px solid var(--line-strong);border-radius:0}
.task-check.is-done{background:var(--button-purple-deep);border-color:var(--button-purple-deep);color:#fff}

/* Overview, pipeline and structured summaries */
.metric-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:22px;padding:0;border:0;background:transparent;box-shadow:none}
.metric-card{padding:18px;border:1px solid var(--line);border-radius:0;background:#fff;min-width:0}
.metric-label{font-size:12px;line-height:18px;font-weight:500;color:var(--muted)}
.metric-value{font-size:28px;line-height:36px;font-weight:600;letter-spacing:-.04em;margin:9px 0 3px;color:var(--ink);font-variant-numeric:tabular-nums}
.metric-detail{font-size:12px;line-height:18px;color:var(--subtle)}
.metric-alert .metric-value{color:var(--danger)}
.section-grid,.wb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-bottom:20px}
.wb-grid>*{min-width:0}.wb-three{grid-template-columns:repeat(3,minmax(0,1fr))}
.stage-summary{gap:12px;padding:24px 20px 20px}
.stage-bar{border-radius:0;background:transparent}.stage-bar-chart{display:block;width:100%;height:4px}.stage-track{fill:var(--line)}.stage-fill{fill:var(--button-purple-deep)}
.stage-count{font-size:13px;line-height:20px;color:#697384;font-variant-numeric:tabular-nums}
.stage-label{font-size:11px;line-height:16px;color:var(--muted);margin-top:9px}
.pipeline-totals{padding:14px 20px;font-size:12px;border-top:1px solid var(--line);background:#fcfcfd;gap:18px}
.pipeline-totals strong{font-size:15px;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
.list-stack{padding:0 20px}
.stack-item{min-height:68px;padding:15px 0;border-bottom:1px solid var(--line);gap:12px}
.stack-item:last-child{border-bottom:0}
.stack-title,.stack-main .record-link{font-size:14px;line-height:21px;font-weight:500}
.stack-meta,.stack-end{font-size:12px;line-height:18px;color:var(--muted)}
.stack-meta{margin-top:4px}.stack-end{gap:7px}
.activity-mark{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#f4f1f9;color:var(--button-purple-deep);border:0;border-radius:0;font-size:11px;flex:none}.activity-mark svg{width:16px;height:16px;stroke-width:1.65}.activity-mark::before,.activity-mark::after{content:none}
.notice-strip{padding:18px 20px;border:1px solid var(--line);border-radius:0;background:#fbfbfd;gap:20px;margin-top:20px}
.notice-strip h3{font-size:14px;line-height:22px}
.notice-strip p{font-size:13px;line-height:21px;color:var(--muted)}
.kanban{display:grid;grid-template-columns:repeat(6,minmax(240px,1fr));gap:14px;align-items:start;overflow-x:auto;max-width:100%;padding-bottom:14px;scrollbar-width:thin}
.kanban-column{background:#f7f8fa;border:1px solid var(--line);border-radius:0;min-width:0;padding:8px}
.kanban-heading{padding:6px 5px 13px;font-size:13px;line-height:20px;font-weight:500;gap:8px}
.kanban-count{font-size:11px;color:var(--muted);border-radius:0;background:#e9ecf2;padding:1px 5px}
.kanban-cards{gap:9px}
.deal-card{padding:14px;border:1px solid #e3e6ed;border-radius:0;background:#fff;box-shadow:var(--shadow-xs)}
.deal-card:hover{border-color:#c5badc;box-shadow:0 2px 5px rgb(35 26 58 / .06)}
.deal-card .record-link{font-size:13px;line-height:20px}
.deal-customer,.deal-meta{font-size:12px;line-height:18px;color:var(--muted)}
.deal-amount{font-size:14px;line-height:20px;font-weight:600;margin-top:14px;font-variant-numeric:tabular-nums}
.kanban-empty{padding:18px 10px;border:1px dashed #dce0e8;border-radius:0;font-size:12px;line-height:20px;color:var(--subtle)}

/* Record and command dialogs */
html{scrollbar-gutter:stable}
html:has(.record-dialog[open],.crm-tool-dialog[open],.confirmation-dialog[open],.workspace-notification-dialog[open]){overflow:hidden}
dialog{color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:0;box-shadow:var(--shadow-dialog)}
dialog::backdrop{background:rgb(23 29 44 / .32);backdrop-filter:blur(2px)}
dialog[open]{animation:workspace-dialog-enter var(--motion-fast) var(--ease)}
.record-dialog{width:660px;max-width:calc(100vw - 40px);max-height:calc(100dvh - 64px);padding:0}
.record-dialog:not(.record-workspace-dialog){overflow:hidden}
.record-dialog:not(.record-workspace-dialog) #dialog-content{display:flex;flex-direction:column;min-height:0;max-height:inherit;overflow:hidden}
.record-dialog:not(.record-workspace-dialog) #dialog-content>form{display:flex;flex:1 1 auto;flex-direction:column;min-height:0;max-height:inherit;overflow:hidden}
.record-dialog:not(.record-workspace-dialog) .dialog-heading,.record-dialog:not(.record-workspace-dialog) .dialog-footer{flex:none;position:static}
.record-dialog:not(.record-workspace-dialog) .dialog-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.record-workspace-dialog{width:min(1040px,calc(100vw - 48px));max-width:calc(100vw - 48px)}
.dialog-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:22px 24px 18px;border-bottom:1px solid var(--line);background:#fff}
.dialog-heading h2{font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.025em;overflow-wrap:anywhere}
.dialog-heading .eyebrow{font-size:10px;line-height:15px;letter-spacing:.06em;margin-bottom:5px;color:var(--subtle)}
.detail-subtitle{font-size:12px;line-height:18px;color:var(--muted);margin-top:4px;overflow-wrap:anywhere}
.dialog-body{padding:22px 24px}
.dialog-footer{display:flex;align-items:center;gap:8px;padding:14px 24px;border-top:1px solid var(--line);background:#fcfcfd}
.footer-right{margin-left:auto;gap:8px}
.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin:0}
.record-workspace-dialog .detail-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:18px 22px}
.detail-grid dt{font-size:12px;line-height:18px;color:var(--muted);font-weight:400;margin-bottom:5px}
.detail-grid dd{font-size:14px;line-height:21px;font-weight:500;color:#394252;margin:0;overflow-wrap:anywhere}
.detail-grid .property-wide{grid-column:1/-1}
.record-actionbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:22px;flex-wrap:wrap}
.record-actionbar .heading-actions{gap:8px}
.record-actionbar .button{min-height:32px;font-size:12px;padding:5px 10px}
.detail-notes,.detail-activities{border-top:1px solid var(--line);padding-top:20px;margin-top:22px}
.detail-notes h3,.detail-activities h3{font-size:14px;line-height:22px;margin-bottom:12px}
.detail-notes p,.note-copy{font-size:14px;line-height:23px;white-space:pre-wrap;color:#5a6473}
.detail-tabs,.record-tabs{display:flex;align-items:center;gap:18px;min-height:44px;border-bottom:1px solid var(--line);margin-bottom:20px}
.detail-tabs button,.record-tab{padding:12px 0 10px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent;font-size:13px;color:var(--muted)}
.detail-tabs button[aria-selected=true],.record-tab[data-active=true]{border-bottom-color:var(--button-purple-deep);color:var(--button-purple-deep);font-weight:500}
.confirmation-dialog{width:430px;max-width:calc(100vw - 32px);padding:0;margin:18vh auto;border-radius:0}
.confirmation-dialog .dialog-heading h2{font-size:18px;line-height:26px}
.confirmation-dialog .dialog-body{font-size:14px;line-height:23px}
.command-dialog{--command-max-height:min(520px,calc(100dvh - 96px));position:fixed;z-index:100;inset:64px 24px auto auto;width:min(480px,calc(100vw - 32px));max-width:calc(100vw - 32px);height:auto;max-height:var(--command-max-height);min-height:0;padding:0;margin:0;border:1px solid var(--line);border-radius:0;overflow:hidden;box-shadow:0 8px 24px rgb(32 20 50 / .18)}
.command-dialog[open]{display:flex;flex-direction:column;animation:workspace-search-enter var(--motion-fast) var(--ease)}
.command-dialog::backdrop{background:rgb(31 23 44 / .08);backdrop-filter:none}
.command-header{position:static;display:flex;align-items:center;flex:0 0 auto;min-height:60px;padding:12px 16px;border-bottom:1px solid var(--line);background:#fcfcfd;gap:12px}
.command-header input{min-height:36px;font-size:15px;box-shadow:none;background:transparent;border:0;padding:6px 0}
.command-header input:focus{box-shadow:none}
.command-header input{flex:1;min-width:0}
.command-header .icon-button{flex:none}
.command-results{position:static;flex:1 1 auto;min-height:0;max-height:calc(var(--command-max-height) - 108px);padding:7px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;background:#fff}
.command-group-label{padding:10px 10px 6px;color:var(--subtle);font-size:11px;line-height:18px;font-weight:500}
.command-result{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:42px;width:100%;padding:9px 11px;border:0;border-radius:0;background:#fff;font-size:14px;line-height:21px;color:#404959;text-align:left}
.command-result>span{min-width:0;overflow-wrap:anywhere}
.command-result:hover,.command-result:focus-visible{background:var(--button-purple-light);color:var(--button-purple-deep)}
.command-result small{max-width:42%;min-width:0;font-size:12px;line-height:18px;color:var(--muted);overflow-wrap:anywhere;text-align:right}
.command-footer{position:static;inset:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;flex:0 0 auto;min-height:42px;width:auto;padding:10px 16px;font-size:11px;line-height:18px;color:var(--subtle);border-top:1px solid var(--line);background:#fcfcfd}

/* Saved views, contacts and bulk tools */
.crm-viewbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:0 0 12px;margin:0 0 12px;border-bottom:1px solid var(--line)}
.crm-viewtabs,.crm-list-actions{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.crm-viewtabs button{min-height:34px;padding:6px 10px;border:1px solid transparent;border-radius:0;background:transparent;color:var(--muted);font-size:13px;line-height:20px;font-weight:500}
.crm-viewtabs button:hover{background:var(--surface-hover);color:var(--ink)}
.crm-viewtabs button[aria-pressed=true]{background:var(--button-purple-light);color:var(--button-purple-deep);border-color:#e6ddf1}
.crm-viewbar .button{min-height:32px;padding:5px 10px;font-size:12px;line-height:20px}
.crm-bulkbar,.wb-bulkbar{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:10px 14px;margin-bottom:12px;border:1px solid #e4dcef;border-radius:0;background:#f7f4fc;color:#5e4b7c;font-size:13px}
.crm-bulkbar strong,.wb-bulkbar strong{font-size:13px;font-weight:500}
.crm-selection-cell input,.wb-select{width:16px;height:16px;accent-color:var(--button-purple-deep)}
.crm-tool-dialog{width:min(620px,calc(100vw - 40px));max-height:calc(100dvh - 64px);padding:0;border:1px solid var(--line);border-radius:0;box-shadow:var(--shadow-dialog);background:#fff;overflow:auto}
.crm-tool-dialog .form-field input,.crm-tool-dialog .form-field select,.crm-tool-dialog .form-field textarea{min-height:38px;padding:8px 11px;border:1px solid var(--line-strong);border-radius:0;font-size:14px;line-height:20px}
.crm-tool-dialog .form-field textarea{min-height:104px}
.crm-tool-dialog input[type=checkbox]{width:16px;min-height:16px;height:16px;padding:0}
.crm-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.crm-columns label{font-size:14px;line-height:22px}
.crm-record-workspace{border-top:1px solid var(--line);margin-top:24px;padding-top:20px}
.crm-related-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
.crm-related-heading h3{font-size:14px;line-height:22px;font-weight:600}
.crm-related-heading h3 small{font-size:12px;color:var(--muted);font-weight:400;margin-left:4px}
.crm-related-heading .button,.crm-contact-row .button{min-height:30px;padding:4px 8px;font-size:12px;line-height:20px}
.crm-contact-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #edf0f4}
.crm-contact-row strong{font-size:14px;line-height:21px;font-weight:500}
.crm-contact-row small{font-size:12px;line-height:18px;color:var(--muted);margin-top:3px}
.crm-contact-row a{color:#626f85}
.crm-contact-row a:hover{color:var(--button-purple-deep)}
.crm-primary-label{font-size:10px;line-height:17px;font-weight:500;letter-spacing:0;padding:1px 5px;border:1px solid #e7dff1;border-radius:0;background:#f7f3fc;color:var(--button-purple-deep);margin-left:7px}
.crm-related-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:24px}
.crm-related-row{padding:11px 0;border:0;border-bottom:1px solid #edf0f4;border-radius:0;background:#fff}
.crm-related-row:hover{background:#fcfbfe;color:var(--button-purple-deep)}
.crm-related-row span{font-size:14px;line-height:21px;font-weight:500}
.crm-related-row small{font-size:12px;line-height:18px;color:var(--muted);margin-top:4px}
.crm-related-empty,.crm-related-loading{font-size:13px;line-height:21px;color:var(--muted);padding:12px 0}
.crm-view-error{font-size:12px;line-height:19px;color:var(--danger)}
.crm-result-list{max-height:350px;font-size:13px;line-height:22px;padding-left:20px}

/* Analytics, imports, reports and business assistant */
.wb-toolbar{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.wb-toolbar .form-field{min-width:140px;flex:1}
.wb-toolbar .form-field input,.wb-toolbar .form-field select{min-height:36px;padding:7px 10px;font-size:13px;border:1px solid var(--line-strong);border-radius:0;background:#fff}
.wb-toolbar .button{min-height:36px}
.wb-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--line);border-radius:0;background:#fff;margin-bottom:20px;overflow:hidden}
.wb-kpi{min-width:0;padding:19px 20px;border-right:1px solid var(--line)}
.wb-kpi:last-child{border-right:0}
.wb-kpi small{font-size:12px;line-height:19px;color:var(--muted);font-weight:500}
.wb-kpi strong{display:block;font-size:28px;line-height:36px;font-weight:600;letter-spacing:-.035em;margin:10px 0 5px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.wb-kpi span{font-size:11px;line-height:18px;color:var(--subtle)}
.wb-properties{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 24px;margin:0;padding:20px}
.wb-properties dt{font-size:12px;line-height:18px;font-weight:400;color:var(--muted);margin-bottom:5px}
.wb-properties dd{font-size:14px;line-height:22px;font-weight:500;color:#394252;margin:0;overflow-wrap:anywhere}
.wb-report{max-width:1000px;margin:0 auto;padding:32px 36px;border:1px solid var(--line);border-radius:0;background:#fff;font-size:14px;line-height:1.8}
.wb-report h1{font-size:26px;line-height:34px;margin-bottom:20px}
.wb-report h2{font-size:18px;line-height:26px;padding-top:22px;margin:26px 0 12px;border-top:1px solid var(--line)}
.wb-report h3{font-size:15px;line-height:24px;margin:18px 0 8px}
.wb-report p{font-size:14px;line-height:25px;color:#535e6e;white-space:pre-wrap;margin:9px 0;overflow-wrap:anywhere}
.wb-report-bullet{padding-left:16px}
.wb-code{font-family:var(--font-mono);font-size:12px;line-height:20px;white-space:pre-wrap;overflow-wrap:anywhere;color:#616b7b}
.wb-import-file{padding:18px;border:1px dashed #cbd1dc;border-radius:0;background:#fafbfc}
.wb-mapping-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.wb-mapping-grid select{padding:8px 10px;font-size:14px;min-height:38px;border:1px solid var(--line-strong);border-radius:0}
.wb-stepbar{display:flex;gap:0;margin:0 0 20px;border-bottom:1px solid var(--line)}
.wb-stepbar li{padding:12px 16px;font-size:13px;line-height:20px;color:var(--muted)}
.wb-stepbar .is-current{font-weight:500;color:var(--button-purple-deep);border-bottom:2px solid var(--button-purple-deep)}
.wb-import-actions{margin-top:18px}
.wb-trend{display:block;width:100%;height:220px}
.wb-trend-line{stroke:var(--button-purple-deep);stroke-width:2.2}
.wb-trend-dot{fill:var(--button-purple-deep)}
.wb-trend-axis{stroke:#eceef3;stroke-width:1}
.wb-trend-labels{padding:0 20px 16px;font-size:11px;color:var(--subtle)}
.wb-link-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px}
.wb-link-row .text-link{font-size:12px}
.wb-chat{display:grid;grid-template-columns:230px minmax(0,1fr);align-items:start;gap:18px}
.wb-chat>.data-panel{border-radius:0}
.wb-chat>.data-panel .wb-list{max-height:max(160px,calc(100dvh - 290px));overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.wb-chat-main{min-width:0;background:#fff;border:1px solid var(--line);border-radius:0;overflow:hidden}
.wb-chat-messages{padding:24px;min-height:340px;max-height:61dvh;overflow-y:auto;scrollbar-width:thin}
.wb-message{max-width:min(100%,780px);margin:0 0 25px}
.wb-message-user{margin-left:auto;max-width:min(90%,720px);padding:13px 16px;border:1px solid #e8e1f2;border-radius:0;background:#f8f5fc}
.wb-message small{font-size:11px;line-height:17px;font-weight:500;color:var(--subtle)}
.wb-message p{font-size:14px;line-height:24px;color:#4d5869;margin:10px 0;white-space:pre-wrap;overflow-wrap:anywhere}
.wb-answer h1,.wb-answer h2{font-size:16px;line-height:24px;margin:20px 0 8px}
.wb-answer h3{font-size:14px;line-height:23px;margin:16px 0 8px}
.wb-citations{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.wb-citation{padding:4px 7px;border:1px solid #e5dfed;border-radius:0;background:#fcfaff;color:var(--button-purple-deep);font-size:11px;line-height:17px}
.wb-citation:hover{background:var(--button-purple-light);border-color:#d5c8e8}
.wb-chat-form{padding:18px 20px;border-top:1px solid var(--line);background:#fcfcfd}
.wb-chat-form textarea{min-height:82px;padding:11px 13px;border:1px solid var(--line-strong);border-radius:0;font-size:14px;line-height:22px;background:#fff}
.wb-chat-controls{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:12px}
.wb-chat-controls>div{display:flex;flex-wrap:wrap;gap:8px 16px}
.wb-chat-controls .inline-boolean{font-size:12px}
.wb-muted{font-size:12px;line-height:20px;color:var(--muted)}
.wb-chat-form details{margin-top:12px}
.wb-chat-form details summary{font-size:12px;line-height:20px;color:var(--muted);cursor:pointer}
.wb-list-item{padding:14px 16px;border-bottom:1px solid var(--line);background:#fff;border-left:2px solid transparent}
.wb-list-item:hover,.wb-list-item[aria-current=true]{padding-left:16px;border-left-color:var(--button-purple-deep);background:#f8f5fc}
.wb-list-item strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;max-width:100%;font-size:13px;line-height:20px;font-weight:500}
.wb-list-item small{font-size:11px;line-height:17px;color:var(--subtle);margin-top:5px}
.wb-running{padding:12px 15px;border:1px solid #e3dbef;border-left:3px solid var(--button-purple-deep);border-radius:0;background:#f9f6fd;font-size:13px;line-height:22px;color:#685284}
.wb-data-note{padding:13px 18px;border-top:1px solid var(--line);background:#fafbfc;font-size:12px;line-height:20px;color:var(--muted)}
.wb-viewbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:16px}
.wb-viewbar select{min-height:34px;padding:6px 10px;font-size:13px;border:1px solid var(--line-strong);border-radius:0}
.wb-column-menu{gap:14px;padding:16px;border:1px solid var(--line);border-radius:0}
.wb-column-menu label{font-size:13px;line-height:20px}

/* Quotation workspace */
.quote-back{display:inline-flex;align-items:center;gap:7px;font-size:12px;line-height:20px;color:var(--muted);margin-bottom:16px}
.quote-back:hover{color:var(--button-purple-deep)}
.quote-editor-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.quote-editor-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;align-items:start;gap:22px}
.quote-editor-main{min-width:0}
.quote-section{margin-bottom:20px}
.quote-section .panel-heading{padding:15px 20px}
.quote-editor-layout .panel-body{padding:20px}
.quote-contact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0}
.quote-contact-column{padding:20px}
.quote-contact-column+div{border-left:1px solid var(--line)}
.quote-editor-summary{position:sticky;top:80px;min-width:0}
.quote-total-list{margin:0;padding:20px}
.quote-total-list>div{padding:8px 0;font-size:13px;line-height:21px;gap:16px}
.quote-total-list dt{color:var(--muted)}
.quote-total-list dd{font-size:14px;font-weight:500;font-variant-numeric:tabular-nums;color:var(--ink)}
.quote-total-final{border-top:1px solid var(--line);margin-top:12px;padding-top:17px}
.quote-total-final dt{font-size:13px;color:var(--ink);font-weight:600}
.quote-total-final dd{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.03em}
.quote-calculation-state{padding:11px 20px;border-top:1px solid var(--line);font-size:12px;line-height:20px;color:var(--muted)}
.quote-calculation-error{color:var(--danger);background:#fff8f9}
.quote-editor-note{padding:17px 4px;font-size:12px;line-height:20px;color:var(--muted)}
.quote-editor-note .badge{margin-bottom:7px}
.quote-lines th{height:39px;padding:10px 12px;font-size:12px}
.quote-lines td{padding:12px;vertical-align:top;font-size:14px}
.quote-lines input,.quote-lines textarea{min-height:38px;padding:8px 10px;font-size:14px;line-height:20px}
.quote-line-index{color:var(--subtle);font-size:12px}
.quote-line-description input{min-height:32px;padding:5px 8px;font-size:12px;border-color:var(--line);background:#f9fafb;margin-bottom:6px}
.quote-line-description textarea{min-height:70px}
.quote-line-total strong{display:block;padding-top:9px;font-size:14px;line-height:21px;font-weight:500;font-variant-numeric:tabular-nums}
.quote-line-remove .icon-button{width:28px;height:34px;font-size:18px}
.quote-lines-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 18px;border-top:1px solid var(--line);background:#fcfcfd}
.quote-lines-footer>span{max-width:280px;font-size:12px;line-height:19px;color:var(--muted)}
.quote-adjustment-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.quote-mobile-label{font-size:12px;line-height:18px;color:var(--muted);margin-bottom:5px}
.quote-field-errors{font-size:12px;line-height:20px}
.quote-document{max-width:1100px;padding:32px 36px;margin-top:20px;border:1px solid var(--line);border-radius:0;background:#fff}
.quote-document-header{display:flex;justify-content:space-between;align-items:flex-start;gap:28px;padding-bottom:24px;border-bottom:1px solid var(--line-strong)}
.quote-document-header h2{font-size:26px;line-height:34px;font-weight:600;margin-bottom:8px}
.quote-document-header .eyebrow{font-size:11px;line-height:18px;margin-bottom:10px}
.quote-document-status>span:nth-child(2){font-size:12px;line-height:20px;letter-spacing:0;margin-top:9px}
.quote-document-status p{font-size:12px;line-height:19px;color:var(--muted);margin-top:7px}
.quote-document-contacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:36px;padding:26px 0}
.quote-document-contacts h3,.quote-shipping-address h3,.quote-terms h3{font-size:12px;line-height:19px;letter-spacing:0;text-transform:none;color:var(--muted);font-weight:500;margin-bottom:10px}
.quote-document-contacts strong{font-size:15px;line-height:23px;font-weight:600;margin-bottom:7px}
.quote-document-contacts p,.quote-shipping-address p{font-size:13px;line-height:22px;color:#5f6979}
.quote-read-lines{border:1px solid var(--line);border-radius:0;overflow:auto}
.quote-read-lines th{font-size:12px;padding:10px 14px}
.quote-read-lines td{font-size:14px;padding:14px;line-height:22px}
.quote-read-description strong{font-weight:500}
.quote-document-bottom{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:42px;margin-top:26px}
.quote-terms p{font-size:13px;line-height:23px;color:#5f6979}
.quote-document-footer{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line);margin-top:28px;padding-top:15px;font-size:12px;line-height:20px;color:var(--muted)}
.quote-related-links{display:flex;gap:14px;flex-wrap:wrap;margin:16px 0}
.quote-related-links button{font-size:13px;line-height:21px;color:var(--button-purple-deep)}
.quote-supplement-note{margin-top:20px}
.quote-supplement-note h2{font-size:14px;line-height:22px;margin-bottom:10px}
.quote-filter-context{gap:10px;margin-bottom:14px;font-size:12px;line-height:20px}
.quote-filter-context .button{min-height:28px;padding:3px 8px;font-size:12px}
.quote-print-language{font-size:12px;line-height:20px;color:var(--muted)}

/* Settings and notifications */
.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.settings-section{padding:20px;border:1px solid var(--line);border-radius:0;background:#fff}
.settings-section h2{font-size:16px;line-height:24px}
.settings-description{font-size:13px;line-height:22px;color:var(--muted);margin-top:6px}
.settings-properties{gap:20px;margin-top:20px}
.property dt{font-size:12px;line-height:18px;color:var(--muted);margin-bottom:5px}
.property dd{font-size:14px;line-height:22px;color:#414b5b}
.workspace-notification-trigger{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:6px;position:relative;border:1px solid transparent;border-radius:0;background:transparent;color:#6f7887;box-shadow:none}
.workspace-notification-trigger:hover{border-color:var(--line);background:var(--surface-hover);color:var(--ink)}
.workspace-notification-trigger svg{width:17px;height:17px}
.workspace-notification-count{position:absolute;right:-3px;top:-3px;min-width:15px;height:15px;line-height:15px;padding:0 4px;border:1px solid #fff;border-radius:0;background:var(--button-purple-deep);color:#fff;font-size:9px;font-weight:600;font-variant-numeric:tabular-nums}
.workspace-notification-dialog{position:fixed;inset:67px 20px auto auto;margin:0;width:440px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 95px);padding:0;border:1px solid var(--line);border-radius:0;background:#fff;box-shadow:var(--shadow-popover);overflow:auto}
.workspace-notification-dialog[open]{display:flex;flex-direction:column;overflow:hidden}
.workspace-notification-header,.workspace-notification-toolbar{flex:none}
.workspace-notification-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.workspace-notification-meta button{display:inline-flex;align-items:center;gap:5px;min-height:28px}
@media(pointer:coarse),(max-width:767px){.workspace-notification-toolbar .button,.workspace-notification-meta button{min-height:44px}}
.workspace-notification-header{padding:18px 20px;border-bottom:1px solid var(--line)}
.workspace-notification-header h2{font-size:16px;line-height:24px}
.workspace-notification-toolbar{padding:10px 20px;border-bottom:1px solid var(--line);background:#fcfcfd;font-size:12px;line-height:20px}
.workspace-notification-toolbar .button{min-height:28px;font-size:12px;padding:3px 8px}
.workspace-notification-item{padding:15px 20px;border-bottom:1px solid var(--line);background:#fff}
.workspace-notification-item.is-unread{background:#fafbfc}
.workspace-notification-kind{display:flex;align-items:center;gap:7px}
.workspace-notification-kind .ui-icon{width:14px;height:14px;vertical-align:middle}
.workspace-notification-kind{font-size:10px;line-height:17px;letter-spacing:.02em;color:#756489;font-weight:500}
.workspace-notification-link{font-size:13px;line-height:21px;font-weight:500;color:#414957;border-radius:0}
.workspace-notification-link:hover{color:var(--button-purple-deep)}
.workspace-notification-body{font-size:12px;line-height:20px;color:var(--muted);margin-top:5px}
.workspace-notification-meta{font-size:11px;line-height:18px;color:var(--subtle);margin-top:7px}
.workspace-notification-empty{padding:30px 20px;font-size:13px;line-height:22px;color:var(--muted)}
.workspace-notification-footer{padding:11px 20px;font-size:11px;line-height:18px;color:var(--subtle);background:#fcfcfd;border-top:1px solid var(--line)}
.workspace-notification-error{padding:14px 20px;font-size:13px;line-height:21px;color:var(--danger)}

/* Password access */
.login-body{background:#f7f8fb;color:var(--ink);font-family:var(--font-ui)}
.login-layout{display:grid;grid-template-columns:minmax(0,400px);align-items:center;justify-content:center;gap:0;width:100%;max-width:none;min-height:100dvh;margin:auto;padding:64px 24px;background:transparent}
.login-brand-panel{display:none}
.login-brand-panel::before,.login-system-lines{display:none}
.login-wordmark{display:block;width:174px;height:auto;object-fit:contain;margin:0 0 28px}.login-wordmark img{display:block;width:100%;height:auto;object-fit:contain}.login-form-container>h2{font-size:26px;line-height:34px;font-weight:600;letter-spacing:-.025em;margin:0 0 8px}.login-form-container>.eyebrow{font-size:11px;line-height:18px;color:var(--subtle);margin-bottom:8px}.login-intro{font-size:14px;line-height:23px;color:var(--muted);margin:0}.login-language{position:fixed;right:26px;top:22px;display:flex;gap:5px;align-items:center}.login-language a{padding:6px 10px;border:1px solid transparent;border-radius:0;font-size:12px;line-height:20px;color:var(--muted)}.login-language a:hover{background:#eceef3;color:var(--ink)}.login-language a[aria-current=page]{background:var(--button-purple-light);color:var(--button-purple-deep)}
.login-brand-copy{max-width:420px}
.login-brand-copy h1{font-size:36px;line-height:44px;font-weight:600;letter-spacing:-.035em;color:var(--ink)}
.login-brand-copy p{font-size:15px;line-height:25px;color:var(--muted);margin-top:18px;max-width:360px}
.login-brand-footer{font-size:10px;line-height:18px;color:var(--subtle);letter-spacing:.08em}
.login-form-panel{display:block;min-height:0;padding:32px;border:1px solid var(--line);border-radius:0;background:#fff;box-shadow:0 8px 30px rgb(24 32 48 / .04)}
.login-form-container{width:100%;max-width:none;margin:0;padding:0}
.login-intro h2{font-size:26px;line-height:34px;font-weight:600;letter-spacing:-.025em}
.login-intro p{font-size:14px;line-height:23px;color:var(--muted);margin-top:8px}
.login-intro .eyebrow{font-size:11px;line-height:18px;color:var(--subtle);margin-bottom:10px}
.login-form{display:flex;flex-direction:column;gap:16px;margin-top:24px}
.login-form label{display:flex;flex-direction:column;gap:7px;margin:0;font-size:13px;line-height:20px;font-weight:500;color:#505a6a}
.login-form input{min-height:42px;font-size:15px;padding:10px 12px}
.login-submit{width:100%;min-height:40px;font-size:14px;border-radius:0;margin-top:4px}
.login-help,.login-back,.login-legal{font-size:12px;line-height:20px;color:var(--muted)}
.login-back{display:inline-block;margin-top:22px}
.login-back:hover{color:var(--button-purple-deep)}
.login-legal{position:static;display:flex;align-items:center;justify-content:space-between;gap:16px;margin:24px 0 0;padding-top:14px;border-top:1px solid var(--line);font-size:11px;line-height:18px;color:var(--subtle)}

@keyframes workspace-dialog-enter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:1600px){.quote-editor-layout{grid-template-columns:minmax(0,1fr) 300px;gap:24px}}
@media(max-width:1300px){.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.quote-editor-layout{grid-template-columns:minmax(0,1fr)}.quote-editor-summary{position:static;display:grid;grid-template-columns:1fr 1fr;gap:20px}.quote-editor-note{padding:18px 8px}.wb-chat{grid-template-columns:205px minmax(0,1fr)}.wb-three{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:1100px){.search-trigger{min-width:170px}.wb-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.wb-kpi:nth-child(2){border-right:0}.wb-kpi:nth-child(-n+2){border-bottom:1px solid var(--line)}.wb-properties{gap:18px}.quote-lines th:nth-child(3){width:70px}.quote-lines th:nth-child(4){width:70px}.quote-lines th:nth-child(5){width:112px}.quote-lines th:nth-child(6){width:120px}}
@media(max-width:1024px){
 .app-layout{display:block;min-height:100dvh}.sidebar{width:232px;max-width:calc(100vw - 48px);transform:translateX(-100%);transition:transform var(--motion-fast) var(--ease);box-shadow:none;z-index:50}.sidebar.is-open{transform:translateX(0);box-shadow:var(--shadow-popover)}
 .sidebar-overlay{background:rgb(23 29 44 / .28);backdrop-filter:blur(1px)}.workspace-content{width:100%;min-height:100dvh;margin:0;border:0;border-radius:0;overflow:clip}.topbar{padding:0 22px;border-radius:0;height:56px;gap:12px}.mobile-nav-toggle{display:inline-flex;width:44px;height:44px;border-radius:0;border:1px solid var(--line);background:#fff;font-size:18px;color:var(--muted);align-items:center;justify-content:center;padding:4px}
 #workspace-main{padding:22px}.workspace-footer{padding-left:22px;padding-right:22px}.breadcrumbs{font-size:13px;gap:8px}.search-trigger{min-width:44px;width:44px;height:44px;padding:12px;justify-content:center}.search-trigger>span,.search-trigger kbd{display:none}.workspace-notification-trigger{width:44px;height:44px;padding:12px}.language-label select{min-height:44px;height:44px}.workspace-nav>a,.nav-group-items>a{min-height:44px;padding:12px 10px}.nav-group-title{min-height:44px;padding:12px 10px}.topbar-actions{gap:7px}.page-heading{margin-bottom:20px;gap:16px}.page-heading h1{font-size:26px;line-height:34px}.section-grid,.wb-grid{gap:18px}.quote-editor-summary{display:block}.quote-editor-note{padding:16px 3px}.record-workspace-dialog .detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wb-chat{grid-template-columns:190px minmax(0,1fr);gap:14px}.quote-contact-grid{grid-template-columns:1fr}.quote-contact-column+div{border-left:0;border-top:1px solid var(--line)}
}
@media(max-width:1000px){
 .quote-lines,.quote-lines tbody{display:block;width:100%}.quote-lines thead{display:none}.quote-lines tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;padding:18px;border-bottom:1px solid var(--line)}.quote-lines tr:last-child{border-bottom:0}.quote-lines td{display:block;height:auto;padding:0;border:0;min-width:0;max-width:none}.quote-line-index{grid-column:1/3;font-size:12px}.quote-lines .quote-line-remove{grid-column:3;grid-row:1;text-align:right}.quote-lines .quote-line-description{grid-column:1/-1}.quote-lines .quote-line-unit{grid-column:1}.quote-lines .quote-line-quantity{grid-column:2}.quote-lines .quote-line-price{grid-column:3}.quote-lines .quote-line-total{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--line)}.quote-line-total strong{padding-top:0;font-size:15px}.quote-mobile-label{display:block}.quote-line-total .quote-mobile-label{margin-bottom:0}.quote-lines input{font-size:14px;min-height:38px}.quote-line-description input{font-size:12px;min-height:32px}.quote-line-description textarea{font-size:14px;min-height:76px}.quote-lines-wrap{overflow:visible}.quote-lines-footer{padding:14px 18px;align-items:flex-start}.quote-lines-footer>span{max-width:210px;font-size:11px}.quote-adjustment-grid{gap:12px}.quote-read-lines table{min-width:650px}.quote-document-bottom{grid-template-columns:1fr;gap:25px}.quote-document-bottom>section:last-child{max-width:320px;width:100%;margin-left:auto}
}
@media(max-width:767px){
 #workspace-main{padding:20px 16px}.topbar{padding:0 16px;gap:10px}.breadcrumbs>span{display:none}.breadcrumbs strong{font-size:13px}.topbar-actions{gap:5px}.language-label select{width:78px;font-size:12px}.workspace-footer{padding:10px 16px}.page-heading{align-items:flex-start;flex-direction:column;gap:14px;margin-bottom:18px}.page-heading h1{font-size:25px;line-height:33px}.page-description{font-size:13px;line-height:21px;max-width:100%}.heading-actions{gap:7px}.button{min-height:36px;padding:7px 11px;font-size:13px}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.metric-card{padding:16px}.metric-value{font-size:26px;line-height:34px}.section-grid,.wb-grid,.wb-three,.settings-grid{grid-template-columns:1fr;gap:16px}.panel-heading{padding:15px 17px}.panel-body,.wb-body{padding:18px}.filter-toolbar{align-items:stretch;gap:8px}.filter-group{width:100%;flex-wrap:wrap;gap:8px}.search-field{max-width:none;min-width:0;flex:1 1 100%}.filter-select{flex:1;max-width:none;min-width:110px}.view-toggle{margin-left:auto}.crm-viewbar{gap:10px}.crm-viewtabs{max-width:100%;overflow-x:auto;flex-wrap:nowrap}.crm-viewtabs button{white-space:nowrap;min-height:34px;font-size:12px}.crm-list-actions{gap:5px}.crm-viewbar .button{min-height:32px;padding:5px 8px;font-size:12px}.table-footer{padding:12px;gap:12px;flex-wrap:wrap}.pagination{gap:7px}.empty-state,.wb-empty{padding:28px 24px;min-height:245px}.empty-state h2{font-size:18px}.empty-state p{font-size:13px;line-height:22px}.empty-state .button{margin-top:16px}.notice-strip{align-items:flex-start;flex-direction:column;padding:17px;gap:14px}.dialog-heading{padding:20px 20px 16px}.dialog-heading h2{font-size:19px;line-height:27px}.dialog-body{padding:20px}.dialog-footer{padding:13px 20px;flex-wrap:wrap}.record-dialog,.record-workspace-dialog,.crm-tool-dialog{max-width:calc(100vw - 24px);width:calc(100vw - 24px);max-height:calc(100dvh - 32px)}.form-grid{gap:15px}.record-workspace-dialog .detail-grid,.detail-grid{gap:17px}.record-actionbar{gap:10px;margin-bottom:20px}.record-actionbar .heading-actions{flex-wrap:wrap}.crm-related-grid{grid-template-columns:1fr;gap:20px}.crm-contact-row{align-items:flex-start;flex-wrap:wrap;gap:9px}.crm-primary-label{display:inline-block}.wb-chat{display:flex;flex-direction:column;gap:16px}.wb-chat>.data-panel,.wb-chat-main{width:100%}.wb-chat>.data-panel .wb-list{max-height:200px;overflow-y:auto}.wb-chat-messages{min-height:300px;max-height:60dvh;padding:20px}.wb-message,.wb-message-user{max-width:100%}.wb-chat-form{padding:16px}.wb-chat-controls{align-items:flex-start;flex-wrap:wrap;gap:12px}.wb-chat-controls>div{gap:7px 14px}.wb-chat-controls .button{margin-left:auto}.wb-mapping-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wb-stepbar{overflow:auto}.wb-stepbar li{padding:11px 12px;font-size:12px;white-space:nowrap}.wb-toolbar .form-field{min-width:130px}.wb-properties{padding:18px;gap:18px}.wb-kpi{padding:17px}.wb-kpi strong{font-size:25px;line-height:33px}.wb-report{padding:25px 22px}.wb-report h1{font-size:24px;line-height:32px}.quote-editor-actions{justify-content:flex-start;width:100%;gap:7px}.quote-document{padding:25px 22px}.quote-document-header h2{font-size:23px;line-height:32px}.quote-document-contacts{grid-template-columns:1fr;gap:23px;padding:24px 0}.quote-document-footer{flex-direction:column;gap:7px;font-size:11px}.quote-related-links{gap:12px}.workspace-notification-dialog{inset:64px 12px auto auto;width:calc(100vw - 24px);max-width:440px;max-height:calc(100dvh - 85px)}.login-layout{display:flex;flex-direction:column;justify-content:center;gap:24px;padding:32px 24px;min-height:100dvh;max-width:460px}.login-brand-panel{padding:0;width:100%;gap:0;min-height:0;align-items:flex-start}.login-wordmark{width:190px}.login-brand-copy,.login-brand-footer{display:none}.login-form-panel{width:100%;padding:28px}.login-intro h2{font-size:25px;line-height:33px}
}
@media(max-width:480px){
 .search-trigger{display:inline-flex}.topbar-actions{gap:5px}.topbar{gap:9px}.breadcrumbs{min-width:0;flex:1;overflow:hidden}.breadcrumbs strong{min-width:0;max-width:100%}.language-label select{width:74px}.workspace-footer{font-size:10px;gap:8px}.metric-grid{gap:10px}.metric-card{padding:14px}.metric-value{font-size:25px;line-height:32px}.metric-label,.metric-detail{font-size:11px}.wb-kpis{grid-template-columns:1fr}.wb-kpi{padding:15px 18px;border-right:0;border-bottom:1px solid var(--line)}.wb-kpi:last-child{border-bottom:0}.wb-kpi strong{font-size:26px;line-height:34px}.form-grid,.crm-columns,.wb-mapping-grid{grid-template-columns:1fr}.form-field-wide{grid-column:auto}.detail-grid,.record-workspace-dialog .detail-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.detail-grid dt{font-size:11px}.detail-grid dd{font-size:13px;line-height:21px}.record-actionbar .heading-actions .button{min-height:32px;font-size:12px}.dialog-heading,.dialog-body{padding-left:17px;padding-right:17px}.dialog-footer{padding-left:17px;padding-right:17px}.footer-right{gap:7px}.record-dialog .dialog-footer>.button-danger{margin-right:auto}.wb-properties{grid-template-columns:1fr;gap:16px}.wb-toolbar .form-field{min-width:calc(50% - 5px)}.wb-chat-controls .inline-boolean{font-size:12px}.wb-chat-form .wb-body{padding:15px 0}.wb-report{padding:22px 18px}.wb-report h1{font-size:22px;line-height:30px}.quote-contact-column,.quote-editor-layout .panel-body{padding:18px}.quote-document{padding:22px 18px}.quote-document-header{flex-direction:column;gap:15px}.quote-document-status{text-align:left;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.quote-document-status>span:nth-child(2),.quote-document-status p{margin:0}.quote-document-bottom>section:last-child{max-width:none}.quote-adjustment-grid{grid-template-columns:1fr;gap:14px}.quote-lines tr{padding:17px;gap:12px}.quote-lines input{padding:8px;font-size:13px}.quote-lines-footer{flex-direction:column;gap:11px}.quote-lines-footer>span{max-width:none;text-align:left}.quote-total-final dd{font-size:23px}.login-layout{padding:25px 18px}.login-form-panel{padding:25px}.confirmation-dialog .dialog-footer{flex-wrap:nowrap}.command-dialog{margin-top:8vh}.command-header{padding:12px 15px}.command-results{max-height:65dvh}
}
/* Read-only record preview preserves the current list underneath it. */
.record-dialog.record-workspace-dialog{position:fixed;inset:0 0 0 auto;width:min(880px,calc(100vw - 280px));max-width:none;height:100dvh;max-height:100dvh;margin:0;padding:0;overflow:hidden;border:0;border-left:1px solid var(--line);border-radius:0;box-shadow:-12px 0 48px rgb(24 32 48 / .11)}
.record-workspace-dialog::backdrop{background:rgb(23 29 44 / .12);backdrop-filter:none}
.record-workspace-dialog[open]{animation:workspace-drawer-enter var(--motion-fast) var(--ease)}
.record-workspace-dialog #dialog-content{display:flex;flex-direction:column;min-height:0;height:100%;overflow:hidden}
.record-workspace-dialog .dialog-heading{flex-shrink:0;padding:22px 24px 18px}
.record-workspace-dialog .dialog-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:20px 24px 24px}
.record-workspace-dialog .dialog-footer{flex-shrink:0;padding:14px 24px;background:#fff}
.record-workspace-dialog .detail-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 24px}
.record-workspace-dialog .crm-record-workspace{margin-top:20px;padding-top:18px}
.record-workspace-dialog .crm-contact-row{padding:11px 0}
.record-workspace-dialog .crm-related-grid{gap:20px;margin-top:20px}
.record-workspace-dialog .crm-related-row{padding:10px 0}
.record-workspace-dialog .detail-activities{padding-top:18px;margin-top:20px}
.record-workspace-dialog .record-tabs{position:sticky;top:0;z-index:2;min-height:44px;margin:0 0 20px;background:#fff;gap:20px}
.record-workspace-dialog .record-tab{min-height:44px;padding:12px 0 10px;font-size:13px;line-height:20px;white-space:nowrap}
.record-workspace-dialog [data-record-panel=related].crm-record-workspace,.record-workspace-dialog [data-record-panel=activity].detail-activities{margin-top:0;padding-top:0;border-top:0}
@keyframes workspace-drawer-enter{from{opacity:.7;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
@media(max-width:1024px){.record-dialog.record-workspace-dialog{inset:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;margin:0;border:0;border-radius:0}}
@media(max-width:767px){.record-workspace-dialog .dialog-heading{padding:18px 16px 15px}.record-workspace-dialog .dialog-body{padding:18px 16px 22px}.record-workspace-dialog .dialog-footer{padding:12px 16px}.record-workspace-dialog .detail-grid{gap:16px}.record-workspace-dialog .crm-related-grid{grid-template-columns:1fr}}
/* Operational workspace hierarchy: neutral surfaces, stronger glyphs and compact data bands. */
.ui-icon{display:inline-block;width:18px;height:18px;flex:none;vertical-align:middle;stroke-width:2.1}
.button>.ui-icon,.button .ui-icon{width:16px;height:16px}
.icon-button>.ui-icon{width:18px;height:18px}
.button .ui-icon+span{min-width:0}
.workspace-brand{margin-bottom:12px}
.workspace-nav{gap:0;padding:0 8px 12px}
.nav-section{display:flex;flex-direction:column;gap:2px;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #e2e6eb}
.nav-section-label{margin:0 0 5px;padding:0 12px;font-size:10px;line-height:18px;letter-spacing:.065em;font-weight:600;color:#687385}
.workspace-nav>a,.nav-section>a,.nav-group-items>a{position:relative;display:flex;align-items:center;gap:8px;min-height:36px;padding:6px 10px;font-size:13px;line-height:22px;font-weight:500;border:0;color:#4a5668;text-decoration:none;background:transparent}
.nav-icon{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;color:#4c586a}
.nav-icon>.ui-icon{width:20px;height:20px;color:inherit;stroke-width:2.1}
.nav-link-label{min-width:0;overflow-wrap:anywhere}
.workspace-nav>a:hover,.nav-section>a:hover,.nav-group-items>a:hover{background:#eceff3;color:#202b3b}
.workspace-nav>a[aria-current=page],.nav-section>a[aria-current=page],.nav-group-items>a[aria-current=page]{background:var(--button-purple-light);color:var(--button-purple-deep);font-weight:600;box-shadow:inset 3px 0 0 var(--button-purple-deep)}
[aria-current=page]>.nav-icon{color:var(--button-purple-deep)}
.nav-group{margin-top:0}
.nav-group-title{min-height:36px;padding:7px 12px;font-size:11px;line-height:20px;letter-spacing:.045em;font-weight:600;color:#687385}
.nav-group-arrow{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-left:auto;flex:none}
.nav-group-arrow .ui-icon{width:15px;height:15px;color:#687385;transition:transform var(--motion-fast) var(--ease)}
.nav-group[open]>.nav-group-title .nav-group-arrow .ui-icon{transform:rotate(90deg)}
.nav-group-title>svg{margin-left:auto}
.nav-group-items{gap:2px;margin-top:3px}
.nav-count{margin-left:auto;background:#e1e6ed;color:#475569;min-width:20px;font-size:11px;line-height:18px}
.sidebar-footer{padding-top:6px}
.sidebar-footer>a{padding:8px 6px;color:#586579}
.sidebar-external-icon{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px}
.sidebar-external-icon .ui-icon{width:15px;height:15px}
.signout-button{display:inline-flex;align-items:center;justify-content:center}
.signout-button .ui-icon{width:18px;height:18px}
.breadcrumbs{color:#697587}
.breadcrumbs strong{font-weight:600;color:#354052}
.search-trigger{border-color:#e3e7ed;background:#fafbfc;color:#5c687a}
.search-trigger:hover{border-color:#c8d0dc;background:#f3f5f8}
.search-trigger>.ui-icon{width:17px;height:17px;color:#526176}
.language-label select{font-weight:500}
#workspace-main{padding:28px 32px 32px;background:var(--canvas)}
.page-heading{align-items:center;gap:20px;margin-bottom:22px}
.page-heading h1{font-size:26px;line-height:34px;font-weight:650;letter-spacing:-.025em;overflow-wrap:anywhere}
.page-title-block{display:grid;grid-template-columns:34px minmax(0,1fr);column-gap:12px;align-items:center;min-width:0}
.page-title-block>.page-title-icon{grid-column:1;grid-row:1;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #dbe1e9;background:#fff;color:#3f4d61}
.page-title-icon>.ui-icon{width:22px;height:22px;stroke-width:2.1}
.page-title-block>h1{grid-column:2;grid-row:1;min-width:0}
.page-title-block>.page-description{grid-column:2;grid-row:2;margin-top:4px}
.page-title-block>.eyebrow{display:none}
.page-description{max-width:760px;font-size:13px;line-height:21px;color:#687487}
.heading-actions{gap:8px}
.heading-actions>.button{min-height:36px}
.button{border-color:#cfd6e0;font-weight:550;box-shadow:none}
.button:hover{border-color:#aeb9c8;background:#f4f6f9;color:#28364a}
.button-primary{border-color:var(--button-purple-deep);background:var(--button-purple-deep);color:#fff}
.button-primary:hover{border-color:#432770;background:#432770;color:#fff;box-shadow:none}
.button-subtle{border-color:transparent;background:transparent;color:#58667a}
.button-subtle:hover{border-color:#d9dfe8;background:#f0f3f7}
.button-danger{border-color:#e4c9cf;color:var(--danger)}
.button-danger:hover{border-color:#ce9ba6;background:#fff3f5;color:var(--danger)}
.metric-grid{gap:0;margin-bottom:20px;border:1px solid #dbe1e9;background:#fff;overflow:hidden}
.metric-card{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 36px;column-gap:12px;row-gap:4px;padding:16px 18px;border:0;border-right:1px solid #e1e5ec;background:#fff;min-width:0;text-decoration:none;transition:background-color var(--motion-fast) var(--ease)}
.metric-card:last-child{border-right:0}
a.metric-card:hover{background:#f8fafc;text-decoration:none}
a.metric-card:focus-visible{outline:2px solid var(--button-purple-deep);outline-offset:-3px;background:#faf8fe}
.metric-label{grid-column:1;grid-row:1;font-size:12px;line-height:18px;font-weight:500;color:#667386}
.metric-value{grid-column:1;grid-row:2;min-width:0;font-size:30px;line-height:36px;font-weight:650;letter-spacing:-.035em;margin:0;color:#263247;overflow-wrap:anywhere}
.metric-card[data-kpi] .metric-detail{grid-column:1/-1;grid-row:3;display:inline-flex;align-items:center;gap:5px;font-size:11px;line-height:16px;color:#718096}
.metric-card[data-kpi] .metric-detail .ui-icon{width:12px;height:12px}
.metric-icon{grid-column:2;grid-row:1/3;align-self:center;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;background:#eef1f5;color:#4c5b70;flex:none}
.metric-icon>.ui-icon{width:24px;height:24px;stroke-width:2.1}
[data-kpi=customers] .metric-icon{background:#edf3f8;color:#476780}
[data-kpi=pipeline] .metric-icon{background:#f1edf7;color:var(--button-purple-deep)}
[data-kpi=tasks] .metric-icon{background:#eef3f7;color:#46677e}
[data-kpi=inbox] .metric-icon{background:#eef5f1;color:#406f58}
.metric-alert .metric-icon{background:#fcf0ef;color:var(--danger)}
.metric-alert .metric-value{color:var(--danger)}
.panel,.data-panel,.wb-panel,.quote-section{border-color:#dbe1e9;background:#fff}
.panel-heading{min-height:52px;padding:14px 18px;border-bottom-color:#e2e7ee;background:#fff}
.panel-heading h2,.wb-panel .panel-heading h2{display:flex;align-items:center;gap:9px;font-size:15px;line-height:23px;font-weight:650;letter-spacing:-.015em;color:#2c394d}
.panel-heading p{font-size:12px;line-height:19px;margin-top:3px;color:#728095}
.panel-title-icon{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;color:#52657b}
.panel-title-icon>.ui-icon{width:19px;height:19px;stroke-width:2.1}
.panel-body,.wb-body{padding:20px}
.panel-heading .text-link{font-size:12px;font-weight:500}
.section-grid,.wb-grid{gap:18px;margin-bottom:18px}
.stage-summary{padding:22px 18px 18px;gap:14px}
.stage-bar-chart{height:5px}
.stage-track{fill:#e5e9f0}
.stage-fill{fill:var(--button-purple-deep)}
.stage-count{font-size:18px;line-height:26px;font-weight:600;color:#344259;margin-top:7px}
.stage-label{font-size:11px;line-height:17px;margin-top:3px;color:#66758a}
.pipeline-totals{gap:12px 20px;padding:12px 18px;background:#f7f9fb;color:#657287;font-size:11px}
.pipeline-totals>div{display:flex;align-items:baseline;gap:7px;min-width:0}
.pipeline-totals strong{font-size:14px;line-height:22px;color:#2d3a50;overflow-wrap:anywhere}
.list-stack{padding:0 18px}
.stack-item{min-height:66px;padding:13px 0;border-bottom-color:#edf0f5}
.activity-mark{width:30px;height:30px;border:1px solid #e4e9ef;background:#f4f6f9;color:#536980}
.activity-mark .ui-icon{width:18px;height:18px}
.stack-title,.stack-main .record-link{font-weight:550;color:#324056}
.stack-meta,.stack-end{font-size:12px;color:#6a788b}
.badge{gap:5px;min-height:22px;padding:2px 6px;font-size:11px;line-height:16px;border-color:#e2e7ee;font-weight:500}
.badge::before{content:"";display:inline-block;width:4px;height:4px;background:currentColor;flex:none}
table{font-size:14px;line-height:21px}
th{height:42px;padding:11px 16px;background:#f2f5f8;color:#5b6a7e;border-bottom-color:#dce3ec;font-size:12px;line-height:19px;font-weight:600}
td{height:50px;padding:12px 16px;border-bottom-color:#e9eef4;color:#425168;font-size:14px;line-height:21px}
tbody tr:hover td{background:#f6f8fb}
tbody tr:has(input[type=checkbox]:checked) td{background:#f5f2fb}
.cell-primary .record-link{font-weight:550;color:#2c3b52}
.cell-sub{font-size:12px;line-height:18px;color:#728094}
.cell-amount{font-weight:550;color:#2e3c51}
.cell-actions .icon-button{width:30px;height:30px;border-color:transparent;color:#62738a}
.cell-actions .icon-button:hover{background:#edf1f6;border-color:#d8e0eb;color:#2a3d59}
.table-action-group{display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-width:0}
.table-action-group>.button,.table-action-group>.icon-button{margin:0}
.table-footer{padding:12px 16px;border-top-color:#dfe5ed;background:#fcfdfe;color:#64748b}
.filter-toolbar{padding:12px;margin:0 0 16px;border:1px solid #dbe1e9;background:#fff;gap:8px}
.filter-toolbar .search-field{max-width:360px}
.filter-toolbar .result-count{font-size:12px;color:#69798f}
.filter-toolbar:has(+.filter-context){margin-bottom:0}
.filter-context{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-height:38px;padding:8px 12px;border:1px solid #dbe1e9;border-top:0;background:#f8fafc;font-size:12px;line-height:20px;color:#60738f}
.filter-context>.ui-icon{width:16px;height:16px;color:#617691}
.filter-context>strong{font-size:12px;font-weight:600;color:#425976}
.filter-context>.text-link{display:inline-flex;align-items:center;min-height:28px;margin-left:auto;font-size:12px;line-height:20px}
.filter-context+.data-panel{border-top:0}
.filter-context+.kanban{margin-top:16px}
.crm-viewbar{min-height:46px;margin:0;padding:0 12px;border:1px solid #dbe1e9;border-bottom:0;background:#fff;gap:12px}
.crm-viewbar+.filter-toolbar{min-height:60px;margin:0;padding:12px;border:1px solid #dbe1e9;border-bottom:0;background:#fafbfc}
.crm-viewbar~.data-panel{border-top-color:#e2e7ee}
.crm-viewtabs{gap:4px;align-self:stretch}
.crm-viewtabs>span{display:flex;gap:4px;align-items:stretch;flex-wrap:wrap}
.crm-viewtabs button{position:relative;min-height:44px;padding:10px;border:0;border-bottom:2px solid transparent;background:transparent;color:#66768c;font-size:12px;font-weight:550;white-space:nowrap}
.crm-viewtabs button:hover{background:#f6f8fb;color:#334766}
.crm-viewtabs button[aria-pressed=true]{border:0;border-bottom:2px solid var(--button-purple-deep);background:transparent;color:var(--button-purple-deep)}
.crm-list-actions{gap:6px}
.crm-viewbar .button{min-height:30px;padding:4px 8px;font-size:12px}
.crm-bulkbar,.wb-bulkbar{padding:10px 12px;margin:0 0 12px;background:#f4f0fa;border-color:#dfd5ed}
.crm-related-heading h3{font-size:14px;line-height:23px;font-weight:650;color:#34455f}
.crm-contact-row{padding:12px 0}
.crm-contact-row strong{font-weight:550;color:#33445b}
.crm-related-row span{font-weight:550;color:#34465e}
.wb-toolbar{gap:10px;padding:14px;margin:0 0 18px;border:1px solid #dbe1e9;background:#fff}
.wb-toolbar .form-field{min-width:140px;flex:1 1 140px}
.wb-toolbar .form-field>span,.wb-toolbar .form-field>label{font-size:12px;color:#66778e}
.wb-toolbar .button{flex-shrink:0}
.wb-kpis{border-color:#dbe1e9;margin-bottom:18px}
.wb-kpi{position:relative;min-width:0;padding:18px 20px;border-right-color:#e3e8ef}
.wb-kpi small{font-size:12px;line-height:19px;color:#66758a}
.wb-kpi strong{font-size:29px;line-height:36px;font-weight:650;letter-spacing:-.03em;color:#26344a}
.wb-kpi span:not(.wb-kpi-icon):not(.metric-icon){font-size:11px;line-height:18px;color:#758297}
.wb-kpi:has(.wb-kpi-icon),.wb-kpi:has(.metric-icon){padding-right:20px}
.wb-kpi:has(.wb-kpi-icon)>small,.wb-kpi:has(.wb-kpi-icon)>strong,.wb-kpi:has(.metric-icon)>small,.wb-kpi:has(.metric-icon)>strong{padding-right:42px}
.wb-kpi-icon,.wb-kpi>.metric-icon{position:absolute;right:18px;top:20px;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:#eff3f7;color:#526b85}
.wb-kpi-icon>.ui-icon,.wb-kpi>.metric-icon>.ui-icon{width:22px;height:22px}
.currency-breakdown{margin-top:9px;padding-top:8px;border-top:1px solid #e7ecf3}
.currency-breakdown>summary{display:flex;align-items:center;gap:7px;min-height:28px;list-style:none;cursor:pointer;font-size:12px;line-height:20px;font-weight:500;color:#667b96}
.currency-breakdown>summary::-webkit-details-marker{display:none}
.currency-breakdown>summary::before{content:"";display:inline-block;width:5px;height:5px;border-top:1.5px solid currentColor;border-right:1.5px solid currentColor;transform:rotate(45deg);transition:transform var(--motion-fast) var(--ease)}
.currency-breakdown[open]>summary::before{transform:rotate(135deg)}
.currency-stack{max-width:100%;margin:8px 0 0;padding:0;overflow-x:auto;scrollbar-width:thin}
.currency-stack>div{display:grid;grid-template-columns:32px minmax(max-content,1fr);gap:10px;align-items:baseline;min-height:25px;padding:3px 0}
.currency-stack dt{margin:0;font-size:11px;line-height:19px;font-weight:500;color:#71829a;font-family:var(--font-mono)}
.currency-stack dd{margin:0;font-size:13px;line-height:19px;font-weight:550;color:#344a68;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}
.wb-chart-legend{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 18px 4px;font-size:12px;line-height:20px;color:#5b6d86}
.wb-chart-key{display:inline-flex;align-items:center;gap:8px;font-weight:500;color:#40516c}
.wb-chart-key::before{content:"";width:18px;height:3px;display:inline-block;background:var(--button-purple-deep)}
.wb-chart-scope{font-size:11px;line-height:18px;color:#728198}
.wb-chart-scroll{max-width:100%;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin}
.wb-trend{width:100%;height:260px;display:block}
.wb-trend-axis{stroke:#e2e8f0;stroke-width:1;stroke-dasharray:3 4}
.wb-trend-line{stroke:var(--button-purple-deep);stroke-width:2.6;fill:none}
.wb-trend-dot{fill:#fff;stroke:var(--button-purple-deep);stroke-width:2}
.wb-trend-tick{font-family:var(--font-ui);font-size:14px;font-weight:400;fill:#718097}
.wb-trend-labels{font-size:11px;color:#728197}
@media(max-width:1100px){.workspace-body[data-workspace-tab=analytics] .wb-grid{grid-template-columns:minmax(0,1fr)}.workspace-body[data-workspace-tab=analytics] .wb-chart-scroll{min-width:0;max-width:100%;overflow-x:auto}.workspace-body[data-workspace-tab=analytics] .wb-trend{width:100%;min-width:640px}}
.wb-ranking{padding:2px 18px 14px}
.wb-ranking-row{display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #edf1f6}
.wb-ranking-row:last-child{border-bottom:0}
.wb-ranking-index{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex:none;border:1px solid #dfe6ef;background:#f6f8fb;color:#63768f;font-size:11px;font-weight:600}
.wb-ranking-main{flex:1;min-width:0}
.wb-ranking-label{display:flex;justify-content:space-between;align-items:baseline;gap:14px;font-size:13px;line-height:21px;color:#4e607a}
.wb-ranking-label>span{min-width:0;overflow-wrap:anywhere}
.wb-ranking-label strong{font-size:13px;font-weight:600;color:#364a65;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;text-align:right}
.wb-ranking-bar{display:block;width:100%;height:4px;margin-top:9px}
.wb-ranking-track{fill:#edf1f6}
.wb-ranking-fill{fill:#7289a5}
.wb-stepbar{margin-bottom:18px;border:1px solid #dbe1e9;background:#fff}
.wb-stepbar li{font-size:12px;font-weight:500}
.wb-stepbar .is-current{background:#faf8fd}
.wb-import-file{padding:22px;border-color:#c5cfdd;background:#fafcfe}
.wb-properties{padding:20px;gap:20px 24px}
.wb-properties dt{font-size:12px;line-height:19px;color:#6c7a8e}
.wb-properties dd{font-weight:550;color:#384a64}
.settings-section{margin-bottom:18px;padding:22px;border-color:#dbe1e9}
.settings-grid.settings-section{grid-template-columns:minmax(180px,1fr) minmax(0,2fr);gap:28px}
.settings-section .table-wrap table{min-width:520px}
.settings-section th:nth-child(2),.settings-section td:nth-child(2){white-space:nowrap}
.settings-section h2{font-size:16px;color:#2d3e58}
.settings-description{color:#697b91}
.wb-body[data-ai-form=models]{max-width:1020px}
.wb-chat{grid-template-columns:230px minmax(0,1fr);gap:18px}
.wb-chat-main{border-color:#dbe1e9}
.wb-chat-messages{padding:26px;min-height:350px}
.wb-chat-form{padding:18px 20px;background:#f8fafc;border-top-color:#dfe6ef}
.wb-chat-form textarea{min-height:88px;border-color:#cbd5e1;background:#fff}
.wb-chat-controls{gap:14px}
.wb-list-item{padding:13px 16px;border-bottom-color:#e8edf4;color:#40546f}
.wb-list-item strong{font-size:13px;font-weight:550}
.wb-list-item:hover,.wb-list-item[aria-current=true]{background:#f6f3fb;border-left-color:var(--button-purple-deep)}
.wb-report{padding:32px 36px;border-color:#dbe1e9}
.dialog-heading{padding:20px 24px 17px;border-bottom-color:#dfe6ef;background:#fff}
.dialog-heading h2{font-size:20px;line-height:29px;font-weight:650;color:#2b3b54}
.dialog-footer{padding:13px 24px;background:#f8fafc;border-top-color:#dfe6ef}
.record-workspace-dialog .detail-grid{gap:0;border:1px solid #e0e6ef;background:#fff}
.record-workspace-dialog .detail-grid>div{min-width:0;padding:13px 15px;border-bottom:1px solid #e8edf4}
.record-workspace-dialog .detail-grid>div:nth-child(odd){border-right:1px solid #e8edf4}
.record-workspace-dialog .detail-grid>div:last-child{border-bottom:0}
.record-workspace-dialog .detail-grid dt{font-size:11px;line-height:18px;color:#738196;margin-bottom:4px}
.record-workspace-dialog .detail-grid dd{font-size:14px;line-height:22px;font-weight:550;color:#344763}
.record-workspace-dialog .record-tabs{gap:22px;min-height:44px;margin-bottom:18px;border-bottom-color:#dfe5ed;background:#fff}
.record-workspace-dialog .record-tab{font-size:13px;line-height:21px;font-weight:550}
.quote-editor-layout{gap:20px}
.quote-editor-summary .panel-heading{padding:14px 18px}
.quote-total-list{padding:18px}
.quote-total-final dd{font-size:26px;line-height:34px;font-weight:650}
.quote-document{border-color:#dbe1e9}
.quote-document-header h2{color:#2b3c56;font-weight:650}
.quote-contact-column>h2{display:flex;align-items:center;gap:8px;color:#3a4e6b}
.workspace-notification-trigger>.ui-icon{width:19px;height:19px;color:#596c85}
.workspace-notification-header{background:#fff;border-bottom-color:#dfe6ef}
.workspace-notification-link{font-size:14px;line-height:22px;font-weight:550;color:#334a69}
.workspace-notification-item{border-bottom-color:#e8edf4}
.workspace-notification-kind{font-size:10px;font-weight:600}
@media(max-width:1300px){.metric-card{padding:18px}.wb-kpi{padding:18px}}
@media(max-width:1024px){#workspace-main{padding:24px}.nav-section>a,.nav-group-items>a{min-height:44px;padding:10px}.nav-group-title{min-height:44px}.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.metric-card{border-bottom:1px solid #e1e5ec}.metric-card:nth-child(3n){border-right:0}.metric-card:nth-last-child(-n+2){border-bottom:0}.page-heading h1{font-size:25px;line-height:34px}}
@media(max-width:767px){#workspace-main{padding:20px 16px 24px}.page-heading{gap:16px;margin-bottom:18px}.page-heading h1{font-size:23px;line-height:31px}.page-title-block{grid-template-columns:30px minmax(0,1fr);column-gap:10px}.page-title-block>.page-title-icon{width:30px;height:30px}.page-title-icon>.ui-icon{width:20px;height:20px}.page-title-block>.page-description{grid-column:1/-1;grid-row:2;font-size:12px;line-height:20px;margin-top:7px}.heading-actions{gap:7px}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:16px}.metric-card{padding:16px 14px;grid-template-columns:minmax(0,1fr) 28px;column-gap:8px;border-right:1px solid #e1e5ec;border-bottom:1px solid #e1e5ec}.metric-card:nth-child(3n){border-right:1px solid #e1e5ec}.metric-card:nth-child(2n),.metric-card:last-child{border-right:0}.metric-card:nth-last-child(-n+2){border-bottom:1px solid #e1e5ec}.metric-card:last-child{border-bottom:0;grid-column:1/-1}.metric-label{font-size:11px;line-height:17px}.metric-value{font-size:27px;line-height:34px}.metric-icon{width:28px;height:28px}.metric-icon>.ui-icon{width:20px;height:20px}.panel-heading{padding:13px 16px}.panel-heading h2,.wb-panel .panel-heading h2{font-size:14px;line-height:22px}.panel-heading p{font-size:11px;line-height:18px}.stage-summary{padding:18px 16px;gap:8px}.stage-count{font-size:16px}.stage-label{font-size:10px;line-height:16px}.pipeline-totals{padding:12px 16px;gap:10px 16px}.panel-body,.wb-body{padding:18px}.crm-viewbar{padding:6px 10px;gap:8px}.crm-viewtabs{max-width:100%;overflow-x:auto;flex-wrap:nowrap}.crm-viewtabs>span{flex-wrap:nowrap}.crm-list-actions{width:100%;flex-wrap:wrap;gap:6px}.crm-viewbar+.filter-toolbar{padding:10px}.filter-toolbar{padding:10px}.wb-toolbar{padding:12px;gap:10px}.wb-toolbar .form-field{flex:1 1 130px;min-width:0}.wb-kpi{padding:16px 18px}.wb-kpi strong{font-size:27px;line-height:35px}.wb-kpi-icon,.wb-kpi>.metric-icon{right:16px;top:18px}.wb-trend{min-width:640px;height:220px}.wb-chart-legend{padding:12px 16px 3px}.wb-ranking{padding:0 16px 12px}.wb-ranking-label{font-size:12px;gap:10px}.wb-chat{display:flex;flex-direction:column;gap:16px}.wb-chat-messages{padding:20px;min-height:300px}.wb-chat-form{padding:16px}.settings-section{padding:18px}.record-workspace-dialog .dialog-heading{padding:18px 16px 15px}.record-workspace-dialog .dialog-footer{padding:12px 16px}.record-workspace-dialog .detail-grid>div{padding:12px}.quote-editor-actions{gap:7px}.quote-total-final dd{font-size:24px;line-height:32px}.table-action-group{gap:6px}}
@media(pointer:coarse),(max-width:767px){.button,.button-small,.heading-actions>.button,.crm-viewbar .button,.crm-related-heading .button,.crm-contact-row .button,.quote-filter-context .button{min-height:44px}.icon-button,.cell-actions .icon-button,.quote-line-remove .icon-button,.signout-button,.pagination .button{min-width:44px;width:44px;height:44px;min-height:44px;padding:10px}.button>.ui-icon,.button .ui-icon{width:18px;height:18px}.search-trigger,.workspace-notification-trigger{min-width:44px;min-height:44px}.nav-section>a,.nav-group-items>a,.nav-group-title{min-height:44px}.crm-viewtabs button,.record-workspace-dialog .record-tab{min-height:44px}.table-action-group>.button,.table-action-group>.icon-button{margin:0}.table-footer{gap:10px;flex-wrap:wrap}.quote-line-remove .icon-button{font-size:18px}.dialog-footer{gap:8px;flex-wrap:wrap}.wb-chat-controls .button{min-height:44px}}
.stage-summary{display:grid;grid-template-columns:minmax(0,1fr);gap:0;padding:10px 18px}
.stage-summary>div{display:grid;grid-template-columns:110px minmax(0,1fr) 30px;align-items:center;gap:12px;min-height:38px}
.stage-summary .stage-label{margin:0;font-size:12px;line-height:20px;font-weight:500;color:#61728b}
.stage-summary .stage-bar{width:100%;height:8px;min-width:0}
.stage-summary .stage-bar-chart{height:8px}
.stage-summary .stage-count{margin:0;font-size:13px;line-height:20px;font-weight:600;text-align:right;color:#3d506c}
.stage-summary [data-stage=won] .stage-fill{fill:#4d876a}
.stage-summary [data-stage=lost] .stage-fill{fill:#a9b4c4}
@media(min-width:768px) and (max-width:1300px){.metric-grid{grid-template-columns:repeat(6,minmax(0,1fr))}.metric-card{grid-column:span 2;border-bottom:1px solid #e1e5ec}.metric-card:nth-child(3){border-right:0}.metric-card:nth-last-child(-n+2){grid-column:span 3;border-bottom:0}.metric-card:last-child{border-right:0}}
@media(max-width:1200px){.settings-grid.settings-section{grid-template-columns:minmax(0,1fr);gap:18px}}
@media(max-width:767px){.metric-card{grid-column:auto}.metric-card:last-child{grid-column:1/-1}.stage-summary{padding:8px 16px}.stage-summary>div{grid-template-columns:88px minmax(0,1fr) 24px;gap:10px;min-height:36px}.stage-summary .stage-label{font-size:11px;line-height:18px}.stage-summary .stage-count{font-size:12px;line-height:18px}.filter-context>.text-link{min-height:44px}}
@media(max-width:1024px){.workspace-test-switch{min-height:44px}}
@media(pointer:coarse){.workspace-test-switch,.language-label select{min-height:44px}.currency-breakdown>summary,.filter-context>.text-link{min-height:44px}}
@media(max-width:767px){.workspace-test-switch{width:44px;height:44px;min-width:44px;padding:4px 2px;flex-direction:column;gap:1px}.workspace-test-switch .test-mode-glyph,.workspace-test-switch .test-mode-label{display:none}.test-mode-compact{display:block;font-size:10px;line-height:14px;font-weight:600;letter-spacing:.015em}.workspace-mode-indicator{min-height:12px;padding:0 2px;font-size:8px;line-height:11px;letter-spacing:0}}
@media(max-width:480px){.topbar .breadcrumbs{display:none}.topbar-actions{min-width:0}}
/* Keep the light framework with strictly square controls and compact right-side search. */
.text-link{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.text-link>.ui-icon{flex-shrink:0}
@media(max-width:767px){.workspace-test-switch:lang(zh-CN) .workspace-mode-indicator{display:none}}
.workspace-body,.login-body,.workspace-body *,.login-body *,
.workspace-body *::before,.workspace-body *::after,.login-body *::before,.login-body *::after,
.workspace-body dialog::backdrop,.login-body dialog::backdrop{border-radius:0!important}
.workspace-body *::-webkit-scrollbar-thumb,.login-body *::-webkit-scrollbar-thumb,
.workspace-body ::file-selector-button,.login-body ::file-selector-button{border-radius:0!important}
.workspace-body svg rect,.login-body svg rect{rx:0!important;ry:0!important}
.workspace-body svg,.login-body svg{stroke-linecap:square;stroke-linejoin:miter}
.workspace-body svg [stroke-linecap],.login-body svg [stroke-linecap]{stroke-linecap:square}
.workspace-body svg [stroke-linejoin],.login-body svg [stroke-linejoin]{stroke-linejoin:miter}
@keyframes workspace-search-enter{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:767px){.command-dialog{inset:64px 16px auto auto;margin:0;width:calc(100vw - 32px);height:auto;max-height:var(--command-max-height)}.command-results{max-height:calc(var(--command-max-height) - 108px)}.command-footer{padding:10px 14px}}
.demo-print-mode{max-width:1100px;margin:0 auto;padding:32px;background:#fff}
.quote-total-list>div{flex-wrap:wrap}
.quote-total-list dd{min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere;text-align:right;margin-left:auto}
.demo-print-notice{display:block;margin-bottom:20px;padding:10px 0;border-bottom:2px solid var(--button-purple-deep);font:600 12px/20px var(--font-ui);color:var(--button-purple-deep)}
@media print{
 .demo-print-mode{max-width:none;padding:0}
 body{font-family:var(--font-ui);background:#fff}.wb-report{max-width:none;border:0;border-radius:0;padding:0;box-shadow:none}.wb-report h1{font-size:22px}.wb-report h2{break-after:avoid}.wb-report p{font-size:11px;line-height:1.65}.workspace-content{margin:0;border:0;border-radius:0;min-height:0;overflow:visible}#workspace-main{padding:0}.workspace-footer{display:none}
}
@media(prefers-reduced-motion:reduce){
 *,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}

/* Two-level workspace navigation: industrial rail beside a separate white panel. */
.sidebar{background:#171b24;color:#c1c8d4;border-right:1px solid #252b37}
.sidebar .nav-section{border-color:#303744}
.sidebar .nav-section-label{color:#8e98aa;border-color:#303744;font-size:10px;font-weight:500;letter-spacing:.035em}
.sidebar .nav-section>a,.sidebar .nav-group-items>a{min-height:40px;color:#c4cbd6;font-weight:450;padding:9px 12px}
.sidebar .nav-section>a:hover,.sidebar .nav-group-items>a:hover,.sidebar .nav-group-title:hover{background:#262d39;color:#fff}
.sidebar .nav-section>a[aria-current=page],.sidebar .nav-group-items>a[aria-current=page]{background:#343b49;color:#fff;font-weight:600;box-shadow:none}
.sidebar .nav-icon .ui-icon,.sidebar .workspace-nav svg,.sidebar .nav-group-arrow .ui-icon{color:#b9c2d1;stroke-width:1.8}
.sidebar [aria-current=page] .ui-icon{color:#fff}
.sidebar .nav-group-title{color:#a7b1c0;font-size:11px;font-weight:500}
.nav-group-icon{display:none}
.sidebar .sidebar-footer{border-color:#303744}
.sidebar .sidebar-footer>a,.sidebar .signout-button{color:#aab5c6}
.sidebar .sidebar-footer>a:hover,.sidebar .signout-button:hover{color:#fff}
.sidebar .sidebar-identity strong{color:#e6eaf0}
.sidebar .sidebar-identity #sidebar-role{color:#9da8b8}
.sidebar .identity-avatar{background:#303846;color:#e3e8f0}
.sidebar :focus-visible{outline-color:var(--button-purple-light)}
.workspace-brand .workspace-brand-mark{display:none}
.nav-submenu-arrow{display:none}
.navigation-preview{display:none}
.navigation-preview[hidden]{display:none!important}
@media(min-width:1025px){
 .app-layout{--side-width:60px}
 .app-layout .sidebar{width:240px;z-index:50;box-shadow:6px 0 20px rgb(18 25 38 / .13)}
 .app-layout[data-primary-compact=true] .sidebar{width:60px;box-shadow:none}
 .sidebar .workspace-brand{flex:none;width:calc(100% - 16px);height:48px;min-height:48px;max-height:48px;margin:4px 8px;padding:8px 12px;justify-content:center;background:#fff;visibility:visible;overflow:hidden}
 .sidebar .workspace-brand .workspace-brand-full{display:block;width:184px;max-width:100%;height:auto;flex:none}
 .sidebar .workspace-brand .workspace-brand-mark{display:none;width:32px;max-width:32px;height:auto;flex:none}
 .app-layout[data-primary-compact=true] .workspace-brand{width:44px;padding:8px 6px;visibility:visible}
 .app-layout[data-primary-compact=true] .workspace-brand .workspace-brand-full{display:none}
 .app-layout[data-primary-compact=true] .workspace-brand .workspace-brand-mark{display:block}
 .sidebar .workspace-nav{flex:1 1 auto;min-height:0;padding:8px;gap:2px;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;scrollbar-color:transparent transparent;overscroll-behavior:contain}
 .sidebar .nav-section{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;border:0}
 .sidebar .nav-section-label{display:none}
 .sidebar .nav-section>a,.sidebar .nav-group-items>a{position:relative;display:flex;align-items:center;justify-content:flex-start;gap:10px;width:100%;height:36px;min-height:36px;max-height:36px;padding:6px 10px;font-size:13px;line-height:20px;font-weight:450;overflow:hidden}
 .sidebar .nav-link-label,.sidebar .nav-group-title>[data-i18n],.sidebar .sidebar-footer>a>[data-i18n]{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .sidebar .nav-icon,.sidebar .nav-group-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin:0}
 .sidebar .nav-icon>.ui-icon,.sidebar .nav-group-icon>.ui-icon{width:20px;height:20px;margin:0;stroke-width:1.7;transform:none}
 .sidebar .nav-section>a[aria-current=page],.sidebar .nav-group-items>a[aria-current=page],.sidebar .nav-group-title[data-current-group=true]{background:#343c49;color:#fff;font-weight:600;box-shadow:none}
 .sidebar .workspace-nav a[data-nav-preview=true],.sidebar .nav-group-title[data-nav-preview=true]{background:#2b3340;color:#fff}
 .sidebar .workspace-nav a[data-nav-preview=true] .ui-icon,.sidebar .nav-group-title[data-nav-preview=true] .ui-icon,.sidebar .nav-group-title[data-current-group=true] .ui-icon{color:#fff}
 .sidebar .nav-group{margin:8px 0 0;padding:8px 0 0;border:0;border-top:1px solid rgb(185 194 209 / .12)}
 .sidebar .nav-group-title{position:relative;justify-content:flex-start;gap:10px;height:36px;min-height:36px;max-height:36px;padding:6px 10px;font-size:13px;line-height:20px;font-weight:450;letter-spacing:normal;overflow:hidden}
 .sidebar .nav-group-items{gap:2px;margin-top:2px}
 .sidebar .nav-group-arrow{width:16px;height:20px;margin-left:auto}
 .sidebar .nav-group-arrow .ui-icon{width:14px;height:14px;margin:0;stroke-width:1.7}
 .app-layout[data-primary-compact=false] .sidebar a[data-nav-has-children=true]>.nav-submenu-arrow{display:inline-flex;align-items:center;justify-content:center;flex:none;width:14px;height:20px;margin-left:auto}
 .sidebar .nav-submenu-arrow>.ui-icon{width:14px;height:14px;margin:0;stroke-width:1.7}
 .sidebar .nav-section>a>.nav-count,.sidebar .nav-group-items>a>.nav-count{margin-left:auto}
 .app-layout[data-primary-compact=false] .sidebar a[data-nav-has-children=true]>.nav-count:not([hidden])+.nav-submenu-arrow{margin-left:6px}
 .sidebar .sidebar-footer{flex:none;margin-top:auto;padding:6px 8px 8px;border-top:1px solid rgb(185 194 209 / .12)}
 .sidebar .sidebar-footer>a{display:flex;align-items:center;justify-content:flex-start;gap:10px;height:36px;min-height:36px;max-height:36px;padding:6px 10px;font-size:12px;line-height:20px;overflow:hidden}
 .sidebar .sidebar-footer>a>.sidebar-external-icon{display:inline-flex;align-items:center;justify-content:center;order:-1;flex:none;width:24px;height:24px}
 .sidebar .sidebar-external-icon>.ui-icon{width:20px;height:20px;margin:0;stroke-width:1.7}
 .sidebar .sidebar-identity{display:flex;align-items:center;gap:0;height:36px;min-height:36px;max-height:36px;padding:0;overflow:hidden}
 .sidebar .sidebar-identity .identity-avatar{display:none}
 .sidebar .sidebar-identity>div{flex:1;min-width:0;overflow:hidden}
 .sidebar .sidebar-identity strong{font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .sidebar .sidebar-identity #sidebar-role{display:block;font-size:10px;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .sidebar .sidebar-identity form{order:-1;flex:none;width:44px;margin:0}
 .sidebar .signout-button{display:inline-flex;align-items:center;justify-content:center;width:44px;min-width:44px;height:36px;min-height:36px;padding:6px 10px}
 .sidebar .signout-button>.ui-icon{width:20px;height:20px;stroke-width:1.7}
 .app-layout[data-primary-compact=true] .nav-link-label,.app-layout[data-primary-compact=true] .nav-group-title>[data-i18n],.app-layout[data-primary-compact=true] .sidebar-footer>a>[data-i18n],.app-layout[data-primary-compact=true] .sidebar-identity>div{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
 .app-layout[data-primary-compact=true] .nav-section>a,.app-layout[data-primary-compact=true] .nav-group-items>a,.app-layout[data-primary-compact=true] .nav-group-title{gap:0}
 .app-layout[data-primary-compact=true] .nav-count{position:absolute;right:0;top:0;padding:0 2px;min-width:12px;font-size:9px;line-height:13px;background:#4e5769;color:#fff}
 .app-layout[data-primary-compact=true] .nav-group-arrow{display:none}
 .sidebar .workspace-nav::-webkit-scrollbar{width:3px;background:transparent}
 .sidebar .workspace-nav::-webkit-scrollbar-track{background:transparent}
 .sidebar .workspace-nav::-webkit-scrollbar-thumb{background:transparent;border:0;border-radius:0}
 .sidebar:hover .workspace-nav,.sidebar:focus-within .workspace-nav{scrollbar-color:#4d596a transparent}
 .sidebar:hover .workspace-nav::-webkit-scrollbar-thumb,.sidebar:focus-within .workspace-nav::-webkit-scrollbar-thumb{background:#4d596a}
 .navigation-preview:not([hidden]){display:flex;flex-direction:column}
 .navigation-preview{position:fixed;left:240px;top:56px;bottom:0;width:208px;max-width:calc(100vw - 240px);min-width:0;min-height:0;background:#fff;color:var(--ink);border:0;border-right:1px solid var(--line);border-radius:0;box-shadow:8px 0 24px rgb(18 25 38 / .10);z-index:45;overflow:hidden}
 .navigation-preview-heading{flex:none;padding:20px 18px 16px;border-bottom:1px solid var(--line)}
 .navigation-preview-heading h2,.navigation-preview>h2{font-size:18px;font-weight:600;line-height:26px;letter-spacing:-.025em;margin:0;color:var(--ink)}
 .navigation-preview>h2{padding:20px 18px 16px;border-bottom:1px solid var(--line)}
 .navigation-preview-scroll,.navigation-preview>nav{flex:1;min-width:0;min-height:0;padding:12px 8px 16px;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:transparent transparent}
 .navigation-preview-group{margin:0 0 18px}
 .navigation-preview-group:last-child{margin-bottom:0}
 .navigation-preview h3{font-size:12px;font-weight:500;line-height:20px;letter-spacing:normal;text-transform:none;color:#6d7683;margin:0 0 5px;padding:0 10px}
 .navigation-preview a{display:flex;align-items:center;min-width:0;height:36px;min-height:36px;padding:8px 10px;border:0;border-radius:0;font-size:14px;line-height:20px;font-weight:450;color:#424c5b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}
 .navigation-preview a>span{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
 .navigation-preview a:hover{background:#f6f7f9;color:var(--ink)}
 .navigation-preview a[aria-current=page],.navigation-preview a[data-active=true]{background:#f1f2f4;color:#222b39;font-weight:650}
 .navigation-preview :focus-visible{outline:2px solid var(--button-purple-deep);outline-offset:-2px;border-radius:0}
 .navigation-preview-scroll::-webkit-scrollbar,.navigation-preview>nav::-webkit-scrollbar{width:3px;background:transparent}
 .navigation-preview-scroll::-webkit-scrollbar-track,.navigation-preview>nav::-webkit-scrollbar-track{background:transparent}
 .navigation-preview-scroll::-webkit-scrollbar-thumb,.navigation-preview>nav::-webkit-scrollbar-thumb{background:transparent;border:0;border-radius:0}
 .navigation-preview:hover .navigation-preview-scroll,.navigation-preview:focus-within .navigation-preview-scroll,.navigation-preview:hover>nav,.navigation-preview:focus-within>nav{scrollbar-color:#a3acb8 transparent}
 .navigation-preview:hover .navigation-preview-scroll::-webkit-scrollbar-thumb,.navigation-preview:focus-within .navigation-preview-scroll::-webkit-scrollbar-thumb,.navigation-preview:hover>nav::-webkit-scrollbar-thumb,.navigation-preview:focus-within>nav::-webkit-scrollbar-thumb{background:#a3acb8}
}

.app-layout[data-secondary-navigation=true] .workspace-content{margin:0;border:0}
.app-layout[data-secondary-navigation=true] #workspace-main{padding:0;max-width:none;margin:0;width:100%}
@media(min-width:1101px){.app-layout[data-secondary-navigation=true] .workspace-footer{padding-left:256px}}
@media(max-width:1024px){.navigation-preview{display:none!important}.sidebar .nav-section>a,.sidebar .nav-group-items>a{min-height:44px}}
@media(prefers-reduced-motion:no-preference) and (min-width:1025px){.sidebar{transition:width 180ms var(--ease),box-shadow 180ms var(--ease)}}
@media(max-width:1024px){.sidebar .workspace-nav{scrollbar-width:auto}.sidebar .workspace-nav::-webkit-scrollbar{width:5px}.sidebar .workspace-nav::-webkit-scrollbar-track{background:#171b24}.sidebar .workspace-nav::-webkit-scrollbar-thumb{background:#535e70;border:0;border-radius:0}}
@media(pointer:coarse){.sidebar .nav-section>a,.sidebar .nav-group-items>a,.sidebar .nav-group-title,.sidebar .sidebar-footer>a,.sidebar .signout-button{min-height:44px}}
@media(pointer:coarse) and (min-width:1025px){.sidebar .nav-section>a,.sidebar .nav-group-items>a,.sidebar .nav-group-title{height:44px;max-height:44px}.sidebar .sidebar-footer>a,.sidebar .sidebar-identity,.sidebar .signout-button{height:44px;min-height:44px;max-height:44px}.navigation-preview a{height:44px;min-height:44px}}

/* Workspace detail pass: clear actions, denser records, and an always-reachable composer. */
.task-completion-action{display:inline-flex;align-items:center;justify-content:center;gap:5px;width:auto;height:28px;min-width:76px;border:1px solid transparent;background:transparent;color:#697689;vertical-align:middle;margin-right:8px;padding:4px 7px}.task-completion-label{font-size:11px;line-height:18px;white-space:nowrap}
.task-completion-action .ui-icon{width:16px;height:16px;stroke-width:1.8}
.task-completion-action:hover,.task-completion-action:focus-visible{background:var(--button-purple-light);border-color:var(--button-purple-deep);color:var(--button-purple-deep)}
.task-completion-action:disabled{cursor:wait;opacity:.55}
.crm-batch-select{accent-color:var(--button-purple-deep)}
.pipeline-scope-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--line);border-bottom:0;background:#fff;font-size:12px;line-height:18px}
.pipeline-scope-summary strong{font-weight:550}.pipeline-scope-summary span{color:var(--muted)}
.kanban-count{color:var(--muted);font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap;letter-spacing:0;font-weight:500}
.activity-type-label,.filter-order-hint{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.activity-type-label .ui-icon{width:16px;height:16px;stroke-width:1.7;color:#758092}
.activity-date{font-variant-numeric:tabular-nums;white-space:nowrap}
.filter-order-hint{font-size:11px;line-height:18px;color:var(--muted);margin-left:auto}.filter-order-hint .ui-icon{width:13px;height:13px}
.intake-message-preview{display:flex;flex-direction:column;gap:3px;max-width:420px;min-width:220px;margin-top:5px;line-height:17px;white-space:normal;overflow:visible}
.intake-message-preview .intake-subject{font-weight:500;font-size:12px;color:#485365;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.intake-message-preview>span{font-size:12px;color:var(--muted);white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.quote-list-table th:nth-child(5),.quote-list-table td:nth-child(5){text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.quote-list-table td:nth-child(4){font:12px/20px var(--font-mono);color:#566274;letter-spacing:.02em}
.admin-event-label{display:block;font-weight:500}.admin-event-code{display:block;margin-top:4px;font:11px/16px var(--font-mono);color:var(--muted)}
.knowledge-source-label{display:inline-block;max-width:280px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;vertical-align:middle;color:var(--muted)}
.ops-filter-error{flex:0 0 100%;width:100%;padding:10px 12px;border-left:2px solid var(--danger);background:#fff7f8;color:var(--danger);font-size:12px;line-height:18px}.ops-filter-error[hidden]{display:none}
.agent-conversation-picker{display:none}
.agent-starters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:22px;text-align:left;max-width:780px;width:100%}
.agent-starter{display:flex;align-items:center;gap:10px;min-height:56px;padding:12px;border:1px solid var(--line);background:#fff;font-size:12px;line-height:18px;color:#4a5567;text-align:left}
.agent-starter>span{flex:1}.agent-starter>.ui-icon{width:17px;height:17px;stroke-width:1.7;flex:none}.agent-starter>.ui-icon:last-child{width:14px;height:14px;color:#8a94a3}
.agent-starter:hover,.agent-starter:focus-visible{border-color:#b9c1ce;background:#f8f9fb;color:var(--ink)}
@media(min-width:1025px){
 #workspace-main{padding-top:28px}.page-heading{margin-bottom:20px}
 #workspace-page[data-view-kind=list]>.page-heading .page-description,#workspace-page[data-view-kind=board]>.page-heading .page-description{display:none}
 #workspace-page[data-view-kind=list]>.page-heading,#workspace-page[data-view-kind=board]>.page-heading{align-items:center;margin-bottom:18px}
 .crm-viewbar{min-height:40px;padding-top:2px;padding-bottom:2px}.crm-viewtabs button{min-height:36px}
 #workspace-page[data-view-kind=list]>.filter-toolbar,#workspace-page[data-view-kind=board]>.filter-toolbar{padding-top:10px;padding-bottom:10px}
 .data-panel td{padding-top:11px;padding-bottom:11px}.cell-sub{margin-top:2px;line-height:17px}
 body[data-workspace-tab=agent] .workspace-content{height:calc(100dvh - 16px);min-height:0}
 body[data-workspace-tab=agent] #workspace-main{display:flex;flex-direction:column;min-height:0;overflow:hidden;padding-top:24px;padding-bottom:20px}
 body[data-workspace-tab=agent] #workspace-page{display:flex;flex:1;flex-direction:column;min-height:0}
 body[data-workspace-tab=agent] .page-heading{flex:none;margin-bottom:20px}
 body[data-workspace-tab=agent] .workspace-footer{flex:none}
 body[data-workspace-tab=agent] .wb-chat{flex:1;min-height:0;align-items:stretch}
 body[data-workspace-tab=agent] .wb-chat>section.data-panel{display:flex;flex-direction:column;min-height:0;margin:0;overflow:hidden}
 body[data-workspace-tab=agent] .wb-chat .panel-heading{flex:none}
 body[data-workspace-tab=agent] .wb-chat .wb-list{flex:1;min-height:0;max-height:none;overflow-y:auto}
 body[data-workspace-tab=agent] .wb-chat-main{display:flex;flex-direction:column;min-height:0;overflow:hidden}
 body[data-workspace-tab=agent] .wb-chat-messages{flex:1;min-height:100px;max-height:none;overflow-y:auto;padding:24px}
 body[data-workspace-tab=agent] .wb-chat-messages>.empty-state{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-height:100%;padding:16px 20px;text-align:left}
 body[data-workspace-tab=agent] .wb-chat-form{display:flex;flex-direction:column;gap:8px;flex:none;max-height:65%;overflow:hidden;padding:14px 18px}
 body[data-workspace-tab=agent] .wb-chat-form textarea{min-height:72px;max-height:160px;padding:11px 12px}
 body[data-workspace-tab=agent] .wb-chat-controls{flex:none;gap:10px;margin-top:2px;flex-wrap:wrap}
 body[data-workspace-tab=agent] .wb-chat-controls>div{display:flex;flex-wrap:wrap;gap:8px 14px}
 body[data-workspace-tab=agent] .wb-chat-controls .button{margin-left:auto;min-height:36px}
 body[data-workspace-tab=agent] .wb-chat-form>details{flex:0 1 auto;min-height:18px;max-height:180px;overflow-y:auto;margin-top:0}body[data-workspace-tab=agent] .wb-chat-form>details>summary{position:sticky;top:0;z-index:1;background:#fafbfc}
 body[data-workspace-tab=agent] .wb-chat-form [data-form-error]:empty{display:none}
 body:is([data-workspace-tab=security],[data-workspace-tab=health],[data-workspace-tab=backup],[data-workspace-tab=license]) .wb-properties{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px 26px;padding:20px 22px}
 .model-connection-form .wb-properties{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 24px;padding:20px 0}
 .settings-preferences-primary,.settings-identity-compact{grid-template-columns:220px minmax(0,1fr);gap:24px;padding:18px 0;margin-bottom:18px}
 .settings-preferences-primary .settings-properties{display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap;padding:0}
 .settings-preferences-primary .form-field{width:240px;flex:none}.settings-preferences-primary .section-note{flex:1;min-width:200px;margin-top:26px}
 .settings-identity-compact .settings-properties{grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;padding:0}
 .settings-identity-compact .property{padding-bottom:0}.settings-identity-compact .settings-description p{font-size:12px;line-height:18px}
}
@media(max-width:1024px){
 .pipeline-scope-summary{align-items:flex-start;flex-direction:column;gap:4px}.filter-order-hint{margin-left:0}
 .agent-conversation-picker{display:block;width:100%;font-size:12px;color:var(--muted)}.agent-conversation-picker>span{display:block;margin-bottom:6px}.agent-conversation-picker select{min-height:44px}
 body[data-workspace-tab=agent] .wb-chat>section.data-panel{display:none}
 body[data-workspace-tab=agent] .wb-chat-messages{height:220px;min-height:160px;max-height:35dvh;padding:18px}
 body[data-workspace-tab=agent] .wb-chat-messages>.empty-state{min-height:0;padding:8px 4px;text-align:left}body[data-workspace-tab=agent] .wb-chat-messages>.empty-state>h2{font-size:16px;line-height:22px}body[data-workspace-tab=agent] .wb-chat-messages>.empty-state>p{display:none}
 body[data-workspace-tab=agent] .wb-chat-form{padding:16px}
 body[data-workspace-tab=agent] .wb-chat-form textarea{min-height:72px}
 .agent-starters{grid-template-columns:1fr;margin-top:10px;gap:6px}.agent-starter{min-height:44px;padding:10px 12px}
 .task-completion-action{min-width:36px;min-height:36px;margin-right:7px}.intake-message-preview{min-width:180px;max-width:300px}
}
@media(max-width:767px){.settings-identity-compact .wb-properties{padding:16px;gap:14px}.admin-event-code{max-width:240px;overflow-wrap:anywhere}.knowledge-source-label{max-width:180px}}
@media(pointer:coarse),(max-width:767px){.task-completion-action{min-width:44px;min-height:44px}}
@media(pointer:coarse){.agent-starter{min-height:44px}}
@media(pointer:coarse),(max-width:767px){
 .pagination>button{min-width:44px;min-height:44px;width:44px;height:44px;padding:10px}
 .intake-tabs>button,.wb-toolbar>.button,.table-action-group>button.text-link{min-height:44px}
 .table-action-group>button.text-link{display:inline-flex;align-items:center;gap:5px;padding:8px 3px}
 body[data-workspace-tab=agent] .wb-chat-form>details>summary{min-height:44px;line-height:20px;padding:12px 0;box-sizing:border-box}
}
/* Record lists retain their column and record context while the data body scrolls. */
.record-list-scroll{position:relative;isolation:isolate;max-height:min(620px,65dvh);outline-offset:-2px}
.record-list-scroll th{position:sticky;top:0;z-index:4;background:#fafbfc;box-shadow:0 1px 0 var(--line)}
.record-list-scroll .cell-primary{position:sticky;left:0;z-index:2;width:260px;min-width:220px;max-width:300px;background:#fff;box-shadow:1px 0 0 var(--line)}
.record-list-scroll .cell-primary .record-link{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;min-width:0;max-width:100%;overflow-wrap:anywhere;text-align:left}
.record-list-scroll th.record-list-identity{left:0;z-index:6;box-shadow:1px 1px 0 var(--line)}
.record-list-scroll .cell-actions{position:sticky;right:0;z-index:2;background:#fff;box-shadow:-1px 0 0 var(--line)}
.record-list-scroll th:last-child:has(.sr-only){right:0;z-index:5;box-shadow:-1px 1px 0 var(--line)}
.record-list-scroll .crm-selection-cell{width:44px;min-width:44px!important;padding:0!important;background:#fff}
.record-list-scroll th.crm-selection-cell{background:#fafbfc}
.crm-select-target{display:grid;place-items:center;width:44px;min-height:44px;margin:0;cursor:pointer}
.crm-select-target input{margin:0}
.crm-column-required{font-size:11px;color:var(--muted);margin-left:4px}
.crm-viewbar .crm-viewtabs{flex:1 1 300px;min-width:0;max-width:100%;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin;overscroll-behavior-x:contain}
.crm-viewbar .crm-viewtabs>span{display:flex;flex:none;flex-wrap:nowrap;gap:5px}
.crm-viewbar .crm-viewtabs button{flex:none;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-viewbar .crm-list-actions{flex:none}
.record-list-scroll tbody tr:hover>td{background:#fafbfe}
.record-list-scroll tbody tr:has([data-crm-select]:checked)>td{background:#f1f3f7}
@media(min-width:768px){
 .record-list-scroll .crm-selection-cell{position:sticky;left:0;z-index:3}
 .record-list-scroll th.crm-selection-cell{z-index:7}
 .record-list-scroll .crm-selection-cell+.cell-primary,.record-list-scroll .crm-selection-cell+th.record-list-identity{left:44px}
}
@media(min-width:1101px) and (min-height:600px){
 body:has(#workspace-page>.data-panel>.record-list-scroll) .workspace-content{display:flex;flex-direction:column;height:calc(100dvh - 16px);min-height:0}
 body:has(#workspace-page>.data-panel>.record-list-scroll) .topbar,body:has(#workspace-page>.data-panel>.record-list-scroll) .workspace-footer{flex:none}
 body:has(#workspace-page>.data-panel>.record-list-scroll) #workspace-main{display:flex;flex-direction:column;flex:1;min-height:0;overflow:auto}
 body:has(#workspace-page>.data-panel>.record-list-scroll) #workspace-page{display:flex;flex-direction:column;flex:1;min-height:0}
 body:has(#workspace-page>.data-panel>.record-list-scroll) #workspace-page>:not(.data-panel){flex:none}
 body:has(#workspace-page>.data-panel>.record-list-scroll) #workspace-page>.data-panel{display:flex;flex-direction:column;flex:1;min-height:156px}
 body:has(#workspace-page>.data-panel>.record-list-scroll) #workspace-page>.data-panel>.record-list-scroll{flex:1;min-height:100px;max-height:none;overscroll-behavior:contain}
 body:has(#workspace-page>.data-panel>.record-list-scroll) .table-footer{flex:none}
}
@media(max-width:767px){
 .crm-viewbar .crm-viewtabs{flex-basis:100%}
 .crm-viewbar .crm-viewtabs button{max-width:180px}
 .crm-columns{gap:6px}
 .crm-columns label{display:flex;align-items:center;gap:8px;min-height:44px}
 .crm-columns label input{flex:none;margin:0}
 .record-list-scroll .cell-primary{width:160px;min-width:160px;max-width:160px}
 .record-list-scroll .crm-selection-cell{position:static}
 .record-list-scroll th.crm-selection-cell{position:sticky;top:0;z-index:4}
 .record-list-scroll .cell-primary,.record-list-scroll th.record-list-identity{left:0}
}
@media(max-width:380px){.record-list-scroll .cell-primary{width:140px;min-width:140px;max-width:140px}}
`;
