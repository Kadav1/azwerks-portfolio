import test from 'node:test';
import assert from 'node:assert/strict';

import {
  fixtureProjectSchema,
  projectDataRawSchema,
  projectSchema,
} from '../../src/content-model/schemas.ts';

const software = {
  schemaVersion: '1.0',
  slug: 'synthetic-console',
  title: 'Synthetic Console',
  summary: 'A fictional local console for deterministic workflow demonstrations.',
  category: 'software',
  lifecycle: 'reviewed',
  visibility: 'private',
  maintenance: 'active',
  synthetic: true,
  noindex: true,
  capabilities: ['deterministic workflow'],
  platforms: ['local web'],
};

test('accepts a strict synthetic software project', () => {
  assert.equal(fixtureProjectSchema.parse(software).slug, 'synthetic-console');
});

test('rejects unknown project fields', () => {
  assert.equal(projectSchema.safeParse({ ...software, mystery: true }).success, false);
});

test('rejects public fixtures', () => {
  assert.equal(
    fixtureProjectSchema.safeParse({ ...software, visibility: 'public' }).success,
    false,
  );
});

test('rejects impossible project date order', () => {
  assert.equal(
    projectSchema.safeParse({
      ...software,
      startedAt: '2026-04-01',
      updatedAt: '2026-03-01',
    }).success,
    false,
  );
});

test('requires verified evidence artifacts and complete metrics', () => {
  const result = projectDataRawSchema.safeParse({
    schemaVersion: '1.0',
    project: 'synthetic-console',
    mediaAvailability: 'unavailable',
    sourceAvailability: 'private',
    rightsStatus: 'synthetic',
    artworkAvailability: 'not-applicable',
    layoutProfile: 'technical',
    themeProfile: 'system',
    motionProfile: 'none',
    links: [],
    media: [],
    evidence: [
      {
        id: 'metric',
        type: 'metric',
        title: 'Synthetic measure',
        trust: 'verified',
        availability: 'public',
      },
    ],
    process: [],
    limitations: [
      { id: 'limit', summary: 'Synthetic fixture evidence only.', status: 'known' },
    ],
    releases: [],
    provenance: {
      owner: 'Synthetic fixture owner',
      authorship: 'synthetic',
      sourceAvailability: 'private',
      rightsStatus: 'synthetic',
      reviewStatus: 'reviewed',
    },
  });

  assert.equal(result.success, false);
});

test('requires informative media alt text', () => {
  const result = projectDataRawSchema.safeParse({
    schemaVersion: '1.0',
    project: 'synthetic-console',
    mediaAvailability: 'available',
    sourceAvailability: 'private',
    rightsStatus: 'synthetic',
    artworkAvailability: 'not-applicable',
    layoutProfile: 'technical',
    themeProfile: 'system',
    motionProfile: 'none',
    links: [],
    media: [{
      id: 'interface',
      type: 'interface',
      source: '../assets/interface.svg',
      purpose: 'informative',
      rights: 'synthetic',
      availability: 'available',
      width: 640,
      height: 360,
    }],
    evidence: [],
    process: [],
    limitations: [{ id: 'limit', summary: 'Synthetic fixture only.', status: 'known' }],
    releases: [],
    provenance: {
      owner: 'Synthetic fixture owner',
      authorship: 'synthetic',
      sourceAvailability: 'private',
      rightsStatus: 'synthetic',
      reviewStatus: 'reviewed',
    },
  });

  assert.equal(result.success, false);
});
