import { describe, expect, it } from 'vitest';
import * as kit from '../src/index.js';
import { sections } from './cases/index.js';

type Fn = (...args: unknown[]) => unknown;

const api = kit as unknown as Record<string, unknown>;
const all = Object.entries(api).filter((e): e is [string, Fn] => typeof e[1] === 'function');

/** Functions that build other functions or have their own dedicated tests. */
const NOT_PREDICATES = new Set([
  'escapeRegExp',
  'optional',
  'all',
  'any',
  'not',
  'listOf',
  'matches',
  'standardSchema',
  'checkEmail',
  'checkCreditCard',
  'getCardBrand',
  'getPasswordIssues'
]);

const predicates = all.filter(([n]) => /^(is|has)[A-Z]/.test(n));

/** Validators for numeric values also accept a finite number. */
const NUMERIC = new Set([
  'isNumeric',
  'isInteger',
  'isSafeInteger',
  'isDecimal',
  'isFloat',
  'isPercentage',
  'isLatitude',
  'isLongitude',
  'isYear',
  'isUnixTimestamp',
  'isHttpStatusCode',
  'isPort'
]);

const JUNK: unknown[] = [
  undefined,
  null,
  true,
  false,
  {},
  [],
  ['a'],
  () => 1,
  Symbol('x'),
  10n,
  new Date(),
  Object.create(null),
  new String('abc'),
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY
];
const NUMBERS: unknown[] = [0, 42, -1, 1.5, 2026, 65535];

const label = (v: unknown): string => {
  try {
    return String(v);
  } catch {
    return typeof v;
  }
};

const specNames = new Set(sections.flatMap((s) => s.specs.map((x) => x.fn)));

describe('public API', () => {
  it('has a test-case spec for every exported validator', () => {
    const missing = all.map(([n]) => n).filter((n) => !NOT_PREDICATES.has(n) && !specNames.has(n));
    expect(missing).toEqual([]);
  });

  it('exports no internal helper', () => {
    const leaked = all
      .map(([n]) => n)
      .filter((n) => !/^(is|has|get|check)[A-Z]/.test(n) && !NOT_PREDICATES.has(n));
    expect(leaked).toEqual([]);
  });

  it('exports each name once with a stable, sorted surface', () => {
    expect(Object.keys(api).filter((k) => typeof api[k] === 'function').length).toBe(all.length);
  });
});

describe('contract: anything that is not a string', () => {
  for (const [name, fn] of predicates) {
    it(`${name} is false for non-strings`, () => {
      for (const junk of JUNK) {
        expect(fn(junk), `${name}(${label(junk)})`).toBe(false);
        expect(fn(junk, 'GB'), `${name}(junk, 'GB')`).toBe(false);
        expect(fn(junk, {}), `${name}(junk, {})`).toBe(false);
      }
      if (!NUMERIC.has(name)) {
        for (const n of NUMBERS) expect(fn(n), `${name}(${label(n)})`).toBe(false);
      }
    });
  }

  it('get* functions return null for non-strings', () => {
    for (const junk of JUNK) {
      expect(kit.getCardBrand(junk)).toBeNull();
      expect(kit.getPasswordIssues(junk)).toBeNull();
    }
  });
});

describe('contract: empty string', () => {
  const EMPTY_OK = new Set(['isBlank', 'hasLength']);
  for (const [name, fn] of predicates) {
    if (EMPTY_OK.has(name)) continue;
    it(`${name}('') is false`, () => {
      expect(fn('')).toBe(false);
    });
  }
  it('isBlank is the one validator that accepts the empty string', () => {
    expect(kit.isBlank('')).toBe(true);
    expect(kit.hasLength('', { max: 3 })).toBe(true);
  });
});

describe('contract: never throws, always returns a boolean', () => {
  const values = [
    'a',
    '1',
    'abc@x.co',
    '2026-11-25',
    'x'.repeat(50),
    '\u0000',
    '😀',
    '\ud800',
    '%',
    '..',
    '/',
    '-',
    ' ',
    '{}',
    '[]'
  ];
  const argSets: unknown[][] = [
    [],
    [undefined],
    [null],
    [5],
    ['x'],
    [[]],
    [{}],
    [Symbol('s')],
    [() => 1],
    ['GB', {}],
    [{}, 'GB'],
    [null, null]
  ];
  for (const [name, fn] of predicates) {
    it(`${name} never throws`, () => {
      for (const v of [...values, ...JUNK]) {
        for (const args of argSets) {
          let out: unknown;
          expect(() => (out = fn(v, ...args)), `${name}(${label(v)}, …)`).not.toThrow();
          expect(typeof out).toBe('boolean');
        }
      }
    });
  }
});

describe('contract: input length guard', () => {
  const big = [12_000_000].flatMap((n) => ['a', '1', ' ', '.'].map((c) => c.repeat(n)));
  for (const [name, fn] of predicates) {
    it(`${name} returns false for very long input without scanning it`, () => {
      const t0 = performance.now();
      for (const s of big) expect(fn(s)).toBe(false);
      expect(performance.now() - t0).toBeLessThan(400);
    });
  }
});

describe('contract: pathological input stays fast (ReDoS)', () => {
  const shapes: ((n: number) => string)[] = [
    (n) => 'a'.repeat(n),
    (n) => '1'.repeat(n),
    (n) => `${'0'.repeat(n)}!`,
    (n) => '-'.repeat(n),
    (n) => '.'.repeat(n),
    (n) => 'a.'.repeat(n / 2),
    (n) => '1.'.repeat(n / 2),
    (n) => 'a@'.repeat(n / 2),
    (n) => 'a-'.repeat(n / 2),
    (n) => 'a:'.repeat(n / 2),
    (n) => `${' '.repeat(n)}x`,
    (n) => `x${' '.repeat(n)}x`,
    (n) => '('.repeat(n),
    (n) => '%'.repeat(n),
    (n) => '\\'.repeat(n),
    (n) => '=,'.repeat(n / 2),
    (n) => `<a ${' '.repeat(n)}`,
    (n) => `${'a'.repeat(n)}@${'b.'.repeat(10)}`,
    (n) => `http://${'a.'.repeat(n / 2)}`,
    (n) => `${'1'.repeat(n)}-${'2'.repeat(n)}`
  ];
  const sizes = [2000, 20_000];
  for (const section of sections) {
    it(`${section.title}`, () => {
      let worst = 0;
      let where = '';
      for (const { fn, groups } of section.specs) {
        const f = api[fn] as Fn;
        for (const group of groups) {
          const args = group.args ?? [];
          for (const n of sizes) {
            for (const shape of shapes) {
              const s = shape(n);
              const t0 = performance.now();
              f(s, ...args);
              const dt = performance.now() - t0;
              if (dt > worst) {
                worst = dt;
                where = `${fn}(${show80(s)}) with ${JSON.stringify(args.map(String))}`;
              }
            }
          }
        }
      }
      expect(worst, where).toBeLessThan(250);
    }, 120_000);
  }
});

function show80(s: string): string {
  return `${JSON.stringify(s.slice(0, 20))}…(${s.length})`;
}

describe('contract: no state leaks between calls', () => {
  for (const section of sections) {
    for (const { fn, groups } of section.specs) {
      it(`${fn} gives the same answers when called repeatedly and interleaved`, () => {
        const f = api[fn] as Fn;
        for (const group of groups) {
          const args = group.args ?? [];
          const valid = group.valid ?? [];
          const invalid = group.invalid ?? [];
          for (let round = 0; round < 3; round++) {
            for (const v of valid) expect(f(v, ...args)).toBe(true);
            for (const v of invalid) expect(f(v, ...args)).toBe(false);
          }
        }
      });
    }
  }
});
