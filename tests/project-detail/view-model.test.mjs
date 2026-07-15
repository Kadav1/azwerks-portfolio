import test from 'node:test';
import assert from 'node:assert/strict';

import { createProjectDetailViewModel } from '../../src/lib/project-detail/view-model.ts';
import { filterPublicEvidence } from '../../src/lib/project-detail/evidence.ts';
import { selectLeadMedia } from '../../src/lib/project-detail/media.ts';
import { mapProjectProfiles } from '../../src/lib/project-detail/profiles.ts';
import { getProjectDetailRouteRecords } from '../../src/lib/project-detail/routes.ts';
import { createProjectDetailBundle, createProjectDetailBundles } from '../support/project-detail-fixtures.ts';

test('maps all five categories to bounded world and shell profiles', () => {
  const expected = {
    software: ['software', 'technical'],
    'visual-system': ['visual-system', 'standard'],
    art: ['art', 'quiet'],
    'technical-system': ['technical-system', 'technical'],
    'limited-media': ['limited-media', 'quiet'],
  };
  for (const [category, [worldProfile, shellProfile]] of Object.entries(expected)) {
    assert.deepEqual(mapProjectProfiles(category, 'editorial', 'system', 'none'), {
      worldProfile,
      shellProfile,
      layoutProfile: 'editorial',
      themeProfile: 'system',
      motionProfile: 'none',
    });
  }
  assert.equal(mapProjectProfiles('visual-system', 'technical', 'system', 'none').shellProfile, 'technical');
  assert.equal(mapProjectProfiles('software', 'media-led', 'system', 'none').shellProfile, 'immersive');
});

test('selects one deterministic public lead media item and excludes unsafe sources', () => {
  const media = [
    { id: 'decorative', type: 'image', source: '/decorative.svg', purpose: 'decorative', rights: 'owned', availability: 'available', alt: '', width: 100, height: 100 },
    { id: 'diagram', type: 'diagram', source: '/diagram.svg', purpose: 'diagram', rights: 'owned', availability: 'available', alt: 'Architecture diagram', width: 1200, height: 800 },
    { id: 'interface', type: 'interface', source: '/interface.webp', purpose: 'interface', rights: 'licensed', availability: 'available', alt: 'Interface overview', width: 1200, height: 800 },
    { id: 'artwork', type: 'image', source: '/artwork.webp', purpose: 'artwork', rights: 'permission-granted', availability: 'available', alt: 'Artwork view', width: 900, height: 1200, caption: 'Synthetic art fixture.' },
    { id: 'private', type: 'image', source: 'https://private.example/media.webp', purpose: 'informative', rights: 'private', availability: 'private', alt: 'Private', width: 900, height: 600 },
  ];
  assert.equal(selectLeadMedia(media)?.id, 'artwork');
  assert.equal(selectLeadMedia(media.filter(({ id }) => id !== 'artwork'))?.id, 'interface');
  assert.equal(selectLeadMedia(media.filter(({ id }) => !['artwork', 'interface'].includes(id)))?.id, 'diagram');
  assert.equal(selectLeadMedia(media.filter(({ id }) => ['decorative', 'private'].includes(id)))?.id, 'decorative');
  assert.equal(selectLeadMedia(media.filter(({ id }) => id === 'private')), undefined);
});

test('keeps evidence trust exact, preserves verified artifacts and strips private URLs', () => {
  const evidence = [
    { id: 'metric', type: 'metric', title: 'Synthetic timing', trust: 'verified', availability: 'public', claim: 'A synthetic timing exists.', method: 'Static fixture measurement', result: '12', unit: 'milliseconds', artifact: 'Synthetic timing report', url: 'https://example.com/timing' },
    { id: 'review', type: 'inspection', title: 'Review notes', trust: 'reviewed', availability: 'public', summary: 'Reviewed synthetic structure.', artifact: 'Review note' },
    { id: 'private-proof', type: 'source', title: 'Private source inspection', trust: 'private', availability: 'private', summary: 'Evidence exists privately.', url: 'https://private.example/proof' },
    { id: 'unavailable', type: 'artifact', title: 'Unavailable artifact', trust: 'unavailable', availability: 'unavailable', url: 'https://example.com/unavailable' },
  ];
  const safe = filterPublicEvidence(evidence);
  assert.deepEqual(safe.map(({ trust }) => trust), ['verified', 'reviewed', 'private', 'unavailable']);
  assert.equal(safe[0].artifact, 'Synthetic timing report');
  assert.equal(safe[0].method, 'Static fixture measurement');
  assert.equal(safe[0].unit, 'milliseconds');
  assert.equal(safe[2].url, undefined);
  assert.equal(safe[3].url, undefined);
});

test('creates a strict serializable public view model and excludes private fields', () => {
  const bundles = createProjectDetailBundles(5);
  const target = createProjectDetailBundle('detail-target', 'technical-system', {
    project: {
      seoTitle: 'Synthetic detail target — azwerks',
      seoDescription: 'A valid synthetic description used only for an isolated project detail view-model test.',
      experimental: true,
    },
    companion: {
      mediaAvailability: 'available',
      sourceAvailability: 'private',
      artworkAvailability: 'not-applicable',
      media: [{ id: 'diagram', type: 'diagram', source: '/synthetic-diagram.svg', purpose: 'diagram', rights: 'owned', availability: 'available', alt: 'Synthetic system flow', width: 1200, height: 800, caption: 'Synthetic QA diagram.', credit: 'Repository fixture' }],
      evidence: [
        { id: 'metric', type: 'metric', title: 'Synthetic timing', trust: 'verified', availability: 'public', method: 'Static fixture measurement', result: '12', unit: 'milliseconds', artifact: 'Synthetic timing report' },
        { id: 'private-proof', type: 'source', title: 'Private source inspection', trust: 'private', availability: 'private', summary: 'Evidence exists privately.' },
      ],
      process: [{ id: 'second', title: 'Second decision', summary: 'Second synthetic process decision.', order: 2 }, { id: 'first', title: 'First decision', summary: 'First synthetic process decision.', order: 1, evidenceIds: ['metric', 'private-proof'] }],
      limitations: [{ id: 'limit', summary: 'The record is synthetic and proves structure only.', status: 'accepted', evidenceIds: ['metric', 'private-proof'] }],
      releases: [{ id: 'older', version: '0.1.0', date: '2024-01-01', status: 'superseded', summary: 'Older synthetic release.' }, { id: 'newer', version: '0.2.0', date: '2025-01-01', status: 'released', summary: 'Newer synthetic release.', url: 'https://example.com/release' }],
      links: [{ id: 'docs', type: 'documentation', label: 'Documentation', url: 'https://example.com/docs', public: true }, { id: 'private', type: 'repository', label: 'Private repository', url: 'https://private.example/repo', public: false }],
    },
  });
  const all = [bundles[0], target, ...bundles.slice(1)];
  const routes = getProjectDetailRouteRecords(all);
  const index = routes.findIndex(({ id }) => id === target.id);
  const viewModel = createProjectDetailViewModel(target, routes, index, [
    { depth: 2, slug: 'overview', text: 'Overview' },
    { depth: 3, slug: 'method', text: 'Method' },
    { depth: 2, slug: 'result', text: 'Result' },
  ]);

  assert.equal(viewModel.href, '/work/detail-target/');
  assert.equal(viewModel.canonical, '/work/detail-target/');
  assert.equal(viewModel.noindex, false);
  assert.equal(viewModel.title, target.project.data.title);
  assert.equal(viewModel.categoryLabel, 'Technical system');
  assert.equal(viewModel.lifecycleLabel, 'Approved');
  assert.equal(viewModel.maintenanceLabel, 'Active');
  assert.equal(viewModel.worldProfile, 'technical-system');
  assert.equal(viewModel.shellProfile, 'technical');
  assert.equal(viewModel.leadMedia.id, 'diagram');
  assert.equal(viewModel.publicEvidence[0].trust, 'verified');
  assert.deepEqual(viewModel.process.map(({ id }) => id), ['first', 'second']);
  assert.deepEqual(viewModel.process[0].evidenceIds, ['metric']);
  assert.deepEqual(viewModel.limitations[0].evidenceIds, ['metric']);
  assert.deepEqual(viewModel.releases.map(({ id }) => id), ['newer', 'older']);
  assert.deepEqual(viewModel.publicLinks.map(({ id }) => id), ['docs']);
  assert.equal(viewModel.provenance.reviewStatus, 'approved');
  assert.equal(viewModel.tableOfContents.length, 3);
  assert.equal(viewModel.previousProject?.id, bundles[0].id);
  assert.equal(viewModel.nextProject?.id, bundles[1].id);

  const serialized = JSON.stringify(viewModel);
  for (const forbidden of ['reviewedBy', 'sourceNote', 'rightsNote', 'redactionNote', '/private/', 'private.example', 'Internal reviewer identity']) {
    assert.equal(serialized.includes(forbidden), false, `Leaked private field: ${forbidden}`);
  }
  structuredClone(viewModel);
});

test('filters relations to unique public routable endpoints and preserves direction meaning', () => {
  const related = createProjectDetailBundle('related-target', 'art');
  const privateTarget = createProjectDetailBundle('private-target', 'art', { publication: { eligible: false, reasons: ['visibility'] } });
  const relations = [
    { schemaVersion: '1.0', id: 'supports-target', from: 'relation-source', to: 'related-target', type: 'supports', direction: 'directed', summary: 'The source supports the related target.', visibility: 'public', synthetic: false },
    { schemaVersion: '1.0', id: 'shared-target', from: 'relation-source', to: 'related-target', type: 'shared-method', direction: 'undirected', summary: 'The records share a documented method.', visibility: 'public', synthetic: false },
    { schemaVersion: '1.0', id: 'private-edge', from: 'relation-source', to: 'private-target', type: 'related', direction: 'undirected', summary: 'This endpoint is not routable.', visibility: 'public', synthetic: false },
    { schemaVersion: '1.0', id: 'hidden-edge', from: 'relation-source', to: 'related-target', type: 'related', direction: 'undirected', summary: 'This relation is private.', visibility: 'private', synthetic: false },
  ];
  const source = createProjectDetailBundle('relation-source', 'software', {
    relations: { outgoing: [relations[0]], undirected: relations.slice(1) },
  });
  const all = [source, related, privateTarget];
  const routes = getProjectDetailRouteRecords(all);
  const viewModel = createProjectDetailViewModel(source, routes, 0, []);
  assert.deepEqual(viewModel.relations.map(({ id }) => id), ['shared-target', 'supports-target']);
  assert.equal(viewModel.relations.find(({ id }) => id === 'supports-target').directionLabel, 'Supports');
  assert.equal(viewModel.relations.find(({ id }) => id === 'shared-target').directionLabel, undefined);
  assert.equal(JSON.stringify(viewModel).includes('private-target'), false);
});

test('represents sparse and no-media records without empty data theater', () => {
  const bundle = createProjectDetailBundle('sparse-record', 'limited-media');
  const routes = getProjectDetailRouteRecords([bundle]);
  const viewModel = createProjectDetailViewModel(bundle, routes, 0, []);
  assert.equal(viewModel.mediaState, 'unavailable');
  assert.equal(viewModel.leadMedia, undefined);
  assert.deepEqual(viewModel.allPublicMedia, []);
  assert.deepEqual(viewModel.publicEvidence, []);
  assert.deepEqual(viewModel.process, []);
  assert.deepEqual(viewModel.releases, []);
  assert.deepEqual(viewModel.relations, []);
  assert.equal(viewModel.previousProject, undefined);
  assert.equal(viewModel.nextProject, undefined);
});
