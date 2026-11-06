/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
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
import {
  SavedCalculationItem,
  loadSavedCalculations,
  saveCalculationToHistory,
  clearSavedCalculations,
  loadPinnedFavorites,
  savePinnedFavorites,
  sanitizeSingleLineInput,
} from './utils/security';
import { Search, Sun, Moon, ChevronDown, Menu, X, Lock } from 'lucide-react';

type ActiveRoute =
  | { view: 'home' }
  | { view: 'calculator'; id: CalculatorId }
  | { view: 'legal'; page: LegalPageId };

const navListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.06,
    },
  },
};

const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -10, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 28,
    },
  },
};

const dropdownMenuVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 30,
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.97,
    filter: 'blur(4px)',
    transition: { duration: 0.14, ease: [0.32, 0.72, 0, 1] },
  },
};

const dropdownItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 360, damping: 28 },
  },
};

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

  // Retention features: Pinned Quick-Launch Dock & On-Device Saved Calculations
  const [pinnedIds, setPinnedIds] = useState<CalculatorId[]>(
    () => loadPinnedFavorites() as CalculatorId[]
  );
  const [savedHistory, setSavedHistory] = useState<SavedCalculationItem[]>(() =>
    loadSavedCalculations()
  );

  // Header Category Dropdown & Search Bar states
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [headerSearch, setHeaderSearch] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        return <LoanEmiCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'compound-interest':
        return <CompoundInterestCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'bmi':
        return <BmiCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'tdee':
        return <TdeeCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'percentage':
        return <PercentageCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'discount-tax':
        return <DiscountTaxCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'age-date':
        return <AgeDateCalculator onSaveCalculation={handleSaveCalculation} />;
      case 'word-counter':
        return <WordCounterCalculator onSaveCalculation={handleSaveCalculation} />;
    }
  };

  const activeCalculatorMeta =
    route.view === 'calculator'
      ? CALCULATOR_CATALOG.find((c) => c.id === route.id)
      : undefined;

  const activeNavCategory: CalculatorCategory | null =
    route.view === 'calculator' && activeCalculatorMeta
      ? activeCalculatorMeta.category
      : route.view === 'home' && categoryFilter !== 'All'
      ? categoryFilter
      : null;

  const headerCategories: CalculatorCategory[] = ['Finance', 'Health', 'Math', 'Text'];

  return (
    <div className="min-h-screen flex flex-col liquid-canvas text-slate-900 dark:text-slate-100 transition-colors">
      <SeoHeadManager route={route} categoryFilter={categoryFilter} />

      {/* TOP NAVIGATION HEADER (LIQUID GLASS WITH APPLE-LIKE SPRING ENTRANCE) */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="sticky top-0 z-30 liquid-glass-nav"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateHome('All')}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            OmniCalc
          </motion.button>

          {/* Zone 2: Category Dropdown & Direct Category Links + Quick Search Bar */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl justify-center">
            <motion.nav
              aria-label="Main Navigation"
              variants={navListVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              {/* Category Dropdown */}
              <motion.div ref={dropdownRef} variants={navItemVariants} className="relative">
                <motion.button
                  type="button"
                  aria-expanded={categoryMenuOpen}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCategoryMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      categoryMenuOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {categoryMenuOpen && (
                    <motion.div
                      variants={dropdownMenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute left-0 mt-2 w-72 rounded-2xl liquid-glass p-2 z-40 origin-top-left"
                    >
                      {CATEGORIES.map((cat) => {
                        const catTools = CALCULATOR_CATALOG.filter(
                          (c) => c.category === cat.id
                        );
                        return (
                          <motion.div
                            key={cat.id}
                            variants={dropdownItemVariants}
                            className="p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
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
                                <motion.button
                                  key={tool.id}
                                  type="button"
                                  whileHover={{ x: 3 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                  onClick={() => navigateToCalculator(tool.id)}
                                  className="block w-full text-left text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-0.5 cursor-pointer truncate"
                                >
                                  {tool.shortTitle}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {headerCategories.map((cat) => {
                const isActive = activeNavCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    variants={navItemVariants}
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigateHome(cat)}
                    className={`relative px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="headerNavActivePill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-500/20 dark:border-indigo-400/25 -z-10"
                      />
                    )}
                    <span>{cat}</span>
                  </motion.button>
                );
              })}
            </motion.nav>

            {/* Header Search Bar with ⌘K support */}
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.22 }}
              className="relative flex-1 max-w-xs"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                placeholder="Find tool (⌘K)..."
                className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
              />

              <AnimatePresence>
                {searchDropdownOpen && headerSearch.trim() !== '' && (
                  <motion.div
                    variants={dropdownMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 left-0 mt-2 rounded-2xl liquid-glass py-1.5 z-40 max-h-72 overflow-y-auto origin-top"
                  >
                    {headerSearchResults.length > 0 ? (
                      headerSearchResults.map((item) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          variants={dropdownItemVariants}
                          whileHover={{ x: 3 }}
                          onClick={() => navigateToCalculator(item.id)}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.shortTitle}
                          </span>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {item.category}
                          </span>
                        </motion.button>
                      ))
                    ) : (
                      <div className="px-3.5 py-2 text-xs text-slate-500">
                        No matching tools found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Zone 3: Dark/Light Mode Toggle & Mobile Menu Trigger */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.18 }}
            className="flex items-center gap-2 shrink-0"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-800/75 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-label="Toggle Mobile Navigation"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Drawer with AnimatePresence */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/95 px-4 py-4 space-y-4 overflow-hidden"
            >
              <motion.div
                variants={navListVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2"
              >
                {CALCULATOR_CATALOG.map((calc) => (
                  <motion.button
                    key={calc.id}
                    type="button"
                    variants={navItemVariants}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigateToCalculator(calc.id)}
                    className="text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 cursor-pointer"
                  >
                    <div className="text-[10px] text-slate-400">{calc.category}</div>
                    <div className="truncate">{calc.shortTitle}</div>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AnimatePresence mode="wait">
          {route.view === 'home' && (
            <motion.div
              key={`home-${categoryFilter}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
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
            </motion.div>
          )}

          {route.view === 'calculator' && activeCalculatorMeta && (
            <motion.div
              key={`calc-${activeCalculatorMeta.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <AdSenseContentStructure
                meta={activeCalculatorMeta}
                onSelectCalculator={navigateToCalculator}
                onNavigateHome={() => navigateHome('All')}
                isPinned={pinnedIds.includes(activeCalculatorMeta.id)}
                onTogglePin={handleTogglePin}
              >
                {renderCalculatorById(activeCalculatorMeta.id)}
              </AdSenseContentStructure>
            </motion.div>
          )}

          {route.view === 'legal' && (
            <motion.div
              key={`legal-${route.page}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <LegalCompliancePages
                activePage={route.page}
                onSelectLegalPage={navigateToLegal}
                onSelectCalculator={navigateToCalculator}
                onNavigateHome={(cat) => navigateHome(cat ?? 'All')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER WITH FULL CALCULATOR DIRECTORY & ADSENSE COMPLIANCE LINKS */}
      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="border-t border-slate-200/70 dark:border-slate-800/70 liquid-glass mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-3">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                OmniCalc
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                Precision online calculators for Finance, Health, Everyday Math, and Text analysis. All tools execute 100% locally in your browser with transparent formulas and step-by-step worked examples.
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
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('loan-emi')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Loan EMI &amp; Mortgage
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('compound-interest')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Compound Interest
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('bmi')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      BMI Health Gauge
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('tdee')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      TDEE &amp; Calorie Deficit
                    </motion.button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Math &amp; Text Utilities
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('percentage')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      3-in-1 Percentage
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('discount-tax')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Discount &amp; Sales Tax
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('age-date')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Age &amp; Date Difference
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      onClick={() => navigateToCalculator('word-counter')}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Word &amp; Reading Counter
                    </motion.button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Legal &amp; AdSense Compliance
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    onClick={() => navigateToLegal('privacy')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Privacy Policy &amp; Cookies
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    onClick={() => navigateToLegal('terms')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Terms of Service
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    onClick={() => navigateToLegal('disclaimer')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Financial &amp; Health Disclaimer
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    onClick={() => navigateToLegal('about')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    About, Security &amp; SEO Sitemap
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    onClick={() => navigateToLegal('contact')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Contact Us
                  </motion.button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              © {new Date().getFullYear()} OmniCalc Portal. Built for informational &amp; educational reference.
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Client-Side Encrypted Execution · Zero Data Tracking</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
