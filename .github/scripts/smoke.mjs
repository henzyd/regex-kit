/**
 * Install the packed tarball into a throwaway project and load it the way a consumer
 * would, once through `import` and once through `require`.
 *
 * A package can build and pass every unit test and still be broken for the people who
 * install it: a missing file in `files`, an `exports` entry pointing at a path the
 * build never wrote, a CommonJS entry that is really ESM. Unit tests import from
 * `src/`, so none of those show up there.
 *
 * Usage:
 *   node .github/scripts/smoke.mjs                 packs the current checkout first
 *   node .github/scripts/smoke.mjs path/to.tgz     uses an existing tarball
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const shell = process.platform === 'win32';

const work = mkdtempSync(path.join(tmpdir(), 'regex-kit-smoke-'));
const failures = [];

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', shell });
}

try {
  let tarball = process.argv[2] ? path.resolve(process.argv[2]) : undefined;

  if (!tarball) {
    const packed = run(
      npm,
      ['pack', '--pack-destination', work, '--json', '--ignore-scripts'],
      root
    );
    tarball = path.join(work, JSON.parse(packed)[0].filename);
  }

  const consumer = path.join(work, 'consumer');
  run('node', ['-e', `require('fs').mkdirSync(${JSON.stringify(consumer)})`], work);
  writeFileSync(
    path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true })
  );
  run(npm, ['install', '--no-audit', '--no-fund', '--ignore-scripts', tarball], consumer);

  const esm = run(
    'node',
    [
      '--input-type=module',
      '-e',
      `import * as m from '${pkg.name}'; console.log(Object.keys(m).sort().join(','));`
    ],
    consumer
  ).trim();

  const cjs = run(
    'node',
    ['-e', `console.log(Object.keys(require('${pkg.name}')).sort().join(','));`],
    consumer
  ).trim();

  console.log(`esm exports: ${esm}`);
  console.log(`cjs exports: ${cjs}`);

  if (esm.length === 0) failures.push('the ESM entry exports nothing');
  if (esm !== cjs) failures.push(`ESM and CJS entries disagree: [${esm}] vs [${cjs}]`);
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error('\nsmoke test failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\nsmoke test passed');
