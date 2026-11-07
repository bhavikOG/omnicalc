export type CalculatorCategory = 'Finance' | 'Health' | 'Math' | 'Text';

export type CalculatorId =
  | 'loan-emi'
  | 'compound-interest'
  | 'sip-retirement'
  | 'bmi'
  | 'tdee'
  | 'percentage'
  | 'discount-tax'
  | 'age-date'
  | 'unit-converter'
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
    name: 'Money & Loans',
    description: 'Home mortgages, monthly loan payments, compound interest, and retirement savings.',
    count: 3,
  },
  {
    id: 'Health',
    name: 'Health & Fitness',
    description: 'Body Mass Index (BMI), healthy weight range, daily calorie needs, and macros.',
    count: 2,
  },
  {
    id: 'Math',
    name: 'Everyday Math & Conversions',
    description: 'Percentages, store discounts and sales tax, exact age in days, and unit conversions.',
    count: 4,
  },
  {
    id: 'Text',
    name: 'Writing & Text',
    description: 'Live word and character counter, reading time, speaking time, and top keywords.',
    count: 1,
  },
];

export const CALCULATOR_CATALOG: CalculatorMeta[] = [
  {
    id: 'loan-emi',
    title: 'Loan & Mortgage Payment Calculator',
    shortTitle: 'Loan & Mortgage',
    category: 'Finance',
    popular: true,
    summary:
      'See your exact monthly payment, compare loan terms side by side, and find out how much money and time you can save with extra monthly payments.',
    keywords: ['loan', 'emi', 'mortgage', 'home loan', 'car loan', 'interest', 'amortization', 'principal'],
    formulaTitle: 'Monthly Loan Payment Formula',
    formulaExpression: 'M = P × r × (1 + r)^n / ((1 + r)^n - 1)',
    formulaVariables: [
      { symbol: 'M', meaning: 'Monthly payment (principal + interest)' },
      { symbol: 'P', meaning: 'Loan amount you borrow' },
      { symbol: 'r', meaning: 'Monthly interest rate (annual rate divided by 12)' },
      { symbol: 'n', meaning: 'Total number of monthly payments (years × 12)' },
    ],
    formulaExplanation:
      'Every month, part of your payment goes toward the interest charged by the lender, and the rest pays down your loan balance. In the early years, most of your payment goes toward interest. As your balance shrinks over time, more of each payment goes directly toward paying off the loan.',
    exampleTitle: 'Example: $250,000 Home Loan at 6.5% for 20 Years',
    exampleScenario:
      'Suppose you borrow $250,000 to buy a home at a 6.5% yearly interest rate for 20 years.',
    exampleSteps: [
      'Divide the 6.5% yearly rate by 12 months to get the monthly rate: 0.065 ÷ 12 = 0.005417.',
      'Multiply 20 years by 12 months to get the total number of payments: 240 months.',
      'Plug these numbers into the formula to get a fixed monthly payment of $1,863.93.',
      'Over all 240 months, you will pay $447,343.80 in total ($250,000 for the loan + $197,343.80 in interest).',
    ],
    exampleConclusion:
      'Your monthly payment is $1,863.93. Adding even $100–$200 extra each month can shave years off your loan and save tens of thousands in interest.',
    faqs: [
      {
        question: 'How can I pay less total interest on my loan?',
        answer:
          'You can save a lot on interest by choosing a shorter loan term (like 15 years instead of 30), adding a small extra payment toward your principal each month, or refinancing if interest rates drop.',
      },
      {
        question: 'Does my monthly payment stay the same every month?',
        answer:
          'If you have a fixed-rate loan, your principal and interest payment stays the exact same from start to finish. However, if your property taxes or home insurance change, your escrow payment can go up or down slightly.',
      },
      {
        question: 'Why does so much of my payment go to interest at first?',
        answer:
          'Interest is based on how much you still owe. Because your loan balance is largest at the very beginning, the interest charge is highest in the first few years and gets smaller every month as you pay down the balance.',
      },
      {
        question: 'What is included in a full monthly mortgage payment?',
        answer:
          'A complete home payment usually includes four parts: Principal, Interest, Property Taxes, and Homeowners Insurance (often called PITI), plus HOA fees if you live in a managed community.',
      },
    ],
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest & Savings Calculator',
    shortTitle: 'Compound Interest',
    category: 'Finance',
    popular: true,
    summary:
      'See how your savings grow over time when you combine a starting deposit, regular monthly contributions, and compound interest.',
    keywords: ['compound interest', 'investment', 'savings', 'apy', 'future value', 'wealth', 'retirement'],
    formulaTitle: 'Compound Growth Formula',
    formulaExpression: 'A = P(1 + r/n)^(nt) + PMT × (((1 + r/n)^(nt) - 1) / (r/n))',
    formulaVariables: [
      { symbol: 'A', meaning: 'Final balance after interest' },
      { symbol: 'P', meaning: 'Starting deposit' },
      { symbol: 'PMT', meaning: 'Monthly contribution you add' },
      { symbol: 'r', meaning: 'Yearly interest rate (as a decimal)' },
      { symbol: 'n', meaning: 'How many times interest compounds per year (e.g., 12 for monthly)' },
      { symbol: 't', meaning: 'Number of years you let the money grow' },
    ],
    formulaExplanation:
      'Compound interest means your money earns interest, and then that interest starts earning interest too. When you also add a regular amount every month, your savings grow much faster in later years than they do at the start.',
    exampleTitle: 'Example: $10,000 Starting Deposit + $300/Month at 8% for 15 Years',
    exampleScenario:
      'You start with $10,000, add $300 every month, and earn an average 8% yearly return compounded monthly for 15 years.',
    exampleSteps: [
      'Your $10,000 starting deposit grows on its own to $33,069.21 over 15 years.',
      'Your $300 monthly deposits ($54,000 added in total) grow with interest to $103,811.46.',
      'Add both together to get a final balance of $136,880.67.',
      'Out of that $136,880.67 total, only $64,000 came out of your pocket—the remaining $72,880.67 is pure interest earned.',
    ],
    exampleConclusion:
      'After 15 years, your $64,000 in total deposits more than doubles to $136,880.67 thanks to compounding.',
    faqs: [
      {
        question: 'What is the difference between APR and APY?',
        answer:
          'APR is the basic yearly rate without compounding. APY includes the extra boost you get from compounding during the year, so APY shows what you actually earn in a year.',
      },
      {
        question: 'Does daily vs. monthly compounding make a big difference?',
        answer:
          'Compounding more often (like daily instead of yearly) gives you a slightly higher return because your interest starts earning its own interest sooner.',
      },
      {
        question: 'What is the Rule of 72?',
        answer:
          'It is a quick way to estimate how long it takes to double your money. Just divide 72 by your yearly return rate—for example, at an 8% return, 72 ÷ 8 = about 9 years to double.',
      },
      {
        question: 'How should I factor in inflation?',
        answer:
          'To see what your future savings would feel like in today’s money, subtract expected inflation (usually around 2.5% to 3%) from your yearly return rate.',
      },
    ],
  },
  {
    id: 'bmi',
    title: 'BMI & Healthy Weight Calculator',
    shortTitle: 'BMI Calculator',
    category: 'Health',
    popular: true,
    summary:
      'Check your Body Mass Index (BMI) in Metric or Imperial units and see the healthy weight range recommended for your height.',
    keywords: ['bmi', 'body mass index', 'weight', 'height', 'health', 'fitness', 'obesity', 'ideal weight'],
    formulaTitle: 'Standard BMI Formula',
    formulaExpression: 'BMI = Weight (kg) ÷ [Height (m)]²   |   US/Imperial: 703 × Weight (lbs) ÷ [Height (in)]²',
    formulaVariables: [
      { symbol: 'Weight', meaning: 'Your body weight in kilograms (kg) or pounds (lbs)' },
      { symbol: 'Height', meaning: 'Your height in meters (m) or inches (in)' },
      { symbol: '703', meaning: 'Conversion number used when measuring in pounds and inches' },
    ],
    formulaExplanation:
      'Body Mass Index (BMI) is a simple ratio of your weight compared to your height. Doctors and health organizations use it as a quick starting point to group adult weight ranges: Underweight (under 18.5), Normal Weight (18.5 to 24.9), Overweight (25.0 to 29.9), and Obese (30.0 or higher).',
    exampleTitle: 'Example: Weighing 72 kg at 176 cm Tall',
    exampleScenario:
      'Let’s find the BMI and healthy weight range for someone who is 176 cm tall and weighs 72 kg.',
    exampleSteps: [
      'Convert height from centimeters to meters: 176 cm ÷ 100 = 1.76 meters.',
      'Multiply height by itself: 1.76 × 1.76 = 3.0976.',
      'Divide weight by that number: 72 ÷ 3.0976 = 23.2 BMI.',
      'Since 23.2 is between 18.5 and 24.9, it falls right in the Normal Weight range (57.3 kg to 77.1 kg for this height).',
    ],
    exampleConclusion:
      'A BMI of 23.2 is in the middle of the healthy weight range (57.3 kg – 77.1 kg) for someone 176 cm tall.',
    faqs: [
      {
        question: 'Is BMI accurate if I lift weights or have a lot of muscle?',
        answer:
          'Not always. BMI only looks at total weight, not how much of that weight is muscle versus fat. People who are very muscular often have a high BMI even when their body fat is low.',
      },
      {
        question: 'What are the standard adult BMI ranges?',
        answer:
          'Below 18.5 is Underweight, 18.5 to 24.9 is Normal Weight, 25.0 to 29.9 is Overweight, and 30.0 or above is Obese.',
      },
      {
        question: 'Is the BMI scale different for men and women?',
        answer:
          'For adults 20 and older, the standard BMI chart is the same for both men and women. For kids and teenagers, doctors use age- and gender-based growth charts instead.',
      },
      {
        question: 'What else can I check besides BMI?',
        answer:
          'Measuring your waist size is a great companion check—a common rule of thumb is to keep your waist measurement under half of your height.',
      },
    ],
  },
  {
    id: 'tdee',
    title: 'Daily Calorie & TDEE Calculator',
    shortTitle: 'Calorie & TDEE',
    category: 'Health',
    popular: false,
    summary:
      'Find out how many calories you burn each day and get simple daily calorie and protein targets to lose weight, maintain, or build muscle.',
    keywords: ['tdee', 'calorie', 'deficit', 'bmr', 'macros', 'weight loss', 'nutrition', 'metabolism'],
    formulaTitle: 'Mifflin-St Jeor Daily Calorie Formula',
    formulaExpression: 'BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + s   |   TDEE = BMR × Activity',
    formulaVariables: [
      { symbol: 'BMR', meaning: 'Calories your body burns per day at complete rest' },
      { symbol: 's', meaning: '+5 for men, or -161 for women' },
      { symbol: 'Activity', meaning: 'Activity multiplier from 1.2 (desk job) to 1.9 (very active)' },
      { symbol: 'TDEE', meaning: 'Total daily calories burned including movement and exercise' },
    ],
    formulaExplanation:
      'Your body burns calories all day just breathing, circulating blood, and digesting food (your BMR). Multiplying that number by how active you are gives your maintenance calories (TDEE). Eating about 500 fewer calories than your TDEE each day leads to roughly 1 pound (0.45 kg) of weight loss per week.',
    exampleTitle: 'Example: 30-Year-Old Man, 80 kg, 180 cm, Exercising 3–5 Days a Week',
    exampleScenario:
      'A 30-year-old man weighs 80 kg, is 180 cm tall, works out 3 to 5 times a week, and wants to lose about 1 pound per week.',
    exampleSteps: [
      'Calculate resting burn (BMR): (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 1,780 calories/day.',
      'Multiply by moderate activity (1.55): 1,780 × 1.55 = 2,759 calories/day to maintain weight.',
      'Subtract 500 calories a day for steady weight loss: 2,759 - 500 = 2,259 calories/day target.',
      'Split into balanced daily macros: 169g protein, 226g carbs, and 75g healthy fats.',
    ],
    exampleConclusion:
      'Eating around 2,259 calories a day with 169g of protein supports steady, healthy fat loss without losing muscle.',
    faqs: [
      {
        question: 'How big of a calorie deficit is safe for weight loss?',
        answer:
          'Cutting 300 to 500 calories below your daily maintenance level is the sweet spot for most people—it helps you lose weight steadily without feeling exhausted or overly hungry.',
      },
      {
        question: 'Should I eat fewer calories than my resting BMR?',
        answer:
          'It is best not to eat below your resting BMR for long periods without talking to a doctor, since your body needs that baseline energy for everyday health.',
      },
      {
        question: 'When should I update my calorie target?',
        answer:
          'Recalculate your numbers every time your weight changes by about 10 pounds (4–5 kg), or if your workout routine changes.',
      },
      {
        question: 'Why does protein matter when losing weight?',
        answer:
          'Protein keeps you full longer and helps your body hold onto muscle while you lose fat.',
      },
    ],
  },
  {
    id: 'percentage',
    title: '3-in-1 Percentage Calculator',
    shortTitle: 'Percentage',
    category: 'Math',
    popular: true,
    summary:
      'Solve all three everyday percentage questions at once: find X% of a number, see what percent one number is of another, and calculate percent increase or decrease.',
    keywords: ['percentage', 'percent change', 'percent increase', 'math', 'ratio', 'fraction'],
    formulaTitle: 'Three Everyday Percentage Formulas',
    formulaExpression: '1) Part = (P ÷ 100) × Total   |   2) % = (Part ÷ Total) × 100   |   3) % Change = ((New - Old) ÷ Old) × 100',
    formulaVariables: [
      { symbol: 'Part', meaning: 'The share or tip amount you get when taking P% of a number' },
      { symbol: 'P', meaning: 'The percentage (out of 100)' },
      { symbol: 'Total', meaning: 'The starting or whole number' },
      { symbol: '% Change', meaning: 'How much a number went up (+) or down (-) in percent' },
    ],
    formulaExplanation:
      '"Percent" simply means "out of 100." Whether you are figuring out a restaurant tip, checking a test score, or seeing how much a price went up, every percentage question uses one of these three simple formulas.',
    exampleTitle: 'Example: Restaurant Tip, Test Score, and Price Change',
    exampleScenario:
      'Here is one quick example for each of the three panels in this calculator:',
    exampleSteps: [
      '15% tip on an $84 bill: (15 ÷ 100) × 84 = $12.60.',
      '45 points out of 180 on a test: (45 ÷ 180) × 100 = 25%.',
      'Rent going from $1,200 to $1,500: ((1,500 - 1,200) ÷ 1,200) × 100 = +25% increase.',
    ],
    exampleConclusion:
      'All three boxes update as soon as you type, so you can solve any percentage problem in seconds.',
    faqs: [
      {
        question: 'Why doesn’t a 20% increase followed by a 20% decrease bring me back to the same number?',
        answer:
          'Because the second 20% is taken from the new, bigger number. For example, $100 + 20% is $120, and 20% off $120 is $24—leaving you with $96.',
      },
      {
        question: 'What is the difference between percent change and percentage points?',
        answer:
          'If a mortgage rate goes from 4% to 5%, it rose by 1 percentage point, which is a 25% increase relative to where it started ((5 - 4) ÷ 4 = 25%).',
      },
      {
        question: 'Can you calculate percent change starting from zero?',
        answer:
          'No, because you cannot divide by zero. If something starts at 0 and grows to 50, we just state the actual increase (+50).',
      },
    ],
  },
  {
    id: 'discount-tax',
    title: 'Discount & Sales Tax Calculator',
    shortTitle: 'Discount & Tax',
    category: 'Math',
    popular: false,
    summary:
      'Find the final checkout price of any item after a store sale, an extra coupon code, and local sales tax.',
    keywords: ['discount', 'sales tax', 'shopping', 'retail', 'coupon', 'savings', 'price'],
    formulaTitle: 'Sale Price & Sales Tax Formula',
    formulaExpression: 'Sale Price = Original × (1 - Sale%/100) × (1 - Coupon%/100)   |   Total = Sale Price × (1 + Tax%/100)',
    formulaVariables: [
      { symbol: 'Original', meaning: 'The sticker price before any discounts' },
      { symbol: 'Sale%', meaning: 'The main store discount percentage' },
      { symbol: 'Coupon%', meaning: 'Any extra coupon applied after the first discount' },
      { symbol: 'Sale Price', meaning: 'Price after all discounts, before tax' },
      { symbol: 'Tax%', meaning: 'Your local sales tax rate' },
    ],
    formulaExplanation:
      'When a store offers "30% off plus an extra 10% coupon," they don’t add up to 40% off. Instead, the 30% comes off first, and then the extra 10% comes off the new reduced price. Finally, sales tax is added to that discounted subtotal.',
    exampleTitle: 'Example: $150 Jacket at 30% Off + Extra 10% Coupon + 8.25% Tax',
    exampleScenario:
      'You are buying a $150 jacket that is 30% off, and you also have a 10% coupon code. Local sales tax is 8.25%.',
    exampleSteps: [
      'Take 30% off $150: you save $45.00, bringing the price down to $105.00.',
      'Apply the extra 10% coupon to $105.00: you save another $10.50, making the pre-tax price $94.50.',
      'Your total savings are $55.50 (which equals 37% off the original price).',
      'Add 8.25% sales tax on $94.50 ($7.80 tax) to get your final checkout total of $102.30.',
    ],
    exampleConclusion:
      'You pay $102.30 at the register and save $55.50 off the original $150 price tag.',
    faqs: [
      {
        question: 'Why is 30% off plus an extra 10% off equal to 37% off instead of 40%?',
        answer:
          'Because the extra 10% is taken off the already-discounted price (70% of the original), which adds 7% more savings (30% + 7% = 37%).',
      },
      {
        question: 'Is sales tax charged before or after discounts?',
        answer:
          'In most places, store sales and retailer coupons lower the price first, and sales tax is only charged on the final discounted price.',
      },
      {
        question: 'Does it matter which discount is applied first?',
        answer:
          'No! Taking 30% off and then 10% off gives the exact same final price as taking 10% off and then 30% off.',
      },
    ],
  },
  {
    id: 'age-date',
    title: 'Age & Date Difference Calculator',
    shortTitle: 'Age & Date',
    category: 'Math',
    popular: false,
    summary:
      'Calculate exact age or the time between any two dates in years, months, weeks, days, and hours—including a countdown to the next birthday.',
    keywords: ['age', 'date difference', 'birthday', 'chronological age', 'days between dates', 'calendar'],
    formulaTitle: 'Calendar Date Difference Method',
    formulaExpression: 'Difference = (End Year - Start Year), adjusted for exact month lengths and leap years',
    formulaVariables: [
      { symbol: 'Start Date', meaning: 'Birth date or the day an event started' },
      { symbol: 'End Date', meaning: 'Today’s date or any target date in the future/past' },
      { symbol: 'Total Days', meaning: 'Exact number of calendar days between the two dates (including leap days)' },
    ],
    formulaExplanation:
      'Because months have different lengths (28, 29, 30, or 31 days), this calculator counts full calendar years and months first, then counts the remaining days, and also totals up the exact number of weeks, days, and hours including leap years.',
    exampleTitle: 'Example: From May 15, 2000 to November 6, 2026',
    exampleScenario:
      'Let’s find the exact age of someone born on May 15, 2000 as of November 6, 2026.',
    exampleSteps: [
      'From May 15, 2000 to May 15, 2026 is exactly 26 full years.',
      'From May 15, 2026 to October 15, 2026 is 5 full months.',
      'From October 15, 2026 to November 6, 2026 is 22 days (since October has 31 days).',
      'Counting every single day (including all 6 leap years in between) gives 9,671 total days.',
    ],
    exampleConclusion:
      'The exact age is 26 years, 5 months, and 22 days (or 9,671 days in total).',
    faqs: [
      {
        question: 'Does this include leap years (February 29)?',
        answer:
          'Yes, every leap year between your two dates is automatically included in the total days, weeks, and hours.',
      },
      {
        question: 'Can I use this to count days until a vacation or project deadline?',
        answer:
          'Yes! Just set the first date to Today and the second date to your trip or deadline to see the exact weeks and days remaining.',
      },
      {
        question: 'What if I put the later date in the first box?',
        answer:
          'No problem—the calculator automatically figures out the time between the two dates either way.',
      },
    ],
  },
  {
    id: 'word-counter',
    title: 'Word, Character & Reading Time Counter',
    shortTitle: 'Word Counter',
    category: 'Text',
    popular: true,
    summary:
      'Count words, characters, sentences, and paragraphs as you type, and see reading time, speaking time, and top repeated words.',
    keywords: ['word counter', 'character count', 'reading time', 'text analyzer', 'keyword density', 'essay'],
    formulaTitle: 'Reading & Speaking Time Benchmarks',
    formulaExpression: 'Reading Time = Words ÷ 225 words/min   |   Speaking Time = Words ÷ 130 words/min',
    formulaVariables: [
      { symbol: 'Words', meaning: 'Total words in your text' },
      { symbol: '225 wpm', meaning: 'Average silent reading speed for adults' },
      { symbol: '130 wpm', meaning: 'Natural speaking pace for presentations and speeches' },
      { symbol: 'Keyword %', meaning: 'How often a word appears compared to total words' },
    ],
    formulaExplanation:
      'Whether you are writing an essay, a social media post, or a speech, keeping track of length helps you stay within limits. This tool counts words and characters instantly and estimates how long your text takes to read silently or say out loud.',
    exampleTitle: 'Example: A 900-Word Article or Speech',
    exampleScenario:
      'Suppose you write a 900-word blog post or presentation script.',
    exampleSteps: [
      'Silent reading time: 900 words ÷ 225 words per minute = 4 minutes.',
      'Speaking out loud: 900 words ÷ 130 words per minute = about 6 minutes and 55 seconds.',
      'If a main topic word appears 18 times, it makes up 2% of the article (18 ÷ 900).',
    ],
    exampleConclusion:
      'A 900-word piece takes about 4 minutes to read silently or just under 7 minutes to read aloud.',
    faqs: [
      {
        question: 'What are the character limits for social media and Google search?',
        answer:
          'Google page titles work best under 60 characters, meta descriptions under 160 characters, X (Twitter) posts allow 280 characters, and LinkedIn posts allow up to 3,000 characters.',
      },
      {
        question: 'How do you estimate reading and speaking time?',
        answer:
          'We use the standard average of 225 words per minute for silent reading and 130 words per minute for speaking clearly in front of an audience.',
      },
      {
        question: 'Is the text I paste here private?',
        answer:
          'Yes, 100%. Everything you type or paste stays right inside your browser tab and is never sent to any server.',
      },
    ],
  },
  {
    id: 'sip-retirement',
    title: 'Retirement & Monthly SIP Calculator',
    shortTitle: 'Retirement & SIP',
    category: 'Finance',
    popular: true,
    summary:
      'Plan your retirement savings with monthly investments, yearly step-up increases, inflation adjustment, and safe monthly retirement income.',
    keywords: ['sip', 'retirement', 'fire corpus', 'step up sip', 'mutual fund', 'inflation', 'safe withdrawal rate'],
    formulaTitle: 'Inflation-Adjusted Retirement & 4% Rule Formula',
    formulaExpression: 'Real Value = Future Balance ÷ (1 + Inflation)^Years   |   Monthly Income = (Real Value × 4%) ÷ 12',
    formulaVariables: [
      { symbol: 'Monthly SIP', meaning: 'Amount you invest every month in Year 1' },
      { symbol: 'Step-Up %', meaning: 'How much you increase your monthly investment each year' },
      { symbol: 'Return %', meaning: 'Expected yearly investment return' },
      { symbol: 'Inflation %', meaning: 'Expected yearly rise in cost of living' },
      { symbol: '4% Rule', meaning: 'A widely used rule of thumb for safe yearly retirement withdrawals' },
    ],
    formulaExplanation:
      'Increasing your monthly savings by a small percentage each year (as your income grows) builds a much larger nest egg. Adjusting that total for inflation shows what your money will actually buy in today’s prices, and the 4% rule estimates how much monthly income your savings can safely provide in retirement.',
    exampleTitle: 'Example: $500/Month Increasing by 10% a Year for 20 Years',
    exampleScenario:
      'You start investing $500 a month, increase that amount by 10% each year, earn 12% per year for 20 years, and account for 3% inflation.',
    exampleSteps: [
      'In Year 1 you invest $500/month; in Year 2 you invest $550/month, and so on for 20 years.',
      'Over 20 years, you put in $343,650 of your own money.',
      'With 12% yearly growth, your account balance reaches $994,442.',
      'Adjusted for 3% yearly inflation, that equals $550,599 in today’s buying power.',
      'Using the 4% rule, that supports about $1,835/month in today’s buying power during retirement.',
    ],
    exampleConclusion:
      'Increasing your monthly investment by 10% a year nearly doubles your final retirement savings compared to keeping your monthly deposit flat.',
    faqs: [
      {
        question: 'What is a Step-Up SIP?',
        answer:
          'It simply means raising your monthly investment by a set percentage (like 5% or 10%) once a year as your paycheck grows, which speeds up your savings dramatically.',
      },
      {
        question: 'What is the 4% retirement rule?',
        answer:
          'It is a classic retirement guideline suggesting you can withdraw 4% of your savings per year (adjusted for inflation) with a high chance your money will last 30 years or more.',
      },
      {
        question: 'Why does the calculator show "Today’s Buying Power"?',
        answer:
          'Because prices rise over time due to inflation, $1 million 20 years from now won’t buy as much as $1 million today. Seeing the number in today’s dollars makes it much easier to plan.',
      },
    ],
  },
  {
    id: 'unit-converter',
    title: 'Everyday Unit Converter',
    shortTitle: 'Unit Converter',
    category: 'Math',
    popular: false,
    summary:
      'Quickly convert Length, Weight, Temperature, Area, Volume, and Speed between Metric and US/Imperial units.',
    keywords: ['unit converter', 'length', 'weight', 'temperature', 'celsius to fahrenheit', 'kg to lbs', 'miles to km'],
    formulaTitle: 'Unit Conversion Formula',
    formulaExpression: 'Result = Input × (From Unit Factor ÷ To Unit Factor)   |   °F = (°C × 9/5) + 32',
    formulaVariables: [
      { symbol: 'Input', meaning: 'The number you want to convert' },
      { symbol: 'From / To Factor', meaning: 'Exact conversion ratio between the two units' },
      { symbol: '°C / °F / K', meaning: 'Celsius, Fahrenheit, and Kelvin temperature scales' },
    ],
    formulaExplanation:
      'This tool converts measurements accurately by using official standard conversion factors (such as 1 mile = 1.609344 kilometers, and 1 kilogram = 2.20462 pounds), plus showing a full reference table for all other units in the same category.',
    exampleTitle: 'Example: Converting 5 Miles to Kilometers and 100°F to Celsius',
    exampleScenario:
      'Let’s convert a 5-mile run into kilometers, and a 100°F summer day into Celsius.',
    exampleSteps: [
      'Miles to Kilometers: multiply 5 miles by 1.609344 = 8.05 kilometers.',
      'Fahrenheit to Celsius: subtract 32 from 100°F to get 68, then multiply by 5/9 = 37.78°C.',
    ],
    exampleConclusion:
      '5 miles is 8.05 kilometers, and 100°F is 37.78°C.',
    faqs: [
      {
        question: 'How many kilometers is a 5K race in miles?',
        answer:
          '5 kilometers is equal to 3.11 miles.',
      },
      {
        question: 'At what temperature are Celsius and Fahrenheit the exact same number?',
        answer:
          'They meet at -40 degrees (-40°C is the exact same temperature as -40°F).',
      },
      {
        question: 'How many square feet are in 1 acre?',
        answer:
          'One acre is exactly 43,560 square feet (or about 4,047 square meters).',
      },
    ],
  },
];
