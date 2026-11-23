import { describe, expect, it } from 'vitest';
import { escapeRegExp } from '../src/index.js';

describe('escapeRegExp', () => {
  it('leaves plain text alone', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
  });

  it('produces a pattern that matches the input literally', () => {
    const input = 'a.b*c+d?(e)[f]{g}|h^i$j\\k/l-m';
    expect(new RegExp(`^${escapeRegExp(input)}$`).test(input)).toBe(true);
  });

  it('does not let metacharacters match anything else', () => {
    expect(new RegExp(escapeRegExp('a.c')).test('abc')).toBe(false);
  });
});
