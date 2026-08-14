# mcpzh — MCP 中文决策站

> 选 MCP server · 用中文决策 · 数据 24h 同步自 GitHub

3,300+ 个 MCP server 的中文目录。聚焦中文开发者：① 中文说明与导航 ② 按客户端兼容筛选（Claude Code / Cursor / Codex / Windsurf / Continue / Cline）③ 真实协议测试证据 ④ 同类对比页 ⑤ 完全开源可自部署。

## 仓库结构

```
mcpzh/
├── scripts/                 # 数据同步 + GitHub enrichment
│   ├── parse_punkpeye.py    # README → 结构化 JSON
│   └── enrich_github.py     # GitHub API → stars / last_commit
├── site/                    # Astro 5 静态站点
│   ├── src/
│   │   ├── pages/           # 路由：/、/category/[slug]、/server/[slug]、/blog/[slug]
│   │   ├── layouts/         # 共享 Base.astro（含 JSON-LD @graph）
│   │   ├── components/      # ServerCard
│   │   ├── lib/             # data / verification / jsonld
│   │   └── data/            # servers.json + articles.ts
│   ├── public/              # _headers / _redirects / robots / favicon
│   └── wrangler.toml
├── .github/workflows/       # 6 小时定时同步 + Cloudflare Pages 部署
└── CHANGELOG.md
```

## 本地开发

```bash
cd site
npm install
npm run dev          # http://localhost:4321
npm test             # 单元测试
npm run check        # 类型 + Astro 检查
npm run build        # 生产构建（输出 dist/）
```

## 数据来源与同步

- 主源：`punkpeye/awesome-mcp-servers`（GitHub stars 92k+）
- 中文源：`yzfly/Awesome-MCP-ZH`
- 同步频率：每 6 小时自动运行（`.github/workflows/sync-build.yml`）
- 真实 MCP 测试：手动写入 `src/lib/verification.ts`，每条记录必须包含包名、版本、协议版本、协商步骤、工具数与样本

## Cloudflare Pages 部署

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加：

- `CF_ACCOUNT_ID`：Cloudflare Account ID
- `CF_API_TOKEN`：仅授予 Pages 部署权限的 API Token

Workflow 会在每 6 小时同步数据，并自动执行 `astro check`、单元测试、生产构建和 Pages 部署。

## 商业披露

未来部分链接可能属于联盟链接（Cloudflare、Vercel 等 SaaS），付费推荐位会显示「赞助」标签。付费不会改变独立评测结论。详见 `site/src/pages/about.astro`。

## License

MIT
