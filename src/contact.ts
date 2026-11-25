import { opts, str } from './internal/core.js';
import { domainOk } from './internal/shared.js';
import { COUNTRY_CALLING } from './data/dial.js';
import { MOBILE } from './data/mobile.js';
import type { Email } from './types.js';

export interface EmailOptions {
  /** Accept Unicode in the local part and the domain. Default `false`. */
  allowUnicode?: boolean;
  /** Accept `Name <user@host>`. Default `false`. */
  allowDisplayName?: boolean;
  /** Require a dot and a real top-level label in the domain. Default `true`. */
  requireTld?: boolean;
  /** Maximum length of the address. Default 254. */
  maxLength?: number;
}

const LOCAL_ASCII = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const LOCAL_UNI =
  /^[\p{L}\p{N}\p{M}!#$%&'*+/=?^_`{|}~-]+(?:\.[\p{L}\p{N}\p{M}!#$%&'*+/=?^_`{|}~-]+)*$/u;

/** Practical email check. Quoted local parts and comments are not supported. */
export function isEmail(value: unknown, options?: EmailOptions): value is Email {
  const o = opts(options);
  let s = str(value, 320);
  if (s === null) return false;
  if (o.allowDisplayName) {
    const m = /^\s*(?:"[^"\r\n]*"|[^<>"\r\n]*?)\s*<([^<>\s]+)>\s*$/.exec(s);
    if (m !== null) s = m[1]!;
  }
  if (s.length > (o.maxLength ?? 254)) return false;
  const at = s.lastIndexOf('@');
  if (at < 1) return false;
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);
  if (local.length > 64) return false;
  if (!(o.allowUnicode ? LOCAL_UNI : LOCAL_ASCII).test(local)) return false;
  return domainOk(domain, { requireTld: o.requireTld ?? true, unicode: o.allowUnicode ?? false });
}

export function isPhoneE164(value: unknown): boolean {
  const s = str(value, 16);
  return s !== null && /^\+[1-9]\d{1,14}$/.test(s);
}

export function isPhone(value: unknown): boolean {
  const s = str(value, 32);
  if (s === null) return false;
  if (!/^\+?(?:\(\d{1,4}\)|\d)(?:[ .-]?(?:\(\d{1,4}\)|\d))*$/.test(s)) return false;
  const digits = s.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
}

export interface MobilePhoneOptions {
  /** Require canonical digits with no spaces, dashes or parentheses. Default `false`. */
  strict?: boolean;
}

export function isMobilePhone(
  value: unknown,
  country?: unknown,
  options?: MobilePhoneOptions
): boolean {
  const s = str(value, 32);
  if (s === null || typeof country !== 'string') return false;
  const rule = MOBILE[country.toUpperCase()];
  if (rule === undefined) return false;
  const strict = opts(options).strict ?? false;
  let v = s;
  if (!strict) {
    if (!/^\+?[\d\s().-]+$/.test(v)) return false;
    v = v.replace(/[\s().-]/g, '');
  } else if (!/^\+?\d+$/.test(v)) return false;
  const re = new RegExp(`^(?:${rule.national})$`);
  const cc = rule.cc;
  if (v.startsWith('+')) return v.startsWith(`+${cc}`) && re.test(v.slice(cc.length + 1));
  if (v.startsWith(`00${cc}`)) return re.test(v.slice(cc.length + 2));
  if (rule.trunk !== undefined && v.startsWith(rule.trunk) && re.test(v.slice(rule.trunk.length))) {
    return true;
  }
  return re.test(v);
}

export function isDialCode(value: unknown, options?: { requirePlus?: boolean }): boolean {
  const s = str(value, 6);
  if (s === null) return false;
  const requirePlus = opts(options).requirePlus ?? true;
  if (s.startsWith('+')) return COUNTRY_CALLING.has(s.slice(1));
  return !requirePlus && COUNTRY_CALLING.has(s);
}

export function isUssdCode(value: unknown): boolean {
  const s = str(value, 32);
  return s !== null && /^(?=.*\d)[*#]\d*(?:[*#]\d+)*#$/.test(s);
}

export interface UsernameOptions {
  minLength?: number;
  maxLength?: number;
  /** Extra characters allowed besides letters and digits. Default `'_.-'`. */
  allow?: string;
  /** Allow Unicode letters and digits. Default `false`. */
  unicode?: boolean;
  /** Allow two separators in a row. Default `false`. */
  allowConsecutiveSeparators?: boolean;
}

export function isUsername(value: unknown, options?: UsernameOptions): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const o = opts(options);
  const min = o.minLength ?? 3;
  const max = o.maxLength ?? 30;
  const chars = [...s];
  if (chars.length < min || chars.length > max) return false;
  const seps = new Set([...(o.allow ?? '_.-')]);
  const alnum = o.unicode ? /^[\p{L}\p{N}\p{M}]$/u : /^[A-Za-z0-9]$/;
  let prevSep = false;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (alnum.test(c)) prevSep = false;
    else if (seps.has(c)) {
      if (i === 0 || i === chars.length - 1) return false;
      if (prevSep && !(o.allowConsecutiveSeparators ?? false)) return false;
      prevSep = true;
    } else return false;
  }
  return true;
}

export function isPersonName(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 512);
  if (s === null || [...s].length > (opts(options).maxLength ?? 100)) return false;
  return /^\p{L}[\p{L}\p{M}]*(?:(?:\. ?|[ '’-])\p{L}[\p{L}\p{M}]*)*\.?$/u.test(s);
}

export function isDisplayName(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 1024);
  if (s === null || [...s].length > (opts(options).maxLength ?? 64)) return false;
  return s.trim().length > 0 && !/[\p{Cc}\u2028\u2029]/u.test(s);
}

export function isSlug(
  value: unknown,
  options?: { maxLength?: number; allowUppercase?: boolean; separator?: '-' | '_' }
): boolean {
  const s = str(value, 512);
  const o = opts(options);
  if (s === null || s.length > (o.maxLength ?? 100)) return false;
  const sep = o.separator ?? '-';
  const cls = o.allowUppercase ? 'A-Za-z0-9' : 'a-z0-9';
  return new RegExp(`^[${cls}]+(?:${sep === '-' ? '-' : '_'}[${cls}]+)*$`).test(s);
}

export function isHandle(
  value: unknown,
  options?: { maxLength?: number; requireAt?: boolean }
): boolean {
  const s = str(value, 128);
  const o = opts(options);
  if (s === null) return false;
  const hasAt = s.startsWith('@');
  if (!hasAt && (o.requireAt ?? true)) return false;
  const name = hasAt ? s.slice(1) : s;
  if (name.length < 1 || name.length > (o.maxLength ?? 30)) return false;
  return /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*$/.test(name);
}

export function isHashtag(value: unknown): boolean {
  const s = str(value, 130);
  return s !== null && s.length <= 101 && /^#(?=[\p{N}_\p{M}]*\p{L})[\p{L}\p{N}\p{M}_]+$/u.test(s);
}

export function isAddressLine(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 512);
  if (s === null || [...s].length > (opts(options).maxLength ?? 100)) return false;
  return s === s.trim() && !/[\p{Cc}\u2028\u2029]/u.test(s);
}
