import { describe, expect, it } from 'vitest';
import { getAllServers, getCategories, slugify } from './data';

describe('MCP 目录数据规范', () => {
  it('只返回真实 http(s) server，并按 URL 去重', () => {
    const servers = getAllServers();
    expect(servers.length).toBeGreaterThan(3000);
    expect(servers.every((s) => /^https?:\/\//.test(s.url))).toBe(true);
    expect(new Set(servers.map((s) => s.url)).size).toBe(servers.length);
  });

  it('为每个 server 生成唯一且非空的 slug', () => {
    const servers = getAllServers();
    expect(servers.every((s) => s.slug.length > 0)).toBe(true);
    expect(new Set(servers.map((s) => s.slug)).size).toBe(servers.length);
  });

  it('为空描述提供可读回退文案', () => {
    expect(getAllServers().every((s) => s.description.trim().length > 0)).toBe(true);
  });

  it('生成稳定分类统计', () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(40);
    expect(categories.reduce((sum, c) => sum + c.count, 0)).toBe(getAllServers().length);
  });

  it('slugify 可处理中文与符号名称', () => {
    expect(slugify('高德地图 MCP / Server')).toMatch(/^[a-z0-9-]+$/);
    expect(slugify('高德地图 MCP / Server').length).toBeGreaterThan(0);
  });
});
