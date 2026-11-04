# GYUTRON 工作台：Alibaba 实际界面对标与逐模块验收

> 2026-11-04，实施前只读基线：`e5bfd2a3c1deee9b1db0d82caf0cd2ed8a303819`，当时在线版本 `2026.11.04.10`。本轮 `.11` 候选已完成独立源代码 / 合同检查与关键模板、移动 / 平板真图复核，已知视觉 P1 已闭合；**发布状态以 Root 的最终 HANDOFF 为准**。本文件不声称已对 22 个模块的所有工作流进行完整可用性审计。Root 独占真实浏览器检查；独立审查只读取源码和已有截图，不操作第三方账户。
>
> 当前用户要求优先：保留 GYUTRON 原始完整 logo 与白底模块、工业零圆角、EN/中文、真实业务数据及隔离 Test mode。借鉴 Alibaba 的运营信息结构，不复制其品牌色、营销内容或账户数据。

## 1. 证据范围与边界

- **源码事实**：来自当前 `src/admin/` 的实际渲染函数、导航和样式，不能当成像素或浏览器行为验收。
- **实际界面观察**：Root 在用户授权的已登录 Alibaba 页面检查，并提供本地截图；独立审查已离线逐张查看 01–12、14–22 共 21 张截图，并读取脱敏 `module-inventory.json` 和 `rendered-geometry.json`。仅记录布局和交互结构，不记录账户名称、客户、金额、订单或其他业务值。
- **导航记录**：侧栏出现一个入口，只证明入口存在，不能证明已深入检查该模块。
- **待验收**：新 GYUTRON 实现必须有对应的新截图、实际操作或执行结果，不能沿用旧版本的通过结论。
- 原始 Alibaba 账户截图仅留在工作区外部输出目录 `outputs/admin-alibaba-benchmark-20261104/references/`，**不加入 Git、商业包或公开报告**。本文件只保留脱敏观察。

| 证据 ID | 对象 | 实际检查深度 | 当前可证明内容 |
|---|---|---|---|
| A01 | Alibaba / Data Adviser / Shop Analysis | Root 已进入页面；独立审查离线查看 `01-alibaba-shop-analysis.png` | 深浅两层导航、顶栏、筛选条、KPI 分组、真实多序列趋势、坐标轴、表格结构；不涉及其他模块的功能结论 |
| A02 | Alibaba / Homepage | Root 已进入；独立离线查看 `02-alibaba-home.png` | 业务提醒、行动建议、实时数据 / 历史 / 广告 tabs、右侧待办；不复制推销 banner 或账户业务值 |
| A03 | Alibaba / Products / Manage Products | Root 已进入并记录结构；独立离线查看 `03-alibaba-products.png` | 首次质量教育 modal 遮挡列表；其后可见状态 tabs、筛选、批量、显示字段，**不是无遮挡完整列表的视觉证明** |
| A04 | Alibaba / Customers / Customer Overview | Root 已进入 `i.alibaba.com/hub/alicrm/home`；独立离线查看 `04-alibaba-crm-overview.png` | 独立客户搜索与管理范围、客户概览与今日活动并列、真实阶段统计；Root 另记录页下员工 / 国家 / 来源分区 |
| A05 | Alibaba / Customers / Customer List | Root 已进入并记录列定位；独立离线查看 `05-alibaba-crm-list.png` | 主名称 / 次公司、筛选 / 选择 / 排序分组、列级筛选、操作列；Root 确认客户与操作列 sticky |
| A06 | Alibaba / Order Management / Order Overview | Root 已进入；独立离线查看 `06-alibaba-orders.png` | 待关注订单、警告信息、订单数据与旁侧服务区分；不证明下级订单编辑 / 支付 / 退款功能 |
| A07 | Alibaba / Marketing Center / 首次截图 | Root 进入并记录导航；独立离线查看 `07-alibaba-marketing.png` | 该旧截图是 shell 与空 canvas，不能单独证明正文；**后续 A22 新截图已补齐真实可见主页** |
| A08 | Media / Tips Videos | Root 实际进入；独立查看 `08-alibaba-content.png` | 可见服务激活条件与退役通知；未激活其业务功能，不等价于已审发布流程 |
| A09 / A11 / A14 / A15 / A18 / A19 | Logistics / Compliance / OneTouch / Verification / Product sourcing / Data Overview | Root 采集 DOM 结构；独立逐图查看 | 对应截图主要是 shell、空 canvas、局部通知或 loading；**只采用实际 DOM 导航 / 表头 / 控件库存，不把图当完整页面视觉证明** |
| A10 | Funds & Finance / Account Overview | Root 实际进入；独立查看 `10-alibaba-finance.png` | 按币种分组的账户摘要与操作层级可见；下级金融 / 提款 / 付款功能未操作，不记录数值 |
| A12 | Store / Store Management | Root 实际进入并记录 DOM；独立查看 `12-alibaba-store.png` | 白色主要卡片在截图中为空；只能证明导航、标题与局部框架，不能证明完整装修编辑器已验 |
| A13 | Activity Center / Campaigns | Root 记录 `connection_closed_not_reviewed` | 连接关闭，**未评估**；不能误写成账户无权限或模块已完成检查 |
| A16 | Business Growth / Merchant Star Rating | 首次导航超时，Root 随后确认加载；独立查看 `16-alibaba-rating.png` | 实际可见评级摘要、规则 disclosure 与建议；Root 另记录双轨 tabs / 指标对比 / 趋势，不记录账户评级值 |
| A17 | Communications / Inquiries | Root 仅查看 inbox list 与导航，未打开任何 message；独立查看 `17-alibaba-messages.png` | 截图当时仍是 loading；采用 DOM 导航库存，不收录通信正文或声称查看回复流程 |
| A20 | Data Adviser / Product Trends | Root 记录表头、控件与 tabs；独立查看 `20-alibaba-product-trends.png` | 图中仅可见三组分析入口；产品表格结构来自 DOM，不是完整表格截图 |
| A21 | Data Adviser / Flow Analysis | Root 实际进入并记录 DOM；独立查看 `21-alibaba-traffic-source.png` | 模块 tabs、日期 / 设备 / 无效流量筛选及流量表头可见；截图的重复入口组不作为应模仿的标准 |
| A22 | Marketing Center / 再次加载 | Root 重新获取完整截图；独立重新查看 `22-alibaba-marketing-loaded.png` | 最新 PNG 已真实显示推广类型 tabs、建议 / 任务型主区、右侧账户 / 权益摘要与更新区；仅评估主页结构，未启动活动或财务操作。新图 SHA256 `a5bdb93c0eb5b369d36a282ef96cf0774480d0283348abf07cfbc6594d310f31`；此前同名过早截图的结论已被本次替代 |
| S01 | GYUTRON 当前 22 个模块 | 独立只读源码审查 | 页面结构、图标字形、按钮与数据映射；不证明最新视觉状态 |
| S02 | `src/admin/saas-styles.mjs`、`layout-client.mjs` | 独立只读源码审查 | 零圆角、焦点和降级动效已有；右侧详情抽屉、三个记录 tabs、紧凑非模态搜索已有 |
| V01 | 新 GYUTRON 改版 | 中间候选已人工审阅；最终证据使用 `verified-*` 与 manifest | Root 发现快循环中个别 PNG 存在滞后一页 / 命名错位，不能按文件名计算最终覆盖；DOM route 与图像证明分开。修后 Analytics 默认 / 展开 / USD 三张 verified 真图已独立逐图确认 |

## 2. Alibaba 模块库存：已看页面与仅导航必须分开

这些截图来自实际已登录运营后台，不是营销落地页。以下区分实际页面、被遮挡页与仅导航。页面名称存在截断时不补猜完整名称。

| 区域 / 模块 | 检查状态 | 记录边界 |
|---|---|---|
| Homepage | **实际已看** | A02，只借鉴实际待办 / 业务摘要结构 |
| Products / Manage Products | **部分已看：有 modal 遮挡** | A03，后台列表结构由 Root 记录；不能冒充完整视觉与操作验收 |
| Products / Commodity Operations、Tools 与其他子模块 | **只导航记录** | 不推断商品发布 / 媒体 / 商品运营实际能力 |
| Customers / Customer Overview、Customer List | **实际已看** | A04 / A05，本轮 CRM 直接对标来源 |
| Customers / Potential Customer → Followers | **只导航记录** | 未深入检查关注者处理流程 |
| Customers / Customer → Open Leads、Customer Group、Recycle Bin | **只导航记录** | 导航存在不证明回收站恢复 / 分组实际工作流已验 |
| Customers / Marketing → Customer Marketing、AiReach、Activities、Templates | **只导航记录** | 不推断自动外发、模板或 AI 工具执行能力 |
| Customers / Settings → Open Leads Settings、EDM Settings、Custom categories | **只导航记录** | 不推断权限配置或邮件服务已验 |
| Order Management / Order Overview | **实际已看** | A06，借鉴待处理状态汇总与异常 / 业务分区 |
| Order Management 下级入口 | **只导航记录** | Root 记录约 10 项，涉及起草、订单、评价、售后、发票、服务和交易数据；未逐一操作 |
| Marketing Center | **最新主页实际已看；下级入口只导航** | Root 库存含首页与 18 个子入口；A22 最新截图补齐正文视觉，不能据此推断所有广告编辑 / 报表 / 账单流程已验 |
| Data Adviser / Shop Analysis | **实际已看** | 本轮首个深度对标页面，见 A01 |
| Store / Data Overview、Data Map、Trade Analysis、Delivery Analysis、Sub-accounts Analysis、Visitor Details | **只导航记录** | 尚不能声称已检查其详情、筛选、图表或操作 |
| Data Analysis / Market Analysis、Product Trends、Keyword Adviser、Flow Analysis、Visitor profiles | **只导航记录** | 尚未深查 |
| Data AI / AI Showcase | **只导航记录** | 不推断其模型、工具或自动化能力 |
| Campaign / Keyword Advertising（入口文本截断） | **只导航记录** | 不推断付费账户权限或投放流程 |
| Resources 及截图下方其他入口 | **未完整记录** | 需后续实际页面或导航证据 |
| 激活 / 权限受限页面 | **A08 可见激活前置；无完整权限审计** | A08 是激活条件页；不把其余空 canvas、连接关闭或未打开误写为权限拒绝 |

### 2.1 主业务领域及真实导航库存

以下来源于 Root 的 DOM 结构记录。每行只说明进入当前页面与其导航被读取，不表示所有子入口均已打开、操作或验收。

| 主业务领域 | 实际记录的子入口 / 分组 | 证据与深度 |
|---|---|---|
| 首页 / Frequently Used | 首页、常用功能和跨业务入口 | A02，首页已看；不推断个性化配置流程 |
| 店铺 Store | Store Decoration、Store Management、Compliance Center；公司资料、交易关税、活动、Knowledge base | A12，导航 / DOM；主卡片未形成完整视觉证明 |
| 商品 Products | Post Products、Manage Products、Commodity Operation Workbench、行业招募、Smart Product Selection、Semi-managed Product Supplement、Product Certificates；Creative Workshop、Photos、Videos、Catalogue、Assortment、Other tool | A03 / A18；管理列表被 modal 遮挡，其他以导航库存为限 |
| 内容 Media | Tips Videos 激活与退役提示 | A08，实际条件页；没有发布视频或激活服务 |
| 数据 Data Adviser | Data Overview、Data Map、Shop Analysis、Trade Analysis、Deliver Analysis、Sub-accounts Analysis、Visitor Details；Market Analysis、Product Trends、keyword Adviser、Flow Analysis、Visitor profiles；AI Showcase、Keyword Advertising、Data School、Data Dictionary | A01 / A19–A21；深度以 Shop Analysis、Flow Analysis 的可见结构为主，Product Trends 另有 DOM 表结构 |
| 营销 Marketing Center | Home page；AI Smart Campaign、Standard Promotion、Smart / Manual Display Keyword、DeepReach、Other Display Ads；Performance / Display Ads Report 与 Diagnosis；Creative Center、Activity Center、Marketing Tools、Operation Log、Showcase、Marketing Performance、Marketing Annual plan、My Billing | A22 最新主页真实可见 + DOM 库存；未逐条启动 / 投放 / 付费 / 读取报表 |
| 活动 Activity Center | 营销活动入口 | A13 连接关闭，未评估正文 |
| 客户 Customers | Customer Overview；Potential Customer / Followers；Customer List、Open Leads、Customer Group、Recycle Bin；Customer Marketing、AiReach、Activities、Templates；Open Leads Settings、EDM Settings、Custom categories | A04 / A05，概览 / 列表已看；下级工作流仅导航 |
| 通信 Communications | Inquiries / All Inquiries、Sent Box、Flagged、Spam、Trash、Export Inquiry、assignment history；My Folders / Ungroup；Product / Company / Other inquiry、RFQ；接待 / 语音视频 / 分配 / 通知渠道 / 黑名单；Service Data Overview、Message Response Data、Manage Message、TM Message Manager、AliCloud Drive、My Services；Draft Order、Order Templates、RFQ Recommend、All Orders | A17，仅 inbox list 与导航；没有打开任何 message 或读取正文 |
| 订单 Order Management | Draft Trade Assurance Order、Order Overview、All Orders、All Reviews、After-sales & Refund Management；Draft ACP+ Invoice、Invoice Management；Trade Service Center、Trade Data、Trading Capital Growth Center | A06，概览已看；订单 / 退款 / 发票实际交易流程未操作 |
| 出口服务 OneTouch | Place An Order、Export Service Order、Dashboard；Brand Property、Product Management、Drawer Management；Customs declaration、Smart HS、Certificates、Seal；Tax refund follow-up、Record Documents、Agent Certificate、Certificate of Entrustment；Compliance Services、Tax Service、AI tax refund、Service Sales Order、Information Management | A14，DOM 有订单状态 tabs / 查询结构；PNG 未证明完整正文 |
| 物流 Logistics | Logistic Proposals、Operating Platform、Logistics order、Shipping Line Templates、Collection Address Management、Logistics Payments and Order Invoice、Customer Rights、Claims；warehouse registration / workbench / inventory / products linked to goods | A09，DOM 导航 / 控件库存；PNG 未证明报价 / 下单页面可见完成 |
| 资金 Funds & Finance | Alibaba.com Pay、Account overview、Amount details、Collection Management、Documents against Payment、Letter of Credit、Withdraw、Payment、Exchange、Financing、Insurance、Fees、Invoice、Accounts and security | A10，账户摘要已看；金融操作没有执行 |
| 服务 / 合规 Help / Compliance | Rulechannel、Complaint irregularities、Intellectual Property、ComplaintCenter、EU Responsible Person；Product Selection / Partner Services / Service Orders；Developer Information、Application & Privilege；Service Account、Bill List、Transaction、Invoice、Promotion、Customer Service | A11，DOM 含申诉表头 / 查询；PNG 未证明完整正文 |
| 认证 Certification | Certificates Management、Certification Home、Onsite Verification、Verification of Supplier、Verification Report | A15，仅导航 / DOM，截图 loading；不推断认证状态 |
| 业务增长 Business Growth | Star ratings、ShopScan、Member Center、Exclusive privilege、Foreign Trade Cloud Classroom | A16，评级页面已加载；其余子页未逐一评估 |

GYUTRON 的 22 个工作台模块与上述 Alibaba 业务领域并非一一同构。借鉴导航、列表、待处理队列、真实图表和渐进配置即可，不能据此宣称已有物流、付款、广告投放、认证或完整 ERP 功能。

## 3. 从 A01 借鉴什么，以及不应照搬什么

Root 记录的首屏结构约为 56px 深色图标 rail、白色次级导航、60px 顶栏、灰色 canvas 与白色工作区卡片、内容左右约 32px 留白。这些是该次页面观察，不是 Alibaba 全站设计规范，也不是 GYUTRON 必须逐像素复制的值。

| 可观察细节 | Alibaba 证据 | GYUTRON 实施方向 | 本轮验收标准 |
|---|---|---|---|
| 分层导航而非一列平铺 | A01：图标 rail + 当前业务的白色次级菜单 | 22 模块按业务层级组织，当前模块与分组清楚；不为了模仿新增无意义 rail | 当前项、展开项、面包屑一致；22 模块均可到达；手机不以隐藏关键操作换取整齐 |
| 筛选集中在数据上方 | A01：行业、设备、日期与日期翻页位于一条紧凑筛选区 | 日期 / 来源 / 币种与当前结果同区；减少重复 Refresh 和分散工具条 | 应用筛选后可看懂当前条件、清除方式和结果数；URL 与刷新后条件一致 |
| 一行 KPI 形成整体 | A01：七个指标同一水平分组，轻分隔而非七张巨卡 | 基于真实已有字段形成简洁指标组；不机械要求七项、不补虚构值 | 标题、数值、单位、范围分清；未采集数据明确无数据；零值与不可用区别显示 |
| 图表给出可读参照 | A01：蓝 / 绿 / 黄三序列、有 Y 轴、日期轴；Root 另观察到底部 legend | 只画 GYUTRON 已具备的真实序列，标单位、时间、币种和来源；不捏造行业均值或领先值 | 曲线和表格口径一致；金额不跨币种相加；可读数值与无数据状态；键盘或旁表有等价读数 |
| 表格是主要工作区 | A01：排序表头、清晰列边界和状态 | 紧凑且可扫读的主字段、次字段、状态、金额、行操作 | 表头和数据对齐；排序状态可辨；长内容不盖邻列；横向滚动局限于表格而非 body |
| 语义线性图标 | A01：导航与主要操作使用统一 outline 图标 | 复用现有 Lucide，同尺寸 / 线宽 / 对齐；只给有意义的控制加图标 | 不以 emoji 或字体字形代替关键控制；图标按钮有 EN/中文可访问名称 |
| 空值仍保持真实 | A01：指标可以为零，不用虚构店铺值填满 | Live 与 Test mode 明确区分；Live 空态可引导下一步 | 不生成虚假增长率、趋势、客户数或“已验证”状态；演示数据始终标为演示 |
| 明暗权重清楚 | A01：导航、筛选、数据区层级明确 | 保留 GYUTRON 白 / 灰基础、紫色语义动作、零圆角 | 不复制 Alibaba 橙色或营销 banner；增加层级不增加标题堆叠和过多边框 |
| CRM 是独立业务工作区 | A04：客户搜索 / scope；概览与今日活动并列；A05：名称 / 公司 / 负责人 / 状态 / 操作列 | 客户、任务、活动、商机之间有明确关联与上下文；当前关键动作靠近内容 | 搜索在正确资源执行；选择 / 筛选 / 排序状态不混淆；打开 / 关闭详情保留列表上下文 |
| 复杂列表用明确工具分层 | A03 被遮挡后层与 Root 结构记录：状态 tabs、advanced filters、batch、customize fields；A05：列级筛选与一条选择 / 排序区 | 将 GYUTRON 已有列控制 / 保存视图 / 批量操作编成稳定工具区，而不是继续叠卡片 | 功能一项不丢；筛选可展开收起；选择状态 / 当前页范围 / 批量结果明确 |
| 首页围绕下一步工作 | A02 / A06：待办、待关注状态和警告有独立区 | 首页优先呈现真实未完成任务、未处理收件、失败运行与有明确范围的入口 | 只展示服务端可验证计数和可达记录；无数据仍诚实显示，不制造“业务机会” |

**不盲目照搬现有缺陷**：A03 的大型首次教育 modal 会遮挡主要工作区，不应为了“像大平台”新增；A07 的空画布不是合格空态。A06 还可见未解析占位符 / 空时间表现，GYUTRON 验收必须拒绝 `null`、`undefined` 和未替换的模板变量进入正常用户界面。这里不保存相应账户字段或数值。

### 3.1 实际测量样本，不泛化为品牌规范

Root 的脱敏 `rendered-geometry.json` 记录了 Data Adviser 样本：次级导航 14px / 32px 高 / x=70 / width=157，字体栈含 OpenSans；少量 pagination 控件为 28px、100ms linear 过渡。另有控件字体 / 大小 / radius 差异。这说明该平台本身跨模块也有多个年代的组件，**不能把一个抽样控件的字体、圆角或动效外推成全站统一标准**。GYUTRON 保持自托管 Inter / 中文系统回退、用户指定 0 圆角及 reduced-motion；移动触控目标依据实际可操作性验收，不照搬桌面 28px。

## 4. 基线源码问题与实施追踪

“当前事实”列固定描述本轮接管基线，不把实施前缺口当成后续候选仍未修改。关闭状态需要区分源代码、执行合同与实际视觉证据。

| ID | 当前事实与位置 | 实施要求 | 状态 |
|---|---|---|---|
| UI-A01 | `client.mjs` 的 `renderCommandNavigation()` 枚举遗漏 Activity，实际 shell 有 22 模块 | 快捷导航与真实模块 registry 同源，并保留权限过滤 | 候选已从真实 `data-nav` 生成；独立源码确认；`verified-search-desktop.png` / `verified-search-390.png` 中 Activity 已实际可见；键盘全流程不以截图冒充 |
| UI-A02 | `renderOverview()` 五张 `.metric-card` 是静态 div；各 section 另有 View all | 给有准确筛选合同的指标提供钻取；无准确合同则保持诚实摘要，不能假装计数对应错误列表 | 候选 pipeline 使用 `closed=false`、逾期使用 `overdue=true` 并提供筛选上下文 / 清除；其他任务 / 收件入口明确为全部 / 打开；独立 demo 33 场景通过，视觉待验 |
| UI-A03 | CRM 列表依次叠加 heading、saved views、filters、bulk bar、table | 视觉合并视图 / 筛选 / 列控制，保留原私有视图、列偏好及逐项批量结果 | 待新截图与操作 |
| UI-A04 | Analytics 的 page heading 和 filter form 各有 Refresh；Reports / Sources / Automations / Rules 的页面标题后又有同义 panel 标题 | 每页一处主标题、一处主操作区；内容分区必须有额外信息价值 | Analytics verified 真图已去重复 Refresh；Root 后续将分区改为 Connections / Generated reports / Schedules / Rule library，源码语义已收敛；不以旧 loop PNG 假称这些改名已逐页重新截图 |
| UI-A05 | 多处仍渲染 `↗`、`↻`、`←`、`→`、`✓`、`☰`、`×` 作为功能图标；导航则使用 Lucide | 统一功能图标；保留文本语义和 aria 名称，不只替换为另一套字体 | 候选使用共享 61 项 Lucide HTML 数据，独立检查 61 个 literal 调用无缺失；实际尺寸 / 语义 / 数量仍待视觉复核 |
| UI-A06 | `.empty-symbol` / `.empty-mark` 已在最终 CSS 隐藏；22 个 admin `.mjs` 严格 UTF-8 解码无替换字符 / 非法控制符 | 不能把隐藏旧字形或历史叠字错误称为当前可见乱码 | 源码已确认；新视觉另验 |
| UI-A07 | Overview stage bar 是基于真实 count / max 的 4px SVG；Analytics 已有真实趋势与按日明细，但趋势只显示首尾日期且无可见 Y 轴数字 | 增强可读轴、单位、图例或旁表，不用装饰图冒充数据 | Overview 新真图已显示水平阶段 / 真比例 / won-lost 状态；Analytics 新轴 / 图例 / 排行来源于真实 controller，独立 icons-chart 12 场景通过；待最终图表实图 |
| UI-A08 | Settings 重复完整 Team、Role、Security、Backup 内容，已有对应独立页面 | 偏好页聚焦工作区元数据和偏好；管理摘要明确跳转，不重复长表 | 视觉栅格 / 表格已收敛，768 真图可读；完整内容去重仍作为 P2 增强项，不假写已实现 |
| UI-A09 | 桌面行操作按钮 28px；任务完成按钮 17px，手机媒体查询未扩大这些行内热区 | 粗指针设备扩大实际点击区域，保留紧凑图标；不覆盖名称 / 邻近动作 | 待实际手机几何与操作 |
| UI-A10 | `focus-visible`、160ms 状态过渡、搜索 / drawer 入场及 `prefers-reduced-motion` 已有 | 保留；新动效只表达真实状态改变，不加长加载、虚假数字增长或假完成 | 待本轮交互 / 降级验证 |
| UI-A11 | **P1，首轮真图发现**：Analytics 将六币种金额连在单个大号数字区域，数值小数位跨行，首 KPI 撑高整行 | 多币种总览使用清楚的币种数量 / 每币种独立金额列；单币种选择后再显示大号主数值；不能靠 break-all 拆分钱数 | **已闭合：源码 + 执行合同 + 真图**。35/35 demo、12/12 icons-chart；独立查看 `verified-analytics-en-desktop.png` / `verified-analytics-currencies-open.png` / `verified-analytics-usd.png`，默认摘要、展开六行与单币种主值均完整，钱数不拆位 |
| UI-A12 | **P2，首轮真图发现**：Paused 自动化的 Enable 按钮仍是 pause 图标；演示 Daily 08:00 的 next run 与时刻不一致 | 图标与当前动作一致；演示计划也遵循真实业务日历 | Enable 候选已用 play、暂停用 pause；Root 统一 daily seed / PATCH 的 next schedule，35 场景加入真实日历断言并通过；源码 / 合同关闭，未假称重做全部计划运行视觉流程 |

源码事实不等于所有体验问题已找到。不能据上述清单宣称 Alibaba 或 GYUTRON 的所有页面已做完整可用性审计。

## 5. 22 模块的具体交付与验收矩阵

以下是本轮实施目标。实际状态见第 7 节分层登记；只将确有新证据的部分改为通过，不以共享模板或源码测试冒充 22 模块完整可用性验收。

| # | 模块 / route | 当前结构重点 | 可验收的改版结果 | 不能牺牲的真实合同 |
|---:|---|---|---|---|
| 1 | Overview / `#overview` | 五项摘要、管道阶段、待办 / 活动 / 报告 / runs | 业务范围和数据时间可读；重要待处理项优先；指标与趋势有层级；对应入口不虚假钻取 | BigInt 精确金额、各币种分开；不造环比或全量阶段数据 |
| 2 | Analytics / `#analytics` | 日期 / 来源 / 币种、KPI、真实趋势、排行、对账、按日表 | 单一筛选区；轴 / 单位 / legend 清楚；市场 / 产品排行更易比较；钻取保留筛选 | 已付订单金额是退款前订单值；付款净流入不是会计净营收；不重复加付款 |
| 3 | Customers / `#customers` | 表格、视图、列、批量、右侧详情 | 客户 / 联系人层级明确；工具栏收敛；行 hover / focus 和抽屉操作一致 | 具名关系、联系人主联系人、CAS / 归档守卫、私有视图、演示列偏好隔离 |
| 4 | Pipeline / `#pipeline` | 六阶段 board / table、分页与当前页记录 | 阶段标题 / 数量、金额 / 预计日期可扫读；切换模式位置稳定 | 当前页计数不假称全量；不装饰性跨币种汇总；无拖拽能力就不伪装可拖 |
| 5 | Quotations / `#quotes` | 列表、全页编辑器、只读文档 | 草稿 Save、签发、修订、打印的主次清楚；长 SKU / 金额不覆盖；状态和 revision 清晰 | 精确 minor / 整数数量、签发快照不变、内部反馈不打印、demo 本地打印 |
| 6 | Tasks / `#tasks` | 列表完成控制、优先级、截止日 | 逾期与优先级易辨；完成状态有真实反馈；触控热区可用 | 失败不显示成功；版本冲突保留输入；归档 / 未完成依赖不被视觉简化绕过 |
| 7 | Inbox / `#inbox` | 四类网站收件、状态、转换 | 类型 tabs / 状态 / 当前筛选清楚；内部备注与转换 CTA 明确 | 不把内部记录称为已发信；保留四类真实合法状态与幂等关联 |
| 8 | Activity / `#activity` | 内部活动表与记录详情时间线 | 时间 / 类型 / 客户 / actor 可扫读；时间线或分组基于真实时间 | 页面明确是内部记录，不冒充邮箱同步 / 电话发送；快捷导航不遗漏 |
| 9 | Data sources / `#sources` | 来源、导入 / 同步历史、collector、导入三步 | 来源健康 / 最后同步 / 故障优先；导入步骤可定位；技术安装下沉 | CSV 预览与提交分开、逐行结果、续传幂等；不假称云端能读本地磁盘 |
| 10 | Reports / `#reports` | 生成列表与实际报告正文 | 无同义重复标题；类型 / 范围 / 生成时间 / 阅读 / 打印层级清楚 | 仅实际生成报告；不假称自动发送；打印不暴露工作台内部控制 |
| 11 | Automations / `#automations` | 日历时间 / 间隔计划、执行历史、durable runs | 计划与运行分区；真实步骤 / 等待 / 失败 / 重试易辨；进度来自保存检查点 | 64step / 90s 及单请求超时边界；未知响应先确认；离开不撤销已保存工作 |
| 12 | Business rules / `#rules` | 13 条真实规则、配置 / 版本 / 历史 | 条件 → 行动 → 作用范围的人话摘要；长 config 不撑散表格；低频编辑渐进展开 | 启停 / 排除策略 / priority / 幂等历史真实，不把配置列表包装成无实际执行的规则 |
| 13 | Agent / `#agent` | 会话、检索来源、输入、上下文 / 模型 consent | 历史 / 回答 / 来源 / 输入清楚分区；高级上下文渐进展开；无模型状态诚实 | 默认不外发；真实引用；8 份资料限制；外部调用必须明确同意且不能替换为假成功 |
| 14 | Memory / `#memory` | 记忆 / 知识文档、查询 / 归档、正文 | 种类切换和查询紧凑；来源 / 分类 / 有效性 / 版本可读；详情正文可维护 | 仅文本 / Markdown，200KiB / 份，8 份上下文；不冒充 PDF / Office 解析 |
| 15 | Model settings / `#models` | 服务商 / endpoint / key / usage | 真配置状态和最近测试清楚；Save 与 Test 分级；高级字段有合适说明 | 不暴露已保存 key；改服务商不沿用旧 key；demo 不请求真实 provider |
| 16 | Users & access / `#users` | 真实成员 / role / enabled | 人员、权限、状态与操作易扫读，当前用户有明确识别 | 不把共享密码访问虚构成具名员工；owner / manager 权限不因新入口改变 |
| 17 | Security / `#security` | 当前会话与数据 / 访问边界 | 当前会话和策略分组、状态可辨、说明简短准确 | 不伪造安全分数、MFA 或审计认证；服务端角色 / session / CSRF 继续生效 |
| 18 | Backup / `#backup` | 最近验证 / 新鲜度 / 历史 / 下载 | 最近有效快照、是否过期、可操作历史突出；校验 / 下载动作区别 | 真实 R2 验证与模拟标签分开；不在 UI 自动恢复生产；敏感下载仍受认证 |
| 19 | License / `#license` | 自有部署 / 签名 / activation 历史 | 部署状态与许可状态分清；历史可读；操作只在可用时出现 | 不捏造已付款订阅 / 在线 billing / 租户服务；自有部署现有功能不被假激活阻挡 |
| 20 | Health / `#health` | 版本 / migration、probes、同步健康 | 最近检查时间、active probe、binding 配置、失败来源分清 | 配置存在不等于主动探测通过；没有真实历史不能画 uptime / SLA 图 |
| 21 | Audit / `#audit` | action / actor / entity / time | 业务标签优先、raw code 次级；筛选与事件定位方便；长 ID 不挤压摘要 | 不伪造 actor、不删除实际审计；未映射事件保留真实 code，不猜中文意义 |
| 22 | Preferences / `#settings` | 身份、Team / Security / Backup、语言 | 聚焦工作区元数据和偏好；管理摘要清楚跳转，减少重复堆叠 | 真实 timezone / role / 独立部署边界；语言仅 EN/中文；不更改密码或持久业务数据 |

## 6. 横切门槛与最终证据要求

1. **视觉门槛**：真实 CSS viewport 320 / 390 / 768 / 1440；记录实际 `innerWidth`，不把缩放后的整页缩略图当手机布局。EN/中文分别覆盖标题、长行、表单、菜单、抽屉和搜索滚到底。不能只以 body 无横溢证明文字未被裁切。
2. **品牌与控件**：原始 logo 完整、不重绘、不压扁；工作区 / 登录页自定义 element 与 pseudo-element 的 computed radius 为 0。图标同源、名称可访问、focus 可见；手机主要触控操作实际命中，不与邻近动作重叠。
3. **信息与图表**：有值、有零值、有不可用的状态分开；时间 / 币种 / 单位 / 来源明确。hover tooltip 不能是唯一读数；无同比基数不画假增长。当前页与全量数据的口径明确。
4. **工作流回归**：真实保存 / 签发 / 完成 / 归档 / 转换 / 运行后读回；冲突、取消、等待、失败都有明确状态，旧 route 异步响应不覆盖新页。保留既有功能，不以空壳替换旧模块。
5. **Test mode 合同**：22 导航与真实模块同源覆盖，UI 改动同步 synthetic fixture / adapter / EN/中文；下载 / 打印 / collector / 链接 / 退出不绕过到 live。`npm run check:admin-demo` 必须通过，但此检查不等于视觉通过。
6. **启动与发布**：保留 `npm run check:admin-startup` 的实际 Wrangler 编译后完整 IIFE 启动，EN/中文 × Live / Test 首屏均验证；源码 parse、API HTTP200 或 asset hash 本身不足以证明页面已启动。Root 负责最终 source gate、commit、CI、正式包、上线和实际线上资产对应。

## 7. 本轮结果登记

| 阶段 | 当前结果 | 限制 / 下一证据 |
|---|---|---|
| 基线源码 / 接管 | HEAD 与 origin/main 相同；只读审查 22 模块；保留现存 untracked QA 证据 | 本独立审查不改 runtime；本轮最终发布仍由 Root 执行 |
| Alibaba 实际页面 | 21 张截图已独立逐张复核，并核对 Root 脱敏 DOM / 几何记录 | Shop Analysis、Home、CRM 概览 / 列表、订单概览、资金摘要、评级、Flow Analysis 有实际可见结构；Products 遮挡，多个 PNG 未完成 hydrate；区分 DOM 库存与视觉证明；无账户业务数据入 Git |
| GYUTRON 候选执行合同 | 独立执行 `npm run check:admin-demo` **35/35**、`node scripts/test-admin-icons.mjs` **12/12**、`node scripts/check-admin-frontend.mjs` **69/69**；61 个 literal 图标调用无缺失 | 证据对应冻结的 `.11` 候选；没有浏览器、生产 API 或外部模型调用；不证明像素 / 触控 / 最终线上版本 |
| 冻结候选完整编译启动 | 独立运行 `npm run check:admin-startup` **7/7**，Wrangler 4.93.1 当前源码真实编译，EN/中文 × Live/Test 完整 IIFE / 首屏 / reload、两个永久负向检查与旧 .9 实际失败复现均正确 | `2026-11-04T02:56:02.007Z`；compiled workspace SHA256 `9d3df78d93304725194f9c337fee9a0d945e0cd4da6ea9250c0d328e4a5c1df9`；不注入 helper shim。Live reply 是隔离 VM fixture，Test 无业务 fetch；此项不冒充线上 / 像素验证 |
| 最终真实浏览器首屏合同 | Root 单次明确 target 的完整 full-goto 重跑 EN/中文 × 22 模块，共 **44 行**，最终同次写入 `browser-checks.json`；独立读取文件核对 **44 行、failed=[]** | 每行 expected / 实际 route 与 h1 一致、busy=false、Test mode=true、viewport=1536、overflow=false、rounded=0、errors=[]。这是 Root 的实际浏览器 DOM 合同检查，不等于 44 张图片都已独立深度视觉审查 |
| GYUTRON 首轮桌面视觉（中间观察） | 独立逐张按实际画面 / h1 辨认，已看到 22 种模块首屏：EN 的 11 个业务模块；ZH 的 Rules / Agent / Memory / Models / Users / Security / Backup / License / Health / Audit / Settings | **旧快循环截图存在时序风险，降级为中间观察，不作为最终 22 route 覆盖**；最终只认 `verified-*` 与干净 manifest。该轮发现的 Analytics P1 已经 verified 图关闭；P2 依下行和逐项追踪登记，不沿用旧图宣称最终已验。演示记录英文正文不等于 UI 漏翻 |
| 后续 P2 收敛 | Root 报告分区命名、Backup 历史时间格式、typed 审计实体 ID 与日历 next run 已修，并在完整 22 套 source gate 中通过 | 后续 copy / fixture 修改不混写成 02:56 独立编译 bundle 的字节；根最终构建 / 发布证据负责绑定最终源码；Settings 内容去重、License 事件可读标签仍是增强项 |
| 最终独立复核 | 已逐张复核 18 张 `verified-*` 图，覆盖关键桌面模板、抽屉 / Related / 搜索、320 / 390 / 768 的实际响应式；已知视觉 P1 闭合，无新增阻断 | 不把旧 loop 文件名当 44 页视觉证明；不宣称所有 22 模块、全部尺寸、全部 CRUD / 键盘 / 外部模型调用都已独立深测。Root 已报告 viewport 恢复 1536 与 console errors 为空；部署 / 线上字节由其独立记录 |

### 7.1 已确认的 verified 图像

图像位于外部 `outputs/admin-alibaba-benchmark-20261104/`，不包含 Alibaba 账户资料。使用 `verified-screenshots.json` 的实际 route / h1 / 语言 / viewport 与离线画面逐项核对。

| 图像 | 实际画面 / 范围 | 独立结论 |
|---|---|---|
| `verified-analytics-en-desktop.png` | EN / Analytics，实际 viewport 1536 × 673，默认所有币种 | KPI 带恢复正常摘要；六币种数不冒充总金额；只有一处 Refresh；无本轮可见 P1 |
| `verified-analytics-currencies-open.png` | EN / Analytics，同一 viewport，金额明细展开 | 六个币种 / 精确金额独立成行，不拆小数位；展开造成的行高属于可控明细状态 |
| `verified-analytics-usd.png` | EN / Analytics，同一 viewport，USD 筛选 | 单币种主金额完整、筛选状态可见；不显示其他币种合计 |
| `verified-overview-en-desktop.png` | EN / Overview，1536 × 673 | KPI 整体层级和常显入口清楚；六阶段真实比例与 won / lost 色彩可辨；各币种金额独立，未见新的 P1 |
| `verified-customers-en-desktop.png` | EN / Customers，1536 × 673 | 视图 / 筛选处于同一列表框；客户 / 联系人主次、状态、操作对齐；未见新的 P1 |
| `verified-customer-drawer-desktop.png` / `verified-customer-related-desktop.png` | EN / Customers 真实详情与 Related tab，1536 × 673 | 右侧抽屉、两列属性、三个 tab、联系人及关联区可见；轻遮罩与固定 footer 未盖住当前可见业务内容；未冒充写入 / 键盘实际验收 |
| `verified-search-desktop.png` | EN / Customers 上打开紧凑搜索，1536 × 673 | 右上独立面板，header / results / footer 不叠字；Activity 快捷入口真实存在；不遮整页 |
| `verified-customers-390.png` / `verified-search-390.png` | EN / Customers 与实际打开搜索，390 × 844 | 是真实手机重排而非全页缩略；顶部操作、筛选 / 视图、搜索内部滚动与 footer 可读，无本轮可见 P1 |
| `verified-customers-320.png` | EN / Customers，320 × 740 | 标题 / 操作 / 工具栏真实换行；长视图与表格各自局部横滚，不把可横滚列的暂时不可见误判为缺失或 body 横溢；未见新的 P1 |
| `verified-navigation-320.png` | EN / 320 × 740，实际移动导航打开 | 白底原始 logo 完整、当前项和分组清楚，独立导航滚动与底部账户区可见；未见新的 P1 |
| `verified-overview-320.png` / `verified-overview-zh-320.png` | EN / 中文 Overview，320 × 740 | 指标组真实重排、数值和入口可读，阶段比例未被缩成整页缩略图；EN 极窄屏 View all 的箭头换行为 P2，无覆盖 |
| `verified-agent-zh-320.png` | 中文 Agent，320 × 740 | 历史 / 当前会话分成竖向布局，标题和正文清楚；该张只到 composer 上沿，底部另由下列专门图补证 |
| `verified-settings-zh-768.png` | 中文 Settings，768 × 1024 | 工作区属性、团队表格单列布局与角色标签完整；未见角色竖拆或 body 横溢。内容去重依然是增强项 |
| `verified-analytics-768.png` | EN / Analytics，768 × 1024；Root 另测趋势 / 容器均约 703.2px、单列 | 曲线、Y 轴、日期轴、legend 与排行分区可读，未被压成过窄的并排图；原平板图宽问题已关闭 |
| `verified-agent-composer-zh-320.png` | 中文 Agent，320 × 740，实际滚到输入 / checkbox / submit / 上下文选项 | 输入区、三个上下文勾选、提交按钮、折叠高级选项完整可见；只验证布局，**没有执行发送或外部模型调用** |

Root 最后以纯 CSS 修正极窄屏 text-link 的 icon 换行，并隐藏手机中文重复的第二个“演示” badge；最后 composer 真图已实际显示单个紧凑标签。像素与操作证明按上表范围，不扩写为所有 22 页、所有宽度与所有交互都已逐一深测。

### 7.2 最终范围与继续维护

- **已经交付的本轮结构**：统一 outline SVG 控件与语义动作、灰色 canvas / 白卡 / 原 logo、紧凑 KPI 带、真实比例阶段行、列表工具区、可读轴 / 图例 / 排行、准确币种摘要、右侧详情分区、移动端重排。源代码变更和发布由 Root / 实施 owner 管理，本审查没有覆盖或回退其文件。
- **执行合同保持**：35 个 demo 场景零网络 / 零生产数据访问；12 个图标 / 实际控制器图表场景、完整编译启动负向检查继续作为维护门槛。后续文案 / fixture 小修的最终 22 套 source gate 是 Root 报告，不能混同为本审查 02:56 编译产物的每字节来源。
- **明确增强项**：Settings 的重复管理内容可进一步归并；License 事件码可增加业务标签。此次没有增加自助多租户、计费、物流 / 付款 / 广告投放，也没有把引用的 Alibaba 子模块导航冒充已深查工作流。
- **证据存放**：原始 Alibaba 图仅本地外部输出目录；Git 只保存本脱敏标准。`verified-screenshots.json` 用于 18 张具体图像的实际路由 / 语言 / 尺寸。早期跨 cell closure 写出空数组的问题已由 Root 重新实际检查解决，最终稳定 `browser-checks.json` 已独立确认有 44 行且无失败；不要复用旧空文件或快循环错名 PNG。所有最终上线版本、CI、资产 hash、回退由 Root 的 HANDOFF / 发布记录承接。
