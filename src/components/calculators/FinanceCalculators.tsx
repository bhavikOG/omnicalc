import React, { useState } from 'react';
import { calculateLoanEmi, calculateCompoundInterest } from '../../utils/calculators';
import { RotateCcw } from 'lucide-react';

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(val);

const formatWholeCurrency = (val: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);

/**
 * 1. Finance: Loan EMI / Mortgage Calculator
 */
export const LoanEmiCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(250000);
  const [rate, setRate] = useState<number>(6.5);
  const [years, setYears] = useState<number>(20);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const result = calculateLoanEmi(principal, rate, years);

  const handleReset = () => {
    setPrincipal(250000);
    setRate(6.5);
    setYears(20);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Loan Parameters
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="loan-principal"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Loan Amount ($)
              </label>
              <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatWholeCurrency(principal)}
              </span>
            </div>
            <input
              id="loan-principal"
              type="number"
              min={1000}
              max={10000000}
              step={1000}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
            />
            <input
              type="range"
              aria-label="Loan Amount Slider"
              min={5000}
              max={1500000}
              step={5000}
              value={Math.min(1500000, principal)}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Annual Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="loan-rate"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Annual Interest Rate (% p.a.)
              </label>
              <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {rate.toFixed(2)}%
              </span>
            </div>
            <input
              id="loan-rate"
              type="number"
              min={0}
              max={40}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
            />
            <input
              type="range"
              aria-label="Annual Interest Rate Slider"
              min={0.5}
              max={20}
              step={0.1}
              value={Math.min(20, rate)}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Loan Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="loan-years"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Loan Tenure (Years)
              </label>
              <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {years} {years === 1 ? 'Year' : 'Years'} ({Math.round(years * 12)} mos)
              </span>
            </div>
            <input
              id="loan-years"
              type="number"
              min={1}
              max={40}
              step={1}
              value={years}
              onChange={(e) => setYears(Math.max(1, Math.min(40, Number(e.target.value))))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
            />
            <input
              type="range"
              aria-label="Loan Tenure Slider"
              min={1}
              max={35}
              step={1}
              value={Math.min(35, years)}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Instant Output & Visual Breakdown */}
        <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Estimated Monthly EMI Payment
            </div>
            <div
              data-testid="loan-monthly-emi"
              className="text-3xl sm:text-4xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums"
            >
              {formatCurrency(result.monthlyEmi)}
              <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400 ml-2">
                / month
              </span>
            </div>
          </div>

          {/* Summary Stat Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Principal Amount</div>
              <div className="text-base font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatWholeCurrency(result.totalPrincipal)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Interest</div>
              <div className="text-base font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                {formatWholeCurrency(result.totalInterest)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Payable</div>
              <div className="text-base font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatWholeCurrency(result.totalPayment)}
              </div>
            </div>
          </div>

          {/* Visual Breakdown of Principal vs Interest */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">
                Principal vs. Interest Breakdown
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {result.principalPercentage.toFixed(1)}% Principal · {result.interestPercentage.toFixed(1)}% Interest
              </span>
            </div>

            {/* Stacked Visual Proportion Bar */}
            <div
              role="img"
              aria-label={`Principal ${result.principalPercentage.toFixed(1)}% versus Interest ${result.interestPercentage.toFixed(1)}%`}
              className="h-5 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex"
            >
              <div
                style={{ width: `${result.principalPercentage}%` }}
                className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-150"
                title={`Principal: ${formatWholeCurrency(result.totalPrincipal)}`}
              />
              <div
                style={{ width: `${result.interestPercentage}%` }}
                className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-150"
                title={`Interest: ${formatWholeCurrency(result.totalInterest)}`}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 dark:bg-indigo-500 inline-block" />
                <span>Principal ({formatWholeCurrency(result.totalPrincipal)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-500 dark:bg-amber-400 inline-block" />
                <span>Interest ({formatWholeCurrency(result.totalInterest)})</span>
              </div>
            </div>
          </div>

          {/* Toggle Amortization Table */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowSchedule((prev) => !prev)}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {showSchedule
                ? 'Hide Yearly Amortization Schedule'
                : `View Yearly Amortization Schedule (${result.yearlySchedule.length} Years)`}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Amortization Table */}
      {showSchedule && result.yearlySchedule.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Year</th>
                <th className="py-2.5 px-4 font-medium text-right">Opening Balance</th>
                <th className="py-2.5 px-4 font-medium text-right">Principal Paid</th>
                <th className="py-2.5 px-4 font-medium text-right">Interest Paid</th>
                <th className="py-2.5 pl-4 font-medium text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono tabular-nums">
              {result.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 pr-4 font-semibold text-slate-900 dark:text-white">
                    Year {row.year}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-300">
                    {formatWholeCurrency(row.openingBalance)}
                  </td>
                  <td className="py-2 px-4 text-right text-indigo-600 dark:text-indigo-400">
                    {formatWholeCurrency(row.principalPaid)}
                  </td>
                  <td className="py-2 px-4 text-right text-amber-600 dark:text-amber-400">
                    {formatWholeCurrency(row.interestPaid)}
                  </td>
                  <td className="py-2 pl-4 text-right font-medium text-slate-900 dark:text-white">
                    {formatWholeCurrency(row.closingBalance)}
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
 * 2. Finance: Compound Interest Calculator
 */
export const CompoundInterestCalculator: React.FC = () => {
  const [initialDeposit, setInitialDeposit] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(15);
  const [frequency, setFrequency] = useState<number>(12);

  const result = calculateCompoundInterest(
    initialDeposit,
    monthlyContribution,
    annualRate,
    years,
    frequency
  );

  const contribPct =
    result.futureValue > 0 ? (result.totalContributions / result.futureValue) * 100 : 100;
  const interestPct =
    result.futureValue > 0 ? (result.totalInterestEarned / result.futureValue) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Investment Parameters
            </h2>
            <button
              type="button"
              onClick={() => {
                setInitialDeposit(10000);
                setMonthlyContribution(300);
                setAnnualRate(8);
                setYears(15);
                setFrequency(12);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="ci-initial"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Initial Deposit ($)
              </label>
              <input
                id="ci-initial"
                type="number"
                min={0}
                step={500}
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ci-monthly"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Monthly Contribution ($)
              </label>
              <input
                id="ci-monthly"
                type="number"
                min={0}
                step={50}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="ci-rate"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Annual Return (%)
              </label>
              <input
                id="ci-rate"
                type="number"
                min={0}
                max={50}
                step={0.25}
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ci-years"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Time Horizon (Years)
              </label>
              <input
                id="ci-years"
                type="number"
                min={1}
                max={60}
                step={1}
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(60, Number(e.target.value))))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ci-freq"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Compounding
              </label>
              <select
                id="ci-freq"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value={365}>Daily (365/yr)</option>
                <option value={12}>Monthly (12/yr)</option>
                <option value={4}>Quarterly (4/yr)</option>
                <option value={1}>Annually (1/yr)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Investment Horizon Slider</span>
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
        </div>

        {/* Output Summary */}
        <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Projected Future Balance ({years} Years)
            </div>
            <div
              data-testid="compound-future-value"
              className="text-3xl sm:text-4xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums"
            >
              {formatCurrency(result.futureValue)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Contributions</div>
              <div className="text-base font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatWholeCurrency(result.totalContributions)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Interest Earned</div>
              <div className="text-base font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                +{formatWholeCurrency(result.totalInterestEarned)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Effective APY</div>
              <div className="text-base font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {result.effectiveAnnualYield.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Composition Bar */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">Portfolio Composition</span>
              <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {contribPct.toFixed(1)}% Principal · {interestPct.toFixed(1)}% Compound Gains
              </span>
            </div>
            <div className="h-5 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
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
                <span>Total Deposits ({formatWholeCurrency(result.totalContributions)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-400 inline-block" />
                <span>Compound Interest ({formatWholeCurrency(result.totalInterestEarned)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Milestone Bars */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Year-by-Year Growth Trajectory
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 items-end h-36 pt-4 px-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          {result.yearlyBreakdown
            .filter(
              (_, idx, arr) =>
                arr.length <= 10 ||
                (idx + 1) % Math.ceil(arr.length / 10) === 0 ||
                idx === arr.length - 1
            )
            .slice(0, 10)
            .map((item) => {
              const heightPct =
                result.futureValue > 0
                  ? Math.max(8, (item.endBalance / result.futureValue) * 100)
                  : 8;
              return (
                <div
                  key={item.year}
                  className="flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <div className="w-full flex flex-col justify-end h-24 bg-slate-200/60 dark:bg-slate-800/50 rounded-t-sm overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-sm transition-all duration-150"
                      title={`Year ${item.year}: ${formatWholeCurrency(item.endBalance)}`}
                    />
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
