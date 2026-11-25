import { opts, str } from './internal/core.js';
import { CSS_NAMED_COLORS } from './data/colours.js';

export interface HexColorOptions {
  /** Accept `#fff`. Default `true`. */
  allowShort?: boolean;
  /** Accept an alpha channel, `#ffffff80` and `#fff8`. Default `false`. */
  allowAlpha?: boolean;
  /** The `#` must be present. Default `true`. */
  requireHash?: boolean;
}

export function isHexColor(value: unknown, options?: HexColorOptions): boolean {
  const s = str(value, 9);
  if (s === null) return false;
  const o = opts(options);
  const hash = s.startsWith('#');
  if (!hash && (o.requireHash ?? true)) return false;
  const digits = hash ? s.slice(1) : s;
  if (!/^[0-9A-Fa-f]+$/.test(digits)) return false;
  const lengths = [6];
  if (o.allowShort ?? true) lengths.push(3);
  if (o.allowAlpha) lengths.push(8, ...((o.allowShort ?? true) ? [4] : []));
  return lengths.includes(digits.length);
}

const NUM = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)';

function channel(tok: string, percentOk: boolean, max: number): boolean {
  if (tok === 'none') return true;
  const m = new RegExp(`^(${NUM})(%?)$`).exec(tok);
  if (m === null) return false;
  const n = Number(m[1]);
  if (m[2] === '%') return percentOk && n >= 0 && n <= 100;
  return n >= 0 && n <= max;
}

function alphaOk(tok: string): boolean {
  const m = new RegExp(`^(${NUM})(%?)$`).exec(tok);
  if (m === null) return tok === 'none';
  const n = Number(m[1]);
  return m[2] === '%' ? n >= 0 && n <= 100 : n >= 0 && n <= 1;
}

/** Split the inside of a color function into its channels and optional alpha. */
function args(inner: string): { legacy: boolean; channels: string[]; alpha?: string } | null {
  const body = inner.trim();
  if (body.includes(',')) {
    const parts = body.split(',').map((p) => p.trim());
    if (parts.length !== 3 && parts.length !== 4) return null;
    return { legacy: true, channels: parts.slice(0, 3), alpha: parts[3] };
  }
  const [main, alpha, ...extra] = body.split('/').map((p) => p.trim());
  if (extra.length > 0 || main === undefined) return null;
  const channels = main.split(/\s+/);
  if (channels.length !== 3 || (body.includes('/') && alpha === undefined)) return null;
  return { legacy: false, channels, alpha };
}

export function isRgbColor(value: unknown): boolean {
  const s = str(value, 80);
  const m = s === null ? null : /^rgba?\(([^()]*)\)$/i.exec(s);
  if (m === null) return false;
  const a = args(m[1]!);
  if (a === null) return false;
  if (a.legacy) {
    const pct = a.channels.map((c) => c.endsWith('%'));
    if (pct.some((p) => p !== pct[0])) return false;
  }
  return (
    a.channels.every((c) => channel(c, true, 255)) && (a.alpha === undefined || alphaOk(a.alpha))
  );
}

function hueOk(tok: string): boolean {
  if (tok === 'none') return true;
  return new RegExp(`^${NUM}(?:deg|grad|rad|turn)?$`).test(tok);
}

export function isHslColor(value: unknown): boolean {
  const s = str(value, 80);
  const m = s === null ? null : /^hsla?\(([^()]*)\)$/i.exec(s);
  if (m === null) return false;
  const a = args(m[1]!);
  if (a === null) return false;
  const [h, sat, light] = a.channels as [string, string, string];
  const pct = (t: string) => t === 'none' || (t.endsWith('%') && channel(t, true, 100));
  if (a.legacy && (!sat.endsWith('%') || !light.endsWith('%'))) return false;
  return hueOk(h) && pct(sat) && pct(light) && (a.alpha === undefined || alphaOk(a.alpha));
}

export function isCssColor(value: unknown): boolean {
  const s = str(value, 80);
  if (s === null) return false;
  const lower = s.toLowerCase();
  if (lower === 'transparent' || lower === 'currentcolor') return true;
  if (CSS_NAMED_COLORS.has(lower)) return true;
  return isHexColor(s, { allowAlpha: true }) || isRgbColor(s) || isHslColor(s);
}
