import {
  CALCULATOR_CATALOG,
  CATEGORIES,
  CalculatorCategory,
  CalculatorId,
  CalculatorMeta,
  LegalPageId,
} from '../data/calculatorCatalog';

export interface SitemapUrlEntry {
  loc: string;
  path: string;
  title: string;
  category: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

export const LEGAL_PAGE_META: Record<
  LegalPageId,
  { title: string; description: string; priority: string; changefreq: 'weekly' | 'monthly' }
> = {
  privacy: {
    title: 'Privacy Policy & Cookie Disclosure | OmniCalc',
    description:
      'Read the OmniCalc Privacy Policy, including third-party cookie disclosures, user rights, and 100% client-side calculation privacy.',
    priority: '0.6',
    changefreq: 'monthly',
  },
  terms: {
    title: 'Terms of Service & Usage Guidelines | OmniCalc',
    description:
      'Review the Terms of Service and usage guidelines for OmniCalc online financial, health, math, and text calculators.',
    priority: '0.5',
    changefreq: 'monthly',
  },
  disclaimer: {
    title: 'Financial, Health & Mathematical Disclaimer | OmniCalc',
    description:
      'Important financial, mortgage, investment, and health disclaimers for OmniCalc calculators and educational guides.',
    priority: '0.6',
    changefreq: 'monthly',
  },
  about: {
    title: 'About OmniCalc — Precision Methodology & Editorial Standards',
    description:
      'Learn about OmniCalc’s instant calculation methodology, editorial accuracy standards, and privacy-first architecture.',
    priority: '0.7',
    changefreq: 'monthly',
  },
  contact: {
    title: 'Contact OmniCalc Editorial Team',
    description:
      'Contact the OmniCalc team to report formula feedback, request new calculators, or inquire about partnerships.',
    priority: '0.6',
    changefreq: 'monthly',
  },
};

export function normalizeBaseUrl(rawUrl?: string): string {
  const fallback = 'https://bhavikog.github.io/omnicalc';
  if (!rawUrl || rawUrl === 'MY_APP_URL' || !rawUrl.startsWith('http')) {
    return fallback;
  }
  return rawUrl.replace(/\/+$/, '');
}

/**
 * Generates structured sitemap entries dynamically from the calculator catalog,
 * categories, and legal compliance routes.
 */
export function getSitemapEntries(
  baseUrl?: string,
  lastModDate: string = '2026-11-06'
): SitemapUrlEntry[] {
  const cleanBase = normalizeBaseUrl(baseUrl);
  const entries: SitemapUrlEntry[] = [];

  // 1. Homepage (Highest Priority)
  entries.push({
    loc: `${cleanBase}/`,
    path: '/',
    title: 'OmniCalc — Free Online Finance, Health, Math & Text Calculators',
    category: 'Portal Home',
    lastmod: lastModDate,
    changefreq: 'daily',
    priority: '1.0',
  });

  // 2. All 8 Calculator Routes (Core Ranking Pages)
  for (const calc of CALCULATOR_CATALOG) {
    const path = `/calculators/${calc.id}`;
    entries.push({
      loc: `${cleanBase}${path}`,
      path,
      title: `${calc.title} — Formula, Example & Free Online Tool`,
      category: `${calc.category} Calculator`,
      lastmod: lastModDate,
      changefreq: 'weekly',
      priority: calc.popular ? '0.95' : '0.90',
    });
  }

  // 3. Category Hub Routes
  for (const cat of CATEGORIES) {
    const slug = cat.id.toLowerCase();
    const path = `/category/${slug}`;
    entries.push({
      loc: `${cleanBase}${path}`,
      path,
      title: `${cat.name} Calculators — Free Online Tools & Formulas | OmniCalc`,
      category: 'Category Hub',
      lastmod: lastModDate,
      changefreq: 'weekly',
      priority: '0.80',
    });
  }

  // 4. Legal & Google AdSense Trust Pages
  const legalKeys: LegalPageId[] = ['privacy', 'terms', 'disclaimer', 'about', 'contact'];
  for (const key of legalKeys) {
    const meta = LEGAL_PAGE_META[key];
    const path = `/legal/${key}`;
    entries.push({
      loc: `${cleanBase}${path}`,
      path,
      title: meta.title,
      category: 'AdSense & Legal Compliance',
      lastmod: lastModDate,
      changefreq: meta.changefreq,
      priority: meta.priority,
    });
  }

  return entries;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a complete, standards-compliant XML Sitemap with hreflang annotations
 * for maximum Google Search Console & AdSense crawl indexing.
 */
export function generateSitemapXml(
  baseUrl?: string,
  lastModDate: string = '2026-11-06'
): string {
  const entries = getSitemapEntries(baseUrl, lastModDate);

  const urlBlocks = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(entry.loc)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(entry.loc)}" />
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by OmniCalc Sitemap Engine -->
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlBlocks}
</urlset>
`;
}

/**
 * Generates a robots.txt file explicitly permitting Googlebot and Mediapartners-Google (AdSense)
 * and linking to the canonical XML sitemap.
 */
export function generateRobotsTxt(baseUrl?: string): string {
  const cleanBase = normalizeBaseUrl(baseUrl);
  return `# OmniCalc Web Crawler Configuration
User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

User-agent: Googlebot
Allow: /

User-agent: *
Allow: /

Sitemap: ${cleanBase}/sitemap.xml
`;
}

export type ParsedPortalRoute =
  | { view: 'home'; categoryFilter: CalculatorCategory | 'All' }
  | { view: 'calculator'; id: CalculatorId }
  | { view: 'legal'; page: LegalPageId };

/**
 * Parses browser URL pathname and query string into a valid portal route
 * so every URL listed in public/sitemap.xml resolves directly to its page.
 */
export function parsePathnameToRoute(
  pathname: string,
  search: string = ''
): ParsedPortalRoute {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);

  // Support ?calc=<id> or ?legal=<page> query parameters
  const calcParam = params.get('calc') as CalculatorId | null;
  if (calcParam && CALCULATOR_CATALOG.some((c) => c.id === calcParam)) {
    return { view: 'calculator', id: calcParam };
  }

  const legalParam = params.get('legal') as LegalPageId | null;
  if (legalParam && legalParam in LEGAL_PAGE_META) {
    return { view: 'legal', page: legalParam };
  }

  // Match /calculators/:id
  if (cleanPath.startsWith('/calculators/')) {
    const slug = cleanPath.replace('/calculators/', '') as CalculatorId;
    const matched = CALCULATOR_CATALOG.find((c) => c.id === slug);
    if (matched) {
      return { view: 'calculator', id: matched.id };
    }
  }

  // Match /category/:cat
  if (cleanPath.startsWith('/category/')) {
    const slug = cleanPath.replace('/category/', '').toLowerCase();
    const matchedCat = CATEGORIES.find((c) => c.id.toLowerCase() === slug);
    if (matchedCat) {
      return { view: 'home', categoryFilter: matchedCat.id };
    }
  }

  // Match /legal/:page
  if (cleanPath.startsWith('/legal/')) {
    const slug = cleanPath.replace('/legal/', '') as LegalPageId;
    if (slug in LEGAL_PAGE_META) {
      return { view: 'legal', page: slug };
    }
  }

  return { view: 'home', categoryFilter: 'All' };
}

/**
 * Builds rich Schema.org JSON-LD (@graph) for the active route:
 * - WebSite + SearchAction + ItemList on Home
 * - SoftwareApplication + FAQPage + HowTo + BreadcrumbList on Calculator pages
 * - WebPage + BreadcrumbList on Legal Compliance pages
 */
export function buildSchemaOrgGraph(
  baseUrl: string,
  route:
    | { view: 'home'; categoryFilter?: CalculatorCategory | 'All' }
    | { view: 'calculator'; meta: CalculatorMeta }
    | { view: 'legal'; page: LegalPageId }
): Record<string, unknown> {
  const cleanBase = normalizeBaseUrl(baseUrl);

  if (route.view === 'calculator') {
    const { meta } = route;
    const pageUrl = `${cleanBase}/calculators/${meta.id}`;
    const categorySlug = meta.category.toLowerCase();

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          '@id': `${pageUrl}#software`,
          name: meta.title,
          applicationCategory:
            meta.category === 'Finance'
              ? 'FinanceApplication'
              : meta.category === 'Health'
              ? 'HealthApplication'
              : 'UtilitiesApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires JavaScript. Runs 100% client-side in any modern browser.',
          url: pageUrl,
          description: meta.summary,
          keywords: meta.keywords.join(', '),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            'Instant real-time calculation on input change',
            `Verified mathematical formula: ${meta.formulaExpression}`,
            'Worked step-by-step calculation example',
            'Interactive Frequently Asked Questions (FAQ)',
          ],
        },
        {
          '@type': 'HowTo',
          '@id': `${pageUrl}#howto`,
          name: meta.exampleTitle,
          description: meta.exampleScenario,
          step: meta.exampleSteps.map((stepText, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: `Step ${idx + 1}`,
            text: stepText,
          })),
        },
        {
          '@type': 'FAQPage',
          '@id': `${pageUrl}#faq`,
          mainEntity: meta.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'OmniCalc Home',
              item: `${cleanBase}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: `${meta.category} Calculators`,
              item: `${cleanBase}/category/${categorySlug}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: meta.title,
              item: pageUrl,
            },
          ],
        },
      ],
    };
  }

  if (route.view === 'legal') {
    const legalMeta = LEGAL_PAGE_META[route.page];
    const pageUrl = `${cleanBase}/legal/${route.page}`;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': pageUrl,
          url: pageUrl,
          name: legalMeta.title,
          description: legalMeta.description,
          isPartOf: { '@id': `${cleanBase}/#website` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'OmniCalc Home',
              item: `${cleanBase}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: legalMeta.title,
              item: pageUrl,
            },
          ],
        },
      ],
    };
  }

  // Default: Home Portal Schema (@graph with WebSite + ItemList of all 8 Calculators)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${cleanBase}/#website`,
        url: `${cleanBase}/`,
        name: 'OmniCalc — Precision Financial, Health, Math & Text Calculators',
        description:
          'Fast, accessible, AdSense-ready multi-calculator web portal featuring Loan EMI, Compound Interest, BMI, TDEE, Percentage, Discount, Age, and Word Counter tools.',
        inLanguage: 'en-US',
      },
      {
        '@type': 'ItemList',
        name: 'OmniCalc Online Calculators Directory',
        numberOfItems: CALCULATOR_CATALOG.length,
        itemListElement: CALCULATOR_CATALOG.map((calc, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: calc.title,
          description: calc.summary,
          url: `${cleanBase}/calculators/${calc.id}`,
        })),
      },
    ],
  };
}
