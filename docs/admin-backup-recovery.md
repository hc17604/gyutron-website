# GYUTRON Operations — 私有备份与隔离恢复

更新：2026-11-03。实现为 `src/api/backup.mjs`；现有Worker scheduled handler继续调用 `runBackup(env)`。这份说明区分已执行的本地恢复测试和生产运行事实。

## 1. 备份内容与一致性

报价0006版本的格式3备份显式包含17张持久业务表：

```text
leads, rfqs, support_requests, download_requests,
order_intents, order_intent_items, events, api_keys,
crm_customers, crm_opportunities, crm_tasks, crm_activities,
crm_audit, crm_intake_links, admin_users,
ops_quotes, ops_quote_items
```

存在 `d1_migrations` 时同时保存其结构与所有记录，manifest列出真实迁移记录和最新迁移文件名。`application_schema_baseline` 表示本实现支持的最低应用结构，不冒充远程迁移执行证明。

首个已部署核心版本使用格式2、15张持久表（不含两张ops报价表）。当前恢复helper同时接受格式2和3；格式2恢复到0005结构后，应运行对应核心版本，或先前向应用0006再启动含报价的版本。不能因为新版增加报价表就拒绝恢复旧的可信核心备份。格式1不受此helper支持。

`admin_sessions`、`admin_owner_sessions`、`admin_login_attempts`仅保存表结构，不保存内容。恢复数据库后全部会话为空，所有人必须重新登录；不会把旧的有效或已撤销token恢复为登录凭据。Worker环境秘密（ADMIN_PASSWORD、ADMIN_SECRET、API密钥原文等）不在D1备份中，也不会由这个工具导出。`api_keys`原有表中的key hash与用户密码hash属于敏感数据。

schema、每表row count、数据及自增序列均在同一个 `db.batch` 中读取，避免逐表独立读取造成不一致。Cloudflare说明batch是一个按顺序执行的SQL事务。[官方D1 batch说明](https://developers.cloudflare.com/d1/worker-api/d1-database/)

manifest包含格式版本、唯一backup_id、UTC时间、表清单、各表行数、排除表、迁移状态与schema SHA-256。R2对象metadata保存整个JSON的SHA-256。写入后重新读取并核对字节数、metadata与完整内容hash，验证通过后才运行retention并记录 `backup.created`。

新表不能被静默遗漏：发现未纳入清单的业务表、缺少必要结构、读取不完整或超限会显式失败并记录 `backup.failed`。新增持久表时，必须同时更新备份清单、恢复测试和本文件；不要扩大 `platform/config.mjs` 的Data API白名单来解决备份问题。

## 2. 私密性、路径和保留

对象保存在现有R2 binding中：

```text
backups/daily/<UTC ISO timestamp>-<random UUID>.json
backups/weekly/<same timestamp and UUID>.json
```

每次运行使用唯一键，重复执行不会覆盖上一份备份。UTC星期日同时产生经过相同回读验证的weekly副本。

完整payload回读验证后，才写入相应的commit marker：

```text
backups/committed/daily/<same filename>.json
backups/committed/weekly/<same filename>.json
```

**Retention只按commit marker计算最近30个daily日期与12个weekly日期**，并成对清理过期marker与payload。同日多个verified快照保留。回读失败时尽力删除本次唯一payload；删除失败留下的孤儿没有marker，不会挤掉可信历史。marker写入结果不确定时保留已验证payload，避免一个可能已持久化的marker指向被主动删除的内容。

格式1旧 `YYYY-MM-DD.json` 备份和其他没有marker的对象不会自动清理，也不计入verified保留日期；需要维护者核实后再迁移或清理。这避免把未经当前完整校验的旧文件误当成已验证快照。Retention分页遍历marker；清理失败单独标记，不把已验证的新快照说成丢失，也不把清理失败隐藏为通过。

**2026-11-03已只读核实的GYUTRON生产事实**：当前生产资源桶的r2.dev公开访问关闭，未连接R2自定义域名。这不代表新客户资源已验收。对独立实例，替换下面的占位名为该客户已核实的私有R2桶名后检查：

```powershell
npx wrangler r2 bucket dev-url get REPLACE_PRIVATE_R2_BUCKET
npx wrangler r2 bucket domain list REPLACE_PRIVATE_R2_BUCKET
```

应用资源下载路由仅访问已登记的资源manifest，备份不登记为public/gated下载，也不提供管理端HTTP下载接口。以后启用桶级公开域名会暴露同桶对象，不能把随机文件名当作访问控制。备份JSON、恢复SQL、用户hash均不得进入Git、公开artifact、邮件、截图或聊天输出。

## 3. 明确限制与告警

此Worker JSON备份支持最多25,000行持久数据、8MiB完整序列化JSON；其中预留256KiB给schema、manifest和序列等元数据，因此业务行JSON预算略低于8MiB。SQL使用 `json_object` 与UTF-8 byte length计算大小，已知超行数或字节预算时在物化数据行前拒绝。

为防止预检查与实际快照之间增长，每条数据SELECT在同一个snapshot事务里再次使用全库行数/字节guard；预算超过时SQL返回0行，Worker收到统计后报告明确超限。最后仍检查完整JSON的实际字节大小。不会先把任意大notes集合拉入Worker再依靠JSON.stringify判断，也不会截断后声称完整成功。

这不是大数据流式导出器。接近限制时，应使用D1原生SQL导出、Time Travel或单独的分块备份作业，并完成相应恢复验证。[D1 Time Travel说明](https://developers.cloudflare.com/d1/reference/time-travel/) 未在本次测试中测定长期恢复时间、负载上限或SLA。

`runBackup` 返回 `ok`、唯一backupId、对象key和各表计数；日志只输出失败代码，不输出记录或密码hash。业务event stream可检查 `backup.created` / `backup.failed`；`backup.created` payload中的 `verified` 和 `retention_ok` 分别表示快照完整性和清理结果。event本身是best effort，运行维护还应检查Worker cron错误和R2最新对象时间，不能只以没有事件解释为一切正常。

## 4. 已执行的恢复演练

运行：

```powershell
node scripts/smoke-admin-backup.mjs
```

测试在Node真实SQLite内存库中建立0001–0006结构，写入所有领域、真实算法的测试用户hash、会话、审计、线索转换、已归档客户及其合法关闭历史、签发后记录accepted的报价及items，然后生成snapshot并恢复到新的隔离SQLite库。验证所有表行和关联、外键、中文/引号/NUL文本、密码验证、自增序列、审计不可改写、业务guard仍生效，三个会话/限流表为空；issued报价snapshot字节/hash与header/items冻结guard保留。

R2失败测试采用内存mock，覆盖空写入、回读损坏、分页retention、周日副本、清理失败，以及5个失败日期的孤儿不挤占30个verified日期。数据测试验证预检查超限时不物化行、预检查后并发增长时同事务data SELECT返回0行。核心17项已由非实现者独立复跑；报价联动后18项通过，新增格式2恢复及随后前向应用0006的兼容性检查。

**额外实际运行验证（2026-11-03）**：使用独立 `.wrangler/backup-verification/state`、8794端口的本地workerd及真实本地D1/R2，实际完成16表（含迁移跟踪）/74个schema对象snapshot、R2写入与回读、commit marker及retention。随后在隔离库加入1000个客户、每条notes 10000字符（约10MB），runBackup明确返回 `BACKUP_BYTE_LIMIT`，Worker继续正常工作；清理仅该测试prefix后再次备份成功。自有测试服务随后停止。

上述8794演练证明本地workerd契约与隔离恢复。另2026-11-03 14:48核心版本生产检查已完成实际私有R2手动备份与回读verified，见 `production-core-checks.json`。这不证明远程数据库恢复或实际cron调度已经执行，也不证明尚未发布的报价格式3已在生产运行。所有隔离fixture测试没有访问生产业务数据或发送外部消息。

**报价0006联动本地运行**：同一隔离persist目录前向应用0006后，真实workerd+D1/R2再次完成18表（含报价两表与migration tracking）、92个schema对象snapshot，完整回读、commit marker与retention通过。该自有8794服务随后停止。18项SQLite检查同时验证恢复后的quoteSnapshot完整性和中文打印HTML金额，格式2仍可恢复并继续应用0006。

## 5. 取得可信备份

先选择一个 `verified` 成功对象，并将其通过有权限的Cloudflare工具下载到Git忽略的本地目录。不要下载到 `public/`、可提交artifact目录或共享云盘。保留对象metadata里的sha256作为独立校验值。使用当前CLI的 `--help` 确认参数后读取对象，不在命令行或日志打印内容。

本地核对示例：

```powershell
Get-FileHash -LiteralPath '.wrangler\private-recovery\snapshot.json' -Algorithm SHA256
```

结果必须与R2 metadata及成功事件/受控运行记录的checksum一致。只核对JSON内部schema hash不能替代整个文件的可信来源与完整性核对。格式1旧备份缺少当前身份/CRM结构，不能用当前helper冒充完整恢复；旧版本需按对应旧schema另行处理。格式2的核心备份与格式3的报价备份均由当前helper按各自表清单验证。

## 6. 生成恢复SQL并在隔离本地D1演练

`backupToSql(snapshot)`是纯离线helper，未暴露为HTTP路由。它检查格式、schema checksum、表清单和行数，拒绝导入live session数据。表结构先建、记录随后写入、索引/trigger最后安装，以便恢复“已关闭历史位于归档客户下”的合法状态。CREATE语句移除IF NOT EXISTS，目标库已有表时会失败，避免把旧快照混入已有业务数据。

在仓库根目录执行下面的Node脚本。路径均位于 `.wrangler/`，该目录不提交；不要输出生成的SQL内容：

```powershell
@'
import { readFile, writeFile } from 'node:fs/promises';
import { backupToSql } from './src/api/backup.mjs';
const snapshot = JSON.parse(await readFile('.wrangler/private-recovery/snapshot.json', 'utf8'));
await writeFile('.wrangler/private-recovery/restore.sql', await backupToSql(snapshot), 'utf8');
console.log('Recovery SQL generated locally. Contents withheld.');
'@ | node --input-type=module
```

先确认 `.wrangler/admin-recovery-isolated` 是一个新隔离目录。以下命令使用 `--local` 与独立persist目录，只写本地恢复环境，不要将其改为remote生产命令：

```powershell
npx wrangler d1 execute DB --local --persist-to .wrangler/admin-recovery-isolated --file .wrangler/private-recovery/restore.sql
npx wrangler d1 execute DB --local --persist-to .wrangler/admin-recovery-isolated --command "PRAGMA foreign_key_check; SELECT COUNT(*) AS users FROM admin_users; SELECT COUNT(*) AS live_sessions FROM admin_sessions; SELECT COUNT(*) AS owner_sessions FROM admin_owner_sessions;"
```

外键检查应无错误、各表计数与manifest一致、live_sessions与owner_sessions均为0。随后在同一隔离persist目录运行Worker，使用隔离环境的owner秘密/测试账号检查列表、详情、角色限制和新写入。不要复用生产会话或给恢复环境接通生产外发邮箱。上面的Wrangler命令是操作步骤；是否已实际运行由发布证据记录，不能凭命令存在宣称通过。

命令使用 `DB` binding名称，因此同时适用于根项目和配置了不同实际数据库名称的独立客户包；执行前核实当前配置确实把DB指向预期实例。

## 7. 生产恢复与代码回退

普通代码回退优先恢复上一个Worker版本，保留新增数据表。Worker版本回退不会回滚D1/R2状态。[Cloudflare版本与部署说明](https://developers.cloudflare.com/workers/versions-and-deployments/)

数据库恢复需单独安排写入窗口：记录当前恢复点/完整SQL导出，先在新的隔离目标完整恢复并验收，确认应用版本与迁移状态后再切换。不要把旧snapshot直接灌回在线数据库，不自动DROP生产表，也不把上线后的新客户资料覆盖掉。所有旧会话默认失效，Worker环境秘密单独恢复/轮换；如果备份凭据可能泄露，应轮换相关API密钥和用户密码。

恢复演练记录至少包含：来源backup_id/文件SHA、目标环境、应用版本/迁移版本、各表计数、外键结果、session清空、登录/权限/读写结果、开始和结束时间、剩余限制。RPO/RTO仅在真实演练后报告。
