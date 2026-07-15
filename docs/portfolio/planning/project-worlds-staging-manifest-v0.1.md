# Project worlds staging manifest v0.1

Every included path below was authored or deliberately modified for this phase, depends on the merged token/detail contracts, passed privacy review, and is explicitly staged. No path contains real/private content.

| Path | Status / owner | Purpose and include reason |
| --- | --- | --- |
| `package.json` | authored / scripts | Add focused world gates to check/build. |
| `scripts/browser-project-worlds-audit.mjs` | test / QA | Temporary isolated Chrome/CDP harness with `finally` cleanup. |
| `scripts/generate-project-world-manifest.mjs` | generated-contract / registry | Deterministic manifest writer. |
| `scripts/test-project-world-registry.mjs` | test / registry | Focused test runner. |
| `scripts/validate-project-worlds.mjs` | test / invariant | Static registry, privacy, token, route, and fallback validator. |
| `scripts/validate-project-detail.mjs` | authored / invariant | Recognize centralized world renderer without weakening detail checks. |
| `src/components/project/ProjectDetail.astro` | authored / invariant seam | Delegate composition to typed dispatcher. |
| `src/layouts/ProjectDetailLayout.astro` | authored / shell seam | Resolve bounded registry profiles from category. |
| `src/components/project-worlds/ProjectWorld.astro` | authored / registry | Typed five-world dispatcher. |
| `src/components/project-worlds/WorldFrame.astro` | authored / shared world | Stable extension attributes and composition frame. |
| `src/components/project-worlds/WorldSection.astro` | authored / invariant | Central rendering and empty-section guards. |
| `src/components/project-worlds/software/SoftwareProjectWorld.astro` | authored / software | Explicit software sequence. |
| `src/components/project-worlds/visual-system/VisualSystemProjectWorld.astro` | authored / visual system | Explicit specimen/rule sequence. |
| `src/components/project-worlds/art/ArtProjectWorld.astro` | authored / art | Explicit artwork/provenance sequence. |
| `src/components/project-worlds/technical-system/TechnicalSystemProjectWorld.astro` | authored / technical system | Explicit architecture/limitations sequence. |
| `src/components/project-worlds/limited-media/LimitedMediaProjectWorld.astro` | authored / limited media | Explicit document-led sequence. |
| `src/lib/project-worlds/world-types.ts` | authored / registry | Public world, policy, and view-model types. |
| `src/lib/project-worlds/world-registry.ts` | authored / registry | Frozen category mapping. |
| `src/lib/project-worlds/world-validation.ts` | authored / invariant | Mapping and preservation assertions. |
| `src/lib/project-worlds/world-view-model.ts` | authored / privacy | Public-safe derived presence/strategy model. |
| `src/lib/project-worlds/world-section-policy.ts` | authored / composition | Five frozen section policies. |
| `src/lib/project-worlds/authored-mark-policy.ts` | authored / marks | Level 0/1 rules; all active mappings Level 0. |
| `src/lib/project-worlds/media-policy.ts` | authored / media | Category preference within invariant safety. |
| `src/lib/project-worlds/manifest.ts` | authored / registry | Deterministic manifest model/hash. |
| `src/lib/project-worlds/generated/project-world-manifest.json` | generated / registry | Reviewed public deterministic artifact. |
| `src/styles/project-worlds.css` | authored / shared world | Measures, spacing, and fallback matrix. |
| `src/styles/project-world-software.css` | authored / software | Workflow/evidence/release emphasis. |
| `src/styles/project-world-visual-system.css` | authored / visual system | Specimen/process/evidence emphasis. |
| `src/styles/project-world-art.css` | authored / art | Neutral uncropped stage and reflection measure. |
| `src/styles/project-world-technical-system.css` | authored / technical system | Architecture/limitations/evidence emphasis. |
| `src/styles/project-world-limited-media.css` | authored / limited media | Type-led absence, limitations, and provenance emphasis. |
| `tests/project-worlds/registry.test.mjs` | test / registry | Mapping, policy, marks, media, privacy, sparse, manifest tests. |
| `tests/project-worlds/composition.test.mjs` | test / invariant | Production composition, fallback, and route-source tests. |
| `tests/support/project-detail-fixtures.ts` | test / shared fixture | Parameterize temporary asset base; defaults preserve detail audit. |
| `docs/superpowers/specs/2026-07-15-project-worlds-design.md` | authored / design | Approved implementation design record. |
| `docs/superpowers/plans/2026-07-15-project-worlds.md` | authored / plan | Execution and verification plan. |
| `docs/portfolio/architecture/project-worlds-existing-state-v0.1.md` | authored / architecture | Baseline inventory and extension seam. |
| `docs/portfolio/architecture/project-worlds-architecture-v0.1.md` | authored / architecture | Ownership and invariant contract. |
| `docs/portfolio/architecture/project-world-registry-contract-v0.1.md` | authored / registry | Category/profile contract. |
| `docs/portfolio/architecture/project-world-section-policy-v0.1.md` | authored / composition | Policy rules and change process. |
| `docs/portfolio/architecture/project-world-authored-mark-policy-v0.1.md` | authored / marks | Mark governance. |
| `docs/portfolio/architecture/project-world-media-policy-v0.1.md` | authored / media | Media/no-media governance. |
| `docs/portfolio/visual-system/software-project-world-v0.1.md` | authored / software | World visual-system record. |
| `docs/portfolio/visual-system/visual-system-project-world-v0.1.md` | authored / visual system | World visual-system record. |
| `docs/portfolio/visual-system/art-project-world-v0.1.md` | authored / art | World visual-system record. |
| `docs/portfolio/visual-system/technical-system-project-world-v0.1.md` | authored / technical system | World visual-system record. |
| `docs/portfolio/visual-system/limited-media-project-world-v0.1.md` | authored / limited media | World visual-system record. |
| `docs/portfolio/qa/project-worlds-validation-v0.1.md` | authored / QA | Exact automated/manual result record. |
| `docs/portfolio/planning/azwerks-portfolio-project-worlds-implementation-report-v0.1.md` | authored / planning | Review handoff. |
| `docs/portfolio/planning/project-worlds-staging-manifest-v0.1.md` | authored / Git safety | This explicit inclusion boundary. |
| `azwerks-portfolio-project-worlds-implementation-report-v0.1.md` | authored / review | Root review copy of implementation report. |

## Explicit exclusions

| Path | Decision | Reason |
| --- | --- | --- |
| `azwerks-portfolio-prototype-compliance-validator-v0.1.py` | exclude | Pre-existing unrelated untracked file. |
| `azwerks-portfolio-prototype-compliance-validator-v0.2.py` | exclude | Pre-existing unrelated untracked file. |
| `scripts/.gitkeep` | exclude | Pre-existing unrelated untracked file. |
| `node_modules/`, `dist/`, `.astro/` | exclude | Dependency/build/cache output. |
| `src/pages/project-worlds-audit/`, `public/project-worlds-audit/` | exclude/absent | Temporary harness removed in `finally`. |

No private documents, outdated package, real content, fixture publication path, screenshots, generated images, secrets, local absolute path in shipped source/data, or unrelated exploration is staged.
