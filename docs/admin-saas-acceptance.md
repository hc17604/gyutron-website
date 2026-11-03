# GYUTRON Operations — 发布验收矩阵

更新：2026-11-03（Asia/Singapore）。本矩阵区分已执行的本地测试、实际Worker运行、真实浏览器、生产检查和商业交付范围。`通过`仅指所列场景与证据；`部分`保留明确缺口；`未实现`与`不适用`不计为已具备能力。生产未创建客户、商机或报价测试样本，业务写入闭环在隔离本地环境验证。

## 当前发布与证据快照

生产已上线`2026.11.03.2`，应用源码`eca97d0b9be901ea531afeffe6852135c3098a11`；CI`41601647771`成功。生产0003至0006增量已应用。正式独立源码包源commit为`b4c2b06133d136c0e593a9988e468578e6bfaa61`，与eca97d0应用代码一致，追加了已核实的交付文档。包保持冻结，后续验收补充不重写已发布的制品。

以下证据路径除脚本外均位于`artifacts/admin-saas-20261103/`。

| 层次 | 当前已执行结果 | 证据与范围 |
|---|---|---|
| 核心自动检查 | **119/119**：API41、auth29、quotes26、backup18、aggregation5 | `scripts/smoke-admin-{api,auth,quotes,backup,aggregation}.mjs`；真实SQLite，R2故障行为另用mock，不冒充远程运行 |
| 实际本地Worker | **核心16/16、报价15/15** | `local-worker-checks.json`、`local-quotes-checks.json`；后者含实际D1/R2格式3备份。旧核心17项包含当时可选manual backup，当前报告以16项为准 |
| 本地业务浏览器 | 客户/商机、任务完成刷新、活动与CSV、报价签发修订、询盘转换、两标签冲突及HTML归档恢复 | `frontend-qa.md`、`root-ui-workflow-checks.json`、`local-intake-ui-checks.json`、`local-conflict-archive-ui-checks.json` |
| 四语与窄屏 | Overview四语×320/390/767/1440，共16案例；另验DE已签发报价、JA Settings及JPY。生产中文总览/报价/Settings另实测精确768px均无整页溢出 | `locale-responsive-checks.json`、`frontend-qa.md`、`production-768-boundary-checks.json`。本地矩阵的767不改写为768；生产768是100%缩放下另一次实测，不能概括为四语全部功能覆盖 |
| 实际生产 | **最终12/12**；五资产与提交相同、四语密码单字段、身份/CSRF/退出、0006、新鲜格式3私有R2回读、官网/Shop | `production-core-final-checks.json`，时间`2026-11-03T09:46:27.570Z`，核验源b4c2b06与eca应用代码相同，`backupVerified:true`；首次上线检查另保留在production-core-quotes-checks |
| 生产浏览器 | 原生密码登录、中文总览；320px总览/报价无整页溢出，drawer及焦点、应用console无捕获错误 | `production-browser-checks.json`及production-final截图；未创建生产业务fixture，不宣称物理触摸设备或读屏认证 |
| 实际生产快照隔离恢复 | 格式3 **122,140字节、18表、92schema对象**；计数一致、integrity=ok、FK=0、旧会话/限流行=0 | `production-r2-isolated-recovery.json`；真实R2可信payload/marker。另恢复全新本地D1，实际workerd密码登录、9资源200、0006、退出重放401；不是remote restore |
| 多页客户文件 | 英中德日各6页；50 SKU/40条款零缺失、每页编号/页码、内部反馈排除、正文页脚间距至少44.46pt | `quote-print-qa-v3/`。v1保留历史，v2标明失败诊断，不混为最终截图 |
| 合法极端打印 | 四语各3页，MAX_SAFE数量/零单价、长SKU/描述和1e12合法金额完整，无跨列覆盖 | `quote-print-edge-qa/checks.json`；数量两行完整，与单位列间隔至少10.50pt。无需改源码或正式包 |
| 正式商业包 | **64文件、257,955字节**；Python CRC/SHA/精确成员/manifest/私密排除及20项入口检查通过 | `commercial-package-independent-checks.json`；无重复安装依赖或生产操作。包源b4c2b06，SHA见D节 |
| 现有站点与发布门槛 | Astro132页build、verify:all、agent/deploy检查、Worker dry-run与CI通过；Shop120项、public-sync 0差异 | 已发布的eca97d0/CI41601647771与工程HANDOFF；独立包5套检查、487.09KiB dry-run另过 |
| 固定速率持续运行 | **已完成**：核心9601秒/21203请求，报价5400秒/12660请求，合计33863，均0非预期错误 | 两报告`final:true`、driver均exit0，自有服务停止；见`soak-summary.json`及两报告。仅隔离固定速率，不是生产负载或高并发SLA证明 |

### 历史检查点 14:48核心首发

14:48（Singapore）的`fa373c7`/`2026.11.03.1`通过生产11项，含实际staff scrypt创建/登录、viewer拒写与停用撤销、私有R2备份。15:05的`ab80aae`密码单字段版本通过9项复验。对应`production-core-checks.json`与`production-core-password-only-checks.json`，作为历史记录保留，不代表当前报价版本仍待开发。

当前GYUTRON共享密码入口遵循用户明确选择；不记录密码值，不再自主轮换，不把长度标志作为本轮发布阻断。命名成员和可选team入口属于独立配置能力，默认界面只要求密码。没有外部渗透测试、合规认证、生产恢复操作或长期SLA证明。

## A. 当前生产版本的发布门槛

| ID | 级别 | 可观察的通过标准 | 当前状态与证据 |
|---|---|---|---|
| AUTH-01 | P0 | 未登录不能读取业务数据，JSON API明确拒绝；页面登录墙不带业务内容 | 通过：本地/生产未认证与旧cookie负向；正式包20项入口检查 |
| AUTH-02 | P0 | 错误密码被拒、连续失败限流、无凭证关闭访问 | 通过：auth29及实际本地Worker；不在生产执行爆破 |
| AUTH-03 | P0 | Cookie具HttpOnly/Secure/SameSite/Path，过期或篡改拒绝 | 通过：auth、workerd及生产安全Cookie检查 |
| AUTH-04 | P0 | 写请求含CSRF防护、跨源提交拒绝，覆盖登录和退出 | 通过：路由负向与生产缺CSRF/跨Origin检查 |
| AUTH-05 | P0 | 退出撤销当前服务端会话，退出后重放拒绝 | 通过：本地、生产及实际恢复后的workerd重放401 |
| SEC-01 | P0 | SQL值绑定，表/列/排序参数有服务端白名单 | 通过：独立源码审查与SQL/API注入负向 |
| SEC-02 | P0 | 所测恶意文字在HTML、属性、JSON及客户打印中作为数据输出 | 通过已测样本：escaping/XSS向量、严格CSP、实际打印；不宣称外部渗透认证 |
| SEC-03 | P0 | CSV公式、换行、引号及响应头不造成注入 | 通过：安全CSV负向、本地Worker及真实浏览器4行1228字节下载 |
| SEC-04 | P0 | 请求体、文本、分页有上限；非法日期/枚举/数值给合理4xx | 通过：API/auth/quote边界、流读取上限与日期回归 |
| SEC-05 | P0 | 私有响应no-store/noindex，错误不泄漏秘密或SQL堆栈 | 通过：本地/生产headers、HEAD及错误负向 |
| SEC-06 | P0 | 数据出口不能通过导出、资源或打印绕过身份权限 | 通过：角色/路由负向；正式包仅登录墙或401/404，无quote内容泄漏 |
| DATA-01 | P0 | 客户新建、编辑后刷新保持，详情深链可恢复 | 通过：真实UI持久化/深链及workerd独立读取 |
| DATA-02 | P0 | 商机关联有效客户，金额/币种/日期正确，非法关系被拒 | 通过：SQLite/workerd；客户快速切换至商机的真实UI竞态修复并独立复验 |
| DATA-03 | P0 | 任务负责人、期限、关系与完成状态持久保存 | 通过：root-ui-workflow任务创建、完成后整页刷新及数据库关系核验 |
| DATA-04 | P0 | 询盘转换保留来源；重试不重复创建客户/商机 | 通过：真实收件箱状态/备注刷新、转入CRM/跳转；独立API重放与SQL精确1/1/1，见local-intake-ui-checks |
| DATA-05 | P0 | 并发写不静默覆盖，失败保留输入且不显示成功 | 通过：实际两tab A先存/B冲突，B输入与Save恢复、无成功toast，SQL只保留A；独立HTTP补证409/VERSION_CONFLICT |
| DATA-06 | P0 | 业务、审计和event在事务中一致提交或回滚 | 通过：真实SQLite审计失败回滚、stale无ghost、workerd业务检查 |
| DATA-07 | P0 | 筛选/分页与导出一致，超限明确拒绝而非静默截断 | 通过：多页/筛选/导出SQL与Worker；实际浏览器下载 |
| DATA-08 | P0 | 不混加币种，不把商机/报价当营收；大额不丢minor精度 | 通过：aggregation5、实际本地D1整数块、四语BigInt格式化、JPY实机 |
| DATA-09 | P0 | 空库显示真实空态；数据库失败显示错误，不能伪造零统计 | 通过：空库/失败注入；生产中文总览真实空CRM与实际询盘 |
| DATA-10 | P0 | 归档确认清晰、关联规则合理、可恢复且不丢数据 | 通过：SQL active依赖守卫；实际HTML归档→只读归档列表→HTML恢复→刷新，最终v4保留A值 |
| MIG-01 | P0 | 空库/基线可执行迁移，旧表单记录继续可读 | 通过：本地0001–0006；远程0003–0006；生产旧运营页可读 |
| MIG-02 | P0 | 远程迁移前有私密备份及恢复点，不提交真实业务数据 | 通过：0006前108352字节SQL、SHA与隔离integrity/FK0，原文件私密 |
| MIG-03 | P0 | 当前代码/schema兼容，回退目标明确且不丢新表能力 | 通过：生产0006/.2；回退下限为已知quote-aware 2026.11.03.2（eca/b4c同代码）。.1遇新报价表安全拒绝备份，不是完整回退目标；未执行生产回退 |
| UX-01 | P0 | 加载、空、错误、成功状态明确，保存失败保留输入 | 通过：真实UI流程；两tab冲突及缺必填保留输入/无新记录，见local-conflict-archive-ui-checks |
| UX-02 | P0 | 键盘焦点可见，对话框/移动导航关闭焦点合理 | 通过所测流程：drawer隐藏/焦点圈定/菜单焦点恢复、HTML确认取消与保存；未做读屏或物理设备认证 |
| UX-03 | P0 | 窄屏/桌面可用，无整页横向溢出，表格局部滚动 | 通过所测范围：四语Overview×320/390/767/1440，DE issued报价同宽，JA Settings320；生产总览/报价320，另生产总览/报价/Settings精确innerWidth768均无溢出，Settings桌面侧栏可用。保留本地767原始读数 |
| UX-04 | P0 | 可读标签、非仅颜色状态、减少动态效果支持 | 通过：DOM标签/语义状态、text-contrast静态审查、reduced-motion与焦点检查；不是完整无障碍认证 |
| UX-05 | P0 | URL模块/记录深链及刷新恢复，返回明确 | 通过：客户详情深链、报价独立路由及刷新；过期异步回调有上下文回归 |
| UX-06 | P0 | 已列核心入口提供真实结果，不展示虚构业务或假集成 | 通过：各模块真实API；实机询盘/任务/活动/搜索/报价/System，外发邮件/收款未冒充启用 |
| BRAND-01 | P1 | 硬边、信息层级、紧凑布局与品牌token一致 | 通过：四语桌面/窄屏、生产截图及共享品牌源码 |
| OPS-01 | P0 | Worker dry-run、平台smoke、Astro build与verify通过 | 通过：发布门槛与CI；Astro132页、正式包dry-run487.09KiB |
| OPS-02 | P0 | agent/deploy/diff检查通过，Shop与public同步边界保持 | 通过：已提交发布/CI；Shop120与public-sync 0，后续仅验收文档补充 |
| OPS-03 | P0 | 生产URL实际提供新版和正确资源，官网与Shop正常 | 通过：.2生产12/12，五资产与eca97d0一致，原生登录及320px实机 |
| OPS-04 | P0 | CI成功、生产浏览器无捕获应用错误，核心写读有真实验证 | 通过：CI41601647771、production-browser；写读闭环在本地真实Worker完成，生产不创建业务fixture |
| OPS-05 | P0 | 当前状态、迁移、部署、恢复与限制有维护资料 | 通过：HANDOFF、项目计划、runbook与商业手册；最终持续运行数字在结束后追加 |

两tab报告明确区分证据层：浏览器未暴露那次UI请求的网络status，直接观察了冲突文案、输入和按钮状态，并核对DB；独立本地stale PATCH补证HTTP409。没有把补证冒充浏览器捕获。

## B. 对外商业交付及尚未具备的SaaS能力

当前可交付的是经过制品验收的**每客户独立实例源码包**。下表保留对共享库多租户、自助生命周期、真实客户落地与运营承诺的额外要求；包可用不等于这些要求已自动满足。

| ID | 级别 | 要求 | 当前状态与边界 |
|---|---|---|---|
| TEN-01 | P0-SaaS | 服务端成员关系决定租户，伪造tenantId不能切换 | 不适用共享库模型：当前每客户独立Worker/D1/R2/KV，无tenantId切换能力 |
| TEN-02 | P0-SaaS | 所有数据出口和关联均隔离 | 替代模型部分已验：专用入口、空迁移、独立本地状态；第二个真实客户资源部署未验 |
| TEN-03 | P0-SaaS | 新客户不继承GYUTRON遗留业务数据 | 制品通过：ZIP无业务数据/导出；实际第二客户新实例仍需验收 |
| TEN-04 | P0-SaaS | 跨租户关联被服务端/DB拒绝 | 共享库跨tenant不适用；当前同客户关系guard通过，跨真实客户实例资源归属待交付时核实 |
| RBAC-01 | P0-SaaS | owner/manager/sales/viewer服务端权限明确 | 通过：四角色负向API；默认GYUTRON仍只密码入口，显式team模式可另配并验收 |
| RBAC-02 | P0-SaaS | 停用/重置/角色变更撤销会话，owner不可被普通成员移除 | 通过：staff撤销/角色实时读取；owner为部署秘密身份，按用户决定保留 |
| RBAC-03 | P0-SaaS | 普通成员不能读取hash、环境秘密或私密安全值 | 通过：序列化投影/权限检查，无用户hash或secret出口 |
| LIFE-01 | P0-SaaS | 自助注册/邀请/加入/退出/删除租户闭环 | 未实现：无自助租户生命周期或邮件邀请 |
| LIFE-02 | P0-SaaS | 租户删除/导出/保留不影响其他客户 | 部分：实例内归档/导出已验；租户删除生命周期及多客户策略未实现 |
| REL-01 | P0-SaaS | 实际隔离恢复，并在承诺前测量RPO/RTO | 恢复功能通过：真实生产R2→隔离SQLite→全新本地D1/workerd；remote restore与生产RPO/RTO未执行/量测 |
| REL-02 | P0-SaaS | 真实监控、告警接收者和故障响应演练 | 部分：observability、event、health存在；实际告警接收/升级及演练待落实 |
| REL-03 | P0-SaaS | 资源耗尽降级及受控负载边界明确 | 部分：实际workerd容量超限明确失败；隔离固定速率持续运行33863请求、0非预期错误已完成。未验高并发、跨租户配额或SLA |
| LIC-01 | P0-SaaS | 发行依赖、应用权利与品牌范围准确 | source-only制品审查通过：lock/DEPENDENCY-MANIFEST、APPLICATION-LICENSE及technology-notices；不分发Node/Wrangler二进制。自研源码使用权、客户商标许可及具体商业合同仍须落实，制品通过不是法律合同完成 |
| COM-01 | P0-SaaS | 服务范围、价格、支持与隐私协议符合实际能力 | 部分：能力/资源/运维边界有手册；对外价格、隐私及客户服务合同尚未完成 |
| COM-02 | P0-SaaS | 付费订阅支付/续费/取消/退款与权限变化 | 不适用：无自助订阅或支付功能，不作为已有能力销售 |
| COM-03 | P0-SaaS | 第二个真实客户完成安装/升级/备份/导出验收 | 未完成：源码包/本地隔离恢复已验，不冒充真实第二客户部署 |

## C. 审查分工

每阶段由实现者自检，并由其他角色交叉检查。后端与独立质量互审业务/备份，前端与独立质量检查状态及文案，发布负责人执行实际D1/R2、浏览器和生产核验。发现、复现、修复与关闭证据见`review-findings.md`；多个agent的结论仅代表实际检查范围。

## C2. 工业报价验收

一份报价使用单一币种。quantity为1至Number.MAX_SAFE_INTEGER的正安全整数；每行extended、小计和最终金额独立不超过1e12 minor，折扣不得超过小计。税费/运费/折扣是手填固定金额，不自动计算税率、汇率或税务规则。

| ID | 必须验证的行为 | 当前状态与证据 |
|---|---|---|
| QUOTE-01 | 1–50行、description必填、数量整数、单价非负 | 通过：真实SQLite边界及实际workerd |
| QUOTE-02 | BigInt精确运算，中间值和最终值分别设cap | 通过：精确向量、subtotal溢出、折扣边界负向 |
| QUOTE-03 | fixed金额与币种单位一致，USD两位/JPY零位 | 通过：API/持久化/打印；真实USD5675及JPY24720/24690计算，纯零切币种回归 |
| QUOTE-04 | 2×1234−68+100+200=2700，存储与输出一致 | 通过：API/恢复/中文打印2700；真实UI另用USD5675和JPY向量，不把不同fixture冒充同一向量 |
| QUOTE-05 | 有效同客户关系、archive/reassign/restore并发保护 | 通过：SQL guard/race与workerd冲突 |
| QUOTE-06 | draft CAS和items替换原子，无ghost audit或半套明细 | 通过：50行、stale、audit失败回滚 |
| QUOTE-07 | sales可起草/修订，manager/owner签发和记录结果，viewer只读 | 通过：各角色负向API及路由 |
| QUOTE-08 | 签发冻结所有客户文件字段、issuer及业务日期 | 通过：snapshot/hash/语义与冻结时区日期回归 |
| QUOTE-09 | issued header/items不可变，CRM后改不漂移 | 通过：API/直接SQL；实际UI R01保留5675，R02草稿3676 |
| QUOTE-10 | 重复/并发issue幂等，future-version不能签旧内容 | 通过：CAS交错独立复现后修复、确定性回归 |
| QUOTE-11 | 仅一个后继、family/revision唯一、并发revise不分叉 | 通过：唯一约束/并发重试及本地workerd |
| QUOTE-12 | 外部结果人工记录，内部反馈不打印，无发信/收款副作用 | 通过：四语非空内部备注负向及真实PDF；UI明确internal |
| QUOTE-13 | draft标识、issued来自校验snapshot；打印及专属CSS受认证 | 通过：HTTP/CSP、401/登录墙、HEAD/no-store、CSS escaping |
| QUOTE-14 | 长明细/中文/条款A4分页与金额清晰 | 通过：v3四语各6页、50 SKU/40条款齐，每页ref/counter，间距至少44.46pt |
| QUOTE-15 | 角色限定可逆归档，不永久删除issued历史 | 通过：API/SQL与实际workerd |
| QUOTE-16 | 报价表/snapshot/hash恢复完整，格式2可恢复再升级0006 | 通过：backup18；实际生产格式3隔离恢复18表/92schema及workerd |
| QUOTE-17 | 迁移前备份、0006、CI、实际部署hash/API/R2验证 | 通过：SQL108352字节隔离恢复、eca97d0/CI41601647771、生产12项及格式3回读 |
| QUOTE-18 | 正式包无私密数据/上游资源ID，源码迁移依赖清单一致 | 通过：b4c2b06正式64文件，独立Python ZIP/manifest/blob/20入口及configure检查 |

`scripts/smoke-admin-quotes.mjs`26项已独立复跑。EN/中文/DE/日本語核心各399key、报价各153key精确对应；固定文案与数字locale支持四语，业务正文不自动翻译。截图/几何范围、失败候选与最终PDF分别留存，不把源码、静态检查或局部页面结果写成所有浏览器全覆盖。

## C3. 大额总览聚合

`scripts/smoke-admin-aggregation.mjs`5项真实SQLite检查包含18,030条合成商机。9010条各1e12 minor加1得到精确字符串9010000000000001；旧amount_minor仅在安全整数内保留number，超限为null。验证币种/阶段、零组、归档及仅返回聚合行；实际本地D1只读CTE验证SQL整数块，四语前端formatter与JPY零小数通过。证据`aggregation-checks.json`，不代表负载SLA。

## C4. 持续运行状态

两轮均已实际完成，driver退出成功，自有服务停止。来源为独立loopback workerd/D1/R2，source provenance见`soak-source-provenance.json`；汇总为`soak-summary.json`。未向生产发送负载请求。

| 实例 | 固定源码 | 实际时长 | 请求 | 备份 | 非预期错误 |
|---|---|---|---|---|---|
| 核心 | `fa373c7` | 9601秒 | 21203 | 8 | 0 |
| 报价 | `eca97d0b9be901ea531afeffe6852135c3098a11` | 5400秒 | 12660 | 5 | 0 |

报价轮另记录签发90、修订90、预期冲突270、打印270、归档360、会话撤销8。两报告均为`final:true`，合计33863请求；`errors:[]`指非预期失败，不把用于验证保护的预期409算成意外错误。

延迟数值只代表各driver保留的最近至多20000个样本窗口，不能解释成完整全程分布或生产SLA。固定速率持续运行不宣称高并发、真实生产压力、长期可靠性、跨租户配额或外部渗透测试。

`soak-independent-review.json`另完成34项独立核对，包含时间算术、每轮请求/计数推导和145个固定副本源文件hash稳定；不重复运行测试或制造生产请求。

## D. 当前发布记录与后续移交

| 项目 | 已核实记录 |
|---|---|
| 实际生产应用 | `2026.11.03.2`；源码`eca97d0b9be901ea531afeffe6852135c3098a11` |
| CI | `41601647771`成功 |
| 生产检查 | `production-core-final-checks.json`17:46最终12/12及新鲜私有R2回读；原生/320px及精确768浏览器检查另有报告 |
| 远程迁移与备份 | 0003–0006已应用；0006前SQL108352字节，SHA与恢复信息见`production-pre-quotes-backup-verification.json` |
| 实际R2隔离恢复 | 格式3/122140字节，SHA`2798fbd2a4499e1232b31696115286556d9cf53cf6ddaffc1d68c812bc2b6bdd`；18表/92schema/计数一致/FK0/session0，fresh D1+workerd通过 |
| 正式独立包 | 源`b4c2b06133d136c0e593a9988e468578e6bfaa61`；`gyutron-operations-20261103082117-b4c2b06133d1.zip`，257955字节/64文件 |
| ZIP SHA-256 | `685761dc700961e75442c41a87e5ac57026f0d5180c8b28b5ec0c1477d32a943`；独立Python CRC/成员/manifest/Git blob/私密排除通过 |
| 兼容回退目标 | 已应用0006时选择已知quote-aware `.2`（eca/b4c应用代码相同）；`.1`会安全拒绝包含新表的完整备份，不作为完整功能回退目标 |
| 最终技术复核 | 两soak及34项独立统计/源hash、合法数量边界打印、生产最终12项均通过。计划窗口13:50–17:50；实际交付记录由发布负责人在窗口末复核后填写，不伪填未来结束秒 |
| 不在已验范围 | 生产数据库恢复、真实第二客户落地、远程RPO/RTO、实际告警接收演练、物理设备/读屏认证、合同/计费/共享库多租户 |

测试记录均为明确的隔离合成样本。生产私密备份与恢复SQL不提交，不公开客户行，不发送测试外部消息。后续维护按`HANDOFF.md`、`admin-commercial-deployment.md`和`admin-backup-recovery.md`执行；具体回退兼容下限以上表为准。
