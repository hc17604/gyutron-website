# GYUTRON 官方商城 shop.gyutron.com — 工程交接（shop 独立站单一事实源）

> 这是 **shop 独立站**的交接文档。shop 与主站 gyutron.com 在同一个仓库、同一个 Cloudflare Worker 部署，但**对主站任务 shop 是 out of scope**（主站文档反复强调"绝不碰 public/shop"）。反过来：**做 shop 时，本文件 + 仓根 `AGENTS.md` 里的「Store ...」规则是权威**。
> 与用户交流用**中文**；GYUTRON 品牌名在可见文案中保持**大写**；i18n key / URL / 文件路径保持原样。
> 🔄 双代理协作：Claude + Codex 都可能动 shop。**开工 `git pull` 对齐 origin/main，收工更新本文件并 push。**

最近更新：2026-06-14（接手时先 `git fetch && git pull`，确认 `HEAD == origin/main`）

---

## §1 这是什么

**GYUTRON Official Store**（`shop.gyutron.com`）：工业自动化产品的**静态多页电商独立站**（纯 HTML/CSS/JS，非框架），三语 en/de/ja。

- 页面（都在本 `shop/` 目录）：`index`(首页) `products`(列表) `product`(详情,`product.html?sku=`) `cart` `checkout` `account` `about-us` `contact-us` `contact-engineer` `request-quote` + 政策页（`payment-methods` `privacy-policy` `return-refund-policy` `shipping-policy` `terms-of-service` `warranty-policy`）。
- 资源：`shop.css`(样式) `shop.js`(购物车/交互) `shop-i18n.js`(`window.GYUTRON_SHOP_I18N`，三语文案 + 产品 i18n)。

## §2 当前状态

- **三语 i18n 已铺开**：每页带 hreflang 备用链（`shop.gyutron.com/shop/`、`/de/shop/`、`/ja/shop/`，x-default=en）；产品 i18n 在**所有** shop 页面加载（不只首页）；产品规格表 key+描述值、产品标签、固定汇率本地货币均已本地化。
- **de/ja 长文案适配**：产品卡操作按钮已为长德/日标签压缩；超长标题 wrap/hyphenate 防德语 hero 溢出；移动端菜单面板已本地化（曾硬编码英文，已修）。
- **行为埋点（由主站 Worker 注入，shop 文件本身不动）**：Worker 通过 HTMLRewriter 给 shop HTML 注入 `/shop-analytics.js`，仅采集 `product.viewed`(product.html?sku=) + `cart.added`(localStorage 购物车 diff) → `POST /api/shop-event`（source=gyutron-shop，白名单+限流+不存 ip/session/PII）。**改 shop 时无需关心它，但别去复制/覆盖它。**

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
