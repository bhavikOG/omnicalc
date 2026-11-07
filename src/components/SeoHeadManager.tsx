import React, { useEffect } from 'react';
import {
  CALCULATOR_CATALOG,
  CATEGORIES,
  CalculatorCategory,
  CalculatorId,
  LegalPageId,
} from '../data/calculatorCatalog';
import { buildSchemaOrgGraph, LEGAL_PAGE_META, normalizeBaseUrl } from '../utils/seoSitemap';

interface SeoHeadManagerProps {
  route:
    | { view: 'home' }
    | { view: 'calculator'; id: CalculatorId }
    | { view: 'legal'; page: LegalPageId };
  categoryFilter: CalculatorCategory | 'All';
}

function setMetaContent(selector: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export const SeoHeadManager: React.FC<SeoHeadManagerProps> = ({ route, categoryFilter }) => {
  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? normalizeBaseUrl(window.location.origin)
        : normalizeBaseUrl();

    let pageTitle = 'OmniCalc — 100% Free Online Calculators [Instant & Private]';
    let pageDescription =
      '⚡ 100% Free & No Sign-Up. Instant, accurate calculations for Loan EMI, SIP Retirement, Compound Interest, BMI & Calories. 100% on-device privacy.';
    let canonicalPath = '/';
    let jsonLdPayload: Record<string, unknown>;

    if (route.view === 'calculator') {
      const meta = CALCULATOR_CATALOG.find((c) => c.id === route.id);
      if (meta) {
        pageTitle = `${meta.shortTitle} Calculator [Free · Instant & Accurate] | OmniCalc`;
        pageDescription = `⚡ 100% Free & No Sign-Up. ${meta.summary} Instant visual breakdown & 100% private.`;
        canonicalPath = `/calculators/${meta.id}`;
        jsonLdPayload = buildSchemaOrgGraph(origin, { view: 'calculator', meta });
      } else {
        jsonLdPayload = buildSchemaOrgGraph(origin, { view: 'home' });
      }
    } else if (route.view === 'legal') {
      const legalMeta = LEGAL_PAGE_META[route.page];
      pageTitle = legalMeta.title;
      pageDescription = legalMeta.description;
      canonicalPath = `/legal/${route.page}`;
      jsonLdPayload = buildSchemaOrgGraph(origin, { view: 'legal', page: route.page });
    } else {
      if (categoryFilter !== 'All') {
        const catObj = CATEGORIES.find((c) => c.id === categoryFilter);
        if (catObj) {
          pageTitle = `${catObj.name} Calculators — Free Online Tools & Formulas | OmniCalc`;
          pageDescription = `${catObj.description} Instant client-side calculators with step-by-step mathematical formulas and worked examples.`;
          canonicalPath = `/category/${catObj.id.toLowerCase()}`;
        }
      }
      jsonLdPayload = buildSchemaOrgGraph(origin, { view: 'home', categoryFilter });
    }

    const fullCanonicalUrl = `${origin}${canonicalPath}`;

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update Meta Description & Social Card Tags
    setMetaContent('meta[name="description"]', pageDescription);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:description"]', pageDescription);
    setMetaContent('meta[property="og:url"]', fullCanonicalUrl);
    setMetaContent('meta[name="twitter:title"]', pageTitle);
    setMetaContent('meta[name="twitter:description"]', pageDescription);

    // 3. Update Canonical Link
    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', fullCanonicalUrl);

    // 4. Inject / Update Schema.org JSON-LD Script
    let scriptEl = document.getElementById('omnicalc-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'omnicalc-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdPayload, null, 2);
  }, [route, categoryFilter]);

  return null;
};
