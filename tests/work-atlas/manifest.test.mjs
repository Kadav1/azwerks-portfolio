import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createWorkAtlasManifest,
  serializeWorkAtlasManifest,
} from '../../src/lib/work-atlas/atlas-manifest.ts';
import { createSyntheticAtlasRecords, createSyntheticAtlasRelations } from '../support/work-atlas-fixtures.ts';

const excluded = Object.freeze({
  archived: 0, synthetic: 0, private: 0, unlisted: 0, ineligible: 0, unroutable: 0, unsafeRelation: 0,
});

test('creates one deterministic valid zero-project manifest without volatile or private data', () => {
  const viewModel = { records: [], relations: [], excluded };
  const first = createWorkAtlasManifest(viewModel);
  const second = createWorkAtlasManifest(structuredClone(viewModel));
  const bytes = serializeWorkAtlasManifest(first);
  assert.equal(bytes, serializeWorkAtlasManifest(second));
  assert.equal(first.publicNodeCount, 0);
  assert.equal(first.publicRelationCount, 0);
  assert.deepEqual(first.nodes, []);
  assert.deepEqual(first.edges, []);
  assert.equal(first.regions.length, 5);
  assert.match(first.layoutPolicyHash, /^[a-f0-9]{64}$/);
  assert.match(first.publicDataHash, /^[a-f0-9]{64}$/);
  assert.match(first.generatedManifestHash, /^[a-f0-9]{64}$/);
  for (const forbidden of ['timestamp', 'filePath', 'companion', 'reviewedBy', 'fixture', '/private/']) {
    assert.equal(bytes.includes(forbidden), false, `Manifest contains ${forbidden}`);
  }
});

test('keeps the 200-record isolated manifest within the uncompressed budget', () => {
  const records = createSyntheticAtlasRecords(200);
  const relations = createSyntheticAtlasRelations(records, 140);
  const manifest = createWorkAtlasManifest({ records, relations, excluded });
  const bytes = serializeWorkAtlasManifest(manifest);
  assert.equal(manifest.publicNodeCount, 200);
  assert.equal(manifest.publicRelationCount, 140);
  assert.equal(manifest.edgePolicy, 'focused');
  assert.ok(Buffer.byteLength(bytes) <= 250_000, `Manifest is ${Buffer.byteLength(bytes)} bytes`);
});
