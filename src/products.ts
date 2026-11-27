import { opts, str, stripSeparators } from './internal/core.js';
import { gs1, luhn, weighted } from './internal/checksum.js';

export interface IsbnOptions {
  /** Require ISBN-10 or ISBN-13. Default: either. */
  version?: 10 | 13;
  /** Require the compact form, with no hyphens or spaces. Default `false`. */
  strict?: boolean;
}

/** ISBN-10 or ISBN-13, check digit included. Hyphen placement is not validated. */
export function isIsbn(value: unknown, options?: IsbnOptions): boolean {
  const s = str(value, 24);
  if (s === null) return false;
  const o = opts(options);
  const d = stripSeparators(s, o.strict);
  if (d === null) return false;
  if (/^\d{9}[\dXx]$/.test(d) && o.version !== 13) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const c = d[i]!;
      sum += (10 - i) * (c === 'X' || c === 'x' ? 10 : Number(c));
    }
    return sum % 11 === 0;
  }
  return /^97[89]\d{10}$/.test(d) && o.version !== 10 && gs1(d);
}

export function isIssn(value: unknown, options?: { strict?: boolean }): boolean {
  const s = str(value, 9);
  if (s === null) return false;
  const strict = opts(options).strict ?? false;
  const m = /^(\d{4})(-?)(\d{3})([\dX])$/.exec(s);
  if (m === null || (strict && m[2] === '-')) return false;
  const digits = `${m[1]}${m[3]}`;
  const sum = weighted(digits, [8, 7, 6, 5, 4, 3, 2]);
  const check = (11 - (sum % 11)) % 11;
  return m[4] === (check === 10 ? 'X' : String(check));
}

export function isEan(value: unknown): boolean {
  const s = str(value, 13);
  return s !== null && /^(?:\d{8}|\d{13})$/.test(s) && gs1(s);
}

/** UPC-E to UPC-A, or `null` if the input is not an eight-digit UPC-E. */
function upcEtoA(e: string): string | null {
  if (!/^[01]\d{7}$/.test(e)) return null;
  const ns = e[0]!;
  const [a, b, c, d, x, f] = e.slice(1, 7).split('') as [
    string,
    string,
    string,
    string,
    string,
    string
  ];
  const check = e[7]!;
  let body: string;
  if ('012'.includes(f)) body = `${a}${b}${f}0000${c}${d}${x}`;
  else if (f === '3') body = `${a}${b}${c}00000${d}${x}`;
  else if (f === '4') body = `${a}${b}${c}${d}00000${x}`;
  else body = `${a}${b}${c}${d}${x}0000${f}`;
  return `${ns}${body}${check}`;
}

export function isUpc(value: unknown): boolean {
  const s = str(value, 12);
  if (s === null) return false;
  if (/^\d{12}$/.test(s)) return gs1(s);
  const a = upcEtoA(s);
  return a !== null && gs1(a);
}

export function isGtin(value: unknown): boolean {
  const s = str(value, 14);
  return s !== null && /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(s) && gs1(s);
}

export function isIsrc(value: unknown, options?: { strict?: boolean }): boolean {
  const s = str(value, 15);
  if (s === null) return false;
  if (/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(s)) return true;
  return !opts(options).strict && /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/.test(s);
}

export function isDoi(value: unknown, options?: { allowPrefix?: boolean }): boolean {
  let s = str(value, 256);
  if (s === null) return false;
  if (opts(options).allowPrefix) s = s.replace(/^(?:doi:|https?:\/\/(?:dx\.)?doi\.org\/)/i, '');
  return /^10\.\d{4,9}(?:\.\d+)*\/\S+$/.test(s);
}

export function isOrcid(value: unknown, options?: { strict?: boolean }): boolean {
  const s = str(value, 19);
  if (s === null) return false;
  const strict = opts(options).strict ?? false;
  const d = s.replace(/-/g, '');
  if (!/^\d{15}[\dX]$/.test(d)) return false;
  if (strict ? s !== d : !(s === d || /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(s))) return false;
  let total = 0;
  for (let i = 0; i < 15; i++) total = (total + Number(d[i])) * 2;
  const result = (12 - (total % 11)) % 11;
  return d[15] === (result === 10 ? 'X' : String(result));
}

export function isImei(value: unknown, options?: { strict?: boolean; allowSv?: boolean }): boolean {
  const s = str(value, 20);
  if (s === null) return false;
  const o = opts(options);
  const d = stripSeparators(s, o.strict);
  if (d === null) return false;
  if (/^\d{15}$/.test(d)) return luhn(d);
  return o.allowSv === true && /^\d{16}$/.test(d);
}

const VIN_VALUES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9
};

export interface VinOptions {
  /** `auto` (default) checks the digit for North American VINs only. */
  checkDigit?: 'auto' | boolean;
}

export function isVin(value: unknown, options?: VinOptions): boolean {
  const s = str(value, 17);
  if (s === null || !/^[A-HJ-NPR-Z0-9]{17}$/.test(s)) return false;
  const mode = opts(options).checkDigit ?? 'auto';
  if (mode === false || (mode === 'auto' && !/^[1-5]/.test(s))) return true;
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = s[i]!;
    sum += (/\d/.test(c) ? Number(c) : VIN_VALUES[c]!) * weights[i]!;
  }
  const r = sum % 11;
  return s[8] === (r === 10 ? 'X' : String(r));
}

const PLATES: Record<string, RegExp> = {
  GB: /^[A-Z]{2}\d{2} ?[A-Z]{3}$/,
  US: /^[A-Z0-9][A-Z0-9 -]{0,7}$/,
  NG: /^[A-Z]{3}[ -]?\d{3}[ -]?[A-Z]{2}$/,
  DE: /^[A-ZÄÖÜ]{1,3}[ -][A-Z]{1,2} ?\d{1,4}[EH]?$/,
  FR: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/,
  ES: /^\d{4} ?[BCDFGHJKLMNPRSTVWXYZ]{3}$/,
  IT: /^[A-Z]{2}\d{3}[A-Z]{2}$/,
  IN: /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,3}[ -]?\d{4}$/,
  ZA: /^[A-Z]{2,3} ?\d{3} ?[A-Z]{2}$/,
  KE: /^K[A-Z]{2} ?\d{3}[A-Z]$/,
  GH: /^[A-Z]{2}-\d{1,4}-\d{2}$/,
  BR: /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/
};

/** Vehicle registration shape for a country. Shape only; a short list of countries. */
export function isLicensePlate(value: unknown, country?: unknown): boolean {
  const s = str(value, 16);
  if (s === null || typeof country !== 'string') return false;
  const c = country.toUpperCase();
  const re = Object.hasOwn(PLATES, c) ? PLATES[c] : undefined;
  return re !== undefined && re.test(s);
}
