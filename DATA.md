# Data pipeline

`site/src/data/servers.json` 由两段管道生成：

## 1. `scripts/parse_punkpeye.py`

输入：`punkpeye/awesome-mcp-servers` 与 `yzfly/Awesome-MCP-ZH` 的 README.md。
输出：JSON 数组，每条记录含

```json
{
  "name": "owner/repo",
  "url": "https://github.com/owner/repo",
  "github_url": "...",
  "description": "...",
  "category": "Aggregators",
  "subcategory": "",
  "language": "python",
  "badges": { "cloud": true, "python": true, ... },
  "compatible_clients": ["claude_code", "cursor", ...],
  "source": "punkpeye/awesome-mcp-servers",
  "stars": 0,
  "last_commit": ""
}
```

实现要点：

- 标题行匹配 `### emoji <a name="slug"></a>Title`
- 项目行容忍嵌套 `[![badge](img)](url)` markdown
- 去掉 README TOC 锚点（如 `#what-is-mcp`）
- 按 emoji 推断语言与能力

## 2. `scripts/enrich_github.py`

输入：上一段输出。
输出：每条记录补上 `stars / last_commit / gh_forks / gh_open_issues / gh_license / gh_topics / gh_default_branch`。

免费 GitHub API 限制 60 req/h，所以脚本：

- 只 enrichment 前 N 个（默认 200）
- 网络失败时跳过，不抛错
- 失败超过阈值自动停止

## 3. 站点数据层 (`site/src/lib/data.ts`)

加载 `servers.json` 后：

- 按 URL 去重
- 按 URL hash 解决 slug 冲突
- 空描述补默认文案
- 计算 `is_active`（365 天内有提交）
- 计算 `is_chinese_friendly`（描述含中文/拼音/Qwen/DeepSeek 等关键词）

输出 `ProcessedServer[]`，被所有页面使用。

## 4. `site/src/lib/verification.ts`

手动维护的真实 MCP 协议测试记录。每条记录必须是真实子进程握手后写入；展示在详情页「真实协议测试」区块。

## 5. 更新频率

- GitHub Actions 每 6 小时自动跑 1→2 步
- 手动同步通过 PR 提交
- `verification.ts` 由人类维护