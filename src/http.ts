import { numStr, opts, str } from './internal/core.js';
import { isBase64, isHostPort } from './network.js';
import { mediaTypeOk } from './internal/shared.js';
import { isUuid } from './identifiers.js';
import { calendarOk } from './internal/shared.js';

const TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const STANDARD_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH'
];

export interface HttpMethodOptions {
  /** The methods to accept. Default: the nine standard methods. */
  methods?: string[];
  /** Accept any valid method token, such as `PROPFIND`. Default `false`. */
  anyToken?: boolean;
}

/** HTTP methods are case-sensitive; `get` is not `GET`. */
export function isHttpMethod(value: unknown, options?: HttpMethodOptions): boolean {
  const s = str(value, 32);
  if (s === null) return false;
  const o = opts(options);
  if (o.methods !== undefined) return o.methods.includes(s);
  return o.anyToken ? TOKEN.test(s) : STANDARD_METHODS.includes(s);
}

export function isHttpHeaderName(value: unknown, options?: { allowPseudo?: boolean }): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  if (opts(options).allowPseudo && s.startsWith(':')) {
    return [':method', ':scheme', ':authority', ':path', ':status'].includes(s);
  }
  return TOKEN.test(s);
}

/**
 * A value that is safe to put in a header: visible ASCII, spaces and tabs inside, no CR,
 * LF or NUL. Blocks header injection (response splitting). Empty values are rejected.
 */
export function isHttpHeaderValue(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 65536);
  if (s === null || s.length > (opts(options).maxLength ?? 8192)) return false;
  return /^[\x21-\x7e](?:[\x20\x09\x21-\x7e]*[\x21-\x7e])?$/.test(s);
}

export function isContentType(value: unknown, options?: { mediaTypes?: string[] }): boolean {
  const s = str(value, 300);
  if (s === null || !mediaTypeOk(s, { allowParameters: true })) return false;
  const allowed = opts(options).mediaTypes;
  if (allowed === undefined) return true;
  const type = s.split(';')[0]!.trim().toLowerCase();
  return allowed.map((t) => t.toLowerCase()).includes(type);
}

const TOKEN68 = /^[A-Za-z0-9\-._~+/]+=*$/;

export function isBearerToken(value: unknown): boolean {
  const s = str(value, 4096);
  const m = s === null ? null : /^bearer +(\S+)$/i.exec(s);
  return m !== null && TOKEN68.test(m[1]!);
}

const AUTH_PARAMS =
  /^[A-Za-z][\w-]*=(?:"[^"\r\n]*"|[^\s,"]+)(?:\s*,\s*[A-Za-z][\w-]*=(?:"[^"\r\n]*"|[^\s,"]+))*$/;

export function isAuthorizationHeader(value: unknown, options?: { schemes?: string[] }): boolean {
  const s = str(value, 4096);
  const m = s === null ? null : /^([!#$%&'*+.^_`|~0-9A-Za-z-]+) +(\S.*)$/.exec(s);
  if (m === null) return false;
  const scheme = m[1]!.toLowerCase();
  const allowed = (opts(options).schemes ?? ['Bearer', 'Basic', 'Digest']).map((x) =>
    x.toLowerCase()
  );
  if (!allowed.includes(scheme)) return false;
  const creds = m[2]!;
  if (scheme === 'bearer') return TOKEN68.test(creds);
  if (scheme === 'basic') return isBase64(creds, { padding: 'required' });
  return TOKEN68.test(creds) || AUTH_PARAMS.test(creds);
}

export function isOrigin(
  value: unknown,
  options?: { allowNull?: boolean; schemes?: string[] }
): boolean {
  const s = str(value, 300);
  if (s === null) return false;
  const o = opts(options);
  if (s === 'null') return o.allowNull ?? false;
  const m = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#@\s]+)$/.exec(s);
  if (m === null) return false;
  const schemes = (o.schemes ?? ['http', 'https']).map((x) => x.toLowerCase());
  return schemes.includes(m[1]!.toLowerCase()) && isHostPort(m[2], { requirePort: false });
}

export type StatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export function isHttpStatusCode(
  value: unknown,
  options?: { class?: StatusClass | StatusClass[] }
): boolean {
  const s = numStr(value, 3);
  if (s === null || !/^[1-5]\d{2}$/.test(s)) return false;
  const c = opts(options).class;
  if (c === undefined) return true;
  return (Array.isArray(c) ? c : [c]).includes(`${s[0]}xx` as StatusClass);
}

export function isETag(value: unknown): boolean {
  const s = str(value, 258);
  return s !== null && /^(?:W\/)?"[\x21\x23-\x7e\x80-\xff]*"$/.test(s);
}

export function isCookieName(
  value: unknown,
  options?: { prefix?: '__Host-' | '__Secure-' }
): boolean {
  const s = str(value, 256);
  if (s === null || !TOKEN.test(s)) return false;
  const p = opts(options).prefix;
  return p === undefined || s.startsWith(p);
}

export function isCookieValue(value: unknown): boolean {
  const s = str(value, 4096);
  if (s === null) return false;
  const octets = '[\\x21\\x23-\\x2b\\x2d-\\x3a\\x3c-\\x5b\\x5d-\\x7e]*';
  return new RegExp(`^(?:${octets}|"${octets}")$`).test(s);
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateParts(
  day: string,
  longDay: boolean,
  d: string,
  mon: string,
  y: string,
  hh: string,
  mm: string,
  ss: string
): boolean {
  const year = y.length === 2 ? (Number(y) < 70 ? 2000 : 1900) + Number(y) : Number(y);
  const month = MONTHS.indexOf(mon) + 1;
  if (month === 0 || !calendarOk(year, month, Number(d))) return false;
  if (Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 60) return false;
  const weekday = new Date(Date.UTC(year, month - 1, Number(d))).getUTCDay();
  return (longDay ? DAYS_LONG : DAYS)[weekday] === day;
}

/** The IMF-fixdate form, `Sun, 06 Nov 1994 08:49:37 GMT`, with the weekday checked against the date. */
export function isHttpDate(value: unknown, options?: { allowObsolete?: boolean }): boolean {
  const s = str(value, 40);
  if (s === null) return false;
  const imf = /^([A-Z][a-z]{2}), (\d{2}) ([A-Z][a-z]{2}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/.exec(
    s
  );
  if (imf !== null)
    return dateParts(imf[1]!, false, imf[2]!, imf[3]!, imf[4]!, imf[5]!, imf[6]!, imf[7]!);
  if (!opts(options).allowObsolete) return false;
  const rfc850 =
    /^([A-Z][a-z]+), (\d{2})-([A-Z][a-z]{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}) GMT$/.exec(s);
  if (rfc850 !== null) {
    return dateParts(
      rfc850[1]!,
      true,
      rfc850[2]!,
      rfc850[3]!,
      rfc850[4]!,
      rfc850[5]!,
      rfc850[6]!,
      rfc850[7]!
    );
  }
  const asc = /^([A-Z][a-z]{2}) ([A-Z][a-z]{2}) ([ \d]\d) (\d{2}):(\d{2}):(\d{2}) (\d{4})$/.exec(s);
  return (
    asc !== null &&
    dateParts(asc[1]!, false, asc[3]!.trim(), asc[2]!, asc[7]!, asc[4]!, asc[5]!, asc[6]!)
  );
}

export function isTraceparent(value: unknown): boolean {
  const s = str(value, 55);
  const m =
    s === null ? null : /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/.exec(s);
  return m !== null && m[1] !== 'ff' && !/^0+$/.test(m[2]!) && !/^0+$/.test(m[3]!);
}

export function isIdempotencyKey(
  value: unknown,
  options?: { uuidOnly?: boolean; maxLength?: number }
): boolean {
  const s = str(value, 1024);
  const o = opts(options);
  if (s === null || s.length > (o.maxLength ?? 255)) return false;
  return o.uuidOnly ? isUuid(s) : /^[\x21-\x7e]+$/.test(s);
}

export interface SortParamOptions {
  /** Allowed field names. Default: any identifier. */
  fields?: string[];
  /** Maximum number of sort keys. Default 10. */
  maxFields?: number;
}

/** `-createdAt,name`: comma-separated fields, each with an optional `-` (descending) or `+`. */
export function isSortParam(value: unknown, options?: SortParamOptions): boolean {
  const s = str(value, 512);
  if (s === null) return false;
  const o = opts(options);
  const parts = s.split(',');
  if (parts.length > (o.maxFields ?? 10)) return false;
  const names = new Set<string>();
  for (const p of parts) {
    const m = /^[-+]?([A-Za-z_][\w.]*)$/.exec(p);
    if (m === null || names.has(m[1]!)) return false;
    if (o.fields !== undefined && !o.fields.includes(m[1]!)) return false;
    names.add(m[1]!);
  }
  return true;
}

export function isCursor(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 4096);
  return (
    s !== null && s.length <= (opts(options).maxLength ?? 512) && /^[A-Za-z0-9\-._~=]+$/.test(s)
  );
}

export function isCharset(value: unknown): boolean {
  const s = str(value, 40);
  return s !== null && /^[A-Za-z0-9][A-Za-z0-9_.:+-]*$/.test(s);
}

export function isAcceptLanguage(value: unknown): boolean {
  const s = str(value, 512);
  if (s === null) return false;
  const items = s.split(',');
  if (items.length > 20) return false;
  return items.every((i) =>
    /^\s*(?:\*|[A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8})*)(?:\s*;\s*q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/.test(
      i
    )
  );
}

export function isMultipartBoundary(value: unknown): boolean {
  const s = str(value, 70);
  return s !== null && /^[0-9A-Za-z'()+_,\-./:=? ]{0,69}[0-9A-Za-z'()+_,\-./:=?]$/.test(s);
}

/** The `sha256=<hex>` shape used by GitHub-style webhook signature headers. Never checks the signature. */
export function isHmacSignatureHeader(value: unknown): boolean {
  const s = str(value, 135);
  return s !== null && /^(?:sha1=[0-9a-f]{40}|sha256=[0-9a-f]{64}|sha512=[0-9a-f]{128})$/.test(s);
}
