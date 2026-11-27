import { opts, str } from './internal/core.js';

export type Check<A extends unknown[] = []> = (value: unknown, ...args: A) => boolean;

/** Accept `undefined`, `null` and `''`; otherwise run the check. */
export function optional<A extends unknown[]>(check: Check<A>): Check<A> {
  return (value, ...args) =>
    value === undefined || value === null || value === '' || check(value, ...args);
}

export function all(...checks: Check[]): Check {
  return (value) => checks.every((c) => c(value));
}

export function any(...checks: Check[]): Check {
  return (value) => checks.some((c) => c(value));
}

export function not<A extends unknown[]>(check: Check<A>): Check<A> {
  return (value, ...args) => !check(value, ...args);
}

export interface ListOfOptions {
  min?: number;
  max?: number;
}

/** Every element of an array passes `check`. For comma-separated strings use `isDelimitedList`. */
export function listOf(check: Check, options?: ListOfOptions): Check {
  const o = opts(options);
  return (value) =>
    Array.isArray(value) &&
    value.length >= (o.min ?? 0) &&
    value.length <= (o.max ?? 10_000) &&
    value.every((v) => check(v));
}

/** `isOneOf(value, ['asc', 'desc'])`. Strings and numbers; compared with `===`. */
export function isOneOf(value: unknown, allowed?: unknown): boolean {
  if (!Array.isArray(allowed) || (typeof value !== 'string' && typeof value !== 'number'))
    return false;
  return allowed.includes(value);
}

export interface MatchesOptions {
  /** Longest input tested. Default 2048. */
  maxLength?: number;
}

/** Wrap your own `RegExp` with the same guards as the built-in validators. Flags `g` and `y` are ignored. */
export function matches(pattern: RegExp, options?: MatchesOptions): Check {
  const re = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''));
  const max = opts(options).maxLength ?? 2048;
  return (value) => {
    const s = str(value, max);
    return s !== null && re.test(s);
  };
}

/** The slice of the Standard Schema v1 interface this package implements. No dependency needed. */
export interface StandardSchemaV1<T = unknown> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown
    ) => { readonly value: T } | { readonly issues: ReadonlyArray<{ readonly message: string }> };
  };
}

/** Make a check usable anywhere a Standard Schema is accepted. */
export function standardSchema<T = string>(
  check: Check,
  message = 'Invalid value'
): StandardSchemaV1<T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'regex-kit',
      validate: (value) => (check(value) ? { value: value as T } : { issues: [{ message }] })
    }
  };
}
