import type { APIRoute } from 'astro';
import { getAllServers, formatDate } from '../lib/data';

export const GET: APIRoute = ({ site }) => {
  const base = (site || new URL('https://mcpzh.com')).toString().replace(/\/$/, '');
  const recent = getAllServers()
    .filter((s) => s.last_commit)
    .sort((a, b) => (b.last_commit || '').localeCompare(a.last_commit || ''))
    .slice(0, 50);
  const items = recent.map((s) => `
    <item>
      <title><![CDATA[${s.name} 更新（${formatDate(s.last_commit)}）]]></title>
      <link>${base}/server/${s.slug}</link>
      <guid>${base}/server/${s.slug}</guid>
      <pubDate>${new Date(s.last_commit).toUTCString()}</pubDate>
      <description><![CDATA[${s.description.slice(0, 280)}]]></description>
      <category>${s.category}</category>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>MCP中文 — 最近更新</title>
  <link>${base}</link>
  <description>3,300+ MCP server 目录的最近 50 条活跃更新</description>
  <language>zh-CN</language>${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};