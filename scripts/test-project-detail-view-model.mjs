import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, [
  '--test',
  'tests/project-detail/contracts.test.mjs',
  'tests/project-detail/view-model.test.mjs',
], { stdio: 'inherit' });

if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status ?? 1;
