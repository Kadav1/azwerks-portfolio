import { readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

import { buildProjectDetailManifest, repositoryRoot } from './generate-project-detail-manifest.mjs';
import { walkFiles } from './token-utils.mjs';

const failures = [];
const fail = (code, message, path) => failures.push({ code, message, path });
const exists = async (path) => stat(join(repositoryRoot, path)).then(() => true, () => false);
const read = async (path) => readFile(join(repositoryRoot, path), 'utf8');

const requiredFiles = [
  'src/pages/work/[slug].astro',
  'src/layouts/ProjectDetailLayout.astro',
  'src/components/project/ProjectDetail.astro',
  'src/components/project/ProjectOrientation.astro',
  'src/components/project/ProjectHeader.astro',
  'src/components/project/ProjectStateSummary.astro',
  'src/components/project/ProjectLeadMedia.astro',
  'src/components/project/ProjectMedia.astro',
  'src/components/project/ProjectNarrative.astro',
  'src/components/project/ProjectContents.astro',
  'src/components/project/ProjectEvidence.astro',
  'src/components/project/ProjectEvidenceItem.astro',
  'src/components/project/ProjectLimitations.astro',
  'src/components/project/ProjectProcess.astro',
  'src/components/project/ProjectReleases.astro',
  'src/components/project/ProjectLinks.astro',
  'src/components/project/ProjectProvenance.astro',
  'src/components/project/ProjectRelations.astro',
  'src/components/project/ProjectContextNavigation.astro',
  'src/components/project/ProjectNoMediaState.astro',
  'src/lib/project-detail/types.ts',
  'src/lib/project-detail/routes.ts',
  'src/lib/project-detail/navigation.ts',
  'src/lib/project-detail/view-model.ts',
  'src/lib/project-detail/media.ts',
  'src/lib/project-detail/evidence.ts',
  'src/lib/project-detail/relations.ts',
  'src/lib/project-detail/labels.ts',
  'src/lib/project-detail/profiles.ts',
  'src/lib/project-detail/headings.ts',
  'src/lib/project-detail/manifest.ts',
  'src/lib/project-detail/generated/project-detail-route-manifest.json',
  'src/styles/project-detail.css',
  'scripts/generate-project-detail-manifest.mjs',
  'scripts/check-project-detail-manifest.mjs',
  'scripts/test-project-detail-view-model.mjs',
  'scripts/browser-project-detail-audit.mjs',
];

for (const path of requiredFiles) {
  if (!(await exists(path))) fail('PROJECT_DETAIL_REQUIRED_FILE', 'Required project-detail file is missing.', path);
}

if (await exists('src/pages/work/[slug].astro')) {
  const source = await read('src/pages/work/[slug].astro');
  if (!source.includes('getStaticPaths') || !source.includes('satisfies GetStaticPaths') || /prerender\s*=\s*false/.test(source)) {
    fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', 'Dynamic route must use static typed getStaticPaths without on-demand rendering.', 'src/pages/work/[slug].astro');
  }
  if (!source.includes('getPublicProjectBundles') || !source.includes("getCollection('projects')")) {
    fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', 'Route must originate from public production bundles and the production Markdown collection.', 'src/pages/work/[slug].astro');
  }
  if (!source.includes('render(entry)') || !source.includes('<ProjectDetail')) {
    fail('PROJECT_DETAIL_MARKDOWN_RENDER_MISSING', 'Route must render the Astro content entry into the invariant anatomy.', 'src/pages/work/[slug].astro');
  }
}

if (await exists('src/lib/project-detail/routes.ts')) {
  const source = await read('src/lib/project-detail/routes.ts');
  if (!source.includes('PROJECT_DETAIL_SLUG_DUPLICATE') || !source.includes('getProjectDetailHref') || !source.includes('isProjectDetailRoutable')) {
    fail('PROJECT_DETAIL_SLUG_DUPLICATE', 'Route helper contract or duplicate-slug failure is missing.', 'src/lib/project-detail/routes.ts');
  }
}

if (await exists('src/lib/work-register/view-model.ts')) {
  const source = await read('src/lib/work-register/view-model.ts');
  if (!source.includes("from '../project-detail/routes.ts'") || !source.includes('getProjectDetailHref')) {
    fail('PROJECT_DETAIL_BROKEN_HREF', 'Work Register does not use the canonical project-detail href helper.', 'src/lib/work-register/view-model.ts');
  }
}

const productionRoots = ['src/pages/work', 'src/layouts/ProjectDetailLayout.astro', 'src/components/project', 'src/lib/project-detail'];
const productionFiles = [];
for (const root of productionRoots) {
  if (!(await exists(root))) continue;
  const absolute = join(repositoryRoot, root);
  productionFiles.push(...(extname(root) ? [absolute] : await walkFiles(absolute)));
}

for (const absolute of productionFiles) {
  const source = await readFile(absolute, 'utf8');
  const path = relative(repositoryRoot, absolute);
  if (/content\/fixtures|fixture(?:Projects|ProjectData|ProjectRelations|-contract)/i.test(source)) {
    fail('PROJECT_DETAIL_FIXTURE_IMPORT', 'Production project-detail code imports fixture content.', path);
  }
  if (/\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket|getLiveCollection|getLiveEntry/.test(source)) {
    fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', 'Project detail performs a runtime content request.', path);
  }
  if (/\bMDX\b|@astrojs\/mdx|react|vue|svelte|solid-js/i.test(source)) {
    fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', 'Project detail contains a prohibited renderer or runtime.', path);
  }
}

if (await exists('src/lib/project-detail/view-model.ts')) {
  const source = await read('src/lib/project-detail/view-model.ts');
  for (const field of ['reviewedBy', 'sourceNote', 'rightsNote', 'redactionNote', 'filePath']) {
    if (new RegExp(`\\b${field}\\b`).test(source)) {
      fail('PROJECT_DETAIL_PRIVATE_FIELD', `View-model source references prohibited private field ${field}.`, 'src/lib/project-detail/view-model.ts');
    }
  }
}

if (await exists('src/components/project/ProjectDetail.astro')) {
  const source = await read('src/components/project/ProjectDetail.astro');
  if (source.includes('ProjectWorld')) {
    if (!(await exists('src/components/project-worlds/WorldSection.astro'))) {
      fail('PROJECT_DETAIL_EMPTY_SECTION', 'Project-world extension renderer is missing.', 'src/components/project-worlds/WorldSection.astro');
    } else {
      const worldSection = await read('src/components/project-worlds/WorldSection.astro');
      for (const marker of ['ProjectOrientation', 'ProjectHeader', 'ProjectLeadMedia', 'ProjectNarrative', 'ProjectEvidence', 'ProjectLimitations', 'ProjectProcess', 'ProjectReleases', 'ProjectLinks', 'ProjectProvenance', 'ProjectRelations', 'ProjectContextNavigation']) {
        if (!worldSection.includes(marker)) fail('PROJECT_DETAIL_EMPTY_SECTION', `Invariant component ${marker} is missing from the governed world renderer.`, 'src/components/project-worlds/WorldSection.astro');
      }
    }
  } else {
    const order = ['ProjectOrientation', 'ProjectHeader', 'ProjectLeadMedia', 'ProjectNarrative', 'ProjectEvidence', 'ProjectLimitations', 'ProjectProcess', 'ProjectReleases', 'ProjectLinks', 'ProjectProvenance', 'ProjectRelations', 'ProjectContextNavigation'];
    let offset = -1;
    for (const marker of order) {
      const index = source.indexOf(`<${marker}`, offset + 1);
      if (index < 0 || index <= offset) fail('PROJECT_DETAIL_EMPTY_SECTION', `Invariant component ${marker} is missing or out of order.`, 'src/components/project/ProjectDetail.astro');
      offset = index;
    }
  }
}

if (await exists('src/components/project')) {
  const files = await walkFiles(join(repositoryRoot, 'src/components/project'));
  const h1Count = (await Promise.all(files.map((path) => readFile(path, 'utf8')))).reduce((count, source) => count + (source.match(/<h1\b/g) ?? []).length, 0);
  if (h1Count !== 1) fail('PROJECT_DETAIL_HEADING_INVALID', `Project components contain ${h1Count} H1 elements; exactly one is required.`, 'src/components/project');
}

if (await exists('src/layouts/ProjectDetailLayout.astro')) {
  const source = await read('src/layouts/ProjectDetailLayout.astro');
  for (const attribute of ['data-project-category', 'data-project-layout-profile', 'data-project-theme-profile', 'data-project-motion-profile']) {
    if (!source.includes(attribute)) fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', `World extension attribute ${attribute} is missing.`, 'src/layouts/ProjectDetailLayout.astro');
  }
}

if (await exists('src/styles/project-detail.css')) {
  const source = (await read('src/styles/project-detail.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  if (/var\(--azw-p-|#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|lab|lch)a?\(/i.test(source)) {
    fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', 'Project-detail CSS contains a primitive token or raw color.', 'src/styles/project-detail.css');
  }
  if (/\[data-project-category(?:=|\])/.test(source)) {
    fail('PROJECT_DETAIL_ROUTE_SOURCE_INVALID', 'Final category-specific layout entered the invariant stylesheet.', 'src/styles/project-detail.css');
  }
}

const expected = await buildProjectDetailManifest();
if (await exists('src/lib/project-detail/generated/project-detail-route-manifest.json')) {
  const actual = await read('src/lib/project-detail/generated/project-detail-route-manifest.json');
  if (actual !== expected.bytes) fail('PROJECT_DETAIL_MANIFEST_DRIFT', 'Generated route manifest is stale.', 'src/lib/project-detail/generated/project-detail-route-manifest.json');
}

for (const path of [
  'src/pages/project-detail-audit',
  'public/project-detail-audit',
  'dist/project-detail-audit',
]) {
  if (await exists(path)) fail('PROJECT_DETAIL_FIXTURE_IMPORT', 'Temporary project-detail harness remains.', path);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`${failure.code} ${failure.path}: ${failure.message}`);
  console.error(`Project detail validation failed: ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Project detail validation passed: ${requiredFiles.length} required files; ${expected.manifest.routeCount} production routes.`);
}
