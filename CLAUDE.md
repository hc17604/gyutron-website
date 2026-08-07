# Claude / Codex entry — GYUTRON 官网

Claude、Codex 及其他开发 agent 共用同一套仓库内交接协议，不依赖任何一方的私有记忆。

开工按这个顺序执行：

```powershell
git status -sb
git fetch origin
npm run agent:status
```

然后依次阅读：`HANDOFF.md` → `AGENTS.md` → `docs/AGENT_TAKEOVER.md` →
`docs/SAFETY_CHECKLIST.md`。主站任务不碰 Shop；Shop 任务另读 `shop/HANDOFF.md`。

收工必须：完成构建与验证、更新 `HANDOFF.md` 顶部状态、运行 `npm run agent:check`、只提交
明确路径、推送并核对 CI/线上状态。完整规则以 `AGENTS.md` 为准。
