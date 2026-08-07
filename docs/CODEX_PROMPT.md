# 可复制的 GYUTRON Agent 接力提示词

下面的提示词不保存某一次任务或固定 commit，避免过期。当前状态始终以仓库内
`HANDOFF.md` 和 Git 为准。

```text
你正在接手 GYUTRON 官网仓库：
D:\AI PRODUT\GYUTRON web\website\gyutron-website-repo

不要依赖聊天历史或私有记忆。先执行 git status -sb、git fetch origin、npm run agent:status，
确认 HEAD 与 origin/main 的关系并保留任何已有未提交改动。然后依次完整阅读 HANDOFF.md、
AGENTS.md、docs/AGENT_TAKEOVER.md、docs/SAFETY_CHECKLIST.md、docs/MAINTENANCE.md。

主站源码在 astro/，Cloudflare 实际发布仓库根 public/。主站任务禁止旧 i18n 生成器、禁止
整树复制 dist 到 public、禁止改 public/shop*；Shop 任务必须另读 shop/HANDOFF.md。每次改动
都要 build + verify:all，按需要做三语和响应式检查。收工时更新 HANDOFF.md 顶部状态，运行
npm run agent:check 与 git diff --check，只 stage 明确路径，推送后检查 CI 和线上结果。

现在先报告你读到的当前分支、HEAD、工作树状态、最近一次交付和本任务边界，再开始执行。
```

更完整的接手与收工模板见 [`AGENT_TAKEOVER.md`](./AGENT_TAKEOVER.md)。
