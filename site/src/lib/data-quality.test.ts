import { describe, expect, it } from 'vitest';
import { getByCategory } from './data';
import { getVerifiedServerNames } from './verification';

describe('数据质量', () => {
  it('每个分类至少含 1 个 server', () => {
    const categories = ['Databases', 'Security', 'Browser Automation', 'Search & Data Extraction'];
    for (const c of categories) {
      const list = getByCategory(c);
      expect(list.length).toBeGreaterThan(0);
    }
  });

  it('verify 记录与真实 server 名字对应', () => {
    const names = getVerifiedServerNames();
    expect(names).toContain('modelcontextprotocol/server-everything');
  });

  it('detail 页能基于 slug 还原 server', () => {
    const sample = getByCategory('Databases')[0];
    expect(sample).toBeDefined();
    const found = data.getAllServers().find((s) => s.slug === sample!.slug);
    expect(found?.name).toBe(sample!.name);
  });
});

import * as data from './data';