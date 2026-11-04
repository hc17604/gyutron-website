# GYUTRON Operations — 私有备份与隔离恢复

更新：2026-11-04。对应源码 `2026.11.04.12`、迁移0001–0011、`src/api/backup.mjs` 格式5。实现、隔离实测与生产发布分开记录；生产验收见 HANDOFF 当前发布记录。

## 1. 内容、一致性与兼容

格式5保存45张持久业务表：

```text
leads, rfqs, support_requests, download_requests,
order_intents, order_intent_items, events, api_keys,
crm_customers, crm_opportunities, crm_tasks, crm_activities,
crm_audit, crm_intake_links, admin_users,
ops_quotes, ops_quote_items,
ops_data_sources, ops_sync_runs, ops_import_batches, ops_import_rows,
ops_commerce_customers, ops_commerce_orders, ops_commerce_order_items,
ops_commerce_payments, ops_reports, ops_rules, ops_rule_versions,
ops_automations, ops_automation_runs, ops_rule_findings,
intel_model_settings, intel_model_usage, intel_conversations,
intel_messages, intel_runs, intel_memory, intel_documents,
intel_license_events, intel_instance_state,
crm_contacts, workspace_views, workspace_notification_receipts,
ops_analytics_imports, ops_analytics_observations
```

存在 `d1_migrations` 时保存真实迁移记录，共46张数据表。manifest含格式、backup_id、UTC时间、实际表清单/行数、迁移记录、schema SHA及baseline `operations-workspace-0011`；baseline不是远程迁移执行证明。

`admin_sessions`、`admin_owner_sessions`、`admin_login_attempts`只保存空结构。恢复后必须重新登录。Worker secrets不在快照：包括 `ADMIN_PASSWORD`、`ADMIN_SECRET`、`IP_HASH_SALT`、`WORKSPACE_ENCRYPTION_KEY` 和仓库外签发私钥。D1中的用户hash、模型密文及许可记录仍是敏感数据。

helper接受可信格式2（核心15表）、3（报价17表）、4（43表）和5（45表），不接受格式1。旧格式先恢复相容结构/版本，或前向迁移再启动新版；旧快照不代表新增经营/Agent数据已覆盖。0011须先于格式5应用部署；旧格式4应用遇到新表会按完整性约束拒绝创建新备份，不能作为0011后的完整备份回退方案。

schema、计数、数据和自增序列在同一D1 `db.batch` 事务读取。未知业务表、缺结构、读取不完整或超限明确失败，不能静默漏表；新增持久表须更新清单和恢复检查，不扩大公共Data API白名单。[D1 batch官方说明](https://developers.cloudflare.com/d1/worker-api/d1-database/)

## 2. 容量、校验与保留

上限25000行持久数据、8MiB完整JSON；预留256KiB给schema/manifest等，业务预算略低于8MiB。资料、导入行、审计、消息与报价items都计入。SQL预检查UTF-8 JSON字节/行数，事务内guard再防并发增长，不先物化超预算大表；最后检查整份JSON。不截断后宣称成功。

```text
backups/daily/<UTC ISO timestamp>-<UUID>.json
backups/weekly/<same filename>.json
backups/committed/daily/<same filename>.json
backups/committed/weekly/<same filename>.json
```

每次唯一key；payload写入后回读核字节、metadata与整文件SHA，通过才写commit marker和记录成功。UTC周日另写verified weekly副本。按marker保留30个daily日期、12个weekly日期，同日多份均保留。无marker旧对象/失败孤儿不占名额，不自动清理；人工核实后处理。retention失败与快照完整性分别记录。

事件 `backup.created` / `backup.failed` 是best effort；仍须检查cron错误、最新verified时间和容量。接近上限安排原生SQL导出、[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)或另行验收的分块方案。这不是无限流式导出器；恢复CLI的32MiB输入防护不扩大8MiB捕获上限，无未实测RPO/RTO/SLA承诺。

## 3. 私密文件与可信SHA

完整JSON不是整体加密文件，含客户、聊天、记忆/资料、用户hash及模型密文。R2保持私有，关闭r2.dev、不绑公开桶域名、不登记公共下载manifest。不要写Git、公开artifact、邮件或截图。替换为该客户真实桶名检查：

```powershell
npx wrangler r2 bucket dev-url get REPLACE_PRIVATE_R2_BUCKET
npx wrangler r2 bucket domain list REPLACE_PRIVATE_R2_BUCKET
```

当前owner受保护接口：

- `POST /admin/api/system/backup`：CSRF、密码重新验证与限流后新建并回读。
- `GET /admin/api/system/backups`：verified daily marker，最多返回100项；扫描不完整时meta明示。
- `POST /admin/api/system/backups/:filename/verify`：密码重新验证、CSRF与限流后核对marker/payload/hash/格式。
- `GET /admin/api/system/backups/:filename/json` 或 `/sql`：当前owner会话下载；GET本身不单独再次要求密码，不是公共接口。

`x-backup-sha256`指原始JSON快照，即使下载SQL也不是SQL文件自身SHA。通过管理端/有权限Cloudflare工具下载到忽略目录，例如 `.wrangler/private-recovery/`，保留可信marker/metadata的whole-file SHA：

```powershell
Get-FileHash -LiteralPath '.wrangler\private-recovery\snapshot.json' -Algorithm SHA256
```

必须与独立可信值一致。内部schema hash只防损坏，不是签名，攻击者可同时改DDL与hash。恢复会执行存储的CREATE DDL，禁止使用来历不明快照，不能把内部checksum当来源真实性证明。

## 4. 离线恢复与实际D1验证

先创建私有目录，选全新SQL和SQLite文件；在仓库/独立包根目录以Node24执行：

```powershell
node scripts/recover-workspace.mjs --snapshot .wrangler/private-recovery/snapshot.json --sql .wrangler/private-recovery/restore.sql --database .wrangler/private-recovery/restored.sqlite --sha256 REPLACE_VERIFIED_SNAPSHOT_SHA256
```

CLI核whole-file SHA、格式/schema/表/计数，恢复到新本地SQLite并验integrity/外键/计数，输出SQL及非敏感摘要。source/SQL/SQLite须不同，已有目标拒绝覆盖；不连远程库。参数虽可省SHA，交付恢复应提供已核实可信SHA。

SQL先建表、写数据/序列，最后装索引/trigger，允许合法历史状态；移除 `IF NOT EXISTS`，目标已有表会失败，避免混入运行中数据库。

长文本采用有界分段：超过48000字节的INSERT通过普通staging表 `__gyutron_restore_text`保存片段，每片最多3072个UTF-16单位并保留代理对；按序 `group_concat`重建后一次插入业务行，JSON/CHECK首次INSERT就见完整内容。最终删除staging，不依赖跨D1调用TEMP状态，不截断正文。

再用全新隔离persist目录验实际本地D1，而不只依赖Node SQLite：

```powershell
npx wrangler d1 execute DB --local --persist-to .wrangler/admin-recovery-isolated --file .wrangler/private-recovery/restore.sql
npx wrangler d1 execute DB --local --persist-to .wrangler/admin-recovery-isolated --command "PRAGMA integrity_check; PRAGMA foreign_key_check; SELECT COUNT(*) AS live_sessions FROM admin_sessions; SELECT COUNT(*) AS owner_sessions FROM admin_owner_sessions; SELECT COUNT(*) AS login_attempts FROM admin_login_attempts;"
```

`DB`为binding，不是上游数据库名；先确认当前配置/目标，不改成remote生产命令。integrity为ok、外键0、三张会话/限流表0、各表计数与manifest一致，staging不存在。用同一隔离persist目录启动Worker，验登录/角色、关联读写、审计、报价冻结、Agent资料全文/来源与模型密文；不接生产外发服务。

## 5. secret恢复、证据及生产回退

原 `WORKSPACE_ENCRYPTION_KEY`必须与JSON分开受控保管并恢复；换master无法解旧模型密文，找不到原值只能停用并重新录入provider key。记录secret版本而不写原文。owner秘密/盐按方案设置，会话始终重新建立。签发私钥只留发行方受限环境，不给客户Worker；外部凭据疑泄露另行轮换。

本版格式4已实际隔离D1恢复：Wrangler导入exit0，44张数据表计数一致，200KiB全文和另7份资料逐字一致，integrity ok、外键错误0、staging表0。源码测试还覆盖写入/回读失败、marker/retention、超限、旧格式、空session与冻结约束；R2替身不是远程R2，隔离D1不是生产恢复。最新报告以发布证据为准。

2026-11-04版本 .12 已实测格式5生产R2回读/下载及全新隔离本地D1恢复：46表全部单元格一致，integrity ok、外键0、恢复活动会话0、staging0；恢复后真实Worker登录和报告/自动化/运行API通过。生产库没有被恢复或覆盖。源文件与可信SHA在当前HANDOFF，私有快照不进Git。

旧2026.11.03.2曾实测格式3生产R2下载/隔离恢复，只证明当时0006范围，不证明新增表/master secret/新版生产验收。0007–0010已真实remote应用，应用发布与生产检查仍以当前发布记录为准。

生产恢复安排维护/停止写入窗口，保留当前恢复点，先恢复新目标并验应用/迁移/secret相容后切换。禁止自动DROP或覆盖上线后新数据。代码回退须兼容0011/格式5，旧 `.2` 遇新表会拒绝完整快照，不是本版完整回退目标。Worker回退不回滚D1/R2。[Worker版本说明](https://developers.cloudflare.com/workers/versions-and-deployments/)

演练记录至少包含backup_id/可信SHA、目标、应用/迁移/secret版本、计数/全文hash、integrity/外键、空session/staging清除、登录/权限/读写、起止时间和限制。远程恢复、告警接收、RPO/RTO须实际演练，不因步骤存在而宣称通过。
