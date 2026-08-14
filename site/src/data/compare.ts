export interface ComparePair {
  slug: string;
  left: string;
  right: string;
  context: string;
  rows: { label: string; left: string; right: string }[];
  recommendation: string;
}

export const comparePairs: ComparePair[] = [
  {
    slug: 'postgres-mcp-vs-sqlite-mcp',
    left: 'Postgres MCP',
    right: 'SQLite MCP',
    context: '数据库 MCP 是开发者每天都会接触的 server。两者都走 MCP 协议，但适用场景差别很大。',
    rows: [
      { label: '适用规模', left: '生产级、并发写入', right: '本地原型、单用户' },
      { label: '权限边界', left: '建议只读角色 + schema 白名单', right: '本地文件权限即可' },
      { label: '性能开销', left: '网络往返、连接池配置', right: '嵌入式、无网络' },
      { label: '备份与迁移', left: 'pg_dump / 逻辑复制', right: '拷贝 .db 文件' },
      { label: '多客户端共享', left: '原生支持', right: '需要文件锁' },
    ],
    recommendation: '本地调试与小工具选 SQLite MCP；任何带团队协作或多写入源的生产场景选 Postgres MCP，并强制只读连接。',
  },
  {
    slug: 'playwright-mcp-vs-chrome-mcp',
    left: 'Playwright MCP',
    right: 'Chrome DevTools MCP',
    context: '浏览器自动化是 MCP 中最活跃的品类。Playwright 系以多浏览器覆盖为主，Chrome DevTools 系走 CDP 直接控制。',
    rows: [
      { label: '浏览器支持', left: 'Chromium / Firefox / WebKit', right: '仅 Chromium' },
      { label: '协议接入', left: 'Playwright 协议', right: 'Chrome DevTools Protocol' },
      { label: '会话持久化', left: 'BrowserContext 可保存登录态', right: '需要手工注入 cookie' },
      { label: '部署形态', left: '本地 stdio 为主', right: '可托管远程 Chromium' },
      { label: '调试透明度', left: 'trace.zip 完整', right: '依赖 DevTools' },
    ],
    recommendation: '需要跨浏览器回归测试选 Playwright MCP；需要和真实 Chrome 强一致、远程浏览器或性能调优选 Chrome DevTools MCP。',
  },
  {
    slug: 'memory-mcp-vs-rag-mcp',
    left: 'Memory MCP',
    right: 'RAG MCP',
    context: '都解决「让 AI 记住上下文」的问题，但 Memory 强调结构化长期记忆，RAG 强调文档检索。',
    rows: [
      { label: '数据形态', left: '知识图谱 / 实体-关系', right: '向量 + 文档切片' },
      { label: '典型来源', left: '对话偏好、用户笔记', right: 'PDF / 网页 / 工单' },
      { label: '引用可追溯', left: '图节点可点击', right: '原文 chunk + 分数' },
      { label: '维护成本', left: '需要一致性写入', right: '重新 embedding' },
    ],
    recommendation: '个人偏好、跨会话一致性选 Memory MCP；问答与文档问答场景选 RAG MCP。两者经常组合使用。',
  },
];