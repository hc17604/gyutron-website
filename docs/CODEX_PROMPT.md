# Codex 接力提示词 — GYUTRON 官网 gyutron.com

把下面这段作为给 Codex 的开场提示词（按当前任务替换最后一行）。本仓已有成熟的双代理交接体系（`HANDOFF.md` + `AGENTS.md` + `docs/`），此提示词只是让 Codex 每次都从正确入口、用当前版本接力，不再用落后理解动手。

---

```
你正在接手 GYUTRON 官网 gyutron.com（Astro 静态站，主体在 astro/ 子目录；en/de/ja 三语；
Cloudflare Worker + public/ 静态托管 + Phase-1 D1 后端/Data API/admin）。Claude 与你（Codex）共同开发本仓。

开工前务必按顺序做：
1. `git fetch && git pull`，确认 HEAD == origin/main（落后就先同步，绝不在旧基线上动手）。
2. 读仓库根目录 `HANDOFF.md`——它是单一事实源，顶部「🤝 CODEX HANDOFF」块是最新状态，且 SUPERSEDES `AGENTS.md` 里冲突的旧规则。
3. 读 `AGENTS.md`（注意它自己标注了哪些规则已 stale）。
4. 新任务先看 `docs/MAINTENANCE.md`（任务→文件索引）+ `docs/SAFETY_CHECKLIST.md`（什么会弄坏站点）。

铁律（详见 HANDOFF.md / AGENTS.md，违反会弄坏线上站）：
- 与用户交流用中文；代码 / i18n key / 品牌名(GYUTRON 大写)保持原样。
- 主站已迁到 Astro（astro/ 子目录）。【严禁】运行旧版 i18n 生成器（npm run i18n:build / i18n:sync / tools/generate_localized_site.py）——它会把 public/ 重生成、CLOBBER 掉 Astro 站。de/ja 现在由 Astro 构建。
- 部署 = `cd astro && npx astro build` → 把【改动的】astro/dist/* 同步进 public/（绝不整体 bulk-copy，绝不碰 public/shop*）→ commit astro/+public/ → push（Cloudflare 自动托管 public/）。
- 品牌【纯紫】(--purple-500 #8a63d2 / --violet-soft #efe8ff)，绝不绿/青/teal；硬边工业风(border-radius:0)；动效只用 transform/opacity 且尊重 prefers-reduced-motion。
- 【诚信】绝不编造统计/客户数/成立年份/规格/合作 logo，只用真实可核验的 GYUTRON 事实。
- de/ja 文本必须 UTF-8；经 Python 写盘必须 PYTHONUTF8=1，否则静默变 ? 乱码。改完 products.*.js 跑 `python tools/i18n-audit.py`（exit 0）；查乱码 `grep -nP '\?{4,}' astro/src/data/products.ja.js`（须空）。绝不翻译产品型号名。
- shop.gyutron.com 是【独立站，对主站任务 out of scope】——绝不碰 public/shop、public/de/shop、public/ja/shop。shop 自己的交接见 shop/HANDOFF.md。
- 验证门：每次改动后 `cd astro && npm run build && npm run verify:all`（build-gated verify:header/sitemap/routes/seo/a11y-lite + report-only verify:i18n/assets）。GitHub Actions 在 push 时跑这些（从不部署）。

收工后：按上面验证门跑通 → 更新 `HANDOFF.md` 顶部「CODEX HANDOFF」状态块（做了什么/怎么验证的/下一步）→ commit → push。下一位 `git pull` 即同步。

本次任务：<在这里写你要 Codex 做的具体任务>
```

---

## 给用户的小抄

- 官网的交接体系本就完善：`HANDOFF.md`（单一事实源，顶部是最新状态块）+ `AGENTS.md`（红线，自标 stale 处）+ `docs/MAINTENANCE.md`（任务→文件索引）+ `docs/SAFETY_CHECKLIST.md`。
- Claude / Codex 接力前确保上一位已 push、本位已 `git pull`。两边只认 GitHub 远端 + 这些 in-repo 文档，不靠任一方的私有记忆——这就是不再错位的根本。
- shop 独立站有自己的交接文档 `shop/HANDOFF.md`。
