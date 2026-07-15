# Work Register Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the canonical static-first `/work/` register with a complete HTML baseline, bounded URL-backed enhancement, isolated populated QA, and one focused delivery commit.

**Architecture:** `getPublicProjectBundles()` feeds a strict serializable view-model adapter that removes archived records and private companion detail. Pure state, URL, filtering, sorting, and summary modules are shared by server-safe tests and a small framework-free DOM controller. Astro components own semantic HTML; enhancement only hides/reorders already-rendered records after successful initialization and restores the full list on failure.

**Tech Stack:** Astro 7 static output, strict TypeScript, native HTML forms and lists, repository token CSS, Node's built-in test runner, Playwright already present transitively for repository browser audits, and no new dependency.

## Global Constraints

- Start from `origin/main` SHA `2a1b16118914f66b7d20f3ea9582b86aa76521dc` on `feat/work-register-v0.1`.
- Query production only through `getPublicProjectBundles()`; exclude archived bundles after publication filtering.
- Render every public Work record before JavaScript; controls are hidden until initialization succeeds.
- Support only `q`, `category`, `maintenance`, `evidence`, and `sort`; query text is bounded and normalized.
- Category/maintenance/evidence groups combine with AND; repeated values within a group combine with OR.
- Sort modes are `curated`, `recent`, and `title`, all stable and environment-locale independent.
- Keep `/work/` `noindex` while the corpus is empty or valid detail destinations do not exist.
- No fixtures, project links, Atlas, detail routes, runtime requests, third-party runtime, raw visual values, or new dependency.
- Preserve unrelated untracked files and stage explicit paths only.
- Produce one final commit named `feat: establish accessible work register`.

---

### Task 1: Pure register model and state contract

**Files:**
- Create: `tests/work-register/state.test.mjs`
- Create: `src/lib/work-register/types.ts`
- Create: `src/lib/work-register/constants.ts`
- Create: `src/lib/work-register/labels.ts`
- Create: `src/lib/work-register/query-state.ts`
- Create: `src/lib/work-register/filter.ts`
- Create: `src/lib/work-register/sort.ts`
- Create: `src/lib/work-register/url.ts`
- Create: `src/lib/work-register/view-model.ts`

**Interfaces:**
- Produces: `WorkRegisterRecord`, `WorkRegisterState`, `parseWorkRegisterState()`, `serializeWorkRegisterState()`, `filterWorkRegisterRecords()`, `sortWorkRegisterRecords()`, `summarizeWorkRegisterState()`, and `createWorkRegisterRecords()`.

- [ ] Write state tests for normalization, invalid/duplicate values, AND/OR filtering, exact/partial/case/whitespace/diacritic search, stable sort modes, immutability, summary text, publication-safe view-model projection, and archive exclusion.
- [ ] Run `node --test tests/work-register/state.test.mjs` and confirm failure because the modules do not exist.
- [ ] Implement the minimal pure modules with ASCII comparison and bounded normalized arrays/text.
- [ ] Run the focused tests and confirm all cases pass.

### Task 2: Semantic route and components

**Files:**
- Create: `src/components/work/WorkRegister.astro`
- Create: `src/components/work/WorkRegisterHeader.astro`
- Create: `src/components/work/WorkRegisterControls.astro`
- Create: `src/components/work/WorkSearch.astro`
- Create: `src/components/work/WorkFilterGroup.astro`
- Create: `src/components/work/WorkSortControl.astro`
- Create: `src/components/work/WorkRegisterSummary.astro`
- Create: `src/components/work/WorkRegisterEmptyState.astro`
- Create: `src/components/work/ProjectRegisterItem.astro`
- Create: `src/components/work/ProjectPreview.astro`
- Modify: `src/pages/work/index.astro`

**Interfaces:**
- Consumes: public `WorkRegisterRecord[]` and present-value filter options.
- Produces: one H1, labeled native form, semantic list/result landmark, category jump links, distinct empty states, noscript note, and no broken links.

- [ ] Extend static validation expectations first so the scaffold fails the new semantic contract.
- [ ] Implement focused Astro components and production query integration.
- [ ] Run Astro diagnostics and static validation until the semantic contract passes.

### Task 3: Progressive enhancement and governed styling

**Files:**
- Create: `src/scripts/work-register.ts`
- Create: `src/styles/work-register.css`

**Interfaces:**
- Consumes: serialized record data, native form controls, result list items, pure state functions.
- Produces: idempotent initialization, enhancement gating, Apply/Reset, URL push/replace, popstate restoration, stable focus, restrained live announcements, and fail-open recovery.

- [ ] Add browser assertions that controls are absent from interaction before initialization and the full list is visible with JavaScript disabled.
- [ ] Implement the smallest safe DOM controller without HTML injection, fetching, or per-keystroke history.
- [ ] Implement mobile-first semantic-token CSS with component-local aliases and forced-color/print/reduced-motion behavior.
- [ ] Verify client failure removes hidden state and restores canonical list order.

### Task 4: Isolated fixture and scale validation

**Files:**
- Create: `tests/support/work-register-fixtures.ts`
- Create: `tests/fixtures/work-register/expected-states.json`
- Create: `scripts/validate-work-register.mjs`
- Create: `scripts/test-work-register-state.mjs`
- Create: `scripts/browser-work-register-audit.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: stable static error codes, pure-state runner, temporary populated route in `finally`, datasets 0/1/10/50/200, and browser/performance evidence.

- [ ] Make `register:validate` fail against missing/invalid register contracts.
- [ ] Add deterministic test record generation without changing fixture publication metadata.
- [ ] Add `register:test:state`, `register:audit:browser`, and composite `register:check`; add `register:check` to existing non-recursive check/build chains.
- [ ] Exercise production-empty and temporary-populated routes across state, history, accessibility, responsive, media, and performance assertions.
- [ ] Confirm the temporary route and browser output are absent after success and failure.

### Task 5: Architecture, QA, staging, and delivery records

**Files:**
- Create: `docs/portfolio/architecture/work-register-architecture-v0.1.md`
- Create: `docs/portfolio/architecture/work-register-query-state-contract-v0.1.md`
- Create: `docs/portfolio/architecture/project-register-item-contract-v0.1.md`
- Create: `docs/portfolio/qa/work-register-validation-v0.1.md`
- Create: `docs/portfolio/planning/work-register-staging-manifest-v0.1.md`
- Create: `docs/portfolio/planning/azwerks-portfolio-work-register-implementation-report-v0.1.md`
- Create: `azwerks-portfolio-work-register-implementation-report-v0.1.md`

**Interfaces:**
- Produces: durable architecture/interaction contracts, honest measured QA evidence, explicit include/exclude staging decisions, and review handoff.

- [ ] Record the implemented contracts and measured outputs only after the corresponding gate runs.
- [ ] Run all prerequisite, register, Astro, build, diff, privacy, temporary-file, and budget checks fresh.
- [ ] Review `git diff --stat`, full diff, and `git diff --check`; stage only the manifest-approved feature paths.
- [ ] Commit once, push without force, open a draft PR to `main`, and record immediate CI state without merging.
