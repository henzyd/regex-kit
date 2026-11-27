import { opts, str } from './internal/core.js';
import { wellFormed } from './internal/shared.js';

export interface BooleanStringOptions {
  /** The accepted tokens. Default: true, false, 1, 0, on, off, yes, no. */
  values?: string[];
}

const BOOL_TOKENS = ['true', 'false', '1', '0', 'on', 'off', 'yes', 'no'];

/** What query strings and form posts carry for a boolean. Case-insensitive. */
export function isBooleanString(value: unknown, options?: BooleanStringOptions): boolean {
  const s = str(value, 16);
  if (s === null) return false;
  const allowed = (opts(options).values ?? BOOL_TOKENS).map((v) => v.toLowerCase());
  return allowed.includes(s.toLowerCase());
}

export interface HasLengthOptions {
  min?: number;
  max?: number;
  /** `codepoints` (default), `utf16` (JavaScript `.length`), `graphemes` or `bytes` (UTF-8). */
  unit?: 'utf16' | 'codepoints' | 'graphemes' | 'bytes';
}

function lengthOf(s: string, unit: NonNullable<HasLengthOptions['unit']>): number {
  switch (unit) {
    case 'utf16':
      return s.length;
    case 'bytes':
      return new TextEncoder().encode(s).length;
    case 'graphemes': {
      const Seg = (
        Intl as unknown as {
          Segmenter?: new (l?: string, o?: object) => { segment(s: string): Iterable<unknown> };
        }
      ).Segmenter;
      if (Seg === undefined) return lengthOf(s, 'codepoints');
      let n = 0;
      for (const _ of new Seg(undefined, { granularity: 'grapheme' }).segment(s)) n++;
      return n;
    }
    default: {
      let n = 0;
      for (const _ of s) n++;
      return n;
    }
  }
}

/**
 * `true` when the length is **within range**. Unlike the other validators it accepts an
 * empty string, because zero can be in range. Graphemes need `Intl.Segmenter`; without it
 * the count falls back to code points.
 */
export function hasLength(value: unknown, options?: HasLengthOptions): boolean {
  if (typeof value !== 'string' || value.length > 1_000_000) return false;
  const o = opts(options);
  const n = lengthOf(value, o.unit ?? 'codepoints');
  return n >= (o.min ?? 0) && n <= (o.max ?? Infinity);
}

export interface DelimitedListOptions {
  separator?: string;
  /** A validator for each item. */
  item?: (value: string) => boolean;
  min?: number;
  max?: number;
  /** Accept empty items such as `a,,b`. Default `false`. */
  allowEmpty?: boolean;
  /** Reject repeated items. Default `false`. */
  unique?: boolean;
  /** Trim whitespace around each item before checking it. Default `false`. */
  trim?: boolean;
}

export function isDelimitedList(value: unknown, options?: DelimitedListOptions): boolean {
  const s = str(value, 100_000);
  if (s === null) return false;
  const o = opts(options);
  const raw = s.split(o.separator ?? ',');
  const items = o.trim ? raw.map((x) => x.trim()) : raw;
  if (items.length < (o.min ?? 1) || items.length > (o.max ?? 1000)) return false;
  if (!o.allowEmpty && items.some((x) => x === '')) return false;
  if (o.unique && new Set(items).size !== items.length) return false;
  const check = o.item;
  return check === undefined || items.every((x) => check(x));
}

export function isSingleLine(value: unknown): boolean {
  const s = str(value, 100_000);
  return s !== null && !/[\r\n\v\f\u0085\u2028\u2029]/.test(s);
}

/** Text with no control characters other than tab and line breaks, and no lone surrogates. */
export function isPlainText(value: unknown): boolean {
  const s = str(value, 1_000_000);
  return s !== null && !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(s) && wellFormed(s);
}

export function isTitle(value: unknown, options?: { maxLength?: number }): boolean {
  const s = str(value, 10_000);
  if (s === null || [...s].length > (opts(options).maxLength ?? 120)) return false;
  return s.trim().length > 0 && isSingleLine(s) && !/[\p{Cc}]/u.test(s);
}
