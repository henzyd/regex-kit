import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as kit from '../src/index.js';
import { renderCases } from './cases-doc.js';

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

describe('docs/test-cases.md', () => {
  it('is generated from test/cases and up to date', () => {
    const rendered = renderCases();
    if (process.env.UPDATE_CASES) {
      writeFileSync(root('docs/test-cases.md'), rendered);
      return;
    }
    expect(
      readFileSync(root('docs/test-cases.md'), 'utf8'),
      'Run `npm run docs:cases` to regenerate it.'
    ).toBe(rendered);
  });
});

describe('docs/validators.md', () => {
  const md = readFileSync(root('docs/validators.md'), 'utf8');
  const fnLike = /^(?:is|has|get|check)[A-Z][A-Za-z0-9]*$/;
  const placeholders = new Set(['isX', 'hasX', 'getX', 'checkX']);
  // Names the catalogue mentions only to say they were renamed.
  const renamedAway = new Set([
    'isStrongPassword',
    'isCardBrand',
    'hasPasswordIssues',
    'isEthereumAddress'
  ]);

  const documented = new Set(
    [...md.matchAll(/`([A-Za-z0-9]+)`/g)]
      .map((m) => m[1]!)
      .filter((n) => fnLike.test(n) && !placeholders.has(n) && !renamedAway.has(n))
  );
  const exported = Object.keys(kit).filter(
    (n) => typeof (kit as Record<string, unknown>)[n] === 'function' && fnLike.test(n)
  );

  it('every function it names is exported', () => {
    expect([...documented].filter((n) => !exported.includes(n)).sort()).toEqual([]);
  });

  it('every exported validator is named in it', () => {
    expect(exported.filter((n) => !documented.has(n)).sort()).toEqual([]);
  });
});
