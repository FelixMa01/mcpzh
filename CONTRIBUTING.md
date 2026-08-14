# Contributing to mcpzh

欢迎贡献。本站的特色是**真实协议测试 + 中文决策内容**。

## 开发环境

- Node.js 22+
- Python 3.10+（用于 `scripts/`）
- `npm ci` 安装 Astro 与依赖
- 真实 MCP server 子进程测试需要 `npx` 可用

## 工作流

```bash
cd site
npm install
npm run dev          # http://localhost:4321

# 修改前
npm test             # 单元测试
npm run check        # Astro 类型检查

# 修改后
npm run build        # 生产构建到 dist/
npm run validate     # dist/ 完整性 + 死链检测
```

## 真实 MCP server 测试

新 server 接入需要填写 `site/src/lib/verification.ts`：

1. 在测试环境跑 `npx <package>` 启动子进程
2. 用 JSON-RPC 发 `initialize` → `notifications/initialized` → `tools/list`
3. 记录包名、版本、协议版本、协商步骤、工具数与样本
4. 写入 `verification.ts` 后，详情页会自动展示「已通过端到端测试」徽章

## 数据更新流程

不要直接编辑 `site/src/data/servers.json`。该文件由 GitHub Actions 自动同步。

手动同步：

```bash
python3 scripts/parse_punkpeye.py /path/to/punkpeye.md /tmp/punkpeye.json
python3 scripts/enrich_github.py /tmp/punkpeye.json /tmp/punkpeye_enriched.json 1000
cp /tmp/punkpeye_enriched.json site/src/data/servers.json
```

## 内容质量准则

- 评测类文章必须基于 GitHub 元数据、客户端文档与实际安装证据
- 不要把「待实测」写成「已验证」
- 涉及凭据、数据库、文件系统、浏览器登录态、资金时，使用最小权限凭据并保留人工确认环节
- 联盟链接须在「关于」页与 `/about` 路径说明，并在卡片上标注「赞助」

## Pull Request 检查

提交前：

- [ ] `npm test` 通过
- [ ] `npm run check` 0 errors
- [ ] `npm run validate` 通过
- [ ] 修改文件不破坏 schema（`data.ts`、`verification.ts`、`articles.ts`、`compare.ts`）
- [ ] 没有引入硬编码凭据或伪造的赞助标记

## License

MIT — 提交即表示同意以 MIT 协议发布。