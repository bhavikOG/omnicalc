export type CalculatorCategory = 'Finance' | 'Health' | 'Math' | 'Text';

export type CalculatorId =
  | 'loan-emi'
  | 'compound-interest'
  | 'bmi'
  | 'tdee'
  | 'percentage'
  | 'discount-tax'
  | 'age-date'
  | 'word-counter';

export type LegalPageId = 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact';

export interface CalculatorMeta {
  id: CalculatorId;
  title: string;
  shortTitle: string;
  category: CalculatorCategory;
  popular: boolean;
  summary: string;
  keywords: string[];
  formulaTitle: string;
  formulaExpression: string;
  formulaVariables: Array<{ symbol: string; meaning: string }>;
  formulaExplanation: string;
  exampleTitle: string;
  exampleScenario: string;
  exampleSteps: string[];
  exampleConclusion: string;
  faqs: Array<{ question: string; answer: string }>;
}

export const CATEGORIES: Array<{
  id: CalculatorCategory;
  name: string;
  description: string;
  count: number;
}> = [
  {
    id: 'Finance',
    name: 'Finance & Investing',
    description: 'Amortization, mortgages, loan EMIs, and long-term compound wealth projections.',
    count: 2,
  },
  {
    id: 'Health',
    name: 'Health & Fitness',
    description: 'Body mass index assessment, daily energy expenditure, and macro nutrition targets.',
    count: 2,
  },
  {
    id: 'Math',
    name: 'Everyday Math & Dates',
    description: 'Multi-mode percentages, stacked retail discounts, sales tax, and exact calendar age.',
    count: 3,
  },
  {
    id: 'Text',
    name: 'Text & Editorial',
    description: 'Real-time word count, character metrics, reading duration, and keyword density.',
    count: 1,
  },
];

export const CALCULATOR_CATALOG: CalculatorMeta[] = [
  {
    id: 'loan-emi',
    title: 'Loan EMI & Mortgage Calculator',
    shortTitle: 'Loan EMI / Mortgage',
    category: 'Finance',
    popular: true,
    summary:
      'Calculate monthly loan repayments (EMI), total interest cost, and visualize your Principal vs. Interest amortization schedule.',
    keywords: ['loan', 'emi', 'mortgage', 'home loan', 'car loan', 'interest', 'amortization', 'principal'],
    formulaTitle: 'Standard Reducing-Balance Loan EMI Formula',
    formulaExpression: 'EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)',
    formulaVariables: [
      { symbol: 'EMI', meaning: 'Equated Monthly Installment paid every month' },
      { symbol: 'P', meaning: 'Principal loan amount borrowed' },
      { symbol: 'r', meaning: 'Monthly interest rate (Annual Rate ÷ 12 ÷ 100)' },
      { symbol: 'n', meaning: 'Total number of monthly payments (Tenure in Years × 12)' },
    ],
    formulaExplanation:
      'In a standard reducing-balance loan or mortgage, each monthly payment covers the interest accrued for that month first, and the remainder reduces your principal balance. Early in the loan term, interest makes up a larger portion of each payment; over time, principal reduction accelerates.',
    exampleTitle: 'Practical Example: $250,000 Home Mortgage at 6.5% for 20 Years',
    exampleScenario:
      'Suppose you borrow $250,000 (P) to purchase a home at an annual interest rate of 6.5% over a 20-year tenure.',
    exampleSteps: [
      'Convert the annual interest rate to a monthly decimal rate: r = 6.5 / 12 / 100 = 0.0054167.',
      'Calculate the total number of monthly installments: n = 20 × 12 = 240 months.',
      'Compute the growth factor (1 + r)^n = (1.0054167)^240 ≈ 3.65645.',
      'Apply the EMI formula: EMI = 250,000 × 0.0054167 × 3.65645 / (3.65645 - 1) = $1,863.93 per month.',
      'Multiply monthly EMI by 240 months: Total Payment = $447,343.80 (of which $197,343.80 is Total Interest).',
    ],
    exampleConclusion:
      'Your fixed monthly mortgage payment is $1,863.93, with 55.9% of total payments going toward principal and 44.1% toward interest.',
    faqs: [
      {
        question: 'How can I reduce my total mortgage or loan interest?',
        answer:
          'You can lower your total interest outflow by choosing a shorter loan tenure, making periodic extra principal prepayments, or refinancing when market interest rates drop by 0.75% or more.',
      },
      {
        question: 'Does the EMI amount change during the loan tenure?',
        answer:
          'For a fixed-rate loan, your monthly EMI remains constant throughout the entire term. For an adjustable or floating-rate loan, the lender may adjust either the EMI amount or the remaining loan tenure when benchmark rates change.',
      },
      {
        question: 'Why is the interest portion so high in the first few years?',
        answer:
          'Interest is calculated each month on the outstanding principal balance. Since your unpaid loan balance is highest at the very beginning of the loan, the monthly interest charge is also at its peak during the initial years.',
      },
      {
        question: 'Are property taxes and homeowner insurance included in EMI?',
        answer:
          'Standard EMI calculations cover Principal and Interest (P&I). When budgeting for a home mortgage, remember to account separately for property taxes, homeowner insurance, and any HOA dues.',
      },
    ],
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest Calculator',
    shortTitle: 'Compound Interest',
    category: 'Finance',
    popular: true,
    summary:
      'Project future portfolio wealth with initial deposits, recurring monthly contributions, and customizable compounding frequencies.',
    keywords: ['compound interest', 'investment', 'savings', 'apy', 'future value', 'wealth', 'retirement'],
    formulaTitle: 'Compound Interest with Periodic Contributions Formula',
    formulaExpression: 'A = P(1 + r/n)^(nt) + PMT × (((1 + r/n)^(nt) - 1) / (r/n))',
    formulaVariables: [
      { symbol: 'A', meaning: 'Future Value of the investment or savings account' },
      { symbol: 'P', meaning: 'Initial principal deposit (starting balance)' },
      { symbol: 'PMT', meaning: 'Regular periodic contribution amount' },
      { symbol: 'r', meaning: 'Nominal annual interest rate (in decimal form)' },
      { symbol: 'n', meaning: 'Number of compounding periods per year (e.g., 12 for monthly)' },
      { symbol: 't', meaning: 'Total time horizon in years' },
    ],
    formulaExplanation:
      'Compound interest earns returns not only on your original principal deposit, but also on the accumulated interest from previous periods. When combined with consistent monthly contributions, the growth curve steepens exponentially over multi-decade horizons.',
    exampleTitle: 'Practical Example: $10,000 Initial Deposit + $300/Month at 8% for 15 Years',
    exampleScenario:
      'An investor starts with $10,000 (P), contributes $300 every month (PMT), and earns an average 8% annual return compounded monthly (n = 12) for 15 years (t = 15).',
    exampleSteps: [
      'Determine the monthly periodic rate: r / n = 0.08 / 12 = 0.006667, and total periods nt = 15 × 12 = 180.',
      'Calculate future value of initial principal: $10,000 × (1.006667)^180 = $33,069.21.',
      'Calculate future value of $300 monthly contributions over 180 months: $300 × ((3.306921 - 1) / 0.006667) = $103,811.46.',
      'Sum both components: Total Future Value = $33,069.21 + $103,811.46 = $136,880.67.',
      'Subtract total out-of-pocket contributions ($10,000 + $54,000 = $64,000) to find Total Interest Earned = $72,880.67.',
    ],
    exampleConclusion:
      'Over 15 years, your $64,000 in total contributions more than doubles to $136,880.67, with compound growth generating $72,880.67 in pure investment gains.',
    faqs: [
      {
        question: 'What is the difference between APR and APY?',
        answer:
          'APR (Annual Percentage Rate) is the stated nominal annual interest rate without accounting for intra-year compounding. APY (Annual Percentage Yield) reflects the effective annual return after compounding is applied.',
      },
      {
        question: 'How does compounding frequency affect my returns?',
        answer:
          'More frequent compounding (e.g., daily or monthly versus annually) puts accrued interest to work sooner, resulting in a slightly higher effective annual yield.',
      },
      {
        question: 'What is the Rule of 72 in compound interest?',
        answer:
          'The Rule of 72 is a quick mental shortcut to estimate how many years it takes for an investment to double without extra contributions: divide 72 by your annual rate of return (e.g., at 8% return, 72 ÷ 8 = 9 years to double).',
      },
      {
        question: 'Should I account for inflation when projecting long-term wealth?',
        answer:
          'Yes. To estimate your future balance in today’s purchasing power, use an inflation-adjusted ("real") rate of return by subtracting expected inflation (typically 2.5%–3%) from your nominal investment return.',
      },
    ],
  },
  {
    id: 'bmi',
    title: 'Body Mass Index (BMI) Calculator',
    shortTitle: 'BMI Calculator',
    category: 'Health',
    popular: true,
    summary:
      'Evaluate your Body Mass Index using Metric or Imperial units with an interactive WHO health status gauge and ideal weight range.',
    keywords: ['bmi', 'body mass index', 'weight', 'height', 'health', 'fitness', 'obesity', 'ideal weight'],
    formulaTitle: 'World Health Organization (WHO) BMI Formula',
    formulaExpression: 'BMI = Weight (kg) / [Height (m)]²   |   Imperial: 703 × Weight (lbs) / [Height (in)]²',
    formulaVariables: [
      { symbol: 'Weight', meaning: 'Total body weight in kilograms (kg) or pounds (lbs)' },
      { symbol: 'Height', meaning: 'Standing height in meters (m) or inches (in)' },
      { symbol: '703', meaning: 'Unit conversion constant for Imperial pounds and square inches' },
    ],
    formulaExplanation:
      'Body Mass Index (BMI) is a standardized screening ratio of weight-to-height squared used globally by clinicians to categorize adult weight statuses: Underweight (< 18.5), Normal Weight (18.5 – 24.9), Overweight (25.0 – 29.9), and Obese (≥ 30.0).',
    exampleTitle: 'Practical Example: Adult Weighing 72 kg at 176 cm Height',
    exampleScenario:
      'An individual measures 176 cm in height and weighs 72 kg. Let us compute their BMI and healthy weight bracket.',
    exampleSteps: [
      'Convert height from centimeters to meters: 176 cm ÷ 100 = 1.76 m.',
      'Square the height in meters: 1.76 × 1.76 = 3.0976 m².',
      'Divide weight in kilograms by height squared: 72 ÷ 3.0976 = 23.24 kg/m².',
      'Compare 23.24 against WHO thresholds: since 23.24 is between 18.5 and 24.9, the status is Normal Weight.',
      'Compute healthy weight range for 1.76 m: 18.5 × 3.0976 = 57.3 kg minimum to 24.9 × 3.0976 = 77.1 kg maximum.',
    ],
    exampleConclusion:
      'With a BMI of 23.2, this person sits comfortably within the Normal Weight category (57.3 kg – 77.1 kg).',
    faqs: [
      {
        question: 'Is BMI accurate for strength athletes and muscular individuals?',
        answer:
          'BMI measures total body mass rather than body composition. Because muscle tissue is dense, strength athletes may register an Overweight BMI despite having low body fat percentages.',
      },
      {
        question: 'What are the standard WHO BMI categories for adults?',
        answer:
          'Underweight is below 18.5; Normal Weight is 18.5 to 24.9; Overweight is 25.0 to 29.9; and Obesity begins at 30.0 and above.',
      },
      {
        question: 'Does BMI depend on age or biological sex?',
        answer:
          'For adults aged 20 and older, standard BMI cutoffs are the same for men and women. For children and teens, clinicians use age- and sex-specific BMI percentile growth charts instead.',
      },
      {
        question: 'What additional measurements complement BMI?',
        answer:
          'Waist circumference, waist-to-height ratio (keeping waist under half your height), and body fat percentage measurements provide helpful context alongside BMI.',
      },
    ],
  },
  {
    id: 'tdee',
    title: 'TDEE & Daily Calorie Deficit Calculator',
    shortTitle: 'TDEE & Calorie Deficit',
    category: 'Health',
    popular: false,
    summary:
      'Compute your Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and sustainable calorie & macro targets for fat loss or muscle gain.',
    keywords: ['tdee', 'calorie', 'deficit', 'bmr', 'macros', 'weight loss', 'nutrition', 'metabolism'],
    formulaTitle: 'Mifflin-St Jeor BMR & TDEE Activity Multiplier Equation',
    formulaExpression: 'BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + s   |   TDEE = BMR × Activity Factor',
    formulaVariables: [
      { symbol: 'BMR', meaning: 'Basal Metabolic Rate (calories burned at complete rest)' },
      { symbol: 's', meaning: 'Sex constant (+5 for Males, -161 for Females)' },
      { symbol: 'Activity Factor', meaning: 'Multiplier from 1.2 (Sedentary) to 1.9 (Athlete)' },
      { symbol: 'TDEE', meaning: 'Total Daily Energy Expenditure (maintenance calories)' },
    ],
    formulaExplanation:
      'The Mifflin-St Jeor equation is recognized by the Academy of Nutrition and Dietetics as the most reliable clinical formula for estimating resting energy expenditure (BMR). Multiplying BMR by your physical activity factor yields your maintenance calories (TDEE). Eating 500 kcal below TDEE creates a ~3,500 kcal weekly deficit, corresponding to roughly 0.45 kg (1 lb) of fat loss per week.',
    exampleTitle: 'Practical Example: 30-Year-Old Male, 80 kg, 180 cm, Moderate Exercise',
    exampleScenario:
      'A 30-year-old man weighs 80 kg, is 180 cm tall, exercises 3–5 days per week (Moderate Activity = 1.55), and wants to lose 0.5 kg per week.',
    exampleSteps: [
      'Calculate base metabolic components: (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 800 + 1125 - 150 + 5 = 1,780 kcal/day BMR.',
      'Multiply BMR by the Moderate Activity multiplier (1.55): 1,780 × 1.55 = 2,759 kcal/day Maintenance TDEE.',
      'Subtract 500 kcal/day for a sustainable weight-loss deficit: 2,759 - 500 = 2,259 kcal/day Target Intake.',
      'Allocate daily macronutrients (30% Protein, 40% Carbs, 30% Fat): 169g Protein, 226g Carbs, and 75g Fat.',
    ],
    exampleConclusion:
      'Eating 2,259 kcal per day with 169g of protein supports steady fat loss of ~0.45 kg per week while preserving lean muscle mass.',
    faqs: [
      {
        question: 'What is a safe daily calorie deficit for sustainable fat loss?',
        answer:
          'A daily deficit of 300 to 500 calories below your TDEE is widely recommended for sustainable fat loss without triggering excessive fatigue, muscle loss, or metabolic adaptation.',
      },
      {
        question: 'Should I eat below my Basal Metabolic Rate (BMR)?',
        answer:
          'Consistently eating below your BMR is generally discouraged without medical supervision, as BMR represents the baseline energy required for vital organ functions.',
      },
      {
        question: 'How often should I recalculate my TDEE?',
        answer:
          'Recalculate your TDEE after every 4 to 5 kg (10 lbs) of weight change, or whenever your weekly training volume or daily step count shifts noticeably.',
      },
      {
        question: 'Why is protein intake important during a calorie deficit?',
        answer:
          'Adequate protein (1.6g to 2.2g per kg of body weight) increases satiety, has a higher thermic effect of food, and protects lean muscle tissue while your body is in an energy deficit.',
      },
    ],
  },
  {
    id: 'percentage',
    title: '3-in-1 Percentage Calculator',
    shortTitle: '3-in-1 Percentage',
    category: 'Math',
    popular: true,
    summary:
      'Solve all three core percentage problems simultaneously: find X% of Y, find what percent X is of Y, and calculate percentage increase or decrease.',
    keywords: ['percentage', 'percent change', 'percent increase', 'math', 'ratio', 'fraction'],
    formulaTitle: 'Three Core Percentage Formulas',
    formulaExpression: '1) V = (P / 100) × Y    |    2) P = (X / Y) × 100    |    3) %Δ = ((New - Old) / |Old|) × 100',
    formulaVariables: [
      { symbol: 'V', meaning: 'Resulting portion value when taking P% of Y' },
      { symbol: 'P', meaning: 'Percentage value (out of 100)' },
      { symbol: 'X, Y', meaning: 'Part value (X) and Total reference value (Y)' },
      { symbol: '%Δ', meaning: 'Percentage change (increase if positive, decrease if negative)' },
    ],
    formulaExplanation:
      'The word "percent" comes from the Latin per centum, meaning "by the hundred." Whether you are computing tips, analyzing revenue growth, or grading test scores, every percentage problem reduces to one of these three relationships.',
    exampleTitle: 'Practical Example: Calculating a 15% Tip, Exam Score %, and Revenue Growth',
    exampleScenario:
      'Let us solve one real-world example using each of the three formulas.',
    exampleSteps: [
      'Formula 1 (What is 15% of $84?): Divide 15 by 100 (0.15) and multiply by 84 = $12.60.',
      'Formula 2 ($45 is what % of $180?): Divide 45 by 180 (0.25) and multiply by 100 = 25%.',
      'Formula 3 (% change from 120 to 150 users): Subtract 150 - 120 = +30; divide 30 by 120 (0.25) × 100 = +25% increase.',
    ],
    exampleConclusion:
      'All three panels in our calculator update instantaneously as you type so you never have to switch modes.',
    faqs: [
      {
        question: 'Why does a 20% increase followed by a 20% decrease not return to the original number?',
        answer:
          'Because the second percentage applies to the new, larger base. For example, $100 + 20% = $120, and 20% off $120 is $24, leaving you with $96 (a net 4% reduction).',
      },
      {
        question: 'What is the difference between percentage change and percentage points?',
        answer:
          'If an interest rate rises from 4% to 5%, it increased by 1 percentage point, which represents a 25% relative percentage increase ((5 - 4) / 4 × 100).',
      },
      {
        question: 'Can percentage change be calculated when the starting value is zero?',
        answer:
          'No. Division by zero is mathematically undefined, so relative percentage growth from a starting value of 0 cannot be expressed as a finite percentage.',
      },
    ],
  },
  {
    id: 'discount-tax',
    title: 'Discount & Sales Tax Calculator',
    shortTitle: 'Discount & Sales Tax',
    category: 'Math',
    popular: false,
    summary:
      'Calculate final retail checkout prices with primary promotional discounts, stacked extra coupon codes, total savings, and local sales tax.',
    keywords: ['discount', 'sales tax', 'shopping', 'retail', 'coupon', 'savings', 'price'],
    formulaTitle: 'Stacked Retail Discount & Sales Tax Formula',
    formulaExpression: 'Sub = Price × (1 - d₁/100) × (1 - d₂/100)   |   Final = Sub × (1 + Tax/100)',
    formulaVariables: [
      { symbol: 'Price', meaning: 'Original sticker or list price before discounts' },
      { symbol: 'd₁', meaning: 'Primary store discount percentage' },
      { symbol: 'd₂', meaning: 'Additional stacked coupon percentage applied to reduced price' },
      { symbol: 'Sub', meaning: 'Discounted pre-tax subtotal' },
      { symbol: 'Tax', meaning: 'Local or state sales tax rate percentage' },
    ],
    formulaExplanation:
      'When retailers offer an "extra % off already-reduced prices," the two discounts are applied sequentially (multiplicatively) rather than added together directly. Sales tax is then calculated on the final discounted subtotal.',
    exampleTitle: 'Practical Example: $150 Jacket with 30% Off + Extra 10% Coupon + 8.25% Tax',
    exampleScenario:
      'A jacket has an original price of $150, is on sale for 30% off, and you have an extra 10% off promo code in a city with 8.25% sales tax.',
    exampleSteps: [
      'Apply the 30% store discount: $150 × 0.30 = $45.00 saved, leaving $105.00.',
      'Apply the extra 10% promo code to the $105.00 sale price: $105.00 × 0.10 = $10.50 saved, leaving a $94.50 subtotal.',
      'Compute total savings: $45.00 + $10.50 = $55.50 total saved (an effective discount of 37%, not 40%).',
      'Calculate 8.25% sales tax on the $94.50 subtotal: $94.50 × 0.0825 = $7.80 tax.',
      'Add tax to subtotal: $94.50 + $7.80 = $102.30 final checkout price.',
    ],
    exampleConclusion:
      'Your final out-of-pocket checkout total is $102.30, and you saved $55.50 off the original sticker price.',
    faqs: [
      {
        question: 'Why is 30% off plus an extra 10% off equal to 37% off instead of 40%?',
        answer:
          'The second 10% discount applies to the remaining 70% of the price (10% of 70% = 7%), so the combined discount is 30% + 7% = 37%.',
      },
      {
        question: 'Is sales tax calculated before or after store discounts?',
        answer:
          'In almost all jurisdictions, store discounts and retailer coupons reduce the taxable selling price, meaning sales tax is charged only on the discounted subtotal.',
      },
      {
        question: 'Does the order of two stacked percentage discounts matter?',
        answer:
          'No. Because multiplication is commutative, taking 30% off and then 10% off yields the exact same subtotal as taking 10% off and then 30% off.',
      },
    ],
  },
  {
    id: 'age-date',
    title: 'Age & Date Difference Calculator',
    shortTitle: 'Age & Date Difference',
    category: 'Math',
    popular: false,
    summary:
      'Find exact chronological age or duration between any two dates in years, months, days, total weeks, hours, and countdown to next anniversary.',
    keywords: ['age', 'date difference', 'birthday', 'chronological age', 'days between dates', 'calendar'],
    formulaTitle: 'Gregorian Calendar Chronological Duration Algorithm',
    formulaExpression: 'ΔDate = (Y₂ - Y₁) Years + (M₂ - M₁) Months + (D₂ - D₁) Days (with month-length borrow)',
    formulaVariables: [
      { symbol: 'Y₁, M₁, D₁', meaning: 'Start or Birth Date (Year, Month, Day)' },
      { symbol: 'Y₂, M₂, D₂', meaning: 'End or Target Date (Year, Month, Day)' },
      { symbol: 'Total Days', meaning: 'Exact UTC Julian day difference including leap-year February 29ths' },
    ],
    formulaExplanation:
      'Because Gregorian calendar months vary between 28, 29, 30, and 31 days, exact age calculation subtracts day-of-month first (borrowing the exact number of days from the preceding month when negative), then months (borrowing 12 months from years when negative), while simultaneously tracking leap years for total elapsed days.',
    exampleTitle: 'Practical Example: Exact Age from May 15, 2000 to November 6, 2026',
    exampleScenario:
      'Determine the exact years, months, and days elapsed between a birth date of May 15, 2000 and November 6, 2026.',
    exampleSteps: [
      'Compare day of month: 6 - 15 = -9 days. Borrow 31 days from October 2026: 31 - 9 = 22 days, reducing the end month from November (11) to October (10).',
      'Subtract adjusted months: October (10) - May (5) = 5 months.',
      'Subtract years: 2026 - 2000 = 26 years.',
      'Compute total elapsed days across all leap years (2004, 2008, 2012, 2016, 2020, 2024): 9,671 total days (1,381 weeks and 4 days).',
    ],
    exampleConclusion:
      'The exact chronological age is 26 years, 5 months, and 22 days (9,671 total days).',
    faqs: [
      {
        question: 'Does this calculator account for leap years?',
        answer:
          'Yes. Every leap year (years divisible by 4, except century years not divisible by 400) adds an extra day in February, which is automatically included in total day, week, and hour counts.',
      },
      {
        question: 'Can I use this tool to calculate contract durations or project timelines?',
        answer:
          'Absolutely. Enter your project start date and deadline to get both the calendar breakdown (years, months, days) and the exact number of calendar weeks and days.',
      },
      {
        question: 'What happens if I enter a start date that is later than the end date?',
        answer:
          'Our calculator automatically normalizes the date order and computes the absolute duration between the two dates so you never get negative numbers.',
      },
    ],
  },
  {
    id: 'word-counter',
    title: 'Live Word, Character & Reading Time Counter',
    shortTitle: 'Word & Reading Counter',
    category: 'Text',
    popular: true,
    summary:
      'Analyze essays, articles, and social posts in real time for word count, character limits, sentence structure, reading time, speaking duration, and keyword density.',
    keywords: ['word counter', 'character count', 'reading time', 'text analyzer', 'keyword density', 'essay'],
    formulaTitle: 'Lexical Tokenization & Reading Speed Formulas',
    formulaExpression: 'Reading Time (min) = Words / 225 WPM   |   Speaking Time (min) = Words / 130 WPM',
    formulaVariables: [
      { symbol: 'Words', meaning: 'Total whitespace-delimited lexical word tokens' },
      { symbol: '225 WPM', meaning: 'Average adult silent reading speed (Words Per Minute)' },
      { symbol: '130 WPM', meaning: 'Standard public speaking & presentation pacing (Words Per Minute)' },
      { symbol: 'Density %', meaning: '(Keyword Occurrences ÷ Total Words) × 100' },
    ],
    formulaExplanation:
      'Writers, journalists, SEO editors, and students frequently work under strict word or character limits. By tokenizing text on whitespace and punctuation boundaries in real time, this tool computes exact lexical counts alongside reading and speaking duration estimates.',
    exampleTitle: 'Practical Example: Analyzing a 900-Word Blog Post or Speech Script',
    exampleScenario:
      'A content creator drafts a 900-word article where the primary topic keyword appears 18 times.',
    exampleSteps: [
      'Calculate silent reading duration: 900 words ÷ 225 WPM = 4.0 minutes (4 min 0 sec).',
      'Calculate spoken presentation duration: 900 words ÷ 130 WPM = 6.92 minutes (6 min 55 sec).',
      'Compute keyword density: (18 occurrences ÷ 900 total words) × 100 = 2.0% density.',
    ],
    exampleConclusion:
      'A 900-word article takes 4 minutes to read silently or nearly 7 minutes to deliver aloud as a speech.',
    faqs: [
      {
        question: 'What are the character limits for major social media and SEO fields?',
        answer:
          'Google SEO Title Tags display best under 60 characters; Meta Descriptions under 155–160 characters; X (Twitter) standard posts allow 280 characters; and LinkedIn posts support up to 3,000 characters.',
      },
      {
        question: 'How is reading time calculated?',
        answer:
          'Reading time is based on the established adult silent reading benchmark of 225 words per minute (WPM), while speaking time uses the broadcast narration standard of 130 WPM.',
      },
      {
        question: 'Does my text get uploaded to any external server?',
        answer:
          'No. All text counting, keyword extraction, and case transformations execute 100% locally inside your web browser for complete privacy.',
      },
    ],
  },
];
