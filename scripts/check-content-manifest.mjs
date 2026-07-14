import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildContentArtifacts } from './generate-content-manifest.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const expected = {
  'src/content-model/generated/content-model-manifest.json': 'manifestBytes',
  'tests/fixtures/content-expected/valid-summary.json': 'validSummaryBytes',
  'tests/fixtures/content-expected/invalid-summary.json': 'invalidSummaryBytes',
};

const artifacts = await buildContentArtifacts();
const stale = [];

for (const [path, key] of Object.entries(expected)) {
  let committed;
  try {
    committed = await readFile(join(ROOT, path), 'utf8');
  } catch {
    stale.push(path);
    continue;
  }
  if (committed !== artifacts[key]) stale.push(path);
}

if (stale.length > 0) {
  console.error(`Generated content artifacts are stale:\n${stale.map((path) => `- ${path}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Generated content artifact check passed: manifest and summaries are current.');
}
