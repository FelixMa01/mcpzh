export interface Article {
  slug: string;
  title: string;
  description: string;
  category?: string;
  client?: string;
  intent: 'best' | 'compare' | 'guide';
  thesis: string;
  criteria: string[];
}

export const articles: Article[] = [
  {
    slug: 'best-database-mcp-servers',
    title: '2026 数据库 MCP Server 推荐：PostgreSQL、MySQL 与 SQLite 怎么选',
    description: '按权限边界、只读模式、Schema 探索和维护活跃度比较数据库 MCP Server。',
    category: 'Databases', intent: 'best',
    thesis: '数据库 MCP 的首要标准是权限边界，其次才是功能数量。生产库优先选择支持只读连接、细粒度 schema 限制和审计日志的项目。',
    criteria: ['最小权限与只读模式', 'SQL 注入防护', 'Schema/表级限制', '活跃维护与许可证'],
  },
  {
    slug: 'best-browser-automation-mcp',
    title: '浏览器自动化 MCP 对比：Playwright、Chrome 与 Browserbase 路线',
    description: '比较本地浏览器、远程浏览器与 CDP 路线的成本、稳定性和权限风险。',
    category: 'Browser Automation', intent: 'compare',
    thesis: '本地开发用 Playwright/CDP 最直接；持续运行与反爬场景更适合托管浏览器。选择时重点看会话持久化、验证码处理边界和可观测性。',
    criteria: ['本地或远程运行', '会话与 Cookie 持久化', '截图/网络日志', '并发与托管成本'],
  },
  {
    slug: 'best-memory-mcp-servers',
    title: 'AI 记忆 MCP 推荐：本地优先、知识图谱与团队记忆',
    description: '按数据归属、检索质量、跨客户端支持与可迁移性比较 Memory MCP。',
    category: 'Knowledge & Memory', intent: 'best',
    thesis: '个人开发者优先本地 Markdown 或 SQLite；团队场景需要权限、版本与审计。可导出格式决定了以后能否自由迁移。',
    criteria: ['本地数据归属', '引用与可追溯性', '跨客户端同步', '导出与迁移'],
  },
  {
    slug: 'mcp-security-checklist',
    title: 'MCP Server 安全清单：安装前必须检查的 8 项',
    description: '从工具权限、密钥处理、出站网络、依赖和维护状态评估 MCP 安全。',
    category: 'Security', intent: 'guide',
    thesis: 'MCP server 与 Agent 之间具备真实工具执行能力。安全评估要覆盖进程权限、网络出站、凭据范围、依赖供应链和审计证据。',
    criteria: ['工具权限范围', '凭据保存方式', '出站网络控制', '依赖与发布完整性'],
  },
  {
    slug: 'best-search-mcp-servers',
    title: '搜索 MCP Server 对比：网页、代码、学术与实时信息',
    description: '按索引覆盖、引用质量、实时性和 API 成本选择搜索 MCP。',
    category: 'Search & Data Extraction', intent: 'compare',
    thesis: '通用网页搜索、代码搜索和学术搜索属于三种数据产品。把它们拆开选择，结果质量和成本都会更可控。',
    criteria: ['数据覆盖范围', '引用与原文返回', '更新延迟', '免费额度与单次成本'],
  },
  {
    slug: 'best-coding-agent-mcp',
    title: '编程 Agent MCP 推荐：Claude Code、Codex 与 Cursor 工作流',
    description: '评估代码索引、测试、Git、Issue 与部署类 MCP 的实用性。',
    category: 'Coding Agents', intent: 'best',
    thesis: '编码场景最有价值的是让 Agent 获得结构化证据：符号索引、测试结果、Git 历史和 CI 状态。单纯包装 shell 命令的项目增益有限。',
    criteria: ['结构化代码理解', '测试与 CI 证据', 'Git 安全边界', '跨仓库扩展性'],
  },
  {
    slug: 'best-mcp-aggregators',
    title: 'MCP Hub 与聚合器对比：1MCP、MCPJungle 等怎么选',
    description: '比较多 MCP 管理、动态路由、健康检查、策略与团队能力。',
    category: 'Aggregators', intent: 'compare',
    thesis: '聚合器的价值来自治理：统一配置、健康检查、权限策略和工具路由。仅把多个 server 拼到一个端口，团队收益有限。',
    criteria: ['集中配置管理', '健康检查与故障隔离', '权限策略', '工具路由与冲突处理'],
  },
  {
    slug: 'finance-mcp-risk-guide',
    title: '金融 MCP Server 选择指南：行情、交易与 x402 风险',
    description: '区分只读行情、交易执行和按次付费工具，建立风险分级。',
    category: 'Finance & Fintech', intent: 'guide',
    thesis: '只读行情、账户查询、交易执行属于三个风险等级。涉及签名和资金转移的工具必须使用额度受限的钱包与人工确认。',
    criteria: ['只读或交易权限', '资金与签名边界', '数据延迟和来源', '费用与失败处理'],
  },
  {
    slug: 'mcp-for-claude-code',
    title: 'Claude Code MCP 配置与选择：2026 实用指南',
    description: '从 stdio、HTTP、权限和项目级配置角度选择 Claude Code MCP。',
    client: 'claude_code', intent: 'guide',
    thesis: 'Claude Code 的 MCP 配置要贴近项目边界。把文件、数据库和部署工具拆成独立 server，可以分别控制权限和故障范围。',
    criteria: ['项目级配置', 'stdio/HTTP 传输', '工具权限', '启动速度与日志'],
  },
  {
    slug: 'mcp-for-cursor',
    title: 'Cursor MCP Server 推荐与兼容性说明',
    description: '按安装复杂度、工作区隔离和开发工具集成筛选 Cursor MCP。',
    client: 'cursor', intent: 'guide',
    thesis: 'Cursor 场景应优先选择安装步骤清楚、进程退出干净、工作区隔离明确的 server。协议兼容只是起点，稳定运行更重要。',
    criteria: ['安装命令可复现', '工作区隔离', '进程生命周期', '错误日志可读性'],
  },
];
