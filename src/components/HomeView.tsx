import React, { useState } from 'react';
import {
  CALCULATOR_CATALOG,
  CATEGORIES,
  CalculatorCategory,
  CalculatorId,
  LegalPageId,
} from '../data/calculatorCatalog';
import { Search, ArrowRight, Calculator, Flame, FolderOpen, X, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import {
  LoanEmiCalculator,
  CompoundInterestCalculator,
} from './calculators/FinanceCalculators';
import { BmiCalculator } from './calculators/HealthCalculators';
import { PercentageCalculator } from './calculators/MathTextCalculators';

interface HomeViewProps {
  selectedCategoryFilter: CalculatorCategory | 'All';
  onSelectCategoryFilter: (cat: CalculatorCategory | 'All') => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onSelectLegalPage: (page: LegalPageId) => void;
}

type FeaturedTabId = 'loan-emi' | 'percentage' | 'bmi' | 'compound-interest';

export const HomeView: React.FC<HomeViewProps> = ({
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onSelectCalculator,
  onSelectLegalPage,
}) => {
  const [heroSearch, setHeroSearch] = useState<string>('');
  const [activeFeaturedTab, setActiveFeaturedTab] = useState<FeaturedTabId>('loan-emi');

  const popularCalculators = CALCULATOR_CATALOG.filter((c) => c.popular).slice(0, 4);

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

  const featuredTabs: Array<{ id: FeaturedTabId; label: string; icon: string }> = [
    { id: 'loan-emi', label: 'Loan & Mortgage EMI', icon: '💳' },
    { id: 'percentage', label: 'Percentage Calculator', icon: '📊' },
    { id: 'bmi', label: 'BMI Health Calculator', icon: '⚖️' },
    { id: 'compound-interest', label: 'Compound Interest', icon: '📈' },
  ];

  return (
    <div className="space-y-12">
      {/* 1. TOP HERO: QUICK SEARCH & INTRO */}
      <section className="space-y-4 text-center max-w-3xl mx-auto pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Precision Online Calculators
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Fast, transparent, and private calculation tools for finance, health, and everyday math.
        </p>

        {/* Quick Search Box */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search calculators"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search calculators (e.g. Mortgage, BMI, Words, Percentage)..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
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
        </div>
      </section>

      {/* 2. THE ACTUAL CALCULATOR FIRST (FEATURED INTERACTIVE CALCULATOR DECK) */}
      {!heroSearch && selectedCategoryFilter === 'All' && (
        <section aria-label="Featured Live Calculator" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Instant Calculator
              </h2>
            </div>

            {/* Quick Switcher Tabs */}
            <div
              role="tablist"
              className="inline-flex flex-wrap items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              {featuredTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFeaturedTab === tab.id}
                  onClick={() => setActiveFeaturedTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeFeaturedTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Calculator Container */}
          <div className="rounded-xl">
            {activeFeaturedTab === 'loan-emi' && <LoanEmiCalculator />}
            {activeFeaturedTab === 'percentage' && <PercentageCalculator />}
            {activeFeaturedTab === 'bmi' && <BmiCalculator />}
            {activeFeaturedTab === 'compound-interest' && <CompoundInterestCalculator />}
          </div>

          {/* Direct link to full guide */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => onSelectCalculator(activeFeaturedTab)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>View Full Step-by-Step Formula &amp; Detailed Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 3. IF SEARCHING OR FILTERING: SHOW LIVE RESULTS */}
      {(heroSearch.trim() !== '' || selectedCategoryFilter !== 'All') && (
        <section aria-labelledby="search-results-heading" className="space-y-5">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchFilteredCalculators.map((calc) => (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => onSelectCalculator(calc.id)}
                  className="group text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span>{calc.category}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>Formula &amp; Example</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between gap-2">
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
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
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
        </section>
      )}

      {/* 4. POPULAR TOOLS */}
      <section aria-labelledby="popular-tools-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 id="popular-tools-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Popular Calculators
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Most Used Utilities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularCalculators.map((calc, index) => (
            <button
              key={calc.id}
              type="button"
              onClick={() => onSelectCalculator(calc.id)}
              className="group text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>0{index + 1} </span>
                  <span aria-hidden="true" className="mx-1">·</span>
                  <span>{calc.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {calc.shortTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {calc.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. ALL CATEGORIES DIRECTORY */}
      <section aria-labelledby="categories-heading" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 id="categories-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              All Calculator Categories
            </h2>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div
            role="group"
            aria-label="Filter by calculator category"
            className="inline-flex flex-wrap items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            {(['All', 'Finance', 'Health', 'Math', 'Text'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-5"
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

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-2">
                  {toolsInCategory.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
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
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. TRUST & ACCURACY STANDARDS */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">100% Private Calculations</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All math executes locally in your browser. No financial amounts or health metrics are ever stored or transmitted.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verified Mathematical Formulas</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculators are benchmarked against official banking amortization schedules and clinical health standards.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Completely Free Forever</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Instant access with no subscriptions, sign-ups, or paywalls required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
