import { describe, expect, it } from 'vitest';
import * as kit from '../src/index.js';
import { sections } from './cases/index.js';
import { show } from './format.js';

type Fn = (...args: unknown[]) => unknown;
const api = kit as unknown as Record<string, Fn>;

for (const section of sections) {
  describe(section.title, () => {
    for (const { fn, groups } of section.specs) {
      describe(fn, () => {
        const f = api[fn];
        it('is exported', () => {
          expect(typeof f).toBe('function');
        });
        if (typeof f !== 'function') return;
        for (const group of groups) {
          const args = group.args ?? [];
          const suffix = args.length ? ` with ${show(args)}` : '';
          for (const input of group.valid ?? []) {
            it(`accepts ${show(input)}${suffix}`, () => {
              expect(f(input, ...args)).toBe(true);
            });
          }
          for (const input of group.invalid ?? []) {
            it(`rejects ${show(input)}${suffix}`, () => {
              expect(f(input, ...args)).toBe(false);
            });
          }
          for (const [input, expected] of group.results ?? []) {
            it(`${show(input)}${suffix} gives ${show(expected)}`, () => {
              expect(f(input, ...args)).toEqual(expected);
            });
          }
        }
      });
    }
  });
}
