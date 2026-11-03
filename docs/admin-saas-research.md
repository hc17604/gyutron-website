# GYUTRON Operations — 产品基准与开源路线

研究日期：2026-11-03（Asia/Singapore）。本文件记录本次改造的设计依据，不代表下述能力均已实现。实际发布状态以 `HANDOFF.md`、验收证据和生产检查为准。

## 1. 产品定位与判断

建议将第一版定义为 **GYUTRON 工业销售与服务运营工作台**：把真实官网线索、询价、客户、销售商机和跟进任务组成可操作的闭环。核心使用者是负责人、销售人员和服务人员。首页应直接回答“有什么需要处理、哪些商机需要推进、谁负责、下一步是什么”。

“对标全球优秀产品”应表现为准确的数据模型、流畅工作流、清楚的权限边界和可靠发布，不应表现为复制大量菜单或展示虚构营收。本次研究没有进行市场排名，因此不把任一参考产品表述为经过客观验证的“全球第一”。

四小时可集中交付经过验证的生产版本和可扩展基础；完整 ERP 涉及库存、采购、制造、财务与本地会计规则，不能仅凭 CRM 界面宣称完成。ERPNext 官方把这些列为不同业务领域。[ERPNext 官方产品文档](https://docs.frappe.io/erpnext/introduction)

## 2. 官方产品基准

| 产品 | 官方依据 | 对 GYUTRON 的应用判断 | 本次边界 |
|---|---|---|---|
| Salesforce | 商机以销售阶段推进，可关联客户和联系人；阶段体现当前销售进展。[官方机会工作流](https://trailhead.salesforce.com/content/learn/modules/leads_opportunities_lightning_experience/work-your-opportunities) | 客户与商机分开建模；商机具有负责人、阶段、金额、币种、预计关闭日期和下一步 | 不实现未经验证的 AI 评分或预测精度承诺 |
| HubSpot | 统一对象模型支持联系人、公司、交易、任务与对象关联。[官方对象说明](https://knowledge.hubspot.com/records/understand-objects?tab=tab-crm) | 记录详情集中显示关联关系与活动；从线索进入客户和商机时保留来源 | 不显示未接通的邮箱、通话或营销自动化为已启用 |
| Linear | 可保存筛选后的列表或看板为自定义视图，支持键盘进入和预览。[官方自定义视图](https://linear.app/docs/custom-views)；搜索可直接过滤当前列表。[官方搜索](https://linear.app/docs/search) | 采用稳定侧栏、紧凑工作区、清晰筛选、键盘访问和可返回的记录详情 | 快捷键应避开输入框；移动端使用等价可点击操作 |
| Odoo CRM | Pipeline 提供阶段、下一步与预期销售额视图，并支持线索整理。[官方 CRM 模块说明](https://github.com/odoo/odoo/blob/19.0/addons/crm/README.md) | 用看板表达商机进展，用列表支持批量阅读；将业务状态和跟进动作放在同一上下文 | 不冒用 Odoo Enterprise 模块或功能授权 |
| ERPNext / Frappe | ERPNext 覆盖多个运营领域；Frappe 提供其应用框架。[ERPNext 官方介绍](https://docs.frappe.io/erpnext/introduction) | 新领域按独立模块增加；保留迁移、权限、审计和数据导出的统一约定 | 库存与财务属于后续独立范围，不与现有 Shop 订单或支付逻辑混用 |
| Twenty CRM | 工作区围绕 people、companies、opportunities、tasks、notes 等记录展开。[官方布局文档](https://github.com/twentyhq/twenty/blob/main/packages/twenty-docs/getting-started/core-concepts/layout.mdx) | 保持清晰对象导航、统一详情与关联记录；留出后续自定义字段入口 | 本次不直接移植其整套平台或商业功能代码 |

以上最后两列是本项目的设计推断，不是参考厂商对 GYUTRON 的背书。

## 3. 建议首发范围

1. **Overview**：真实待处理询价、开放商机、到期任务及最近活动；无数据时给出清楚的空状态和下一步。
2. **Inbox**：现有 leads、RFQs、support、downloads 的筛选、详情与状态处理，保留来源和原始信息。
3. **Customers**：公司/客户基础信息、联系人信息、负责人、来源及备注；关联商机与任务。
4. **Pipeline**：明确的销售阶段、列表/看板、阶段更新、金额与币种、预计关闭时间；关闭成功/失败应可辨识。
5. **Tasks**：负责人、截止日期、状态、关联客户/商机；完成状态刷新后仍保存。
6. **Activity / Audit**：记录关键业务变更，保留操作者、对象、时间和变更类型；审计记录不提供普通编辑入口。
7. **Workspace / Settings**：展示真实工作区和当前身份；仅暴露实际可用的管理动作。权限由服务端执行。

阶段建议为 `new → qualified → proposal → negotiation → won / lost`，名称可以适配工业销售。阶段是业务判断，不自动等于付款、发货或会计收入。

## 4. 开源与商业许可选择

开源允许的商业用途、代码分发义务和产品商标是不同问题。以下是工程选型摘要；发行制品应以锁定版本的 LICENSE、NOTICE 和第三方清单为准。

| 基础或产品 | 2026-11-03 核实结果 | 本项目的发行要求 |
|---|---|---|
| Frappe Framework | MIT。[官方 LICENSE](https://raw.githubusercontent.com/frappe/frappe/develop/LICENSE) | 采用其代码时保留版权和许可文本；独立商业应用可选自身许可 |
| ERPNext | GPLv3；Frappe CRM 则是 AGPLv3，二者不能混同。[Frappe 官方许可汇总](https://docs.frappe.io/legal/others/license-and-trademark) | 若分发 ERPNext 或衍生版本，应按 GPL 处理相应源码与许可义务；不能把 GPL 产品重新宣称为完全私有授权 |
| Odoo Community | LGPLv3。[Odoo 19 官方 LICENSE](https://raw.githubusercontent.com/odoo/odoo/19.0/LICENSE) | 采用、修改和分发时履行 LGPL 及被采用依赖的条件；审查每个附加模块自身许可 |
| Odoo Enterprise / Proprietary Apps | Enterprise 需有效订阅；商业应用另受许可限制。[Odoo 官方许可文档](https://www.odoo.com/documentation/19.0/th/legal/licenses.html) | 不把公开可见源码等同于可免费复制或转售；本次不引入其商业源码 |
| Twenty | 主体 AGPLv3；标注 Enterprise 的文件受商业许可；指定 SDK、UI 等包使用 MIT，并有应用接口附加许可。[官方仓库 LICENSE](https://raw.githubusercontent.com/twentyhq/twenty/main/LICENSE) | 如修改主体并提供网络服务，应处理对应源码提供义务；使用具体 MIT 包仍须核对包级许可和保留通知；不能笼统宣称整套 Twenty 为 MIT |
| workerd | Apache-2.0。[官方 LICENSE](https://raw.githubusercontent.com/cloudflare/workerd/main/LICENSE) | 如分发运行时或其衍生制品，保留许可/适用通知及修改说明 |
| SQLite | 官方将源代码置于 public domain。[SQLite 官方版权说明](https://www.sqlite.org/copyright.html) | 仍须逐项审查与其打包的其他依赖及应用资产 |

MIT 的商业使用权伴随保留版权和许可通知的条件。[OSI 官方 MIT 文本](https://opensource.org/license/mit) Apache-2.0 的分发要求包括许可副本、变更说明和适用的归属通知。[Apache 官方文本](https://www.apache.org/licenses/LICENSE-2.0.html) AGPL 的网络源码义务应按实际修改与集成方式评估，不能将“放在 SaaS 服务器运行”理解为自动免除。[GNU 官方 FAQ](https://www.gnu.org/licenses/gpl-faq.en.html#AGPLv3InteractingRemotely)

Frappe / ERPNext 等商标不随软件开源许可自动授权；GYUTRON 不应暗示官方合作或获得背书。[Frappe 官方商标政策](https://frappe.io/erpnext/license-trademark)

## 5. 本次架构建议

保留现有 Worker 和数据库，新增明确的 CRM 领域模块、受保护的管理 API、数据库迁移和独立前端资源。这样可继续使用现有真实询价与线索，避免大范围数据迁移和替换网站运行方式。

Cloudflare D1 是托管数据库，使用 SQLite SQL 语义；兼容大部分 SQLite SQL 不等于所有运行环境可直接互换。[D1 官方概述](https://developers.cloudflare.com/d1/) [D1 SQL 兼容说明](https://developers.cloudflare.com/d1/sql-api/sql-statements/) 因此合适的说明是“基于开源 Web/SQL 技术构建，部署于现有 Cloudflare 基础设施”，不宣称整个托管平台已经开源或已验证完全自托管。

可迁移性应通过版本化 SQL、数据导出、应用/数据库边界和部署文档体现。若将来采用 ERPNext 或 Twenty，作为单独项目评估其运行栈、身份体系、数据库迁移、源码义务及实际总维护成本。

## 6. 可商用声明边界

- **生产可用内部版本**：有真实持久化、明确身份边界、服务端校验、可恢复部署、审计和可追溯验收。是否满足，以证据判定。
- **可向客户交付的独立部署版本**：还需安装/升级/恢复手册、可配置品牌、第三方许可清单和客户数据出口，并实际验证第二套隔离部署。
- **公开售卖多租户 SaaS**：还需成员身份、服务端工作区隔离、角色权限、租户生命周期、计费/配额、滥用控制、隐私/删除流程、监控和恢复演练。没有验证的能力不能写成已完成。

本次不能用虚构客户、示例营收、假在线成员或永远成功的按钮制造成熟度。生产数据为空时呈现真实空状态。混合币种分开统计；Pipeline 金额标为潜在金额，不能显示为已确认收入。未接通的邮件、支付、库存或 AI 功能应留在工程路线图中，不作为已启用功能。

## 7. 后续演进顺序

1. 先使线索、客户、商机、任务的闭环可重复完成并保留审计。
2. 验证第二个工作区的隔离、成员撤销和权限负向用例。
3. 完成恢复演练、依赖许可清单、部署模板与升级兼容验证。
4. 再引入计费、公开注册、邮箱连接和跨系统自动化；每项使用真实连接状态和独立验收。
5. 库存、采购、制造和财务按单独领域设计，并与现有 Shop 的边界协调。
