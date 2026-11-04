/** Authored navigation data only. Links open existing read views; no actions run here. */
import { ANALYTICS_GROUPS, ANALYTICS_VIEWS } from './analytics-views.mjs';

const group = (en, zh, entries) => Object.freeze({
  en,
  zh,
  items: Object.freeze(entries.map(([href, en, zh]) => Object.freeze({ href, en, zh }))),
});
const menu = (en, zh, groups) => Object.freeze({
  title: Object.freeze({ en, zh }),
  groups: Object.freeze(groups),
});

export const WORKSPACE_NAVIGATION_MENUS = Object.freeze({
  overview: menu('Overview', '工作总览', [group('Workspace', '工作区', [
    ['#overview', 'Business overview', '经营总览'],
  ])]),
  analytics: menu('Data Adviser', '数据参谋', ANALYTICS_GROUPS.map(section => group(
    section.en,
    section.zh,
    ANALYTICS_VIEWS.filter(view => view.group === section.id).map(view => [
      '#analytics?view=' + encodeURIComponent(view.key), view.en, view.zh,
    ]),
  ))),
  customers: menu('Customers', '客户', [group('Customer records', '客户记录', [
    ['#customers', 'All customers', '全部客户'],
    ['#customers?status=active', 'Active customers', '活跃客户'],
    ['#customers?status=prospect', 'Prospective customers', '潜在客户'],
    ['#customers?archived=true', 'Archived customers', '已归档客户'],
  ])]),
  pipeline: menu('Sales pipeline', '销售管道', [group('Opportunities', '商机', [
    ['#pipeline', 'All opportunities', '全部商机'],
    ['#pipeline?closed=false', 'Open opportunities', '未结束商机'],
    ['#pipeline?stage=won', 'Won opportunities', '已赢单商机'],
    ['#pipeline?stage=lost', 'Lost opportunities', '未成交商机'],
  ])]),
  quotes: menu('Quotations', '报价单', [group('Quotation records', '报价记录', [
    ['#quotes', 'All quotations', '全部报价单'],
    ['#quotes?status=draft', 'Draft quotations', '草稿报价'],
    ['#quotes?status=issued', 'Issued quotations', '已签发报价'],
  ])]),
  tasks: menu('Tasks', '任务', [group('Task records', '任务记录', [
    ['#tasks', 'All tasks', '全部任务'],
    ['#tasks?status=open', 'Open tasks', '待办任务'],
    ['#tasks?overdue=true', 'Overdue tasks', '逾期任务'],
    ['#tasks?status=done', 'Completed tasks', '已完成任务'],
  ])]),
  inbox: menu('Inbox', '收件箱', [group('Website submissions', '官网提交', [
    ['#inbox?resource=leads', 'Sales enquiries', '销售询盘'],
    ['#inbox?resource=rfqs', 'Quotation requests', '报价申请'],
    ['#inbox?resource=support', 'Support requests', '技术支持请求'],
    ['#inbox?resource=downloads', 'Download requests', '资料下载请求'],
  ])]),
  activity: menu('Activity', '活动', [group('Customer activity', '客户活动', [
    ['#activity', 'All activity', '全部活动'],
    ['#activity?type=email', 'Emails', '邮件记录'],
    ['#activity?type=call', 'Calls', '通话记录'],
    ['#activity?type=meeting', 'Meetings', '会议记录'],
  ])]),
  sources: menu('Data sources', '数据来源', [group('Connected data', '已连接数据', [
    ['#sources', 'Data sources', '数据来源'],
  ])]),
  reports: menu('Report center', '报表中心', [group('Saved reports', '已保存报表', [
    ['#reports', 'Report history', '历史报表'],
  ])]),
  automations: menu('Automations', '自动化', [group('Operations', '经营管理', [
    ['#automations', 'Automation schedules', '自动化计划'],
  ])]),
  rules: menu('Business rules', '业务规则', [group('Rules and policies', '规则与政策', [
    ['#rules', 'Rule library', '规则库'],
  ])]),
  agent: menu('Agent workspace', '智能工作台', [group('Business assistance', '经营助手', [
    ['#agent', 'Agent workspace', '智能工作台'],
  ])]),
  memory: menu('Business memory', '经营记忆', [group('Knowledge', '知识管理', [
    ['#memory', 'Business memory', '经营记忆'],
    ['#memory?kind=documents', 'Knowledge documents', '知识文档'],
  ])]),
  models: menu('Model settings', '模型设置', [group('Configuration', '配置', [
    ['#models', 'Model settings', '模型设置'],
  ])]),
  users: menu('Users and access', '成员与权限', [group('Access management', '访问管理', [
    ['#users', 'Team members', '团队成员'],
  ])]),
  security: menu('Security center', '安全中心', [group('Workspace security', '工作区安全', [
    ['#security', 'Security overview', '安全概览'],
  ])]),
  backup: menu('Backup and restore', '备份与恢复', [group('Data protection', '数据保护', [
    ['#backup', 'Backup history', '备份历史'],
  ])]),
  license: menu('License', '许可', [group('Instance licensing', '实例许可', [
    ['#license', 'License status', '许可状态'],
  ])]),
  health: menu('System health', '系统健康', [group('System operations', '系统运行', [
    ['#health', 'Health overview', '健康概览'],
  ])]),
  audit: menu('Audit log', '审计日志', [group('Workspace records', '工作区记录', [
    ['#audit', 'Audit log', '审计日志'],
  ])]),
  settings: menu('Preferences', '偏好设置', [group('Workspace settings', '工作区设置', [
    ['#settings', 'Workspace preferences', '工作区偏好'],
  ])]),
});
