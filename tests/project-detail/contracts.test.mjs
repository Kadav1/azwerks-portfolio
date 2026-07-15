import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getProjectDetailHref,
  getProjectDetailRouteRecords,
  isProjectDetailRoutable,
} from '../../src/lib/project-detail/routes.ts';
import { getProjectContextNavigation } from '../../src/lib/project-detail/navigation.ts';
import { createProjectDetailManifest, serializeProjectDetailManifest } from '../../src/lib/project-detail/manifest.ts';
import { validateProjectDetailHeadings } from '../../src/lib/project-detail/headings.ts';
import { createProjectDetailBundle, createProjectDetailBundles } from '../support/project-detail-fixtures.ts';

test('creates one canonical trailing-slash href and rejects unsafe slugs', () => {
  assert.equal(getProjectDetailHref('quiet-system'), '/work/quiet-system/');
  for (const slug of ['', 'Quiet-System', '../private', 'two/slugs', 'space slug']) {
    assert.throws(() => getProjectDetailHref(slug), { code: 'PROJECT_DETAIL_BROKEN_HREF' });
  }
});

test('accepts only eligible non-archived public production-shaped bundles', () => {
  const eligible = createProjectDetailBundle('eligible');
  const ineligible = createProjectDetailBundle('ineligible', 'software', {
    publication: { eligible: false, reasons: ['visibility'] },
  });
  const archived = createProjectDetailBundle('archived', 'software', {
    project: { lifecycle: 'archived' },
  });
  const synthetic = createProjectDetailBundle('synthetic', 'software', {
    project: { synthetic: true },
  });
  assert.equal(isProjectDetailRoutable(eligible), true);
  assert.equal(isProjectDetailRoutable(ineligible), false);
  assert.equal(isProjectDetailRoutable(archived), false);
  assert.equal(isProjectDetailRoutable(synthetic), false);
});

test('preserves public Work order and fails duplicate slugs', () => {
  const bundles = createProjectDetailBundles(5);
  const records = getProjectDetailRouteRecords(bundles);
  assert.deepEqual(records.map(({ slug }) => slug), bundles.map(({ project }) => project.data.slug));
  assert.deepEqual(records.map(({ href }) => href), bundles.map(({ project }) => `/work/${project.data.slug}/`));

  const duplicate = createProjectDetailBundle('another-id', 'software', { project: { slug: bundles[0].project.data.slug } });
  assert.throws(
    () => getProjectDetailRouteRecords([...bundles, duplicate]),
    { code: 'PROJECT_DETAIL_SLUG_DUPLICATE' },
  );
});

test('supports exact 0, 1, 5, and 10 route sets with non-wrapping navigation', () => {
  for (const count of [0, 1, 5, 10]) {
    const records = getProjectDetailRouteRecords(createProjectDetailBundles(count));
    assert.equal(records.length, count);
    if (count === 0) continue;
    assert.deepEqual(getProjectContextNavigation(records, 0), {
      position: count > 1 ? { current: 1, total: count } : undefined,
      previousProject: undefined,
      nextProject: count > 1 ? { id: records[1].id, title: records[1].title, href: records[1].href } : undefined,
    });
    const last = getProjectContextNavigation(records, count - 1);
    assert.equal(last.nextProject, undefined);
    assert.equal(last.previousProject?.id, count > 1 ? records[count - 2].id : undefined);
  }
});

test('serializes a deterministic privacy-minimal route manifest', () => {
  const source = [
    ...createProjectDetailBundles(5),
    createProjectDetailBundle('private-record', 'art', { publication: { eligible: false, reasons: ['visibility'] } }),
    createProjectDetailBundle('archived-record', 'software', { project: { lifecycle: 'archived' } }),
  ];
  const first = serializeProjectDetailManifest(createProjectDetailManifest(source));
  const second = serializeProjectDetailManifest(createProjectDetailManifest(structuredClone(source)));
  assert.equal(first, second);
  const parsed = JSON.parse(first);
  assert.equal(parsed.routeCount, 5);
  assert.equal(parsed.sourceBundleCount, 7);
  assert.equal(parsed.excludedByReason.ineligible, 1);
  assert.equal(parsed.excludedByReason.archived, 1);
  assert.equal(first.includes('Private source note'), false);
  assert.equal(first.includes('/private/'), false);
  assert.match(parsed.generatedHash, /^[a-f0-9]{64}$/);
});

test('accepts rational H2/H3 narrative headings and rejects invalid heading structure', () => {
  const headings = validateProjectDetailHeadings([
    { depth: 2, slug: 'overview', text: 'Overview' },
    { depth: 3, slug: 'method', text: 'Method' },
    { depth: 2, slug: 'result', text: 'Result' },
  ]);
  assert.equal(headings.length, 3);
  for (const invalid of [
    [{ depth: 1, slug: 'duplicate-title', text: 'Duplicate title' }],
    [{ depth: 3, slug: 'skipped', text: 'Skipped opening' }],
    [{ depth: 2, slug: 'empty', text: '   ' }],
    [{ depth: 2, slug: 'same', text: 'First' }, { depth: 2, slug: 'same', text: 'Second' }],
    [{ depth: 2, slug: 'start', text: 'Start' }, { depth: 4, slug: 'skip', text: 'Skip' }],
  ]) {
    assert.throws(() => validateProjectDetailHeadings(invalid), { code: 'PROJECT_DETAIL_HEADING_INVALID' });
  }
});
