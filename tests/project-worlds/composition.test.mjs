import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { PROJECT_WORLD_SECTION_POLICIES } from '../../src/lib/project-worlds/world-section-policy.ts';

const ROOT = new URL('../../', import.meta.url);
const read = (path) => readFile(new URL(path, ROOT), 'utf8');

const worldComponents = Object.freeze({
  software: 'src/components/project-worlds/software/SoftwareProjectWorld.astro',
  'visual-system': 'src/components/project-worlds/visual-system/VisualSystemProjectWorld.astro',
  art: 'src/components/project-worlds/art/ArtProjectWorld.astro',
  'technical-system': 'src/components/project-worlds/technical-system/TechnicalSystemProjectWorld.astro',
  'limited-media': 'src/components/project-worlds/limited-media/LimitedMediaProjectWorld.astro',
});

test('ProjectDetail delegates category composition to the typed world dispatcher', async () => {
  const detail = await read('src/components/project/ProjectDetail.astro');
  assert.match(detail, /ProjectWorld/);
  assert.doesNotMatch(detail, /ProjectEvidence|ProjectLimitations|ProjectProvenance/);

  const dispatcher = await read('src/components/project-worlds/ProjectWorld.astro');
  for (const path of Object.values(worldComponents)) {
    assert.match(dispatcher, new RegExp(path.split('/').at(-1).replace('.astro', '')));
  }
  assert.match(dispatcher, /getProjectWorldDefinition\(project\.category\)/);

  const layout = await read('src/layouts/ProjectDetailLayout.astro');
  assert.match(layout, /getProjectWorldDefinition\(project\.category\)/);
  for (const profile of ['shellProfile', 'worldProfile', 'layoutProfile', 'themeProfile', 'motionProfile']) {
    assert.match(layout, new RegExp(`world\\.${profile}`));
  }
});

test('each production world explicitly composes its governed section order', async () => {
  for (const [world, path] of Object.entries(worldComponents)) {
    const source = await read(path);
    const renderedOrder = [...source.matchAll(/section="([a-z-]+)"/g)].map((match) => match[1]);
    assert.deepEqual(renderedOrder, PROJECT_WORLD_SECTION_POLICIES[world].order, `${world} section order drifted`);
    assert.match(source, /WorldFrame/);
    assert.match(source, /WorldSection/);
  }
});

test('shared section renderer owns all invariant content components and guards optional content', async () => {
  const section = await read('src/components/project-worlds/WorldSection.astro');
  for (const component of [
    'ProjectOrientation', 'ProjectHeader', 'ProjectLeadMedia', 'ProjectNoMediaState',
    'ProjectNarrative', 'ProjectEvidence', 'ProjectLimitations', 'ProjectProcess',
    'ProjectReleases', 'ProjectLinks', 'ProjectProvenance', 'ProjectRelations',
    'ProjectContextNavigation',
  ]) assert.match(section, new RegExp(component));
  assert.match(section, /hasNarrative/);
  assert.match(section, /project\.publicEvidence\.length/);
  assert.match(section, /project\.limitations\.length/);
});

test('world styling has governed fallbacks without authored-mark decoration', async () => {
  const shared = await read('src/styles/project-worlds.css');
  assert.match(shared, /prefers-reduced-motion/);
  assert.match(shared, /forced-colors/);
  assert.match(shared, /@media print/);
  assert.doesNotMatch(shared, /::before|::after/);

  for (const world of Object.keys(worldComponents)) {
    const cssPath = `src/styles/project-world-${world}.css`;
    const css = await read(cssPath);
    assert.match(css, new RegExp(`project-world--${world}`));
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    assert.doesNotMatch(css, /var\(--azw-(?:primitive|functional)-/);
    assert.doesNotMatch(css, /::before|::after/);
  }
});

test('production route and world modules remain fixture-free and static', async () => {
  const route = await read('src/pages/work/[slug].astro');
  assert.match(route, /getStaticPaths/);
  assert.doesNotMatch(route, /fixture|synthetic/i);

  const paths = [
    'src/components/project-worlds/ProjectWorld.astro',
    'src/lib/project-worlds/world-registry.ts',
    ...Object.values(worldComponents),
  ];
  for (const path of paths) {
    assert.doesNotMatch(await read(path), /content-fixtures|fixture-projects|synthetic-project/i, path);
  }
});
