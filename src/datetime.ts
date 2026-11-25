import { numStr, opts, str } from './internal/core.js';
import { calendarOk, leap, parseDate } from './internal/shared.js';

/** ISO 8601 calendar date, `YYYY-MM-DD`, calendar-aware. */
export function isIsoDate(value: unknown): boolean {
  const s = str(value, 10);
  const m = s === null ? null : /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m !== null && calendarOk(Number(m[1]), Number(m[2]), Number(m[3]));
}

export interface IsoTimeOptions {
  /** A UTC offset (`Z`, `+01:00`) must be present. Default `false`. */
  requireOffset?: boolean;
}

const TIME_RE = /^(\d{2}):(\d{2})(?::(\d{2})(?:[.,]\d{1,9})?)?(Z|[+-]\d{2}(?::?\d{2})?)?$/;

function timeOk(s: string, requireOffset: boolean): boolean {
  const m = TIME_RE.exec(s);
  if (m === null) return false;
  if (Number(m[1]) > 23 || Number(m[2]) > 59) return false;
  if (m[3] !== undefined && Number(m[3]) > 60) return false;
  if (requireOffset && m[4] === undefined) return false;
  if (m[4] !== undefined && m[4] !== 'Z') {
    const off = /^[+-](\d{2}):?(\d{2})?$/.exec(m[4])!;
    if (Number(off[1]) > 23 || Number(off[2] ?? 0) > 59) return false;
  }
  return true;
}

export function isIsoTime(value: unknown, options?: IsoTimeOptions): boolean {
  const s = str(value, 40);
  return s !== null && timeOk(s, opts(options).requireOffset ?? false);
}

export interface IsoDateTimeOptions extends IsoTimeOptions {
  /** Accept a space instead of `T`. Default `false`. */
  allowSpace?: boolean;
}

export function isIsoDateTime(value: unknown, options?: IsoDateTimeOptions): boolean {
  const s = str(value, 64);
  if (s === null) return false;
  const o = opts(options);
  const sep = o.allowSpace ? /[T ]/ : /T/;
  const parts = s.split(sep);
  if (parts.length !== 2) return false;
  return isIsoDate(parts[0]) && timeOk(parts[1]!, o.requireOffset ?? false);
}

export function isIsoDuration(value: unknown, options?: { allowWeeks?: boolean }): boolean {
  const s = str(value, 128);
  if (s === null) return false;
  const n = '\\d+(?:[.,]\\d+)?';
  const weeks = opts(options).allowWeeks ? `(?:${n}W)?` : '';
  return new RegExp(
    `^P(?!$)(?:${n}Y)?(?:${n}M)?${weeks}(?:${n}D)?(?:T(?=\\d)(?:${n}H)?(?:${n}M)?(?:${n}S)?)?$`
  ).test(s);
}

export function isDurationString(value: unknown, options?: { units?: string[] }): boolean {
  const s = str(value, 128);
  if (s === null) return false;
  const units = (opts(options).units ?? ['ms', 's', 'm', 'h', 'd', 'w'])
    .slice()
    .sort((a, b) => b.length - a.length)
    .join('|');
  return new RegExp(`^(?:\\d+(?:\\.\\d+)?(?:${units}))+$`).test(s);
}

function isoWeeks(y: number): number {
  const jan1 = new Date(Date.UTC(y, 0, 1)).getUTCDay();
  return jan1 === 4 || (leap(y) && jan1 === 3) ? 53 : 52;
}

export function isIsoWeekDate(value: unknown): boolean {
  const s = str(value, 12);
  const m = s === null ? null : /^(\d{4})-W(\d{2})(?:-([1-7]))?$/.exec(s);
  return m !== null && Number(m[2]) >= 1 && Number(m[2]) <= isoWeeks(Number(m[1]));
}

export interface Rfc3339Options {
  /** Accept lowercase `t` and `z`. Default `false`. */
  allowLowercase?: boolean;
  /** Accept a space instead of `T`. Default `false`. */
  allowSpace?: boolean;
}

export function isRfc3339(value: unknown, options?: Rfc3339Options): boolean {
  const s = str(value, 64);
  if (s === null) return false;
  const o = opts(options);
  const m =
    /^(\d{4})-(\d{2})-(\d{2})([Tt ])(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/.exec(
      s
    );
  if (m === null) return false;
  if (m[4] === 't' && !o.allowLowercase) return false;
  if (m[4] === ' ' && !o.allowSpace) return false;
  if (m[8] === 'z' && !o.allowLowercase) return false;
  if (!calendarOk(Number(m[1]), Number(m[2]), Number(m[3]))) return false;
  if (Number(m[5]) > 23 || Number(m[6]) > 59 || Number(m[7]) > 60) return false;
  if (m[8] !== 'Z' && m[8] !== 'z') {
    const off = /^[+-](\d{2}):(\d{2})$/.exec(m[8]!)!;
    if (Number(off[1]) > 23 || Number(off[2]) > 59) return false;
  }
  return true;
}

/** `isDate(value, 'DD/MM/YYYY')`. Tokens: YYYY, YY, MM, M, DD, D. Calendar-aware. */
export function isDate(value: unknown, format?: unknown): boolean {
  const s = str(value, 32);
  return s !== null && typeof format === 'string' && parseDate(s, format) !== null;
}

export function isDateTimeLocal(value: unknown): boolean {
  const s = str(value, 32);
  const m =
    s === null ? null : /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/.exec(s);
  return (
    m !== null &&
    isIsoDate(m[1]) &&
    Number(m[2]) <= 23 &&
    Number(m[3]) <= 59 &&
    Number(m[4] ?? 0) <= 59
  );
}

export function isMonthString(value: unknown): boolean {
  const s = str(value, 7);
  const m = s === null ? null : /^(\d{4})-(\d{2})$/.exec(s);
  return m !== null && Number(m[2]) >= 1 && Number(m[2]) <= 12 && Number(m[1]) >= 1;
}

export function isWeekString(value: unknown): boolean {
  const s = str(value, 8);
  const m = s === null ? null : /^(\d{4})-W(\d{2})$/.exec(s);
  return m !== null && Number(m[2]) >= 1 && Number(m[2]) <= isoWeeks(Number(m[1]));
}

export function isTime12h(value: unknown, options?: { allowSeconds?: boolean }): boolean {
  const s = str(value, 16);
  if (s === null) return false;
  const sec = opts(options).allowSeconds ? '(?::[0-5]\\d)?' : '';
  return new RegExp(`^(?:0?[1-9]|1[0-2]):[0-5]\\d${sec} ?[AaPp][Mm]$`).test(s);
}

export function isTime24h(value: unknown, options?: { allowSeconds?: boolean }): boolean {
  const s = str(value, 16);
  if (s === null) return false;
  const sec = opts(options).allowSeconds ? '(?::[0-5]\\d)?' : '';
  return new RegExp(`^(?:[01]\\d|2[0-3]):[0-5]\\d${sec}$`).test(s);
}

export interface UnixTimestampOptions {
  /** `s` (default), `ms`, or `any` (accept either). */
  unit?: 's' | 'ms' | 'any';
  /** Inclusive range in the chosen unit. Default 1970 to the year 2100. */
  min?: number;
  max?: number;
  /** Reject timestamps after `now`. Default `false`. */
  notFuture?: boolean;
  /** The clock, for `notFuture`. Default `Date.now()`. */
  now?: Date | number;
}

const MAX_S = 4102444800;

/** ⏱ Reads the clock only when `notFuture` is set. */
export function isUnixTimestamp(value: unknown, options?: UnixTimestampOptions): boolean {
  const s = numStr(value, 20);
  if (s === null || !/^\d+$/.test(s)) return false;
  const n = Number(s);
  if (!Number.isSafeInteger(n)) return false;
  const o = opts(options);
  const unit = o.unit ?? 's';
  const inRange = (u: 's' | 'ms') => {
    const k = u === 's' ? 1 : 1000;
    return n >= (o.min ?? 0) && n <= (o.max ?? MAX_S * k);
  };
  const ok = unit === 'any' ? inRange('s') || inRange('ms') : inRange(unit);
  if (!ok) return false;
  if (o.notFuture) {
    const now = o.now === undefined ? Date.now() : Number(o.now);
    const ms = unit === 'ms' || (unit === 'any' && s.length >= 12) ? n : n * 1000;
    return ms <= now;
  }
  return true;
}

export function isTimezoneOffset(value: unknown): boolean {
  const s = str(value, 6);
  if (s === null) return false;
  if (s === 'Z') return true;
  const m = /^[+-](\d{2})(?::?(\d{2}))?$/.exec(s);
  return (
    m !== null &&
    Number(m[1]) <= 14 &&
    Number(m[2] ?? 0) <= 59 &&
    !(Number(m[1]) === 14 && Number(m[2] ?? 0) > 0)
  );
}

let tzSet: Set<string> | null | undefined;

function timezoneList(): Set<string> | null {
  if (tzSet === undefined) {
    try {
      const list = (
        Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
      ).supportedValuesOf?.('timeZone');
      tzSet = list ? new Set([...list, 'UTC', 'GMT', 'Etc/UTC', 'Etc/GMT']) : null;
    } catch {
      tzSet = null;
    }
  }
  return tzSet;
}

/**
 * IANA time zone name. Uses the runtime's own list where it has one, so answers can
 * differ by engine and ICU version. `{ checkData: false }` checks the pattern only.
 */
export function isTimezone(value: unknown, options?: { checkData?: boolean }): boolean {
  const s = str(value, 64);
  if (s === null || !/^[A-Z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9][A-Za-z0-9_+-]*)*$/.test(s))
    return false;
  if (opts(options).checkData === false) return true;
  const list = timezoneList();
  if (list !== null) return list.has(s);
  try {
    new Intl.DateTimeFormat('en', { timeZone: s });
    return true;
  } catch {
    return false;
  }
}

export type CronDialect = 'unix' | 'quartz' | 'aws' | 'k8s';

const MONTHS = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ');
const DAYS = 'SUN MON TUE WED THU FRI SAT'.split(' ');

interface FieldSpec {
  min: number;
  max: number;
  names?: string[];
  nameBase?: number;
  special?: boolean;
  question?: boolean;
}

function cronNumber(tok: string, f: FieldSpec): number | null {
  if (/^\d+$/.test(tok)) {
    const n = Number(tok);
    return n >= f.min && n <= f.max ? n : null;
  }
  if (f.names) {
    const i = f.names.indexOf(tok.toUpperCase());
    if (i >= 0) return i + (f.nameBase ?? 0);
  }
  return null;
}

function cronItem(item: string, f: FieldSpec): boolean {
  if (item === '*') return true;
  if (item === '?') return f.question === true;
  if (f.special) {
    if (item === 'L' || item === 'LW') return true;
    if (/^L-\d+$/.test(item)) return Number(item.slice(2)) >= 1 && Number(item.slice(2)) <= 30;
    const w = /^(\d+)W$/.exec(item);
    if (w !== null) return cronNumber(w[1]!, f) !== null;
    const last = /^(\w+)L$/.exec(item);
    if (last !== null) return cronNumber(last[1]!, f) !== null;
    const nth = /^(\w+)#([1-5])$/.exec(item);
    if (nth !== null) return cronNumber(nth[1]!, f) !== null;
  }
  const [range, step, ...extra] = item.split('/');
  if (extra.length > 0 || range === undefined) return false;
  if (step !== undefined && !(/^\d+$/.test(step) && Number(step) >= 1 && Number(step) <= f.max))
    return false;
  if (range === '*') return true;
  const [a, b, ...more] = range.split('-');
  if (more.length > 0 || a === undefined) return false;
  const lo = cronNumber(a, f);
  if (lo === null) return false;
  if (b === undefined) return true;
  const hi = cronNumber(b, f);
  return hi !== null && lo <= hi;
}

function cronField(field: string, f: FieldSpec): boolean {
  return field.length > 0 && field.split(',').every((item) => cronItem(item, f));
}

const MACROS = ['@yearly', '@annually', '@monthly', '@weekly', '@daily', '@midnight', '@hourly'];

export function isCron(value: unknown, options?: { dialect?: CronDialect }): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const dialect = opts(options).dialect ?? 'unix';
  const t = s.trim();
  if (t !== s) return false;
  if (dialect === 'k8s' && MACROS.includes(t.toLowerCase())) return true;
  const fields = t.split(/ +/);
  const q = dialect !== 'unix';
  const minute: FieldSpec = { min: 0, max: 59 };
  const hour: FieldSpec = { min: 0, max: 23 };
  const dom: FieldSpec = {
    min: 1,
    max: 31,
    question: q,
    special: dialect === 'quartz' || dialect === 'aws'
  };
  const month: FieldSpec = { min: 1, max: 12, names: MONTHS, nameBase: 1 };
  const dowUnix: FieldSpec = {
    min: 0,
    max: 7,
    names: DAYS,
    nameBase: 0,
    question: dialect === 'k8s'
  };
  const dowQ: FieldSpec = {
    min: 1,
    max: 7,
    names: DAYS,
    nameBase: 1,
    question: true,
    special: true
  };
  const year: FieldSpec = { min: 1970, max: 2199 };
  const sec: FieldSpec = { min: 0, max: 59 };
  let specs: FieldSpec[];
  if (dialect === 'quartz') {
    if (fields.length !== 6 && fields.length !== 7) return false;
    specs = [sec, minute, hour, dom, month, dowQ, ...(fields.length === 7 ? [year] : [])];
  } else if (dialect === 'aws') {
    if (fields.length !== 6) return false;
    specs = [minute, hour, dom, month, dowQ, year];
  } else {
    if (fields.length !== 5) return false;
    specs = [minute, hour, { ...dom, special: false }, month, dowUnix];
  }
  return specs.every((spec, i) => cronField(fields[i]!, spec));
}

export function isYear(value: unknown, options?: { min?: number; max?: number }): boolean {
  const s = numStr(value, 4);
  if (s === null || !/^\d{4}$/.test(s)) return false;
  const n = Number(s);
  const o = opts(options);
  return n >= (o.min ?? 0) && n <= (o.max ?? 9999);
}

export interface CardExpiryOptions {
  /** The clock. Default `Date.now()`. */
  now?: Date | number;
  /** Accept a month in the past (shape and calendar only). Default `false`. */
  allowPast?: boolean;
  /** How far ahead is plausible. Default 20 years. */
  maxYears?: number;
}

/** ⏱ `MM/YY` or `MM/YYYY`, valid through the end of the stated month. */
export function isCreditCardExpiry(value: unknown, options?: CardExpiryOptions): boolean {
  const s = str(value, 8);
  const m = s === null ? null : /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.exec(s);
  if (m === null) return false;
  const o = opts(options);
  const month = Number(m[1]);
  const year = m[2]!.length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  const now = new Date(o.now === undefined ? Date.now() : o.now);
  if (Number.isNaN(now.getTime())) return false;
  const idx = year * 12 + month;
  const nowIdx = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;
  if (o.allowPast) return true;
  return idx >= nowIdx && idx <= nowIdx + (o.maxYears ?? 20) * 12;
}

export interface DateOfBirthOptions {
  /** Date format. Default `YYYY-MM-DD`. */
  format?: string;
  minAge?: number;
  maxAge?: number;
  /** The clock. Default `Date.now()`. */
  now?: Date | number;
}

/** ⏱ A real date that is not in the future, with optional age limits. */
export function isDateOfBirth(value: unknown, options?: DateOfBirthOptions): boolean {
  const s = str(value, 32);
  if (s === null) return false;
  const o = opts(options);
  const d = parseDate(s, o.format ?? 'YYYY-MM-DD');
  if (d === null) return false;
  const now = new Date(o.now === undefined ? Date.now() : o.now);
  if (Number.isNaN(now.getTime())) return false;
  const ny = now.getUTCFullYear();
  const nm = now.getUTCMonth() + 1;
  const nd = now.getUTCDate();
  if (d.y > ny || (d.y === ny && (d.m > nm || (d.m === nm && d.d > nd)))) return false;
  let age = ny - d.y;
  if (nm < d.m || (nm === d.m && nd < d.d)) age--;
  return age >= (o.minAge ?? 0) && age <= (o.maxAge ?? 150);
}
