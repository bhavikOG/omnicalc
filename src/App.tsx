/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CALCULATOR_CATALOG,
  CATEGORIES,
  CalculatorCategory,
  CalculatorId,
  LegalPageId,
} from './data/calculatorCatalog';
import { HomeView } from './components/HomeView';
import { AdSenseContentStructure } from './components/AdSenseContentStructure';
import {
  LoanEmiCalculator,
  CompoundInterestCalculator,
} from './components/calculators/FinanceCalculators';
import {
  BmiCalculator,
  TdeeCalculator,
} from './components/calculators/HealthCalculators';
import {
  PercentageCalculator,
  DiscountTaxCalculator,
  AgeDateCalculator,
  WordCounterCalculator,
} from './components/calculators/MathTextCalculators';
import { LegalCompliancePages } from './components/LegalCompliancePages';
import { SeoHeadManager } from './components/SeoHeadManager';
import { parsePathnameToRoute } from './utils/seoSitemap';
import { Search, Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';

type ActiveRoute =
  | { view: 'home' }
  | { view: 'calculator'; id: CalculatorId }
  | { view: 'legal'; page: LegalPageId };

export default function App() {
  const [route, setRoute] = useState<ActiveRoute>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parsePathnameToRoute(window.location.pathname, window.location.search);
      if (parsed.view === 'calculator') return { view: 'calculator', id: parsed.id };
      if (parsed.view === 'legal') return { view: 'legal', page: parsed.page };
    }
    return { view: 'home' };
  });

  const [categoryFilter, setCategoryFilter] = useState<CalculatorCategory | 'All'>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parsePathnameToRoute(window.location.pathname, window.location.search);
      if (parsed.view === 'home') return parsed.categoryFilter;
    }
    return 'All';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omnicalc-theme') === 'dark';
    }
    return false;
  });

  // Header Category Dropdown & Search Bar states
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [headerSearch, setHeaderSearch] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('omnicalc-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('omnicalc-theme', 'light');
    }
  }, [darkMode]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePathnameToRoute(window.location.pathname, window.location.search);
      if (parsed.view === 'calculator') {
        setRoute({ view: 'calculator', id: parsed.id });
      } else if (parsed.view === 'legal') {
        setRoute({ view: 'legal', page: parsed.page });
      } else {
        setRoute({ view: 'home' });
        setCategoryFilter(parsed.categoryFilter);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close header dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pushUrlPath = (nextPath: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  };

  const navigateToCalculator = (id: CalculatorId) => {
    setRoute({ view: 'calculator', id });
    pushUrlPath(`/calculators/${id}`);
    setCategoryMenuOpen(false);
    setSearchDropdownOpen(false);
    setMobileMenuOpen(false);
    setHeaderSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLegal = (page: LegalPageId) => {
    setRoute({ view: 'legal', page });
    pushUrlPath(`/legal/${page}`);
    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateHome = (cat: CalculatorCategory | 'All' = 'All') => {
    setCategoryFilter(cat);
    setRoute({ view: 'home' });
    pushUrlPath(cat === 'All' ? '/' : `/category/${cat.toLowerCase()}`);
    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const headerSearchResults = headerSearch.trim()
    ? CALCULATOR_CATALOG.filter((c) => {
        const q = headerSearch.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.shortTitle.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.keywords.some((kw) => kw.toLowerCase().includes(q))
        );
      })
    : [];

  const renderCalculatorById = (id: CalculatorId) => {
    switch (id) {
      case 'loan-emi':
        return <LoanEmiCalculator />;
      case 'compound-interest':
        return <CompoundInterestCalculator />;
      case 'bmi':
        return <BmiCalculator />;
      case 'tdee':
        return <TdeeCalculator />;
      case 'percentage':
        return <PercentageCalculator />;
      case 'discount-tax':
        return <DiscountTaxCalculator />;
      case 'age-date':
        return <AgeDateCalculator />;
      case 'word-counter':
        return <WordCounterCalculator />;
    }
  };

  const activeCalculatorMeta =
    route.view === 'calculator'
      ? CALCULATOR_CATALOG.find((c) => c.id === route.id)
      : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <SeoHeadManager route={route} categoryFilter={categoryFilter} />
      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateHome('All')}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            OmniCalc
          </button>

          {/* Zone 2: Category Dropdown & Direct Category Links + Quick Search Bar */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl justify-center">
            <nav aria-label="Main Navigation" className="flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
              {/* Category Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  aria-expanded={categoryMenuOpen}
                  onClick={() => setCategoryMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 ${
                      categoryMenuOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>

                {categoryMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-2 z-40">
                    {CATEGORIES.map((cat) => {
                      const catTools = CALCULATOR_CATALOG.filter(
                        (c) => c.category === cat.id
                      );
                      return (
                        <div
                          key={cat.id}
                          className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <button
                            type="button"
                            onClick={() => navigateHome(cat.id)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer block mb-1"
                          >
                            {cat.name}
                          </button>
                          <div className="space-y-1">
                            {catTools.map((tool) => (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => navigateToCalculator(tool.id)}
                                className="block w-full text-left text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-0.5 cursor-pointer truncate"
                              >
                                {tool.shortTitle}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigateHome('Finance')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Finance
              </button>
              <button
                type="button"
                onClick={() => navigateHome('Health')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Health
              </button>
              <button
                type="button"
                onClick={() => navigateHome('Math')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Math
              </button>
              <button
                type="button"
                onClick={() => navigateHome('Text')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Text
              </button>
            </nav>

            {/* Header Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search calculators in header"
                value={headerSearch}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setHeaderSearch(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                placeholder="Find any calculator..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              {searchDropdownOpen && headerSearch.trim() !== '' && (
                <div className="absolute right-0 left-0 mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1.5 z-40 max-h-72 overflow-y-auto">
                  {headerSearchResults.length > 0 ? (
                    headerSearchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToCalculator(item.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.shortTitle}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {item.category}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2 text-xs text-slate-500">
                      No matching tools found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Zone 3: Dark/Light Mode Toggle & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              aria-label="Toggle Mobile Navigation"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {CALCULATOR_CATALOG.map((calc) => (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => navigateToCalculator(calc.id)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                >
                  <div className="text-[10px] text-slate-400">{calc.category}</div>
                  <div className="truncate">{calc.shortTitle}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {route.view === 'home' && (
          <HomeView
            selectedCategoryFilter={categoryFilter}
            onSelectCategoryFilter={(cat) => navigateHome(cat)}
            onSelectCalculator={navigateToCalculator}
            onSelectLegalPage={navigateToLegal}
          />
        )}

        {route.view === 'calculator' && activeCalculatorMeta && (
          <AdSenseContentStructure
            meta={activeCalculatorMeta}
            onSelectCalculator={navigateToCalculator}
            onNavigateHome={() => navigateHome('All')}
          >
            {renderCalculatorById(activeCalculatorMeta.id)}
          </AdSenseContentStructure>
        )}

        {route.view === 'legal' && (
          <LegalCompliancePages
            activePage={route.page}
            onSelectLegalPage={navigateToLegal}
            onSelectCalculator={navigateToCalculator}
            onNavigateHome={(cat) => navigateHome(cat ?? 'All')}
          />
        )}
      </main>

      {/* FOOTER WITH FULL CALCULATOR DIRECTORY & ADSENSE COMPLIANCE LINKS */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-3">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                OmniCalc
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                Precision online calculators for Finance, Health, Everyday Math, and Text analysis. All tools execute locally in your browser with transparent formulas and step-by-step worked examples.
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  XML Sitemap (/sitemap.xml)
                </a>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  robots.txt
                </a>
              </div>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Finance &amp; Health
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('loan-emi')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Loan EMI &amp; Mortgage
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('compound-interest')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Compound Interest
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('bmi')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      BMI Health Gauge
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('tdee')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      TDEE &amp; Calorie Deficit
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Math &amp; Text Utilities
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('percentage')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      3-in-1 Percentage
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('discount-tax')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Discount &amp; Sales Tax
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('age-date')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Age &amp; Date Difference
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('word-counter')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Word &amp; Reading Counter
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Trust &amp; Legal Policy
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('privacy')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Privacy Policy &amp; Cookies
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('terms')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('disclaimer')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Financial &amp; Health Disclaimer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('about')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    About &amp; SEO Sitemap
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('contact')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              © {new Date().getFullYear()} OmniCalc Portal. Built for informational &amp; educational reference.
            </div>
            <div className="flex items-center gap-3">
              <span>GitHub Pages &amp; Vercel Static Ready</span>
              <span aria-hidden="true">·</span>
              <span>Antigravity Portable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
