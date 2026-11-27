/** Regenerate docs/test-cases.md from test/cases. Run with `npm run docs:cases`. */
import { spawnSync } from 'node:child_process';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npx, ['vitest', 'run', 'test/docs.test.ts'], {
  stdio: 'inherit',
  env: { ...process.env, UPDATE_CASES: '1' },
  shell: process.platform === 'win32'
});
process.exit(result.status ?? 1);
