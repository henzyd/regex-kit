import { numStr, opts, str } from './internal/core.js';

export interface NumericOptions {
  /** Accept a leading `+` or `-`. Default `false`. */
  allowSign?: boolean;
  /** Accept a decimal part, `1.5`. Default `false`. */
  allowDecimal?: boolean;
}

/** Digits, optionally signed and optionally with a decimal part. Also accepts a number. */
export function isNumeric(value: unknown, options?: NumericOptions): boolean {
  const s = numStr(value, 400);
  if (s === null) return false;
  const o = opts(options);
  return new RegExp(
    `^${o.allowSign ? '[+-]?' : ''}\\d+${o.allowDecimal ? '(?:\\.\\d+)?' : ''}$`
  ).test(s);
}

export interface IntegerOptions {
  /** Accept a leading `-`. Default `true`. */
  allowNegative?: boolean;
  /** Accept `007`. Default `false`. */
  allowLeadingZeros?: boolean;
  /** Inclusive bounds. Compared exactly, so values beyond 2^53 are fine. */
  min?: number | bigint;
  max?: number | bigint;
}

const toBig = (n: number | bigint, up: boolean): bigint | null => {
  if (typeof n === 'bigint') return n;
  if (!Number.isFinite(n)) return null;
  return BigInt(up ? Math.ceil(n) : Math.floor(n));
};

/** Integer, as a string or a number. */
export function isInteger(value: unknown, options?: IntegerOptions): boolean {
  if (typeof value === 'number' && !Number.isInteger(value)) return false;
  const s = numStr(value, 1000);
  if (s === null) return false;
  const o = opts(options);
  const lead = o.allowLeadingZeros ?? false;
  const re = lead ? /^-?\d+$/ : /^-?(?:0|[1-9]\d*)$/;
  if (!re.test(s) || s === '-0' || (!(o.allowNegative ?? true) && s.startsWith('-'))) return false;
  if (o.min === undefined && o.max === undefined) return true;
  const n = BigInt(s);
  const lo = o.min === undefined ? null : toBig(o.min, true);
  const hi = o.max === undefined ? null : toBig(o.max, false);
  return (lo === null || n >= lo) && (hi === null || n <= hi);
}

export function isSafeInteger(value: unknown): boolean {
  if (!isInteger(value)) return false;
  const n = BigInt(typeof value === 'number' ? String(value) : (value as string));
  return n <= 9007199254740991n && n >= -9007199254740991n;
}

export interface DecimalOptions {
  /** Exact number of decimal places, or a `{ min, max }` range. */
  decimalPlaces?: number | { min?: number; max?: number };
  /** `.` (default) or `,`. */
  decimalSeparator?: '.' | ',';
  /** A locale whose decimal separator is `,` selects it for you (`de`, `fr`, `es`, ...). */
  locale?: string;
  allowNegative?: boolean;
  allowLeadingZeros?: boolean;
}

const COMMA_LOCALES = new Set(
  'de fr es it pt ru uk pl nl sv da nb no fi cs sk hu ro bg el tr id vi hr sl sr'.split(' ')
);

export function isDecimal(value: unknown, options?: DecimalOptions): boolean {
  const s = numStr(value, 400);
  if (s === null) return false;
  const o = opts(options);
  const sep =
    o.decimalSeparator ??
    (o.locale && COMMA_LOCALES.has(o.locale.toLowerCase().split(/[-_]/)[0]!) ? ',' : '.');
  const m = new RegExp(`^(-?)(\\d+)(?:${sep === '.' ? '\\.' : ','}(\\d+))?$`).exec(s);
  if (m === null) return false;
  if (m[1] === '-' && !(o.allowNegative ?? true)) return false;
  const int = m[2]!;
  if (!(o.allowLeadingZeros ?? false) && int.length > 1 && int.startsWith('0')) return false;
  const places = (m[3] ?? '').length;
  const dp = o.decimalPlaces;
  if (typeof dp === 'number') return places === dp;
  if (dp !== undefined) return places >= (dp.min ?? 0) && places <= (dp.max ?? Infinity);
  return true;
}

export function isFloat(value: unknown, options?: { min?: number; max?: number }): boolean {
  const s = numStr(value, 400);
  if (s === null || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(s)) return false;
  const n = Number(s);
  if (!Number.isFinite(n)) return false;
  const o = opts(options);
  return (o.min === undefined || n >= o.min) && (o.max === undefined || n <= o.max);
}

export interface PercentageOptions {
  min?: number;
  max?: number;
  /** For string input, require the trailing `%`. Default `true`. */
  requireSymbol?: boolean;
}

export function isPercentage(value: unknown, options?: PercentageOptions): boolean {
  const o = opts(options);
  let n: number;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return false;
    n = value;
  } else {
    const s = str(value, 32);
    if (s === null) return false;
    const m = /^([+-]?\d+(?:\.\d+)?)(%?)$/.exec(s);
    if (m === null || (m[2] === '' && (o.requireSymbol ?? true))) return false;
    n = Number(m[1]);
  }
  return n >= (o.min ?? 0) && n <= (o.max ?? 100);
}

export interface CurrencyAmountOptions {
  /** The symbol to accept (one, or several). Default: common currency symbols, optional. */
  symbol?: string | string[];
  /** Where the symbol sits. Default `prefix`. */
  symbolPosition?: 'prefix' | 'suffix' | 'either';
  /** Fail when there is no symbol. Default `false`. */
  requireSymbol?: boolean;
  thousandsSeparator?: ',' | '.' | ' ' | "'" | '';
  decimalSeparator?: '.' | ',';
  /** Allowed decimals. Default `{ min: 0, max: 2 }`. */
  decimalPlaces?: { min?: number; max?: number };
  allowNegative?: boolean;
}

const esc = (c: string) => c.replace(/[.*+?^${}()|[\]\\\-/]/g, '\\$&');
const DEFAULT_SYMBOLS = ['$', '€', '£', '¥', '₦', '₹', '₩', '₽', '₵', '₺', 'R$', 'KSh', 'CHF'];

export function isCurrencyAmount(value: unknown, options?: CurrencyAmountOptions): boolean {
  const s = str(value, 64);
  if (s === null) return false;
  const o = opts(options);
  const sym = (Array.isArray(o.symbol) ? o.symbol : o.symbol ? [o.symbol] : DEFAULT_SYMBOLS)
    .map(esc)
    .join('|');
  const th = o.thousandsSeparator ?? ',';
  const dec = o.decimalSeparator ?? '.';
  const min = o.decimalPlaces?.min ?? 0;
  const max = o.decimalPlaces?.max ?? 2;
  const int = th === '' ? '\\d+' : `(?:\\d{1,3}(?:${esc(th)}\\d{3})+|\\d+)`;
  const frac =
    max === 0 ? '' : `(?:${esc(dec)}\\d{${min === 0 ? 1 : min},${max}})${min === 0 ? '?' : ''}`;
  const neg = (o.allowNegative ?? true) ? '-?' : '';
  const pos = o.symbolPosition ?? 'prefix';
  const req = o.requireSymbol ?? false;
  const pre = pos !== 'suffix' ? `(?:${sym})${req && pos === 'prefix' ? '' : '?'}` : '';
  const post = pos !== 'prefix' ? ` ?(?:${sym})${req && pos === 'suffix' ? '' : '?'}` : '';
  let re: RegExp;
  if (pos === 'either') {
    const body = `${neg}${int}${frac}`;
    re = new RegExp(`^(?:(?:${sym}) ?${body}|${body}(?: ?(?:${sym}))${req ? '' : '?'})$`);
  } else re = new RegExp(`^${neg}${pre}${int}${frac}${post}$`);
  return re.test(s);
}

export function isRomanNumeral(value: unknown, options?: { caseInsensitive?: boolean }): boolean {
  const s = str(value, 32);
  if (s === null) return false;
  const re = /^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
  return re.test(opts(options).caseInsensitive ? s.toUpperCase() : s);
}

export interface AlphaOptions {
  /** Accept letters from any script. Default `false` (ASCII only). */
  unicode?: boolean;
  /** A BCP 47 tag; restricts to that language's script. */
  locale?: string;
}

const SCRIPT_OF: Record<string, string> = {
  ru: 'Cyrillic',
  uk: 'Cyrillic',
  bg: 'Cyrillic',
  sr: 'Cyrillic',
  mk: 'Cyrillic',
  be: 'Cyrillic',
  kk: 'Cyrillic',
  el: 'Greek',
  ar: 'Arabic',
  fa: 'Arabic',
  ur: 'Arabic',
  he: 'Hebrew',
  hi: 'Devanagari',
  mr: 'Devanagari',
  ne: 'Devanagari',
  th: 'Thai',
  ko: 'Hangul',
  zh: 'Han',
  ja: 'Han'
};

function letterClass(o: AlphaOptions): string {
  if (o.locale !== undefined) {
    const script = SCRIPT_OF[o.locale.toLowerCase().split(/[-_]/)[0]!] ?? 'Latin';
    const extra = o.locale.toLowerCase().startsWith('ja')
      ? '\\p{Script=Hiragana}\\p{Script=Katakana}'
      : '';
    return `\\p{Script=${script}}${extra}\\p{M}`;
  }
  return o.unicode ? '\\p{L}\\p{M}' : 'A-Za-z';
}

export function isAlpha(value: unknown, options?: AlphaOptions): boolean {
  const s = str(value, 10_000);
  if (s === null) return false;
  const o = opts(options);
  return new RegExp(`^[${letterClass(o)}]+$`, o.unicode || o.locale ? 'u' : '').test(s);
}

export function isAlphanumeric(value: unknown, options?: AlphaOptions): boolean {
  const s = str(value, 10_000);
  if (s === null) return false;
  const o = opts(options);
  const digits = o.unicode || o.locale ? '\\p{Nd}' : '0-9';
  return new RegExp(`^[${letterClass(o)}${digits}]+$`, o.unicode || o.locale ? 'u' : '').test(s);
}

export function isAscii(value: unknown): boolean {
  const s = str(value, 100_000);
  return s !== null && /^[\x00-\x7F]+$/.test(s);
}

export function isPrintableAscii(value: unknown): boolean {
  const s = str(value, 100_000);
  return s !== null && /^[\x20-\x7E]+$/.test(s);
}

/** `true` when the value contains no C0 or C1 control characters and no DEL. */
export function hasNoControlChars(value: unknown, options?: { allow?: string[] }): boolean {
  const s = str(value, 100_000);
  if (s === null) return false;
  const allow = new Set(opts(options).allow ?? []);
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if ((c <= 0x1f || (c >= 0x7f && c <= 0x9f)) && !allow.has(ch)) return false;
  }
  return true;
}

/** The only validator that returns `true` for an empty string. */
export function isBlank(value: unknown): boolean {
  return typeof value === 'string' && value.length <= 1_000_000 && /^\s*$/.test(value);
}

export function isLowercase(value: unknown): boolean {
  const s = str(value, 100_000);
  return s !== null && s === s.toLowerCase();
}

export function isUppercase(value: unknown): boolean {
  const s = str(value, 100_000);
  return s !== null && s === s.toUpperCase();
}

export function isCamelCase(value: unknown): boolean {
  const s = str(value, 256);
  return s !== null && /^[a-z][a-zA-Z0-9]*$/.test(s);
}

export function isPascalCase(value: unknown): boolean {
  const s = str(value, 256);
  return s !== null && /^[A-Z][a-zA-Z0-9]*$/.test(s);
}

export function isSnakeCase(value: unknown): boolean {
  const s = str(value, 256);
  return s !== null && /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(s);
}

export function isKebabCase(value: unknown): boolean {
  const s = str(value, 256);
  return s !== null && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(s);
}

export function isScreamingSnakeCase(value: unknown): boolean {
  const s = str(value, 256);
  return s !== null && /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(s);
}

/** Detects a single HTML tag. Not a parser and never a sanitiser. */
export function isHtmlTag(value: unknown): boolean {
  const s = str(value, 2048);
  return s !== null && /^<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*|\/)?>$/.test(s);
}
