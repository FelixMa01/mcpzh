import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base = 'http://127.0.0.1:4322';
const failures = [];
const checks = [];
function check(condition, message) {
  checks.push({ message, passed: Boolean(condition) });
  if (!condition) failures.push(message);
  console.log(`${condition ? '✓' : '✗'} ${message}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));

try {
  const home = await page.goto(base, { waitUntil: 'networkidle' });
  check(home?.status() === 200, '首页返回 HTTP 200');
  check((await page.title()).includes('MCP中文'), '首页 title 正确');
  const bodyText = await page.locator('body').innerText();
  check(/共 3\d{3} 个 server/.test(bodyText), '首页显示去重后的真实 server 数量');
  check(await page.locator('.category-card').count() >= 12, '首页分类卡片已渲染');
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/mcpzh-home.png', fullPage: true });

  const search = await page.goto(`${base}/search?q=postgres`, { waitUntil: 'networkidle' });
  check(search?.status() === 200, '搜索页返回 HTTP 200');
  await page.waitForFunction(() => document.querySelector('#status')?.textContent?.includes('找到'));
  const resultCount = await page.locator('#results .card').count();
  check(resultCount > 0, `postgres 搜索返回 ${resultCount} 个结果`);
  check((await page.locator('#results').innerText()).toLowerCase().includes('postgres'), '搜索结果命中 postgres');

  const detail = await page.goto(`${base}/server/modelcontextprotocol-server-everything`, { waitUntil: 'networkidle' });
  check(detail?.status() === 200, '官方 Everything 详情页返回 HTTP 200');
  const detailText = await page.locator('body').innerText();
  check(detailText.includes('已通过端到端测试'), '详情页展示真实协议测试状态');
  check(detailText.includes('13 个工具'), '详情页展示 tools/list 实测数量');
  check(detailText.includes('2025-06-18'), '详情页展示协商协议版本');

  const sitemap = await page.request.get(`${base}/sitemap.xml`);
  const sitemapText = await sitemap.text();
  check(sitemap.status() === 200, 'sitemap.xml 返回 HTTP 200');
  check((sitemapText.match(/<url>/g) || []).length > 1000, 'sitemap 收录超过 1000 个高质量页面');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  check(await page.locator('.card').first().isVisible(), '移动端首页卡片可见');
  check(await page.locator('.mobile-nav summary').isVisible(), '移动端菜单入口可见');
  await page.locator('.mobile-nav summary').click();
  check(await page.locator('.mobile-nav nav a').first().isVisible(), '移动端导航展开可用');
  check(await page.locator('.top-grid .card:visible').count() === 3, '移动端首页仅展示 Top 3，控制首屏长度');
  check(await page.locator('.home-categories .category-card:visible').count() === 7, '移动端仅展示 6 个分类与查看全部');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check(!overflow, '移动端没有横向溢出');
  await page.screenshot({ path: '/tmp/mcpzh-mobile.png', fullPage: true });

  const rss = await page.request.get(`${base}/rss.xml`);
  check(rss.status() === 200, 'rss.xml 返回 HTTP 200');
  const rssText = await rss.text();
  check(rssText.includes('<rss'), 'rss 是合法 XML');
  check((rssText.match(/<item>/g) || []).length > 5, 'rss 包含多条更新项');

  const headers = await page.request.get(`${base}/`);
  const csp = headers.headers()['content-security-policy'] || '';
  check(csp.includes("default-src 'self'"), '首页附带 CSP');
  check(headers.headers()['x-content-type-options'] === 'nosniff', '首页附带 nosniff');
  check((headers.headers()['strict-transport-security'] || '').includes('max-age='), '首页附带 HSTS');

  // Search index must be small enough to ship (under 1.5MB after compact encoding)
  const searchIdxResp = await page.request.get(`${base}/search-index.json`);
  const searchIdxSize = (await searchIdxResp.body()).length;
  check(searchIdxSize > 0 && searchIdxSize < 1_500_000, `search-index.json 大小合理 (${searchIdxSize} 字节 < 1.5MB)`);

  // Largest page under 300KB
  const devToolsResp = await page.request.get(`${base}/category/developer-tools/`);
  const devToolsLen = (await devToolsResp.body()).length;
  check(devToolsLen > 0 && devToolsLen < 300_000, `Developer Tools 分类页大小合理 (${devToolsLen} 字节 < 300KB)`);

  const homeJsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  check(Boolean(homeJsonLd && homeJsonLd.includes('"@type":"Organization"')), '首页 JSON-LD 含 Organization');
  check(Boolean(homeJsonLd && homeJsonLd.includes('"@type":"WebSite"')), '首页 JSON-LD 含 WebSite');
  check(Boolean(homeJsonLd && homeJsonLd.includes('"@type":"FAQPage"')), '首页 JSON-LD 含 FAQPage');

  await page.goto(`${base}/category/databases`, { waitUntil: 'networkidle' });
  check(await page.locator('nav.breadcrumbs').count() === 1, '分类页显示可视化面包屑');
  const catJsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  check(Boolean(catJsonLd && catJsonLd.includes('"@type":"BreadcrumbList"')), '分类页 JSON-LD 含 BreadcrumbList');

  check(consoleErrors.length === 0, `浏览器控制台无错误（${consoleErrors.length}）`);
} finally {
  await browser.close();
}

await fs.writeFile('/tmp/mcpzh-e2e.json', JSON.stringify({ checks, consoleErrors }, null, 2));
if (failures.length) {
  console.error(`\n${failures.length} checks failed:`, failures);
  process.exit(1);
}
console.log(`\nAll ${checks.length} browser checks passed.`);
