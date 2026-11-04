/** Data Adviser navigation and presentation metadata. Metrics are enabled by the API catalogue. */
export const ANALYTICS_GROUPS = Object.freeze([
  { id: 'business', en: 'Store', zh: '店铺经营' },
  { id: 'growth', en: 'Data analysis', zh: '数据分析' },
  { id: 'ai', en: 'Data AI', zh: '智能分析' },
  { id: 'campaigns', en: 'Campaigns', zh: '营销推广' },
  { id: 'resources', en: 'Resources', zh: '帮助与口径' },
]);

export const ANALYTICS_VIEWS = Object.freeze([
  { key: 'overview', group: 'business', en: 'Business overview', zh: '经营总览', icon: 'analytics', layout: 'overview', description: ['Your operating results, their sources and changes over time.', '查看经营结果、数据来源与时间变化。'] },
  { key: 'map', group: 'business', en: 'Custom dashboard', zh: '自定义看板', icon: 'columns-3', layout: 'dashboard', description: ['Choose the metrics that matter and switch between board and table views.', '选择关注的指标，在看板与表格间切换。'] },
  { key: 'shop', group: 'business', en: 'Shop analysis', zh: '店铺分析', icon: 'sources', layout: 'shop', description: ['Connect store activity, enquiries and imported trading results.', '连接店铺活动、询盘与已导入的交易结果。'] },
  { key: 'trade', group: 'business', en: 'Trade analysis', zh: '交易分析', icon: 'quotes', layout: 'trade', description: ['Inspect order value, conversion stages and payment movements.', '分析订单金额、转化阶段与付款变动。'] },
  { key: 'delivery', group: 'business', en: 'Delivery analysis', zh: '履约分析', icon: 'tasks', layout: 'delivery', description: ['Review fulfilment and delivery measures from connected aggregate data.', '查看已连接汇总数据中的履约与交付指标。'] },
  { key: 'team', group: 'business', en: 'Team performance', zh: '团队绩效', icon: 'users', layout: 'team', description: ['Compare attributed workload and outcomes using a consistent period.', '以同一时间范围比较已归属的工作量与业务结果。'] },
  { key: 'visitors', group: 'business', en: 'Visitor analysis', zh: '访客分析', icon: 'customers', layout: 'visitors', description: ['Understand aggregate visitors, sessions and engagement over time.', '分析汇总访客、会话与互动的时间变化。'] },
  { key: 'market', group: 'growth', en: 'Market analysis', zh: '市场分析', icon: 'pipeline', layout: 'market', description: ['Compare markets and review the underlying records or aggregate rows.', '比较市场表现，并查看对应业务记录或汇总明细。'] },
  { key: 'products', group: 'growth', en: 'Product analysis', zh: '产品分析', icon: 'sources', layout: 'products', description: ['Identify product demand, engagement and trading performance.', '查看产品需求、互动与交易表现。'] },
  { key: 'keywords', group: 'growth', en: 'Keyword analysis', zh: '关键词分析', icon: 'search', layout: 'keywords', description: ['Inspect recorded search terms, impressions and qualified outcomes.', '分析已记录搜索词、曝光与有效业务结果。'] },
  { key: 'traffic', group: 'growth', en: 'Traffic sources', zh: '流量来源', icon: 'activity', layout: 'traffic', description: ['Compare channel contribution without inventing missing attribution.', '比较渠道贡献，清楚标明缺失的归因数据。'] },
  { key: 'profiles', group: 'growth', en: 'Visitor profiles', zh: '访客画像', icon: 'customers', layout: 'profiles', description: ['Explore aggregate audience segments without importing personal data.', '查看汇总受众分组，无需导入个人信息。'] },
  { key: 'ai', group: 'ai', en: 'Smart recommendations', zh: '智能推荐', icon: 'agent', layout: 'ai', description: ['Review evidence-backed product candidates. Saving or hiding a candidate does not publish or advertise it.', '审阅有业务证据的产品候选。保存或屏蔽候选不会发布内容或投放广告。'] },
  { key: 'advertising', group: 'campaigns', en: 'Advertising analysis', zh: '广告分析', icon: 'analytics', layout: 'advertising', description: ['Read imported campaign results; no advertising changes are made here.', '只读分析已导入广告结果，此处不修改广告投放。'] },
  { key: 'guide', group: 'resources', en: 'Getting started', zh: '使用指南', icon: 'circle-help', layout: 'guide', description: ['Connect data, understand the analysis and trace every result.', '连接数据、理解分析并追溯每项结果。'] },
  { key: 'dictionary', group: 'resources', en: 'Metric dictionary', zh: '指标字典', icon: 'file-text', layout: 'dictionary', description: ['Definitions, units, source requirements and calculation boundaries.', '查看定义、单位、来源要求与计算边界。'] },
]);

export const ANALYTICS_VIEWS_CLIENT = `export const ANALYTICS_GROUPS=${JSON.stringify(ANALYTICS_GROUPS)};\nexport const ANALYTICS_VIEWS=${JSON.stringify(ANALYTICS_VIEWS)};\nexport function analyticsView(key){return ANALYTICS_VIEWS.find(view=>view.key===key)||ANALYTICS_VIEWS[0];}\n`;
