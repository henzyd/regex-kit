import { opts, str } from './internal/core.js';
import { ALPHA2, ALPHA3, NUMERIC } from './data/countries.js';
import { LANGUAGES_ALPHA2, SCRIPTS } from './data/languages.js';
import { POSTAL } from './data/postal.js';

/** `isPostalCode(value, 'GB')`. Use `'any'` for a generic fallback shape. */
export function isPostalCode(value: unknown, country?: unknown): boolean {
  const s = str(value, 16);
  if (s === null || typeof country !== 'string') return false;
  const c = country.toUpperCase();
  if (c === 'ANY') return /^[A-Za-z0-9](?:[A-Za-z0-9 -]{0,8}[A-Za-z0-9])?$/.test(s) && /\d/.test(s);
  const re = Object.hasOwn(POSTAL, c) ? POSTAL[c] : undefined;
  return re !== undefined && re.test(s);
}

export function isLatitude(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= 90;
  const s = str(value, 32);
  return s !== null && /^[+-]?\d{1,2}(?:\.\d+)?$/.test(s) && Math.abs(Number(s)) <= 90;
}

export function isLongitude(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= 180;
  const s = str(value, 32);
  return s !== null && /^[+-]?\d{1,3}(?:\.\d+)?$/.test(s) && Math.abs(Number(s)) <= 180;
}

const DMS = /^(\d{1,3})\s*°\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*["″]\s*([NSEW])$/;

function dmsOk(part: string, lat: boolean): boolean {
  const m = DMS.exec(part.trim());
  if (m === null) return false;
  const deg = Number(m[1]);
  if (Number(m[2]) > 59 || Number(m[3]) >= 60) return false;
  if (lat)
    return (
      'NS'.includes(m[4]!) && (deg < 90 || (deg === 90 && Number(m[2]) === 0 && Number(m[3]) === 0))
    );
  return (
    'EW'.includes(m[4]!) && (deg < 180 || (deg === 180 && Number(m[2]) === 0 && Number(m[3]) === 0))
  );
}

export function isLatLong(
  value: unknown,
  options?: { format?: 'decimal' | 'dms' | 'any' }
): boolean {
  const s = str(value, 96);
  if (s === null) return false;
  const format = opts(options).format ?? 'decimal';
  if (format !== 'dms') {
    const m = /^([+-]?\d{1,2}(?:\.\d+)?)\s*,\s*([+-]?\d{1,3}(?:\.\d+)?)$/.exec(s);
    if (m !== null && isLatitude(m[1]) && isLongitude(m[2])) return true;
    if (format === 'decimal') return false;
  }
  const m = /^(.+?[NS])[\s,]+(.+?[EW])$/.exec(s);
  return m !== null && dmsOk(m[1]!, true) && dmsOk(m[2]!, false);
}

export function isGeohash(value: unknown): boolean {
  const s = str(value, 12);
  return s !== null && /^[0-9b-hjkmnp-z]+$/.test(s);
}

export function isPlusCode(value: unknown): boolean {
  const s = str(value, 20);
  if (s === null) return false;
  const c = '[23456789CFGHJMPQRVWX]';
  return (
    new RegExp(`^${c}{8}\\+${c}{2,}$`).test(s) ||
    new RegExp(`^${c}{2,6}\\+${c}{2,}$`).test(s) ||
    (s.length === 9 && new RegExp(`^${c}{2,6}0{2,6}\\+$`).test(s))
  );
}

export function isCountryCode(
  value: unknown,
  options?: { format?: 'alpha2' | 'alpha3' | 'numeric' | 'any' }
): boolean {
  const s = str(value, 3);
  if (s === null) return false;
  const f = opts(options).format ?? 'alpha2';
  if (f === 'alpha2') return ALPHA2.has(s);
  if (f === 'alpha3') return ALPHA3.has(s);
  if (f === 'numeric') return NUMERIC.has(s);
  return ALPHA2.has(s) || ALPHA3.has(s) || NUMERIC.has(s);
}

/** ISO 3166-2 shape with a real country prefix. The per-country subdivision lists are not bundled. */
export function isSubdivisionCode(value: unknown): boolean {
  const s = str(value, 6);
  return s !== null && /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(s) && ALPHA2.has(s.slice(0, 2));
}

/**
 * ISO 639-1 codes are checked against the list. Three-letter ISO 639-2 and 639-3 codes
 * are checked for shape only.
 */
export function isLanguageCode(
  value: unknown,
  options?: { format?: 'alpha2' | 'alpha3' | 'any' }
): boolean {
  const s = str(value, 3);
  if (s === null) return false;
  const f = opts(options).format ?? 'any';
  if (f === 'alpha2') return LANGUAGES_ALPHA2.has(s);
  if (f === 'alpha3') return /^[a-z]{3}$/.test(s);
  return LANGUAGES_ALPHA2.has(s) || /^[a-z]{3}$/.test(s);
}

const BCP47 = new RegExp(
  '^(?:' +
    '(?:[a-z]{2,3}(?:-[a-z]{3}){0,3}|[a-z]{4}|[a-z]{5,8})' +
    '(?:-[a-z]{4})?' +
    '(?:-(?:[a-z]{2}|\\d{3}))?' +
    '(?:-(?:[0-9a-z]{5,8}|\\d[0-9a-z]{3}))*' +
    '(?:-[0-9a-wyz](?:-[0-9a-z]{2,8})+)*' +
    '(?:-x(?:-[0-9a-z]{1,8})+)?' +
    '|x(?:-[0-9a-z]{1,8})+' +
    ')$',
  'i'
);

/** BCP 47 language tag, syntax per RFC 5646. Subtags are not looked up. */
export function isLocale(value: unknown): boolean {
  const s = str(value, 64);
  return s !== null && BCP47.test(s);
}

export function isScriptCode(value: unknown): boolean {
  const s = str(value, 4);
  if (s === null || !/^[A-Z][a-z]{3}$/.test(s)) return false;
  return SCRIPTS.has(s) || (s >= 'Qaaa' && s <= 'Qabx');
}

export function isIataAirport(value: unknown): boolean {
  const s = str(value, 3);
  return s !== null && /^[A-Z]{3}$/.test(s);
}

export function isIcaoAirport(value: unknown): boolean {
  const s = str(value, 4);
  return s !== null && /^[A-Z]{4}$/.test(s);
}

export function isFlightNumber(value: unknown): boolean {
  const s = str(value, 10);
  return s !== null && /^(?=[A-Z0-9]*[A-Z])[A-Z0-9]{2} ?\d{1,4}[A-Z]?$/.test(s);
}

export function isUnLocode(value: unknown): boolean {
  const s = str(value, 6);
  return s !== null && /^[A-Z]{2} ?[A-Z2-9]{3}$/.test(s) && ALPHA2.has(s.slice(0, 2));
}
