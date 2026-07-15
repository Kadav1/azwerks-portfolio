import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { PROJECT_CATEGORIES, LIFECYCLES, VISIBILITIES } from '../src/content-model/enums.ts';
import { ContentModelError, contentError } from '../src/content-model/error-codes.ts';
import { sortProjectBundles } from '../src/content-model/merge.ts';
import { validateRelationSet } from '../src/content-model/relations.ts';
import {
  fixtureProjectSchema,
  navigationFileSchema,
  projectDataRawSchema,
  projectSchema,
} from '../src/content-model/schemas.ts';
import { assertSafeString, parseFlatFrontmatter } from '../src/content-model/source.ts';
import {
  assertProductionHelperIsolation,
  validateContentFoundation,
} from '../src/content-model/validation.ts';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const INVALID_ROOT = join(ROOT, 'tests', 'fixtures', 'content-invalid');

const listFiles = async (directory) => {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(path));
    else output.push(path);
  }
  return output.sort();
};

const hashFiles = async (files) => Object.fromEntries(await Promise.all(files.map(async (file) => [
  file,
  createHash('sha256').update(await readFile(file)).digest('hex'),
])));

const validProject = {
  schemaVersion: '1.0',
  slug: 'valid-project',
  title: 'Valid Synthetic Project',
  summary: 'A fictional valid project used only as a negative-harness baseline.',
  category: 'software',
  lifecycle: 'reviewed',
  visibility: 'private',
  maintenance: 'active',
  synthetic: true,
  noindex: true,
  capabilities: ['fixture capability'],
  platforms: ['fixture platform'],
};

const validCompanion = {
  schemaVersion: '1.0',
  project: 'valid-project',
  mediaAvailability: 'unavailable',
  sourceAvailability: 'private',
  rightsStatus: 'synthetic',
  artworkAvailability: 'not-applicable',
  layoutProfile: 'technical',
  themeProfile: 'system',
  motionProfile: 'none',
  links: [],
  media: [],
  evidence: [{ id: 'review', type: 'inspection', title: 'Fixture review', trust: 'reviewed', availability: 'private' }],
  process: [],
  limitations: [{ id: 'fixture-only', summary: 'This is a fictional fixture limitation.', status: 'accepted' }],
  releases: [],
  provenance: {
    owner: 'Synthetic fixture owner',
    authorship: 'Repository-authored fictional content',
    sourceAvailability: 'private',
    rightsStatus: 'synthetic',
    reviewStatus: 'reviewed',
  },
};

const projectEntry = (data = validProject, id = data.slug, fileName = `${id}.md`) => ({
  id,
  data: fixtureProjectSchema.parse(data),
  body: 'Synthetic body.',
  filePath: join('/fixture', fileName),
});

const companionEntry = (data = validCompanion, id = data.project, fileName = `${id}.json`) => ({
  id,
  data: projectDataRawSchema.parse(data),
  filePath: join('/fixture', fileName),
});

const relation = (overrides = {}) => ({
  schemaVersion: '1.0',
  id: 'valid-relation',
  from: 'alpha',
  to: 'beta',
  type: 'related',
  direction: 'undirected',
  summary: 'A meaningful fictional relation used only by the negative harness.',
  visibility: 'private',
  synthetic: true,
  ...overrides,
});

const parseProjectWithCode = (data) => {
  if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    contentError('CONTENT_SLUG_INVALID', 'Invalid project slug.');
  }
  if (!PROJECT_CATEGORIES.includes(data.category)) contentError('CONTENT_CATEGORY_INVALID', 'Unknown project category.');
  if (!LIFECYCLES.includes(data.lifecycle)) contentError('CONTENT_LIFECYCLE_INVALID', 'Unknown lifecycle.');
  if (!VISIBILITIES.includes(data.visibility)) contentError('CONTENT_VISIBILITY_INVALID', 'Unknown visibility.');
  const result = projectSchema.safeParse(data);
  if (!result.success) {
    const paths = result.error.issues.map(({ path }) => path.join('.'));
    if (paths.some((path) => ['startedAt', 'updatedAt', 'releasedAt', 'scheduled', 'year'].includes(path))) {
      contentError('CONTENT_DATE_INVALID', 'Invalid project date contract.');
    }
    contentError('CONTENT_CATEGORY_REQUIREMENT', 'Project category requirement failed.');
  }
  return result.data;
};

const parseCompanionWithCode = (data) => {
  if (!['editorial', 'technical', 'media-led', 'specimen-led', 'document-led'].includes(data.layoutProfile) ||
      !['system', 'dark', 'light', 'neutral'].includes(data.themeProfile) ||
      !['none', 'reduced', 'system'].includes(data.motionProfile) ||
      Object.hasOwn(data, 'functionalThemeOverride')) {
    contentError('CONTENT_PROFILE_INVALID', 'Unknown or functional profile override.');
  }
  const mediaIds = new Set();
  for (const media of data.media ?? []) {
    if (mediaIds.has(media.id)) contentError('CONTENT_MEDIA_DUPLICATE', 'Duplicate media id.');
    mediaIds.add(media.id);
    if (media.availability === 'available' && media.purpose !== 'decorative' && !media.alt) {
      contentError('CONTENT_MEDIA_ALT_MISSING', 'Informative media requires alt.');
    }
    if (media.availability === 'available' && media.rights === 'unknown') {
      contentError('CONTENT_RIGHTS_UNKNOWN', 'Public media rights cannot be unknown.');
    }
    if (media.availability === 'available' && ['video', 'audio'].includes(media.type) && !media.transcript) {
      contentError('CONTENT_MEDIA_TRANSCRIPT_MISSING', 'Audio and video require a transcript.');
    }
  }
  const evidenceIds = new Set();
  for (const evidence of data.evidence ?? []) {
    if (evidenceIds.has(evidence.id)) contentError('CONTENT_EVIDENCE_DUPLICATE', 'Duplicate evidence id.');
    evidenceIds.add(evidence.id);
    if (evidence.trust === 'verified' && !evidence.artifact) {
      contentError('CONTENT_EVIDENCE_UNSUPPORTED', 'Verified evidence requires an artifact.');
    }
    if (evidence.type === 'metric' && (!evidence.method || !evidence.unit || !evidence.artifact)) {
      contentError('CONTENT_METRIC_INCOMPLETE', 'Metric contract is incomplete.');
    }
  }
  const orders = new Set();
  for (const process of data.process ?? []) {
    if (orders.has(process.order)) contentError('CONTENT_ORDER_DUPLICATE', 'Duplicate process order.');
    orders.add(process.order);
  }
  if ((data.limitations ?? []).some((limitation) => !limitation.status)) {
    contentError('CONTENT_LIMITATION_STATUS_MISSING', 'Limitation status is required.');
  }
  const result = projectDataRawSchema.safeParse(data);
  if (!result.success) contentError('CONTENT_SCHEMA_INVALID', 'Companion schema is invalid.');
  return result.data;
};

const executeCase = async (testCase) => {
  switch (testCase.kind) {
    case 'invalid-slug':
      parseProjectWithCode({ ...validProject, slug: 'Invalid Slug' });
      break;
    case 'filename-mismatch':
      validateContentFoundation({ projects: [projectEntry(validProject, 'valid-project', 'different.md')], companions: [companionEntry()], relations: [], fixture: true });
      break;
    case 'unknown-category':
      parseProjectWithCode({ ...validProject, category: 'unknown' });
      break;
    case 'missing-category-requirement':
      parseProjectWithCode({ ...validProject, capabilities: undefined });
      break;
    case 'nested-frontmatter':
      parseFlatFrontmatter('---\nseo:\n  title: Hidden\n---\nBody', 'nested.md');
      break;
    case 'invalid-lifecycle':
      parseProjectWithCode({ ...validProject, lifecycle: 'verified' });
      break;
    case 'invalid-visibility':
      parseProjectWithCode({ ...validProject, visibility: 'hidden' });
      break;
    case 'impossible-dates':
      parseProjectWithCode({ ...validProject, startedAt: '2026-06-01', updatedAt: '2026-05-01' });
      break;
    case 'unsupported-future-release':
      parseProjectWithCode({ ...validProject, releasedAt: '2099-01-01' });
      break;
    case 'public-fixture': {
      const result = fixtureProjectSchema.safeParse({ ...validProject, visibility: 'public' });
      if (!result.success) contentError('CONTENT_FIXTURE_PUBLIC', 'Fixture cannot be public.');
      break;
    }
    case 'missing-companion':
      validateContentFoundation({ projects: [projectEntry()], companions: [], relations: [], fixture: true });
      break;
    case 'duplicate-companion':
      validateContentFoundation({ projects: [projectEntry()], companions: [companionEntry(), companionEntry(validCompanion, 'second', 'second.json')], relations: [], fixture: true });
      break;
    case 'orphan-companion':
      validateContentFoundation({ projects: [projectEntry()], companions: [companionEntry({ ...validCompanion, project: 'ghost' }, 'ghost')], relations: [], fixture: true });
      break;
    case 'local-path':
      assertSafeString('/home/private/project.png', testCase.id);
      break;
    case 'localhost-url':
      assertSafeString('http://localhost:4321/private', testCase.id);
      break;
    case 'private-ip-url':
      assertSafeString('http://192.168.1.10/private', testCase.id);
      break;
    case 'url-credentials':
      assertSafeString('https://user:secret@example.invalid', testCase.id);
      break;
    case 'javascript-url':
      assertSafeString('javascript:alert(1)', testCase.id);
      break;
    case 'media-alt':
      parseCompanionWithCode({ ...validCompanion, mediaAvailability: 'available', media: [{ id: 'media', type: 'image', source: 'assets/test.svg', purpose: 'informative', rights: 'synthetic', availability: 'available', width: 10, height: 10 }] });
      break;
    case 'media-rights':
      parseCompanionWithCode({ ...validCompanion, mediaAvailability: 'available', media: [{ id: 'media', type: 'image', source: 'assets/test.svg', purpose: 'informative', rights: 'unknown', availability: 'available', alt: 'Synthetic item.', width: 10, height: 10 }] });
      break;
    case 'media-transcript':
      parseCompanionWithCode({ ...validCompanion, mediaAvailability: 'available', media: [{ id: 'media', type: 'audio', source: 'assets/test.audio', purpose: 'informative', rights: 'synthetic', availability: 'available', alt: 'Synthetic audio.', width: 10, height: 10 }] });
      break;
    case 'evidence-artifact':
      parseCompanionWithCode({ ...validCompanion, evidence: [{ id: 'verified', type: 'test', title: 'Verified fixture', trust: 'verified', availability: 'private' }] });
      break;
    case 'metric-incomplete':
      parseCompanionWithCode({ ...validCompanion, evidence: [{ id: 'metric', type: 'metric', title: 'Metric fixture', trust: 'reviewed', availability: 'private' }] });
      break;
    case 'duplicate-media': {
      const media = { id: 'media', type: 'image', source: 'assets/test.svg', purpose: 'informative', rights: 'synthetic', availability: 'available', alt: 'Synthetic item.', width: 10, height: 10 };
      parseCompanionWithCode({ ...validCompanion, mediaAvailability: 'available', media: [media, media] });
      break;
    }
    case 'duplicate-evidence': {
      const evidence = { id: 'evidence', type: 'inspection', title: 'Synthetic evidence', trust: 'reviewed', availability: 'private' };
      parseCompanionWithCode({ ...validCompanion, evidence: [evidence, evidence] });
      break;
    }
    case 'duplicate-process-order':
      parseCompanionWithCode({ ...validCompanion, process: [
        { id: 'one', title: 'One', summary: 'Synthetic first process step.', order: 1 },
        { id: 'two', title: 'Two', summary: 'Synthetic second process step.', order: 1 },
      ] });
      break;
    case 'limitation-status':
      parseCompanionWithCode({ ...validCompanion, limitations: [{ id: 'missing', summary: 'Synthetic missing limitation status.' }] });
      break;
    case 'unknown-profile':
      parseCompanionWithCode({ ...validCompanion, layoutProfile: 'dashboard' });
      break;
    case 'functional-theme-override':
      parseCompanionWithCode({ ...validCompanion, functionalThemeOverride: { focus: 'hidden' } });
      break;
    case 'relation-orphan':
      validateRelationSet([relation({ to: 'ghost' })], new Map([['alpha', { visibility: 'private' }]]));
      break;
    case 'relation-self':
      validateRelationSet([relation({ from: 'alpha', to: 'alpha' })], new Map([['alpha', { visibility: 'private' }]]));
      break;
    case 'relation-duplicate':
      validateRelationSet([
        relation({ id: 'one' }),
        relation({ id: 'two', from: 'beta', to: 'alpha' }),
      ], new Map([['alpha', { visibility: 'private' }], ['beta', { visibility: 'private' }]]));
      break;
    case 'relation-public-private':
      validateRelationSet([relation({ visibility: 'public' })], new Map([['alpha', { visibility: 'public' }], ['beta', { visibility: 'private' }]]));
      break;
    case 'navigation-order': {
      const result = navigationFileSchema.safeParse([
        { id: 'one', label: 'One', kind: 'route', target: '/one/', order: 1, visibility: 'private', synthetic: true },
        { id: 'two', label: 'Two', kind: 'route', target: '/two/', order: 1, visibility: 'private', synthetic: true },
      ]);
      if (!result.success) contentError('CONTENT_ORDER_DUPLICATE', 'Navigation order must be unique.');
      break;
    }
    case 'fixture-import':
      assertProductionHelperIsolation("import './fixture-contract.ts';");
      break;
    case 'ordering-expectation': {
      const actual = sortProjectBundles([{ id: 'beta' }, { id: 'alpha' }]).map(({ id }) => id);
      if (JSON.stringify(actual) !== JSON.stringify(['beta', 'alpha'])) {
        contentError('CONTENT_SORT_NONDETERMINISTIC', 'Invalid ordering expectation rejected.');
      }
      break;
    }
    default:
      throw new Error(`Unknown invalid fixture kind: ${testCase.kind}`);
  }
};

export const runInvalidFixtureCases = async ({ quiet = false } = {}) => {
  const files = (await listFiles(INVALID_ROOT)).filter((file) => file.endsWith('.json'));
  const before = await hashFiles(files);
  const cases = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(file, 'utf8'))))).flat();
  const results = [];

  try {
    for (const testCase of cases.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)) {
      let actualCode = 'NO_ERROR';
      try {
        await executeCase(testCase);
      } catch (error) {
        actualCode = error instanceof ContentModelError ? error.code : 'UNMAPPED_ERROR';
      }
      results.push({ id: testCase.id, expectedCode: testCase.expectedCode, actualCode });
    }
  } finally {
    const after = await hashFiles(files);
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      throw new Error('Invalid fixture sources changed during the negative test run.');
    }
  }

  const failures = results.filter(({ expectedCode, actualCode }) => expectedCode !== actualCode);
  if (failures.length > 0) {
    throw new Error(`Invalid fixture contract mismatch:\n${JSON.stringify(failures, null, 2)}`);
  }
  if (!quiet) console.log(`Invalid content fixtures passed: ${results.length} cases with stable error codes.`);
  return results;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runInvalidFixtureCases();
}
