import type { Group } from './cases/types.js';
import { sections } from './cases/index.js';
import { show } from './format.js';

const code = (s: string): string => (s.includes('`') ? `\`\` ${s} \`\`` : `\`${s}\``);
const list = (items: unknown[]): string => items.map((v) => code(show(v))).join(' · ');

function renderGroup(g: Group): string {
  const lines: string[] = [];
  const title =
    g.args && g.args.length
      ? `Arguments: ${code(g.args.map(show).join(', '))}`
      : 'No extra arguments';
  lines.push(`- **${title}**${g.note ? ` — ${g.note}` : ''}`);
  if (g.valid?.length) lines.push(`  - ✅ accepts: ${list(g.valid)}`);
  if (g.invalid?.length) lines.push(`  - ❌ rejects: ${list(g.invalid)}`);
  for (const [input, expected] of g.results ?? []) {
    lines.push(`  - ${code(show(input))} → ${code(show(expected))}`);
  }
  return lines.join('\n');
}

function counts(): { validators: number; groups: number; cases: number } {
  let validators = 0;
  let groups = 0;
  let cases = 0;
  for (const s of sections) {
    for (const spec of s.specs) {
      validators++;
      for (const g of spec.groups) {
        groups++;
        cases += (g.valid?.length ?? 0) + (g.invalid?.length ?? 0) + (g.results?.length ?? 0);
      }
    }
  }
  return { validators, groups, cases };
}

/** The whole of docs/test-cases.md. Generated; never edit the output by hand. */
export function renderCases(): string {
  const c = counts();
  const out: string[] = [];
  out.push(`# Test cases

> **Generated file.** It is rendered from the data in \`test/cases/\` by
> \`npm run docs:cases\`, and a test fails if it is out of date. Edit the data, not this page.

This document lists what \`@henzyd/regex-kit\` is tested against: **${c.validators} validators,
${c.cases.toLocaleString('en-US')} concrete cases in ${c.groups} groups**, plus the checks that apply to every
validator at once.

## What is tested

| # | Aspect | How | Where |
| - | ------ | --- | ----- |
| 1 | **Accepts and rejects the right values** | Every validator has valid and invalid inputs, and one group per option or locale, including boundaries (shortest, longest, off-by-one). | The tables below · \`test/cases.test.ts\` |
| 2 | **Options and locales** | Each option is exercised on and off, and a country argument is tried with an unsupported code, a lowercase code and none at all. | The tables below |
| 3 | **Checksums and algorithms** | Official or widely published vectors where they exist; a single changed digit must fail. Hashes are checked against \`node:crypto\` and published Keccak vectors. | The tables below · \`test/hash.test.ts\` |
| 4 | **Contract for every validator** | Non-strings give \`false\` (or \`null\` for \`get*\`); the empty string gives \`false\`; hostile arguments never throw and always return a boolean. | \`test/contract.test.ts\` |
| 5 | **Safe on untrusted input** | A 12-million-character string is rejected by the length guard in well under a second; twenty pathological shapes at 2,000 and 20,000 characters, against every option set, finish in under 250 ms each (ReDoS). | \`test/contract.test.ts\` |
| 6 | **Deterministic, no hidden state** | Valid and invalid inputs are interleaved three times; answers never change (no leaked \`lastIndex\`, no caches that alter results). | \`test/contract.test.ts\` |
| 7 | **Reference data** | Country, currency, language and script tables are cross-checked against the ICU data in the runtime; counts and shapes of calling codes, IBAN lengths, postal and mobile tables are asserted. | \`test/data.test.ts\` |
| 8 | **Helpers and result objects** | \`optional\`, \`all\`, \`any\`, \`not\`, \`listOf\`, \`matches\`, \`standardSchema\`, \`checkEmail\`, \`checkCreditCard\`. | \`test/helpers.test.ts\` |
| 9 | **The documentation is true** | Every example in \`docs/using-validators.md\` runs as written; every function named in \`docs/validators.md\` is exported and every export is documented. | \`test/guide.test.ts\` · \`test/docs.test.ts\` |
| 10 | **The published package works** | Build, \`publint\`, Are the Types Wrong, and an install smoke test that loads the packed tarball through \`import\` and \`require\` on Node 20.19, 22 and 24. | \`npm run check\` · CI |

## Reading the tables

- ✅ means the validator returns \`true\`; ❌ means \`false\`.
- Arguments are what follows the value: an options object, a country code, or both.
- For \`has*\` functions, ✅ means the problem **was found** (the name reads backwards from \`is*\`).
- \`get*\` functions list \`input → result\` instead.
- Numbers, \`NaN\`, \`undefined\` and other non-strings appear as written. Invisible characters are shown as escapes.
- Algorithms were checked against independent implementations; where a standard could not be verified from a primary source, the catalogue says so under *Facts to confirm*.

## Running the tests

\`\`\`bash
npm test              # everything
npm run docs:cases    # regenerate this file after changing test/cases/
\`\`\`
`);

  out.push('## Coverage by section\n');
  out.push('| Section | Validators | Cases |\n| ------- | ---------- | ----- |');
  for (const s of sections) {
    let n = 0;
    for (const spec of s.specs)
      for (const g of spec.groups)
        n += (g.valid?.length ?? 0) + (g.invalid?.length ?? 0) + (g.results?.length ?? 0);
    out.push(`| [${s.title}](#${s.anchor}) | ${s.specs.length} | ${n.toLocaleString('en-US')} |`);
  }
  out.push('');

  for (const s of sections) {
    out.push(`## ${s.title}\n`);
    for (const spec of s.specs) {
      out.push(`### \`${spec.fn}\`\n`);
      out.push(spec.groups.map(renderGroup).join('\n'));
      out.push('');
    }
  }
  return `${out.join('\n').trimEnd()}\n`;
}
