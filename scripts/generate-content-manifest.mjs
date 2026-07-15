import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { CONTENT_ENUMS, LIFECYCLES, PROJECT_CATEGORIES, RELATION_TYPES } from '../src/content-model/enums.ts';
import { loadFixtureFoundation } from '../src/content-model/fixture-contract.ts';
import { compareAscii } from '../src/content-model/source.ts';
import { runInvalidFixtureCases } from './test-invalid-content-fixtures.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DEFAULT_MANIFEST = join(ROOT, 'src', 'content-model', 'generated', 'content-model-manifest.json');
const DEFAULT_VALID_SUMMARY = join(ROOT, 'tests', 'fixtures', 'content-expected', 'valid-summary.json');
const DEFAULT_INVALID_SUMMARY = join(ROOT, 'tests', 'fixtures', 'content-expected', 'invalid-summary.json');
const GENERATOR_VERSION = '1.0.0';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const sortObject = (value) => {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .sort(([left], [right]) => compareAscii(left, right))
      .map(([key, child]) => [key, sortObject(child)]));
  }
  return value;
};

const stableJson = (value) => `${JSON.stringify(sortObject(value), null, 2)}\n`;

const listFiles = async (directory, predicate = () => true) => {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(path, predicate));
    else if (predicate(path)) output.push(path);
  }
  return output.sort(compareAscii);
};

const hashPaths = async (paths) => Object.fromEntries(await Promise.all(
  [...paths].sort(compareAscii).map(async (path) => [
    relative(ROOT, path).replaceAll('\\', '/'),
    sha256(await readFile(path)),
  ]),
));

const initializedCounts = (values) => Object.fromEntries(values.map((value) => [value, 0]));

const countBy = (values, keys, selector) => {
  const counts = initializedCounts(keys);
  for (const value of values) counts[selector(value)] += 1;
  return counts;
};

export const buildContentArtifacts = async () => {
  const foundation = await loadFixtureFoundation();
  const invalidResults = await runInvalidFixtureCases({ quiet: true });
  const schemaPaths = [
    'enums.ts',
    'error-codes.ts',
    'schemas.ts',
    'types.ts',
    'source.ts',
    'relations.ts',
    'publication.ts',
    'merge.ts',
    'validation.ts',
  ].map((file) => join(ROOT, 'src', 'content-model', file));
  const fixturePaths = await listFiles(join(ROOT, 'src', 'content', 'fixtures'));
  const invalidPaths = await listFiles(join(ROOT, 'tests', 'fixtures', 'content-invalid'), (path) => path.endsWith('.json'));
  const sourcePaths = [
    join(ROOT, 'src', 'content.config.ts'),
    ...schemaPaths,
    ...fixturePaths,
    ...invalidPaths,
  ];
  const schemaHashes = await hashPaths(schemaPaths);
  const sourceHashes = await hashPaths(sourcePaths);
  const contentSourceHash = sha256(stableJson(sourceHashes));
  const categoryCounts = countBy(foundation.projects, PROJECT_CATEGORIES, ({ data }) => data.category);
  const lifecycleCounts = countBy(foundation.projects, LIFECYCLES, ({ data }) => data.lifecycle);
  const relationCounts = countBy(foundation.relations, RELATION_TYPES, ({ data }) => data.type);
  const mediaStateCounts = foundation.bundles.reduce((counts, { mediaState }) => ({
    ...counts,
    [mediaState]: (counts[mediaState] ?? 0) + 1,
  }), {});
  const evidenceStateCounts = foundation.bundles.reduce((counts, { evidenceState }) => ({
    ...counts,
    [evidenceState]: (counts[evidenceState] ?? 0) + 1,
  }), {});

  const validSummary = {
    fixtureVersion: 'synthetic-content-fixtures-v0.1',
    contentManifestSourceHash: contentSourceHash,
    validProjectCount: foundation.projects.length,
    companionCount: foundation.companions.length,
    relationCount: foundation.relations.length,
    sitePageCount: foundation.pages.length,
    navigationItemCount: foundation.navigation.length,
    categoryCounts,
    lifecycleCounts,
    relationCounts,
    mediaStateCounts,
    evidenceStateCounts,
    stableIds: foundation.projects.map(({ id }) => id).sort(compareAscii),
    publicationEligibleCount: foundation.publicationEligible.length,
  };
  const invalidSummary = {
    fixtureVersion: 'synthetic-content-fixtures-v0.1',
    contentManifestSourceHash: contentSourceHash,
    invalidCaseCount: invalidResults.length,
    cases: invalidResults.map(({ id, expectedCode }) => ({ id, errorCode: expectedCode })),
    errorCodeCounts: invalidResults.reduce((counts, { expectedCode }) => ({
      ...counts,
      [expectedCode]: (counts[expectedCode] ?? 0) + 1,
    }), {}),
  };
  const validSummaryBytes = stableJson(validSummary);
  const invalidSummaryBytes = stableJson(invalidSummary);
  const generatorHash = sha256(await readFile(fileURLToPath(import.meta.url)));
  const manifest = {
    schemaVersion: '1.0',
    modelVersion: '1.0.0',
    validatorVersion: '1.0.0',
    generatorVersion: GENERATOR_VERSION,
    generatorHash,
    fixtureVersion: 'synthetic-content-fixtures-v0.1',
    collections: [
      'projects',
      'projectData',
      'projectRelations',
      'sitePages',
      'navigation',
      'fixtureProjects',
      'fixtureProjectData',
      'fixtureProjectRelations',
      'fixtureSitePages',
      'fixtureNavigation',
    ],
    schemaHashes,
    contentSourceHash,
    sourceFileCount: Object.keys(sourceHashes).length,
    enums: CONTENT_ENUMS,
    validFixtureCount: foundation.projects.length,
    invalidFixtureCount: invalidResults.length,
    categoryCounts,
    lifecycleCounts,
    relationCounts,
    publicationEligibleFixtureCount: foundation.publicationEligible.length,
    generatedFileHashes: {
      'tests/fixtures/content-expected/valid-summary.json': sha256(validSummaryBytes),
      'tests/fixtures/content-expected/invalid-summary.json': sha256(invalidSummaryBytes),
    },
    timestampPolicy: 'No generated timestamp; identical repository sources produce identical bytes.',
  };

  return {
    manifest,
    manifestBytes: stableJson(manifest),
    validSummary,
    validSummaryBytes,
    invalidSummary,
    invalidSummaryBytes,
  };
};

export const generateContentManifest = async ({
  outputPath = DEFAULT_MANIFEST,
  writeSupportingFiles = outputPath === DEFAULT_MANIFEST,
} = {}) => {
  const artifacts = await buildContentArtifacts();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, artifacts.manifestBytes);

  if (writeSupportingFiles) {
    await mkdir(dirname(DEFAULT_VALID_SUMMARY), { recursive: true });
    await writeFile(DEFAULT_VALID_SUMMARY, artifacts.validSummaryBytes);
    await writeFile(DEFAULT_INVALID_SUMMARY, artifacts.invalidSummaryBytes);
  }

  return artifacts;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const artifacts = await generateContentManifest();
  console.log(`Content manifest generated: ${artifacts.manifest.validFixtureCount} valid fixtures, ${artifacts.manifest.invalidFixtureCount} invalid cases, ${artifacts.manifest.publicationEligibleFixtureCount} eligible.`);
}
