import React, { useState } from 'react';
import { ChevronDown, BookOpen, Calculator, HelpCircle, ArrowRight } from 'lucide-react';
import { CalculatorMeta, CALCULATOR_CATALOG, CalculatorId } from '../data/calculatorCatalog';

interface AdSenseContentStructureProps {
  meta: CalculatorMeta;
  onSelectCalculator: (id: CalculatorId) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdSenseContentStructure: React.FC<AdSenseContentStructureProps> = ({
  meta,
  onSelectCalculator,
  onNavigateHome,
  children,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const relatedCalculators = CALCULATOR_CATALOG.filter(
    (c) => c.id !== meta.id && (c.category === meta.category || c.popular)
  ).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb & Page Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            All Calculators
          </button>
          <span aria-hidden="true">/</span>
          <span>{meta.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 dark:text-slate-200 font-medium">{meta.shortTitle}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {meta.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {meta.summary}
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>{meta.category} Utility</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>Instant Live Calculation</span>
          </div>
        </div>
      </div>

      {/* TOP SECTION: Interactive Calculator */}
      <section aria-label={`${meta.title} Interactive Tool`}>
        {children}
      </section>

      {/* Sponsored Advertisement Unit */}
      <aside
        aria-label="Sponsored Content"
        className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-4 text-center my-6"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[90px] space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
            Advertisement
          </span>
          <div className="text-xs text-slate-400/80 dark:text-slate-500">
            Partner Network Display
          </div>
        </div>
      </aside>

      {/* BOTTOM SECTION: Deep Educational Content (Formula + Step-by-Step Example + FAQ Accordion) */}
      <div className="space-y-10 pt-2">
        {/* 1. Mathematical Formula Section */}
        <section
          aria-labelledby="formula-heading"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 id="formula-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Mathematical Formula: {meta.formulaTitle}
            </h2>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 overflow-x-auto">
            <code className="text-sm sm:text-base font-mono font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
              {meta.formulaExpression}
            </code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {meta.formulaVariables.map((v) => (
              <div
                key={v.symbol}
                className="flex items-baseline gap-3 text-sm border-b border-slate-100 dark:border-slate-800/70 pb-2"
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
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
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
                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-md px-2 py-0.5 mt-0.5 shrink-0 tabular-nums">
                  0{index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
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
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 id="faq-heading" className="text-xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions ({meta.shortTitle})
            </h2>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
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
                  {isOpen && (
                    <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Tools Internal Linking */}
        <section aria-labelledby="related-heading" className="space-y-4">
          <h2 id="related-heading" className="text-base font-bold text-slate-900 dark:text-white">
            Related Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedCalculators.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectCalculator(rel.id)}
                className="group text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer flex flex-col justify-between gap-3"
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
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
