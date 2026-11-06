/**
 * Pure calculation engine for OmniCalc multi-calculator portal.
 * Decoupled from UI components for deterministic unit testing and portability.
 */

export interface LoanEmiResult {
  monthlyEmi: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPayment: number;
  principalPercentage: number;
  interestPercentage: number;
  yearlySchedule: Array<{
    year: number;
    openingBalance: number;
    principalPaid: number;
    interestPaid: number;
    closingBalance: number;
  }>;
}

/**
 * 1. Finance: Loan EMI / Mortgage Calculator
 * Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateLoanEmi(
  principal: number,
  annualRatePercent: number,
  tenureYears: number
): LoanEmiResult {
  const safePrincipal = Math.max(0, Number.isFinite(principal) ? principal : 0);
  const safeRate = Math.max(0, Number.isFinite(annualRatePercent) ? annualRatePercent : 0);
  const safeYears = Math.max(0.1, Number.isFinite(tenureYears) ? tenureYears : 1);
  const totalMonths = Math.max(1, Math.round(safeYears * 12));

  if (safePrincipal === 0) {
    return {
      monthlyEmi: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      totalPayment: 0,
      principalPercentage: 100,
      interestPercentage: 0,
      yearlySchedule: [],
    };
  }

  const monthlyRate = safeRate / 12 / 100;
  let monthlyEmi = 0;

  if (monthlyRate === 0) {
    monthlyEmi = safePrincipal / totalMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyEmi = (safePrincipal * monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - safePrincipal);
  const principalPercentage = totalPayment > 0 ? (safePrincipal / totalPayment) * 100 : 100;
  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  // Build yearly amortization schedule
  const yearlySchedule: LoanEmiResult['yearlySchedule'] = [];
  let balance = safePrincipal;
  const totalYearsCount = Math.ceil(totalMonths / 12);

  for (let year = 1; year <= totalYearsCount; year++) {
    const openingBalance = balance;
    let principalPaidYear = 0;
    let interestPaidYear = 0;
    const monthsInThisYear = Math.min(12, totalMonths - (year - 1) * 12);

    for (let m = 0; m < monthsInThisYear; m++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = Math.min(balance, monthlyEmi - interestForMonth);
      interestPaidYear += interestForMonth;
      principalPaidYear += principalForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }

    yearlySchedule.push({
      year,
      openingBalance,
      principalPaid: principalPaidYear,
      interestPaid: interestPaidYear,
      closingBalance: balance,
    });
  }

  return {
    monthlyEmi,
    totalPrincipal: safePrincipal,
    totalInterest,
    totalPayment,
    principalPercentage,
    interestPercentage,
    yearlySchedule,
  };
}

export interface CompoundInterestResult {
  futureValue: number;
  totalContributions: number;
  totalInterestEarned: number;
  effectiveAnnualYield: number;
  yearlyBreakdown: Array<{
    year: number;
    totalContributions: number;
    interestEarned: number;
    endBalance: number;
  }>;
}

/**
 * 2. Finance: Compound Interest Calculator
 * Supports initial principal + recurring monthly contribution.
 */
export function calculateCompoundInterest(
  initialPrincipal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number,
  compoundingFrequency: number = 12
): CompoundInterestResult {
  const P = Math.max(0, Number.isFinite(initialPrincipal) ? initialPrincipal : 0);
  const PMT = Math.max(0, Number.isFinite(monthlyContribution) ? monthlyContribution : 0);
  const r = Math.max(0, Number.isFinite(annualRatePercent) ? annualRatePercent : 0) / 100;
  const t = Math.max(1, Math.min(100, Math.round(Number.isFinite(years) ? years : 1)));
  const n = Math.max(1, compoundingFrequency);

  const yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'] = [];
  let currentBalance = P;
  let cumulativeContributions = P;

  // Simulate month-by-month with periodic compounding accuracy
  for (let year = 1; year <= t; year++) {
    for (let month = 1; month <= 12; month++) {
      // Effective monthly growth derived from compounding frequency n
      const effectiveMonthlyRate = r === 0 ? 0 : Math.pow(1 + r / n, n / 12) - 1;
      currentBalance = currentBalance * (1 + effectiveMonthlyRate) + PMT;
      cumulativeContributions += PMT;
    }

    yearlyBreakdown.push({
      year,
      totalContributions: cumulativeContributions,
      interestEarned: Math.max(0, currentBalance - cumulativeContributions),
      endBalance: currentBalance,
    });
  }

  const totalInterestEarned = Math.max(0, currentBalance - cumulativeContributions);
  const effectiveAnnualYield = r === 0 ? 0 : (Math.pow(1 + r / n, n) - 1) * 100;

  return {
    futureValue: currentBalance,
    totalContributions: cumulativeContributions,
    totalInterestEarned,
    effectiveAnnualYield,
    yearlyBreakdown,
  };
}

export type BmiCategory = 'Underweight' | 'Normal Weight' | 'Overweight' | 'Obese';

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  gaugePercent: number; // 0 to 100 position on visual health gauge
  healthyWeightRangeKg: [number, number];
  healthyWeightRangeLbs: [number, number];
  weightDeltaToNormalKg: number; // positive means lose X kg, negative means gain X kg, 0 means within normal
}

/**
 * 3. Health: BMI Calculator
 * Supports Metric (kg, cm) and Imperial (lbs, inches)
 */
export function calculateBmi(
  weightKg: number,
  heightCm: number
): BmiResult {
  const safeWeight = Math.max(1, Number.isFinite(weightKg) ? weightKg : 70);
  const safeHeightCm = Math.max(50, Number.isFinite(heightCm) ? heightCm : 170);
  const heightM = safeHeightCm / 100;

  const bmi = safeWeight / (heightM * heightM);

  let category: BmiCategory = 'Normal Weight';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal Weight';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  // Map BMI [12 .. 40] onto [0 .. 100]% for the interactive gauge
  const minBmi = 12;
  const maxBmi = 40;
  const gaugePercent = Math.max(2, Math.min(98, ((bmi - minBmi) / (maxBmi - minBmi)) * 100));

  const minHealthyKg = 18.5 * heightM * heightM;
  const maxHealthyKg = 24.9 * heightM * heightM;

  let weightDeltaToNormalKg = 0;
  if (safeWeight < minHealthyKg) {
    weightDeltaToNormalKg = safeWeight - minHealthyKg; // negative = need to gain
  } else if (safeWeight > maxHealthyKg) {
    weightDeltaToNormalKg = safeWeight - maxHealthyKg; // positive = need to lose
  }

  return {
    bmi,
    category,
    gaugePercent,
    healthyWeightRangeKg: [minHealthyKg, maxHealthyKg],
    healthyWeightRangeLbs: [minHealthyKg * 2.20462, maxHealthyKg * 2.20462],
    weightDeltaToNormalKg,
  };
}

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export interface TdeeResult {
  bmr: number;
  tdee: number;
  mildDeficitCalories: number; // -250 kcal/day (~0.25 kg/week)
  standardDeficitCalories: number; // -500 kcal/day (~0.5 kg/week)
  aggressiveDeficitCalories: number; // -750 kcal/day (~0.75 kg/week)
  leanBulkCalories: number; // +250 kcal/day
  macrosForTarget: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

/**
 * 4. Health: TDEE / Daily Calorie Deficit Calculator
 * Uses Mifflin-St Jeor Equation
 */
export function calculateTdee(
  gender: Gender,
  ageYears: number,
  weightKg: number,
  heightCm: number,
  activity: ActivityLevel,
  targetDeficitOrSurplus: number = -500
): TdeeResult {
  const safeAge = Math.max(15, Math.min(100, Number.isFinite(ageYears) ? ageYears : 30));
  const safeWeight = Math.max(25, Number.isFinite(weightKg) ? weightKg : 70);
  const safeHeight = Math.max(100, Number.isFinite(heightCm) ? heightCm : 170);

  const baseBmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;
  const bmr = gender === 'male' ? baseBmr + 5 : baseBmr - 161;
  const multiplier = ACTIVITY_MULTIPLIERS[activity] ?? 1.2;
  const tdee = bmr * multiplier;

  const targetCalories = Math.max(1200, tdee + targetDeficitOrSurplus);

  // Balanced High-Satiety Macro Split: 30% Protein, 40% Carbs, 30% Fats
  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const carbsGrams = Math.round((targetCalories * 0.4) / 4);
  const fatGrams = Math.round((targetCalories * 0.3) / 9);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    mildDeficitCalories: Math.max(1200, Math.round(tdee - 250)),
    standardDeficitCalories: Math.max(1200, Math.round(tdee - 500)),
    aggressiveDeficitCalories: Math.max(1200, Math.round(tdee - 750)),
    leanBulkCalories: Math.round(tdee + 250),
    macrosForTarget: {
      proteinGrams,
      carbsGrams,
      fatGrams,
    },
  };
}

export interface Percentage3In1Result {
  percentOfValue: number; // What is X% of Y?
  whatPercentOf: number | null; // X is what % of Y?
  percentageChange: number | null; // % change from X to Y
  isIncrease: boolean;
  difference: number;
}

/**
 * 5. Math: 3-in-1 Percentage Calculator
 */
export function calculatePercentages(
  mode1Percent: number,
  mode1Value: number,
  mode2Part: number,
  mode2Whole: number,
  mode3From: number,
  mode3To: number
): Percentage3In1Result {
  const percentOfValue = (mode1Percent / 100) * mode1Value;
  const whatPercentOf = mode2Whole !== 0 ? (mode2Part / mode2Whole) * 100 : null;
  const difference = mode3To - mode3From;
  const percentageChange =
    mode3From !== 0 ? ((mode3To - mode3From) / Math.abs(mode3From)) * 100 : null;

  return {
    percentOfValue,
    whatPercentOf,
    percentageChange,
    isIncrease: difference >= 0,
    difference,
  };
}

export interface DiscountTaxResult {
  originalPrice: number;
  primaryDiscountAmount: number;
  priceAfterPrimaryDiscount: number;
  additionalDiscountAmount: number;
  discountedSubtotal: number;
  totalSavings: number;
  effectiveDiscountPercent: number;
  taxAmount: number;
  finalPayablePrice: number;
}

/**
 * 6. Math: Discount & Sales Tax Calculator
 */
export function calculateDiscountAndTax(
  originalPrice: number,
  discountPercent: number,
  additionalDiscountPercent: number,
  salesTaxPercent: number
): DiscountTaxResult {
  const safePrice = Math.max(0, Number.isFinite(originalPrice) ? originalPrice : 0);
  const safeDisc1 = Math.max(0, Math.min(100, Number.isFinite(discountPercent) ? discountPercent : 0));
  const safeDisc2 = Math.max(
    0,
    Math.min(100, Number.isFinite(additionalDiscountPercent) ? additionalDiscountPercent : 0)
  );
  const safeTax = Math.max(0, Number.isFinite(salesTaxPercent) ? salesTaxPercent : 0);

  const primaryDiscountAmount = safePrice * (safeDisc1 / 100);
  const priceAfterPrimaryDiscount = safePrice - primaryDiscountAmount;
  const additionalDiscountAmount = priceAfterPrimaryDiscount * (safeDisc2 / 100);
  const discountedSubtotal = priceAfterPrimaryDiscount - additionalDiscountAmount;
  const totalSavings = primaryDiscountAmount + additionalDiscountAmount;
  const effectiveDiscountPercent = safePrice > 0 ? (totalSavings / safePrice) * 100 : 0;
  const taxAmount = discountedSubtotal * (safeTax / 100);
  const finalPayablePrice = discountedSubtotal + taxAmount;

  return {
    originalPrice: safePrice,
    primaryDiscountAmount,
    priceAfterPrimaryDiscount,
    additionalDiscountAmount,
    discountedSubtotal,
    totalSavings,
    effectiveDiscountPercent,
    taxAmount,
    finalPayablePrice,
  };
}

export interface AgeDateDiffResult {
  isValid: boolean;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  remainingDaysAfterWeeks: number;
  totalHours: number;
  totalMinutes: number;
  daysUntilNextAnniversary: number;
}

/**
 * 7. Math: Age & Date Difference Calculator
 */
export function calculateAgeAndDateDiff(
  startDateIso: string,
  endDateIso: string
): AgeDateDiffResult {
  const d1 = new Date(startDateIso + 'T00:00:00Z');
  const d2 = new Date(endDateIso + 'T00:00:00Z');

  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return {
      isValid: false,
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      remainingDaysAfterWeeks: 0,
      totalHours: 0,
      totalMinutes: 0,
      daysUntilNextAnniversary: 0,
    };
  }

  // Ensure start <= end for difference math
  const start = d1 <= d2 ? d1 : d2;
  const end = d1 <= d2 ? d2 : d1;

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();

  if (days < 0) {
    months -= 1;
    // Days in the previous month of `end`
    const prevMonthEnd = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0));
    days += prevMonthEnd.getUTCDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysAfterWeeks = totalDays % 7;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Next anniversary/birthday relative to end date
  let nextAnnivYear = end.getUTCFullYear();
  let nextAnniv = new Date(
    Date.UTC(nextAnnivYear, start.getUTCMonth(), start.getUTCDate())
  );
  if (nextAnniv <= end) {
    nextAnniv = new Date(
      Date.UTC(nextAnnivYear + 1, start.getUTCMonth(), start.getUTCDate())
    );
  }
  const daysUntilNextAnniversary = Math.round(
    (nextAnniv.getTime() - end.getTime()) / msPerDay
  );

  return {
    isValid: true,
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    remainingDaysAfterWeeks,
    totalHours,
    totalMinutes,
    daysUntilNextAnniversary,
  };
}

export interface TextCounterResult {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  readingTimeFormatted: string;
  speakingTimeFormatted: string;
  averageWordLength: number;
  topKeywords: Array<{ word: string; count: number; densityPercent: number }>;
}

const STOP_WORDS = new Set([
  'the', 'and', 'to', 'of', 'in', 'a', 'is', 'that', 'for', 'it', 'on', 'with',
  'as', 'was', 'at', 'by', 'an', 'be', 'this', 'from', 'or', 'are', 'but', 'not',
  'have', 'has', 'had', 'were', 'which', 'you', 'your', 'we', 'our', 'can', 'will',
]);

/**
 * 8. Text: Live Word, Character & Reading Time Counter
 */
export function analyzeTextContent(text: string): TextCounterResult {
  const raw = text ?? '';
  const trimmed = raw.trim();

  const charactersWithSpaces = raw.length;
  const charactersWithoutSpaces = raw.replace(/\s+/g, '').length;

  const wordTokens = trimmed.length === 0 ? [] : trimmed.split(/\s+/).filter(Boolean);
  const words = wordTokens.length;

  const sentences =
    trimmed.length === 0
      ? 0
      : trimmed
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0).length;

  const paragraphs =
    trimmed.length === 0
      ? 0
      : trimmed
          .split(/\n\s*\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0).length;

  // Standard reading speed: 225 WPM; speaking speed: 130 WPM
  const readingSeconds = Math.ceil((words / 225) * 60);
  const speakingSeconds = Math.ceil((words / 130) * 60);

  const formatDuration = (totalSec: number): string => {
    if (totalSec === 0) return '0 sec';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs} sec`;
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs} sec`;
  };

  const totalWordChars = wordTokens.reduce(
    (acc, w) => acc + w.replace(/[^a-zA-Z0-9]/g, '').length,
    0
  );
  const averageWordLength = words > 0 ? totalWordChars / words : 0;

  // Extract top keywords
  const freqMap = new Map<string, number>();
  for (const token of wordTokens) {
    const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleaned.length >= 3 && !STOP_WORDS.has(cleaned)) {
      freqMap.set(cleaned, (freqMap.get(cleaned) ?? 0) + 1);
    }
  }

  const topKeywords = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({
      word,
      count,
      densityPercent: words > 0 ? (count / words) * 100 : 0,
    }));

  return {
    words,
    charactersWithSpaces,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes: words / 225,
    readingTimeFormatted: formatDuration(readingSeconds),
    speakingTimeFormatted: formatDuration(speakingSeconds),
    averageWordLength,
    topKeywords,
  };
}
