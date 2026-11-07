import React, { useState } from 'react';
import { AdSenseBanner } from './AdSenseBanner';
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
    <div className="space-y-10">
      {/* PINNED TOOLS & SAVED RESULTS */}
      <section
        aria-label="Pinned Calculators and Saved Results"
        className="liquid-glass rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Pinned Calculators (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
                <span>Pinned Calculators</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {pinnedCalculators.length} Pinned
              </span>
            </div>

            {pinnedCalculators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pinnedCalculators.map((calc) => (
                  <div
                    key={calc.id}
                    className="liquid-well rounded-xl p-3 flex items-center justify-between gap-2 group hover:border-emerald-500/60 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectCalculator(calc.id)}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        {calc.category}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {calc.shortTitle}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={`Unpin ${calc.shortTitle}`}
                      onClick={() => onTogglePin(calc.id)}
                      className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="liquid-well rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400">
                Pin any calculator with the bookmark button to keep your favorite tools right at the top of the page.
              </div>
            )}
          </div>

          {/* Saved Results (Right 6 Cols) */}
          <div className="lg:col-span-6 space-y-3 lg:border-l lg:border-slate-200/70 dark:lg:border-slate-800/70 lg:pl-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Saved Results (Stored on Your Device)</span>
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
              <div
                data-testid="saved-history-list"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {savedHistory.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectCalculator(item.calculatorId as CalculatorId)}
                    className="liquid-well rounded-xl p-3 text-left hover:border-emerald-500/60 transition-colors cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate font-medium">{item.calculatorTitle}</span>
                      <span className="font-mono shrink-0">{item.timestampLabel}</span>
                    </div>
                    <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                      {item.primaryResult}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                      {item.detailSummary}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="liquid-well rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-3">
                <span>
                  Click <strong>Save Result</strong> or <strong>Save</strong> inside any calculator to keep your numbers here for your next visit.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HERO BANNER WITH CLEAN APPLE MINIMALIST TYPOGRAPHY & QUICK SEARCH */}
      <section className="liquid-glass rounded-3xl px-6 py-10 sm:px-12 sm:py-12">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 tracking-wide">
            10 Free Calculators · Works Offline · Private &amp; Fast
          </div>

          <h1
            style={{ textWrap: 'balance' }}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
          >
            Simple, Accurate Calculators for Money, Health, Math &amp; Writing
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Every calculator runs right in your browser with instant results, clear formulas, step-by-step examples, and zero tracking.
          </p>

          {/* Hero Quick Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Quick search calculators"
                value={heroSearch}
                onChange={(e) => setHeroSearch(sanitizeSingleLineInput(e.target.value, 100))}
                placeholder="Search calculators (mortgage, compound interest, BMI, calories, percentage)..."
                className="w-full rounded-2xl liquid-well pl-12 pr-10 py-3.5 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
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

            {/* Quick Suggestion Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3">
              <span>Popular:</span>
              {popularCalculators.map((calc, idx) => (
                <React.Fragment key={calc.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCalculator(calc.id)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    {calc.shortTitle}
                  </button>
                  {idx < popularCalculators.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IF USER IS SEARCHING OR FILTERING: SHOW LIVE MATCHING RESULTS */}
      {(heroSearch.trim() !== '' || selectedCategoryFilter !== 'All') && (
        <section aria-labelledby="search-results-heading" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Show All Calculators
            </button>
          </div>

          {searchFilteredCalculators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchFilteredCalculators.map((calc) => (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => onSelectCalculator(calc.id)}
                  className="group text-left liquid-glass rounded-2xl p-5 hover:border-emerald-500/60 transition-colors cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>{calc.category}</span>
                      <span aria-hidden="true" className="mx-1.5"> · </span>
                      <span>Includes Formula &amp; Examples</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between gap-2">
                      <span>{calc.title}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {calc.summary}
                    </p>
                  </div>
                </button>
              ))}
            </div>
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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Show All Calculators
              </button>
            </div>
          )}
        </section>
      )}

      {/* MOST POPULAR CALCULATORS (TOP 4) */}
      <section aria-labelledby="popular-tools-heading" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 id="popular-tools-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Most Popular Calculators
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Top 4 Everyday Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularCalculators.map((calc, index) => {
            const isPinned = pinnedIds.includes(calc.id);
            return (
              <div
                key={calc.id}
                className="liquid-glass rounded-2xl p-5 flex flex-col justify-between gap-4 group hover:border-emerald-500/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0{index + 1}</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>{calc.category}</span>
                    </div>
                    <button
                      type="button"
                      aria-label={isPinned ? `Unpin ${calc.shortTitle}` : `Pin ${calc.shortTitle}`}
                      onClick={() => onTogglePin(calc.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isPinned
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCalculator(calc.id)}
                    className="text-left block w-full space-y-1.5 cursor-pointer"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {calc.shortTitle}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {calc.summary}
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCalculator(calc.id)}
                  className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 cursor-pointer"
                >
                  <span>Open Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* AD PLACEMENT BANNER CONTAINER (MID-PAGE HIGH VIEWABILITY) */}
      <AdSenseBanner className="my-2" label="Homepage Mid Directory Ad" />

      {/* BROWSE CALCULATORS BY TOPIC */}
      <section aria-labelledby="categories-heading" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 id="categories-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Browse Calculators by Topic
            </h2>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div
            role="group"
            aria-label="Filter by calculator category"
            className="inline-flex flex-wrap items-center gap-1 liquid-well p-1 rounded-xl"
          >
            {(['All', 'Finance', 'Health', 'Math', 'Text'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((category) => {
            const toolsInCategory = CALCULATOR_CATALOG.filter(
              (c) => c.category === category.id
            );
            return (
              <div
                key={category.id}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {toolsInCategory.length} {toolsInCategory.length === 1 ? 'Calculator' : 'Calculators'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>

                {/* Links to individual calculators */}
                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60 border-t border-slate-200/70 dark:border-slate-800/70 pt-2">
                  {toolsInCategory.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => onSelectCalculator(tool.id)}
                      className="w-full py-3 flex items-center justify-between gap-4 text-left group cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {tool.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {tool.summary}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LOWER HOMEPAGE AD BANNER */}
      <AdSenseBanner className="my-2" label="Homepage Directory Bottom Ad" />

      {/* PRIVACY & DISTRACTION-FREE PROMISE */}
      <section className="liquid-glass rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2>Private by Design &amp; Distraction-Free</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every calculation happens on your own device—your financial numbers, health metrics, and text never leave your browser. Fast, accurate, and 100% free online calculators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectLegalPage('privacy')}
            className="px-3.5 py-2 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onSelectLegalPage('disclaimer')}
            className="px-3.5 py-2 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Disclaimer
          </button>
          <button
            type="button"
            onClick={() => onSelectLegalPage('contact')}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};
