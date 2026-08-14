/**
 * Build a JSON-LD @graph for any page that receives breadcrumbs + meta.
 * Used by Base.astro for layout-level schema; pages can override or extend.
 */
export interface BreadcrumbItem { name: string; item: string; }

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: b.item,
    })),
  };
}

export function websiteJsonLd(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MCP中文',
    url: site,
    inLanguage: 'zh-CN',
    description: '选 MCP server 的中文决策站',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MCP中文',
    url: site,
    logo: `${site}/logo.svg`,
    sameAs: [
      'https://github.com/punkpeye/awesome-mcp-servers',
      'https://github.com/yzfly/Awesome-MCP-ZH',
    ],
  };
}

export function articleJsonLd(opts: {
  site: string;
  url: string;
  title: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    datePublished: opts.datePublished ?? new Date().toISOString().slice(0, 10),
    dateModified: opts.dateModified ?? new Date().toISOString().slice(0, 10),
    inLanguage: 'zh-CN',
    author: { '@type': 'Organization', name: opts.author ?? 'MCP中文编辑部' },
    publisher: {
      '@type': 'Organization',
      name: 'MCP中文',
      url: opts.site,
      logo: { '@type': 'ImageObject', url: `${opts.site}/logo.svg` },
    },
    articleSection: opts.category,
  };
}

export function faqJsonLd(qa: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}