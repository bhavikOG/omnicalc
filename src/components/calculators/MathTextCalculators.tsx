import React, { useState } from 'react';
import {
  calculatePercentages,
  calculateDiscountAndTax,
  calculateAgeAndDateDiff,
  analyzeTextContent,
} from '../../utils/calculators';
import { RotateCcw, Copy, Check } from 'lucide-react';

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

/**
 * 5. Math: 3-in-1 Percentage Calculator
 */
export const PercentageCalculator: React.FC = () => {
  // Mode 1: What is X% of Y?
  const [m1Percent, setM1Percent] = useState<number>(20);
  const [m1Value, setM1Value] = useState<number>(250);

  // Mode 2: X is what % of Y?
  const [m2Part, setM2Part] = useState<number>(45);
  const [m2Whole, setM2Whole] = useState<number>(180);

  // Mode 3: % change from X to Y
  const [m3From, setM3From] = useState<number>(80);
  const [m3To, setM3To] = useState<number>(100);

  const result = calculatePercentages(
    m1Percent,
    m1Value,
    m2Part,
    m2Whole,
    m3From,
    m3To
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3-in-1 Simultaneous Percentage Solver
        </h2>
        <button
          type="button"
          onClick={() => {
            setM1Percent(20);
            setM1Value(250);
            setM2Part(45);
            setM2Whole(180);
            setM3From(80);
            setM3To(100);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: What is X% of Y? */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              01. Percentage of a Number
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pct-m1-percent"
                  className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                >
                  What is (%)
                </label>
                <input
                  id="pct-m1-percent"
                  type="number"
                  step="any"
                  value={m1Percent}
                  onChange={(e) => setM1Percent(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="pct-m1-value"
                  className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                >
                  of Value (Y)
                </label>
                <input
                  id="pct-m1-value"
                  type="number"
                  step="any"
                  value={m1Value}
                  onChange={(e) => setM1Value(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {m1Percent}% of {m1Value} equals
            </div>
            <div
              data-testid="pct-mode1-result"
              className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
            >
              {Number(result.percentOfValue.toFixed(4))}
            </div>
          </div>
        </div>

        {/* Card 2: X is what % of Y? */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              02. Ratio as a Percentage
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pct-m2-part"
                  className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                >
                  Part Value (X)
                </label>
                <input
                  id="pct-m2-part"
                  type="number"
                  step="any"
                  value={m2Part}
                  onChange={(e) => setM2Part(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="pct-m2-whole"
                  className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                >
                  is what % of Total (Y)
                </label>
                <input
                  id="pct-m2-whole"
                  type="number"
                  step="any"
                  value={m2Whole}
                  onChange={(e) => setM2Whole(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {m2Part} out of {m2Whole} is
            </div>
            <div
              data-testid="pct-mode2-result"
              className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
            >
              {result.whatPercentOf !== null
                ? `${Number(result.whatPercentOf.toFixed(2))}%`
                : 'Undefined (÷0)'}
            </div>
          </div>
        </div>

        {/* Card 3: Percentage Increase / Decrease */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              03. Percentage Change (%Δ)
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pct-m3-from"
                  className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                >
                  From Initial Value (X)
                </label>
                <input
                  id="pct-m3-from"
                  type="number"
                  step="any"
                  value={m3From}
                  onChange={(e) => setM3From(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="pct-m3-to"
                  className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                >
                  To New Value (Y)
                </label>
                <input
                  id="pct-m3-to"
                  type="number"
                  step="any"
                  value={m3To}
                  onChange={(e) => setM3To(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Difference: {result.difference >= 0 ? `+${result.difference}` : result.difference}
            </div>
            <div
              data-testid="pct-mode3-result"
              className={`text-2xl font-bold font-mono tabular-nums mt-0.5 ${
                result.isIncrease
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {result.percentageChange !== null
                ? `${result.isIncrease ? '+' : ''}${Number(
                    result.percentageChange.toFixed(2)
                  )}% (${result.isIncrease ? 'Increase' : 'Decrease'})`
                : 'Undefined (÷0)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 6. Math: Discount & Sales Tax Calculator
 */
export const DiscountTaxCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<number>(150);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [extraDiscountPercent, setExtraDiscountPercent] = useState<number>(10);
  const [taxPercent, setTaxPercent] = useState<number>(8.25);

  const result = calculateDiscountAndTax(
    originalPrice,
    discountPercent,
    extraDiscountPercent,
    taxPercent
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Price, Discounts & Sales Tax
            </h2>
            <button
              type="button"
              onClick={() => {
                setOriginalPrice(150);
                setDiscountPercent(30);
                setExtraDiscountPercent(10);
                setTaxPercent(8.25);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="disc-price"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Original Sticker Price ($)
              </label>
              <input
                id="disc-price"
                type="number"
                min={0}
                step={1}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="disc-tax"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Sales Tax Rate (%)
              </label>
              <input
                id="disc-tax"
                type="number"
                min={0}
                max={30}
                step={0.25}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="disc-primary"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Store Discount (% Off)
              </label>
              <input
                id="disc-primary"
                type="number"
                min={0}
                max={100}
                step={1}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="disc-extra"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Extra Stacked Coupon (% Off)
              </label>
              <input
                id="disc-extra"
                type="number"
                min={0}
                max={100}
                step={1}
                value={extraDiscountPercent}
                onChange={(e) =>
                  setExtraDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Receipt Summary */}
        <div className="lg:col-span-6 space-y-5 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Final Checkout Price
              </div>
              <div
                data-testid="discount-final-price"
                className="text-3xl sm:text-4xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
              >
                {formatCurrency(result.finalPayablePrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total You Save</div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {formatCurrency(result.totalSavings)} ({result.effectiveDiscountPercent.toFixed(1)}%)
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 text-xs sm:text-sm font-mono tabular-nums">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Original Price</span>
              <span>{formatCurrency(result.originalPrice)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Primary Discount ({discountPercent}%)</span>
              <span>-{formatCurrency(result.primaryDiscountAmount)}</span>
            </div>
            {extraDiscountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Extra Coupon ({extraDiscountPercent}% off reduced)</span>
                <span>-{formatCurrency(result.additionalDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-800 dark:text-slate-200 font-semibold">
              <span>Discounted Pre-Tax Subtotal</span>
              <span>{formatCurrency(result.discountedSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sales Tax ({taxPercent}%)</span>
              <span>+{formatCurrency(result.taxAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 7. Math: Age & Date Difference Calculator
 */
export const AgeDateCalculator: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2000-05-15');
  const [endDate, setEndDate] = useState<string>('2026-11-06');

  const result = calculateAgeAndDateDiff(startDate, endDate);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Select Dates
            </h2>
            <button
              type="button"
              onClick={() => {
                setStartDate('2000-05-15');
                setEndDate('2026-11-06');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="age-start-date"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Date of Birth / Start Date
              </label>
              <input
                id="age-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="age-end-date"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Target / End Date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    setEndDate(today);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Set to Today
                </button>
              </div>
              <input
                id="age-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
          {result.isValid ? (
            <>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Exact Chronological Age / Duration
                </div>
                <div
                  data-testid="age-exact-result"
                  className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-1"
                >
                  {result.years} Years, {result.months} Months, {result.days} Days
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Days</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.totalDays.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Weeks</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.totalWeeks.toLocaleString()}w {result.remainingDaysAfterWeeks}d
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Hours</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.totalHours.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Next Birthday</div>
                  <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                    in {result.daysUntilNextAnniversary} days
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-rose-600 dark:text-rose-400">
              Please select valid calendar dates to compute the difference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 8. Text: Live Word, Character & Reading Time Counter
 */
const DEFAULT_SAMPLE_TEXT = `Good financial and health decisions compound over time. Whether you are evaluating a 20-year home mortgage, projecting retirement savings through monthly index fund contributions, or calibrating your daily nutritional intake, small percentage improvements produce remarkable long-term outcomes.

Use this live lexical analyzer to inspect word count, character limits for SEO meta descriptions and social posts, estimated reading time, and top keyword density.`;

export const WordCounterCalculator: React.FC = () => {
  const [text, setText] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const stats = analyzeTextContent(text);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
      {/* Top Live Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Words</div>
          <div
            data-testid="word-count-value"
            className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
          >
            {stats.words.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Characters</div>
          <div
            data-testid="char-count-value"
            className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5"
          >
            {stats.charactersWithSpaces.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">No Spaces</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.charactersWithoutSpaces.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Sentences / Paras</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.sentences} / {stats.paragraphs}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Reading Time</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {stats.readingTimeFormatted}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Speaking Time</div>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums mt-1">
            {stats.speakingTimeFormatted}
          </div>
        </div>
      </div>

      {/* Textarea & Transformation Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="word-counter-textarea"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Enter or Paste Your Text Below
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setText(text.toUpperCase())}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => setText(text.toLowerCase())}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
            >
              Clear Text
            </button>
            <button
              type="button"
              onClick={() => setText(DEFAULT_SAMPLE_TEXT)}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Restore Sample
            </button>
          </div>
        </div>

        <textarea
          id="word-counter-textarea"
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your essay, article, or social media post here..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Keyword Density & Social Platform Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Top Keyword Density (Excluding Stop Words)
          </h3>
          {stats.topKeywords.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs">
              {stats.topKeywords.map((kw) => (
                <div key={kw.word} className="py-2 flex items-center justify-between">
                  <span className="font-mono font-medium text-slate-900 dark:text-white">
                    {kw.word}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                    {kw.count}× ({kw.densityPercent.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-500">
              Type at least a few words to see live keyword frequency and density metrics.
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            SEO & Social Character Limit Check
          </h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-mono tabular-nums">
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700 dark:text-slate-300">Google SEO Title (60 chars)</span>
              <span className={stats.charactersWithSpaces <= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {stats.charactersWithSpaces} / 60
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700 dark:text-slate-300">SEO Meta Description (160 chars)</span>
              <span className={stats.charactersWithSpaces <= 160 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {stats.charactersWithSpaces} / 160
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-700 dark:text-slate-300">X / Twitter Post (280 chars)</span>
              <span className={stats.charactersWithSpaces <= 280 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {stats.charactersWithSpaces} / 280
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
