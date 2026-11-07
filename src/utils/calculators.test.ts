import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLoanEmi,
  calculateCompoundInterest,
  calculateBmi,
  calculateTdee,
  calculatePercentages,
  calculateDiscountAndTax,
  calculateAgeAndDateDiff,
  analyzeTextContent,
} from './calculators';
import {
  getSitemapEntries,
  generateSitemapXml,
  generateRobotsTxt,
  parsePathnameToRoute,
  buildSchemaOrgGraph,
  normalizeBaseUrl,
} from './seoSitemap';
import {
  sanitizeUserText,
  sanitizeSingleLineInput,
  clampSafeNumber,
  sanitizeCsvCell,
  encodeVaultPayload,
  decodeVaultPayload,
} from './security';
import { CALCULATOR_CATALOG } from '../data/calculatorCatalog';

test('Loan EMI Calculator computes accurate monthly EMI and breakdown', () => {
  const result = calculateLoanEmi(100000, 6, 10);
  // 100,000 at 6% for 10 years (120 months) -> ~$1,110.21/month
  assert.ok(Math.abs(result.monthlyEmi - 1110.205) < 0.05);
  assert.equal(result.totalPrincipal, 100000);
  assert.ok(result.totalInterest > 33200 && result.totalInterest < 33250);
  assert.equal(result.yearlySchedule.length, 10);
  assert.ok(Math.abs(result.principalPercentage + result.interestPercentage - 100) < 0.001);

  // Extreme hyper-rate stress test (ensures no NaN overflow)
  const extreme = calculateLoanEmi(100000, 10000, 10);
  assert.ok(Number.isFinite(extreme.monthlyEmi));
  assert.ok(!Number.isNaN(extreme.monthlyEmi));
});

test('Compound Interest Calculator computes accurate future value', () => {
  const result = calculateCompoundInterest(10000, 0, 8, 10, 12);
  // 10,000 compounded monthly at 8% for 10 years -> ~22,196.40
  assert.ok(Math.abs(result.futureValue - 22196.4) < 1);
  assert.equal(result.totalContributions, 10000);
  assert.equal(result.yearlyBreakdown.length, 10);

  // Compounding frequency NaN guard test
  const nanFreq = calculateCompoundInterest(10000, 100, 8, 5, NaN);
  assert.ok(Number.isFinite(nanFreq.futureValue));
  assert.ok(!Number.isNaN(nanFreq.futureValue));
});

test('BMI Calculator classifies categories and healthy ranges properly', () => {
  const normal = calculateBmi(70, 175);
  assert.ok(Math.abs(normal.bmi - 22.86) < 0.05);
  assert.equal(normal.category, 'Normal Weight');
  assert.equal(normal.weightDeltaToNormalKg, 0);

  const overweight = calculateBmi(90, 175);
  assert.equal(overweight.category, 'Overweight');
  assert.ok(overweight.weightDeltaToNormalKg > 0);
});

test('TDEE Calculator applies Mifflin-St Jeor equation accurately', () => {
  const res = calculateTdee('male', 30, 80, 180, 'moderate', -500);
  // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
  assert.equal(res.bmr, 1780);
  // TDEE = 1780 * 1.55 = 2759
  assert.equal(res.tdee, 2759);
  assert.equal(res.standardDeficitCalories, 2259);

  // Low maintenance TDEE deficit doesn't produce an unintended caloric surplus
  const lowTdee = calculateTdee('female', 65, 42, 145, 'sedentary', -500);
  assert.ok(lowTdee.standardDeficitCalories < lowTdee.tdee);
  assert.ok(lowTdee.mildDeficitCalories < lowTdee.tdee);
});

test('3-in-1 Percentage Calculator handles all 3 modes', () => {
  const res = calculatePercentages(20, 250, 45, 180, 80, 100);
  assert.equal(res.percentOfValue, 50);
  assert.equal(res.whatPercentOf, 25);
  assert.equal(res.percentageChange, 25);
  assert.equal(res.isIncrease, true);
});

test('Discount & Sales Tax Calculator computes stacked discounts and tax', () => {
  const res = calculateDiscountAndTax(200, 20, 10, 8);
  // 200 - 20% = 160; 160 - 10% = 144; + 8% tax (11.52) = 155.52
  assert.equal(res.primaryDiscountAmount, 40);
  assert.equal(res.additionalDiscountAmount, 16);
  assert.equal(res.discountedSubtotal, 144);
  assert.ok(Math.abs(res.finalPayablePrice - 155.52) < 0.01);
});

test('Age & Date Difference Calculator computes exact calendar duration', () => {
  const res = calculateAgeAndDateDiff('2000-05-15', '2026-11-06');
  assert.equal(res.isValid, true);
  assert.equal(res.years, 26);
  assert.equal(res.months, 5);
  assert.equal(res.days, 22);
  assert.ok(res.totalDays > 9600);
});

test('Live Word & Character Counter counts words, sentences, paragraphs and reading time', () => {
  const sample = 'Hello world! This is a clean test paragraph.\n\nSecond paragraph here with extra words.';
  const res = analyzeTextContent(sample);
  assert.equal(res.words, 14);
  assert.equal(res.sentences, 3);
  assert.equal(res.paragraphs, 2);
  assert.ok(res.charactersWithSpaces > res.charactersWithoutSpaces);

  // Smart sentence detection protects against splitting on decimal numbers and abbreviations
  const decimalDoc = analyzeTextContent('Dr. Smith bought items for $19.99 in the U.S.A. It was a great day!');
  assert.equal(decimalDoc.sentences, 2);
});

test('Dynamic Sitemap Generator includes all 10 calculator routes, categories, and legal pages', () => {
  const entries = getSitemapEntries('https://omnicalc.me', '2026-11-07');
  // 1 home + 10 calculators + 4 categories + 5 legal pages = 20 canonical routes
  assert.equal(entries.length, 20);

  const xml = generateSitemapXml('https://omnicalc.me', '2026-11-07');
  assert.ok(xml.includes('<urlset'));
  for (const calc of CALCULATOR_CATALOG) {
    assert.ok(xml.includes(`https://omnicalc.me/calculators/${calc.id}`));
  }

  const robots = generateRobotsTxt('https://omnicalc.me');
  assert.ok(robots.includes('User-agent: Mediapartners-Google'));
  assert.ok(robots.includes('Sitemap: https://omnicalc.me/sitemap.xml'));
  assert.equal(normalizeBaseUrl(), 'https://omnicalc.me');
});

test('URL Route Parser and Schema.org Graph Builder resolve calculator routes cleanly', () => {
  const parsedCalc = parsePathnameToRoute('/calculators/loan-emi');
  assert.deepEqual(parsedCalc, { view: 'calculator', id: 'loan-emi' });

  const parsedCat = parsePathnameToRoute('/category/health');
  assert.deepEqual(parsedCat, { view: 'home', categoryFilter: 'Health' });

  const schema = buildSchemaOrgGraph('https://omnicalc.me', {
    view: 'calculator',
    meta: CALCULATOR_CATALOG[0],
  }) as { '@graph': Array<{ '@type': string }> };
  const types = schema['@graph'].map((node) => node['@type']);
  assert.ok(types.includes('SoftwareApplication'));
  assert.ok(types.includes('HowTo'));
  assert.ok(types.includes('FAQPage'));
  assert.ok(types.includes('BreadcrumbList'));
});

test('Security & XSS input sanitization strips script vectors and clamps numeric bounds', () => {
  const malicious = '<script>alert("xss")</script>Hello <b>World</b> javascript:evil()';
  const cleaned = sanitizeUserText(malicious, 200);
  assert.ok(!cleaned.includes('<script>'));
  assert.ok(!cleaned.includes('javascript:'));
  assert.ok(cleaned.includes('Hello World'));

  // Test nested script injection vector
  const nestedScript = '<scr<script>ipt>alert(1)</script>';
  assert.ok(!sanitizeUserText(nestedScript).includes('<script>'));

  const singleLine = sanitizeSingleLineInput('   Loan <img onerror=alert(1)> EMI   ', 50);
  assert.ok(!singleLine.includes('<'));
  assert.ok(!singleLine.includes('onerror='));

  assert.equal(clampSafeNumber(999999, 0, 1000, 50), 1000);
  assert.equal(clampSafeNumber(-25, 0, 1000, 50), 0);
  assert.equal(clampSafeNumber(NaN, 0, 1000, 50), 50);

  // OWASP CSV Injection Defense test (including leading whitespace bypass prevention)
  assert.equal(sanitizeCsvCell("   =cmd|' /C calc'!A0"), "\"cmd|' /C calc'!A0\"");
  assert.equal(sanitizeCsvCell("  +12345"), '"12345"');
  assert.equal(sanitizeCsvCell("@SUM(1+1)"), '"SUM(1+1)"');
  assert.equal(sanitizeCsvCell("|pipeTrigger"), '"pipeTrigger"');

  // Multi-byte Unicode Currency vault encryption/decryption roundtrip
  const testPayload = JSON.stringify([{ symbol: '₹', euro: '€', pound: '£', yen: '¥' }]);
  const encrypted = encodeVaultPayload(testPayload);
  const decrypted = decodeVaultPayload(encrypted);
  assert.equal(decrypted, testPayload);
});
