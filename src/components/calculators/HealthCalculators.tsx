import React, { useState } from 'react';
import {
  calculateBmi,
  calculateTdee,
  Gender,
  ActivityLevel,
} from '../../utils/calculators';
import { RotateCcw } from 'lucide-react';

/**
 * 3. Health: BMI Calculator (with interactive visual health status gauge)
 */
export const BmiCalculator: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [weightKg, setWeightKg] = useState<number>(72);
  const [heightCm, setHeightCm] = useState<number>(176);

  // Imperial helper state synchronized with metric
  const [weightLbs, setWeightLbs] = useState<number>(159);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);

  const effectiveWeightKg =
    unitSystem === 'metric' ? weightKg : weightLbs * 0.45359237;
  const effectiveHeightCm =
    unitSystem === 'metric'
      ? heightCm
      : (heightFeet * 12 + heightInches) * 2.54;

  const result = calculateBmi(effectiveWeightKg, effectiveHeightCm);

  const getStatusColorText = () => {
    switch (result.category) {
      case 'Underweight':
        return 'text-sky-600 dark:text-sky-400';
      case 'Normal Weight':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'Overweight':
        return 'text-amber-600 dark:text-amber-400';
      case 'Obese':
        return 'text-rose-600 dark:text-rose-400';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            {/* Unit Toggle */}
            <div
              role="group"
              aria-label="Measurement Unit System"
              className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
            >
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  unitSystem === 'metric'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Metric (kg / cm)
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  unitSystem === 'imperial'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Imperial (lbs / ft)
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setWeightKg(72);
                setHeightCm(176);
                setWeightLbs(159);
                setHeightFeet(5);
                setHeightInches(9);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {unitSystem === 'metric' ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label
                    htmlFor="bmi-weight-kg"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Weight (kg)
                  </label>
                  <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  id="bmi-weight-kg"
                  type="number"
                  min={25}
                  max={300}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(25, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
                <input
                  type="range"
                  aria-label="Weight in kilograms slider"
                  min={35}
                  max={180}
                  step={1}
                  value={Math.min(180, weightKg)}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label
                    htmlFor="bmi-height-cm"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Height (cm)
                  </label>
                  <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {heightCm} cm
                  </span>
                </div>
                <input
                  id="bmi-height-cm"
                  type="number"
                  min={100}
                  max={250}
                  step={1}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(100, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
                <input
                  type="range"
                  aria-label="Height in centimeters slider"
                  min={120}
                  max={220}
                  step={1}
                  value={Math.min(220, heightCm)}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label
                    htmlFor="bmi-weight-lbs"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Weight (lbs)
                  </label>
                  <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {weightLbs} lbs
                  </span>
                </div>
                <input
                  id="bmi-weight-lbs"
                  type="number"
                  min={55}
                  max={660}
                  step={1}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Math.max(55, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="bmi-height-ft"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Height (Feet)
                  </label>
                  <input
                    id="bmi-height-ft"
                    type="number"
                    min={3}
                    max={8}
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(Math.max(3, Math.min(8, Number(e.target.value))))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="bmi-height-in"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Height (Inches)
                  </label>
                  <input
                    id="bmi-height-in"
                    type="number"
                    min={0}
                    max={11}
                    value={heightInches}
                    onChange={(e) => setHeightInches(Math.max(0, Math.min(11, Number(e.target.value))))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 tabular-nums"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Instant BMI Score & Interactive Visual Health Status Gauge */}
        <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Your Body Mass Index
              </div>
              <div
                data-testid="bmi-score-value"
                className="text-4xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5"
              >
                {result.bmi.toFixed(1)}
                <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400 ml-2">
                  kg/m²
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">WHO Classification</div>
              <div className={`text-lg font-bold mt-0.5 ${getStatusColorText()}`}>
                {result.category}
              </div>
            </div>
          </div>

          {/* Interactive Visual Health Status Gauge */}
          <div className="space-y-2.5 pt-2">
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              <span>12.0</span>
              <span>18.5</span>
              <span>25.0</span>
              <span>30.0</span>
              <span>40.0+</span>
            </div>

            <div className="relative pt-1 pb-3">
              {/* 4-Zone Health Spectrum Bar */}
              <div className="h-4 w-full rounded-full overflow-hidden flex">
                <div className="w-[23.2%] bg-sky-400 dark:bg-sky-500" title="Underweight (< 18.5)" />
                <div className="w-[23.2%] bg-emerald-500 dark:bg-emerald-500" title="Normal Weight (18.5 - 24.9)" />
                <div className="w-[17.9%] bg-amber-400 dark:bg-amber-500" title="Overweight (25.0 - 29.9)" />
                <div className="w-[35.7%] bg-rose-500 dark:bg-rose-500" title="Obese (≥ 30.0)" />
              </div>

              {/* Dynamic Marker Needle */}
              <div
                style={{ left: `${result.gaugePercent}%` }}
                className="absolute top-0 -translate-x-1/2 transition-all duration-150 flex flex-col items-center"
              >
                <div className="w-4 h-6 rounded-sm bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow-md" />
              </div>
            </div>

            <div className="grid grid-cols-4 text-[11px] text-center font-medium text-slate-600 dark:text-slate-400">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>

          {/* Healthy Weight Target Bracket */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-slate-400">Healthy Weight Range:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                {unitSystem === 'metric'
                  ? `${result.healthyWeightRangeKg[0].toFixed(1)} kg – ${result.healthyWeightRangeKg[1].toFixed(1)} kg`
                  : `${result.healthyWeightRangeLbs[0].toFixed(0)} lbs – ${result.healthyWeightRangeLbs[1].toFixed(0)} lbs`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.weightDeltaToNormalKg === 0
                ? 'Your current weight is within the WHO healthy BMI bracket (18.5 – 24.9).'
                : result.weightDeltaToNormalKg > 0
                ? `Reducing weight by ${
                    unitSystem === 'metric'
                      ? `${result.weightDeltaToNormalKg.toFixed(1)} kg`
                      : `${(result.weightDeltaToNormalKg * 2.20462).toFixed(1)} lbs`
                  } reaches a BMI of 24.9.`
                : `Gaining ${
                    unitSystem === 'metric'
                      ? `${Math.abs(result.weightDeltaToNormalKg).toFixed(1)} kg`
                      : `${(Math.abs(result.weightDeltaToNormalKg) * 2.20462).toFixed(1)} lbs`
                  } reaches a BMI of 18.5.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Health: TDEE / Daily Calorie Deficit Calculator
 */
export const TdeeCalculator: React.FC = () => {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(80);
  const [heightCm, setHeightCm] = useState<number>(180);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goalOffset, setGoalOffset] = useState<number>(-500);

  const result = calculateTdee(gender, age, weightKg, heightCm, activity, goalOffset);
  const selectedTargetCalories = Math.max(1200, result.tdee + goalOffset);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between">
            <div
              role="group"
              aria-label="Biological Sex"
              className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
            >
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  gender === 'male'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  gender === 'female'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Female
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setGender('male');
                setAge(30);
                setWeightKg(80);
                setHeightCm(180);
                setActivity('moderate');
                setGoalOffset(-500);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="tdee-age" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Age (Years)
              </label>
              <input
                id="tdee-age"
                type="number"
                min={15}
                max={100}
                value={age}
                onChange={(e) => setAge(Math.max(15, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tdee-weight" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Weight (kg)
              </label>
              <input
                id="tdee-weight"
                type="number"
                min={30}
                max={250}
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(30, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tdee-height" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Height (cm)
              </label>
              <input
                id="tdee-height"
                type="number"
                min={100}
                max={240}
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(100, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tdee-activity" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Weekly Activity Level
            </label>
            <select
              id="tdee-activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              <option value="sedentary">Sedentary (Desk job, little or no exercise · ×1.2)</option>
              <option value="light">Lightly Active (Light exercise 1–3 days/week · ×1.375)</option>
              <option value="moderate">Moderately Active (Moderate training 3–5 days/week · ×1.55)</option>
              <option value="active">Very Active (Hard training 6–7 days/week · ×1.725)</option>
              <option value="athlete">Athlete / Physical Job (2× daily training · ×1.9)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tdee-goal" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Calorie Goal Adjustment
            </label>
            <select
              id="tdee-goal"
              value={goalOffset}
              onChange={(e) => setGoalOffset(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            >
              <option value={-750}>Aggressive Fat Loss (-750 kcal/day · ~0.75 kg/wk)</option>
              <option value={-500}>Standard Calorie Deficit (-500 kcal/day · ~0.5 kg/wk)</option>
              <option value={-250}>Mild Calorie Deficit (-250 kcal/day · ~0.25 kg/wk)</option>
              <option value={0}>Weight Maintenance (0 kcal offset)</option>
              <option value={250}>Lean Muscle Gain (+250 kcal/day surplus)</option>
            </select>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Maintenance TDEE
              </div>
              <div
                data-testid="tdee-maintenance-calories"
                className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5"
              >
                {result.tdee.toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-slate-500">kcal/day</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Daily Goal Target
              </div>
              <div
                data-testid="tdee-target-calories"
                className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5"
              >
                {selectedTargetCalories.toLocaleString()}{' '}
                <span className="text-xs font-sans font-normal text-slate-500">kcal/day</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Resting BMR</span>
              <div className="font-mono font-semibold text-slate-900 dark:text-white text-sm mt-0.5 tabular-nums">
                {result.bmr.toLocaleString()} kcal
              </div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">-500 Deficit</span>
              <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 tabular-nums">
                {result.standardDeficitCalories.toLocaleString()} kcal
              </div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">+250 Lean Bulk</span>
              <div className="font-mono font-semibold text-amber-600 dark:text-amber-400 text-sm mt-0.5 tabular-nums">
                {result.leanBulkCalories.toLocaleString()} kcal
              </div>
            </div>
          </div>

          {/* Balanced Macronutrient Breakdown */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Recommended Daily Macros (30% Protein / 40% Carbs / 30% Fat)
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Protein</div>
                <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {result.macrosForTarget.proteinGrams}g
                </div>
                <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {result.macrosForTarget.proteinGrams * 4} kcal
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Carbohydrates</div>
                <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {result.macrosForTarget.carbsGrams}g
                </div>
                <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {result.macrosForTarget.carbsGrams * 4} kcal
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Healthy Fats</div>
                <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {result.macrosForTarget.fatGrams}g
                </div>
                <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {result.macrosForTarget.fatGrams * 9} kcal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
