import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_WORK_REGISTER_STATE,
  MAX_QUERY_LENGTH,
} from '../../src/lib/work-register/constants.ts';
import { filterWorkRegisterRecords } from '../../src/lib/work-register/filter.ts';
import {
  parseWorkRegisterState,
  summarizeWorkRegisterState,
} from '../../src/lib/work-register/query-state.ts';
import { sortWorkRegisterRecords } from '../../src/lib/work-register/sort.ts';
import { serializeWorkRegisterState } from '../../src/lib/work-register/url.ts';
import { createWorkRegisterRecords } from '../../src/lib/work-register/view-model.ts';
import { createSyntheticWorkRegisterRecords } from '../support/work-register-fixtures.ts';
import expectedStates from '../fixtures/work-register/expected-states.json' with { type: 'json' };

const record = (overrides = {}) => ({
  id: 'alpha-system',
  title: 'Ångström System',
  shortTitle: 'Ångström',
  summary: 'A careful visual system for quiet technical work.',
  category: 'visual-system',
  categoryLabel: 'Visual system',
  lifecycle: 'approved',
  maintenance: 'active',
  maintenanceLabel: 'Active',
  displayPeriod: '2025',
  evidenceState: 'verified',
  evidenceLabel: 'Verified evidence',
  mediaState: 'unavailable',
  featured: true,
  tags: ['identity'],
  capabilities: ['Design systems'],
  platforms: ['Web'],
  searchText: 'angstrom system a careful visual system for quiet technical work visual system identity design systems web figma',
  defaultIndex: 0,
  dateSortKey: '2025-05-01',
  titleSortKey: 'angstrom system',
  ...overrides,
});

test('parses, bounds, deduplicates, orders, and normalizes known URL state', () => {
  const params = new URLSearchParams();
  params.append('q', `  ÅNGSTRÖM   ${'x'.repeat(MAX_QUERY_LENGTH)}  `);
  params.append('category', 'art');
  params.append('category', 'software');
  params.append('category', 'art');
  params.append('category', 'invalid');
  params.append('maintenance', 'paused');
  params.append('evidence', 'private');
  params.append('sort', 'recent');
  params.append('sort', 'title');
  params.append('unknown', 'ignored');

  const state = parseWorkRegisterState(params);
  assert.equal(state.q.length, MAX_QUERY_LENGTH);
  assert.equal(state.q.startsWith('ÅNGSTRÖM x'), true);
  assert.deepEqual(state.category, ['software', 'art']);
  assert.deepEqual(state.maintenance, ['paused']);
  assert.deepEqual(state.evidence, ['private']);
  assert.equal(state.sort, 'recent');
});

test('empty and invalid URL state restores the canonical defaults', () => {
  assert.deepEqual(
    parseWorkRegisterState(new URLSearchParams('q=%20&sort=random&category=nope')),
    DEFAULT_WORK_REGISTER_STATE,
  );
});

test('serializes the same logical state to one stable repeated-value URL', () => {
  const state = {
    q: '  quiet   work ',
    category: ['art', 'software', 'art'],
    maintenance: ['paused', 'active'],
    evidence: ['reviewed', 'verified'],
    sort: 'title',
  };
  assert.equal(
    serializeWorkRegisterState(state),
    'q=quiet+work&category=software&category=art&maintenance=active&maintenance=paused&evidence=reviewed&evidence=verified&sort=title',
  );
  assert.equal(serializeWorkRegisterState(DEFAULT_WORK_REGISTER_STATE), '');
});

test('filters with AND between groups and OR within a group without mutating records', () => {
  const records = [
    record(),
    record({ id: 'beta-art', title: 'Blue Field', category: 'art', categoryLabel: 'Art', maintenance: 'paused', maintenanceLabel: 'Paused', evidenceState: 'reviewed', evidenceLabel: 'Reviewed evidence', searchText: 'blue field pigment canvas art', defaultIndex: 1 }),
    record({ id: 'gamma-tool', title: 'Console Tool', category: 'software', categoryLabel: 'Software', maintenance: 'active', maintenanceLabel: 'Active', evidenceState: 'verified', evidenceLabel: 'Verified evidence', searchText: 'console tool local first software', defaultIndex: 2 }),
  ];
  const snapshot = structuredClone(records);
  const visible = filterWorkRegisterRecords(records, {
    q: 'system',
    category: ['visual-system', 'software'],
    maintenance: ['active'],
    evidence: ['verified'],
    sort: 'curated',
  });
  assert.deepEqual(visible.map(({ id }) => id), ['alpha-system']);
  assert.deepEqual(records, snapshot);
});

test('search is partial, case-insensitive, whitespace-safe, and diacritic-insensitive', () => {
  const records = [record()];
  for (const query of ['ANGSTROM', '  careful   visual ', 'figma']) {
    assert.equal(filterWorkRegisterRecords(records, { ...DEFAULT_WORK_REGISTER_STATE, q: query }).length, 1);
  }
  assert.equal(filterWorkRegisterRecords(records, { ...DEFAULT_WORK_REGISTER_STATE, q: 'missing' }).length, 0);
});

test('sort modes are stable, deterministic, and non-mutating', () => {
  const records = [
    record({ id: 'beta', title: 'Beta', titleSortKey: 'beta', defaultIndex: 2, dateSortKey: '2024-01-01' }),
    record({ id: 'alpha-two', title: 'Alpha', titleSortKey: 'alpha', defaultIndex: 1, dateSortKey: '2025-01-01' }),
    record({ id: 'alpha-one', title: 'Alpha', titleSortKey: 'alpha', defaultIndex: 0, dateSortKey: '2025-01-01' }),
  ];
  assert.deepEqual(sortWorkRegisterRecords(records, 'curated').map(({ id }) => id), ['alpha-one', 'alpha-two', 'beta']);
  assert.deepEqual(sortWorkRegisterRecords(records, 'recent').map(({ id }) => id), ['alpha-one', 'alpha-two', 'beta']);
  assert.deepEqual(sortWorkRegisterRecords(records, 'title').map(({ id }) => id), ['alpha-one', 'alpha-two', 'beta']);
  assert.deepEqual(records.map(({ id }) => id), ['beta', 'alpha-two', 'alpha-one']);
});

test('summarizes total, visible count, constraints, and non-default sort in plain language', () => {
  const summary = summarizeWorkRegisterState(12, 2, {
    q: 'quiet work',
    category: ['art'],
    maintenance: ['paused'],
    evidence: ['reviewed'],
    sort: 'recent',
  });
  assert.equal(summary.countText, 'Showing 2 of 12 Work records.');
  assert.deepEqual(summary.constraints, [
    'Search: “quiet work”',
    'Category: Art',
    'Maintenance: Paused',
    'Evidence: Reviewed evidence',
    'Sort: Recent',
  ]);
  assert.equal(summary.constrained, true);
});

test('projects only public-safe bundle fields, excludes archives, and defers hrefs', () => {
  const publicBundle = {
    id: 'public-system',
    project: {
      id: 'public-system',
      filePath: 'content:public-system',
      data: {
        schemaVersion: '1.0',
        slug: 'public-system',
        title: 'Public System',
        shortTitle: 'System',
        summary: 'A sufficiently complete public system summary.',
        category: 'technical-system',
        lifecycle: 'approved',
        visibility: 'public',
        maintenance: 'maintenance',
        synthetic: false,
        platforms: ['Local'],
        tools: ['TypeScript'],
        tags: ['retrieval'],
        startedAt: '2024-02-01',
        updatedAt: '2026-01-02',
      },
    },
    companion: {
      id: 'public-system',
      filePath: 'content:public-system',
      data: {
        mediaAvailability: 'available',
        media: [{
          id: 'preview', type: 'image', source: '/assets/public-system.webp', purpose: 'informative',
          rights: 'owned', availability: 'available', alt: 'System overview', width: 1200, height: 800,
        }],
        evidence: [],
        provenance: { sourceNote: 'private note', redactionNote: 'secret' },
        links: [{ public: false, url: 'https://private.example' }],
      },
    },
    publication: { eligible: true, reasons: [] },
    displayPeriod: '2024–2026',
    mediaState: 'available',
    evidenceState: 'reviewed',
    archiveState: false,
    featured: false,
  };
  const archivedBundle = structuredClone(publicBundle);
  archivedBundle.id = 'archived-system';
  archivedBundle.archiveState = true;

  const records = createWorkRegisterRecords([publicBundle, archivedBundle]);
  assert.equal(records.length, 1);
  assert.equal(records[0].id, 'public-system');
  assert.equal(records[0].href, undefined);
  assert.equal(records[0].preview.src, '/assets/public-system.webp');
  assert.equal(JSON.stringify(records).includes('private note'), false);
  assert.equal(JSON.stringify(records).includes('private.example'), false);
});

test('isolated QA datasets cover the required scales without project destinations', () => {
  for (const size of expectedStates.datasetSizes) {
    const records = createSyntheticWorkRegisterRecords(size);
    assert.equal(records.length, size);
    assert.equal(records.every(({ href }) => href === undefined), true);
    assert.equal(new Set(records.map(({ id }) => id)).size, size);
  }
});

test('200-record filter and sort pure logic stays inside the test-machine target', () => {
  const records = createSyntheticWorkRegisterRecords(200);
  const started = performance.now();
  const visible = sortWorkRegisterRecords(filterWorkRegisterRecords(records, {
    q: 'system',
    category: ['software', 'technical-system'],
    maintenance: ['active'],
    evidence: ['verified', 'reviewed'],
    sort: 'recent',
  }), 'recent');
  const duration = performance.now() - started;
  assert.equal(visible.length > 0, true);
  assert.equal(duration <= expectedStates.maxPureLogicMilliseconds, true, `Pure logic took ${duration.toFixed(2)}ms`);
});
