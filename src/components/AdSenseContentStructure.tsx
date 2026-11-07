import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Bookmark,
  EyeOff,
  Eye,
  Code2,
  Check,
  Copy,
  Landmark,
  TrendingUp,
  Flame,
  HeartPulse,
  Activity,
  Percent,
  Tag,
  Calendar,
  ArrowLeftRight,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import { CalculatorMeta, CALCULATOR_CATALOG, CalculatorId } from '../data/calculatorCatalog';

interface AdSenseContentStructureProps {
  meta: CalculatorMeta;
  isPinned: boolean;
  onTogglePin: (id: CalculatorId) => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

const DOCK_ITEMS: Array<{
  id: CalculatorId;
  dockLabel: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'loan-emi', dockLabel: 'Loan & EMI', icon: Landmark },
  { id: 'sip-retirement', dockLabel: 'Retirement', icon: TrendingUp },
  { id: 'compound-interest', dockLabel: 'Compound', icon: Flame },
  { id: 'bmi', dockLabel: 'BMI', icon: HeartPulse },
  { id: 'tdee', dockLabel: 'Calories', icon: Activity },
  { id: 'percentage', dockLabel: 'Percentage', icon: Percent },
  { id: 'unit-converter', dockLabel: 'Units', icon: ArrowLeftRight },
  { id: 'discount-tax', dockLabel: 'Discounts', icon: Tag },
  { id: 'age-date', dockLabel: 'Age & Date', icon: Calendar },
  { id: 'word-counter', dockLabel: 'Word Count', icon: FileText },
];

export const AdSenseContentStructure: React.FC<AdSenseContentStructureProps> = ({
  meta,
  isPinned,
  onTogglePin,
  onSelectCalculator,
  onNavigateHome,
  children,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  // Smart Focus-Aware Ad Shield: pauses/minimizes ads automatically while actively typing/adjusting inputs
  const [focusShieldManual, setFocusShieldManual] = useState<boolean>(false);
  const [isActivelyCalculating, setIsActivelyCalculating] = useState<boolean>(false);
  const [showEmbedGenerator, setShowEmbedGenerator] = useState<boolean>(false);
  const [embedCopied, setEmbedCopied] = useState<boolean>(false);
  const [formulaCopied, setFormulaCopied] = useState<boolean>(false);
  const activityTimeoutRef = useRef<number | null>(null);

  const embedCodeSnippet = `<iframe src="https://omnicalc.me/?calc=${meta.id}&embed=1" width="100%" height="580" style="border:0;border-radius:16px;overflow:hidden;" sandbox="allow-scripts" referrerpolicy="no-referrer" loading="lazy" title="OmniCalc — ${meta.title}"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard?.writeText(embedCodeSnippet);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 1800);
  };

  const handleCopyFormula = () => {
    navigator.clipboard?.writeText(meta.formulaExpression);
    setFormulaCopied(true);
    setTimeout(() => setFormulaCopied(false), 1800);
  };

  const triggerActiveCalculationFocus = () => {
    setIsActivelyCalculating(true);
    if (activityTimeoutRef.current) {
      window.clearTimeout(activityTimeoutRef.current);
    }
    activityTimeoutRef.current = window.setTimeout(() => {
      setIsActivelyCalculating(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) {
        window.clearTimeout(activityTimeoutRef.current);
      }
    };
  }, []);

  const adsMinimizedForWork = focusShieldManual || isActivelyCalculating;

  const relatedCalculators = CALCULATOR_CATALOG.filter(
    (c) => c.id !== meta.id && (c.category === meta.category || c.popular)
  ).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. SUB-HEADER BREADCRUMB & QUICK ACTIONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl liquid-glass">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
        >
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            <span>All Calculators</span>
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
          <span>{meta.category}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            {meta.shortTitle}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mr-2">
            <span>100% Private</span>
            <span aria-hidden="true">·</span>
            <span>Runs in your browser</span>
          </div>

          <button
            type="button"
            onClick={() => onTogglePin(meta.id)}
            aria-pressed={isPinned}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isPinned
                ? 'bg-emerald-600 text-white'
                : 'liquid-well text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
            <span>{isPinned ? 'Pinned' : 'Pin Tool'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmbedGenerator((prev) => !prev)}
            aria-expanded={showEmbedGenerator}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              showEmbedGenerator
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'liquid-well text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Embed</span>
          </button>

          <button
            type="button"
            onClick={() => setFocusShieldManual((prev) => !prev)}
            aria-pressed={focusShieldManual}
            title="Hides ads while you are working on your numbers"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              adsMinimizedForWork
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'liquid-well text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {adsMinimizedForWork ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ads Paused</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Focus Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embed Widget Code Drawer */}
      {showEmbedGenerator && (
        <div className="liquid-glass rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Embed {meta.shortTitle} on Your Website
            </div>
            <button
              type="button"
              onClick={handleCopyEmbed}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              {embedCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{embedCopied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="liquid-well rounded-xl p-3 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
            <code>{embedCodeSnippet}</code>
          </pre>
        </div>
      )}

      {/* 2. CENTERED APPLE-STYLE FLOATING TOOL DOCK (5x2 on Mobile, Centered Bar on Tablet/Desktop) */}
      <div className="flex flex-col items-center space-y-3">
        <div
          role="navigation"
          aria-label="Quick Calculator Switcher Dock"
          className="grid grid-cols-5 sm:inline-flex sm:flex-wrap sm:justify-center gap-1 p-1.5 rounded-2xl liquid-glass w-full sm:w-auto"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === meta.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCalculator(item.id)}
                className={`relative flex flex-col items-center justify-center sm:min-w-[66px] lg:min-w-[72px] px-1 sm:px-2.5 lg:px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'liquid-well text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 mb-1 shrink-0" />
                <span className="text-[10px] sm:text-[11px] tracking-tight truncate max-w-full">
                  {item.dockLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Title & Subtitle */}
        <div className="text-center max-w-2xl px-2">
          <h1
            style={{ textWrap: 'balance' }}
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {meta.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {meta.summary}
          </p>
        </div>
      </div>

      {/* 3. TOP SECTION: Interactive Calculator (Important Information First — Zero Ads Above/Inside) */}
      <section
        aria-label={`${meta.title} Interactive Tool`}
        onInputCapture={triggerActiveCalculationFocus}
        onChangeCapture={triggerActiveCalculationFocus}
      >
        {children}
      </section>

      {/* 4. MIDDLE SECTION: Non-Intrusive Google AdSense Space (Paused Automatically During Active Work) */}
      <aside
        aria-label="Advertisement Placement Container"
        data-testid="ad-placement-container"
        className={`w-full rounded-2xl transition-colors duration-200 ${
          adsMinimizedForWork
            ? 'liquid-well px-5 py-2.5 opacity-60'
            : 'liquid-glass px-6 py-4'
        }`}
      >
        {adsMinimizedForWork ? (
          <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Focus Mode is on — ads are paused while you use the calculator
            </span>
            {focusShieldManual && (
              <button
                type="button"
                onClick={() => setFocusShieldManual(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer whitespace-nowrap"
              >
                Show Ad Space
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 min-h-[72px]">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span>Sponsored · Google AdSense</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setFocusShieldManual(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Hide while working
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reserved space for a responsive 728×90 display ad—placed below the calculator so it never gets in your way.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
              Ad Space (728×90)
            </div>
          </div>
        )}
      </aside>

      {/* 5. BOTTOM SECTION: How the Formula Works, Step-by-Step Example & FAQs */}
      <div className="space-y-6 pt-1">
        <section
          aria-labelledby="formula-heading"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800/80 pb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl font-serif-formula font-bold text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                Σ
              </span>
              <div>
                <h2
                  id="formula-heading"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                >
                  How It Works — {meta.formulaTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  The standard math formula behind this calculator and what each part means
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFormula}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-well text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                {formulaCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{formulaCopied ? 'Copied Formula' : 'Copy Formula'}</span>
              </button>
            </div>
          </div>

          {/* 2-Column Formula Grid (Left: Formula Display | Right: Variable Meanings) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 5 Columns: Formula Box */}
            <div className="lg:col-span-5 liquid-well rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Formula
              </div>
              <div className="w-full py-3 px-3 overflow-x-auto">
                <code className="text-base sm:text-lg font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {meta.formulaExpression}
                </code>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Calculated instantly in your browser
              </div>
            </div>

            {/* Right 7 Columns: Variable Parameter Rows */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-2.5">
              {meta.formulaVariables.map((v) => (
                <div
                  key={v.symbol}
                  className="liquid-well rounded-xl px-4 py-3 flex items-center gap-3.5"
                >
                  <span className="inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold shrink-0">
                    {v.symbol}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {v.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            {meta.formulaExplanation}
          </p>
        </section>

        {/* 2. Step-by-Step Example */}
        <section
          aria-labelledby="example-heading"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 id="example-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {meta.exampleTitle}
            </h2>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            {meta.exampleScenario}
          </p>

          <ol className="space-y-2.5">
            {meta.exampleSteps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 liquid-well rounded-md px-2 py-0.5 mt-0.5 shrink-0 tabular-nums">
                  0{index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Takeaway:{' '}
              <span className="font-normal text-slate-600 dark:text-slate-300">
                {meta.exampleConclusion}
              </span>
            </p>
          </div>
        </section>

        {/* 3. Common Questions (FAQ Accordion) */}
        <section
          aria-labelledby="faq-heading"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 id="faq-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Common Questions ({meta.shortTitle})
            </h2>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {meta.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-3.5 first:pt-1 last:pb-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1"
                  >
                    <span className="text-sm">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Calculators */}
        <section aria-labelledby="related-heading" className="space-y-3">
          <h2 id="related-heading" className="text-sm font-bold text-slate-900 dark:text-white">
            More Calculators You Might Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedCalculators.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectCalculator(rel.id)}
                className="group text-left liquid-glass rounded-2xl p-5 hover:border-emerald-500/50 transition-colors cursor-pointer flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {rel.category}
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between gap-2">
                    <span>{rel.shortTitle}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {rel.summary}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
