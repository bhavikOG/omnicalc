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
  SipRetirementCalculator,
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
  UnitConverterCalculator,
} from './components/calculators/MathTextCalculators';
import { LegalCompliancePages } from './components/LegalCompliancePages';
import { SeoHeadManager } from './components/SeoHeadManager';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { parsePathnameToRoute } from './utils/seoSitemap';
import {
  SavedCalculationItem,
  loadSavedCalculations,
  saveCalculationToHistory,
  clearSavedCalculations,
  loadPinnedFavorites,
  savePinnedFavorites,
  sanitizeSingleLineInput,
  CurrencyCode,
  CURRENCY_OPTIONS,
  loadPreferredCurrency,
  savePreferredCurrency,
  wipeAllLocalData,
  getSecurityAuditStatus,
  installAntiInspectProtection,
} from './utils/security';
import {
  Search,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Calculator,
} from 'lucide-react';

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
      const saved = localStorage.getItem('omnicalc-theme');
      if (saved === 'light') return false;
      if (saved === 'dark') return true;
    }
    return true;
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => loadPreferredCurrency());

  // Retention features: Pinned Calculators & On-Device Saved Results
  const [pinnedIds, setPinnedIds] = useState<CalculatorId[]>(
    () => loadPinnedFavorites() as CalculatorId[]
  );
  const [savedHistory, setSavedHistory] = useState<SavedCalculationItem[]>(() =>
    loadSavedCalculations()
  );

  // Header Category Dropdown, Privacy Popover & Search Bar states
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [securityPanelOpen, setSecurityPanelOpen] = useState<boolean>(false);
  const [wipeConfirmedToast, setWipeConfirmedToast] = useState<boolean>(false);
  const [inspectBlockedAlert, setInspectBlockedAlert] = useState<string | null>(null);
  const [headerSearch, setHeaderSearch] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inspectToastTimeoutRef = useRef<number | null>(null);

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

  // Chrome Inspect, Context-Menu & View-Source Protection
  useEffect(() => {
    const cleanup = installAntiInspectProtection((reason) => {
      setInspectBlockedAlert(reason);
      if (inspectToastTimeoutRef.current) {
        window.clearTimeout(inspectToastTimeoutRef.current);
      }
      inspectToastTimeoutRef.current = window.setTimeout(() => {
        setInspectBlockedAlert(null);
      }, 2800);
    });
    return () => {
      cleanup();
      if (inspectToastTimeoutRef.current) {
        window.clearTimeout(inspectToastTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K focuses header quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchDropdownOpen(true);
      } else if (e.key === 'Escape') {
        setSearchDropdownOpen(false);
        setCategoryMenuOpen(false);
        setSecurityPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close header dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
      if (securityRef.current && !securityRef.current.contains(e.target as Node)) {
        setSecurityPanelOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    setCurrency(nextCurrency);
    savePreferredCurrency(nextCurrency);
  };

  const handleTogglePin = (id: CalculatorId) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      savePinnedFavorites(next);
      return next;
    });
  };

  const handleSaveCalculation = (entry: Omit<SavedCalculationItem, 'id' | 'timestampLabel'>) => {
    const updated = saveCalculationToHistory(entry);
    setSavedHistory(updated);
  };

  const handleClearHistory = () => {
    clearSavedCalculations();
    setSavedHistory([]);
  };

  const handlePanicWipeAllData = () => {
    wipeAllLocalData();
    setSavedHistory([]);
    setPinnedIds(['loan-emi', 'compound-interest', 'bmi', 'percentage']);
    setCurrency('USD');
    setWipeConfirmedToast(true);
    setTimeout(() => setWipeConfirmedToast(false), 2000);
  };

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
    setSecurityPanelOpen(false);
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
        return <LoanEmiCalculator currency={currency} onSaveCalculation={handleSaveCalculation} />;
      case 'compound-interest':
        return <CompoundInterestCalculator currency={currency} onSaveCalculation={handleSaveCalculation} />;
      case 'sip-retirement':
        return <SipRetirementCalculator currency={currency} onSaveCalculation={handleSaveCalculation} />;
      case 'bmi':
        return <BmiCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'tdee':
        return <TdeeCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'percentage':
        return <PercentageCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'discount-tax':
        return <DiscountTaxCalculator currency={currency} onSaveCalculation={handleSaveCalculation} />;
      case 'age-date':
        return <AgeDateCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'unit-converter':
        return <UnitConverterCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'word-counter':
        return <WordCounterCalculator onSaveCalculation={handleSaveCalculation} />;
    }
  };

  const activeCalculatorMeta =
    route.view === 'calculator'
      ? CALCULATOR_CATALOG.find((c) => c.id === route.id)
      : undefined;

  const activeNavCategory: CalculatorCategory | 'All' =
    route.view === 'calculator' && activeCalculatorMeta
      ? activeCalculatorMeta.category
      : categoryFilter;

  const auditChecks = getSecurityAuditStatus();

  const isEmbedMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('embed') === '1';

  if (isEmbedMode) {
    const calcId =
      route.view === 'calculator'
        ? route.id
        : (new URLSearchParams(window.location.search).get('calc') as CalculatorId) || 'loan-emi';
    return (
      <div className="p-3 sm:p-6 liquid-canvas text-slate-900 dark:text-slate-100 min-h-screen">
        <SeoHeadManager route={{ view: 'calculator', id: calcId }} categoryFilter="All" />
        {renderCalculatorById(calcId)}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col liquid-canvas overflow-x-hidden text-slate-900 dark:text-slate-100 transition-colors">
      <SeoHeadManager route={route} categoryFilter={categoryFilter} />
      <OfflineIndicator />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 liquid-glass-nav">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 h-14">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => navigateHome('All')}
              className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>OmniCalc</span>
            </button>
          </div>

          {/* Zone 2: Category Navigation + Quick Search (Desktop lg+) */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-1 justify-center min-w-0">
            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              {/* All Tools Popover */}
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  aria-expanded={categoryMenuOpen}
                  onClick={() => setCategoryMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>All Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      categoryMenuOpen ? 'rotate-180 text-emerald-500' : ''
                    }`}
                  />
                </button>

                {categoryMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50">
                    {CATEGORIES.map((cat) => {
                      const catTools = CALCULATOR_CATALOG.filter(
                        (c) => c.category === cat.id
                      );
                      return (
                        <div
                          key={cat.id}
                          className="p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
                        >
                          <button
                            type="button"
                            onClick={() => navigateHome(cat.id)}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer block mb-1"
                          >
                            {cat.name}
                          </button>
                          <div className="space-y-1">
                            {catTools.map((tool) => (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => navigateToCalculator(tool.id)}
                                className="block w-full text-left text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-0.5 cursor-pointer truncate"
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

              {(
                [
                  { id: 'Finance' as const, label: 'Money & Loans' },
                  { id: 'Health' as const, label: 'Health' },
                  { id: 'Math' as const, label: 'Math' },
                  { id: 'Text' as const, label: 'Writing' },
                ] as const
              ).map((item) => {
                const isActive = activeNavCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateHome(item.id)}
                    className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-200/80 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold shadow-2xs'
                        : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick Search Bar with ⌘K badge */}
            <div ref={searchRef} className="relative w-44 xl:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search calculators in header"
                value={headerSearch}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setHeaderSearch(sanitizeSingleLineInput(e.target.value, 80));
                  setSearchDropdownOpen(true);
                }}
                placeholder="Search tools..."
                className="w-full rounded-xl liquid-well pl-8 pr-11 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>

              {searchDropdownOpen && headerSearch.trim() !== '' && (
                <div className="absolute right-0 left-0 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl py-1.5 z-50 max-h-72 overflow-y-auto">
                  {headerSearchResults.length > 0 ? (
                    headerSearchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToCalculator(item.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-100/80 dark:hover:bg-slate-800/70 flex items-center justify-between gap-2 cursor-pointer"
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

          {/* Zone 3: Currency Selector, Privacy & Data Popover, PWA Install, Theme Toggle & Mobile/Tablet Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Inline Quick Currency Buttons (XL screens) */}
            <div className="hidden xl:flex items-center gap-0.5 p-0.5 rounded-xl liquid-well">
              {(['USD', 'EUR', 'GBP', 'INR'] as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleCurrencyChange(code)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                    currency === code
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <select
              aria-label="Select Preferred Currency"
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
              className="rounded-xl liquid-well px-2 sm:px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Privacy & Data Popover */}
            <div ref={securityRef} className="relative">
              <button
                type="button"
                onClick={() => setSecurityPanelOpen((prev) => !prev)}
                aria-expanded={securityPanelOpen}
                aria-label="Open Privacy and Security Settings"
                title="Privacy settings & clear local data"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-slate-700 dark:text-slate-200 text-xs font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Privacy</span>
              </button>

              {securityPanelOpen && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/90 p-4 z-50 space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Privacy &amp; On-Device Security
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      100% Local
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {auditChecks.map((check) => (
                      <div key={check.id} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {check.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {check.detail}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handlePanicWipeAllData}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {wipeConfirmedToast ? 'Saved Data Cleared' : 'Clear All Saved Data'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateToLegal('privacy')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Privacy Policy →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <PWAInstallButton />

            <button
              type="button"
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              aria-label="Toggle Mobile Navigation"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl liquid-well text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Drawer (Search + Category Filter + All 10 Calculators + Legal Links) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/70 dark:border-slate-800/70 bg-white/98 dark:bg-slate-900/98 px-4 py-4 space-y-4 shadow-xl">
            {/* Instant Drawer Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search calculators in menu"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(sanitizeSingleLineInput(e.target.value, 80))}
                placeholder="Search any calculator..."
                className="w-full rounded-xl liquid-well pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Quick Filter Row */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'All' as const, label: 'All Tools' },
                  { id: 'Finance' as const, label: 'Money & Loans' },
                  { id: 'Health' as const, label: 'Health' },
                  { id: 'Math' as const, label: 'Math' },
                  { id: 'Text' as const, label: 'Writing' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigateHome(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeNavCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'liquid-well text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 10 Calculators Grid (Filtered by Search if typing) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(headerSearch.trim() ? headerSearchResults : CALCULATOR_CATALOG).map((calc) => {
                const isCurrent = route.view === 'calculator' && route.id === calc.id;
                return (
                  <button
                    key={calc.id}
                    type="button"
                    onClick={() => navigateToCalculator(calc.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">{calc.category}</div>
                    <div className="truncate">{calc.shortTitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Quick Footer Links in Drawer */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToLegal('privacy')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => navigateToLegal('about')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                >
                  About &amp; Sitemap
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => navigateToLegal('contact')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT VIEWPORT */}
      {inspectBlockedAlert && (
        <div
          role="status"
          data-testid="inspect-blocked-toast"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-3 text-xs font-semibold shadow-2xl border border-emerald-500/40"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{inspectBlockedAlert}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {route.view === 'home' && (
          <HomeView
            selectedCategoryFilter={categoryFilter}
            onSelectCategoryFilter={(cat) => navigateHome(cat)}
            onSelectCalculator={navigateToCalculator}
            onSelectLegalPage={navigateToLegal}
            pinnedIds={pinnedIds}
            onTogglePin={handleTogglePin}
            savedHistory={savedHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {route.view === 'calculator' && activeCalculatorMeta && (
          <AdSenseContentStructure
            meta={activeCalculatorMeta}
            onSelectCalculator={navigateToCalculator}
            onNavigateHome={() => navigateHome('All')}
            isPinned={pinnedIds.includes(activeCalculatorMeta.id)}
            onTogglePin={handleTogglePin}
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

      {/* FOOTER WITH FULL 10-CALCULATOR DIRECTORY & LEGAL LINKS */}
      <footer className="border-t border-slate-200/70 dark:border-slate-800/70 liquid-glass mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>OmniCalc</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                Free, easy-to-use calculators for money, health, math, and writing. Every tool runs privately in your browser with clear formulas, step-by-step examples, and offline support.
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Sitemap (/sitemap.xml)
                </a>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  robots.txt
                </a>
              </div>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Money &amp; Health
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('loan-emi')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Loan &amp; Mortgage Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('compound-interest')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Compound Interest Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('sip-retirement')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Retirement &amp; SIP Savings
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('bmi')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      BMI Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('tdee')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Daily Calorie &amp; TDEE Calculator
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Math &amp; Writing
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('percentage')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Percentage Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('discount-tax')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Discount &amp; Sales Tax
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('age-date')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Age &amp; Date Calculator
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('unit-converter')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Unit Converter
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateToCalculator('word-counter')}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      Word &amp; Character Counter
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                About &amp; Legal
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('privacy')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Privacy Policy &amp; Cookies
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('terms')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('disclaimer')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Financial &amp; Health Disclaimer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('about')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    About OmniCalc
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToLegal('contact')}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              © {new Date().getFullYear()} OmniCalc. For general informational and educational use.
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Private · Runs in your browser · No tracking</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
