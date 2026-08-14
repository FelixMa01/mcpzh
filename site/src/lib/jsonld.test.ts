import { describe, expect, it } from 'vitest';
import { breadcrumbJsonLd, websiteJsonLd, organizationJsonLd, articleJsonLd, faqJsonLd } from './jsonld';

describe('JSON-LD @graph builders', () => {
  it('构造面包屑列表项位置正确', () => {
    const json = breadcrumbJsonLd([
      { name: '首页', item: '/' },
      { name: '分类', item: '/category' },
      { name: '数据库', item: '/category/databases' },
    ]);
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement).toHaveLength(3);
    expect(json.itemListElement[0].position).toBe(1);
    expect(json.itemListElement[2].name).toBe('数据库');
  });

  it('WebSite 含搜索动作', () => {
    const json = websiteJsonLd('https://mcpzh.com');
    expect(json.potentialAction.target.urlTemplate).toBe('https://mcpzh.com/search?q={search_term_string}');
    expect(json.inLanguage).toBe('zh-CN');
  });

  it('Organization 引用 logo 与 sameAs', () => {
    const json = organizationJsonLd('https://mcpzh.com');
    expect(json.logo).toBe('https://mcpzh.com/logo.svg');
    expect(json.sameAs.length).toBeGreaterThan(0);
  });

  it('Article 默认日期与 publisher', () => {
    const json = articleJsonLd({
      site: 'https://mcpzh.com',
      url: 'https://mcpzh.com/blog/foo',
      title: '测试',
      description: '描述',
    });
    expect(json['@type']).toBe('Article');
    expect(json.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(json.publisher.name).toBe('MCP中文');
  });

  it('FAQPage 把 Q/A 转成 acceptedAnswer', () => {
    const json = faqJsonLd([{ question: 'Q', answer: 'A' }]);
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity[0].acceptedAnswer.text).toBe('A');
  });
});