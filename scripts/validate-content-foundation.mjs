import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadFixtureFoundation } from '../src/content-model/fixture-contract.ts';
import { assertProductionHelperIsolation } from '../src/content-model/validation.ts';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FIXTURE_ROOT = join(ROOT, 'src', 'content', 'fixtures');
const PRODUCTION_ROOTS = [
  join(ROOT, 'src', 'content', 'projects'),
  join(ROOT, 'src', 'content', 'project-data'),
  join(ROOT, 'src', 'content', 'project-relations'),
  join(ROOT, 'src', 'content', 'pages'),
];
const REQUIRED_DOCUMENTS = [
  'src/content-model/README.md',
  'docs/portfolio/content/content-boundary-inventory-v0.1.md',
  'docs/portfolio/content/content-model-v0.1.md',
  'docs/portfolio/content/project-authoring-guide-v0.1.md',
  'docs/portfolio/content/project-frontmatter-reference-v0.1.md',
  'docs/portfolio/content/project-companion-data-reference-v0.1.md',
  'docs/portfolio/content/project-relation-reference-v0.1.md',
  'docs/portfolio/content/content-publication-policy-v0.1.md',
  'docs/portfolio/content/content-fixture-catalog-v0.1.md',
  'docs/portfolio/content/content-schema-change-policy-v0.1.md',
  'docs/portfolio/qa/content-schema-and-fixture-validation-v0.1.md',
  'docs/portfolio/planning/content-schema-fixture-staging-manifest-v0.1.md',
  'docs/portfolio/planning/azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md',
  'azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md',
];

const failures = [];
const fail = (code, message) => failures.push(`${code}: ${message}`);

const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files.sort();
};

const exists = async (path) => access(path).then(() => true, () => false);

const foundation = await loadFixtureFoundation();
if (foundation.projects.length < 10) fail('CONTENT_FIXTURE_COUNT', 'At least ten valid fixture projects are required.');
if (foundation.companions.length !== foundation.projects.length) fail('CONTENT_COMPANION_MISSING', 'Every fixture project requires exactly one companion.');
if (foundation.publicationEligible.length !== 0) fail('CONTENT_FIXTURE_PUBLIC', 'Fixture publication eligibility must be zero.');

const fixtureIds = new Set(foundation.projects.map(({ id }) => id));
for (const relation of foundation.relations) {
  if (!fixtureIds.has(relation.data.from) || !fixtureIds.has(relation.data.to)) {
    fail('CONTENT_RELATION_ORPHAN', `Relation ${relation.id} references an unknown fixture.`);
  }
}

for (const companion of foundation.companions) {
  for (const media of companion.data.media) {
    if (media.availability !== 'available') continue;
    const assetPath = join(FIXTURE_ROOT, media.source);
    if (!(await exists(assetPath))) fail('CONTENT_MEDIA_SOURCE_MISSING', `${companion.id} references missing ${media.source}.`);
  }
}

for (const directory of PRODUCTION_ROOTS) {
  const authored = (await readdir(directory)).filter((name) => name !== '.gitkeep');
  if (authored.length > 0) fail('CONTENT_PRODUCTION_NOT_EMPTY', `${relative(ROOT, directory)} contains content during fixture-only foundation work.`);
}

const productionNavigation = JSON.parse(await readFile(join(ROOT, 'src', 'content', 'navigation.json'), 'utf8'));
if (!Array.isArray(productionNavigation) || productionNavigation.length !== 0) {
  fail('CONTENT_PRODUCTION_NOT_EMPTY', 'Production navigation must remain empty in this phase.');
}

const querySource = await readFile(join(ROOT, 'src', 'content-model', 'queries.ts'), 'utf8');
try {
  assertProductionHelperIsolation(querySource);
} catch (error) {
  fail(error.code ?? 'CONTENT_FIXTURE_IMPORTED', error.message);
}

const scannedFiles = [
  ...(await walk(join(ROOT, 'src', 'content-model'))),
  ...(await walk(FIXTURE_ROOT)),
  join(ROOT, 'src', 'content.config.ts'),
].filter((path) => ['.ts', '.md', '.json', '.svg'].includes(extname(path)));
for (const path of scannedFiles) {
  const source = await readFile(path, 'utf8');
  if (/(?:\/home\/|\/media\/|\/mnt\/|file:\/\/)/.test(source)) {
    fail('CONTENT_PRIVATE_PATH', `${relative(ROOT, path)} contains a private or local path.`);
  }
  if (/https?:\/\/(?:localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(source)) {
    fail('CONTENT_UNSAFE_URL', `${relative(ROOT, path)} contains a local or private URL.`);
  }
}

for (const document of REQUIRED_DOCUMENTS) {
  if (!(await exists(join(ROOT, document)))) fail('CONTENT_DOCUMENTATION_MISSING', document);
}

const reportPath = join(ROOT, 'docs', 'portfolio', 'planning', 'azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md');
const rootReportPath = join(ROOT, 'azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md');
if (await exists(reportPath) && await exists(rootReportPath)) {
  const [report, rootReport] = await Promise.all([readFile(reportPath), readFile(rootReportPath)]);
  if (!report.equals(rootReport)) fail('CONTENT_DOCUMENTATION_DRIFT', 'Root review report must be byte-identical to the planning report.');
}

if (failures.length > 0) {
  console.error(`Content foundation validation failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Content foundation validation passed: ${foundation.projects.length} projects, ${foundation.companions.length} companions, ${foundation.relations.length} relations, ${foundation.publicationEligible.length} publishable fixtures.`);
}
