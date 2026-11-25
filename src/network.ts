import { opts, str } from './internal/core.js';
import { TLD, domainOk, ipv4Ok, ipv6Ok, mediaTypeOk, MIME_RE } from './internal/shared.js';
import type { DomainOptions, MimeTypeOptions } from './internal/shared.js';
import { isEmail } from './contact.js';
import type { Base64, Domain, HttpUrl, Ipv4, Ipv6, Jwt } from './types.js';

// ---------------------------------------------------------------- domains and hosts

export function isDomain(value: unknown, options?: DomainOptions): value is Domain {
  const s = str(value, 260);
  return s !== null && domainOk(s, opts(options));
}

export function isHostname(value: unknown, options?: Omit<DomainOptions, 'requireTld'>): boolean {
  const s = str(value, 260);
  return s !== null && domainOk(s, { ...opts(options), requireTld: false });
}

export function isEmailDomain(
  value: unknown,
  options?: DomainOptions & { allowIpLiteral?: boolean }
): boolean {
  const s = str(value, 260);
  if (s === null) return false;
  const o = opts(options);
  if (o.allowIpLiteral && s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1);
    return ipv4Ok(inner, false) || (inner.startsWith('IPv6:') && ipv6Ok(inner.slice(5), false));
  }
  return domainOk(s, o);
}

export function isTld(value: unknown): boolean {
  const s = str(value, 64);
  return s !== null && TLD.test(s);
}

export interface HostPortOptions {
  /** A port must be present. Default `true`. */
  requirePort?: boolean;
}

export function isHostPort(value: unknown, options?: HostPortOptions): boolean {
  const s = str(value, 300);
  if (s === null) return false;
  const requirePort = opts(options).requirePort ?? true;
  let host: string;
  let port: string | undefined;
  if (s.startsWith('[')) {
    const close = s.indexOf(']');
    if (close < 0) return false;
    host = s.slice(1, close);
    const rest = s.slice(close + 1);
    if (rest !== '') {
      if (!rest.startsWith(':')) return false;
      port = rest.slice(1);
    }
    if (!ipv6Ok(host, false)) return false;
  } else {
    const colon = s.lastIndexOf(':');
    if (colon >= 0) {
      host = s.slice(0, colon);
      port = s.slice(colon + 1);
    } else host = s;
    if (!(ipv4Ok(host, false) || domainOk(host, { requireTld: false }))) return false;
  }
  if (port === undefined) return !requirePort;
  return portOk(port);
}

function portOk(p: string): boolean {
  return /^(?:0|[1-9]\d{0,4})$/.test(p) && Number(p) <= 65535;
}

export function isAsn(value: unknown, options?: { requirePrefix?: boolean }): boolean {
  const s = str(value, 16);
  if (s === null) return false;
  const requirePrefix = opts(options).requirePrefix ?? true;
  const m = /^(?:AS)?(0|[1-9]\d{0,9})$/i.exec(s);
  if (m === null) return false;
  if (requirePrefix && !/^AS/i.test(s)) return false;
  return Number(m[1]) <= 4294967295;
}

export function isPort(value: unknown, options?: { allowZero?: boolean }): boolean {
  let s: string;
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || Object.is(value, -0)) return false;
    s = String(value);
  } else {
    const v = str(value, 8);
    if (v === null) return false;
    s = v;
  }
  if (!portOk(s)) return false;
  return (opts(options).allowZero ?? true) || s !== '0';
}

// ---------------------------------------------------------------------------- IP

export interface Ipv4Options {
  /** Accept octets such as `010`. Default `false`. */
  allowLeadingZeros?: boolean;
}

export function isIpv4(value: unknown, options?: Ipv4Options): value is Ipv4 {
  const s = str(value, 15);
  return s !== null && ipv4Ok(s, opts(options).allowLeadingZeros ?? false);
}

export function isIpv6(value: unknown, options?: { allowZone?: boolean }): value is Ipv6 {
  const s = str(value, 64);
  return s !== null && ipv6Ok(s, opts(options).allowZone ?? false);
}

export function isIp(
  value: unknown,
  options?: Ipv4Options & { version?: 4 | 6; allowZone?: boolean }
): boolean {
  const o = opts(options);
  if (o.version === 4) return isIpv4(value, o);
  if (o.version === 6) return isIpv6(value, o);
  return isIpv4(value, o) || isIpv6(value, o);
}

function prefixOk(p: string, max: number): boolean {
  return /^(?:0|[1-9]\d{0,2})$/.test(p) && Number(p) <= max;
}

export function isIpv4Cidr(value: unknown): boolean {
  const s = str(value, 18);
  if (s === null) return false;
  const i = s.indexOf('/');
  return i > 0 && ipv4Ok(s.slice(0, i), false) && prefixOk(s.slice(i + 1), 32);
}

export function isIpv6Cidr(value: unknown): boolean {
  const s = str(value, 50);
  if (s === null) return false;
  const i = s.indexOf('/');
  return i > 0 && ipv6Ok(s.slice(0, i), false) && prefixOk(s.slice(i + 1), 128);
}

export function isCidr(value: unknown): boolean {
  return isIpv4Cidr(value) || isIpv6Cidr(value);
}

function v4num(s: string): number {
  return s.split('.').reduce((acc, p) => acc * 256 + Number(p), 0);
}

export function isIpRange(value: unknown): boolean {
  const s = str(value, 40);
  if (s === null) return false;
  const i = s.indexOf('-');
  if (i < 0) return false;
  const a = s.slice(0, i).trim();
  const b = s.slice(i + 1).trim();
  return ipv4Ok(a, false) && ipv4Ok(b, false) && v4num(a) <= v4num(b);
}

/** Expand a valid IPv6 string to eight 16-bit groups. */
function v6expand(s: string): number[] {
  const addr = s.split('%')[0]!;
  const dbl = addr.indexOf('::');
  const toGroups = (part: string): number[] => {
    if (part === '') return [];
    const out: number[] = [];
    for (const g of part.split(':')) {
      if (g.includes('.')) {
        const n = v4num(g);
        out.push(Math.floor(n / 65536), n % 65536);
      } else out.push(parseInt(g, 16));
    }
    return out;
  };
  if (dbl < 0) return toGroups(addr);
  const head = toGroups(addr.slice(0, dbl));
  const tail = toGroups(addr.slice(dbl + 2));
  return [...head, ...new Array<number>(8 - head.length - tail.length).fill(0), ...tail];
}

type ParsedIp = { v: 4; n: number } | { v: 6; g: number[] };

function parseIp(value: unknown): ParsedIp | null {
  const s = str(value, 64);
  if (s === null) return null;
  if (ipv4Ok(s, false)) return { v: 4, n: v4num(s) };
  if (ipv6Ok(s, true)) {
    const g = v6expand(s);
    // IPv4-mapped (::ffff:a.b.c.d) is judged as the IPv4 address it carries.
    if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) {
      return { v: 4, n: g[6]! * 65536 + g[7]! };
    }
    return { v: 6, g };
  }
  return null;
}

const inV4 = (n: number, base: string, bits: number): boolean => {
  const b = v4num(base);
  const size = 2 ** (32 - bits);
  return n >= b && n < b + size;
};

function inV6(g: number[], base: number[], bits: number): boolean {
  let left = bits;
  for (let i = 0; i < 8 && left > 0; i++) {
    const take = Math.min(16, left);
    const shift = 16 - take;
    if (g[i]! >> shift !== base[i]! >> shift) return false;
    left -= take;
  }
  return true;
}

const g6 = (s: string): number[] => v6expand(s);

// IANA IPv4/IPv6 special-purpose address registries. Checked 2026-11.
const V4_SPECIAL: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4]
];
const V6_SPECIAL: [number[], number][] = [
  [g6('::'), 128],
  [g6('::1'), 128],
  [g6('64:ff9b::'), 96],
  [g6('100::'), 64],
  [g6('2001::'), 23],
  [g6('2001:db8::'), 32],
  [g6('2002::'), 16],
  [g6('fc00::'), 7],
  [g6('fe80::'), 10],
  [g6('fec0::'), 10],
  [g6('ff00::'), 8]
];

export function isPublicIp(value: unknown): boolean {
  const ip = parseIp(value);
  if (ip === null) return false;
  if (ip.v === 4) return !V4_SPECIAL.some(([b, bits]) => inV4(ip.n, b, bits));
  return !V6_SPECIAL.some(([b, bits]) => inV6(ip.g, b, bits));
}

export function isPrivateIp(value: unknown): boolean {
  const ip = parseIp(value);
  if (ip === null) return false;
  if (ip.v === 4) {
    return (
      inV4(ip.n, '10.0.0.0', 8) || inV4(ip.n, '172.16.0.0', 12) || inV4(ip.n, '192.168.0.0', 16)
    );
  }
  return inV6(ip.g, g6('fc00::'), 7);
}

export function isLoopbackIp(value: unknown): boolean {
  const ip = parseIp(value);
  if (ip === null) return false;
  if (ip.v === 4) return inV4(ip.n, '127.0.0.0', 8);
  return inV6(ip.g, g6('::1'), 128);
}

export function isLinkLocalIp(value: unknown): boolean {
  const ip = parseIp(value);
  if (ip === null) return false;
  if (ip.v === 4) return inV4(ip.n, '169.254.0.0', 16);
  return inV6(ip.g, g6('fe80::'), 10);
}

export function isMacAddress(
  value: unknown,
  options?: { format?: 'colon' | 'dash' | 'dot' | 'bare' | 'any' }
): boolean {
  const s = str(value, 17);
  if (s === null) return false;
  const f = opts(options).format ?? 'any';
  const colon = /^[0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){5}$/.test(s);
  const dash = /^[0-9A-Fa-f]{2}(?:-[0-9A-Fa-f]{2}){5}$/.test(s);
  const dot = /^[0-9A-Fa-f]{4}(?:\.[0-9A-Fa-f]{4}){2}$/.test(s);
  const bare = /^[0-9A-Fa-f]{12}$/.test(s);
  switch (f) {
    case 'colon':
      return colon;
    case 'dash':
      return dash;
    case 'dot':
      return dot;
    case 'bare':
      return bare;
    default:
      return colon || dash || dot || bare;
  }
}

// ----------------------------------------------------------------------------- URL

export interface UrlOptions {
  /** Allowed schemes. Default `['http', 'https', 'ftp']`. */
  protocols?: string[];
  /** The scheme must be present. Default `true`. */
  requireProtocol?: boolean;
  /** The host needs a dot and a real top-level label. Default `true`. */
  requireTld?: boolean;
  /** Accept `localhost` even when `requireTld` is on. Default `false`. */
  allowLocalhost?: boolean;
  /** Accept IPv4 and IPv6 literals as the host. Default `true`. */
  allowIp?: boolean;
  /** Accept `user:pass@host`. Default `false`. */
  allowCredentials?: boolean;
  /** Maximum length. Default 2048. */
  maxLength?: number;
}

const URL_FORBIDDEN = /[\s\u0000-\u001f\u007f<>"\\^`{|}]/;
const PCT_BAD = /%(?![0-9A-Fa-f]{2})/;
const USERINFO = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*$/;

export function isUrl(value: unknown, options?: UrlOptions): boolean {
  const o = opts(options);
  const max = Math.min(o.maxLength ?? 2048, 8192);
  const s = str(value, max);
  if (s === null) return false;
  const protocols = (o.protocols ?? ['http', 'https', 'ftp']).map((p) => p.toLowerCase());
  const requireProtocol = o.requireProtocol ?? true;

  let rest = s;
  const m = /^([A-Za-z][A-Za-z0-9+.-]*):(\/\/)?/.exec(s);
  if (m !== null && (m[2] !== undefined || !/^[A-Za-z0-9.-]+:\d+(?:[/?#]|$)/.test(s))) {
    const scheme = m[1]!.toLowerCase();
    if (!protocols.includes(scheme)) return false;
    rest = s.slice(m[0].length);
    if (m[2] === undefined) {
      // Opaque schemes such as mailto: or urn: have no authority to check.
      return rest.length > 0 && !URL_FORBIDDEN.test(rest) && !PCT_BAD.test(rest);
    }
  } else if (requireProtocol) {
    return false;
  }

  if (URL_FORBIDDEN.test(rest) || PCT_BAD.test(rest)) return false;
  const end = rest.search(/[/?#]/);
  const authority = end < 0 ? rest : rest.slice(0, end);
  if (authority === '') return false;
  let host = authority;
  const at = authority.lastIndexOf('@');
  if (at >= 0) {
    if (!(o.allowCredentials ?? false)) return false;
    if (!USERINFO.test(authority.slice(0, at))) return false;
    host = authority.slice(at + 1);
  }
  let port: string | undefined;
  if (host.startsWith('[')) {
    const close = host.indexOf(']');
    if (close < 0) return false;
    const after = host.slice(close + 1);
    if (after !== '') {
      if (!after.startsWith(':')) return false;
      port = after.slice(1);
    }
    if (!(o.allowIp ?? true) || !ipv6Ok(host.slice(1, close), false)) return false;
  } else {
    const colon = host.lastIndexOf(':');
    if (colon >= 0) {
      port = host.slice(colon + 1);
      host = host.slice(0, colon);
    }
    if (/^[\d.]+$/.test(host)) {
      if (!(o.allowIp ?? true) || !ipv4Ok(host, false)) return false;
    } else if (host.toLowerCase() === 'localhost') {
      if (!(o.allowLocalhost ?? false) && (o.requireTld ?? true)) return false;
    } else if (!domainOk(host, { requireTld: o.requireTld ?? true })) return false;
  }
  return port === undefined || portOk(port);
}

export function isHttpUrl(
  value: unknown,
  options?: Omit<UrlOptions, 'protocols'>
): value is HttpUrl {
  return isUrl(value, { ...opts(options), protocols: ['http', 'https'] });
}

export function isWebSocketUrl(value: unknown, options?: Omit<UrlOptions, 'protocols'>): boolean {
  return isUrl(value, { ...opts(options), protocols: ['ws', 'wss'] });
}

export function isRelativeUrl(value: unknown): boolean {
  const s = str(value, 2048);
  if (s === null || s.startsWith('//')) return false;
  if (URL_FORBIDDEN.test(s) || PCT_BAD.test(s)) return false;
  const firstSeg = s.split(/[/?#]/)[0]!;
  return !firstSeg.includes(':');
}

export function isUrlPath(value: unknown): boolean {
  const s = str(value, 2048);
  return s !== null && /^(?:\/(?:[A-Za-z0-9._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*)+$/.test(s);
}

export function isUrlSafe(value: unknown): boolean {
  const s = str(value, 2048);
  return s !== null && /^[A-Za-z0-9\-._~]+$/.test(s);
}

export function isPercentEncoded(value: unknown): boolean {
  const s = str(value, 4096);
  return s !== null && !PCT_BAD.test(s) && !/[\u0000-\u001f\u007f\s]/.test(s);
}

export function isUriScheme(value: unknown): boolean {
  const s = str(value, 32);
  return s !== null && /^[A-Za-z][A-Za-z0-9+.-]*$/.test(s);
}

export interface DatabaseUrlOptions {
  /** Allowed schemes. Default: the common database and queue schemes. */
  schemes?: string[];
}

const DB_SCHEMES = [
  'postgres',
  'postgresql',
  'mysql',
  'mariadb',
  'mongodb',
  'mongodb+srv',
  'redis',
  'rediss',
  'amqp',
  'amqps'
];

export function isDatabaseUrl(value: unknown, options?: DatabaseUrlOptions): boolean {
  const s = str(value, 2048);
  if (s === null) return false;
  const schemes = (opts(options).schemes ?? DB_SCHEMES).map((x) => x.toLowerCase());
  const m = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#\s]*)(\/[^?#\s]*)?(\?[^#\s]*)?$/.exec(s);
  if (m === null) return false;
  const scheme = m[1]!.toLowerCase();
  if (!schemes.includes(scheme)) return false;
  let authority = m[2]!;
  const at = authority.lastIndexOf('@');
  if (at >= 0) {
    if (!USERINFO.test(authority.slice(0, at))) return false;
    authority = authority.slice(at + 1);
  }
  const srv = scheme.endsWith('+srv');
  const hosts = authority === '' ? [] : authority.split(',');
  if (hosts.length === 0) return scheme.startsWith('redis') && at >= 0;
  return hosts.every((h) =>
    srv
      ? isHostPort(h, { requirePort: false }) && !/:\d/.test(h)
      : isHostPort(h, { requirePort: false })
  );
}

const DANGEROUS = ['javascript', 'data', 'vbscript', 'file', 'about', 'blob'];
const WEB = ['http', 'https', 'ftp', 'ws', 'wss'];

export function isDeepLink(value: unknown, options?: { schemes?: string[] }): boolean {
  const s = str(value, 2048);
  if (s === null) return false;
  const m = /^([A-Za-z][A-Za-z0-9+.-]*):(.+)$/s.exec(s);
  if (m === null) return false;
  const scheme = m[1]!.toLowerCase();
  if (DANGEROUS.includes(scheme)) return false;
  const pinned = opts(options).schemes;
  if (pinned !== undefined) {
    if (!pinned.map((p) => p.toLowerCase()).includes(scheme)) return false;
  } else if (WEB.includes(scheme)) return false;
  const rest = m[2]!;
  return !URL_FORBIDDEN.test(rest) && !PCT_BAD.test(rest);
}

export function isMailtoUri(value: unknown): boolean {
  const s = str(value, 2048);
  if (s === null || !/^mailto:/i.test(s)) return false;
  const body = s.slice(7);
  const q = body.indexOf('?');
  const addrs = q < 0 ? body : body.slice(0, q);
  const query = q < 0 ? '' : body.slice(q + 1);
  if (PCT_BAD.test(body) || /[\s<>"]/.test(body)) return false;
  if (addrs === '' && q < 0) return false;
  if (addrs !== '') {
    for (const a of addrs.split(',')) {
      let decoded: string;
      try {
        decoded = decodeURIComponent(a);
      } catch {
        return false;
      }
      if (!isEmail(decoded, { allowUnicode: true })) return false;
    }
  }
  if (query === '') return q < 0;
  return query.split('&').every((p) => /^[A-Za-z][A-Za-z0-9-]*=[^&]*$/.test(p));
}

export function isTelUri(value: unknown): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const params = '(?:;[A-Za-z0-9-]+(?:=[^;\\s]+)?)*';
  const global = new RegExp(`^tel:\\+[\\d().-]*\\d[\\d().-]*${params}$`, 'i');
  const local = new RegExp(`^tel:[\\d().-]*\\d[\\d().-]*;phone-context=[^;\\s]+${params}$`, 'i');
  return global.test(s) || local.test(s);
}

export function isSmsUri(value: unknown): boolean {
  const s = str(value, 512);
  if (s === null) return false;
  return /^sms:\+?[\d().-]*\d[\d().-]*(?:,\+?[\d().-]*\d[\d().-]*)*(?:;[A-Za-z-]+=[^;,?\s]*)*(?:\?[^\s#]*)?$/i.test(
    s
  );
}

export function isGeoUri(value: unknown): boolean {
  const s = str(value, 256);
  if (s === null) return false;
  const m =
    /^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,-?\d+(?:\.\d+)?)?(?:;[A-Za-z0-9-]+(?:=[^;\s]*)?)*$/i.exec(
      s
    );
  if (m === null) return false;
  return Math.abs(Number(m[1])) <= 90 && Math.abs(Number(m[2])) <= 180;
}

// --------------------------------------------------------------------- encodings

export function isMimeType(value: unknown, options?: MimeTypeOptions): boolean {
  const s = str(value, 300);
  return s !== null && mediaTypeOk(s, opts(options));
}

export interface DataUriOptions {
  /** Restrict to these media types. */
  mediaTypes?: string[];
  /** Maximum length of the whole URI. Default 2,000,000. */
  maxLength?: number;
}

export function isDataUri(value: unknown, options?: DataUriOptions): boolean {
  const o = opts(options);
  const s = str(value, Math.min(o.maxLength ?? 2_000_000, 10_000_000));
  if (s === null || !/^data:/i.test(s)) return false;
  const comma = s.indexOf(',');
  if (comma < 0 || comma > 300) return false;
  const head = s.slice(5, comma);
  const payload = s.slice(comma + 1);
  const parts = head.split(';');
  let base64 = false;
  let type = 'text/plain';
  const first = parts[0]!;
  let idx = 0;
  if (first === '') idx = 1;
  else if (!first.includes('=')) {
    if (!MIME_RE.test(first)) return false;
    type = first.toLowerCase();
    idx = 1;
  }
  for (const p of parts.slice(idx)) {
    if (p.toLowerCase() === 'base64') base64 = true;
    else if (!/^[A-Za-z0-9-]+=[^;\s]*$/.test(p)) return false;
  }
  if (o.mediaTypes !== undefined && !o.mediaTypes.map((t) => t.toLowerCase()).includes(type))
    return false;
  if (base64) return payload === '' || isBase64(payload, { padding: 'required' });
  return !PCT_BAD.test(payload) && !/\s/.test(payload);
}

export interface Base64Options {
  /** Use the URL-safe alphabet (`-` and `_`). Default `false`. */
  urlSafe?: boolean;
  /** Whether `=` padding must be present, may be present, or must be absent. */
  padding?: 'required' | 'optional' | 'none';
}

function base64Check(
  s: string,
  urlSafe: boolean,
  padding: 'required' | 'optional' | 'none'
): boolean {
  const alphabet = urlSafe ? /^[A-Za-z0-9_-]*$/ : /^[A-Za-z0-9+/]*$/;
  const eq = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0;
  const body = eq ? s.slice(0, -eq) : s;
  if (!alphabet.test(body)) return false;
  if (eq > 0) {
    if (padding === 'none') return false;
    return s.length % 4 === 0;
  }
  const rem = body.length % 4;
  if (rem === 1) return false;
  if (rem === 0) return true;
  return padding !== 'required';
}

export function isBase64(value: unknown, options?: Base64Options): value is Base64 {
  const s = str(value, 10_000_000);
  if (s === null) return false;
  const o = opts(options);
  return base64Check(s, o.urlSafe ?? false, o.padding ?? 'required');
}

export function isBase64Url(value: unknown, options?: Pick<Base64Options, 'padding'>): boolean {
  const s = str(value, 10_000_000);
  return s !== null && base64Check(s, true, opts(options).padding ?? 'none');
}

export interface Base32Options {
  /** `rfc4648` (default), `hex` (extended hex alphabet) or `crockford`. */
  variant?: 'rfc4648' | 'hex' | 'crockford';
  padding?: 'required' | 'optional' | 'none';
}

export function isBase32(value: unknown, options?: Base32Options): boolean {
  const s = str(value, 1_000_000);
  if (s === null) return false;
  const o = opts(options);
  const variant = o.variant ?? 'rfc4648';
  if (variant === 'crockford') return /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]+$/.test(s);
  const padding = o.padding ?? 'optional';
  const alpha = variant === 'rfc4648' ? /^[A-Z2-7]*$/ : /^[0-9A-V]*$/;
  const eqm = /(=*)$/.exec(s)!;
  const body = s.slice(0, s.length - eqm[1]!.length);
  if (!alpha.test(body) || body.length === 0) return false;
  const eq = eqm[1]!.length;
  if (eq > 0) {
    if (padding === 'none') return false;
    return s.length % 8 === 0 && [1, 3, 4, 6].includes(eq);
  }
  if (padding === 'required' && body.length % 8 !== 0) return false;
  return [0, 2, 4, 5, 7].includes(body.length % 8);
}

export function isBase58(value: unknown): boolean {
  const s = str(value, 10_000);
  return s !== null && /^[1-9A-HJ-NP-Za-km-z]+$/.test(s);
}

export interface JwtOptions {
  /** `jws` (signed, three parts), `jwe` (encrypted, five parts) or `any`. Default `any`. */
  type?: 'jws' | 'jwe' | 'any';
  /** Accept an unsecured JWT with an empty signature. Default `false`. */
  allowEmptySignature?: boolean;
}

export function isJwt(value: unknown, options?: JwtOptions): value is Jwt {
  const s = str(value, 8192);
  if (s === null) return false;
  const o = opts(options);
  const type = o.type ?? 'any';
  const parts = s.split('.');
  const b64 = /^[A-Za-z0-9_-]*$/;
  if (!parts.every((p) => b64.test(p))) return false;
  if (parts.length === 3 && type !== 'jwe') {
    const [h, p, sig] = parts as [string, string, string];
    // A JSON object starts with `{`, which base64url-encodes to `ey`.
    if (!h.startsWith('ey') || !p.startsWith('ey')) return false;
    return sig.length > 0 || (o.allowEmptySignature ?? false);
  }
  if (parts.length === 5 && type !== 'jws') {
    const [h, , iv, ct, tag] = parts as [string, string, string, string, string];
    return h.startsWith('ey') && iv.length > 0 && ct.length > 0 && tag.length > 0;
  }
  return false;
}

// ---------------------------------------------------------------------------- emoji

let emojiRe: RegExp | undefined;

function emojiPattern(): RegExp {
  if (emojiRe === undefined) {
    try {
      emojiRe = new RegExp('^\\p{RGI_Emoji}$', 'v');
    } catch {
      // Engines without the `v` flag: approximate with Extended_Pictographic sequences.
      emojiRe = new RegExp(
        '^(?:(?:\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?)(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?)*|\\p{Regional_Indicator}{2}|[0-9#*]\\uFE0F?\\u20E3)$',
        'u'
      );
    }
  }
  return emojiRe;
}

export function isEmoji(value: unknown): boolean {
  const s = str(value, 64);
  return s !== null && emojiPattern().test(s);
}

export type { DomainOptions, MimeTypeOptions } from './internal/shared.js';
