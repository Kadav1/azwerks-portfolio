import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, [
  '--test',
  'tests/project-worlds/registry.test.mjs',
  'tests/project-worlds/composition.test.mjs',
], { stdio: 'inherit' });

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
