export interface Server {
  name: string;
  url: string;
  github_url: string;
  description: string;
  category: string;
  subcategory: string;
  language: string;
  badges: Record<string, boolean>;
  compatible_clients: string[];
  source: string;
  stars: number;
  last_commit: string;
  gh_forks?: number;
  gh_open_issues?: number;
  gh_license?: string;
  gh_topics?: string[];
}

export interface ProcessedServer extends Server {
  slug: string;
  is_real: boolean;
  is_active: boolean;
  is_chinese_friendly: boolean;
}

import serversRaw from '../data/servers.json';

export function slugify(name: string): string {
  const ascii = name
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 72);
  return ascii || 'mcp-server';
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 7);
}

let serverCache: ProcessedServer[] | undefined;

export function getAllServers(): ProcessedServer[] {
  if (serverCache) return serverCache;

  const seenUrls = new Set<string>();
  const seenSlugs = new Set<string>();
  const processed: ProcessedServer[] = [];

  for (const raw of serversRaw as Server[]) {
    if (!raw.url || !/^https?:\/\//.test(raw.url) || !raw.name || seenUrls.has(raw.url)) continue;
    seenUrls.add(raw.url);

    const baseSlug = slugify(raw.name);
    const slug = seenSlugs.has(baseSlug) ? `${baseSlug}-${stableHash(raw.url)}` : baseSlug;
    seenSlugs.add(slug);

    const description = (raw.description || '').trim() || `${raw.name} 是一个收录于 MCP 生态的 server，提供标准化工具与数据连接能力。`;
    const last = raw.last_commit || '';
    const daysSinceLastCommit = last ? (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) : 9999;
    const descLower = description.toLowerCase();

    processed.push({
      ...raw,
      description,
      slug,
      is_real: true,
      is_active: daysSinceLastCommit < 365,
      is_chinese_friendly:
        descLower.includes('chinese') ||
        descLower.includes('中文') ||
        descLower.includes('mandarin') ||
        descLower.includes('拼音') ||
        descLower.includes('qwen') ||
        descLower.includes('deepseek'),
    });
  }

  serverCache = processed;
  return processed;
}

export function getCategories(): { name: string; count: number; slug: string }[] {
  const counts: Record<string, number> = {};
  for (const s of getAllServers()) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => b.count - a.count);
}

export function getByCategory(catName: string): ProcessedServer[] {
  return getAllServers().filter((s) => s.category === catName);
}

export function getBySlug(slug: string): ProcessedServer | undefined {
  return getAllServers().find((s) => s.slug === slug);
}

export function getTopByStars(n: number): ProcessedServer[] {
  return getAllServers()
    .filter((s) => s.stars > 0)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, n);
}

export function getRecentlyUpdated(n: number): ProcessedServer[] {
  return getAllServers()
    .filter((s) => s.last_commit)
    .sort((a, b) => (b.last_commit || '').localeCompare(a.last_commit || ''))
    .slice(0, n);
}

export const CLIENT_LABELS: Record<string, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  codex: 'Codex',
  windsurf: 'Windsurf',
  continue: 'Continue',
  cline: 'Cline',
};

export function getByClient(client: string): ProcessedServer[] {
  return getAllServers().filter((s) => s.compatible_clients.includes(client));
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
