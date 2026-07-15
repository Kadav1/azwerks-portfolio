import { readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

import { PROJECT_CATEGORIES, RELATION_TYPES } from '../src/content-model/enums.ts';
import { ATLAS_REGIONS } from '../src/lib/work-atlas/atlas-regions.ts';
import { ATLAS_RELATION_LANGUAGE } from '../src/lib/work-atlas/atlas-relations.ts';
import { buildWorkAtlasManifest } from './generate-work-atlas-manifest.mjs';
import { repositoryRoot, walkFiles } from './token-utils.mjs';

const failures = [];
const fail = (code, message, path) => failures.push({ code, message, path });
const exists = async (path) => stat(join(repositoryRoot, path)).then(() => true, () => false);
const read = async (path) => readFile(join(repositoryRoot, path), 'utf8');

const requiredFiles = [
  'src/pages/work/atlas/index.astro',
  'src/components/work-atlas/WorkAtlas.astro',
  'src/components/work-atlas/AtlasHeader.astro',
  'src/components/work-atlas/AtlasViewSwitch.astro',
  'src/components/work-atlas/AtlasControls.astro',
  'src/components/work-atlas/AtlasLegend.astro',
  'src/components/work-atlas/AtlasViewport.astro',
  'src/components/work-atlas/AtlasPlane.astro',
  'src/components/work-atlas/AtlasRegion.astro',
  'src/components/work-atlas/AtlasNode.astro',
  'src/components/work-atlas/AtlasRelations.astro',
  'src/components/work-atlas/AtlasInspector.astro',
  'src/components/work-atlas/AtlasIndex.astro',
  'src/components/work-atlas/AtlasEmptyState.astro',
  'src/components/work-atlas/AtlasHelp.astro',
  'src/lib/work-atlas/atlas-types.ts',
  'src/lib/work-atlas/atlas-view-model.ts',
  'src/lib/work-atlas/atlas-layout.ts',
  'src/lib/work-atlas/atlas-regions.ts',
  'src/lib/work-atlas/atlas-relations.ts',
  'src/lib/work-atlas/atlas-state.ts',
  'src/lib/work-atlas/atlas-url.ts',
  'src/lib/work-atlas/atlas-manifest.ts',
  'src/lib/work-atlas/generated/work-atlas-manifest.json',
  'src/scripts/work-atlas.ts',
  'src/styles/work-atlas.css',
];

for (const path of requiredFiles) {
  if (!(await exists(path))) fail('ATLAS_REQUIRED_FILE', 'Required Work Atlas file is missing.', path);
}

if (await exists('src/lib/work-atlas/generated/work-atlas-manifest.json')) {
  const expected = await buildWorkAtlasManifest();
  const actual = await read('src/lib/work-atlas/generated/work-atlas-manifest.json');
  if (actual !== expected.bytes) {
    fail('ATLAS_MANIFEST_DRIFT', 'Generated Atlas manifest is stale; run npm run atlas:generate.', 'src/lib/work-atlas/generated/work-atlas-manifest.json');
  }
}

if (await exists('src/pages/work/atlas/index.astro')) {
  const source = await read('src/pages/work/atlas/index.astro');
  for (const marker of [
    "import GlobalShell from '../../../layouts/GlobalShell.astro'",
    'getPublicProjectBundles',
    'createAtlasViewModel',
    'canonical="/work/atlas/"',
    'noindex={records.length === 0}',
  ]) {
    if (!source.includes(marker)) fail('ATLAS_ROUTE_CONTRACT', `Atlas route is missing ${marker}.`, 'src/pages/work/atlas/index.astro');
  }
}

if (await exists('src/lib/work-atlas/atlas-view-model.ts')) {
  const source = await read('src/lib/work-atlas/atlas-view-model.ts');
  for (const marker of [
    'createWorkRegisterRecords',
    'getProjectDetailRouteRecords',
    'createPublicProjectRelations',
    'getProjectWorldDefinition',
    'WORK_ATLAS_REGISTER_PARITY',
  ]) {
    if (!source.includes(marker)) fail('ATLAS_SHARED_CONTRACT', `Atlas view model is missing ${marker}.`, 'src/lib/work-atlas/atlas-view-model.ts');
  }
  for (const field of ['reviewedBy', 'sourceNote', 'rightsNote', 'redactionNote', 'filePath']) {
    if (new RegExp(`\\b${field}\\b`).test(source)) fail('ATLAS_PRIVATE_FIELD', `Atlas view model exposes prohibited field ${field}.`, 'src/lib/work-atlas/atlas-view-model.ts');
  }
}

if (ATLAS_REGIONS.length !== 5 || ATLAS_REGIONS.some(({ id }, index) => id !== PROJECT_CATEGORIES[index])) {
  fail('ATLAS_REGION_SET', 'Atlas regions must match the five canonical categories in order.', 'src/lib/work-atlas/atlas-regions.ts');
}
if (new Set(ATLAS_REGIONS.map(({ width }) => width)).size !== 1) {
  fail('ATLAS_REGION_STATUS', 'Atlas regions must have equal structural width.', 'src/lib/work-atlas/atlas-regions.ts');
}
if (Object.keys(ATLAS_RELATION_LANGUAGE).join('|') !== RELATION_TYPES.join('|')) {
  fail('ATLAS_RELATION_LANGUAGE', 'Atlas relation language must cover the content enum exactly.', 'src/lib/work-atlas/atlas-relations.ts');
}

if (await exists('src/lib/work-atlas/atlas-layout.ts')) {
  const source = await read('src/lib/work-atlas/atlas-layout.ts');
  for (const prohibited of ['Math.random', 'Date.now', 'performance.', 'featured', 'evidenceState', 'popularity', 'relationCount', 'degree']) {
    if (source.includes(prohibited)) fail('ATLAS_LAYOUT_RANKING', `Layout contains prohibited input ${prohibited}.`, 'src/lib/work-atlas/atlas-layout.ts');
  }
  if (!source.includes('ATLAS_NODE_WIDTH') || !source.includes('ATLAS_NODE_HEIGHT')) {
    fail('ATLAS_NODE_INVARIANT', 'Layout must use invariant node dimensions.', 'src/lib/work-atlas/atlas-layout.ts');
  }
}

const productionRoots = ['src/pages/work/atlas', 'src/components/work-atlas', 'src/lib/work-atlas', 'src/scripts/work-atlas.ts'];
const productionFiles = [];
for (const root of productionRoots) {
  if (!(await exists(root))) continue;
  const absolute = join(repositoryRoot, root);
  if (extname(root)) productionFiles.push(absolute);
  else productionFiles.push(...await walkFiles(absolute));
}

for (const absolutePath of productionFiles) {
  const source = await readFile(absolutePath, 'utf8');
  const path = relative(repositoryRoot, absolutePath);
  if (/content\/fixtures|fixture(?:Projects|ProjectData|ProjectRelations)|work-atlas-audit/i.test(source)) {
    fail('ATLAS_FIXTURE_IMPORT', 'Production Atlas source imports fixture or audit content.', path);
  }
  if (/\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket/.test(source)) {
    fail('ATLAS_RUNTIME_REQUEST', 'Production Atlas source performs a runtime request.', path);
  }
  if (/innerHTML|outerHTML|insertAdjacentHTML|\beval\s*\(|new Function/.test(source)) {
    fail('ATLAS_UNSAFE_DOM', 'Production Atlas source uses an unsafe DOM API.', path);
  }
  if (/<canvas\b|forceSimulation|requestAnimationFrame\s*\(|setInterval\s*\(/i.test(source)) {
    fail('ATLAS_PROHIBITED_RUNTIME', 'Production Atlas source contains a canvas, force, or continuous runtime.', path);
  }
  if (/\b(?:d3|three|pixi|cytoscape|sigma|react-flow|reactflow|radium)\b/i.test(source)) {
    fail('ATLAS_PROHIBITED_DEPENDENCY', 'Production Atlas source references a prohibited visualization or Radium package.', path);
  }
}

if (await exists('src/components/work-atlas/WorkAtlas.astro')) {
  const source = await read('src/components/work-atlas/WorkAtlas.astro');
  for (const marker of ['data-atlas-root', 'data-atlas-enhanced="false"', '<AtlasIndex', '<AtlasViewport', '<AtlasInspector']) {
    if (!source.includes(marker)) fail('ATLAS_SEMANTIC_BASELINE', `WorkAtlas is missing ${marker}.`, 'src/components/work-atlas/WorkAtlas.astro');
  }
}

if (await exists('src/components/work-atlas/AtlasIndex.astro')) {
  const source = await read('src/components/work-atlas/AtlasIndex.astro');
  for (const marker of ['data-atlas-project-index', 'data-atlas-relation-index', '<a', '<ol']) {
    if (!source.includes(marker)) fail('ATLAS_INDEX_SEMANTICS', `Atlas index is missing ${marker}.`, 'src/components/work-atlas/AtlasIndex.astro');
  }
}

if (await exists('src/scripts/work-atlas.ts')) {
  const source = await read('src/scripts/work-atlas.ts');
  for (const marker of [
    "dataset.atlasEnhanced = 'true'",
    'const failOpen',
    'history.pushState',
    'history.replaceState',
    "addEventListener('popstate'",
    "addEventListener('pagehide'",
    "case 'ArrowUp'",
    "case 'Escape'",
    'centerSelected',
    'zoomSteps',
  ]) {
    if (!source.includes(marker)) fail('ATLAS_ENHANCEMENT_CONTRACT', `Atlas enhancement is missing ${marker}.`, 'src/scripts/work-atlas.ts');
  }
  if (/wheel|pointerdown|pointermove|touchmove/i.test(source)) {
    fail('ATLAS_SCROLL_HIJACK', 'Atlas enhancement must not capture wheel, pointer-drag, or touch scrolling.', 'src/scripts/work-atlas.ts');
  }
}

if (await exists('src/styles/work-atlas.css')) {
  const source = (await read('src/styles/work-atlas.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const checks = [
    ['ATLAS_RAW_COLOR', /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|lab|lch)a?\(/i],
    ['ATLAS_PRIMITIVE_TOKEN', /var\(--azw-p-/],
    ['ATLAS_RAW_MOTION', /(?:animation|transition)(?:-[a-z-]+)?\s*:[^;]*(?:\d+m?s|cubic-bezier\()/i],
    ['ATLAS_RAW_Z_INDEX', /z-index\s*:\s*-?\d+\s*;/i],
  ];
  for (const [code, pattern] of checks) if (pattern.test(source)) fail(code, 'Atlas CSS contains an ungoverned value.', 'src/styles/work-atlas.css');
  for (const local of source.matchAll(/(--_[a-z0-9-]+)/gi)) {
    if (!local[1].startsWith('--_atlas-')) fail('ATLAS_LOCAL_TOKEN', `Atlas CSS contains disallowed local token ${local[1]}.`, 'src/styles/work-atlas.css');
  }
  for (const marker of ['@media (forced-colors: active)', '@media (prefers-reduced-motion: reduce)', '@media print', '@media (scripting: enabled)']) {
    if (!source.includes(marker)) fail('ATLAS_MODE_FALLBACK', `Atlas CSS is missing ${marker}.`, 'src/styles/work-atlas.css');
  }
}

if (await exists('src/pages/work/index.astro')) {
  const source = await read('src/pages/work/index.astro');
  if (!source.includes('<WorkRegister') || !source.includes('canonical="/work/"')) {
    fail('ATLAS_REGISTER_REGRESSION', 'The canonical Work Register route was replaced or weakened.', 'src/pages/work/index.astro');
  }
  if (!source.includes('AtlasViewSwitch')) fail('ATLAS_VIEW_SWITCH', 'The Register route lacks the local Register/Atlas switch.', 'src/pages/work/index.astro');
}

for (const path of [
  'src/pages/work-atlas-audit',
  'src/pages/work/atlas-audit',
  'public/work-atlas-audit',
  'dist/work-atlas-audit',
]) {
  if (await exists(path)) fail('ATLAS_TEMPORARY_HARNESS', 'Temporary Atlas browser harness remains.', path);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`${failure.code} ${failure.path}: ${failure.message}`);
  console.error(`Work Atlas validation failed: ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Work Atlas validation passed: ${requiredFiles.length} required files and production boundaries verified.`);
}
