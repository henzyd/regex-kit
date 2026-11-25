/** Helpers shared by several modules. Not exported from the package entry point. */

export interface DomainOptions {
  /** Require a dot and an alphabetic or punycode top-level label. Default `true`. */
  requireTld?: boolean;
  /** Allow Unicode letters in labels (internationalised names). Default `false`. */
  unicode?: boolean;
  /** Allow one trailing dot (`example.com.`). Default `false`. */
  allowTrailingDot?: boolean;
  /** Allow a leading `*.` wildcard label. Default `false`. */
  allowWildcard?: boolean;
}

const LABEL_ASCII = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const LABEL_UNI = /^[\p{L}\p{N}](?:[\p{L}\p{N}\p{M}-]{0,61}[\p{L}\p{N}\p{M}])?$/u;
export const TLD = /^(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59})$/;
const TLD_UNI = /^(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59}|\p{L}[\p{L}\p{M}]{1,62})$/u;

/** Shared by `isDomain`, `isHostname` and `isEmail`. */
export function domainOk(s: string, o: DomainOptions = {}): boolean {
  const requireTld = o.requireTld ?? true;
  let host = s;
  if (o.allowTrailingDot && host.endsWith('.')) host = host.slice(0, -1);
  if (o.allowWildcard && host.startsWith('*.')) host = host.slice(2);
  if (host.length === 0 || host.length > 253) return false;
  const labels = host.split('.');
  if (requireTld && labels.length < 2) return false;
  const label = o.unicode ? LABEL_UNI : LABEL_ASCII;
  for (const l of labels) if (!label.test(l)) return false;
  const last = labels[labels.length - 1]!;
  if (requireTld) return (o.unicode ? TLD_UNI : TLD).test(last);
  // Without a TLD requirement, an all-numeric last label would look like an IPv4 address.
  return !/^\d+$/.test(last);
}

export function ipv4Ok(s: string, allowLeadingZeros: boolean): boolean {
  const parts = s.split('.');
  if (parts.length !== 4) return false;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return false;
    if (!allowLeadingZeros && p.length > 1 && p.startsWith('0')) return false;
    if (Number(p) > 255) return false;
  }
  return true;
}

function v6groups(part: string, allowV4: boolean): number | null {
  if (part === '') return 0;
  const gs = part.split(':');
  let n = 0;
  for (let i = 0; i < gs.length; i++) {
    const gp = gs[i]!;
    if (i === gs.length - 1 && allowV4 && gp.includes('.')) {
      if (!ipv4Ok(gp, false)) return null;
      n += 2;
    } else if (/^[0-9A-Fa-f]{1,4}$/.test(gp)) n++;
    else return null;
  }
  return n;
}

export function ipv6Ok(s: string, allowZone: boolean): boolean {
  let addr = s;
  if (allowZone) {
    const pct = addr.indexOf('%');
    if (pct >= 0) {
      if (!/^[A-Za-z0-9_.~-]{1,32}$/.test(addr.slice(pct + 1))) return false;
      addr = addr.slice(0, pct);
    }
  }
  if (addr.length < 2 || addr.length > 45 || addr.includes(':::')) return false;
  const dbl = addr.indexOf('::');
  if (dbl !== addr.lastIndexOf('::')) return false;
  if (dbl < 0) return v6groups(addr, true) === 8;
  const head = v6groups(addr.slice(0, dbl), false);
  const tail = v6groups(addr.slice(dbl + 2), true);
  return head !== null && tail !== null && head + tail <= 7;
}

const TOKEN = '[A-Za-z0-9!#$&^_.+-]';
export const MIME_RE = new RegExp(`^[A-Za-z0-9]${TOKEN}{0,126}/[A-Za-z0-9]${TOKEN}{0,126}$`);
export interface MimeTypeOptions {
  /** Accept `; charset=utf-8` style parameters. Default `false`. */
  allowParameters?: boolean;
  /** Accept wildcards such as `image/<star>` and `<star>/<star>`, as in an Accept header. Default `false`. */
  allowWildcard?: boolean;
}

const PARAM = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+=(?:[A-Za-z0-9!#$%&'*+.^_`|~-]+|"(?:[^"\\\r\n]|\\.)*")$/;

export function splitMediaType(s: string): { type: string; params: string[] } {
  const parts = s.split(';');
  return { type: parts[0]!.trim(), params: parts.slice(1).map((p) => p.trim()) };
}

export function mediaTypeOk(s: string, o: MimeTypeOptions): boolean {
  const { type, params } = splitMediaType(s);
  if (params.length > 0 && !o.allowParameters) return false;
  const typeOk =
    MIME_RE.test(type) ||
    (o.allowWildcard === true &&
      (type === '*/*' || /^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}\/\*$/.test(type)));
  return typeOk && params.every((p) => PARAM.test(p));
}

// ---- dates
export function leap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function dim(y: number, m: number): number {
  return m === 2 ? (leap(y) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export function calendarOk(y: number, m: number, d: number): boolean {
  return m >= 1 && m <= 12 && d >= 1 && d <= dim(y, m);
}

const formatCache = new Map<string, { re: RegExp; order: string[] } | null>();

function compileFormat(format: string): { re: RegExp; order: string[] } | null {
  const hit = formatCache.get(format);
  if (hit !== undefined) return hit;
  const order: string[] = [];
  let ok = format.length <= 32;
  const src = format
    .split(/(YYYY|YY|MM|DD|M|D)/)
    .map((part) => {
      if (/^(YYYY|YY|MM|DD|M|D)$/.test(part)) {
        order.push(part);
        return {
          YYYY: '(\\d{4})',
          YY: '(\\d{2})',
          MM: '(\\d{2})',
          DD: '(\\d{2})',
          M: '(\\d{1,2})',
          D: '(\\d{1,2})'
        }[part]!;
      }
      if (!/^[\s/.-]*$/.test(part)) ok = false;
      return part.replace(/[.\-/]/g, '\\$&');
    })
    .join('');
  const kinds = order.map((t) => (t[0] === 'Y' ? 'y' : t[0] === 'M' ? 'm' : 'd'));
  const result =
    ok && kinds.length === 3 && new Set(kinds).size === 3
      ? { re: new RegExp(`^${src}$`), order }
      : null;
  formatCache.set(format, result);
  return result;
}

export function parseDate(s: string, format: string): { y: number; m: number; d: number } | null {
  const f = compileFormat(format);
  if (f === null) return null;
  const m = f.re.exec(s);
  if (m === null) return null;
  let y = 0;
  let mo = 0;
  let d = 0;
  f.order.forEach((tok, i) => {
    const v = Number(m[i + 1]);
    if (tok === 'YYYY') y = v;
    else if (tok === 'YY') y = v <= 68 ? 2000 + v : 1900 + v;
    else if (tok[0] === 'M') mo = v;
    else d = v;
  });
  return calendarOk(y, mo, d) ? { y, m: mo, d } : null;
}

// ---- text
export function wellFormed(s: string): boolean {
  const native = (s as unknown as { isWellFormed?: () => boolean }).isWellFormed;
  if (typeof native === 'function') return native.call(s) as boolean;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) i++;
      else return false;
    } else if (c >= 0xdc00 && c <= 0xdfff) return false;
  }
  return true;
}
