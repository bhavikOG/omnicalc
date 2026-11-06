import React, { useState } from 'react';
import { motion, Variants } from 'motion/react';
import {
  CALCULATOR_CATALOG,
  CATEGORIES,
  CalculatorCategory,
  CalculatorId,
  LegalPageId,
} from '../data/calculatorCatalog';
import { SavedCalculationItem, sanitizeSingleLineInput } from '../utils/security';
import {
  Search,
  ArrowRight,
  Calculator,
  Flame,
  FolderOpen,
  X,
  Bookmark,
  History,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

interface HomeViewProps {
  selectedCategoryFilter: CalculatorCategory | 'All';
  onSelectCategoryFilter: (cat: CalculatorCategory | 'All') => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onSelectLegalPage: (page: LegalPageId) => void;
  pinnedIds: CalculatorId[];
  onTogglePin: (id: CalculatorId) => void;
  savedHistory: SavedCalculationItem[];
  onClearHistory: () => void;
}

const pageOrchestratorVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.03,
    },
  },
};

const sectionCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.985, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 28,
      mass: 0.85,
    },
  },
};

const cardGridStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

const contentCardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 26,
      mass: 0.8,
    },
  },
};

const navPillListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
};

const navLinkItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 28,
    },
  },
};

export const HomeView: React.FC<HomeViewProps> = ({
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onSelectCalculator,
  onSelectLegalPage,
  pinnedIds,
  onTogglePin,
  savedHistory,
  onClearHistory,
}) => {
  const [heroSearch, setHeroSearch] = useState<string>('');

  const popularCalculators = CALCULATOR_CATALOG.filter((c) => c.popular).slice(0, 4);
  const pinnedCalculators = CALCULATOR_CATALOG.filter((c) => pinnedIds.includes(c.id));

  const searchFilteredCalculators = CALCULATOR_CATALOG.filter((calc) => {
    const matchesCategory =
      selectedCategoryFilter === 'All' || calc.category === selectedCategoryFilter;
    if (!matchesCategory) return false;
    if (!heroSearch.trim()) return true;
    const q = heroSearch.toLowerCase();
    return (
      calc.title.toLowerCase().includes(q) ||
      calc.shortTitle.toLowerCase().includes(q) ||
      calc.category.toLowerCase().includes(q) ||
      calc.summary.toLowerCase().includes(q) ||
      calc.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div
      variants={pageOrchestratorVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* IMPORTANT INFORMATION FIRST: PERSONAL WORKSPACE DOCK & SAVED CALCULATIONS */}
      <motion.section
        variants={sectionCardVariants}
        aria-label="Personal Quick-Launch Dock and Saved Calculations"
        className="liquid-glass rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Pinned Dock (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-current" />
                <span>Pinned Quick-Launch Dock</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {pinnedCalculators.length} Pinned
              </span>
            </div>

            {pinnedCalculators.length > 0 ? (
              <motion.div
                variants={cardGridStaggerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {pinnedCalculators.map((calc) => (
                  <motion.div
                    key={calc.id}
                    variants={contentCardVariants}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    className="liquid-well rounded-xl p-3 flex items-center justify-between gap-2 group hover:border-indigo-500/60 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectCalculator(calc.id)}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {calc.category}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {calc.shortTitle}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={`Unpin ${calc.shortTitle}`}
                      onClick={() => onTogglePin(calc.id)}
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="liquid-well rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400">
                Pin any calculator using the bookmark icon to keep your most-used tools right at the top of your workspace.
              </div>
            )}
          </div>

          {/* Saved Calculation History (Right 6 Cols) */}
          <div className="lg:col-span-6 space-y-3 lg:border-l lg:border-slate-200/70 dark:lg:border-slate-800/70 lg:pl-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Recent Saved Calculations (On-Device Only)</span>
              </div>
              {savedHistory.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {savedHistory.length > 0 ? (
              <motion.div
                variants={cardGridStaggerVariants}
                data-testid="saved-history-list"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {savedHistory.slice(0, 4).map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    variants={contentCardVariants}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onSelectCalculator(item.calculatorId as CalculatorId)}
                    className="liquid-well rounded-xl p-3 text-left hover:border-indigo-500/60 transition-colors cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate font-medium">{item.calculatorTitle}</span>
                      <span className="font-mono shrink-0">{item.timestampLabel}</span>
                    </div>
                    <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums truncate">
                      {item.primaryResult}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                      {item.detailSummary}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <div className="liquid-well rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-3">
                <span>
                  Click <strong>Save Scenario</strong> inside any calculator to bookmark mortgage, investment, BMI, or calorie targets here for your next visit.
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* HERO BANNER WITH QUICK SPOTLIGHT SEARCH */}
      <motion.section
        variants={sectionCardVariants}
        className="liquid-glass rounded-3xl px-6 py-10 sm:px-12 sm:py-12"
      >
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <motion.div
            variants={navLinkItemVariants}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400"
          >
            8 Precision Utilities · 100% Client-Side Encrypted Execution · Focus-First Workspace
          </motion.div>

          <motion.h1
            variants={navLinkItemVariants}
            style={{ textWrap: 'balance' }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Fast, Transparent Calculators for Finance, Health, Math &amp; Text
          </motion.h1>

          <motion.p
            variants={navLinkItemVariants}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Every calculator runs instantaneously in your browser with zero server tracking, Focus Shield ad protection during active work, complete mathematical formulas, and step-by-step worked examples.
          </motion.p>

          {/* Hero Quick Search Box */}
          <motion.div variants={navLinkItemVariants} className="max-w-2xl mx-auto pt-2">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Quick search calculators"
                value={heroSearch}
                onChange={(e) => setHeroSearch(sanitizeSingleLineInput(e.target.value, 100))}
                placeholder="Search by name or topic (Mortgage EMI, BMI, Compound Interest, Words)..."
                className="w-full rounded-2xl border border-slate-300/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/85 pl-12 pr-10 py-3.5 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs transition-shadow"
              />
              {heroSearch && (
                <button
                  type="button"
                  aria-label="Clear search query"
                  onClick={() => setHeroSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Navigation Links with Staggered Entrance */}
            <motion.div
              variants={navPillListVariants}
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3"
            >
              <span>Quick Jump:</span>
              {popularCalculators.map((calc, idx) => (
                <React.Fragment key={calc.id}>
                  <motion.button
                    type="button"
                    variants={navLinkItemVariants}
                    whileHover={{ y: -1.5, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSelectCalculator(calc.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    {calc.shortTitle}
                  </motion.button>
                  {idx < popularCalculators.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* IF USER IS SEARCHING OR FILTERING: SHOW LIVE MATCHING RESULTS */}
      {(heroSearch.trim() !== '' || selectedCategoryFilter !== 'All') && (
        <motion.section
          variants={sectionCardVariants}
          aria-labelledby="search-results-heading"
          className="space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 id="search-results-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                {heroSearch.trim()
                  ? `Search Results for "${heroSearch}" (${searchFilteredCalculators.length})`
                  : `${selectedCategoryFilter} Calculators (${searchFilteredCalculators.length})`}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setHeroSearch('');
                onSelectCategoryFilter('All');
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Show All Categories
            </button>
          </div>

          {searchFilteredCalculators.length > 0 ? (
            <motion.div
              variants={cardGridStaggerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {searchFilteredCalculators.map((calc) => (
                <motion.button
                  key={calc.id}
                  type="button"
                  variants={contentCardVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onSelectCalculator(calc.id)}
                  className="group text-left liquid-glass rounded-2xl p-5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span>{calc.category}</span>
                      <span aria-hidden="true" className="mx-1.5"> · </span>
                      <span>Formula &amp; Step-by-Step Guide</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between gap-2">
                      <span>{calc.title}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 opacity-60 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {calc.summary}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="liquid-glass rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No calculators matched &ldquo;{heroSearch}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHeroSearch('');
                  onSelectCategoryFilter('All');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Reset Search Filter
              </button>
            </div>
          )}
        </motion.section>
      )}

      {/* POPULAR TOOLS SECTION (DISPLAYING TOP 4 CALCULATORS WITH STAGGERED ENTRANCE) */}
      <motion.section
        variants={sectionCardVariants}
        aria-labelledby="popular-tools-heading"
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 id="popular-tools-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Popular Tools
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Top 4 Most-Used Utilities
          </span>
        </div>

        <motion.div
          variants={cardGridStaggerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {popularCalculators.map((calc, index) => {
            const isPinned = pinnedIds.includes(calc.id);
            return (
              <motion.div
                key={calc.id}
                variants={contentCardVariants}
                whileHover={{ y: -5, scale: 1.012 }}
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                className="liquid-glass rounded-2xl p-5 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="font-mono">0{index + 1}</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>{calc.category}</span>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      aria-label={isPinned ? `Unpin ${calc.shortTitle}` : `Pin ${calc.shortTitle}`}
                      onClick={() => onTogglePin(calc.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isPinned
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                    </motion.button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCalculator(calc.id)}
                    className="text-left block w-full space-y-1.5 cursor-pointer"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {calc.shortTitle}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {calc.summary}
                    </p>
                  </button>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ x: 2 }}
                  onClick={() => onSelectCalculator(calc.id)}
                  className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 cursor-pointer"
                >
                  <span>Launch Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* GRID OF CATEGORY CARDS LINKING TO INDIVIDUAL CALCULATORS */}
      <motion.section
        variants={sectionCardVariants}
        aria-labelledby="categories-heading"
        className="space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 id="categories-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Browse Calculators by Category
            </h2>
          </div>

          {/* Interactive Category Filter Tabs with Sliding Active Pill */}
          <motion.div
            role="group"
            aria-label="Filter by calculator category"
            variants={navPillListVariants}
            className="inline-flex flex-wrap items-center gap-1 liquid-well p-1 rounded-xl"
          >
            {(['All', 'Finance', 'Health', 'Math', 'Text'] as const).map((cat) => {
              const isSelected = selectedCategoryFilter === cat;
              return (
                <motion.button
                  key={cat}
                  type="button"
                  variants={navLinkItemVariants}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectCategoryFilter(cat)}
                  className={`relative px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap z-10 ${
                    isSelected
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="homeCategoryTabIndicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-white dark:bg-slate-800 shadow-xs -z-10"
                    />
                  )}
                  <span>{cat}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          variants={cardGridStaggerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {CATEGORIES.map((category) => {
            const toolsInCategory = CALCULATOR_CATALOG.filter(
              (c) => c.category === category.id
            );
            return (
              <motion.div
                key={category.id}
                variants={contentCardVariants}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {toolsInCategory.length} {toolsInCategory.length === 1 ? 'Tool' : 'Tools'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>

                {/* Staggered Links to individual calculators */}
                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60 border-t border-slate-200/70 dark:border-slate-800/70 pt-2">
                  {toolsInCategory.map((tool) => (
                    <motion.button
                      key={tool.id}
                      type="button"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      onClick={() => onSelectCalculator(tool.id)}
                      className="w-full py-3 flex items-center justify-between gap-4 text-left group cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {tool.summary}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* SECURITY, PRIVACY & ADSENSE COMPLIANCE SUMMARY */}
      <motion.section
        variants={sectionCardVariants}
        className="liquid-glass rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2>Hardened Client-Side Security &amp; Focus-Aware Monetization</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every tool on OmniCalc executes 100% locally inside your browser with zero backend telemetry, automatic Focus Shield protection that pauses ads while you calculate, and complete mathematical formulas and worked examples.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -1.5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectLegalPage('privacy')}
            className="px-3.5 py-2 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Privacy &amp; Cookies
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -1.5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectLegalPage('disclaimer')}
            className="px-3.5 py-2 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Disclaimer
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -1.5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectLegalPage('contact')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Contact Us
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  );
};
