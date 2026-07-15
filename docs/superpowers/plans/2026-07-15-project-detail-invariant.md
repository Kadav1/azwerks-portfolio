# Project Detail Invariant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the static, public-safe `/work/[slug]/` project-detail invariant and its isolated validation system without publishing fixtures or real project content.

**Architecture:** Keep the Astro page thin: production `getStaticPaths()` obtains publication-eligible production bundles, creates deterministic route records, and passes a sanitized view model plus the collection entry needed by Astro `render()`. Pure TypeScript modules own routing, navigation, labels, profiles, media/evidence/relation sanitization, and manifest generation. Focused Astro components implement one invariant semantic anatomy; a temporary noindex fixture route exercises it and is always removed in `finally`.

**Tech Stack:** Astro 7.0.9 static output, strict TypeScript 6, Node 24 built-in test runner, plain CSS with governed azwerks tokens, headless Chrome/CDP, npm 11.

## Global Constraints

- Branch from refreshed `origin/main` at `f83ec2b61929b0af36c668324c8d52e3edd9ef97`; never work directly on `main`.
- Production routing imports only `getPublicProjectBundles()` and Astro build-time content APIs.
- Canonical href is `/work/<slug>/`; unknown, fixture, private, unlisted, archived, and ineligible records generate no route.
- Markdown remains the narrative source and renders with `render()` and `<Content />`.
- No dependency, MDX, CMS, remote loader, client content fetch, final world layout, Atlas, View Transition, or third-party runtime is added.
- No raw governed visual values or primitive tokens are introduced.
- Preserve unrelated untracked files and use explicit staging.
- Produce one final commit: `feat: establish project detail invariant`.

---

### Task 1: Route, navigation, and manifest contracts

**Files:**
- Create: `tests/project-detail/contracts.test.mjs`
- Create: `src/lib/project-detail/routes.ts`
- Create: `src/lib/project-detail/navigation.ts`
- Create: `src/lib/project-detail/manifest.ts`
- Create: `src/lib/project-detail/generated/project-detail-route-manifest.json`
- Create: `scripts/generate-project-detail-manifest.mjs`
- Create: `scripts/check-project-detail-manifest.mjs`
- Modify: `src/lib/work-register/view-model.ts`
- Modify: `src/pages/work/index.astro`

**Interfaces:**
- Produces `getProjectDetailHref(slug)`, `isProjectDetailRoutable(bundle)`, `getProjectDetailRouteRecords(bundles)`, `getProjectContextNavigation(records, index)`, and deterministic manifest serialization.
- Route records preserve the existing public Work order and throw `PROJECT_DETAIL_SLUG_DUPLICATE` for duplicate slugs.

- [ ] Write contract tests for canonical hrefs, unsafe slugs, publication/archive exclusion, duplicate slugs, 0/1/5/10 ordering, previous/next boundaries, and byte-identical manifests.
- [ ] Run `node --test tests/project-detail/contracts.test.mjs` and verify failure because modules do not exist.
- [ ] Implement the smallest pure modules and update Work Register projection to call `getProjectDetailHref()` only for routable bundles.
- [ ] Generate the zero-route manifest twice, compare bytes, and run the tests green.

### Task 2: Public-safe view model

**Files:**
- Create: `tests/project-detail/view-model.test.mjs`
- Create: `src/lib/project-detail/types.ts`
- Create: `src/lib/project-detail/labels.ts`
- Create: `src/lib/project-detail/profiles.ts`
- Create: `src/lib/project-detail/media.ts`
- Create: `src/lib/project-detail/evidence.ts`
- Create: `src/lib/project-detail/relations.ts`
- Create: `src/lib/project-detail/view-model.ts`
- Create: `tests/support/project-detail-fixtures.ts`

**Interfaces:**
- Produces `ProjectDetailViewModel`, `createProjectDetailViewModel(bundle, routes, index)`, `selectLeadMedia()`, `filterPublicEvidence()`, `filterPublicRelations()`, and bounded profile mapping.
- Excludes raw companion objects, local/source paths, private URLs, notes, redaction data, and reviewer identity.

- [ ] Write failing tests across all five categories for required fields, labels, profile mapping, lead-media priority, no-media, verified metric artifacts, private evidence URL removal, process/release ordering, sanitized provenance, safe relations, and navigation.
- [ ] Run `node --test tests/project-detail/view-model.test.mjs` and verify the missing-module failure.
- [ ] Implement the strict serializable types and pure sanitizers.
- [ ] Run the view-model tests green and assert forbidden strings are absent from `JSON.stringify(viewModel)`.

### Task 3: Static Astro route and invariant anatomy

**Files:**
- Create: `src/pages/work/[slug].astro`
- Create: `src/layouts/ProjectDetailLayout.astro`
- Create: `src/components/project/ProjectDetail.astro`
- Create: focused components under `src/components/project/` for orientation, header, state, lead media, no-media, narrative, contents, evidence, limitations, process, releases, links, provenance, relations, and context navigation.

**Interfaces:**
- `getStaticPaths() satisfies GetStaticPaths` returns one static path per `getProjectDetailRouteRecords(await getPublicProjectBundles())` record.
- The route calls `render(projectEntry)`, validates headings, derives optional H2/H3 contents, and renders `<Content />` through `ProjectNarrative`.

- [ ] Extend static contract tests to require production-only imports, `getStaticPaths()`, `render()`, no fixture imports, and the invariant component set; verify failure.
- [ ] Implement the thin route and component anatomy in the prescribed order with orientation/header always present and all other sections guarded.
- [ ] Run Astro check and the focused tests; verify zero production routes build without error.

### Task 4: Governed project-detail styling

**Files:**
- Create: `src/styles/project-detail.css`
- Modify: `src/layouts/ProjectDetailLayout.astro`

**Interfaces:**
- Consumes semantic/portfolio/world tokens and component-local `--_project-*` variables only.
- Provides readable prose, local code/table overflow, stable media ratios, responsive single-column behavior, forced-colors, reduced-motion, print, and non-obstructing anchor offsets.

- [ ] Extend static validation with raw-value, primitive-token, prohibited-pattern, and extension-attribute assertions; verify failure.
- [ ] Implement token-only editorial styling with no final category layout.
- [ ] Run `npm run tokens:validate:usage`, focused validation, and Astro check green.

### Task 5: Static validation and isolated browser harness

**Files:**
- Create: `scripts/validate-project-detail.mjs`
- Create: `scripts/test-project-detail-view-model.mjs`
- Create: `scripts/browser-project-detail-audit.mjs`
- Modify: `package.json`
- Modify: `scripts/validate-work-register.mjs`

**Interfaces:**
- Adds non-recursive `detail:*` scripts and folds `detail:check` into `check` and `build`.
- Browser audit creates `src/pages/project-detail-audit/[slug].astro`, builds, audits, and removes route/captures in `finally`, then rebuilds production.

- [ ] Write validators that fail before required production files and Work Register integration exist.
- [ ] Implement stable error codes and deterministic manifest checking.
- [ ] Implement the temporary fixture harness for five categories, sparse/long/no-media/media/evidence/relations, unknown route, 0/1/5/10 scaling, privacy, modes, zoom, widths, semantics, focusability, overflow, CLS, requests, CSS, JS, HTML, and DOM metrics.
- [ ] Run the browser audit and verify all temporary paths are absent afterward.

### Task 6: Architecture, QA, staging, and implementation records

**Files:**
- Create the seven required architecture/QA/planning documents.
- Create: `docs/portfolio/planning/project-detail-invariant-staging-manifest-v0.1.md`
- Create: `azwerks-portfolio-project-detail-invariant-implementation-report-v0.1.md`

**Interfaces:**
- Documents the current implementation truth, measured results, unsupported manual checks, exact included/excluded paths, and the project-world extension boundary.

- [ ] Populate architecture contracts from implemented APIs and rendered anatomy.
- [ ] Populate QA and implementation reports only from command/browser output actually observed.
- [ ] Record every staged path and preserve the three unrelated untracked files as exclusions.

### Task 7: Final verification and delivery

**Files:**
- Modify only report/QA result fields if fresh evidence differs.

- [ ] Run the required commands, generate the manifest twice with byte comparison, check temporary residue, and run `git diff --check`.
- [ ] Review `git diff --stat`, full diff, and privacy/path scans.
- [ ] Stage every intended path explicitly and verify `git diff --cached --check`.
- [ ] Commit once with `feat: establish project detail invariant`.
- [ ] Push `feat/project-detail-invariant-v0.1` without force and open a draft PR to `main`.
- [ ] Record the actual commit, PR URL, immediate CI state, deferred manual checks, and next prompt.
