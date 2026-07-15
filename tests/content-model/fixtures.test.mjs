import test from 'node:test';
import assert from 'node:assert/strict';

import { loadFixtureFoundation } from '../../src/content-model/fixture-contract.ts';

test('loads the frozen fixture corpus with zero public eligibility', async () => {
  const result = await loadFixtureFoundation();

  assert.equal(result.projects.length, 10);
  assert.equal(result.companions.length, 10);
  assert.equal(result.publicationEligible.length, 0);
  assert.deepEqual(
    new Set(result.projects.map(({ data }) => data.category)),
    new Set([
      'software',
      'visual-system',
      'art',
      'technical-system',
      'limited-media',
    ]),
  );
});

test('fixture graph covers every required relation type', async () => {
  const result = await loadFixtureFoundation();
  const relationTypes = new Set(result.relations.map(({ data }) => data.type));

  for (const type of ['lineage', 'dependency', 'supports', 'shared-method', 'family']) {
    assert.ok(relationTypes.has(type), `missing relation type ${type}`);
  }
});

test('fixture pages and navigation remain private and synthetic', async () => {
  const result = await loadFixtureFoundation();

  assert.ok(result.pages.every(({ data }) => data.visibility === 'private' && data.synthetic));
  assert.ok(result.navigation.every(({ visibility, synthetic }) => visibility === 'private' && synthetic));
});
