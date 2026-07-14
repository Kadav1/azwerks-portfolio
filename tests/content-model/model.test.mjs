import test from 'node:test';
import assert from 'node:assert/strict';

import { sortProjectBundles } from '../../src/content-model/merge.ts';
import { evaluatePublicationEligibility } from '../../src/content-model/publication.ts';
import { validateRelationSet } from '../../src/content-model/relations.ts';
import { validatePageNavigation } from '../../src/content-model/validation.ts';

test('rejects self relations', () => {
  assert.throws(
    () => validateRelationSet(
      [
        {
          schemaVersion: '1.0',
          id: 'self',
          from: 'alpha',
          to: 'alpha',
          type: 'related',
          direction: 'undirected',
          summary: 'A meaningful synthetic rationale for a prohibited edge.',
          visibility: 'private',
          synthetic: true,
        },
      ],
      new Map([['alpha', { visibility: 'private' }]]),
    ),
    { code: 'CONTENT_RELATION_SELF' },
  );
});

test('fixtures are never publication eligible', () => {
  assert.equal(
    evaluatePublicationEligibility({ project: { synthetic: true } }).eligible,
    false,
  );
});

test('bundle sorting uses ID as its final stable tie-breaker', () => {
  const input = [
    { id: 'beta', featured: false },
    { id: 'alpha', featured: false },
  ];

  assert.deepEqual(
    sortProjectBundles(input).map(({ id }) => id),
    ['alpha', 'beta'],
  );
});

test('rejects reverse duplicates for undirected relations', () => {
  const projects = new Map([
    ['alpha', { visibility: 'private' }],
    ['beta', { visibility: 'private' }],
  ]);
  const common = {
    schemaVersion: '1.0',
    type: 'family',
    direction: 'undirected',
    summary: 'The fictional records share a deliberate synthetic family rationale.',
    visibility: 'private',
    synthetic: true,
  };

  assert.throws(
    () => validateRelationSet([
      { ...common, id: 'alpha-beta', from: 'alpha', to: 'beta' },
      { ...common, id: 'beta-alpha', from: 'beta', to: 'alpha' },
    ], projects),
    { code: 'CONTENT_RELATION_DUPLICATE' },
  );
});

test('rejects public navigation to a private page', () => {
  const pages = [{
    id: 'about',
    filePath: '/fixture/about.md',
    data: {
      schemaVersion: '1.0',
      slug: 'about',
      title: 'Synthetic About',
      summary: 'A sufficiently descriptive synthetic page summary for validation.',
      visibility: 'private',
      navigation: true,
      order: 1,
      noindex: true,
      synthetic: true,
    },
  }];
  const navigation = [{
    id: 'about',
    label: 'About',
    kind: 'page',
    target: '/about/',
    order: 1,
    visibility: 'public',
    synthetic: false,
  }];

  assert.throws(
    () => validatePageNavigation(pages, navigation),
    { code: 'CONTENT_NAVIGATION_INVALID' },
  );
});
