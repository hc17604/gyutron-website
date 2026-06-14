# CLAUDE.md — GYUTRON 官网 gyutron.com

> Claude Code 与 Codex 共同开发本仓。**单一事实源是 `HANDOFF.md`，先读它**（顶部「🤝 CODEX HANDOFF」块是最新状态，SUPERSEDES `AGENTS.md` 冲突旧规则）。
> Codex 入口/红线见 `AGENTS.md`；接力提示词见 `docs/CODEX_PROMPT.md`；新任务从 `docs/MAINTENANCE.md`(任务→文件索引) + `docs/SAFETY_CHECKLIST.md` 开始。
> shop 独立站对主站任务 **out of scope**，它的交接见 `shop/HANDOFF.md`。

开工：`git pull` 对齐 origin/main → 读 `HANDOFF.md`。
收工：`cd astro && npm run build && npm run verify:all` → 更新 `HANDOFF.md` 顶部状态块 → commit + push。

硬线：主站走 Astro（astro/），严禁旧 i18n 生成器（会 clobber Astro）；纯紫品牌、硬边工业风；de/ja 必须 UTF-8 + `python tools/i18n-audit.py`；绝不碰 public/shop*；绝不编造事实。详见 HANDOFF.md / AGENTS.md。
