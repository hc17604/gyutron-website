# GYUTRON 官方商城 shop.gyutron.com — 工程交接（shop 独立站单一事实源）

> 这是 **shop 独立站**的交接文档。shop 与主站 gyutron.com 在同一个仓库、同一个 Cloudflare Worker 部署，但**对主站任务 shop 是 out of scope**（主站文档反复强调"绝不碰 public/shop"）。反过来：**做 shop 时，本文件 + 仓根 `AGENTS.md` 里的「Store ...」规则是权威**。
> 与用户交流用**中文**；GYUTRON 品牌名在可见文案中保持**大写**；i18n key / URL / 文件路径保持原样。
> 🔄 双代理协作：Claude + Codex 都可能动 shop。**开工 `git pull` 对齐 origin/main，收工更新本文件并 push。**

最近更新：2026-08-03（接手时先 `git fetch && git pull`，确认 `HEAD == origin/main`）

---

## §1 这是什么

**GYUTRON Official Store**（`shop.gyutron.com`）：工业自动化产品的**静态多页电商独立站**（纯 HTML/CSS/JS，非框架），三语 en/de/ja。

- 页面（都在本 `shop/` 目录）：`index`(首页) `products`(列表) `product`(详情,`product.html?sku=`) `cart` `checkout` `account` `about-us` `contact-us` `contact-engineer` `request-quote` + 政策页（`payment-methods` `privacy-policy` `return-refund-policy` `shipping-policy` `terms-of-service` `warranty-policy`）。
- 资源：`shop.css`(样式) `shop.js`(购物车/交互) `shop-i18n.js`(`window.GYUTRON_SHOP_I18N`，三语文案 + 产品 i18n)。

## §2 当前状态

### 2026-08-03 商城格式恢复与 checkout 隔离重构

- **纠正后的改动边界**：共享 Header、Footer、`shop.css`、`shop.js`、15 个非 checkout 模板及其 90 份 en/de/ja 源文件和 `public` 镜像均恢复到 `d5315f9` 基线；`public/shop-analytics.js` 也恢复原版。首页、列表、详情、购物车、账户、政策页、搜索、移动菜单和产品卡不再承受 checkout 的视觉或交互覆盖。
- **checkout 专属资源**：只有 `templates/shop/checkout.html`、`shop/checkout.css`、`shop/checkout.js` 及对应三语生成物承载新界面。`checkout.css` 的选择器全部以 `.checkout-page` 为作用域；普通商城页面不加载 `checkout.css` 或 `checkout.js`。
- **架构**：继续使用现有静态多页商城、原购物车、三语路径与 Cloudflare Worker；**没有使用或引入 PrestaShop、React、Vue 或新电商平台**。
- **四步 checkout**：01 客户/公司；02 收货/账单；03 配送审核/采购信息；04 订单申请/形式发票申请。桌面为左侧可回改流程 + 右侧 sticky 订单摘要；900px 以下改为顶部原生 `<details>` 可展开摘要。手机端保持原商城双行 Header。
- **三语与无障碍**：原 `window.GYUTRON_SHOP_I18N` 内容保持基线，仅在同一 `shop-i18n.js` 末尾追加 checkout 专属 `window.GYUTRON_CHECKOUT_I18N`，en/de/ja key 同构且只由 `checkout.js` 读取。表单有真实 label、正确 autocomplete/input type、文本错误、`aria-invalid`、首错焦点、返回/编辑步骤、键盘操作和 reduced-motion 处理。
- **支付真实状态**：**未接通真实支付**。页面不展示 Card、PayPal、Bank Transfer 或 Purchase Order 付款，不接收或保存完整卡号、CVC、银行账户或支付凭据，也不显示虚假付款成功；当前按钮是 `Submit order request` / `Request proforma invoice`。
- **订单真实状态**：`/api/order-intents`、D1 migration `0002_order_intents.sql` 和后台审核边界保留。接口只接受联系人、企业、地址、采购字段和 SKU/数量/配置，递归拒绝支付数据与客户端价格/总额；创建的是 `pending_review` 申请，不是已付款订单、库存预留或自动履约。
- **物流真实状态**：没有承运商实时费率、固定免邮、实时库存/交期或 ETA 规则；快递/货运、预计发货/到达、运费、关税、进口税与偏远地区费用均明确为人工审核和正式报价后确认。
- **账户真实状态**：没有账户/登录后端，因此 checkout 明确为 Guest checkout，不显示 Create account，不采集密码。
- **安全生成方式**：唯一 shop 生成命令是 `npm run shop:build` / `python tools/build_shop.py`，只写 `shop/`、`de/shop/`、`ja/shop/` 及对应 `public` 路径；生成器会为 de/ja 保持原本地化 `shop.js` 链接。禁止运行旧 `i18n:build`、`i18n:sync` 和 `tools/generate_localized_site.py`。
- **验证**：隔离无头 Chrome 在 1440/1024/768/430/390 下完成 77 项 checkout 断言和 8 张三语截图；无横向溢出、控制台错误、支付字段或三语乱码。Shop smoke 120/120、Platform smoke 34/34、i18n gate/audit、Astro build + `verify:all`、Wrangler 523 个静态资产 dry-run 均通过；本地 Worker clean-path 与三语 checkout 资源均为 200，含价格字段的 order-intent 被 400 拒绝。证据见 `design-qa.md` 和 D 盘 `artifacts/shop-qa-20260803/`。
- **已知限制**：真实支付、实时库存、自动税费、承运商报价/追踪、账户体系、自动开票和自动履约仍未配置；启用这些能力需要业务规则、供应商账户和密钥。
- **回滚**：对本次纠正提交执行 `git revert <本次 fix(shop) 提交 SHA>` 后 push `main`。原商城视觉基线为 `d5315f969899f64a9004091ee93ea9c7afe3b289`。D1 migration 为只新增表的兼容迁移，代码回滚不要求删除表，以免破坏已记录的审核数据。

- **三语 i18n 已铺开**：每页带 hreflang 备用链（`shop.gyutron.com/shop/`、`/de/shop/`、`/ja/shop/`，x-default=en）；产品 i18n 在**所有** shop 页面加载（不只首页）；产品规格表 key+描述值、产品标签、固定汇率本地货币均已本地化。
- **de/ja 长文案适配**：产品卡操作按钮已为长德/日标签压缩；超长标题 wrap/hyphenate 防德语 hero 溢出；移动端菜单面板已本地化（曾硬编码英文，已修）。
- **行为埋点与询盘增强（由 Worker 注入）**：Worker 通过 HTMLRewriter 给 shop HTML 注入 `/shop-analytics.js`；匿名行为仅采集 `product.viewed`(product.html?sku=) + `cart.added`(localStorage 购物车数量 diff) → `POST /api/shop-event`（source=gyutron-shop，白名单+限流+不存 ip/session/PII）。同一脚本也将 Request Quote、Contact Engineer、Contact Us 表单安全提交到同源 `/api/rfq`、`/api/support`、`/api/contact`，并使用 Turnstile；这些 API 必须保持在 shop 静态 clean-path 映射之前。

> 详细的近期改动看 `git log --oneline -- shop`。

## §3 部署

- shop 随主站同一 Cloudflare Worker 托管：构建产物落在 `public/shop`、`public/de/shop`、`public/ja/shop`。
- ⚠️ **做主站任务的代理绝不碰 `public/shop*`**；做 shop 任务时按 shop 自身的生成/同步流程更新这些路径（确认当前 shop 的构建/同步方式后再动——shop 是静态多页，部分页面可能是直接编辑或经脚本生成，先 `git log`/看 `scripts/` 与 `tools/` 确认）。
- 品牌 logo 复用主站 `gyutron-logo-purple.png`（浅底），**不要**用生成的/重画的 logo。

## §4 约定（shop 专属，权威同时见仓根 `AGENTS.md` 的「Store ...」条目）

- **响应式必查**：每次改动都要过 desktop / iPad / iPhone；常见宽度 1440/1024/768/430/390 下 header、logo、CTA、hero、产品卡、footer、下拉都要整齐。
- **Header 对齐**：header 容器 `width: calc(100% - clamp(48px, 5vw, 96px))`；顶栏左文案/右链接贴两边；导航行 brand 左、nav 中、cart/checkout 右。保留**无框地球图标**作语言/国际站切换（独立图标，不要套按钮框，除非用户要功能化选择器）。
- **搜索**：桌面默认是 `Brand Site` 后的独立图标，hover/focus 展开到地球/动作区；**不显示紫色提交方块**（回车或点建议项即可）；移动端搜索输入 ≥16px（防自动缩放）；搜索建议显示 产品图+名称+SKU+分类/标签路径；动效稳重不抽搐。
- **手机 header 专用布局**：第一行 大 logo + 地球/账户/购物车图标；第二行 整条移动搜索框 + 紧跟其右的菜单按钮。**不要**把汉堡菜单放在 logo 和地球之间。
- **i18n**：新可见文案进 `shop-i18n.js` 的三语结构；de/ja 必须**真翻译**，写盘走 UTF-8（经 Python 必须 `PYTHONUTF8=1`，否则乱码成 `?`）；GYUTRON 不翻译、保持大写；产品型号名 brand-invariant 不翻译。
- **诚信**：不编造规格/统计/合作方等不可核验信息。

## §5 双代理同步协议

**开工**：`git fetch && git pull` → `HEAD == origin/main` → 读本文件 + 仓根 `AGENTS.md` 的 Store 规则。
**收工**：过响应式与三语检查（含 `?{4,}` 乱码扫描）→ 更新本文件 §2「当前状态」→ commit（写清做了什么 + 怎么验证的，shop 改动用 `fix(shop):`/`feat(shop):`/`style(shop):` 前缀，沿用既有习惯）→ push。
**原则**：shop 的当前状态只认本文件 + GitHub，不靠任一方私有记忆。
