/**
 * Client-side security hardening, XSS sanitization, and local storage isolation
 * for OmniCalc. Ensures no untrusted input can inject scripts or DOM attributes,
 * and zero owner or backend telemetry is exposed.
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /on\w+\s*=\s*[^\s>]+/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<\/?[a-z][^>]*>/gi,
];

/**
 * Strips potentially malicious HTML/script tags and inline event handlers
 * from user-supplied text while preserving normal prose and punctuation.
 */
export function sanitizeUserText(input: string, maxLength: number = 50000): string {
  if (typeof input !== 'string') return '';
  let cleaned = input.slice(0, maxLength);
  for (const pattern of DANGEROUS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned;
}

/**
 * Sanitizes single-line search and form fields by removing HTML angle brackets
 * and control characters.
 */
export function sanitizeSingleLineInput(input: string, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  return sanitizeUserText(input, maxLength)
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '');
}

/**
 * Clamps numeric inputs safely against NaN, Infinity, or out-of-bounds injection.
 */
export function clampSafeNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export interface SavedCalculationItem {
  id: string;
  calculatorId: string;
  calculatorTitle: string;
  primaryResult: string;
  detailSummary: string;
  timestampLabel: string;
}

const HISTORY_STORAGE_KEY = 'omnicalc_saved_history_v1';
const FAVORITES_STORAGE_KEY = 'omnicalc_pinned_calculators_v1';

export function loadSavedCalculations(): SavedCalculationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 12).map((item) => ({
      id: sanitizeSingleLineInput(String(item.id ?? ''), 64),
      calculatorId: sanitizeSingleLineInput(String(item.calculatorId ?? ''), 40),
      calculatorTitle: sanitizeSingleLineInput(String(item.calculatorTitle ?? ''), 80),
      primaryResult: sanitizeSingleLineInput(String(item.primaryResult ?? ''), 80),
      detailSummary: sanitizeSingleLineInput(String(item.detailSummary ?? ''), 140),
      timestampLabel: sanitizeSingleLineInput(String(item.timestampLabel ?? ''), 40),
    }));
  } catch {
    return [];
  }
}

export function saveCalculationToHistory(
  entry: Omit<SavedCalculationItem, 'id' | 'timestampLabel'>
): SavedCalculationItem[] {
  const existing = loadSavedCalculations();
  const now = new Date();
  const timestampLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newItem: SavedCalculationItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    calculatorId: sanitizeSingleLineInput(entry.calculatorId, 40),
    calculatorTitle: sanitizeSingleLineInput(entry.calculatorTitle, 80),
    primaryResult: sanitizeSingleLineInput(entry.primaryResult, 80),
    detailSummary: sanitizeSingleLineInput(entry.detailSummary, 140),
    timestampLabel,
  };
  const updated = [newItem, ...existing].slice(0, 10);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota errors
    }
  }
  return updated;
}

export function clearSavedCalculations(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

export function loadPinnedFavorites(): string[] {
  if (typeof window === 'undefined') return ['loan-emi', 'compound-interest', 'bmi', 'percentage'];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return ['loan-emi', 'compound-interest', 'bmi', 'percentage'];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ['loan-emi', 'compound-interest', 'bmi', 'percentage'];
    return parsed.map((id) => sanitizeSingleLineInput(String(id), 40));
  } catch {
    return ['loan-emi', 'compound-interest', 'bmi', 'percentage'];
  }
}

export function savePinnedFavorites(ids: string[]): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids.slice(0, 8)));
    } catch {
      // Ignore
    }
  }
}
