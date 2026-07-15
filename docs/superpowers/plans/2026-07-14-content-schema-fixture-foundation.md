# Content Schema and Fixture Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the repository-owned Astro content model, synthetic fixture corpus, deterministic validation and query layer, documentation, and review delivery without adding public routes or real content.

**Architecture:** One strict TypeScript/Zod kernel owns authored schemas and pure validation. `src/content.config.ts` binds that kernel to ten local build-time Astro collections using `glob()`, `file()`, and collection-specific references. Node 24 scripts and native tests reuse the same kernel, validate cross-entry contracts, and generate one deterministic manifest.

**Tech Stack:** Node 24.16.0, npm 11, Astro 7.0.9, `astro/zod`, TypeScript 6.0.3, Node built-ins, Markdown, JSON.

## Global Constraints

- Work only on `feat/content-schema-fixture-foundation-v0.1`, based on merged `origin/main` SHA `57c893292b53dd5017502d7cbcae616aa36f3fb3`.
- Keep production and fixture collections separate; production helpers must not import fixture collections.
- Use `src/content.config.ts`, never `src/content/config.ts`.
- Use build-time local loaders only; add no CMS, API, database, live loader, remote loader, MDX, or runtime request.
- Preserve all token gates and add no dependency.
- Fixtures are fictional, `synthetic: true`, `visibility: private`, `noindex: true`, and never publication eligible.
- Add no public route, navigation UI, shell work, register, atlas, project layout, real content, or production media.
- Use stable ASCII IDs, explicit sorting, stable error codes, deterministic generated output, and explicit staging.
- Preserve the pre-existing untracked validator files and `scripts/.gitkeep`.
- Deliver one focused implementation commit; do not make intermediate commits despite the generic skill template.

---

### Task 1: Establish vocabulary, errors, and flat-source parsing

**Files:**
- Create: `src/content-model/enums.ts`
- Create: `src/content-model/error-codes.ts`
- Create: `src/content-model/source.ts`
- Create: `tests/content-model/source.test.mjs`

**Interfaces:**
- Produces: readonly enum arrays and inferred union types.
- Produces: `CONTENT_ERROR_CODES`, `ContentErrorCode`, and `ContentModelError`.
- Produces: `parseFlatFrontmatter(source, filePath)`, `readMarkdownEntry(filePath)`, `assertSafeMarkdownBody(body, filePath)`, `assertSafeString(value, context)`, and `compareAscii(a, b)`.

- [ ] **Step 1: Write the failing parser and safety tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertSafeMarkdownBody,
  compareAscii,
  parseFlatFrontmatter,
} from '../../src/content-model/source.ts';

test('parses only flat scalar and string-array frontmatter', () => {
  const parsed = parseFlatFrontmatter(`---\nschemaVersion: "1.0"\nslug: quiet-machine\ntags:\n  - synthetic\n  - fixture\nsynthetic: true\n---\n# Body`, 'quiet-machine.md');
  assert.deepEqual(parsed.data.tags, ['synthetic', 'fixture']);
  assert.equal(parsed.body, '# Body');
});

test('rejects nested frontmatter', () => {
  assert.throws(
    () => parseFlatFrontmatter('---\nseo:\n  title: Hidden\n---\nBody', 'bad.md'),
    { code: 'CONTENT_FRONTMATTER_NESTED' },
  );
});

test('rejects unsafe Markdown body constructs', () => {
  assert.throws(
    () => assertSafeMarkdownBody('<script>alert(1)</script>', 'bad.md'),
    { code: 'CONTENT_BODY_UNSAFE' },
  );
});

test('sorts IDs without locale dependence', () => {
  assert.deepEqual(['zeta', 'alpha', 'beta'].sort(compareAscii), ['alpha', 'beta', 'zeta']);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/content-model/source.test.mjs`  
Expected: fail because `src/content-model/source.ts` does not exist.

- [ ] **Step 3: Implement the vocabulary, error class, parser, and scans**

Use readonly arrays for every prompt-defined vocabulary. Parse only quoted or
plain strings, finite numbers, booleans, inline string arrays, and indented
string-array items. Reject nested keys, object arrays, tabs, duplicate keys,
unsafe YAML tags, wikilinks, embeds, HTML, event handlers, unsafe schemes,
absolute local paths, `localhost`, private IPv4 ranges, credentials, and
traversal segments with stable `CONTENT_*` codes.

```ts
export class ContentModelError extends Error {
  readonly code: ContentErrorCode;
  readonly context?: string;

  constructor(code: ContentErrorCode, message: string, context?: string) {
    super(message);
    this.name = 'ContentModelError';
    this.code = code;
    this.context = context;
  }
}

export const compareAscii = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test tests/content-model/source.test.mjs`  
Expected: four passing tests and zero failures.

---

### Task 2: Implement strict project and companion schemas

**Files:**
- Create: `src/content-model/schemas.ts`
- Create: `src/content-model/types.ts`
- Create: `tests/content-model/schemas.test.mjs`

**Interfaces:**
- Consumes: enums and stable errors from Task 1.
- Produces: `projectSchema`, `fixtureProjectSchema`, `createProjectDataSchema(projectReference)`, `projectDataRawSchema`, `sitePageSchema`, `fixtureSitePageSchema`, `navigationItemSchema`, and `navigationFileSchema`.
- Produces: inferred authored types plus `ProjectBundle` and validation input types.

- [ ] **Step 1: Write failing schema tests**

```js
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
  assert.equal(fixtureProjectSchema.safeParse({ ...software, visibility: 'public' }).success, false);
});

test('requires verified evidence artifacts and complete metrics', () => {
  const result = projectDataRawSchema.safeParse({
    schemaVersion: '1.0', project: 'synthetic-console',
    mediaAvailability: 'unavailable', sourceAvailability: 'private', rightsStatus: 'synthetic',
    layoutProfile: 'technical', themeProfile: 'system', motionProfile: 'none',
    links: [], media: [],
    evidence: [{ id: 'metric', type: 'metric', title: 'Synthetic measure', trust: 'verified', availability: 'public' }],
    process: [], limitations: [{ id: 'limit', summary: 'Synthetic only.', status: 'known' }], releases: [],
    provenance: { owner: 'Synthetic fixture owner', authorship: 'synthetic', sourceAvailability: 'private', rightsStatus: 'synthetic', reviewStatus: 'reviewed' },
  });
  assert.equal(result.success, false);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/content-model/schemas.test.mjs`  
Expected: fail because schema exports do not exist.

- [ ] **Step 3: Implement strict schema composition**

Use strict Zod objects from `astro/zod`. Build the project schema as a
five-branch discriminated union. Keep common frontmatter flat. Put links,
media, evidence, process, limitations, releases, and provenance in the strict
companion schema. Use refinements for date order, fixture policy, media alt and
transcript contracts, rights, evidence artifacts, metrics, unique nested IDs,
and process order.

```ts
const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const projectCommonShape = {
  schemaVersion: z.literal('1.0'),
  slug: idSchema,
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(24).max(320),
  lifecycle: z.enum(LIFECYCLES),
  visibility: z.enum(VISIBILITIES),
  maintenance: z.enum(MAINTENANCE_STATES),
  synthetic: z.boolean(),
};

export const projectSchema = z.discriminatedUnion('category', [
  softwareProjectSchema,
  visualSystemProjectSchema,
  artProjectSchema,
  technicalSystemProjectSchema,
  limitedMediaProjectSchema,
]);
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test tests/content-model/schemas.test.mjs`  
Expected: four passing tests and zero failures.

---

### Task 3: Add relations, publication policy, deterministic bundles, and query contracts

**Files:**
- Create: `src/content-model/relations.ts`
- Create: `src/content-model/publication.ts`
- Create: `src/content-model/merge.ts`
- Create: `src/content-model/queries.ts`
- Create: `src/content-model/fixture-contract.ts`
- Create: `src/content-model/validation.ts`
- Create: `tests/content-model/model.test.mjs`

**Interfaces:**
- Produces: relation schemas/factories, `validateContentFoundation(input)`, `buildProjectBundle()`, `sortProjectBundles()`, relation traversal helpers, publication result, all required production query helpers, and fixture-only helpers.

- [ ] **Step 1: Write failing graph, publication, sorting, and bundle tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePublicationEligibility } from '../../src/content-model/publication.ts';
import { sortProjectBundles } from '../../src/content-model/merge.ts';
import { validateRelationSet } from '../../src/content-model/relations.ts';

test('rejects self relations', () => {
  assert.throws(() => validateRelationSet([
    { id: 'self', from: 'alpha', to: 'alpha', type: 'related', direction: 'undirected', summary: 'A meaningful synthetic rationale.', visibility: 'private', synthetic: true },
  ], new Map([['alpha', { visibility: 'private' }]])), { code: 'CONTENT_RELATION_SELF' });
});

test('fixtures are never publication eligible', () => {
  assert.equal(evaluatePublicationEligibility({ project: { synthetic: true } }).eligible, false);
});

test('bundle sorting uses ID as its final stable tie-breaker', () => {
  const input = [{ id: 'beta', featured: false }, { id: 'alpha', featured: false }];
  assert.deepEqual(sortProjectBundles(input).map(({ id }) => id), ['alpha', 'beta']);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/content-model/model.test.mjs`  
Expected: fail because model modules do not exist.

- [ ] **Step 3: Implement pure model behavior**

Relations reject self edges, missing endpoints, invalid direction/type pairs,
duplicate directed edges, reverse duplicate undirected edges, and unsafe public
visibility. Publication returns `{ eligible, reasons }`. Bundle merge computes
display period, media/evidence states, relation count, normalized search text,
and archive state. Sorting uses explicit featured/lifecycle/date/title/ID keys.

Production `queries.ts` may contain only production collection names.
`fixture-contract.ts` owns `getFixtureProjectBundles()` and fixture collection
names. Both call pure merge functions.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test tests/content-model/model.test.mjs`  
Expected: three passing tests and zero failures.

---

### Task 4: Bind the kernel to Astro collections

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/navigation.json`
- Create: `src/content/projects/.gitkeep`
- Create: `src/content/project-data/.gitkeep`
- Create: `src/content/project-relations/.gitkeep`
- Create: `src/content/pages/.gitkeep`
- Create: `tests/content-model/collections.test.mjs`

**Interfaces:**
- Consumes: Task 2 schema factories and Task 3 relation factories.
- Produces: ten named Astro build-time collections.

- [ ] **Step 1: Write the failing collection-contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('declares exactly five production and five fixture collections with local loaders', async () => {
  const source = await readFile(new URL('../../src/content.config.ts', import.meta.url), 'utf8');
  for (const name of ['projects', 'projectData', 'projectRelations', 'sitePages', 'navigation', 'fixtureProjects', 'fixtureProjectData', 'fixtureProjectRelations', 'fixtureSitePages', 'fixtureNavigation']) {
    assert.match(source, new RegExp(`\\b${name}\\b`));
  }
  assert.doesNotMatch(source, /liveLoader|fetch\(|https?:\/\//);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/content-model/collections.test.mjs`  
Expected: fail because `src/content.config.ts` does not exist.

- [ ] **Step 3: Define the ten collections**

```ts
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

const projectData = defineCollection({
  loader: glob({ base: './src/content/project-data', pattern: '**/*.json' }),
  schema: createProjectDataSchema(reference('projects')),
});

export const collections = {
  projects, projectData, projectRelations, sitePages, navigation,
  fixtureProjects, fixtureProjectData, fixtureProjectRelations,
  fixtureSitePages, fixtureNavigation,
};
```

Use analogous explicit declarations for every remaining collection. Production
navigation is an empty JSON array; it creates no UI or route.

- [ ] **Step 4: Run collection test and Astro sync**

Run: `node --test tests/content-model/collections.test.mjs && npm run content:sync`  
Expected: test passes and Astro sync exits zero.

---

### Task 5: Create the frozen valid fixture corpus and cross-entry validation

**Files:**
- Create: `src/content/fixtures/projects/*.md` (10 files)
- Create: `src/content/fixtures/project-data/*.json` (10 files)
- Create: `src/content/fixtures/project-relations/*.json` (at least 7 files)
- Create: `src/content/fixtures/pages/*.md` (4 files)
- Create: `src/content/fixtures/navigation.json`
- Create: `src/content/fixtures/assets/*.svg` (small deterministic geometric assets only)
- Create: `tests/content-model/fixtures.test.mjs`
- Create: `tests/fixtures/content-expected/valid-summary.json`
- Create: `scripts/validate-content-foundation.mjs`

**Interfaces:**
- Consumes: source parser, schemas, and cross-entry validator.
- Produces: `loadContentFoundation({ fixture: true })` result and deterministic valid summary.

- [ ] **Step 1: Add the fixture-validation test before fixtures**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFixtureFoundation } from '../../src/content-model/fixture-contract.ts';

test('loads the frozen fixture corpus with zero public eligibility', async () => {
  const result = await loadFixtureFoundation();
  assert.equal(result.projects.length, 10);
  assert.equal(result.publicationEligible.length, 0);
  assert.deepEqual(new Set(result.projects.map(({ data }) => data.category)), new Set(['software', 'visual-system', 'art', 'technical-system', 'limited-media']));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/content-model/fixtures.test.mjs`  
Expected: fail because fixture sources are absent.

- [ ] **Step 3: Author the exact ten synthetic records**

Use stable IDs:

```text
amber-console-study
quiet-workflow-study
paper-signal-system
chromatic-window-study
absent-image-ledger
folded-protocol-model
field-notes-index
retired-sequence-engine
long-form-boundary-study
minimum-proof-record
```

Every fixture uses `schemaVersion: "1.0"`, `synthetic: true`,
`visibility: private`, and `noindex: true`. Companion and relation records
exercise every required category, relation, media/evidence, maintenance, and
archive edge. Relation types include directed lineage, dependency, supports,
and undirected shared-method and family. All statements identify the records
as fictional and make no real azwerks claim.

- [ ] **Step 4: Run valid fixture validation and verify GREEN**

Run: `node --test tests/content-model/fixtures.test.mjs && node scripts/validate-content-foundation.mjs`  
Expected: 10 valid projects, all categories covered, all companions resolved,
required graph coverage present, and publication eligible count 0.

---

### Task 6: Add 35 negative cases and stable-code harness

**Files:**
- Create: `tests/fixtures/content-invalid/projects/cases.json`
- Create: `tests/fixtures/content-invalid/project-data/cases.json`
- Create: `tests/fixtures/content-invalid/project-relations/cases.json`
- Create: `tests/fixtures/content-invalid/navigation/cases.json`
- Create: `tests/content-model/invalid.test.mjs`
- Create: `tests/fixtures/content-expected/invalid-summary.json`
- Create: `scripts/test-invalid-content-fixtures.mjs`

**Interfaces:**
- Produces: deterministic invalid-case result list `{ id, expectedCode, actualCode }`.

- [ ] **Step 1: Create the failing harness contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { runInvalidFixtureCases } from '../../scripts/test-invalid-content-fixtures.mjs';

test('every invalid fixture fails with its expected stable code', async () => {
  const results = await runInvalidFixtureCases({ quiet: true });
  assert.ok(results.length >= 35);
  assert.ok(results.every((result) => result.actualCode === result.expectedCode));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/content-model/invalid.test.mjs`  
Expected: fail because invalid fixtures and harness are absent.

- [ ] **Step 3: Add all required invalid classes**

Create one named case for each of the 35 classes in the prompt. Each case
declares `id`, `kind`, `expectedCode`, and a minimal invalid input or mutation.
The harness hashes every source file before execution, runs the appropriate
schema or cross-entry path, rejects any passing case, writes no source file,
uses a temporary directory only when necessary, cleans it in `finally`, and
compares source hashes afterward.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/content-model/invalid.test.mjs && node scripts/test-invalid-content-fixtures.mjs`  
Expected: at least 35 cases fail for their exact stable codes; zero cases pass
unexpectedly; source hashes are unchanged.

---

### Task 7: Generate and drift-check the deterministic content manifest

**Files:**
- Create: `scripts/generate-content-manifest.mjs`
- Create: `scripts/check-content-manifest.mjs`
- Create: `src/content-model/generated/content-model-manifest.json`
- Create: `tests/content-model/manifest.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `generateContentManifest({ outputPath })` and stable manifest bytes.
- Adds: `content:sync`, `content:generate`, `content:validate`, `content:test:unit`, `content:test:invalid`, `content:check:generated`, and `content:check` scripts.

- [ ] **Step 1: Write the failing deterministic-manifest test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateContentManifest } from '../../scripts/generate-content-manifest.mjs';

test('generates byte-identical manifests', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'azw-content-manifest-'));
  try {
    const first = join(directory, 'first.json');
    const second = join(directory, 'second.json');
    await generateContentManifest({ outputPath: first });
    await generateContentManifest({ outputPath: second });
    assert.deepEqual(await readFile(first), await readFile(second));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/content-model/manifest.test.mjs`  
Expected: fail because generator exports do not exist.

- [ ] **Step 3: Implement stable generation and package scripts**

The manifest includes model version, ten collections, schema/source hashes,
all enum values, fixture version, valid/invalid counts, category and relation
counts, zero publication eligibility, generated hashes, and validator version.
Sort every object key and array with documented semantic order or ASCII ID.
Do not write a current timestamp.

Update package scripts without recursion:

```json
{
  "content:sync": "astro sync",
  "content:generate": "node scripts/generate-content-manifest.mjs",
  "content:test:unit": "node --test tests/content-model/*.test.mjs",
  "content:validate": "node scripts/validate-content-foundation.mjs",
  "content:test:invalid": "node scripts/test-invalid-content-fixtures.mjs",
  "content:check:generated": "node scripts/check-content-manifest.mjs",
  "content:check": "npm run content:sync && npm run content:test:unit && npm run content:validate && npm run content:test:invalid && npm run content:check:generated",
  "check": "npm run tokens:check && npm run content:check && npm run check:astro",
  "build": "npm run tokens:check && npm run content:check && astro build"
}
```

- [ ] **Step 4: Run and verify GREEN and drift**

Run: `npm run content:generate && node --test tests/content-model/manifest.test.mjs && npm run content:check:generated`  
Expected: deterministic test and committed-output drift check pass.

---

### Task 8: Document architecture, authoring, QA, staging, and implementation

**Files:**
- Create: `src/content-model/README.md`
- Create: `docs/portfolio/content/content-boundary-inventory-v0.1.md`
- Create: `docs/portfolio/content/content-model-v0.1.md`
- Create: `docs/portfolio/content/project-authoring-guide-v0.1.md`
- Create: `docs/portfolio/content/project-frontmatter-reference-v0.1.md`
- Create: `docs/portfolio/content/project-companion-data-reference-v0.1.md`
- Create: `docs/portfolio/content/project-relation-reference-v0.1.md`
- Create: `docs/portfolio/content/content-publication-policy-v0.1.md`
- Create: `docs/portfolio/content/content-fixture-catalog-v0.1.md`
- Create: `docs/portfolio/content/content-schema-change-policy-v0.1.md`
- Create: `docs/portfolio/qa/content-schema-and-fixture-validation-v0.1.md`
- Create: `docs/portfolio/planning/content-schema-fixture-staging-manifest-v0.1.md`
- Create: `docs/portfolio/planning/azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md`
- Create: `azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md`

**Interfaces:**
- Documents every authored field, error code, command, fixture, privacy gate,
  generated hash, performance measurement, deferred item, and staging decision.

- [ ] **Step 1: Add a documentation completeness validator**

Extend `validate-content-foundation.mjs` with an explicit required-document
list and required implementation-report headings. The validator must fail
before the documents exist with `CONTENT_DOCUMENTATION_MISSING`.

- [ ] **Step 2: Run and verify RED**

Run: `node scripts/validate-content-foundation.mjs`  
Expected: fail with `CONTENT_DOCUMENTATION_MISSING`.

- [ ] **Step 3: Write all required documents**

Use actual commands and measurements only. Record the prerequisite merge SHA,
Astro/Node/npm/TypeScript versions, ten collection names, schema and fixture
versions, valid/invalid counts, relation coverage, publication count, manifest
hash, drift proof, dependency impact, zero runtime/client/network impact,
unsupported route/browser checks, files changed, risks, and deferred work. The
root report copy must be byte-identical to the planning report.

- [ ] **Step 4: Run and verify GREEN**

Run: `node scripts/validate-content-foundation.mjs`  
Expected: documentation completeness and all content checks pass.

---

### Task 9: Full verification, explicit staging, commit, push, and draft PR

**Files:**
- Modify generated and QA/report hashes only when fresh verification changes
  measured evidence.

**Interfaces:**
- Produces: one focused commit and one draft pull request targeting `main`.

- [ ] **Step 1: Run the required clean verification sequence**

```bash
npm ci
npm run tokens:check
npm run content:sync
npm run content:generate
npm run content:validate
npm run content:test:invalid
npm run content:check:generated
npm run content:check
npm run check
npm run build
git diff --check
git status --short --branch
```

Run the manifest generator twice and compare hashes. Record useful execution
times and final artifact sizes.

- [ ] **Step 2: Review scope and privacy**

Run `git diff --stat`, `git diff`, unsafe-path/URL/credential scans, production
fixture-import scans, and `git diff --check`. Confirm no route, real content,
prototype import, dependency, private source, build output, cache, or unrelated
untracked file is included.

- [ ] **Step 3: Stage explicit approved paths only**

Stage `src/content.config.ts`, `src/content/`, `src/content-model/`,
`tests/content-model/`, `tests/fixtures/`, the four content scripts, updated
`package.json`, required docs, approved design/plan docs, and the root report.
Do not stage the two root prototype validators or pre-existing
`scripts/.gitkeep`.

- [ ] **Step 4: Commit and push normally**

```bash
git diff --cached --check
git commit -m "feat: establish content schema and fixture foundation"
git push -u origin feat/content-schema-fixture-foundation-v0.1
```

- [ ] **Step 5: Open the draft PR and inspect immediate CI**

Create a draft PR titled `feat: establish content schema and fixture foundation`
with the required architecture, validation, performance, risk, deferred-work,
and next-prompt evidence. Do not merge it. Record checks as passed, failed,
pending, or unavailable. Fix only in-scope failures through normal follow-up
commits without rewriting history.

## Plan self-review

- Spec coverage: Tasks 1-9 cover prerequisite evidence, boundaries, ten
  collections, schemas, relations, pages/navigation, publication, queries,
  ten valid fixtures, at least 35 invalid cases, deterministic manifest,
  documentation, validation, staging, and GitHub delivery.
- Scope: no task adds a route, UI, real content, production media, MDX, remote
  loader, CMS, database, dependency, analytics, or deployment.
- Type consistency: schema factories accept project-reference schemas;
  production and fixture collection adapters remain separate; pure bundle and
  validation functions are shared.
- Placeholder scan: the plan contains no unresolved implementation placeholder.
- Delivery deviation: intermediate commits from the generic skill template are
  intentionally omitted because the governing prompt requires one focused
  implementation commit.
