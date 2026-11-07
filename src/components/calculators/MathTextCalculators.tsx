import React, { useState } from 'react';
import {
  calculatePercentages,
  calculateDiscountAndTax,
  calculateAgeAndDateDiff,
  analyzeTextContent,
  convertUnits,
  UNIT_DEFINITIONS,
  UnitCategory,
} from '../../utils/calculators';
import {
  clampSafeNumber,
  sanitizeUserText,
  formatCurrencyValue,
  getCurrencySymbol,
} from '../../utils/security';
import { CalculatorActionProps } from './FinanceCalculators';
import { RotateCcw, Copy, Check, BookmarkPlus, ArrowLeftRight } from 'lucide-react';

/**
 * 5. Math: 3-in-1 Percentage Calculator
 */
export const PercentageCalculator: React.FC<CalculatorActionProps> = ({ onSaveCalculation }) => {
  // Mode 1: What is X% of Y?
  const [m1Percent, setM1Percent] = useState<number>(20);
  const [m1Value, setM1Value] = useState<number>(250);

  // Mode 2: X is what % of Y?
  const [m2Part, setM2Part] = useState<number>(45);
  const [m2Whole, setM2Whole] = useState<number>(180);

  // Mode 3: % change from X to Y
  const [m3From, setM3From] = useState<number>(80);
  const [m3To, setM3To] = useState<number>(100);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const result = calculatePercentages(
    m1Percent,
    m1Value,
    m2Part,
    m2Whole,
    m3From,
    m3To
  );

  const handleSave = () => {
    if (!onSaveCalculation) return;
    onSaveCalculation({
      calculatorId: 'percentage',
      calculatorTitle: '3-in-1 Percentage',
      primaryResult: `${m1Percent}% of ${m1Value} = ${Number(result.percentOfValue.toFixed(2))}`,
      detailSummary: `Ratio: ${
        result.whatPercentOf !== null ? `${Number(result.whatPercentOf.toFixed(1))}%` : 'N/A'
      } · Δ: ${
        result.percentageChange !== null
          ? `${result.isIncrease ? '+' : ''}${Number(result.percentageChange.toFixed(1))}%`
          : 'N/A'
      }`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/70 pb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3-in-1 Simultaneous Percentage Solver
        </h2>
        <div className="flex items-center gap-2">
          {onSaveCalculation && (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              {savedToast ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <BookmarkPlus className="w-3.5 h-3.5" />
              )}
              <span>{savedToast ? 'Saved' : 'Save Scenario'}</span>
            </button>
          )}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: What is X% of Y? */}
        <div className="liquid-well rounded-xl p-5 flex flex-col justify-between space-y-5">
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
                  onChange={(e) => setM1Percent(clampSafeNumber(e.target.value, -1e9, 1e9, 0))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                  onChange={(e) => setM1Value(clampSafeNumber(e.target.value, -1e9, 1e9, 0))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {m1Percent}% of {m1Value.toLocaleString('en-US')} equals
            </div>
            <div
              data-testid="pct-mode1-result"
              className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
            >
              {Number(result.percentOfValue.toFixed(4)).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* Card 2: X is what % of Y? */}
        <div className="liquid-well rounded-xl p-5 flex flex-col justify-between space-y-5">
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
                  onChange={(e) => setM2Part(clampSafeNumber(e.target.value, -1e9, 1e9, 0))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                  onChange={(e) => setM2Whole(clampSafeNumber(e.target.value, -1e9, 1e9, 0))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {m2Part.toLocaleString('en-US')} out of {m2Whole.toLocaleString('en-US')} is
            </div>
            <div
              data-testid="pct-mode2-result"
              className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
            >
              {result.whatPercentOf !== null
                ? `${Number(result.whatPercentOf.toFixed(2)).toLocaleString('en-US')}%`
                : 'Undefined (÷0)'}
            </div>
          </div>
        </div>

        {/* Card 3: Percentage Increase / Decrease */}
        <div className="liquid-well rounded-xl p-5 flex flex-col justify-between space-y-5">
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
                  onChange={(e) => setM3From(clampSafeNumber(e.target.value, -1e9, 1e9, 0))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                  onChange={(e) => setM3To(clampSafeNumber(e.target.value, -1e9, 1e9, 0))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Difference: {result.difference >= 0 ? `+${result.difference.toLocaleString('en-US')}` : result.difference.toLocaleString('en-US')}
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
export const DiscountTaxCalculator: React.FC<CalculatorActionProps> = ({
  currency = 'USD',
  onSaveCalculation,
}) => {
  const [originalPrice, setOriginalPrice] = useState<number>(150);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [extraDiscountPercent, setExtraDiscountPercent] = useState<number>(10);
  const [taxPercent, setTaxPercent] = useState<number>(8.25);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const sym = getCurrencySymbol(currency);
  const formatCurrency = (val: number) => formatCurrencyValue(val, currency, 2);

  const result = calculateDiscountAndTax(
    originalPrice,
    discountPercent,
    extraDiscountPercent,
    taxPercent
  );

  const handleSave = () => {
    if (!onSaveCalculation) return;
    onSaveCalculation({
      calculatorId: 'discount-tax',
      calculatorTitle: 'Discount & Sales Tax',
      primaryResult: `${formatCurrency(result.finalPayablePrice)} Final`,
      detailSummary: `Saved ${formatCurrency(result.totalSavings)} (${result.effectiveDiscountPercent.toFixed(1)}% off) + ${taxPercent}% tax`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Price, Discounts &amp; Sales Tax
            </h2>
            <div className="flex items-center gap-2">
              {onSaveCalculation && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  {savedToast ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  )}
                  <span>{savedToast ? 'Saved' : 'Save Scenario'}</span>
                </button>
              )}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="disc-price"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Original Sticker Price ({sym})
              </label>
              <input
                id="disc-price"
                type="number"
                min={0}
                step={1}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(clampSafeNumber(e.target.value, 0, 1e8, 0))}
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                max={100}
                step={0.25}
                value={taxPercent}
                onChange={(e) => setTaxPercent(clampSafeNumber(e.target.value, 0, 100, 0))}
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                onChange={(e) => setDiscountPercent(clampSafeNumber(e.target.value, 0, 100, 0))}
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                onChange={(e) => setExtraDiscountPercent(clampSafeNumber(e.target.value, 0, 100, 0))}
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Receipt Summary */}
        <div className="lg:col-span-6 space-y-5 lg:border-l lg:border-slate-200/70 dark:lg:border-slate-800/70 lg:pl-8">
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

          <div className="liquid-well rounded-xl p-4 space-y-2.5 text-xs sm:text-sm font-mono tabular-nums">
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
            <div className="flex justify-between border-t border-slate-200/70 dark:border-slate-800/70 pt-2 text-slate-800 dark:text-slate-200 font-semibold">
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
export const AgeDateCalculator: React.FC<CalculatorActionProps> = ({ onSaveCalculation }) => {
  const [startDate, setStartDate] = useState<string>('2000-05-15');
  const [endDate, setEndDate] = useState<string>('2026-11-06');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const result = calculateAgeAndDateDiff(startDate, endDate);

  const handleSave = () => {
    if (!onSaveCalculation || !result.isValid) return;
    onSaveCalculation({
      calculatorId: 'age-date',
      calculatorTitle: 'Age & Date Difference',
      primaryResult: `${result.years}y ${result.months}m ${result.days}d`,
      detailSummary: `${startDate} → ${endDate} (${result.totalDays.toLocaleString()} days)`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Select Dates
            </h2>
            <div className="flex items-center gap-2">
              {onSaveCalculation && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  {savedToast ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  )}
                  <span>{savedToast ? 'Saved' : 'Save Dates'}</span>
                </button>
              )}
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
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
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
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-slate-200/70 dark:lg:border-slate-800/70 lg:pl-8">
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
                <div className="liquid-well rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Days</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.totalDays.toLocaleString()}
                  </div>
                </div>
                <div className="liquid-well rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Weeks</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.totalWeeks.toLocaleString()}w {result.remainingDaysAfterWeeks}d
                  </div>
                </div>
                <div className="liquid-well rounded-xl p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Hours</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.totalHours.toLocaleString()}
                  </div>
                </div>
                <div className="liquid-well rounded-xl p-3">
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

export const WordCounterCalculator: React.FC<CalculatorActionProps> = ({ onSaveCalculation }) => {
  const [text, setText] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const stats = analyzeTextContent(text);

  const transformText = (newText: string) => {
    setPreviousText(text);
    setText(newText);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleSave = () => {
    if (!onSaveCalculation) return;
    onSaveCalculation({
      calculatorId: 'word-counter',
      calculatorTitle: 'Word & Reading Counter',
      primaryResult: `${stats.words.toLocaleString()} words · ${stats.charactersWithSpaces.toLocaleString()} chars`,
      detailSummary: `Read time: ${stats.readingTimeFormatted} · Sentences: ${stats.sentences}`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Top Live Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="liquid-well rounded-xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Words</div>
          <div
            data-testid="word-count-value"
            className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
          >
            {stats.words.toLocaleString()}
          </div>
        </div>
        <div className="liquid-well rounded-xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Characters</div>
          <div
            data-testid="char-count-value"
            className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5"
          >
            {stats.charactersWithSpaces.toLocaleString()}
          </div>
        </div>
        <div className="liquid-well rounded-xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">No Spaces</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.charactersWithoutSpaces.toLocaleString()}
          </div>
        </div>
        <div className="liquid-well rounded-xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Sentences / Paragraphs</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.sentences} / {stats.paragraphs}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Avg Word: {stats.averageWordLength} chars
          </div>
        </div>
        <div className="liquid-well rounded-xl p-3.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">Reading Time</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {stats.readingTimeFormatted}
          </div>
        </div>
        <div className="liquid-well rounded-xl p-3.5">
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
            Enter or Paste Your Text Below (Sanitized Client-Side)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {onSaveCalculation && (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                {savedToast ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <BookmarkPlus className="w-3.5 h-3.5" />
                )}
                <span>{savedToast ? 'Saved' : 'Save Snapshot'}</span>
              </button>
            )}
            {previousText !== null && (
              <button
                type="button"
                onClick={() => {
                  setText(previousText);
                  setPreviousText(null);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
              >
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => transformText(text.toUpperCase())}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => transformText(text.toLowerCase())}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => transformText('')}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 dark:border-slate-700/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
            >
              Clear Text
            </button>
            <button
              type="button"
              onClick={() => transformText(DEFAULT_SAMPLE_TEXT)}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Restore Sample
            </button>
          </div>
        </div>

        <textarea
          id="word-counter-textarea"
          rows={7}
          value={text}
          onChange={(e) => setText(sanitizeUserText(e.target.value, 50000))}
          placeholder="Start typing or paste your essay, article, or social media post here..."
          className="w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 p-4 text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Keyword Density & Social Platform Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Top Keyword Density (Excluding Stop Words)
          </h3>
          {stats.topKeywords.length > 0 ? (
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70 liquid-well rounded-xl px-4 py-2 text-xs">
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
            <div className="liquid-well rounded-xl p-4 text-xs text-slate-500">
              Type at least a few words to see live keyword frequency and density metrics.
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            SEO &amp; Social Character Limit Check
          </h3>
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70 liquid-well rounded-xl px-4 py-2 text-xs font-mono tabular-nums">
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

const UNIT_CATEGORY_TABS: Array<{ id: UnitCategory; label: string }> = [
  { id: 'length', label: 'Length' },
  { id: 'weight', label: 'Weight / Mass' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'area', label: 'Area' },
  { id: 'volume', label: 'Volume' },
  { id: 'speed', label: 'Speed' },
];

/**
 * 10. Math: Universal 6-Category Unit Converter
 */
export const UnitConverterCalculator: React.FC<CalculatorActionProps> = ({ onSaveCalculation }) => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<number>(5);
  const [fromUnit, setFromUnit] = useState<string>('mi');
  const [toUnit, setToUnit] = useState<string>('km');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const units = UNIT_DEFINITIONS[category];
  const result = convertUnits(category, inputValue, fromUnit, toUnit);
  const fromDef = units.find((u) => u.id === fromUnit) ?? units[0];
  const toDef = units.find((u) => u.id === toUnit) ?? units[1] ?? units[0];

  const handleCategoryChange = (nextCat: UnitCategory) => {
    setCategory(nextCat);
    if (nextCat !== 'temperature' && inputValue < 0) {
      setInputValue(Math.abs(inputValue));
    }
    const nextUnits = UNIT_DEFINITIONS[nextCat];
    setFromUnit(nextUnits[0].id);
    setToUnit((nextUnits[1] ?? nextUnits[0]).id);
  };

  const handleSwapUnits = () => {
    setFromUnit(toDef.id);
    setToUnit(fromDef.id);
  };

  const minBound = category === 'temperature' ? -459.67 : 0;

  const formatConvertedNumber = (val: number): string => {
    if (!Number.isFinite(val)) return '0';
    if (Math.abs(val) >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 4 });
    if (Math.abs(val) > 0 && Math.abs(val) < 0.001) return val.toExponential(4);
    return Number(val.toPrecision(7)).toString();
  };

  const handleSave = () => {
    onSaveCalculation?.({
      calculatorId: 'unit-converter',
      calculatorTitle: 'Universal Unit Converter',
      primaryResult: `${inputValue} ${fromDef.symbol} = ${formatConvertedNumber(result.convertedValue)} ${toDef.symbol}`,
      detailSummary: `${category.toUpperCase()}: ${result.formulaSummary}`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-800/70 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {UNIT_CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCategoryChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                category === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'liquid-well text-slate-600 dark:text-slate-300 hover:text-indigo-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          {savedToast ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
          <span>{savedToast ? 'Saved' : 'Save Conversion'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Source Unit */}
        <div className="lg:col-span-5 liquid-well rounded-xl p-5 space-y-3">
          <label htmlFor="unit-input-val" className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            From Quantity &amp; Unit
          </label>
          <input
            id="unit-input-val"
            type="number"
            min={minBound}
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(clampSafeNumber(e.target.value, minBound, 1e12, 0))}
            className="w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums"
          />
          <select
            aria-label="Source Measurement Unit"
            value={fromDef.id}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Bidirectional Swap Button */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleSwapUnits}
            aria-label="Swap Source and Target Units"
            className="p-3 rounded-2xl liquid-well text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1.5 text-center">
            {result.formulaSummary}
          </span>
        </div>

        {/* Target Unit */}
        <div className="lg:col-span-5 liquid-well rounded-xl p-5 space-y-3">
          <label htmlFor="unit-target-select" className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Converted Output &amp; Target Unit
          </label>
          <div
            data-testid="unit-converted-output"
            className="w-full rounded-xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/30 px-3.5 py-2.5 text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums overflow-x-auto"
          >
            {formatConvertedNumber(result.convertedValue)} {toDef.symbol}
          </div>
          <select
            id="unit-target-select"
            aria-label="Target Measurement Unit"
            value={toDef.id}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Multi-Unit Equivalent Table */}
      <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Simultaneous Equivalent Values Across All {category.toUpperCase()} Units
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {result.allUnitsTable.map((item) => (
            <div key={item.id} className="liquid-well rounded-xl p-3 space-y-0.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums truncate">
                {formatConvertedNumber(item.value)} <span className="text-indigo-600 dark:text-indigo-400">{item.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

