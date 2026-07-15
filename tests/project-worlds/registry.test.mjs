import assert from 'node:assert/strict';
import test from 'node:test';

import { PROJECT_CATEGORIES } from '../../src/content-model/enums.ts';
import { createProjectDetailBundle } from '../support/project-detail-fixtures.ts';
import { createProjectDetailViewModel } from '../../src/lib/project-detail/view-model.ts';
import { getProjectDetailRouteRecords } from '../../src/lib/project-detail/routes.ts';
import { getAuthoredMarkPolicy } from '../../src/lib/project-worlds/authored-mark-policy.ts';
import { createProjectWorldManifest } from '../../src/lib/project-worlds/manifest.ts';
import { getProjectWorldMediaPolicy } from '../../src/lib/project-worlds/media-policy.ts';
import { PROJECT_WORLD_REGISTRY, getProjectWorldDefinition } from '../../src/lib/project-worlds/world-registry.ts';
import { REQUIRED_INVARIANT_SECTIONS, getProjectWorldSectionPolicy } from '../../src/lib/project-worlds/world-section-policy.ts';
import { validateProjectWorldRegistry } from '../../src/lib/project-worlds/world-validation.ts';
import { createProjectWorldViewModel } from '../../src/lib/project-worlds/world-view-model.ts';

const expectedProfiles = {
  software: ['technical', 'software', 'technical'],
  'visual-system': ['standard', 'visual-system', 'specimen-led'],
  art: ['quiet', 'art', 'media-led'],
  'technical-system': ['technical', 'technical-system', 'technical'],
  'limited-media': ['quiet', 'limited-media', 'document-led'],
};

test('maps exactly five canonical categories to frozen world definitions', () => {
  assert.deepEqual(Object.keys(PROJECT_WORLD_REGISTRY), [...PROJECT_CATEGORIES]);
  for (const category of PROJECT_CATEGORIES) {
    const definition = getProjectWorldDefinition(category);
    assert.equal(definition.id, category);
    assert.deepEqual(
      [definition.shellProfile, definition.worldProfile, definition.layoutProfile],
      expectedProfiles[category],
    );
    assert.equal(definition.authoredMarkLevel, 0);
    assert.equal(Object.isFrozen(definition), true);
    assert.equal(Object.isFrozen(definition.sectionEmphasis), true);
  }
  assert.equal(Object.isFrozen(PROJECT_WORLD_REGISTRY), true);
  assert.throws(() => getProjectWorldDefinition('unknown-world'), /PROJECT_WORLD_CATEGORY_UNKNOWN/);
  assert.deepEqual(validateProjectWorldRegistry(), []);
});

test('preserves required invariant sections in each category-specific policy', () => {
  const orders = new Set();
  for (const category of PROJECT_CATEGORIES) {
    const policy = getProjectWorldSectionPolicy(category);
    assert.equal(Object.isFrozen(policy), true);
    assert.equal(Object.isFrozen(policy.order), true);
    assert.equal(new Set(policy.order).size, policy.order.length);
    for (const section of REQUIRED_INVARIANT_SECTIONS) assert.equal(policy.order.includes(section), true, `${category} omitted ${section}`);
    assert.equal(policy.order[0], 'orientation');
    assert.equal(policy.order[1], 'header');
    assert.equal(policy.order.at(-1), 'context-navigation');
    assert.notEqual(policy.limitationsTreatment, 'hidden');
    assert.notEqual(policy.provenanceTreatment, 'hidden');
    orders.add(policy.order.join('|'));
  }
  assert.equal(orders.size, 5);
});

test('keeps marks at Level 0 and media policy inside the invariant safety boundary', () => {
  for (const category of PROJECT_CATEGORIES) {
    const marks = getAuthoredMarkPolicy(category);
    const media = getProjectWorldMediaPolicy(category);
    assert.equal(marks.level, 0);
    assert.equal(marks.approvedSurface, undefined);
    assert.equal(marks.removable, true);
    assert.equal(media.preserveRights, true);
    assert.equal(media.preserveAvailability, true);
    assert.equal(media.preserveAlternatives, true);
    assert.equal(media.crop, 'never');
    if (category === 'art') assert.equal(media.surround, 'neutral-art');
  }
});

test('derives a public-safe world view model only from project category and invariant data', () => {
  for (const category of PROJECT_CATEGORIES) {
    const bundle = createProjectDetailBundle(`world-${category}`, category, {
      companion: {
        evidence: [{ id: 'proof', type: 'inspection', title: 'Synthetic proof', trust: 'reviewed', availability: 'public', artifact: 'Synthetic artifact' }],
        process: [{ id: 'step', title: 'Synthetic step', summary: 'Synthetic process step.', order: 1 }],
        releases: [{ id: 'release', version: '1.0.0', date: '2025-01-01', status: 'released', summary: 'Synthetic release.' }],
        links: [{ id: 'docs', type: 'documentation', label: 'Documentation', url: 'https://example.com/docs', public: true }],
      },
    });
    const routes = getProjectDetailRouteRecords([bundle]);
    const project = createProjectDetailViewModel(bundle, routes, 0);
    const world = createProjectWorldViewModel(project, true);
    assert.equal(world.world, category);
    assert.equal(world.hasNarrative, true);
    assert.equal(world.hasEvidence, true);
    assert.equal(world.hasLimitations, true);
    assert.equal(world.hasProcess, true);
    assert.equal(world.hasReleases, true);
    assert.equal(world.hasLinks, true);
    assert.equal(world.authoredMarkLevel, 0);
    assert.equal(JSON.stringify(world).includes('reviewedBy'), false);
    assert.equal(JSON.stringify(world).includes('/private/'), false);
  }
});

test('identifies sparse worlds without inventing media or sections', () => {
  const bundle = createProjectDetailBundle('world-sparse', 'limited-media');
  const routes = getProjectDetailRouteRecords([bundle]);
  const project = createProjectDetailViewModel(bundle, routes, 0);
  const world = createProjectWorldViewModel(project, false);
  assert.equal(world.isSparse, true);
  assert.equal(world.hasLeadMedia, false);
  assert.equal(world.hasNarrative, false);
  assert.equal(world.hasEvidence, false);
  assert.equal(world.hasLimitations, true);
});

test('generates a deterministic privacy-minimal five-world manifest', () => {
  const first = createProjectWorldManifest();
  const second = createProjectWorldManifest();
  assert.deepEqual(first, second);
  assert.equal(first.worldCount, 5);
  assert.deepEqual(first.mappings.map(({ category }) => category), [...PROJECT_CATEGORIES]);
  assert.equal(first.mappings.every(({ authoredMarkLevel }) => authoredMarkLevel === 0), true);
  assert.equal(first.fixtureCoverage.length, 10);
  assert.match(first.generatedHash, /^[a-f0-9]{64}$/);
  const serialized = JSON.stringify(first);
  for (const forbidden of ['/home/', '/media/', 'reviewedBy', 'private.example', 'fixtureProjects']) {
    assert.equal(serialized.includes(forbidden), false, `Manifest leaked ${forbidden}`);
  }
});
