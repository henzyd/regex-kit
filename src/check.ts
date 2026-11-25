import { isEmail } from './contact.js';
import type { EmailOptions } from './contact.js';
import { luhn } from './internal/checksum.js';
import { opts, stripSeparators } from './internal/core.js';
import { getCardBrand } from './financial.js';
import type { CardBrand } from './financial.js';

export type CheckResult<R extends string> = { ok: true } | { ok: false; reason: R };

export type EmailFailure = 'type' | 'empty' | 'tooLong' | 'noAt' | 'localPart' | 'domain';

/** Like `isEmail`, but says why a value failed. */
export function checkEmail(value: unknown, options?: EmailOptions): CheckResult<EmailFailure> {
  if (typeof value !== 'string') return { ok: false, reason: 'type' };
  if (value === '') return { ok: false, reason: 'empty' };
  if (value.length > 320) return { ok: false, reason: 'tooLong' };
  if (isEmail(value, options)) return { ok: true };
  const at = value.lastIndexOf('@');
  if (at < 0) return { ok: false, reason: 'noAt' };
  if (!isEmail(`${value.slice(0, at)}@example.com`, options))
    return { ok: false, reason: 'localPart' };
  if (!isEmail(`x@${value.slice(at + 1)}`, options)) return { ok: false, reason: 'domain' };
  return { ok: false, reason: 'tooLong' };
}

export type CardFailure = 'type' | 'empty' | 'format' | 'length' | 'brand' | 'luhn';

export interface CheckCardOptions {
  brands?: CardBrand[];
  strict?: boolean;
}

/** Like `isCreditCard`, but says why a number failed: format, length, unknown brand, or the check digit. */
export function checkCreditCard(
  value: unknown,
  options?: CheckCardOptions
): CheckResult<CardFailure> {
  if (typeof value !== 'string') return { ok: false, reason: 'type' };
  if (value === '') return { ok: false, reason: 'empty' };
  const digits = value.length > 32 ? null : stripSeparators(value, opts(options).strict);
  if (digits === null || !/^\d+$/.test(digits)) return { ok: false, reason: 'format' };
  if (digits.length < 12 || digits.length > 19) return { ok: false, reason: 'length' };
  const brand = getCardBrand(digits);
  const allowed = opts(options).brands;
  if (brand === null || (allowed !== undefined && !allowed.includes(brand)))
    return { ok: false, reason: 'brand' };
  return luhn(digits) ? { ok: true } : { ok: false, reason: 'luhn' };
}
