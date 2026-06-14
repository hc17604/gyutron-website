# Codex 接力提示词 — GYUTRON 官网 gyutron.com

> 把下面 ``` 代码块整段作为给 Codex 的开场提示词。本仓已有成熟双代理交接体系（`HANDOFF.md` + `AGENTS.md` + `docs/`）；此提示词让 Codex 每次从正确入口、用当前版本接力，不再用落后理解动手。
> 「本次任务」区已填入当前待办（移动端产品页收尾）；任务完成后把它替换成下一个任务即可。
> 最近更新：2026-06-14 —— 本地源码已收敛到一套，**commerce-aggregator 项目已删**，官网本地路径已修正。

---

```
你正在接手 GYUTRON 官网 gyutron.com（Astro 静态站，主体在 astro/ 子目录；en/de/ja 三语；
Cloudflare Worker + public/ 静态托管 + Phase-1 D1 后端/Data API/admin）。Claude 与你（Codex）共同开发本仓。

【你在哪 / 本机只有 3 个项目，别走错仓库】
- 官网(本仓) gyutron-website     = D:\AI PRODUT\GYUTRON web\website\gyutron-website-repo（astro\，分支 main）
- 桌面 Agent gyuwork             = D:\Codex Data\gyuwork（分支 master）
- 电商看板 local-business-agent  = D:\Codex\gyutron-local-business-agent（前端 apps\web，端口 5173，分支 main）
  ⚠️ commerce-aggregator 项目已删除；D:\Codex Data 已不再是 git 仓库（只装着 gyuwork\ 子仓 + 官网 scratch）。
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
本次任务：移动端产品页收尾（已改在 Astro 层，待清理 + 同步 + 提交）
──────────────────────────────────────────────
现状（HEAD 9167052，与 origin 同步）：以下 5 个文件已正确改在 Astro 源码层（方向对，保留）——
  astro/src/components/ProductPage.astro          （CTA 加 full/short 两个 span）
  astro/public/product-page.css                   （移动端 hero 压缩/分类横滑/产品两列/短CTA切换）
  astro/src/i18n/{en,de,ja}.json                  （+1 个 key pp.card.ctaShort，de=Angebot/ja=見積）
build + verify:all 已过。另有 2 个未跟踪文件 astro/pnpm-lock.yaml、astro/pnpm-workspace.yaml。
未完成：清 pnpm 产物、dist→public 同步、提交推送。

⚠️ 必须先懂的坑（否则会推出污染整站的提交）：
core.autocrlf=true 且无 .gitattributes → 检出的 CSS 是 CRLF。Layout 用 withVersion()=SHA1(astro/public/<css>) 做 ?v= 缓存戳。
CRLF 算的哈希≠线上(LF)哈希（实测 nav-chrome.css CRLF→498e6a0d，LF→f020a8d4，线上正是 f020a8d4）。
nav-chrome.css / chat-widget.css 每页都加载 → 用 CRLF 构建时 diff -rq astro/dist public 会显示 200+ 文件“全变”，
全是行尾/哈希假象；此时 copy 全部差异 = 整站 public 被重写，违反“禁止 bulk-copy”。

按顺序执行（PowerShell，在本仓根）：

# A) 清 pnpm 产物 + 加 .gitignore（本仓约定 npm，不提交任何 lockfile）
Remove-Item "astro\pnpm-lock.yaml","astro\pnpm-workspace.yaml" -Force -ErrorAction SilentlyContinue
#   .gitignore 末尾追加两行：  pnpm-lock.yaml   和   pnpm-workspace.yaml

# B) 一次性根治行尾（独立提交，内容中性只去 CR）：新建 .gitattributes：
#       * text=auto eol=lf
#       *.png binary
#       *.jpg binary
#       *.jpeg binary
#       *.webp binary
#       *.ico binary
#       *.woff2 binary
git config core.autocrlf false
git stash push -m wip-mobile-product -- astro\src astro\public\product-page.css astro\src\i18n
git add .gitattributes
git add --renormalize .
git commit -m "chore: 统一行尾为 LF(.gitattributes)，修复 Windows 下 withVersion CSS 哈希漂移"
git checkout -- .
git stash pop

# C) 重新构建（带 Turnstile 站点密钥，否则表单防护被回退）
cd astro
$env:PUBLIC_TURNSTILE_SITE_KEY = "0x4AAAAAADh5yZZyBs-zTw3Y"
npm run build
cd ..

# D) 关键安全门：diff -rq astro/dist public（排除 shop）
#   ✅ 预期只有产品“分类页”(area-scan-cameras / barcode-scanners / … × en/de/ja) + product-page.css 变。
#   ✅ contact-sales.html / index.html / news* / support* 必须【无差异】。
#   ❌ 若整站都在 diff → 行尾没修对，停止，不要同步，回 B 排查。

# E) 只把真正变化的文件从 astro/dist 逐个 copy 进 public（禁止整树 bulk-copy；禁止碰 public/shop*）。

# F) cd astro ; npm run verify:all ; cd ..   （verify:i18n report-only 残留如 Track-and-Trace 可忽略）

# G) 处理旧 stash：名为 codex-mobile-product-page-work-before-sync 的那条是旧根目录死文件改动
#    (product-catalog.js / 根 product-page.css / 还误改了禁用的 tools/generate_localized_site.py)，正确版已在 Astro 层重做。
#    drop 前只需确认它里的 mobile-navigation.css(+8/-8) 是否要保；不要就 git stash drop <那条ref>。

# H) 修 HANDOFF.md：§1「Local working copy」旧路径 D:\Codex\workspaces\2026-05-17\... 已删，改成
#    D:\AI PRODUT\GYUTRON web\website\gyutron-website-repo；并更新「当前状态/下一步」。

# I) 提交 + 推送（指定路径，禁止 -A）
git fetch
git rev-parse HEAD ; git rev-parse origin/main      # 必须一致，否则先 rebase
git add -- astro/ public/ HANDOFF.md .gitattributes .gitignore
git commit -m "feat(product): 移动端产品页 hero压缩/分类横滑/两列/短CTA，同步 public"
git push
```

---

## 给用户的小抄

- 官网交接体系本就完善：`HANDOFF.md`（单一事实源，顶部是最新状态块）+ `AGENTS.md`（红线，自标 stale 处）+ `docs/MAINTENANCE.md`（任务→文件索引）+ `docs/SAFETY_CHECKLIST.md`。
- Claude / Codex 接力前确保上一位已 push、本位已 `git pull`。两边只认 GitHub 远端 + 这些 in-repo 文档，不靠任一方私有记忆——这是不再错位的根本。
- 2026-06-14 本地已把每个项目收敛到一份 checkout（删了 3 份重复 clone + 整个 commerce-aggregator 项目）；当前只有官网 / gyuwork / local-business-agent 三个项目。
- shop 独立站有自己的交接文档 `shop/HANDOFF.md`。
