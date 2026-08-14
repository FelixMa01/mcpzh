# Changelog

所有重要变更按版本记录。本项目遵循 [Semantic Versioning](https://semver.org/)。

## [0.4.0] - 2026-08-14

### Performance
- 详情页「同类对比」区块：同分类 Top 5 server，提升内链与停留时间
- ServerCard 支持 `compact` 模式，分类/客户端列表页描述截到 100 字符
- search-index.json 字段精简：description 截到 200 字符、补充 tags + clients
- DevTools 分类页 276 KB → 257 KB（最大页）

### Quality
- `scripts/validate_dist.py`：构建产物完整性 + canonical + sitemap 引用 + RSS + JSON-LD 全量校验
- `scripts/check_links.py`：3,435 个静态页的内部链接检查
- 新增 `npm run validate` 命令
- GitHub Actions 在 build 后自动跑 validate

### Fixed
- Astro `trailingSlash: 'never'` + 目录页 `/category/` 实际文件 `/category/index.html` 不匹配
  - sitemap URL 改用 `/foo/` 形式
  - Cloudflare `_redirects` 把 `/foo` 重定向到 `/foo/`
  - link checker 接受 `/foo` 和 `/foo/` 两种形式
- 测试中误把 Astro 内联 JS 模板字符串当成 broken link — 加白名单
- search-index 移除 description 导致 postgres 搜索从 54 → 4 个结果 — 加回 200 字符截断描述 + 客户端/标签

### Verified
- `astro check`：0 errors / 0 warnings / 0 hints
- `npm test`：15 unit tests passed
- `npm run build`：3,435 pages
- `npm run validate`：10 checks passed
- Playwright E2E：33 个浏览器真测检查全部通过

## [0.3.0] - 2026-08-14

### Added
- JSON-LD `@graph`：Organization / WebSite / BreadcrumbList / Article / FAQPage
- `src/lib/jsonld.ts` 与单元测试
- RSS feed `/rss.xml`：最近 50 条更新
- 3 个 SEO 长尾对比页：`/compare/<slug>`（Postgres vs SQLite、Playwright vs Chrome、Memory vs RAG）
- 可视化面包屑导航（首页 / 分类 / 详情 / 评测 / 对比）
- Cloudflare Pages 部署配置：`_headers`（CSP / HSTS / Permissions-Policy / X-Frame-Options）、`_redirects`
- `wrangler.toml` 部署文件
- GitHub Actions：每 6 小时同步 + check + test + build + deploy（`/.github/workflows/sync-build.yml`）
- 本地 Node 预览服务器 `scripts/preview-headers.mjs`：模拟 Cloudflare `_headers` 行为
- 可访问性：skip-link、`aria-label`、`focus-visible`、`prefers-reduced-motion`
- favicon / logo SVG（紫色仪表针主题）
- 元数据：theme-color / color-scheme / og:site_name / twitter:card / Twitter summary_large_image
- README + CHANGELOG

### Changed
- 分类页：推荐条目 24 + 折叠剩余 + "数据较少" 分组
- 详情页：用真正的面包屑替代「← 分类」箭头
- 评测页：FAQ schema + Article schema + 面包屑
- 卡片网格宽度：320 → 280，首屏容纳更多列
- 搜索索引缓存：`max-age=3600`，RSS 与 sitemap 同样缓存

### Verified
- `astro check`：0 errors / 0 warnings / 0 hints
- `npm test`：12 unit tests + 5 JSON-LD tests
- `npm run build`：3,435 pages
- Playwright E2E：31 个浏览器真测检查全部通过

## [0.2.0] - 2026-08-14

### Added
- SEO 基础设施：Organization / WebSite / BreadcrumbList JSON-LD @graph
- Article 与 FAQPage schema 用于评测页
- 评测页 FAQ 自动生成
- 分类页与详情页可视化面包屑导航
- RSS feed `/rss.xml`：最近 50 条更新
- sitemap.xml 拆分 candidate 过滤（只收录高质量页）
- Cloudflare Pages 配置：`_headers` 含 CSP / HSTS / Permissions-Policy / X-Frame-Options
- Cloudflare Pages 配置：`_redirects` 处理别名与尾斜杠
- GitHub Actions：每 6 小时自动同步 + 检查 + 构建 + 部署
- Wrangler 部署配置 `wrangler.toml`
- 可访问性：skip-link、`aria-label`、`focus-visible`、`prefers-reduced-motion`
- 单元测试：JSON-LD 构造器、VerificationRecord 存储
- 端到端 Playwright 测试覆盖：首页、搜索、详情、sitemap、移动端
- favicon.svg / logo.svg（紫色仪表针主题）
- 元数据：theme-color / color-scheme / og:site_name / twitter:card
- 404 兜底（Cloudflare Pages 自动生成，但站点内部 0 死链）

### Changed
- 详情页只展示 README 中真实可提取的安装命令，避免自动拼包名
- 详情页区分「协议级兼容」与「端到端实测」
- 排序：所有 server 列表以 stars + 最近提交综合排序
- 移动端：首页只展示 Top 3 + 6 个分类，避免首屏过长

## [0.1.0] - 2026-08-14

### Added
- 初始版本：3,360 个 MCP server、56 个分类、3,432 个静态页
- 6 篇中文评测文章
- 真实 MCP 测试：`@modelcontextprotocol/server-everything` 协议握手 + 工具发现