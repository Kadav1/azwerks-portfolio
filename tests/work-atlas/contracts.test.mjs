import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { PROJECT_CATEGORIES, RELATION_TYPES } from '../../src/content-model/enums.ts';
import {
  ATLAS_NODE_HEIGHT,
  ATLAS_NODE_WIDTH,
} from '../../src/lib/work-atlas/atlas-types.ts';
import { ATLAS_REGIONS } from '../../src/lib/work-atlas/atlas-regions.ts';
import { ATLAS_RELATION_LANGUAGE } from '../../src/lib/work-atlas/atlas-relations.ts';
import { createAtlasViewModel } from '../../src/lib/work-atlas/atlas-view-model.ts';
import { createAtlasLayout } from '../../src/lib/work-atlas/atlas-layout.ts';
import { createProjectDetailBundle } from '../support/project-detail-fixtures.ts';
import {
  ATLAS_FIXTURE_SIZES,
  createSyntheticAtlasRecords,
  createSyntheticAtlasRelations,
} from '../support/work-atlas-fixtures.ts';

test('declares exactly five equal-status regions in canonical category order', () => {
  assert.deepEqual(ATLAS_REGIONS.map(({ id }) => id), [...PROJECT_CATEGORIES]);
  assert.equal(new Set(ATLAS_REGIONS.map(({ width }) => width)).size, 1);
  assert.ok(ATLAS_REGIONS.every(({ label, rankMeaning }) => label.length > 0 && rankMeaning === 'none'));
});

test('defines complete textual and non-color language for every relation type', () => {
  assert.deepEqual(Object.keys(ATLAS_RELATION_LANGUAGE), [...RELATION_TYPES]);
  for (const type of RELATION_TYPES) {
    const language = ATLAS_RELATION_LANGUAGE[type];
    assert.ok(language.label.length > 0);
    assert.ok(language.legendSentence.includes(language.label));
    assert.ok(language.indexVerb.length > 0);
    assert.match(language.linePattern, /^(solid|dash|dot|dash-dot|long-dash|double|short-dash)$/);
    assert.equal(language.directional, ['lineage', 'dependency', 'supersedes', 'supports'].includes(type));
    assert.equal(language.arrow, language.directional);
  }
});

test('relation indexes and legend geometry preserve direction without color', async () => {
  const [indexSource, legendSource] = await Promise.all([
    readFile(new URL('../../src/components/work-atlas/AtlasIndex.astro', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/work-atlas/AtlasLegend.astro', import.meta.url), 'utf8'),
  ]);
  assert.match(indexSource, /relation\.directional \? ' → ' : ' — '/);
  assert.match(legendSource, /marker-end=\{language\.arrow/);
  assert.match(legendSource, /atlas-legend-arrow-/);
});

test('keeps one governed base size for every Atlas node', () => {
  assert.equal(ATLAS_NODE_WIDTH, 240);
  assert.equal(ATLAS_NODE_HEIGHT, 88);
});

test('creates deterministic isolated records at every required scale', () => {
  for (const size of ATLAS_FIXTURE_SIZES) {
    const first = createSyntheticAtlasRecords(size);
    const second = createSyntheticAtlasRecords(size);
    assert.equal(first.length, size);
    assert.deepEqual(first, second);
    assert.equal(new Set(first.map(({ id }) => id)).size, size);
    assert.ok(first.every(({ href, searchText }) => href.startsWith('/work/') && searchText.length > 0));
  }
});

test('isolated relations cover direction without inventing endpoints', () => {
  const records = createSyntheticAtlasRecords(10);
  const relations = createSyntheticAtlasRelations(records, 7);
  const ids = new Set(records.map(({ id }) => id));
  assert.deepEqual(relations.map(({ type }) => type), [...RELATION_TYPES]);
  assert.ok(relations.every(({ sourceId, targetId }) => ids.has(sourceId) && ids.has(targetId) && sourceId !== targetId));
});

test('projects the exact routable Register set through shared route, relation, and world contracts', () => {
  const supports = {
    schemaVersion: '1.0', id: 'atlas-supports', from: 'atlas-source', to: 'atlas-target', type: 'supports', direction: 'directed',
    summary: 'The source supports the target.', visibility: 'public', synthetic: false,
  };
  const unsafe = {
    schemaVersion: '1.0', id: 'atlas-unsafe', from: 'atlas-source', to: 'atlas-private', type: 'related', direction: 'undirected',
    summary: 'This unsafe endpoint must not enter the Atlas.', visibility: 'public', synthetic: false,
  };
  const source = createProjectDetailBundle('atlas-source', 'software', { relations: { outgoing: [supports], undirected: [unsafe] } });
  const target = createProjectDetailBundle('atlas-target', 'art', { relations: { incoming: [supports] } });
  const archived = createProjectDetailBundle('atlas-archived', 'limited-media', { project: { lifecycle: 'archived' } });
  const privateRecord = createProjectDetailBundle('atlas-private', 'visual-system', {
    project: { visibility: 'private' }, publication: { eligible: false, reasons: ['visibility'] }, relations: { undirected: [unsafe] },
  });
  const unlisted = createProjectDetailBundle('atlas-unlisted', 'visual-system', {
    project: { visibility: 'unlisted' }, publication: { eligible: false, reasons: ['visibility'] },
  });
  const synthetic = createProjectDetailBundle('atlas-synthetic', 'technical-system', {
    project: { synthetic: true }, publication: { eligible: false, reasons: ['synthetic'] },
  });
  const ineligible = createProjectDetailBundle('atlas-ineligible', 'software', {
    publication: { eligible: false, reasons: ['lifecycle'] },
  });
  const unroutable = createProjectDetailBundle('atlas-unroutable', 'software', { project: { slug: 'Invalid Slug' } });
  const model = createAtlasViewModel([source, target, archived, privateRecord, unlisted, synthetic, ineligible, unroutable]);

  assert.deepEqual(model.records.map(({ id }) => id), ['atlas-source', 'atlas-target']);
  assert.deepEqual(model.records.map(({ href }) => href), ['/work/atlas-source/', '/work/atlas-target/']);
  assert.deepEqual(model.records.map(({ world }) => world), ['software', 'art']);
  assert.deepEqual(model.relations, [{
    id: 'atlas-supports', sourceId: 'atlas-source', targetId: 'atlas-target', type: 'supports', label: 'Supports', directional: true,
    summary: 'The source supports the target.',
  }]);
  assert.deepEqual(model.excluded, {
    archived: 1, synthetic: 1, private: 1, unlisted: 1, ineligible: 1, unroutable: 1, unsafeRelation: 1,
  });
  const serialized = JSON.stringify(model);
  for (const forbidden of ['filePath', 'companion', 'reviewedBy', 'sourceNote', 'rightsNote', 'redactionNote', '/private/']) {
    assert.equal(serialized.includes(forbidden), false, `Leaked private field: ${forbidden}`);
  }
});

test('lays out zero, one, sparse, and dense sets deterministically without overlap', () => {
  for (const size of ATLAS_FIXTURE_SIZES) {
    const records = createSyntheticAtlasRecords(size);
    const relations = createSyntheticAtlasRelations(records, Math.min(Math.max(size - 1, 0), 140));
    const first = createAtlasLayout(records, relations);
    const second = createAtlasLayout(structuredClone(records), structuredClone(relations));
    assert.equal(JSON.stringify(first), JSON.stringify(second));
    assert.equal(first.nodes.length, size);
    assert.equal(first.nodeWidth, ATLAS_NODE_WIDTH);
    assert.equal(first.nodeHeight, ATLAS_NODE_HEIGHT);
    assert.equal(first.regions.length, 5);
    assert.ok(first.width > 0 && first.height > 0);
    for (const node of first.nodes) {
      assert.ok(node.x >= 0 && node.x + first.nodeWidth <= first.width);
      assert.ok(node.y >= 0 && node.y + first.nodeHeight <= first.height);
      assert.equal(records.find(({ id }) => id === node.id).category, node.regionId);
    }
    for (let index = 0; index < first.nodes.length; index += 1) {
      const left = first.nodes[index];
      for (const right of first.nodes.slice(index + 1)) {
        const overlaps = left.x < right.x + first.nodeWidth
          && left.x + first.nodeWidth > right.x
          && left.y < right.y + first.nodeHeight
          && left.y + first.nodeHeight > right.y;
        assert.equal(overlaps, false, `${left.id} overlaps ${right.id}`);
      }
    }
    assert.equal(first.edgePolicy, size >= 50 ? 'focused' : 'all');
  }
});

test('derives safe deterministic edge paths from explicit endpoints only', () => {
  const records = createSyntheticAtlasRecords(10);
  const relations = createSyntheticAtlasRelations(records, 7);
  const layout = createAtlasLayout(records, relations);
  const nodes = new Map(layout.nodes.map((node) => [node.id, node]));
  assert.equal(layout.edges.length, relations.length);
  for (const edge of layout.edges) {
    assert.match(edge.path, /^M \d+(?:\.\d+)? \d+(?:\.\d+)? C /);
    assert.ok(nodes.has(edge.sourceId) && nodes.has(edge.targetId));
    assert.equal(edge.directional, ATLAS_RELATION_LANGUAGE[edge.type].directional);
  }
  assert.throws(
    () => createAtlasLayout(records, [{ ...relations[0], id: 'unsafe', targetId: 'missing' }]),
    /WORK_ATLAS_RELATION_ENDPOINT/,
  );
});

test('rejects duplicate project and relation identifiers', () => {
  const records = createSyntheticAtlasRecords(2);
  const relations = createSyntheticAtlasRelations(records, 1);
  assert.throws(() => createAtlasLayout([...records, records[0]], relations), /WORK_ATLAS_NODE_DUPLICATE/);
  assert.throws(() => createAtlasLayout(records, [...relations, relations[0]]), /WORK_ATLAS_EDGE_DUPLICATE/);
});
