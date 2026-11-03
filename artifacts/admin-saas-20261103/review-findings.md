# GYUTRON Operations — 独立质量审查

审查者：research_quality agent。开始日期：2026-11-03（Asia/Singapore）。本文件只记录实际检查范围；实现仍在进行，未执行的生产/恢复/多租户测试不视为通过。

## 当前摘要

第一轮检查覆盖 `src/api/backup.mjs`、`src/platform/config.mjs`、`src/platform/csv.mjs`、新增 CRM schema/repository/migration，以及旧管理端/下载路由。未修改这些实现文件。

| ID | 严重度 | 状态 | 发现 |
|---|---|---|---|
| Q-001 | P0 | CLOSED / 实现及隔离运行验证 | 覆盖15张持久表及可选迁移记录；会话仅结构恢复 |
| Q-002 | P0 | CLOSED / 41项及新路由审查 | 新/legacy出口均使用安全CSV，旧signed-cookie入口已替换 |
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
| Q-016 | P1 | FIXED / 冻结源码复核 | 旧详情/历史/route异步回调不再覆盖新视图 |
| Q-017 | P1 | CLOSED / 独立交错回归 | future-version不能把旧header误冻结为新版本 |
| Q-018 | P2 | CLOSED / 日期回归 | 签发业务日与时区随snapshot冻结 |
| Q-019–Q-020 | P1 | FIXED / 独立源码复核 | 财务计算失效与客户快照异步保存窗口已修 |
| Q-021 | P0 | CLOSED-LOCAL / 18项及workerd | 报价两表进入格式3；格式2恢复兼容 |
| Q-022 | P2 | VERIFIED / 文本与离线PDF | 153key德/日；50行6页PDF无缺项，四语UI另验 |
| Q-023 | 交付门槛 | VERIFIED-PREVIEW / 最终ZIP另验 | 63文件manifest/私密扫描、4套测试与bundle通过 |
| Q-024 | P2 | CLOSED / 精确聚合与4语格式化 | CRM总览超safeint金额采用SQL整数块及BigInt |
| Q-025 | P2 | CLOSED / 四语真实PDF | fixed页脚改marginbox，每页ref/counter且无覆盖 |
| Q-026 | P1 | CLOSED / 四语内部备注负向 | 客户print不再包含非冻结internal outcome note |

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

**整体关闭证据**：新admin router不再接受旧signed cookie；旧CRM列表入口转入workspace，order-intents/events由新principal授权的legacy模块保留。两条CSV实现均复用 `workspaceCsv`，权限、过滤、10000行超限与私密字段测试通过；独立复跑API套件41/41。旧 `toCsv`已无管理出口调用。

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
- 明确环境owner与命名员工的不同身份语义。用户后续明确选择共享密码owner入口；该入口持续存在是当前产品决定，不冒充具名员工审计或员工撤销。保留会话撤销、CSRF与限流；不得自主改变用户指定密码或把其长度作为本轮发布阻断。
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

## Q-016 — 详情异步失败不能覆盖后打开的记录

最新UI审查发现openRecord成功分支检查当前modal，但catch未检查；A详情pending→关闭A打开B→A失败时，旧catch可能覆盖B或重开已关闭dialog。loadHistory的catch同样缺少上下文检查；过期route().loadPage()回调也可能打开旧deep-link记录。

前端已修：openRecord每次捕获独立context，success/catch均检查dialog.open与state.modal===context；历史success/catch同样检查；route延迟打开记录前检查expectedLoadId和原hash。独立复核最新冻结源码确认三项guard存在。最终浏览器异步交互仍归root的冻结后检查，不把源码复核称为浏览器通过。

独立renderer检查确认：当前ADMIN_CLIENT、workspace与login输出中的inline style和可执行inline event均为0，攻击样本principal.name正确HTML/JSON转义，嵌入脚本syntax通过。较早源码的CSP inline-style候选不再存在。

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

## Q-017 — future-version请求可签发旧内容快照（已关闭）

独立交错复现：服务层读到v1 header，在写batch之前另一请求把terms改为新值并升至v2；签发请求预先携带v2时，旧实现CAS碰巧匹配当前v2，却将已读到的v1内容冻结。结果签发成功但重打完整性验证失败。

修复后getQuote的header与items通过同一个db.batch读取；所有mutation先比较请求version与已读record.version，再以该record.version执行CAS。明确重复issue/revise/status的幂等返回仍在适当位置保留。独立复跑报价23/23，新增确定性future-version交错用例确认409且无issue audit；重新加载新版本后才可正常签发。

## Q-018 — 签发日期须冻结业务时区（已关闭）

原打印使用UTC字符串截取日期，与Asia/Singapore跨日时的业务日不一致，也可能因以后配置变化漂移。snapshot现保存timezone、issued_date与created_date，打印仅采用冻结日期。独立复跑23项包含UTC Nov2晚间、SG Nov3签发后切换环境UTC仍打印Nov3的回归。

签发前还会重算持久header/items金额并核对一致；打印不仅检查SHA，还校验quote identity、family/revision、内容字段、每行金额和total语义。hash一致不能代替业务完整性。

## Q-019–Q-020 — 报价编辑异步状态（源码复核关闭；浏览器另验）

- 非财务文字输入原先使进行中的财务计算失效，却没有安排新计算，可能长期停留在Calculating。markDirty(financial)现只在财务输入、币种或增删行时失效计算；标题/条款只标记dirty。
- 切换客户时原先存在“已选B、尚为A的recipient”且Save可用的窗口。现更换前明确HTML确认、加载期间禁用整个editor与Save，成功后一次性替换快照并清空商机，失败回退旧客户/商机并保留原recipient。最新源码独立复核，最终浏览器竞态由UI发布负责人另验。

## Q-021 — 报价备份与旧核心恢复兼容（已关闭本地）

格式3加入ops_quotes和ops_quote_items，17张持久表；可选迁移跟踪后实际18表、92schema对象。18项真实SQLite检查保留已签发snapshot/hash和冻结trigger，恢复后实际quoteSnapshot与中文打印验证金额2700。格式2核心备份仍可恢复，再前向应用0006。

独立8794实际workerd+D1/R2已完成新表snapshot、回读、commit marker和retention；root的local-quotes-checks.json另外记录15/15实际本地报价流程与私有R2备份。生产报价格式3在真正发布后另验，不把本地运行写为线上证明。

## Q-022 — 多页报价打印与多语文案

Chrome headless将真实renderer的50行、40条双语条款和长description合成fixture打印成6页A4。全部50个SKU、40个条款marker、中文和USD1,574,208.56均存在，Poppler页图及contact sheet检查未发现裁切或重叠。制品在quote-print-qa子目录，含渲染器hash与文件SHA，不含真实客户数据。该版本续页缺少重复报价编号/页码，作为后续可用性改善记录，任何CSS变更后需重渲染。

新增quote-extra-locales.mjs，德/日各153key，与English153项无missing/extra/空值/placeholder异常。Angebot/見積書、Finalisiert/発行済均不表示已经发送；确认明确无邮件副作用，折扣/税/运费明确手填。frontend遗漏的Unsaved changes已改为词典key。文本与源码检查不等于四语手机视觉验收。

## Q-023 — 独立商业starter文档一致性（审查中）

入口源码只允许/admin、最小health与品牌静态资源，没有公共forms、Data API、Shop映射。模板使用资源占位名，configure脚本离线且不覆盖已有wrangler.toml；新客户必须实际核实资源归属与私密设置。

README错误声称owner有staff同样的12字符强制规则，已由实现者修正并经独立读取确认。恢复runbook示例统一DB binding和REPLACE_PRIVATE_R2_BUCKET，GYUTRON生产已验证事实单列，不指示新客户操作上游资源。

对preview stage独立执行Python hashlib、精确63文件成员、私密路径及真实上游resource ID扫描，全部通过。独立scratch复跑41/29/23/18四套测试及Wrangler4.93.1 dry-run，bundle472.02KiB/gzip123.49KiB；未provision/deploy且原stage未改。另离线copy执行configure八项测试，拒绝占位/全0ID/坏时区/secret参数、阻止覆盖已有配置，Python tomllib验证Unicode/引号/换行名称完整往返。实现者的另一个scratch已执行npm ci；我的这一轮没有重复下载依赖。最终干净commit打包、ZIP hash与成员验证仍待产物生成后执行，preview_only=true不当作发行ZIP。

## Q-024 — CRM总览大额聚合失去minor精度（已关闭）

独立测试写入18,030条真实SQLite合成商机，其中9010条USD商机各1e12 minor，再加1 minor。原实现的SUM结果9010000000000001在Node SQLite驱动触发RangeError；普通JavaScript Number同样不能精确表示该奇数。

仅修改readWorkspaceDashboard：SQL分别SUM整数1e6块与余数并CAST TEXT，JavaScript用BigInt重组。pipeline每组新增amount_minor_exact十进制字符串；旧amount_minor只在安全整数内保留number，超限为null。前端按exact字段BigInt累加并使用Intl整数部分加精确fraction格式化，不经过Number金额转换。

smoke-admin-aggregation五项真实SQLite检查通过，覆盖超safeint末位、MAX_SAFE_INTEGER兼容、币种/阶段分组、零组、归档排除和仅返回聚合行。另实际本地D1执行只读9011行CTE，返回blocks字符串9010000000与remainder字符串1；没有写业务数据。独立提取真实前端money()四语验算USD9010000000004004→90,100,000,000,040.04，JPY仍零小数，unsafe Number明确拒绝。原API41/41回归通过。证据为aggregation-checks.json。

## Q-025 — fixed页脚在Chrome分页错位（已关闭）

四语新版打印初次真实渲染时，页码正确出现在底部，但负bottom fixed footer在第1页消失，在第2–6页出现在约62pt的顶部表头附近。失败证据明确保存在quote-print-qa-v2；不能作为最终验收。

bottom:0离线候选在原50行fixture可回到底部，但占据正文区域，任意长条款仍有覆盖风险。实现者改用受身份保护的报价专属CSS路由和@page marginbox，避免动态reference挤占正文。

独立v3检查四语各6页，每页quote reference与页码完整，50 SKU/40条款零缺失，最小正文至页脚文本44.46pt。四语contact sheet及DE金额页、JA标题/条款页视觉无裁切、方块或覆盖。最新26项API/SQLite也通过，包含CSS路由未登录401、坏ID404、HEAD/no-store、非法lang fallback及CSS字符串escaping。制品在quote-print-qa-v3；v2明确标为失败诊断，旧v1不覆写。

## Q-026 — 内部反馈备注进入客户打印（已关闭）

独立源码审查发现print原先把非冻结record.outcome_note写入客户文件，而UI没有如quote notes明确“打印”说明。人工记录的内部谈判评价可能外泄，也会改变既有签发文件。root明确决定该备注仅内部。

实现者已从renderer彻底移除outcome_note；四语UI既有三个key明确内部性质，quote notes仍为冻结的打印内容。独立复跑26项含四语非空INTERNAL OUTCOME负向检查；v3真实PDF fixture刻意携带非空internal sentinel，四语HTML和PDF均不包含该值，workspace数据仍保留。

## Q-027 — 切换日元后默认零金额阻止核算（已关闭）

实际Chrome中新报价从USD切到JPY后，discount/tax/shipping保留0.00，严格零小数parser拒绝计算。前端只规范化纯零小数尾部（0.00→0、100.00→100），不做汇率换算、不截断非零小数。真实UI按2×12345核算JPY24,690，默认调整值均为0；非零小数仍保留并报错。独立复跑金额61项和规范化8项通过，见frontend-state-checks.mjs。

## Q-028 — 客户关联异步返回清空刚选商机（已关闭）

主agent真实Task UI快速选择Customer和Opportunity后，异步客户过滤结果重建select并清空刚选值；保存后详情Opportunity为空。前端统一关联加载序号与表单上下文保护，加载期禁用机会和提交，失败恢复；远程搜索返回时保留当前选择而非请求发起时的旧值，报价搜索同样处理。

主agent刷新独立Chrome后再次快速选择并保存，新任务详情保留实际OPP关联，活动历史正确联动；前端另执行6项异步检查。任务完成刷新持久、关联活动和CSV真实下载也通过，证据root-ui-workflow-checks.json。没有向生产写入业务fixture。

## 已执行独立身份函数检查

在仅含0004的Node SQLite内存库执行15项检查，全通过：scrypt正确/错误密码、UTF-8字节上限、staff session读取、raw bearer未存DB、有效/无效/跨源CSRF、角色变更下次请求更新、停用拒绝、logout后token重放拒绝、owner session、secret轮换失效、idle过期、第6次登录阻断。本机单次scrypt约126ms。未输出测试密码hash/token，也未接触生产数据；该时间不能作为workerd性能或生产SLA。
