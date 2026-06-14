# Codex 接力提示词 — GYUTRON 官网 gyutron.com

> 把下面 ``` 代码块整段作为给 Codex 的开场提示词。本仓已有成熟双代理交接体系（`HANDOFF.md` + `AGENTS.md` + `docs/`）；此提示词让 Codex 每次从正确入口、用当前版本接力，不再用落后理解动手。
> 「本次任务」区已更新为当前状态（上一任务已上线 / 下一任务可选）；做完后替换成下一个任务即可。
> 最近更新：2026-06-15 —— 移动端产品页已上线(commit e0d7b2e)；本地源码已收敛到一套、**commerce-aggregator 已删**、官网路径已修正。

---

```
你正在接手 GYUTRON 官网 gyutron.com（Astro 静态站，主体在 astro/ 子目录；en/de/ja 三语；
Cloudflare Worker + public/ 静态托管 + Phase-1 D1 后端/Data API/admin）。Claude 与你（Codex）共同开发本仓。

【你在哪 / 本机只有 3 个项目，别走错仓库】
- 官网(本仓) gyutron-website     = D:\AI PRODUT\GYUTRON web\website\gyutron-website-repo（astro\，分支 main）
- 桌面 Agent gyuwork             = D:\Codex Data\gyuwork（分支 master）
- 电商看板 local-business-agent  = D:\Codex\gyutron-local-business-agent（前端 apps\web，端口 5173，分支 main）
  ⚠️ commerce-aggregator 项目已删除（本地+GitHub）；D:\Codex Data 已不再是 git 仓库（只装着 gyuwork\ 子仓 + 官网 scratch）。
  ⚠️ gyuwork 嵌套在 D:\Codex Data 内、是独立 .git——涉及该目录时绝不 `git add gyuwork/`、绝不 `git add -A`。

开工前务必按顺序做：
1. git fetch && git pull，确认 HEAD == origin/main（落后就先同步，绝不在旧基线上动手）。
2. 读根目录 HANDOFF.md——单一事实源，顶部「🤝 CODEX HANDOFF」块是最新状态，且 SUPERSEDES AGENTS.md 里冲突的旧规则。
3. 读 AGENTS.md（注意它自己标注了哪些规则已 stale）。
4. 新任务先看 docs/MAINTENANCE.md（任务→文件索引）+ docs/SAFETY_CHECKLIST.md（什么会弄坏站点）。

铁律（违反会弄坏线上站）：
- 与用户交流用中文；代码 / i18n key / 品牌名(GYUTRON 大写)保持原样。
- 主站已迁 Astro（astro/）。【严禁】跑旧 i18n 生成器（npm run i18n:build / i18n:sync / tools/generate_localized_site.py）——会把 public/ 重生成、CLOBBER 掉 Astro 站。de/ja 现由 Astro 构建。
- 部署 = cd astro && npx astro build → 把【改动的】astro/dist/* 逐个同步进 public/（绝不整树 bulk-copy，绝不碰 public/shop*）→ commit astro/+public/ → push（Cloudflare 自动托管 public/）。
- 品牌【纯紫】(--purple-500 #8a63d2 / --violet-soft #efe8ff)，绝不绿/青/teal；硬边工业风(border-radius:0)；动效只用 transform/opacity 且尊重 prefers-reduced-motion。
- 【诚信】绝不编造统计/客户数/成立年份/规格/合作 logo，只用真实可核验的 GYUTRON 事实。
- de/ja 文本必须 UTF-8；经 Python 写盘必须 PYTHONUTF8=1，否则静默变 ? 乱码。改完 products.*.js 跑 python tools/i18n-audit.py（exit 0）；查乱码 grep -nP '\?{4,}' astro/src/data/products.ja.js（须空）。绝不翻译产品型号名。
- shop.gyutron.com 是【独立站，对主站任务 out of scope】——绝不碰 public/shop、public/de/shop、public/ja/shop。shop 自己的交接见 shop/HANDOFF.md。
- 依赖用 npm（本仓连 package-lock.json 都不提交）。若 npm install 卡死可临时 corepack pnpm install，但 pnpm-lock.yaml / pnpm-workspace.yaml 绝不提交。
- 验证门：每次改动后 cd astro && npm run build && npm run verify:all（build-gated verify:header/sitemap/routes/seo/a11y-lite + report-only verify:i18n/assets）。GitHub Actions 在 push 时跑这些（从不部署）。

收工后：验证门跑通 → 更新 HANDOFF.md 顶部「CODEX HANDOFF」状态块（做了什么/怎么验证/下一步）→ commit（指定路径，不 -A）→ push 前再 fetch 核对 HEAD==origin → push。下一位 git pull 即同步。

──────────────────────────────────────────────
上一任务【已完成并上线，2026-06-15 commit e0d7b2e】—— 不要重做
──────────────────────────────────────────────
移动端产品页已交付：ProductPage.astro 的产品卡 CTA 拆成 full/short 双 <span>（移动端显示短标，新 key
pp.card.ctaShort = Quote/Angebot/見積）；product-page.css 移动端 hero 压缩 / 分类横向滑动 / 产品两列 / 短CTA切换。
外科式同步了 54 个产品分类页(18 类 × en/de/ja) + product-page.css 进 public/（其余页未动），verify:all 全绿，
线上实测生效（www.gyutron.com/area-scan-cameras.html 含 product-action-short / 短文案 Quote / product-page.css?v=95f65ad6）。
pnpm 临时产物已清并加入 .gitignore。完整记录见 HANDOFF.md 顶部 2026-06-15 状态块。

──────────────────────────────────────────────
下一任务【可选，未做】：根治"行尾烂账" + 移动菜单图标按钮（一次有意的整站重部署）
──────────────────────────────────────────────
背景：仓库 CSS 的 git blob 是 CRLF，但线上缓存戳 ?v= 是【混合】哈希——nav-chrome/chat-widget 当年用 LF 算、
mobile-navigation/contact-page 用 CRLF 算（历史构建工作区行尾不一致）。Layout 用 withVersion()=SHA1(astro/public/<css>) 做 ?v=。
mobile-navigation.css 是全局样式 → 任何干净重建都会让它 ?v= 变 → 牵动整站 124 页 HTML（纯缓存戳 churn、无功能影响：
?v= 仅浏览器缓存键、服务器忽略）。上一任务刻意只外科式动产品页、没碰其余页，所以这笔账还在。

要彻底消除（建议把下面的图标按钮一起带上，一次整站重部署）：
# 1) 加 .gitattributes（本仓根），把行尾固定为 LF：
#       * text=auto eol=lf
#       *.png binary
#       *.jpg binary
#       *.jpeg binary
#       *.webp binary
#       *.ico binary
#       *.woff2 binary
git config core.autocrlf false
git add .gitattributes
git add --renormalize .          # 把所有 CSS/文本统一为 LF blob（一次性，内容中性）
# 2) (可选) 移动菜单图标按钮：改 astro/public/mobile-navigation.css 里 @media 移动端的 .mobile-menu-toggle
#    -  font-size: 11px; min-width: 88px; padding: 0 10px;
#    +  font-size: 0; gap: 0; min-width: 40px; padding: 0; width: 40px;
#    （这是旧 stash codex-mobile-product-page-work-before-sync 里的真实改进，但当年改错了层=根/public，要改到 astro/public/）
# 3) 重建（带 Turnstile 密钥）→ 整站同步 → 验证 → 提交推送：
cd astro
$env:PUBLIC_TURNSTILE_SITE_KEY = "0x4AAAAAADh5yZZyBs-zTw3Y"
npm run build
cd ..
# 本次是【有意整站重部署】(与上次"外科式"不同)：diff -rq astro/dist public 会显示全站差异(缓存戳)+图标按钮真实改动；
# 把 astro/dist 的 HTML/CSS 同步进 public（仍【绝不碰 public/shop*】）。
cd astro ; npm run verify:all ; cd ..
git fetch ; git rev-parse HEAD ; git rev-parse origin/main   # 必须一致，否则先 rebase
git add -- astro/ public/ .gitattributes
git commit -m "chore(site): 统一行尾 LF(.gitattributes) + 移动菜单图标按钮，整站缓存戳归一(无功能变更)"
git push
# 完成后清理旧 stash（其余是死文件垃圾）：git stash drop  # codex-mobile-product-page-work-before-sync
```

---

## 给用户的小抄

- 官网交接体系本就完善：`HANDOFF.md`（单一事实源，顶部是最新状态块）+ `AGENTS.md`（红线，自标 stale 处）+ `docs/MAINTENANCE.md`（任务→文件索引）+ `docs/SAFETY_CHECKLIST.md`。
- Claude / Codex 接力前确保上一位已 push、本位已 `git pull`。两边只认 GitHub 远端 + 这些 in-repo 文档，不靠任一方私有记忆——这是不再错位的根本。
- 2026-06-14 本地已把每个项目收敛到一份 checkout（删了 3 份重复 clone + 整个 commerce-aggregator 项目）；当前只有官网 / gyuwork / local-business-agent 三个项目。
- 2026-06-15 移动端产品页已上线（commit e0d7b2e，外科式同步 54 产品页）；行尾烂账 + 菜单图标按钮留作"下一任务"（见上方代码块）。
- shop 独立站有自己的交接文档 `shop/HANDOFF.md`。
