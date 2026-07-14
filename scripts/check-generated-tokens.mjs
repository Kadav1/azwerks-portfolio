import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { repositoryRoot } from './token-utils.mjs';

const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts/generate-tokens.mjs'), '--check'], {
  cwd: repositoryRoot,
  stdio: 'inherit',
});

if (result.status !== 0) process.exitCode = result.status ?? 1;
