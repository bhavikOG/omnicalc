import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  BookOpen,
  Calculator,
  HelpCircle,
  ArrowRight,
  Bookmark,
  EyeOff,
  Eye,
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
  const activityTimeoutRef = useRef<number | null>(null);

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
    <motion.div
      key={meta.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Breadcrumb & Apple Liquid Glass Header Bar */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium"
            >
              All Calculators
            </button>
            <span aria-hidden="true">/</span>
            <span>{meta.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold">
              {meta.shortTitle}
            </span>
          </nav>

          {/* Retention & Focus Controls: Pin to Favorites + Smart Focus Shield */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTogglePin(meta.id)}
              aria-pressed={isPinned}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isPinned
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'liquid-well text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
              <span>{isPinned ? 'Pinned to Dock' : 'Pin to Dock'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFocusShieldManual((prev) => !prev)}
              aria-pressed={focusShieldManual}
              title="Automatically hides sponsor units while you are actively working on calculations"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                adsMinimizedForWork
                  ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'liquid-well text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {adsMinimizedForWork ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Focus Shield Active</span>
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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {meta.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {meta.summary}
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>{meta.category} Workspace</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>100% On-Device Privacy</span>
          </div>
        </div>
      </div>

      {/* TOP SECTION: Wichtig / Important Information First — Interactive Calculator */}
      <section
        aria-label={`${meta.title} Interactive Tool`}
        onInputCapture={triggerActiveCalculationFocus}
        onChangeCapture={triggerActiveCalculationFocus}
      >
        {children}
      </section>

      {/* MIDDLE SECTION: Smart Focus-Aware Ad Placement Container */}
      <aside
        aria-label="Advertisement Placement Container"
        data-testid="ad-placement-container"
        className={`w-full rounded-2xl transition-all duration-200 ${
          adsMinimizedForWork
            ? 'liquid-well px-5 py-2.5 opacity-60'
            : 'liquid-glass p-5 text-center'
        }`}
      >
        {adsMinimizedForWork ? (
          <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono text-[11px]">
              Focus Shield Active — Sponsor placement paused while you calculate
            </span>
            {focusShieldManual && (
              <button
                type="button"
                onClick={() => setFocusShieldManual(false)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Resume Sponsor Slot
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[92px] space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-slate-400 dark:text-slate-500">
              <span>Sponsored Placement · Ad Placement Container (728×90 / In-Article)</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setFocusShieldManual(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Hide during work
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Google AdSense Non-Intrusive Display Slot — Positioned below active workspace controls with zero layout shift (CLS 0.00).
            </p>
          </div>
        )}
      </aside>

      {/* BOTTOM SECTION: Deep Educational Content (Formula + Step-by-Step Example + FAQ Accordion) */}
      <div className="space-y-8 pt-1">
        {/* 1. Mathematical Formula Section */}
        <section
          aria-labelledby="formula-heading"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 id="formula-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Mathematical Formula: {meta.formulaTitle}
            </h2>
          </div>

          <div className="liquid-well rounded-xl p-4 sm:p-5 overflow-x-auto">
            <code className="text-sm sm:text-base font-mono font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
              {meta.formulaExpression}
            </code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {meta.formulaVariables.map((v) => (
              <div
                key={v.symbol}
                className="flex items-baseline gap-3 text-sm border-b border-slate-200/60 dark:border-slate-800/70 pb-2"
              >
                <span className="font-mono font-semibold text-slate-900 dark:text-white shrink-0 min-w-[70px]">
                  {v.symbol}
                </span>
                <span className="text-slate-600 dark:text-slate-300">{v.meaning}</span>
              </div>
            ))}
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {meta.formulaExplanation}
          </p>
        </section>

        {/* 2. Practical Step-by-Step Calculation Example */}
        <section
          aria-labelledby="example-heading"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 id="example-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              {meta.exampleTitle}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            {meta.exampleScenario}
          </p>

          <ol className="space-y-3">
            {meta.exampleSteps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 liquid-well rounded-md px-2 py-0.5 mt-0.5 shrink-0 tabular-nums">
                  0{index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              Result Summary:{' '}
              <span className="font-normal text-slate-600 dark:text-slate-300">
                {meta.exampleConclusion}
              </span>
            </p>
          </div>
        </section>

        {/* 3. Interactive FAQ Accordion */}
        <section
          aria-labelledby="faq-heading"
          className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 id="faq-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions ({meta.shortTitle})
            </h2>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {meta.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4 first:pt-1 last:pb-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Tools Internal Linking */}
        <section aria-labelledby="related-heading" className="space-y-4">
          <h2 id="related-heading" className="text-base font-bold text-slate-900 dark:text-white">
            Continue With Related Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedCalculators.map((rel) => (
              <motion.button
                key={rel.id}
                type="button"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectCalculator(rel.id)}
                className="group text-left liquid-glass rounded-2xl p-5 hover:border-indigo-500/60 transition-colors cursor-pointer flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {rel.category}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between gap-2">
                    <span>{rel.shortTitle}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {rel.summary}
                </p>
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
