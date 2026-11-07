import React, { useState } from 'react';
import {
  calculateLoanEmi,
  calculateCompoundInterest,
  compareLoanScenarios,
  compareCompoundScenarios,
  calculateSipRetirement,
} from '../../utils/calculators';
import {
  clampSafeNumber,
  CurrencyCode,
  formatCurrencyValue,
  getCurrencySymbol,
  downloadCsvFile,
  buildShareableCalculatorUrl,
  parseSafeNumericQueryParams,
} from '../../utils/security';
import {
  RotateCcw,
  BookmarkPlus,
  Check,
  Copy,
  Download,
  Share2,
  GitCompare,
  SlidersHorizontal,
  Zap,
  Shield,
  ChevronDown,
  TrendingUp,
  Sparkles,
  Minus,
  Plus,
} from 'lucide-react';

export interface CalculatorActionProps {
  currency?: CurrencyCode;
  onSaveCalculation?: (entry: {
    calculatorId: string;
    calculatorTitle: string;
    primaryResult: string;
    detailSummary: string;
  }) => void;
}

/**
 * Helper to compute accelerated payoff metrics given base principal, annual rate, tenure years,
 * extra monthly principal payment, and optional bi-weekly cadence.
 */
function computeAcceleratedMortgage(
  principal: number,
  annualRate: number,
  years: number,
  extraMonthly: number,
  biWeekly: boolean
) {
  const base = calculateLoanEmi(principal, annualRate, years);
  const monthlyRate = annualRate / 12 / 100;
  const maxMonths = Math.max(1, Math.round(years * 12));
  const biWeeklyBoost = biWeekly ? base.monthlyEmi / 12 : 0;
  const effectiveExtra = Math.max(0, extraMonthly) + biWeeklyBoost;

  if (effectiveExtra <= 0.01 || principal <= 0) {
    return {
      baseEmi: base.monthlyEmi,
      effectiveMonthlyPAndI: base.monthlyEmi,
      totalInterest: base.totalInterest,
      totalCostPAndI: base.totalPayment,
      monthsToPayoff: maxMonths,
      monthsSaved: 0,
      interestSaved: 0,
    };
  }

  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const scheduledPayment = base.monthlyEmi + effectiveExtra;

  while (balance > 0.01 && months < maxMonths) {
    months += 1;
    const interestForMonth = balance * monthlyRate;
    totalInterest += interestForMonth;
    const principalForMonth = Math.min(balance, Math.max(0, scheduledPayment - interestForMonth));
    if (principalForMonth <= 0) break;
    balance = Math.max(0, balance - principalForMonth);
  }

  const interestSaved = Math.max(0, base.totalInterest - totalInterest);
  const monthsSaved = Math.max(0, maxMonths - months);

  return {
    baseEmi: base.monthlyEmi,
    effectiveMonthlyPAndI: base.monthlyEmi + effectiveExtra,
    totalInterest,
    totalCostPAndI: principal + totalInterest,
    monthsToPayoff: months,
    monthsSaved,
    interestSaved,
  };
}

function formatPayoffDate(monthsFromNow: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + Math.max(1, Math.round(monthsFromNow)), 1);
  return target.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * 1. Finance: Loan EMI / Mortgage Calculator ("Simulator Matrix")
 * Designed in Apple macOS Sequoia Pro Minimalist style with:
 * - Dual-Kernel Scenario A (Base) vs. Scenario B (Accelerated) Simulator Matrix
 * - Asset Purchase Valuation & Down Payment with live LTV% calculation
 * - Accelerated Extra Principal slider + Bi-Weekly Cadence accelerator
 * - Escrow, Taxes & Association Reserves collapsible drawer
 * - Equity Acceleration Curve SVG trajectory visual
 * - OWASP-hardened CSV Amortization Export & Deep-Link Sharing
 */
export const LoanEmiCalculator: React.FC<CalculatorActionProps> = ({
  currency = 'USD',
  onSaveCalculation,
}) => {
  const initialQuery =
    typeof window !== 'undefined'
      ? parseSafeNumericQueryParams(window.location.search, {
          p: { min: 1000, max: 50000000, fallback: 680000 },
          r: { min: 0, max: 40, fallback: 6.425 },
          y: { min: 1, max: 40, fallback: 30 },
          cmp: { min: 0, max: 1, fallback: 0 },
          pb: { min: 1000, max: 50000000, fallback: 680000 },
          rb: { min: 0, max: 40, fallback: 5.65 },
          yb: { min: 1, max: 40, fallback: 15 },
        })
      : { p: 680000, r: 6.425, y: 30, cmp: 0, pb: 680000, rb: 5.65, yb: 15 };

  const [principal, setPrincipal] = useState<number>(initialQuery.p);
  const [downPayment, setDownPayment] = useState<number>(170000);
  const [rate, setRate] = useState<number>(initialQuery.r);
  const [years, setYears] = useState<number>(initialQuery.y);

  // Accelerated & Escrow Reserves parameters
  const [extraPrincipal, setExtraPrincipal] = useState<number>(450);
  const [biWeeklyCadence, setBiWeeklyCadence] = useState<boolean>(false);
  const [escrowOpen, setEscrowOpen] = useState<boolean>(false);
  const [monthlyTax, setMonthlyTax] = useState<number>(580);
  const [monthlyInsurance, setMonthlyInsurance] = useState<number>(210);
  const [monthlyHoa, setMonthlyHoa] = useState<number>(115);

  // Side-by-side Scenario B custom comparison mode
  const [compareMode, setCompareMode] = useState<boolean>(initialQuery.cmp === 1);
  const [principalB, setPrincipalB] = useState<number>(initialQuery.pb);
  const [rateB, setRateB] = useState<number>(initialQuery.rb);
  const [yearsB, setYearsB] = useState<number>(initialQuery.yb);

  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [sharedToast, setSharedToast] = useState<boolean>(false);

  const sym = getCurrencySymbol(currency);
  const fmtDec = (v: number) => formatCurrencyValue(v, currency, 2);
  const fmtWhole = (v: number) => formatCurrencyValue(v, currency, 0);

  const assetValuation = Math.max(principal, principal + downPayment);
  const ltvPercent = assetValuation > 0 ? (principal / assetValuation) * 100 : 80;

  const result = calculateLoanEmi(principal, rate, years);
  const accelerated = computeAcceleratedMortgage(
    principal,
    rate,
    years,
    extraPrincipal,
    biWeeklyCadence
  );
  const resultB = calculateLoanEmi(principalB, rateB, yearsB);

  const totalEscrow = monthlyTax + monthlyInsurance + monthlyHoa;
  const baselineMonthlyOutlay = result.monthlyEmi + totalEscrow;
  const activeOptimizedMonthlyOutlay = compareMode
    ? resultB.monthlyEmi + totalEscrow
    : accelerated.effectiveMonthlyPAndI + totalEscrow;

  const activeInterestSaved = compareMode
    ? Math.max(0, result.totalInterest - resultB.totalInterest)
    : accelerated.interestSaved;

  // Stacked Outlay Breakdown percentages
  const totalOutlayForBar = Math.max(1, activeOptimizedMonthlyOutlay);
  const pAndIPct = Math.round(((compareMode ? resultB.monthlyEmi : accelerated.effectiveMonthlyPAndI) / totalOutlayForBar) * 100);
  const taxPct = Math.round((monthlyTax / totalOutlayForBar) * 100);
  const insPct = Math.round((monthlyInsurance / totalOutlayForBar) * 100);
  const hoaPct = Math.max(0, 100 - pAndIPct - taxPct - insPct);

  const handleAssetValuationChange = (newValuation: number) => {
    const safeVal = clampSafeNumber(newValuation, 1000, 50000000, 850000);
    const nextPrincipal = Math.max(1000, safeVal - downPayment);
    setPrincipal(nextPrincipal);
  };

  const handleDownPaymentChange = (newDp: number) => {
    const safeDp = clampSafeNumber(newDp, 0, 40000000, 170000);
    setDownPayment(safeDp);
  };

  const handleReset = () => {
    setPrincipal(680000);
    setDownPayment(170000);
    setRate(6.425);
    setYears(30);
    setExtraPrincipal(450);
    setBiWeeklyCadence(false);
    setMonthlyTax(580);
    setMonthlyInsurance(210);
    setMonthlyHoa(115);
    setPrincipalB(680000);
    setRateB(5.65);
    setYearsB(15);
  };

  const handleSave = () => {
    onSaveCalculation?.({
      calculatorId: 'loan-emi',
      calculatorTitle: 'Loan EMI / Mortgage',
      primaryResult: `${fmtDec(result.monthlyEmi)}/mo`,
      detailSummary: `${fmtWhole(principal)} at ${rate}% for ${years} yrs (Outlay: ${fmtDec(activeOptimizedMonthlyOutlay)}/mo)`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  const handleCopySummary = () => {
    const summary = `Mortgage & EMI Matrix: P&I ${fmtDec(result.monthlyEmi)}/mo | Total Monthly Outlay: ${fmtDec(activeOptimizedMonthlyOutlay)}/mo | Principal: ${fmtWhole(result.totalPrincipal)} | Interest Saved: ${fmtWhole(activeInterestSaved)}`;
    navigator.clipboard?.writeText(summary);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 1800);
  };

  const handleShareLink = () => {
    const url = buildShareableCalculatorUrl(
      'loan-emi',
      compareMode
        ? {
            p: principal,
            r: rate,
            y: years,
            cmp: 1,
            pb: principalB,
            rb: rateB,
            yb: yearsB,
          }
        : {
            p: principal,
            r: rate,
            y: years,
          }
    );
    navigator.clipboard?.writeText(url);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 1800);
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      `omnicalc-loan-amortization-${years}yr.csv`,
      ['Year', `Opening Balance (${currency})`, `Principal Paid (${currency})`, `Interest Paid (${currency})`, `Closing Balance (${currency})`],
      result.yearlySchedule.map((r) => [
        `Year ${r.year}`,
        Math.round(r.openingBalance),
        Math.round(r.principalPaid),
        Math.round(r.interestPaid),
        Math.round(r.closingBalance),
      ])
    );
  };

  const loanComparison = compareLoanScenarios(
    { principal, annualRatePercent: rate, tenureYears: years },
    { principal: principalB, annualRatePercent: rateB, tenureYears: yearsB }
  );
  const interestDiff = loanComparison.totalInterestDiff;
  const emiDiff = loanComparison.monthlyEmiDiff;

  const baselinePayoffLabel = formatPayoffDate(years * 12);
  const acceleratedPayoffLabel = compareMode
    ? formatPayoffDate(yearsB * 12)
    : formatPayoffDate(accelerated.monthsToPayoff);

  const accelRatio = Math.min(0.92, Math.max(0.25, accelerated.monthsToPayoff / Math.max(1, years * 12)));
  const accelX = Math.round(20 + accelRatio * 340);

  return (
    <div className="space-y-6">
      {/* MAIN 2-COLUMN LOAN CALCULATOR & MONTHLY PAYMENT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 COLS): LOAN DETAILS + PAYOFF TIMELINE */}
        <div className="lg:col-span-5 space-y-5">
          <div className="liquid-glass rounded-2xl p-5 sm:p-6 space-y-5">
            {/* Loan Details Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Loan &amp; Mortgage Details
                </h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium liquid-well text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Segmented Mode Switcher: Single Loan vs Comparison Mode */}
            <div
              role="group"
              aria-label="Loan Calculation Mode"
              className="grid grid-cols-2 gap-1.5 p-1 rounded-xl liquid-well"
            >
              <button
                type="button"
                onClick={() => setCompareMode(false)}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !compareMode
                    ? 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Single Loan</span>
              </button>
              <button
                type="button"
                data-testid="toggle-compare-loan"
                onClick={() => setCompareMode((prev) => !prev)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  compareMode
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparison Mode (A vs B)</span>
              </button>
            </div>

            {/* Home Price & Down Payment Row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Home Price &amp; Down Payment {compareMode ? '(Scenario A)' : ''}
                </span>
                <span className="font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  Loan-to-Value: {ltvPercent.toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-7 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {sym}
                  </span>
                  <input
                    type="number"
                    aria-label="Home Price"
                    min={1000}
                    max={50000000}
                    step={5000}
                    value={assetValuation}
                    onChange={(e) => handleAssetValuationChange(Number(e.target.value))}
                    className="w-full rounded-xl liquid-well pl-7 pr-3 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>
                <div className="sm:col-span-5 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 leading-tight">
                    Down {sym}
                  </span>
                  <input
                    type="number"
                    aria-label="Down Payment"
                    min={0}
                    max={40000000}
                    step={5000}
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                    className="w-full rounded-xl liquid-well pl-13 pr-2.5 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Scenario A Loan Amount + Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="loan-principal"
                  className="text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  {compareMode ? 'Scenario A Loan Amount' : 'Loan Amount'} ({sym})
                </label>
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {fmtWhole(principal)}
                </span>
              </div>
              <input
                id="loan-principal"
                type="number"
                min={1000}
                max={50000000}
                step={1000}
                value={principal}
                onChange={(e) =>
                  setPrincipal(clampSafeNumber(e.target.value, 0, 50000000, 0))
                }
                className="w-full rounded-xl liquid-well px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <input
                type="range"
                aria-label="Loan Amount Slider"
                min={50000}
                max={1500000}
                step={5000}
                value={Math.min(1500000, Math.max(50000, principal))}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                <span>{sym}50k</span>
                <span>{sym}750k</span>
                <span>{sym}1.5M</span>
              </div>
            </div>

            {/* Scenario A Interest Rate + Loan Term Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Interest Rate with [-] [+] steppers */}
              <div className="sm:col-span-6 space-y-1.5">
                <label
                  htmlFor="loan-rate"
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 block"
                >
                  {compareMode ? 'Scenario A Rate (%)' : 'Interest Rate (% per year)'}
                </label>
                <div className="flex items-center rounded-xl liquid-well p-1">
                  <button
                    type="button"
                    aria-label="Decrease Interest Rate"
                    onClick={() =>
                      setRate((r) => Math.max(0.1, Number((r - 0.125).toFixed(3))))
                    }
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    id="loan-rate"
                    type="number"
                    min={0}
                    max={40}
                    step={0.025}
                    value={rate}
                    onChange={(e) => setRate(clampSafeNumber(e.target.value, 0, 40, 0))}
                    className="w-full bg-transparent text-center text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    aria-label="Increase Interest Rate"
                    onClick={() =>
                      setRate((r) => Math.min(40, Number((r + 0.125).toFixed(3))))
                    }
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Loan Term Quick Buttons + Input */}
              <div className="sm:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="loan-years"
                    className="text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    {compareMode ? 'Scenario A Term' : 'Loan Term (Years)'}
                  </label>
                  <input
                    id="loan-years"
                    type="number"
                    min={1}
                    max={40}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(clampSafeNumber(e.target.value, 1, 40, 30))}
                    className="w-12 text-right bg-transparent text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 focus:outline-none tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-xl liquid-well p-1">
                  {[30, 20, 15].map((termYr) => (
                    <button
                      key={termYr}
                      type="button"
                      onClick={() => setYears(termYr)}
                      className={`py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        years === termYr
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {termYr} Yrs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* INLINE SCENARIO B COMPARISON CONTROLS (WHEN COMPARISON MODE IS ACTIVE) */}
            {compareMode ? (
              <div
                data-testid="loan-comparison-panel"
                className="rounded-2xl liquid-well p-4 border border-emerald-500/40 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Scenario B Parameters (Compare Side-by-Side)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPrincipalB(principal);
                      setRateB(Math.max(0.5, Number((rate - 1).toFixed(3))));
                      setYearsB(years);
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Copy A &amp; -1% Rate
                  </button>
                </div>

                {/* Quick Scenario Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPrincipalB(principal);
                      setRateB(Math.max(0.5, Number((rate - 1.0).toFixed(3))));
                      setYearsB(years);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                  >
                    -1.0% Lower Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrincipalB(principal);
                      setRateB(Math.max(0.5, Number((rate - 0.5).toFixed(3))));
                      setYearsB(15);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                  >
                    15-Yr Refinance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrincipalB(Math.max(10000, principal - 50000));
                      setRateB(rate);
                      setYearsB(years);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                  >
                    -{sym}50k Loan Amount
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="loan-b-principal" className="font-medium text-slate-600 dark:text-slate-300">
                        Scenario B Loan Amount ({sym})
                      </label>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {fmtWhole(principalB)}
                      </span>
                    </div>
                    <input
                      id="loan-b-principal"
                      type="number"
                      min={1000}
                      max={50000000}
                      step={1000}
                      value={principalB}
                      onChange={(e) => setPrincipalB(clampSafeNumber(e.target.value, 0, 50000000, 0))}
                      className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6 space-y-1">
                      <label htmlFor="loan-b-rate" className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                        Scenario B Rate (%)
                      </label>
                      <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 p-1">
                        <button
                          type="button"
                          aria-label="Decrease Scenario B Interest Rate"
                          onClick={() => setRateB((r) => Math.max(0.1, Number((r - 0.125).toFixed(3))))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          id="loan-b-rate"
                          type="number"
                          min={0}
                          max={40}
                          step={0.025}
                          value={rateB}
                          onChange={(e) => setRateB(clampSafeNumber(e.target.value, 0, 40, 0))}
                          className="w-full bg-transparent text-center text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none tabular-nums"
                        />
                        <button
                          type="button"
                          aria-label="Increase Scenario B Interest Rate"
                          onClick={() => setRateB((r) => Math.min(40, Number((r + 0.125).toFixed(3))))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="loan-b-years" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Scenario B Term
                        </label>
                        <input
                          id="loan-b-years"
                          type="number"
                          min={1}
                          max={40}
                          step={1}
                          value={yearsB}
                          onChange={(e) => setYearsB(clampSafeNumber(e.target.value, 1, 40, 15))}
                          className="w-12 text-right bg-transparent text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 focus:outline-none tabular-nums"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 p-1">
                        {[30, 20, 15].map((termYr) => (
                          <button
                            key={termYr}
                            type="button"
                            onClick={() => setYearsB(termYr)}
                            className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                              yearsB === termYr
                                ? 'bg-emerald-500 text-slate-950 font-bold'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {termYr}Y
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Extra Monthly Payment Card (Shown in Single Loan Mode) */
              <div className="liquid-well rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Extra Monthly Payment</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{fmtWhole(extraPrincipal)} / mo
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Extra Monthly Payment Slider"
                  min={0}
                  max={2500}
                  step={25}
                  value={Math.min(2500, extraPrincipal)}
                  onChange={(e) => setExtraPrincipal(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                  <span>{sym}0</span>
                  <span>+{sym}1,000</span>
                  <span>+{sym}2,500</span>
                </div>
              </div>
            )}

            {/* Collapsible Property Tax, Insurance & HOA */}
            <div className="liquid-well rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setEscrowOpen((prev) => !prev)}
                className="w-full px-3.5 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Property Tax, Insurance &amp; HOA</span>
                </span>
                <span className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                  <span>{fmtWhole(totalEscrow)}/mo</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      escrowOpen ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              {escrowOpen && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Property Tax/mo
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={25}
                      value={monthlyTax}
                      onChange={(e) =>
                        setMonthlyTax(clampSafeNumber(e.target.value, 0, 50000, 0))
                      }
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2 py-1.5 text-xs font-mono text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Insurance/mo
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={15}
                      value={monthlyInsurance}
                      onChange={(e) =>
                        setMonthlyInsurance(clampSafeNumber(e.target.value, 0, 20000, 0))
                      }
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2 py-1.5 text-xs font-mono text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      HOA Fee/mo
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={15}
                      value={monthlyHoa}
                      onChange={(e) =>
                        setMonthlyHoa(clampSafeNumber(e.target.value, 0, 20000, 0))
                      }
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 px-2 py-1.5 text-xs font-mono text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons Row: Save Result | Download CSV | Yearly Table */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl liquid-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {savedToast ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <BookmarkPlus className="w-3.5 h-3.5" />
                )}
                <span>{savedToast ? 'Saved' : 'Save Result'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl liquid-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSchedule((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{showSchedule ? 'Hide Schedule' : 'Yearly Schedule'}</span>
              </button>
            </div>
          </div>

          {/* LOAN PAYOFF TIMELINE CARD */}
          <div className="liquid-glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Loan Payoff Timeline
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                <span>
                  {compareMode
                    ? `A: ${years} yrs vs B: ${yearsB} yrs`
                    : accelerated.monthsSaved > 0
                    ? `Paid off ${Math.floor(accelerated.monthsSaved / 12)}y ${accelerated.monthsSaved % 12}m early`
                    : `Paid off in ${years} yrs`}
                </span>
              </span>
            </div>

            <div className="liquid-well rounded-xl p-3">
              <svg
                viewBox="0 0 380 86"
                className="w-full h-20 overflow-visible"
                role="img"
                aria-label="Loan Payoff Timeline Chart"
              >
                <defs>
                  <linearGradient id="equityEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Baseline 30Y dashed diagonal */}
                <path
                  d="M 20 72 Q 190 52 360 16"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-slate-400/50 dark:text-slate-600"
                  strokeWidth="1.5"
                />
                {/* Accelerated shaded area */}
                <path
                  d={`M 20 72 Q ${Math.round(accelX * 0.55)} 40 ${accelX} 14 L ${accelX} 72 Z`}
                  fill="url(#equityEmeraldGrad)"
                />
                {/* Accelerated solid emerald curve */}
                <path
                  d={`M 20 72 Q ${Math.round(accelX * 0.55)} 40 ${accelX} 14`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Payoff milestone vertical marker & dot */}
                <line
                  x1={accelX}
                  y1={14}
                  x2={accelX}
                  y2={72}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeOpacity="0.5"
                />
                <circle cx={accelX} cy={14} r={4.5} fill="#10b981" />
              </svg>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-slate-500 dark:text-slate-400">Start (Year 0)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Loan Paid Off: {acceleratedPayoffLabel}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Year {years} ({baselinePayoffLabel.split(' ')[1]})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 COLS): MONTHLY PAYMENT & PLAN COMPARISON */}
        <div className="lg:col-span-7 liquid-glass rounded-2xl p-6 sm:p-8 space-y-7">
          {/* Top Monthly Payment Header + Interest Saved Box */}
          {compareMode ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Side-by-Side Monthly Payment Comparison
                </div>
                <div className="liquid-well rounded-xl px-3.5 py-2 border border-emerald-500/30 bg-emerald-500/5 inline-flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {loanComparison.lowerInterestScenario === 'B'
                      ? 'Scenario B Saves Interest:'
                      : loanComparison.lowerInterestScenario === 'A'
                      ? 'Scenario A Saves Interest:'
                      : 'Interest Difference:'}
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {fmtDec(loanComparison.interestSavings)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="liquid-well rounded-2xl p-4 space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Scenario A Monthly ({rate}% · {years}Y)
                  </div>
                  <div
                    data-testid="loan-monthly-emi"
                    className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums"
                  >
                    {fmtDec(result.monthlyEmi)}
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    With Taxes &amp; Fees: {fmtDec(baselineMonthlyOutlay)}/mo
                  </div>
                </div>

                <div className="liquid-well rounded-2xl p-4 space-y-1 border border-emerald-500/30">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Scenario B Monthly ({rateB}% · {yearsB}Y)
                  </div>
                  <div
                    data-testid="loan-b-monthly-emi"
                    className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums"
                  >
                    {fmtDec(resultB.monthlyEmi)}
                  </div>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                    {emiDiff <= 0
                      ? `${fmtDec(Math.abs(emiDiff))}/mo less than Scenario A`
                      : `+${fmtDec(emiDiff)}/mo more than Scenario A`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Monthly Loan Payment (Principal &amp; Interest)
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <div
                    data-testid="loan-monthly-emi"
                    className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums"
                  >
                    {fmtDec(result.monthlyEmi)}
                  </div>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                    / month
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                  Total Monthly Cost (with Taxes, Insurance &amp; Extra):{' '}
                  <strong className="text-slate-900 dark:text-slate-200">
                    {fmtDec(activeOptimizedMonthlyOutlay)}
                  </strong>{' '}
                  · Taxes &amp; Fees: {fmtDec(totalEscrow)}
                </div>
              </div>

              {/* Interest Saved Callout */}
              <div className="liquid-well rounded-2xl px-4 py-3 border border-emerald-500/30 bg-emerald-500/5 shrink-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Total Interest Saved
                  </div>
                  <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {fmtDec(activeInterestSaved)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4-Segment Stacked Proportion Bar */}
          <div className="space-y-3">
            <div
              role="img"
              aria-label={`Principal and Interest ${pAndIPct}%, Property Tax ${taxPct}%, Insurance ${insPct}%, HOA ${hoaPct}%`}
              className="h-3 w-full rounded-full overflow-hidden bg-slate-200/80 dark:bg-slate-800/90 flex gap-0.5 p-0.5"
            >
              <div
                style={{ width: `${pAndIPct}%` }}
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-150"
                title={`Principal & Interest: ${pAndIPct}%`}
              />
              <div
                style={{ width: `${taxPct}%` }}
                className="bg-sky-500 h-full transition-all duration-150"
                title={`Property Tax: ${taxPct}%`}
              />
              <div
                style={{ width: `${insPct}%` }}
                className="bg-indigo-400 h-full transition-all duration-150"
                title={`Home Insurance: ${insPct}%`}
              />
              <div
                style={{ width: `${hoaPct}%` }}
                className="bg-slate-500 h-full rounded-r-full transition-all duration-150"
                title={`HOA Fee: ${hoaPct}%`}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
                <span className="truncate">Loan P&amp;I ({pAndIPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 shrink-0" />
                <span className="truncate">Property Tax ({taxPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400 shrink-0" />
                <span className="truncate">Insurance ({insPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 shrink-0" />
                <span className="truncate">HOA Fee ({hoaPct}%)</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Plan Cards: Scenario A vs Scenario B / Extra Payments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scenario A Card */}
            <div className="liquid-well rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {compareMode ? 'Scenario A' : 'Standard Plan'}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {rate}% · {years} Yrs
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Monthly P&amp;I Payment</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    {fmtDec(result.monthlyEmi)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Total (with Taxes)</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    {fmtDec(baselineMonthlyOutlay)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Total Interest Paid</span>
                  <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                    {fmtDec(result.totalInterest)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Total Loan Cost (P + I)</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    {fmtDec(result.totalPayment)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 dark:text-slate-400">Paid Off By</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {baselinePayoffLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario B / Extra Payments Card */}
            <div className="liquid-well rounded-2xl p-5 space-y-4 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {compareMode ? 'Scenario B' : 'With Extra Payments'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500 text-slate-950">
                  {compareMode ? `${rateB}% · ${yearsB} Yrs` : 'Faster Payoff'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Monthly P&amp;I Payment</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    {fmtDec(compareMode ? resultB.monthlyEmi : accelerated.effectiveMonthlyPAndI)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Total (with Taxes)</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    {fmtDec(activeOptimizedMonthlyOutlay)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Total Interest Paid</span>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {fmtDec(compareMode ? resultB.totalInterest : accelerated.totalInterest)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Total Loan Cost (P + I)</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    {fmtDec(compareMode ? resultB.totalPayment : accelerated.totalCostPAndI)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 dark:text-slate-400">Paid Off By</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {acceleratedPayoffLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Delta Breakdown Table when Comparison Mode is active */}
          {compareMode && (
            <div className="liquid-well rounded-2xl p-4 overflow-x-auto">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <span>Side-by-Side Comparison Summary</span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  {interestDiff <= 0
                    ? `Scenario B saves ${fmtWhole(Math.abs(interestDiff))} in interest`
                    : `Scenario A saves ${fmtWhole(Math.abs(interestDiff))} in interest`}
                </span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">Metric</th>
                    <th className="py-2 px-3 font-medium text-right">Scenario A</th>
                    <th className="py-2 px-3 font-medium text-right">Scenario B</th>
                    <th className="py-2 pl-3 font-medium text-right">Difference (B vs A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/60 font-mono tabular-nums">
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Loan Amount</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(principal)}</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(principalB)}</td>
                    <td className="py-2 pl-3 text-right text-slate-500">
                      {principalB - principal === 0
                        ? 'Same'
                        : principalB - principal > 0
                        ? `+${fmtWhole(principalB - principal)}`
                        : `-${fmtWhole(Math.abs(principalB - principal))}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Interest Rate</td>
                    <td className="py-2 px-3 text-right">{rate}%</td>
                    <td className="py-2 px-3 text-right">{rateB}%</td>
                    <td className={`py-2 pl-3 text-right font-semibold ${rateB <= rate ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {rateB - rate >= 0 ? `+${(rateB - rate).toFixed(3)}%` : `${(rateB - rate).toFixed(3)}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Monthly Payment (P&amp;I)</td>
                    <td className="py-2 px-3 text-right">{fmtDec(result.monthlyEmi)}</td>
                    <td className="py-2 px-3 text-right">{fmtDec(resultB.monthlyEmi)}</td>
                    <td className={`py-2 pl-3 text-right font-semibold ${emiDiff <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {emiDiff >= 0 ? `+${fmtDec(emiDiff)}/mo` : `-${fmtDec(Math.abs(emiDiff))}/mo`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Total Interest</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(result.totalInterest)}</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(resultB.totalInterest)}</td>
                    <td className={`py-2 pl-3 text-right font-bold ${interestDiff <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {interestDiff >= 0 ? `+${fmtWhole(interestDiff)}` : `-${fmtWhole(Math.abs(interestDiff))}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Bi-Weekly & Share Bar */}
          <div className="liquid-well rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={biWeeklyCadence}
                onChange={(e) => setBiWeeklyCadence(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
              <span>Pay every 2 weeks (26 half-payments a year)</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShareLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{sharedToast ? 'Link Copied' : 'Share Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                aria-label="Copy Loan EMI Summary"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToast ? 'Copied' : 'Copy Summary'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Yearly Amortization Schedule */}
      {showSchedule && result.yearlySchedule.length > 0 && (
        <div className="liquid-glass rounded-2xl p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Year-by-Year Payoff Schedule ({result.yearlySchedule.length} Years)
            </h3>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-well text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Year</th>
                <th className="py-2.5 px-4 font-medium text-right">Starting Balance</th>
                <th className="py-2.5 px-4 font-medium text-right">Principal Paid</th>
                <th className="py-2.5 px-4 font-medium text-right">Interest Paid</th>
                <th className="py-2.5 pl-4 font-medium text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/70 font-mono tabular-nums">
              {result.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                  <td className="py-2 pr-4 font-semibold text-slate-900 dark:text-white">
                    Year {row.year}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-300">
                    {fmtWhole(row.openingBalance)}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {fmtWhole(row.principalPaid)}
                  </td>
                  <td className="py-2 px-4 text-right text-amber-600 dark:text-amber-400">
                    {fmtWhole(row.interestPaid)}
                  </td>
                  <td className="py-2 pl-4 text-right font-medium text-slate-900 dark:text-white">
                    {fmtWhole(row.closingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * 2. Finance: Compound Interest Calculator (with Side-by-Side Scenario Comparison Mode)
 */
export const CompoundInterestCalculator: React.FC<CalculatorActionProps> = ({
  currency = 'USD',
  onSaveCalculation,
}) => {
  const initialCiQuery =
    typeof window !== 'undefined'
      ? parseSafeNumericQueryParams(window.location.search, {
          init: { min: 0, max: 100000000, fallback: 10000 },
          pmt: { min: 0, max: 1000000, fallback: 300 },
          r: { min: 0, max: 50, fallback: 8 },
          y: { min: 1, max: 60, fallback: 15 },
          cmp: { min: 0, max: 1, fallback: 0 },
          initb: { min: 0, max: 100000000, fallback: 10000 },
          pmtb: { min: 0, max: 1000000, fallback: 300 },
          rb: { min: 0, max: 50, fallback: 10 },
          yb: { min: 1, max: 60, fallback: 15 },
        })
      : {
          init: 10000,
          pmt: 300,
          r: 8,
          y: 15,
          cmp: 0,
          initb: 10000,
          pmtb: 300,
          rb: 10,
          yb: 15,
        };

  const [initialDeposit, setInitialDeposit] = useState<number>(initialCiQuery.init);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(initialCiQuery.pmt);
  const [annualRate, setAnnualRate] = useState<number>(initialCiQuery.r);
  const [years, setYears] = useState<number>(initialCiQuery.y);
  const [frequency, setFrequency] = useState<number>(12);

  // Side-by-Side Scenario B state for Comparison Mode
  const [compareMode, setCompareMode] = useState<boolean>(initialCiQuery.cmp === 1);
  const [initialDepositB, setInitialDepositB] = useState<number>(initialCiQuery.initb);
  const [monthlyContributionB, setMonthlyContributionB] = useState<number>(initialCiQuery.pmtb);
  const [annualRateB, setAnnualRateB] = useState<number>(initialCiQuery.rb);
  const [yearsB, setYearsB] = useState<number>(initialCiQuery.yb);
  const [frequencyB, setFrequencyB] = useState<number>(12);

  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [sharedToast, setSharedToast] = useState<boolean>(false);

  const sym = getCurrencySymbol(currency);
  const fmtDec = (v: number) => formatCurrencyValue(v, currency, 2);
  const fmtWhole = (v: number) => formatCurrencyValue(v, currency, 0);

  const comparison = compareCompoundScenarios(
    {
      initialPrincipal: initialDeposit,
      monthlyContribution,
      annualRatePercent: annualRate,
      years,
      compoundingFrequency: frequency,
    },
    {
      initialPrincipal: initialDepositB,
      monthlyContribution: monthlyContributionB,
      annualRatePercent: annualRateB,
      years: yearsB,
      compoundingFrequency: frequencyB,
    }
  );

  const result = comparison.scenarioA;
  const resultB = comparison.scenarioB;

  const contribPct =
    result.futureValue > 0 ? (result.totalContributions / result.futureValue) * 100 : 100;
  const interestPct =
    result.futureValue > 0 ? (result.totalInterestEarned / result.futureValue) * 100 : 0;

  const handleReset = () => {
    setInitialDeposit(10000);
    setMonthlyContribution(300);
    setAnnualRate(8);
    setYears(15);
    setFrequency(12);
    setInitialDepositB(10000);
    setMonthlyContributionB(300);
    setAnnualRateB(10);
    setYearsB(15);
    setFrequencyB(12);
  };

  const handleSave = () => {
    onSaveCalculation?.({
      calculatorId: 'compound-interest',
      calculatorTitle: 'Compound Interest',
      primaryResult: fmtWhole(result.futureValue),
      detailSummary: compareMode
        ? `A (${annualRate}%): ${fmtWhole(result.futureValue)} vs B (${annualRateB}%): ${fmtWhole(resultB.futureValue)}`
        : `${fmtWhole(initialDeposit)} + ${fmtWhole(monthlyContribution)}/mo @ ${annualRate}% (${years}y)`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  const handleShareLink = () => {
    const url = buildShareableCalculatorUrl(
      'compound-interest',
      compareMode
        ? {
            init: initialDeposit,
            pmt: monthlyContribution,
            r: annualRate,
            y: years,
            cmp: 1,
            initb: initialDepositB,
            pmtb: monthlyContributionB,
            rb: annualRateB,
            yb: yearsB,
          }
        : {
            init: initialDeposit,
            pmt: monthlyContribution,
            r: annualRate,
            y: years,
          }
    );
    navigator.clipboard?.writeText(url);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 1800);
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      `omnicalc-compound-growth-${years}yr.csv`,
      ['Year', `Total Deposits (${currency})`, `Interest Earned (${currency})`, `Ending Balance (${currency})`],
      result.yearlyBreakdown.map((r) => [
        `Year ${r.year}`,
        Math.round(r.totalContributions),
        Math.round(r.interestEarned),
        Math.round(r.endBalance),
      ])
    );
  };

  const maxChartFutureValue = Math.max(
    1,
    result.futureValue,
    compareMode ? resultB.futureValue : 0
  );

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Savings &amp; Investment Details
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Segmented Mode Switcher: Single Scenario vs Comparison Mode (A vs B) */}
          <div
            role="group"
            aria-label="Compound Interest Calculation Mode"
            className="grid grid-cols-2 gap-1.5 p-1 rounded-xl liquid-well"
          >
            <button
              type="button"
              onClick={() => setCompareMode(false)}
              className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !compareMode
                  ? 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Single Scenario</span>
            </button>
            <button
              type="button"
              data-testid="toggle-compare-compound"
              onClick={() => setCompareMode((prev) => !prev)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                compareMode
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Comparison Mode (A vs B)</span>
            </button>
          </div>

          {/* Scenario A Inputs */}
          <div className="space-y-4">
            {compareMode && (
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Scenario A (Baseline Plan)
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="ci-initial"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {compareMode ? 'Scenario A Starting Deposit' : 'Starting Deposit'} ({sym})
                </label>
                <input
                  id="ci-initial"
                  type="number"
                  min={0}
                  step={500}
                  value={initialDeposit}
                  onChange={(e) =>
                    setInitialDeposit(clampSafeNumber(e.target.value, 0, 100000000, 0))
                  }
                  className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="ci-monthly"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {compareMode ? 'Scenario A Monthly Deposit' : 'Monthly Deposit'} ({sym})
                </label>
                <input
                  id="ci-monthly"
                  type="number"
                  min={0}
                  step={50}
                  value={monthlyContribution}
                  onChange={(e) =>
                    setMonthlyContribution(clampSafeNumber(e.target.value, 0, 1000000, 0))
                  }
                  className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="ci-rate"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {compareMode ? 'Scenario A Return (%)' : 'Yearly Return (%)'}
                </label>
                <input
                  id="ci-rate"
                  type="number"
                  min={0}
                  max={50}
                  step={0.25}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(clampSafeNumber(e.target.value, 0, 50, 8))}
                  className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="ci-years"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {compareMode ? 'Scenario A Years' : 'Years to Grow'}
                </label>
                <input
                  id="ci-years"
                  type="number"
                  min={1}
                  max={60}
                  step={1}
                  value={years}
                  onChange={(e) => setYears(clampSafeNumber(e.target.value, 1, 60, 15))}
                  className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="ci-freq"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Compound Frequency
                </label>
                <select
                  id="ci-freq"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full rounded-xl liquid-well px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value={365}>Daily (365/yr)</option>
                  <option value={12}>Monthly (12/yr)</option>
                  <option value={4}>Quarterly (4/yr)</option>
                  <option value={1}>Yearly (1/yr)</option>
                </select>
              </div>
            </div>
          </div>

          {/* INLINE SCENARIO B CONTROLS WHEN COMPARISON MODE IS ACTIVE */}
          {compareMode ? (
            <div
              data-testid="compound-comparison-panel"
              className="rounded-2xl liquid-well p-4 border border-emerald-500/40 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Scenario B (Comparison Plan)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInitialDepositB(initialDeposit);
                    setMonthlyContributionB(monthlyContribution);
                    setAnnualRateB(Math.min(50, Number((annualRate + 2).toFixed(2))));
                    setYearsB(years);
                    setFrequencyB(frequency);
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
                >
                  Copy A &amp; +2% Return
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setInitialDepositB(initialDeposit);
                    setMonthlyContributionB(monthlyContribution);
                    setAnnualRateB(Math.min(50, Number((annualRate + 2).toFixed(2))));
                    setYearsB(years);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                >
                  +2% Higher Return
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInitialDepositB(initialDeposit);
                    setMonthlyContributionB(monthlyContribution + 200);
                    setAnnualRateB(annualRate);
                    setYearsB(years);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                >
                  +{sym}200/mo Deposit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInitialDepositB(initialDeposit);
                    setMonthlyContributionB(monthlyContribution);
                    setAnnualRateB(annualRate);
                    setYearsB(Math.min(60, years + 5));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                >
                  +5 Extra Years
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="ci-b-initial" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Scenario B Starting Deposit ({sym})
                  </label>
                  <input
                    id="ci-b-initial"
                    type="number"
                    min={0}
                    step={500}
                    value={initialDepositB}
                    onChange={(e) => setInitialDepositB(clampSafeNumber(e.target.value, 0, 100000000, 0))}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ci-b-monthly" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Scenario B Monthly Deposit ({sym})
                  </label>
                  <input
                    id="ci-b-monthly"
                    type="number"
                    min={0}
                    step={50}
                    value={monthlyContributionB}
                    onChange={(e) => setMonthlyContributionB(clampSafeNumber(e.target.value, 0, 1000000, 0))}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="ci-b-rate" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Scenario B Return (%)
                  </label>
                  <input
                    id="ci-b-rate"
                    type="number"
                    min={0}
                    max={50}
                    step={0.25}
                    value={annualRateB}
                    onChange={(e) => setAnnualRateB(clampSafeNumber(e.target.value, 0, 50, 10))}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ci-b-years" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Scenario B Years
                  </label>
                  <input
                    id="ci-b-years"
                    type="number"
                    min={1}
                    max={60}
                    step={1}
                    value={yearsB}
                    onChange={(e) => setYearsB(clampSafeNumber(e.target.value, 1, 60, 15))}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ci-b-freq" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Compounding
                  </label>
                  <select
                    id="ci-b-freq"
                    value={frequencyB}
                    onChange={(e) => setFrequencyB(Number(e.target.value))}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value={365}>Daily (365/yr)</option>
                    <option value={12}>Monthly (12/yr)</option>
                    <option value={4}>Quarterly (4/yr)</option>
                    <option value={1}>Yearly (1/yr)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Time Period Slider</span>
                <span className="font-mono tabular-nums">{years} Years</span>
              </div>
              <input
                type="range"
                aria-label="Investment Horizon Years Slider"
                min={1}
                max={45}
                value={Math.min(45, years)}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Output Summary */}
        <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200/70 dark:lg:border-slate-800 lg:pl-8">
          {compareMode ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Side-by-Side Future Balance
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {savedToast ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                    <span>{savedToast ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{sharedToast ? 'Copied' : 'Share'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="liquid-well rounded-2xl p-4 space-y-1">
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Scenario A ({annualRate}% · {years}Y)
                  </div>
                  <div
                    data-testid="compound-future-value"
                    className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums"
                  >
                    {fmtDec(result.futureValue)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Interest: +{fmtWhole(result.totalInterestEarned)}
                  </div>
                </div>

                <div className="liquid-well rounded-2xl p-4 space-y-1 border border-emerald-500/30">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Scenario B ({annualRateB}% · {yearsB}Y)
                  </div>
                  <div
                    data-testid="compound-b-future-value"
                    className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums"
                  >
                    {fmtDec(resultB.futureValue)}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {comparison.futureValueDiff >= 0
                      ? `+${fmtWhole(comparison.futureValueDiff)} vs Scenario A`
                      : `-${fmtWhole(Math.abs(comparison.futureValueDiff))} vs Scenario A`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Future Balance After {years} Years
                </div>
                <div
                  data-testid="compound-future-value"
                  className="text-3xl sm:text-4xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums"
                >
                  {fmtDec(result.futureValue)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {savedToast ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  <span>{savedToast ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{sharedToast ? 'Copied' : 'Share'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          )}

          {compareMode ? (
            /* Side-by-Side Comparison Table in Comparison Mode */
            <div className="liquid-well rounded-2xl p-4 overflow-x-auto space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Scenario A vs Scenario B Breakdown
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {comparison.higherBalanceScenario === 'B'
                    ? `Scenario B earns +${fmtWhole(comparison.extraWealth)} more`
                    : comparison.higherBalanceScenario === 'A'
                    ? `Scenario A earns +${fmtWhole(comparison.extraWealth)} more`
                    : 'Both scenarios produce the same balance'}
                </span>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">Metric</th>
                    <th className="py-2 px-3 font-medium text-right">Scenario A</th>
                    <th className="py-2 px-3 font-medium text-right">Scenario B</th>
                    <th className="py-2 pl-3 font-medium text-right">Difference (B vs A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/60 font-mono tabular-nums">
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Yearly Return (APY)</td>
                    <td className="py-2 px-3 text-right">{annualRate}% ({result.effectiveAnnualYield.toFixed(2)}%)</td>
                    <td className="py-2 px-3 text-right">{annualRateB}% ({resultB.effectiveAnnualYield.toFixed(2)}%)</td>
                    <td className="py-2 pl-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {annualRateB - annualRate >= 0
                        ? `+${(annualRateB - annualRate).toFixed(2)}%`
                        : `${(annualRateB - annualRate).toFixed(2)}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Total Deposits</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(result.totalContributions)}</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(resultB.totalContributions)}</td>
                    <td className="py-2 pl-3 text-right text-slate-500">
                      {comparison.totalContributionsDiff === 0
                        ? 'Same'
                        : comparison.totalContributionsDiff > 0
                        ? `+${fmtWhole(comparison.totalContributionsDiff)}`
                        : `-${fmtWhole(Math.abs(comparison.totalContributionsDiff))}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-sans text-slate-600 dark:text-slate-300">Compound Interest</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(result.totalInterestEarned)}</td>
                    <td className="py-2 px-3 text-right">{fmtWhole(resultB.totalInterestEarned)}</td>
                    <td className={`py-2 pl-3 text-right font-semibold ${comparison.totalInterestDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {comparison.totalInterestDiff >= 0
                        ? `+${fmtWhole(comparison.totalInterestDiff)}`
                        : `-${fmtWhole(Math.abs(comparison.totalInterestDiff))}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-sans font-semibold text-slate-900 dark:text-white">Future Balance</td>
                    <td className="py-2 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{fmtWhole(result.futureValue)}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{fmtWhole(resultB.futureValue)}</td>
                    <td className={`py-2 pl-3 text-right font-bold ${comparison.futureValueDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {comparison.futureValueDiff >= 0
                        ? `+${fmtWhole(comparison.futureValueDiff)}`
                        : `-${fmtWhole(Math.abs(comparison.futureValueDiff))}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Your Total Deposits</div>
                  <div className="text-base font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {fmtWhole(result.totalContributions)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Interest Earned</div>
                  <div className="text-base font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                    +{fmtWhole(result.totalInterestEarned)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Effective Yearly Yield (APY)</div>
                  <div className="text-base font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {result.effectiveAnnualYield.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Composition Bar */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Balance Breakdown</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {contribPct.toFixed(1)}% Deposits · {interestPct.toFixed(1)}% Interest
                  </span>
                </div>
                <div className="h-5 w-full rounded-xl overflow-hidden bg-slate-200/70 dark:bg-slate-800 flex">
                  <div
                    style={{ width: `${contribPct}%` }}
                    className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-150"
                  />
                  <div
                    style={{ width: `${interestPct}%` }}
                    className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all duration-150"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-indigo-600 dark:bg-indigo-500 inline-block" />
                    <span>Total Deposits ({fmtWhole(result.totalContributions)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-400 inline-block" />
                    <span>Interest Earned ({fmtWhole(result.totalInterestEarned)})</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Growth Milestone Bars (Supports Dual-Bar Scenario A vs B in Comparison Mode) */}
      <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {compareMode
              ? 'Year-by-Year Balance Comparison (Scenario A vs Scenario B)'
              : 'Year-by-Year Balance Growth'}
          </h3>
          {compareMode && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" />
                <span>Scenario A ({annualRate}%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>Scenario B ({annualRateB}%)</span>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 items-end h-36 pt-4 px-3 liquid-well rounded-xl">
          {result.yearlyBreakdown
            .filter(
              (_, idx, arr) =>
                arr.length <= 10 ||
                (idx + 1) % Math.ceil(arr.length / 10) === 0 ||
                idx === arr.length - 1
            )
            .slice(0, 10)
            .map((item) => {
              const heightPctA = Math.max(
                8,
                (item.endBalance / maxChartFutureValue) * 100
              );
              const matchingB =
                resultB.yearlyBreakdown.find((b) => b.year === item.year) ??
                resultB.yearlyBreakdown[resultB.yearlyBreakdown.length - 1];
              const heightPctB = matchingB
                ? Math.max(8, (matchingB.endBalance / maxChartFutureValue) * 100)
                : 8;

              return (
                <div
                  key={item.year}
                  className="flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <div className="w-full flex items-end justify-center gap-1 h-24 bg-slate-200/60 dark:bg-slate-800/50 rounded-t-sm overflow-hidden px-0.5">
                    <div
                      style={{ height: `${heightPctA}%` }}
                      className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-sm transition-all duration-150"
                      title={`Year ${item.year} (Scenario A): ${fmtWhole(item.endBalance)}`}
                    />
                    {compareMode && (
                      <div
                        style={{ height: `${heightPctB}%` }}
                        className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-sm transition-all duration-150"
                        title={`Year ${item.year} (Scenario B): ${fmtWhole(matchingB?.endBalance ?? 0)}`}
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                    Y{item.year}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Finance: SIP & Retirement Savings Calculator
 */
export const SipRetirementCalculator: React.FC<CalculatorActionProps> = ({
  currency = 'USD',
  onSaveCalculation,
}) => {
  const [monthlySip, setMonthlySip] = useState<number>(500);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(3);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const sym = getCurrencySymbol(currency);
  const fmtWhole = (v: number) => formatCurrencyValue(v, currency, 0);

  const result = calculateSipRetirement(
    monthlySip,
    stepUpPercent,
    expectedReturn,
    inflationRate,
    tenureYears
  );

  const handleSave = () => {
    onSaveCalculation?.({
      calculatorId: 'sip-retirement',
      calculatorTitle: 'Retirement & SIP Savings',
      primaryResult: `${fmtWhole(result.nominalCorpus)} Total`,
      detailSummary: `Today's Value: ${fmtWhole(result.inflationAdjustedCorpus)} · Monthly Income: ${fmtWhole(result.safeMonthlyWithdrawalReal)}/mo`,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      `omnicalc-sip-retirement-${tenureYears}yr.csv`,
      [
        'Year',
        `Monthly Investment (${currency})`,
        `Total Invested (${currency})`,
        `Total Savings (${currency})`,
        `Value in Today's Money (${currency})`,
      ],
      result.yearlySchedule.map((r) => [
        `Year ${r.year}`,
        Math.round(r.monthlySipThatYear),
        Math.round(r.totalInvested),
        Math.round(r.nominalCorpus),
        Math.round(r.realCorpus),
      ])
    );
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Investment &amp; Retirement Plan
            </h2>
            <button
              type="button"
              onClick={() => {
                setMonthlySip(500);
                setStepUpPercent(10);
                setExpectedReturn(12);
                setInflationRate(3);
                setTenureYears(20);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sip-monthly" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Starting Monthly Investment ({sym})
              </label>
              <input
                id="sip-monthly"
                type="number"
                min={10}
                step={50}
                value={monthlySip}
                onChange={(e) => setMonthlySip(clampSafeNumber(e.target.value, 0, 1000000, 500))}
                className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sip-stepup" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Yearly Increase in Monthly Savings (%)
              </label>
              <input
                id="sip-stepup"
                type="number"
                min={0}
                max={50}
                step={1}
                value={stepUpPercent}
                onChange={(e) => setStepUpPercent(clampSafeNumber(e.target.value, 0, 50, 10))}
                className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sip-return" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Expected Yearly Return (%)
              </label>
              <input
                id="sip-return"
                type="number"
                min={1}
                max={35}
                step={0.5}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(clampSafeNumber(e.target.value, 0, 35, 12))}
                className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sip-inflation" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Yearly Inflation (%)
              </label>
              <input
                id="sip-inflation"
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={inflationRate}
                onChange={(e) => setInflationRate(clampSafeNumber(e.target.value, 0, 20, 3))}
                className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sip-years" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Years to Invest
              </label>
              <input
                id="sip-years"
                type="number"
                min={1}
                max={50}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(clampSafeNumber(e.target.value, 1, 50, 20))}
                className="w-full rounded-xl liquid-well px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200/70 dark:lg:border-slate-800 lg:pl-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Retirement Savings ({tenureYears} Years)
              </div>
              <div
                data-testid="sip-nominal-corpus"
                className="text-3xl sm:text-4xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums"
              >
                {fmtWhole(result.nominalCorpus)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {savedToast ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{savedToast ? 'Saved' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-well text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70 dark:border-slate-800">
            <div className="liquid-well rounded-xl p-3.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Value in Today&rsquo;s Money (After {inflationRate}% Inflation)
              </div>
              <div
                data-testid="sip-real-corpus"
                className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5"
              >
                {fmtWhole(result.inflationAdjustedCorpus)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Today&rsquo;s buying power
              </div>
            </div>

            <div className="liquid-well rounded-xl p-3.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Safe Monthly Retirement Income (4% Rule)
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {fmtWhole(result.safeMonthlyWithdrawalReal)}/mo
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Before inflation: {fmtWhole(result.safeMonthlyWithdrawalNominal)}/mo
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans">Total Money Put In</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                {fmtWhole(result.totalInvested)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans">Total Investment Gain</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{fmtWhole(result.nominalWealthGained)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
