import type { APIRoute } from 'astro';
import { getAllServers, getCategories } from '../lib/data';
import { articles } from '../data/articles';
import { comparePairs } from '../data/compare';

export const GET: APIRoute = ({ site }) => {
  const base = (site || new URL('https://mcpzh.com')).toString().replace(/\/$/, '');
  const fixed = ['', '/category/', '/client/', '/blog/', '/best/', '/about/'];
  const categories = getCategories().map((c) => `/category/${c.slug}/`);
  const richServers = getAllServers().filter((s) => s.stars > 0 || s.description.length >= 100 || s.is_chinese_friendly).map((s) => `/server/${s.slug}/`);
  const blogs = articles.map((a) => `/blog/${a.slug}/`);
  const compares = comparePairs.map((c) => `/compare/${c.slug}/`);
  const urls = [...fixed, ...categories, ...richServers, ...blogs, ...compares];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((p) => `<url><loc>${base}${p}</loc></url>`).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
