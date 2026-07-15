import { readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { PROJECT_CATEGORIES } from '../src/content-model/enums.ts';
import { validateProjectWorldRegistry } from '../src/lib/project-worlds/world-validation.ts';
import { buildProjectDetailManifest } from './generate-project-detail-manifest.mjs';
import { buildProjectWorldManifest, outputPath, repositoryRoot } from './generate-project-world-manifest.mjs';
import { walkFiles } from './token-utils.mjs';

const failures = [];
const fail = (code, path, message) => failures.push({ code, path, message });
const exists = (path) => stat(join(repositoryRoot, path)).then(() => true, () => false);
const read = (path) => readFile(join(repositoryRoot, path), 'utf8');

const worldComponents = {
  software: 'src/components/project-worlds/software/SoftwareProjectWorld.astro',
  'visual-system': 'src/components/project-worlds/visual-system/VisualSystemProjectWorld.astro',
  art: 'src/components/project-worlds/art/ArtProjectWorld.astro',
  'technical-system': 'src/components/project-worlds/technical-system/TechnicalSystemProjectWorld.astro',
  'limited-media': 'src/components/project-worlds/limited-media/LimitedMediaProjectWorld.astro',
};

const requiredFiles = [
  'src/components/project-worlds/ProjectWorld.astro',
  'src/components/project-worlds/WorldFrame.astro',
  'src/components/project-worlds/WorldSection.astro',
  ...Object.values(worldComponents),
  'src/lib/project-worlds/world-types.ts',
  'src/lib/project-worlds/world-registry.ts',
  'src/lib/project-worlds/world-validation.ts',
  'src/lib/project-worlds/world-view-model.ts',
  'src/lib/project-worlds/world-section-policy.ts',
  'src/lib/project-worlds/authored-mark-policy.ts',
  'src/lib/project-worlds/media-policy.ts',
  'src/lib/project-worlds/manifest.ts',
  'src/lib/project-worlds/generated/project-world-manifest.json',
  'src/styles/project-worlds.css',
  ...PROJECT_CATEGORIES.map((category) => `src/styles/project-world-${category}.css`),
  'scripts/generate-project-world-manifest.mjs',
  'scripts/test-project-world-registry.mjs',
  'scripts/browser-project-worlds-audit.mjs',
];

for (const path of requiredFiles) if (!(await exists(path))) fail('PROJECT_WORLD_REQUIRED_FILE', path, 'Required project-world file is missing.');
for (const error of validateProjectWorldRegistry()) fail(error.code, 'src/lib/project-worlds', error.message);

if (await exists('src/components/project-worlds/WorldSection.astro')) {
  const source = await read('src/components/project-worlds/WorldSection.astro');
  for (const invariant of ['ProjectOrientation', 'ProjectHeader', 'ProjectLimitations', 'ProjectProvenance', 'ProjectContextNavigation']) {
    if (!source.includes(invariant)) fail('PROJECT_WORLD_INVARIANT_MISSING', 'src/components/project-worlds/WorldSection.astro', `${invariant} is not centrally composed.`);
  }
  if (!source.includes('project.limitations.length') || !source.includes('project.publicEvidence.length')) {
    fail('PROJECT_WORLD_EMPTY_SECTION', 'src/components/project-worlds/WorldSection.astro', 'Optional-section guards are incomplete.');
  }
}

const expectedOrders = (await import('../src/lib/project-worlds/world-section-policy.ts')).PROJECT_WORLD_SECTION_POLICIES;
for (const [category, path] of Object.entries(worldComponents)) {
  if (!(await exists(path))) continue;
  const source = await read(path);
  const order = [...source.matchAll(/section="([a-z-]+)"/g)].map((match) => match[1]);
  if (JSON.stringify(order) !== JSON.stringify(expectedOrders[category].order)) {
    fail('PROJECT_WORLD_SECTION_POLICY_DRIFT', path, `${category} composition diverges from its typed policy.`);
  }
}

const productionRoots = ['src/components/project-worlds', 'src/lib/project-worlds', 'src/styles/project-worlds.css', ...PROJECT_CATEGORIES.map((category) => `src/styles/project-world-${category}.css`)];
const productionFiles = [];
for (const root of productionRoots) {
  const absolute = join(repositoryRoot, root);
  productionFiles.push(...(root.endsWith('.css') ? [absolute] : await walkFiles(absolute)));
}

for (const absolute of productionFiles) {
  const path = relative(repositoryRoot, absolute);
  const source = await readFile(absolute, 'utf8');
  if (/content\/fixtures|fixture(?:Projects|ProjectData|ProjectRelations|-contract)|synthetic-project/i.test(source)) {
    fail('PROJECT_WORLD_FIXTURE_IMPORT', path, 'Production world code imports fixture content.');
  }
  if (/\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket|getLiveCollection|getLiveEntry/.test(source)) {
    fail('PROJECT_WORLD_RUNTIME_CONTENT', path, 'Project worlds perform a runtime content request.');
  }
  if (/Radium|@astrojs\/mdx|react|vue|svelte|solid-js/i.test(source)) {
    fail('PROJECT_WORLD_PROHIBITED_RUNTIME', path, 'A prohibited package or renderer is referenced.');
  }
  if (/reviewedBy|sourceNote|rightsNote|redactionNote|filePath/.test(source)) {
    fail('PROJECT_WORLD_PRIVATE_FIELD', path, 'Project-world production code references a private companion field.');
  }
  if (path.endsWith('.css') && /var\(--azw-p-|var\(--azw-functional-|#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|lab|lch)a?\(/i.test(source)) {
    fail('PROJECT_WORLD_RAW_VALUE', path, 'World CSS contains a primitive token or raw color.');
  }
  if (path.endsWith('.css') && /::before|::after/.test(source)) {
    fail('PROJECT_WORLD_AUTHORED_MARK_UNSAFE', path, 'World CSS invents pseudo-element decoration.');
  }
}

if (await exists('src/styles/project-worlds.css')) {
  const source = await read('src/styles/project-worlds.css');
  for (const fallback of ['prefers-reduced-motion', 'forced-colors', '@media print']) {
    if (!source.includes(fallback)) fail('PROJECT_WORLD_FALLBACK_MISSING', 'src/styles/project-worlds.css', `${fallback} fallback is missing.`);
  }
}

const expectedWorlds = buildProjectWorldManifest();
if (await exists(relative(repositoryRoot, outputPath))) {
  const actual = await readFile(outputPath, 'utf8');
  if (actual !== expectedWorlds.bytes) fail('PROJECT_WORLD_MANIFEST_DRIFT', relative(repositoryRoot, outputPath), 'Generated world manifest is stale.');
}

const detail = await buildProjectDetailManifest();
if (detail.manifest.routeCount !== 0 && detail.manifest.routeCount !== detail.manifest.routes.length) {
  fail('PROJECT_WORLD_ROUTE_COUNT_DRIFT', 'src/lib/project-detail/generated/project-detail-route-manifest.json', 'Detail route count is not truthful.');
}

for (const path of ['src/pages/project-worlds-audit', 'public/project-worlds-audit', 'dist/project-worlds-audit']) {
  if (await exists(path)) fail('PROJECT_WORLD_FIXTURE_IMPORT', path, 'Temporary project-world harness remains.');
}

if (failures.length) {
  for (const failure of failures) console.error(`${failure.code} ${failure.path}: ${failure.message}`);
  console.error(`Project world validation failed: ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Project world validation passed: ${expectedWorlds.manifest.worldCount} worlds; ${detail.manifest.routeCount} production routes.`);
}
