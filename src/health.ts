import { opts, str } from './internal/core.js';
import { luhn } from './internal/checksum.js';

/** US National Provider Identifier: ten digits, Luhn with the `80840` prefix. */
export function isNpi(value: unknown): boolean {
  const s = str(value, 10);
  return s !== null && /^[12]\d{9}$/.test(s) && luhn(`80840${s}`);
}

export function isIcd10(value: unknown, options?: { allowUndotted?: boolean }): boolean {
  const s = str(value, 8);
  if (s === null) return false;
  if (/^[A-Z]\d[0-9AB](?:\.[0-9A-Z]{1,4})?$/.test(s)) return true;
  return opts(options).allowUndotted === true && /^[A-Z]\d[0-9AB][0-9A-Z]{1,4}$/.test(s);
}

export function isNdc(value: unknown): boolean {
  const s = str(value, 13);
  return (
    s !== null && /^(?:\d{4}-\d{4}-\d{2}|\d{5}-\d{3}-\d{2}|\d{5}-\d{4}-\d|\d{10}|\d{11})$/.test(s)
  );
}

export function isLoinc(value: unknown): boolean {
  const s = str(value, 10);
  const m = s === null ? null : /^(\d{1,7})-(\d)$/.exec(s);
  if (m === null) return false;
  // Mod 10 (Luhn): the digits before the hyphen plus a check digit must pass the Luhn test.
  return luhn(`${m[1]}${m[2]}`);
}

export function isCasNumber(value: unknown): boolean {
  const s = str(value, 12);
  const m = s === null ? null : /^(\d{2,7})-(\d{2})-(\d)$/.exec(s);
  if (m === null) return false;
  const digits = `${m[1]}${m[2]}`;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += Number(digits[digits.length - 1 - i]) * (i + 1);
  return sum % 10 === Number(m[3]);
}

export function isInchiKey(value: unknown): boolean {
  const s = str(value, 27);
  return s !== null && /^[A-Z]{14}-[A-Z]{8}[SN]A-[A-Z]$/.test(s);
}

export function isArxivId(value: unknown): boolean {
  const s = str(value, 32);
  if (s === null) return false;
  const modern = /^(\d{2})(\d{2})\.\d{4,5}(?:v\d+)?$/.exec(s);
  if (modern !== null) return Number(modern[2]) >= 1 && Number(modern[2]) <= 12;
  return /^[a-z]+(?:-[a-z]+)*(?:\.[A-Z]{2})?\/\d{7}(?:v\d+)?$/.test(s);
}

export function isPubmedId(value: unknown): boolean {
  const s = str(value, 9);
  return s !== null && /^[1-9]\d{0,8}$/.test(s);
}

export function isBloodType(value: unknown): boolean {
  const s = str(value, 3);
  return s !== null && /^(?:A|B|AB|O)[+-]$/.test(s);
}
