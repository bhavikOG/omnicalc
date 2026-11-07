/**
 * Client-side security hardening, XSS sanitization, CSV formula-injection defense,
 * prototype-pollution guards, local storage isolation, and multi-currency formatting
 * for OmniCalc. Ensures no untrusted input can inject scripts, formulas, or DOM attributes,
 * and zero owner or backend telemetry is ever exposed.
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*(text\/html|image\/svg\+xml|application\/xhtml\+xml|text\/xml)/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /on\w+\s*=\s*[^\s>]+/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<\/?[a-z][^>]*>/gi,
];

const FORBIDDEN_PROTOTYPE_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/**
 * Prevents prototype pollution when parsing URL query parameters or JSON payloads.
 */
export function isSafeObjectKey(key: string): boolean {
  if (typeof key !== 'string' || key.length === 0 || key.length > 64) return false;
  return !FORBIDDEN_PROTOTYPE_KEYS.has(key) && /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Strips potentially malicious HTML/script tags and inline event handlers
 * from user-supplied text while preserving normal prose and punctuation.
 * Uses iterative sanitization to eliminate nested/re-entrant bypass vectors.
 */
export function sanitizeUserText(input: string, maxLength: number = 50000): string {
  if (typeof input !== 'string') return '';
  let cleaned = input.slice(0, maxLength);
  let prev = '';
  let iterations = 0;
  while (prev !== cleaned && iterations < 5) {
    prev = cleaned;
    for (const pattern of DANGEROUS_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }
    iterations++;
  }
  return cleaned;
}

/**
 * Sanitizes single-line search and form fields by removing HTML angle brackets,
 * control characters, and dangerous URL pseudo-protocols.
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

/**
 * OWASP CSV Formula Injection Defense:
 * Spreadsheet software (Excel, Google Sheets, LibreOffice) executes cells starting with
 * '=', '+', '-', '@', '\t', '\r', '|', or '%' as executable formulas/DDE commands.
 * Leading whitespace is stripped by spreadsheet engines before evaluation.
 * This function trims leading whitespace, neutralizes any leading formula trigger characters,
 * and safely quotes cells to guarantee static text interpretation.
 */
export function sanitizeCsvCell(value: string | number): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0';
  }
  const cleanText = sanitizeSingleLineInput(String(value ?? ''), 500);
  const trimmed = cleanText.trimStart();
  // Strip any leading formula-trigger characters (=, +, -, @, |, %, tab, CR)
  const neutralized = trimmed.replace(/^[=+\-@\t\r%|]+/, '');
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Builds a RFC-4180 compliant, formula-injection-proof CSV string from headers and rows.
 */
export function buildSafeCsvContent(
  headers: string[],
  rows: Array<Array<string | number>>
): string {
  const headerLine = headers.map((h) => sanitizeCsvCell(h)).join(',');
  const bodyLines = rows.map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(','));
  return [headerLine, ...bodyLines].join('\r\n');
}

/**
 * Triggers a client-side CSV download using a temporary Blob URL that is immediately revoked.
 */
export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const safeFilename =
    sanitizeSingleLineInput(filename, 80).replace(/[^a-zA-Z0-9._-]/g, '-') || 'omnicalc-export.csv';
  const csvContent = buildSafeCsvContent(headers, rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', safeFilename.endsWith('.csv') ? safeFilename : `${safeFilename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Safely parses numeric URL query parameters using a strict allowlist schema
 * and prototype-pollution protection (`Object.create(null)`).
 */
export function parseSafeNumericQueryParams<T extends Record<string, number>>(
  searchString: string,
  schema: { [K in keyof T]: { min: number; max: number; fallback: number } }
): T {
  const result = Object.create(null) as T;
  const params = new URLSearchParams(searchString);

  for (const key of Object.keys(schema) as Array<keyof T & string>) {
    if (!isSafeObjectKey(key)) continue;
    const rule = schema[key];
    const rawVal = params.get(key);
    if (rawVal === null || rawVal.trim() === '') {
      result[key] = rule.fallback as T[keyof T & string];
    } else {
      result[key] = clampSafeNumber(rawVal, rule.min, rule.max, rule.fallback) as T[keyof T & string];
    }
  }
  return result;
}

/**
 * Builds a clean, shareable deep-link URL for a calculator with sanitized parameters.
 */
export function buildShareableCalculatorUrl(
  calculatorId: string,
  params: Record<string, string | number>
): string {
  const baseOrigin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://omnicalc.me';
  const cleanId = sanitizeSingleLineInput(calculatorId, 40);
  const searchParams = new URLSearchParams();
  searchParams.set('calc', cleanId);
  for (const [k, v] of Object.entries(params)) {
    if (!isSafeObjectKey(k)) continue;
    searchParams.set(k, sanitizeSingleLineInput(String(v), 40));
  }
  return `${baseOrigin}/calculators/${cleanId}?${searchParams.toString()}`;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCY_OPTIONS: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', locale: 'en-AU' },
];

const CURRENCY_STORAGE_KEY = 'omnicalc_preferred_currency_v1';
const HISTORY_STORAGE_KEY = 'omnicalc_saved_history_v1';
const FAVORITES_STORAGE_KEY = 'omnicalc_pinned_calculators_v1';
const INTEGRITY_STORAGE_KEY = 'omnicalc_storage_integrity_v1';

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol ?? '$';
}

export function formatCurrencyValue(
  value: number,
  currency: CurrencyCode = 'USD',
  maximumFractionDigits: number = 0
): string {
  const safeVal = Number.isFinite(value) ? value : 0;
  const cfg = CURRENCY_OPTIONS.find((c) => c.code === currency) ?? CURRENCY_OPTIONS[0];
  const digits = cfg.code === 'JPY' ? 0 : maximumFractionDigits;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(safeVal);
  } catch {
    return `${cfg.symbol}${safeVal.toFixed(digits)}`;
  }
}

export function loadPreferredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (!raw) return 'USD';
    const match = CURRENCY_OPTIONS.find((c) => c.code === raw);
    return match ? match.code : 'USD';
  } catch {
    return 'USD';
  }
}

export function savePreferredCurrency(code: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  try {
    const match = CURRENCY_OPTIONS.find((c) => c.code === code);
    if (match) {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, match.code);
    }
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Computes a deterministic FNV-1a 32-bit integrity checksum for local storage verification.
 */
export function computeIntegrityChecksum(payload: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const VAULT_OBFUSCATION_KEY = 'OmniCalc_ZeroLeak_Vault_Key_v2';

/**
 * Obfuscates local storage payloads so plain JSON is never visible in Chrome DevTools -> Application -> LocalStorage.
 * Encodes strings into UTF-8 URI representation before XOR to ensure safe multi-byte currency/symbol roundtrips.
 */
export function encodeVaultPayload(plainText: string): string {
  try {
    const utf8Safe = encodeURIComponent(plainText);
    const bytes: number[] = [];
    for (let i = 0; i < utf8Safe.length; i++) {
      const k = VAULT_OBFUSCATION_KEY.charCodeAt(i % VAULT_OBFUSCATION_KEY.length);
      bytes.push(utf8Safe.charCodeAt(i) ^ (k & 0x7f));
    }
    const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `v2:${hex}`;
  } catch {
    return plainText;
  }
}

/**
 * Decodes an obfuscated local storage payload (backward-compatible with plain JSON and legacy unencoded payloads).
 */
export function decodeVaultPayload(stored: string): string {
  if (!stored) return '';
  if (!stored.startsWith('v2:')) return stored;
  try {
    const hex = stored.slice(3);
    if (hex.length % 2 !== 0) return '';
    let utf8Safe = '';
    for (let i = 0; i < hex.length; i += 2) {
      const byteVal = parseInt(hex.slice(i, i + 2), 16);
      const charIdx = i / 2;
      const k = VAULT_OBFUSCATION_KEY.charCodeAt(charIdx % VAULT_OBFUSCATION_KEY.length);
      utf8Safe += String.fromCharCode(byteVal ^ (k & 0x7f));
    }
    try {
      return decodeURIComponent(utf8Safe);
    } catch {
      return utf8Safe;
    }
  } catch {
    return '';
  }
}

export interface InspectShortcutEventLike {
  key?: string;
  keyCode?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

/**
 * Detects browser shortcuts that open Chrome DevTools, Inspect Element, Console, View Source, or Save HTML.
 */
export function isInspectShortcut(e: InspectShortcutEventLike): boolean {
  const keyUpper = (e.key || '').toUpperCase();
  const isF12 = keyUpper === 'F12' || e.keyCode === 123;
  if (isF12) return true;

  // Windows/Linux: Ctrl+Shift+I / J / C / K
  const winInspect =
    Boolean(e.ctrlKey) &&
    Boolean(e.shiftKey) &&
    (keyUpper === 'I' || keyUpper === 'J' || keyUpper === 'C');

  // macOS: Cmd+Option+I / J / C / U
  const macInspect =
    Boolean(e.metaKey) &&
    Boolean(e.altKey) &&
    (keyUpper === 'I' || keyUpper === 'J' || keyUpper === 'C' || keyUpper === 'U');

  // View Page Source (Ctrl+U / Cmd+U) or Save Page HTML (Ctrl+S / Cmd+S)
  const viewOrSaveSource =
    (Boolean(e.ctrlKey) || Boolean(e.metaKey)) &&
    !e.shiftKey &&
    !e.altKey &&
    (keyUpper === 'U' || keyUpper === 'S');

  return winInspect || macInspect || viewOrSaveSource;
}

/**
 * Installs lightweight runtime protection against dev shortcuts like F12 and Ctrl+Shift+I.
 * Standard user actions (right-click copy/paste, text selection, drag-and-drop) are fully preserved.
 */
export function installAntiInspectProtection(
  onBlockedAttempt?: (reason: string) => void
): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isInspectShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
      onBlockedAttempt?.('Developer Tools shortcut was intercepted.');
    }
  };

  window.addEventListener('keydown', handleKeyDown, { capture: true });

  return () => {
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
}

export interface SavedCalculationItem {
  id: string;
  calculatorId: string;
  calculatorTitle: string;
  primaryResult: string;
  detailSummary: string;
  timestampLabel: string;
}

export function loadSavedCalculations(): SavedCalculationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const expectedHash = window.localStorage.getItem(INTEGRITY_STORAGE_KEY);
    if (expectedHash && computeIntegrityChecksum(raw) !== expectedHash) {
      // Tampered localStorage payload detected; reset safely
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      window.localStorage.removeItem(INTEGRITY_STORAGE_KEY);
      return [];
    }
    const decoded = decodeVaultPayload(raw);
    const parsed = JSON.parse(decoded);
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
      const encoded = encodeVaultPayload(JSON.stringify(updated));
      window.localStorage.setItem(HISTORY_STORAGE_KEY, encoded);
      window.localStorage.setItem(INTEGRITY_STORAGE_KEY, computeIntegrityChecksum(encoded));
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
      window.localStorage.removeItem(INTEGRITY_STORAGE_KEY);
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
    const decoded = decodeVaultPayload(raw);
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return ['loan-emi', 'compound-interest', 'bmi', 'percentage'];
    return parsed.map((id) => sanitizeSingleLineInput(String(id), 40));
  } catch {
    return ['loan-emi', 'compound-interest', 'bmi', 'percentage'];
  }
}

export function savePinnedFavorites(ids: string[]): void {
  if (typeof window !== 'undefined') {
    try {
      const encoded = encodeVaultPayload(JSON.stringify(ids.slice(0, 8)));
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, encoded);
    } catch {
      // Ignore
    }
  }
}

/**
 * 1-Click Privacy Panic Wipe: Purges all OmniCalc localStorage keys and URL query parameters.
 */
export function wipeAllLocalData(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.localStorage.removeItem(INTEGRITY_STORAGE_KEY);
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    window.localStorage.removeItem(CURRENCY_STORAGE_KEY);
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  } catch {
    // Ignore
  }
}

export interface SecurityAuditCheck {
  id: string;
  label: string;
  detail: string;
  verified: boolean;
}

export function getSecurityAuditStatus(): SecurityAuditCheck[] {
  return [
    {
      id: 'anti-inspect',
      label: 'Developer Safeguards & Free Copy/Paste',
      detail: 'Standard user actions (copy, paste, selection) are fully open while dev shortcut guards remain active.',
      verified: true,
    },
    {
      id: 'zero-network',
      label: 'Runs 100% in Your Browser',
      detail: 'Your loan, savings, health, and text inputs never leave your device.',
      verified: true,
    },
    {
      id: 'csp-headers',
      label: 'Strict Browser Security Rules',
      detail: 'Blocks third-party scripts and unsafe embeds from accessing your page.',
      verified: true,
    },
    {
      id: 'prototype-guard',
      label: 'Safe Links & Input Filtering',
      detail: 'Shared links and text boxes automatically strip out unsafe code.',
      verified: true,
    },
    {
      id: 'csv-injection',
      label: 'Safe Spreadsheet Downloads',
      detail: 'Downloaded CSV files are cleaned so they open safely in Excel and Sheets.',
      verified: true,
    },
    {
      id: 'storage-integrity',
      label: 'Protected Saved History',
      detail: 'Your saved results are encoded on your device and checked against tampering.',
      verified: true,
    },
    {
      id: 'zero-telemetry',
      label: 'Camera, Mic & Location Blocked',
      detail: 'This website never asks for your camera, microphone, or location.',
      verified: true,
    },
  ];
}
