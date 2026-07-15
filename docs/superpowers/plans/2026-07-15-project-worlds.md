# Project Worlds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish five category-specific static project-world compositions while preserving the merged project-detail invariant.

**Architecture:** A frozen category registry and section policy derive a public world view model. Five explicit Astro composition files consume one shared section renderer, retaining centralized invariant semantics while varying hierarchy, measure, density, media prominence, and section order through existing world aliases.

**Tech Stack:** Astro 7.0.9, strict TypeScript, CSS cascade layers/custom properties, Node built-in test runner and CDP browser audit.

## Global Constraints

- Production detail routes remain sourced only from publication-eligible production bundles.
- Exactly five project categories map one-to-one to five worlds; unknown categories fail.
- No dependency, content-schema, real-content, fixture-publication, Atlas, transition, CMS, MDX, runtime fetch, or third-party runtime change.
- Authored marks remain Level 0 because no approved asset exists.
- Semantic/project-world tokens only; project-world JavaScript remains zero.
- One focused commit after all gates; no intermediate commit conflicts with the requested delivery contract.

---

### Task 1: Registry, policies, and public world view model

**Files:** create `tests/project-worlds/registry.test.mjs`, `src/lib/project-worlds/world-types.ts`, `world-registry.ts`, `world-validation.ts`, `world-section-policy.ts`, `world-view-model.ts`, `authored-mark-policy.ts`, and `media-policy.ts`.

**Interfaces:** `getProjectWorldDefinition(category)`, `validateProjectWorldRegistry()`, and `createProjectWorldViewModel(project, hasNarrative)` produce the immutable category and rendering contract.

- [ ] Write assertions for exact mappings, frozen values, unknown failure, required sections, Level 0 marks, media rules, availability booleans, sparse state, and private serialization exclusions.
- [ ] Run `node --test tests/project-worlds/registry.test.mjs`; expect missing-module failure.
- [ ] Implement the minimal typed registry and policy functions.
- [ ] Rerun the focused test; expect all assertions to pass.

### Task 2: Five explicit compositions

**Files:** create `src/components/project-worlds/ProjectWorld.astro`, `WorldFrame.astro`, `WorldSection.astro`, and one component under each category directory; modify `src/components/project/ProjectDetail.astro` and `src/layouts/ProjectDetailLayout.astro`.

**Interfaces:** `ProjectWorld` consumes the unchanged `ProjectDetailViewModel`, rendered Astro `Content`, and `hasNarrative`; each category component declares its registry-owned section sequence.

- [ ] Add static contract assertions for five composition files, dispatcher mapping, shared section rendering, and invariant section presence; run and observe failure.
- [ ] Implement `WorldSection` as the sole shared-component switch and five explicit compositions.
- [ ] Delegate `ProjectDetail` to `ProjectWorld` without changing route props or raw data boundaries.
- [ ] Run registry/static tests; expect green.

### Task 3: Governed world styling and fallbacks

**Files:** create shared and five category CSS files under `src/styles/`; import them once from `ProjectWorld.astro`.

**Interfaces:** stable `data-project-world`, `data-world-section`, `data-world-lead-strategy`, and density/measure attributes style only the controlled composition layer.

- [ ] Add validator assertions rejecting raw values, primitive tokens, functional overrides, animation, mark pseudo-elements, art crop/tint, and missing forced-colors/print rules; observe failure.
- [ ] Implement token-only shared and category styles with intrinsic responsive grids and local overflow containment.
- [ ] Run token usage and static world validation; expect green.

### Task 4: Deterministic manifest and focused scripts

**Files:** create `src/lib/project-worlds/manifest.ts`, generated manifest JSON, four focused scripts, and update `package.json`.

**Interfaces:** `createProjectWorldManifest()` emits version, mappings, profiles, policy hashes, mark levels, token dependencies, fixture coverage, validator version, and generated hash without timestamps/private data.

- [ ] Add determinism, hash, mapping, and privacy assertions; observe failure.
- [ ] Implement generator, drift checker inside static validation, focused test runner, and package scripts without recursion.
- [ ] Generate twice and compare bytes; expect identical output.

### Task 5: Isolated browser audit

**Files:** create `scripts/browser-project-worlds-audit.mjs`; reuse `tests/support/project-detail-fixtures.ts` without production imports.

**Interfaces:** a temporary noindex route renders public-shaped fixture view models through the production world dispatcher and is removed in `finally`.

- [ ] Build and run the harness across five worlds plus sparse/long/minimum variants; fail on missing world attributes or invariant order.
- [ ] Add theme, invalid storage, no-JS, reduced-motion, forced-colors, print, 200% text, zoom, keyboard, privacy, widths, media fidelity, CLS, CSS/JS, and build-regression assertions.
- [ ] Rerun until every named scenario passes and production zero-route output is restored.

### Task 6: Architecture, visual-system, QA, staging, and report records

**Files:** create the required architecture, five visual-system, QA, staging, canonical report, and root review-copy documents.

**Interfaces:** documentation records exact source versions/hashes, invariant ownership, five definitions, actual commands/results, unsupported physical checks, performance, privacy, and delivery state.

- [ ] Write every required record from verified outputs without placeholders.
- [ ] Scan for contradictions, local absolute paths, unsupported claims, and missing required sections; correct findings.

### Task 7: Final verification and publication

**Files:** explicitly stage only the staging-manifest paths.

- [ ] Run the complete required command list, deterministic comparison, temporary-file scan, privacy scan, `git diff --check`, and staged-boundary review.
- [ ] Commit once as `feat: establish category-specific project worlds`.
- [ ] Push `feat/project-worlds-v0.1` without force and create the required draft PR against `main`.
- [ ] Record immediate CI as pending, passed, failed, or unavailable; do not merge.
