/**
 * Test cases are data. Each validator has a `Spec`: groups of inputs that must pass and
 * inputs that must fail, optionally under a set of extra arguments (options, a country
 * code). The same data drives the test run and the generated `docs/test-cases.md`, so
 * the document can never describe cases the tests do not run.
 */
export interface Group {
  /** Arguments after the value, e.g. `[{ strict: true }]` or `['GB']`. */
  args?: unknown[];
  /** Inputs for which a boolean validator must return `true`. */
  valid?: unknown[];
  /** Inputs for which a boolean validator must return `false`. */
  invalid?: unknown[];
  /** For validators that return a value: `[input, expected]` pairs. */
  results?: [unknown, unknown][];
  /** What this group is about, shown in the generated document. */
  note?: string;
}

export interface Spec {
  fn: string;
  groups: Group[];
}

export function spec(fn: string, ...groups: Group[]): Spec {
  return { fn, groups };
}

/** Shorthand for the common no-options group. */
export function g(valid: unknown[], invalid: unknown[] = [], note?: string): Group {
  return { valid, invalid, note };
}

/** Shorthand for a group with extra arguments. */
export function w(
  args: unknown[],
  valid: unknown[],
  invalid: unknown[] = [],
  note?: string
): Group {
  return { args, valid, invalid, note };
}
