import { opts, str } from './internal/core.js';
import { luhn } from './internal/checksum.js';

export interface SkuOptions {
  minLength?: number;
  maxLength?: number;
  /** Separator characters allowed between alphanumerics. Default `'-_.'`. */
  separators?: string;
  /** Require uppercase letters only. Default `false`. */
  uppercase?: boolean;
}

/** A stock-keeping unit under your own scheme: alphanumerics with single separators inside. */
export function isSku(value: unknown, options?: SkuOptions): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const o = opts(options);
  if (s.length < (o.minLength ?? 1) || s.length > (o.maxLength ?? 64)) return false;
  const seps = new Set([...(o.separators ?? '-_.')]);
  const alnum = o.uppercase ? /^[A-Z0-9]$/ : /^[A-Za-z0-9]$/;
  let prevSep = true;
  for (const c of s) {
    if (alnum.test(c)) prevSep = false;
    else if (seps.has(c) && !prevSep) prevSep = true;
    else return false;
  }
  return !prevSep;
}

export interface CouponOptions {
  /** Exact length, or `{ min, max }`. Hyphens do not count. */
  length?: number | { min?: number; max?: number };
  /** Require uppercase letters only. Default `false`. */
  uppercase?: boolean;
}

export function isCouponCode(value: unknown, options?: CouponOptions): boolean {
  const s = str(value, 64);
  if (s === null) return false;
  const o = opts(options);
  if (!(o.uppercase ? /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/ : /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/).test(s))
    return false;
  if (o.length === undefined) return true;
  const n = s.replace(/-/g, '').length;
  return typeof o.length === 'number'
    ? n === o.length
    : n >= (o.length.min ?? 0) && n <= (o.length.max ?? 64);
}

function upsOk(t: string): boolean {
  let odd = 0;
  let even = 0;
  for (let i = 0; i < 15; i++) {
    const c = t[2 + i]!;
    const d = /\d/.test(c) ? Number(c) : (c.charCodeAt(0) - 63) % 10;
    if (i % 2 === 0) odd += d;
    else even += d;
  }
  const r = (odd + 2 * even) % 10;
  return (r === 0 ? 0 : 10 - r) === Number(t[17]);
}

export type Carrier = 'ups' | 'fedex' | 'usps' | 'dhl' | 'royalmail';

/** Tracking number shape for a carrier. UPS `1Z` numbers are also checksummed. Formats change; this is versioned. */
export function isTrackingNumber(value: unknown, carrier?: unknown): boolean {
  const s = str(value, 40);
  if (s === null || typeof carrier !== 'string') return false;
  switch (carrier) {
    case 'ups':
      return /^1Z[0-9A-Z]{16}$/.test(s) && upsOk(s);
    case 'fedex':
      return /^(?:\d{12}|\d{15}|\d{20}|\d{22})$/.test(s);
    case 'usps':
      return /^(?:9[1-5]\d{18,20}|[A-Z]{2}\d{9}US)$/.test(s);
    case 'dhl':
      return /^(?:\d{10,11}|JJD\d{18})$/.test(s);
    case 'royalmail':
      return /^[A-Z]{2}\d{9}GB$/.test(s);
    default:
      return false;
  }
}

/** SIM card number: 19 or 20 digits starting `89`, Luhn-valid. */
export function isIccid(value: unknown): boolean {
  const s = str(value, 20);
  return s !== null && /^89\d{17,18}$/.test(s) && luhn(s);
}

export function isImsi(value: unknown): boolean {
  const s = str(value, 15);
  return s !== null && /^\d{14,15}$/.test(s);
}

/** Apple push device token: 64 hex characters in the common case. Apple has not guaranteed the length. */
export function isApnsToken(value: unknown, options?: { length?: number }): boolean {
  const s = str(value, 200);
  return s !== null && s.length === (opts(options).length ?? 64) && /^[0-9a-fA-F]+$/.test(s);
}
