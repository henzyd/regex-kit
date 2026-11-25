/** Shared plumbing. Nothing in here is exported from the package entry point. */

export type Brand<T, B extends string> = T & { readonly __brand: B };

/**
 * The input guard every string validator starts with: a non-empty string no longer
 * than `max`, or `null`. Longer input never reaches a pattern.
 */
export function str(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= max ? value : null;
}

/**
 * Guard for numeric-domain validators: a finite number is converted to its string
 * form, a string is passed through, anything else is rejected.
 */
export function numStr(value: unknown, max = 64): string | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && !Object.is(value, -0) ? String(value) : null;
  }
  return str(value, max);
}

/** Options may be missing or the wrong type; always hand back an object. */
export function opts<T extends object>(o: T | undefined | null): T {
  return o !== null && typeof o === 'object' && !Array.isArray(o) ? o : ({} as T);
}

export interface SeparatorOptions {
  /** Require the canonical form with no display separators. */
  strict?: boolean;
}

/** Remove spaces and hyphens, unless `strict`, in which case any separator fails. */
export function stripSeparators(
  s: string,
  strict: boolean | undefined,
  seps = / |-/g
): string | null {
  if (strict) return /[\s-]/.test(s) ? null : s;
  // Display separators sit between groups: never leading, trailing or doubled.
  if (!/^[^\s-]+(?:[ -][^\s-]+)*$/.test(s)) return null;
  return s.replace(seps, '');
}

export const DIGITS = /^\d+$/;

export function sumDigits(n: number): number {
  let t = 0;
  while (n > 0) {
    t += n % 10;
    n = Math.floor(n / 10);
  }
  return t;
}
