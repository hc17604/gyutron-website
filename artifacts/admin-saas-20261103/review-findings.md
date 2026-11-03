# GYUTRON Operations — 独立质量审查

审查者：research_quality agent。开始日期：2026-11-03（Asia/Singapore）。本文件只记录实际检查范围；实现仍在进行，未执行的生产/恢复/多租户测试不视为通过。

## 当前摘要

第一轮检查覆盖 `src/api/backup.mjs`、`src/platform/config.mjs`、`src/platform/csv.mjs`、新增 CRM schema/repository/migration，以及旧管理端/下载路由。未修改这些实现文件。

| ID | 严重度 | 状态 | 发现 |
|---|---|---|---|
| Q-001 | P0 | CLOSED / 实现及隔离运行验证 | 覆盖15张持久表及可选迁移记录；会话仅结构恢复 |
| Q-002 | P0 | MITIGATED / 新路径已独立复测 | 新workspaceCsv已防公式注入；旧导出路由替换后再关闭 |
| Q-003 | P1 | CLOSED / 已独立复测 | 非法日期已返回422 |
| Q-004 | P1 | CLOSED / 真实SQLite测试 | owner_id验证有效active成员；销售不可重分配 |
| Q-005 | P1 | CLOSED / 真实SQLite测试 | 有关联任务/活动时拒绝商机客户重分配 |
| Q-006 | P2 | CLOSED / 独立复测 | 新建won/lost概率已归一100/0 |
| Q-007 | 交付门槛 | CLOSED-LOCAL / 生产恢复未执行 | 已交付恢复helper、runbook与隔离SQLite/workerd验证 |
| Q-008 | P1 | CLOSED / 真实SQLite测试 | 有active依赖时409；归档恢复关联校验已加入 |
| Q-009 | P1 | CLOSED / 独立交错复测 | UPDATE/restore并发active父级缺口由0005守卫修复 |
| Q-010 | P1 | FIXED / 待浏览器复测 | UI不再把所有409误报为版本冲突 |
| Q-011 | P1 | FIXED / 待浏览器复测 | 关联选择仅前100条已改为服务端搜索；manager成员目录已协调 |
| Q-012 | P2 | FIXED / 待浏览器复测 | modal记录深链与刷新恢复已加入 |
| Q-013 | P1 | CLOSED / 独立复跑17项 | 备份字节上限改为SQL端预检查和同事务读取guard |
| Q-014 | P1 | CLOSED / 独立复跑17项 | 失败R2对象不再影响可信备份retention |
| Q-015 | P1 | CLOSED / 实际workerd复测 | D1 compound SELECT terms限制已用scalar subqueries解决 |

## Q-001 — 每日备份缺少新领域

`runBackup` 遍历 `Object.values(TABLES)`，当前仅包含 leads、rfqs、support_requests、download_requests、order_intents、order_intent_items、events、api_keys。新增 crm_customers、crm_opportunities、crm_tasks、crm_activities、crm_audit 不在该清单。身份表也需要在实现后加入明确策略。

**实际执行**：以 mock D1/R2 运行真实 `runBackup`，读取其实际产生的 JSON manifest 与 tables。结果为 `ok:true`、`schema_version:1`、8张旧表、`crmIncluded:false`。这意味着“备份成功”不能证明新CRM数据已备份。

**修复建议**：独立、显式的备份表清单；对照迁移生成的sqlite_master做覆盖测试；manifest记录应用schema/迁移版本、表行数和导出时间。必须区分业务数据、用户密码hash、session表。恢复后应使全部旧session失效，避免把被撤销的会话恢复为有效。密码hash等仍是敏感数据，备份对象不得进入公开下载清单。

**验证关闭条件**：本地建库写入每张新表→运行备份→在隔离库恢复→核对行数/关键关联/审计；身份可登录、旧session不可用。不能只通过mock清单测试关闭“恢复已验证”。

**关闭证据**：备份清单覆盖15张持久表+可选d1_migrations；三个session/限流表仅保存DDL。隔离SQLite恢复逐表行数/关联一致、测试密码可验证、旧session均空、audit不可变更、合法归档历史和sqlite_sequence保留。真实隔离workerd+D1/R2完成16表/74schema对象snapshot、回读、commit marker与retention。生产R2公开访问通过CLI只读确认关闭，无自定义域名。恢复没有在生产执行。

## Q-002 — CSV公式注入

当前 `escapeCell` 只处理CSV引用。实际执行 `toCsv` 后，`=HYPERLINK(...)`、tab前缀`=1+1`、`@SUM(...)`保留可执行公式前缀；双引号引用并不能可靠阻止Excel将其解释为公式。

**修复建议**：对危险前缀（含前导空白/制表符）增加安全文本前缀，再完成CSV引用；对正常数值的处理应明确，避免改变真实金额字段语义。测试`= + - @`、tab/CR/LF、引号、逗号、中文和空值。

**验证关闭条件**：CSV内容负向测试通过；新导出路径按角色与筛选测试，viewer/sales不能绕过服务端export权限。

**复查结果**：独立执行新的 `workspaceCsv`：`=1+1`、空格`+1`、tab`@SUM`、CR`-1`、LF`=1`均添加文本前缀；普通文本和带引号/逗号文本保持正确CSV引用。新路径该缺陷已缓解。旧 `toCsv` 仍保持原实现，需确认旧导出路由已被替换或修复，再关闭整个数据出口风险。

## Q-003 — 非法日期产生500

`validatePayload('tasks', {title:'Review sample', due_date:'2026-99-99'})` 实际抛出 `RangeError: Invalid time value`，没有WorkspaceError状态。`2026-02-30`正确返回422，`2026-02-28`正确接受。

**修复建议**：先检查Date时间值有限，再调用toISOString；日期/时间校验共用安全函数。

**验证关闭条件**：非法月份、日期、闰年、空值、格式错误均返回结构化422；合法边界日可保存。

**关闭证据**：独立重新运行真实 `validatePayload`：`2026-99-99`、`2026-02-30`、`2025-02-29`均返回WorkspaceError状态422；`2024-02-29`接受。先前RangeError已消失。该结论是schema函数验证，尚非生产HTTP验证。

## Q-004 — owner_id真实性

当前CRM payload允许客户端传入任意100字符owner_id，空值才回退当前principal。尚未读取有效团队成员，可能产生不可分配的孤儿负责人。身份实现完成后需要重新审查，不能基于当前中间状态断言最终版仍存在。

**建议失败案例**：sales创建/更新客户、商机或任务时传入不存在、已停用、其他部署成员ID，应422；有效成员ID应保存。若策略允许跨成员分配，矩阵必须明确；若限制仅本人，服务端应403，不能仅隐藏选项。

**关闭证据**：独立执行稳定后的 `node scripts/smoke-admin-api.mjs`，有效active成员验证、无效ID拒绝、销售重分配拒绝的真实SQLite用例通过。manager/owner可以重新分配，sales创建归本人并不能替其他人重分配。此为同部署权限模型，不是共享库跨租户验证。

## Q-005 — 商机转移客户的一致性

当前validateRelations会校验本次task/activity的customer与opportunity是否一致，但更新opportunity.customer_id时未检查已经引用该商机的crm_tasks/crm_activities。一个商机可从客户A移动到B，而既有任务/活动仍记A，形成矛盾关联。

**修复选择**：禁止有子记录的商机转移客户，并返回可理解409；或在同一个事务内同步相关数据并记录审计。活动是历史记录时需明确历史归属策略，不宜无说明重写。

**建议失败案例**：A/B客户→A商机→A+商机任务→将商机改B→读任务与商机。应被明确拒绝或具有经验证的统一迁移结果。

**关闭证据**：实现已在服务层和SQL trigger拒绝带任务/活动历史的商机客户变更；独立运行真实SQLite集成套件，`customer reassignment preserves linked task and activity history` 用例通过。

## Q-006 — 关闭阶段概率

update路径将won/lost概率强制为100/0，但create路径采用payload默认10，允许直接新建won且概率10。虽然当前dashboard不使用加权预测，后续统计容易失真。

**验证关闭条件**：新建和更新都遵守同一阶段/概率规则；通过两个路径分别测试won、lost、重新开启。

**关闭证据**：独立直接调用 `createWorkspaceRecord`，分别传入 `stage:won/lost` 与 `probability:33`，数据库读取结果为100/0；更新路径集成用例同时通过。

## Q-007 — 恢复与发行文档

备份注释指向的 `docs/PHASE6.md` 当前不存在；cloudflare-deployment.md只提供SQL导出与一般回退说明，没有针对JSON备份的新schema恢复过程。当前逐表SELECT也不是已证明的同一时间点快照；数据增长后全量装入Worker内存的限制尚未验证。

**本次最低要求**：上线前实际SQL备份/恢复点；新表覆盖；写清楚JSON备份的事务一致性和恢复限制。公开售卖前需在隔离环境演练恢复，并记录RPO/RTO，不可凭存在cron宣称完成灾备。

**本地交付关闭**：`docs/admin-backup-recovery.md`与纯离线 `backupToSql` 已交付。真实SQLite完整恢复和workerd本地运行已执行，17项测试由实现者与非实现者分别通过。实际生产原生SQL备份、cron执行及生产R2写入证据仍由发布负责人补充；没有测定生产RPO/RTO。

## 身份设计复审清单

- opaque session使用足够随机的token，仅存hash；每次请求读取当前用户role/status，不把旧role写死在cookie。
- 停用、密码变更和角色撤销实际失效；事务保护最后owner，避免两个并发降级请求移除全部owner。
- PBKDF2/scrypt使用独立随机salt、明确参数和版本；不要输出hash、token、密码或生产导出。
- Cookie/CSRF密钥不复用到不相关业务；CSRF覆盖JSON写操作和登录/退出；失败请求保留一致错误。
- bootstrap owner用现有秘密进行一次性授权，并明确迁移后是否继续允许共享密码fallback；不能在团队模式下保留绕过用户撤销的永久共享超级入口。
- 独立部署隔离应明确写出，不因有workspace名称就宣称同库多租户隔离已实现。

**已审实现方向**：`workspace-auth.mjs`采用32随机字节opaque token、DB只存token hash、SameSite=Strict/HttpOnly/Secure Cookie、每次从DB读取active/role、2小时idle与8小时TTL；owner会话包含Worker秘密的fingerprint。0004角色只允许manager/sales/viewer，唯一owner是环境秘密控制的部署操作者。应明确这是持续存在的break-glass身份，不宣称每次owner行为已经归属到具名员工。

**官方兼容依据**：Cloudflare crypto文档说明 `node:crypto` 除明确列出的例外外均受支持，scrypt不在例外中；仍需workerd真实执行、CPU和并发内存验证。[官方crypto兼容说明](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/)

## Q-008 — 归档依赖

源码审查发现客户归档后仍可能拥有active商机/未完成任务，overview继续统计商机但客户在默认列表隐藏；商机后续编辑可能因为关联客户已归档而被拒。实现者已接受调整方向：客户有open商机/未完成任务时返回409；商机有未完成任务时返回409；restore验证active父级；数据库约束/触发器用于避免检查后并发写入造成违例。等待实现与独立复测。

**关闭证据**：真实SQLite集成用例确认有active依赖时409、归档隐藏、禁止编辑和恢复。关闭/完成的历史记录可保留在归档父客户下；这是明确的业务策略。

## Q-009 — 验证与UPDATE之间的竞态

**原始独立复现**：执行task更新到客户B；在服务层验证结束、写batch开始前让另一条合法SQL将B归档。0001–0004状态下实际接受更新，task version=2且仍active，而其customer已archived。

**修复**：新增 `0005_crm_relation_guards.sql`，对商机/任务的关联、reopen和restore更新实施commit时active父级SQL守卫；冻结的0003未被事后改写。

**独立关闭复测**：同一交错在0001–0005下被拒；task仍归原客户A、version仍1、audit行数未增加。另独立运行 `node scripts/smoke-admin-api.mjs`，32/32通过，含SQL更新/reopen/restore守卫用例。证据范围是Node真实SQLite；Wrangler/远程D1仍需实现者和发布负责人补充。

## Q-010–Q-012 — UI具体可用性修复

- 发现api()将全部409覆盖为“记录已被其他人修改”，掩盖ACTIVE_DEPENDENCIES等业务错误。前端已改为只对VERSION_CONFLICT使用版本冲突文案，其他保留真实错误。
- 发现关联客户只取前100条，规模增长后无法选旧客户；manager也无法取得其他active成员。前端已改为服务端q搜索，root提供安全assignees目录，Team管理仍owner-only。
- 发现record modal不写URL，刷新丢目标记录。前端已添加record/record_type深链和关闭清理。

上述修复由前端实现者报告并经源码复核，待真实浏览器交互确认后关闭。

## Q-013–Q-015 — 备份交叉审查与真实运行修复

后端agent独立审查我实现的备份后指出：事后JSON字节检查无法防止先物化超大notes造成OOM；回读失败但删除失败的R2新对象会污染按原始日期计算的retention。两项均采纳并修复。

- SQL端使用每表JSON的UTF-8字节统计做preflight；同一snapshot事务中的每条data SELECT也包含全库行数/字节guard。预检查后并发增长时，实测所有data SELECT返回0行并报告BACKUP_BYTE_LIMIT。
- 只有payload完整回读验证后才写入 `backups/committed/...` marker。Retention只计marker日期；失败payload即使无法删除，也不挤占可信历史。测试5个失败日期后成功备份，仍保留30个verified日期。未标记的旧版本对象保留，等待人工核验，不静默删除。
- 实际workerd初次发现15表UNION统计报 `D1_ERROR: too many terms in compound SELECT`，Node SQLite未复现该限制。已改为单SELECT内scalar subqueries；真实本地D1/R2再次完整成功，验证JSON1、PRAGMA batch和SQL文本长度契约。
- 实际隔离workerd写入1000条、每notes10000字符后拒绝超限，进程正常；清理自有本地fixture后立即恢复备份成功。未连接生产数据。

最终备份17/17通过，后端agent独立复跑确认两项阻断关闭。源实现与runbook通过路径级diff检查。自有8794测试服务已停止。

## 原子审计语义复核

Cloudflare官方说明batch内语句按顺序非并发执行，且整个batch是SQL事务，一条失败会回滚全部。[D1 batch文档](https://developers.cloudflare.com/d1/worker-api/d1-database/) [D1查询优化文档](https://developers.cloudflare.com/d1/observability/find-expensive-queries/) SQLite官方定义changes()读取最近完成的INSERT/UPDATE/DELETE影响行数，不含低级触发器。[SQLite changes()](https://www.sqlite.org/lang_corefunc.html#changes)

因此“版本化业务写入→WHERE changes()=1的audit→同条件event”的实现有事务与SQLite语义依据。这仍是对D1的合理推断；需要实际Wrangler/D1执行测试证明成功写入、冲突0写入和audit失败回滚三种情形，不能只以Node SQLite通过代替远程D1证明。

## 首次setup降级方案的审查条件

1. 只执行固定迁移版本/固定SQL，不接收SQL、远程URL或任意表名。POST严格同源、CSRF、owner密码重新验证和限流；普通旧cookie不能单独授权。
2. 首次限流表未建立时使用现有KV保护；不能在验证owner前先创建新表。
3. snapshot具有唯一R2键，包含sqlite_master schema、全部业务/身份表及manifest；写入后验证，失败即停止迁移。不能覆盖已有daily备份。
4. 增量DDL和迁移tracking放同一db.batch事务；版本、文件SHA和schema形状相符才可视为已完成。IF NOT EXISTS不能证明已有表正确。
5. 与Wrangler的迁移filename记录保持兼容，并额外记录SHA/backup key；并发setup和重复请求不能重复写业务数据。
6. 回退优先旧Worker代码，保留新增表；不能自动DROP或用旧snapshot覆盖上线后新记录。完整恢复在隔离环境验证。
7. 必测：无owner、无CSRF、跨站、snapshot失败、DDL中途失败、并发setup、重复setup、已有表形状不符、升级后正常CLI迁移状态。

## 后续待执行

1. 后端实现完成后复查所有OPEN项与权限矩阵；执行真实本地D1负向测试。
2. 前端实现完成后检查所有数据出口、HTML注入面、混合币种、假功能、筛选一致性和错误状态。
3. 发布前复查生产数据备份、迁移、部署与CI证据。
4. 发布后以实际URL/版本与最小读写闭环验证，不输出真实客户数据。

## 已执行独立身份函数检查

在仅含0004的Node SQLite内存库执行15项检查，全通过：scrypt正确/错误密码、UTF-8字节上限、staff session读取、raw bearer未存DB、有效/无效/跨源CSRF、角色变更下次请求更新、停用拒绝、logout后token重放拒绝、owner session、secret轮换失效、idle过期、第6次登录阻断。本机单次scrypt约126ms。未输出测试密码hash/token，也未接触生产数据；该时间不能作为workerd性能或生产SLA。
