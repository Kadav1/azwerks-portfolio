import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { buildProjectDetailManifest, repositoryRoot } from './generate-project-detail-manifest.mjs';

const path = join(repositoryRoot, 'src/lib/project-detail/generated/project-detail-route-manifest.json');
const expected = await buildProjectDetailManifest();
const actual = await readFile(path, 'utf8').catch(() => '');

if (actual !== expected.bytes) {
  console.error('PROJECT_DETAIL_MANIFEST_DRIFT src/lib/project-detail/generated/project-detail-route-manifest.json: Run npm run detail:generate.');
  process.exitCode = 1;
} else {
  console.log(`Project detail manifest check passed: ${expected.manifest.routeCount} routes; ${expected.manifest.generatedHash}.`);
}
