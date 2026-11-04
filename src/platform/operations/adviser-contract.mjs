/** Public data-adviser DTO registry. Data only; safe to project into a browser asset. */
export const ADVISER_VERSION=1;
export const ADVISER_VIEWS=Object.freeze([
 ['overview','Data overview','数据概览'],['map','Custom indicator dashboard','自定义指标看板'],['shop','Store analysis','店铺分析'],['trade','Trade analysis','交易分析'],['delivery','Fulfillment analysis','履约分析'],['team','Team operations','团队经营'],['visitors','Visitor analysis','访客分析'],['market','Market analysis','市场分析'],['products','Product analysis','产品分析'],['keywords','Keyword analysis','关键词分析'],['traffic','Traffic analysis','流量分析'],['profiles','Customer profiles','客户画像'],['ai','Smart showcase review','智能橱窗审阅'],['advertising','Advertising reports','广告报表'],['guide','Analysis guide','分析指南'],['dictionary','Metric dictionary','指标字典']
].map(([key,en,zh])=>Object.freeze({key,label:{en,zh}})));
const METRIC_DEFINITIONS=Object.freeze({
 orders:['Count imported orders by source creation time within the selected business dates.','按来源创建时间统计所选业务日期内的导入订单。'],
 paid_orders:['Count orders currently marked paid, fulfilled, partially refunded or refunded.','统计当前状态为已付款、已履约、部分退款或已退款的订单。'],
 paid_order_value:['Count paid order value once before refunds; currencies stay separate. This is not accounting net revenue.','已付订单原金额只计一次，尚未扣除退款，各币种独立统计，不代表会计净营收。'],
 aov:['Paid order value divided by paid order count, rounded half up to the currency minor unit.','已付订单原金额除以已付订单数，按币种最小单位四舍五入。'],
 inquiries:['Count native enquiry submissions created in the selected business dates and exclusion scope.','统计所选业务日期及排除规则范围内创建的官网询盘提交记录。'],
 open_inquiries:['Count enquiries currently new, reviewing or waiting for information.','统计当前处于新建、审核中或等待补充资料状态的询盘。'],
 overdue_inquiries:['Count open enquiries created more than 24 hours before the query; selected creation dates still apply.','统计创建已超过24小时且仍待处理的询盘，同时保留所选创建日期范围。'],
 payments:['Count imported payment records by their source creation dates, separately from order value.','按来源创建日期统计导入付款记录，与订单金额分开计算。'],
 payment_net:['Successful imported payments minus imported refunds in each currency, separate from order value.','各币种成功导入付款减去导入退款，与订单原金额分开计算。'],
 product_views:['Count stored anonymous product.viewed events; recording is best effort and does not identify visitors.','统计已存储的匿名产品浏览事件。记录为尽力而为，不能识别独立访客。'],
 cart_additions:['Count stored anonymous cart.added events; these are actions rather than identified carts or buyers.','统计已存储的匿名加购事件次数，不代表已识别购物车或买家人数。'],
 quote_requests:['Count stored anonymous quote.requested events, separately from enquiry form submissions.','统计已存储的匿名报价请求事件，与询盘表单提交记录分开。'],
 visitors:['Use one provider count covering the exact selected period; daily unique visitors cannot be added.','使用一条完整覆盖所选周期的平台观测；每日独立访客不可直接累加。'],
 sessions:['Sum imported session observations within one source and identical dimensions; no session tracking is added here.','在单一来源及相同维度内汇总导入会话观测，此工作区不新增会话追踪。'],
 page_views:['Sum imported page-view observations in the selected source, dates and dimensions.','汇总所选来源、日期及维度内导入的页面浏览观测。'],
 impressions:['Sum imported impression observations in the selected source, dates and dimensions.','汇总所选来源、日期及维度内导入的曝光观测。'],
 clicks:['Sum imported click observations in the selected source, dates and dimensions.','汇总所选来源、日期及维度内导入的点击观测。'],
 ctr:['Sum exact click numerators divided by exact impression denominators, not an average of percentages.','精确点击分子合计除以曝光分母合计，不对百分比直接求平均。'],
 conversion_rate:['Divide imported conversion numerators by their imported denominators in the same scope; the provider defines the conversion basis.','将同口径导入的转化分子合计除以分母合计，转化口径由数据提供方定义。'],
 search_impressions:['Sum imported search-impression observations for the selected keyword and source scope.','汇总所选关键词及来源范围内导入的搜索曝光观测。'],
 search_clicks:['Sum imported search-click observations for the selected keyword and source scope.','汇总所选关键词及来源范围内导入的搜索点击观测。'],
 search_ctr:['Sum imported search-click numerators divided by search-impression denominators in the identical scope.','同口径导入搜索点击分子合计除以搜索曝光分母合计。'],
 ad_spend:['Sum imported advertising spend in each currency; this workspace does not execute advertising or infer attribution.','分币种汇总导入广告花费，此工作区不执行投放，也不推断广告归因。'],
 ad_impressions:['Sum imported advertising impressions in the selected campaign/channel scope.','汇总所选广告活动或渠道范围内导入的广告曝光。'],
 ad_clicks:['Sum imported advertising clicks in the selected campaign/channel scope.','汇总所选广告活动或渠道范围内导入的广告点击。'],
 ai_impressions:['Sum externally supplied AI-channel impressions; this is not a Smart Showcase placement or AI visibility measurement generated here.','汇总外部提供的AI渠道曝光，不代表智能橱窗投放，也不是本工作区测得的AI可见度。'],
 ai_clicks:['Sum externally supplied AI-channel clicks; this does not enable, publish or advertise Smart Showcase candidates.','汇总外部提供的AI渠道点击，不会启用、发布或投放智能橱窗候选。'],
 fulfilled_orders:['Count selected orders currently marked fulfilled; this does not prove shipment delivery.','统计所选订单中当前已履约的记录，不代表货物已经送达。'],
 fulfillment_open:['Count paid, fulfilled, partially refunded or refunded orders whose fulfillment is not complete.','统计已付、已履约、部分退款或已退款订单中，履约状态仍未完成的记录。'],
 fulfillment_hours:['Average valid paid-to-fulfilled intervals for orders created in the period; missing or negative intervals are excluded.','统计期间创建订单的有效付款至履约平均小时数，排除缺失及负时长。'],
 missing_fulfillment_dates:['Count fulfilled orders without valid ordered paid and fulfilled timestamps.','统计已履约订单中付款或履约时间缺失、无效或先后顺序错误的记录。'],
 team_active:['Count currently active named identities plus the workspace owner; manager access is required.','统计当前启用的具名成员及工作区所有者，需要经理或所有者权限。'],
 tasks_open:['Count unarchived tasks created in the period whose current status is not done; non-managers see only their own.','统计期间创建、未归档且尚未完成的任务，非管理角色仅查看本人任务。'],
 tasks_done:['Count unarchived tasks created in the period whose current status is done; this is not a task-completion-date cohort.','统计期间创建、未归档且当前已完成的任务，不按完成日期划分任务群体。'],
 activities:['Count recorded activities by occurrence time; non-managers see only their own activity.','按发生时间统计已记录活动，非管理角色仅查看本人活动。'],
 contact_addresses:['Count distinct normalized nonempty enquiry email addresses, not visitors or unique people.','统计规范化后非空询盘邮箱的去重数量，不代表访客数或唯一人数。'],
 customer_records:['Count imported customer records created in the period; product and currency filters require matching source-local orders.','统计期间创建的导入客户记录，产品及币种筛选要求存在同来源匹配订单。'],
 profile_missing_email:['Count selected imported customer records with an empty email field; presence does not prove email validity.','统计所选导入客户记录中邮箱为空的数量，有邮箱不代表地址已经验证有效。'],
 repeat_order_customers:['Count source-local customer references with at least two orders in the selected period, not lifetime repeat buyers.','统计所选期间至少有两笔订单的来源内客户编号，不代表客户终身复购情况。'],
 ad_ctr:['Divide imported ad clicks by ad impressions only when source, currency, dates and every dimension match.','仅在来源、币种、报告日期及所有维度一致时，用导入广告点击除以广告曝光。'],
});
const metric=(key,en,zh,unit,aggregation,observation=false,formula='')=>Object.freeze({key,label:{en,zh},unit,aggregation,observation,formula,definition:Object.freeze({en:formula||METRIC_DEFINITIONS[key]?.[0]||en,zh:METRIC_DEFINITIONS[key]?.[1]||zh})});
export const ADVISER_METRICS=Object.freeze([
 metric('orders','Orders','订单','count','sum',false,'Count imported orders by their source creation date.'),
 metric('paid_orders','Paid orders','已付订单','count','sum',false,'Orders in paid, fulfilled, partially_refunded or refunded state.'),
 metric('paid_order_value','Paid order value before refunds','已付订单金额（退款前）','minor','sum',false,'Imported paid-order total counted once, before refunds; never accounting net revenue.'),
 metric('aov','Average paid order value','平均已付订单金额','minor','weighted',false,'Paid order value / paid orders, rounded half up to currency minor unit.'),
 metric('inquiries','Enquiries','询盘','count','sum'),metric('open_inquiries','Open enquiries','未处理询盘','count','sum'),metric('overdue_inquiries','Enquiries older than 24h','超过24小时待处理询盘','count','snapshot'),
 metric('payments','Payment records','付款记录','count','sum'),metric('payment_net','Net imported payments','导入付款净流入','minor','sum',false,'Successful imported payments minus imported refunds; separate from order value.'),
 metric('product_views','Product view events','产品浏览事件','count','sum'),metric('cart_additions','Cart addition events','加购事件','count','sum'),metric('quote_requests','Quote request events','报价请求事件','count','sum'),
 metric('visitors','Unique visitors','独立访客','count','period_exact',true,'Only a provider observation covering the exact selected period; daily UV must not be summed.'),
 metric('sessions','Sessions','会话','count','sum',true),metric('page_views','Page views','页面浏览','count','sum',true),metric('impressions','Impressions','曝光','count','sum',true),metric('clicks','Clicks','点击','count','sum',true),
 metric('ctr','Click-through rate','点击率','ratio','weighted_ratio',true,'Sum numerator / sum denominator, not the average of percentages.'),metric('conversion_rate','Conversion rate','转化率','ratio','weighted_ratio',true),
 metric('search_impressions','Search impressions','搜索曝光','count','sum',true),metric('search_clicks','Search clicks','搜索点击','count','sum',true),metric('search_ctr','Search click-through rate','搜索点击率','ratio','weighted_ratio',true),
 metric('ad_spend','Advertising spend','广告花费','minor','sum',true),metric('ad_impressions','Advertising impressions','广告曝光','count','sum',true),metric('ad_clicks','Advertising clicks','广告点击','count','sum',true),
 metric('ai_impressions','Imported AI-channel impressions','外部 AI 渠道导入曝光','count','sum',true),metric('ai_clicks','Imported AI-channel clicks','外部 AI 渠道导入点击','count','sum',true),
]);
export const OBSERVATION_METRICS=Object.freeze(ADVISER_METRICS.filter(metric=>metric.observation));
export const OBSERVATION_DIMENSIONS=Object.freeze(['device','country','product','keyword','channel','industry']);
export const OBSERVATION_SERIES=Object.freeze(['self','peer_average','peer_leader']);
export const OBSERVATION_COLUMNS=Object.freeze(['date','date_to','metric','value_exact','numerator','denominator','unit','currency','series',...OBSERVATION_DIMENSIONS]);
export const ADVISER_COMPARE=Object.freeze(['none','previous_period','peer_average','peer_leader']);
export const VIEW_METRICS=Object.freeze({overview:['orders','paid_orders','paid_order_value','inquiries','open_inquiries','overdue_inquiries'],map:['orders','paid_order_value','inquiries','visitors','impressions','ctr'],shop:['product_views','cart_additions','quote_requests','orders'],trade:['orders','paid_orders','paid_order_value','aov','payments','payment_net'],delivery:['fulfilled_orders','fulfillment_open','fulfillment_hours','missing_fulfillment_dates'],team:['team_active','tasks_open','tasks_done','activities'],visitors:['visitors','sessions','page_views','contact_addresses'],market:['inquiries','orders','paid_order_value','impressions'],products:['product_views','cart_additions','quote_requests','orders'],keywords:['search_impressions','search_clicks','search_ctr'],traffic:['impressions','clicks','ctr','sessions','page_views'],profiles:['customer_records','contact_addresses','profile_missing_email','repeat_order_customers'],ai:['product_views','cart_additions','quote_requests','paid_orders'],advertising:['ad_spend','ad_impressions','ad_clicks','ad_ctr'],guide:[],dictionary:[]});
export const ADVISER_LIMITS=Object.freeze({csv_rows:500,csv_bytes:1048576,dimension_length:120,integer_digits:30,custom_metrics:12,drill_limit:100,export_rows:10000,observation_rows:15000,import_history:1000,analysis_observation_rows:5000,ratio_decimal_places:12});
export const DERIVED_METRICS=Object.freeze([
 metric('fulfilled_orders','Fulfilled orders','已履约订单','count','snapshot'),metric('fulfillment_open','Paid orders awaiting fulfillment','已付待履约订单','count','snapshot'),metric('fulfillment_hours','Average paid-to-fulfilled hours','付款至履约平均小时','hours','weighted',false,'Average of valid fulfilled_at - paid_at intervals for orders created in the selected period; missing or negative intervals excluded.'),metric('missing_fulfillment_dates','Fulfilled orders missing valid dates','履约时间不完整订单','count','snapshot'),
 metric('team_active','Active workspace identities','有效工作区身份','count','snapshot'),metric('tasks_open','Open tasks created in period','期间创建的未完成任务','count','snapshot'),metric('tasks_done','Completed tasks created in period','期间创建的已完成任务','count','snapshot'),metric('activities','Activities in period','期间活动','count','sum'),
 metric('contact_addresses','Enquiry contact addresses','询盘联系邮箱','count','period_exact',false,'Distinct normalised nonempty enquiry email addresses, not visitors or people.'),metric('customer_records','Imported customer records','导入客户记录','count','sum'),metric('profile_missing_email','Imported customers missing email','缺少邮箱的导入客户','count','sum'),metric('repeat_order_customers','Repeat-order references','重复下单客户编号','count','period_exact',false,'Source-local customer references with two or more stored orders in the selected period; not a complete lifetime cohort.'),
 metric('ad_ctr','Advertising click-through rate','广告点击率','ratio','weighted_ratio',false,'Same-source, same-period, same-dimension ad_clicks / ad_impressions observations.'),
]);
