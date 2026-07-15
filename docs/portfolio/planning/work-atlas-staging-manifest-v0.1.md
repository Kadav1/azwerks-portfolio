# Work Atlas staging manifest `v0.1`

Date: 2026-07-15  
Branch: `feat/work-atlas-v0.1`

All included paths are explicitly staged. “Public-safe” means the path either
contains no content data or consumes only the centralized public Atlas view
model. No private document, real content, production fixture, temporary route,
browser cache, screenshot, generated image, secret, or local path is included.

## Runtime and integration

| Path | State | Owner | Dependencies | Privacy | Decision and reason |
|---|---|---|---|---|---|
| `package.json` | authored | build | existing npm scripts | none | include; exposes Atlas gates |
| `src/pages/work/index.astro` | authored | Register | view switch | public-safe | include; local Atlas link |
| `src/pages/work/atlas/index.astro` | authored | Atlas route | shell, public bundles, Atlas model | public-safe | include; production route |
| `src/lib/work-register/filter.ts` | authored | Register | public record fields | public-safe | include; generic shared filtering |
| `src/scripts/work-register.ts` | authored | Register client | shared normalized state | public-safe | include; compatible handoff URL |
| `src/scripts/work-atlas.ts` | authored | Atlas client | DOM and serialized public model | public-safe | include; optional enhancement |
| `src/styles/work-atlas.css` | authored | Atlas presentation | governed semantic tokens | none | include; responsive/mode styles |

## Components

| Path | State | Owner | Dependencies | Privacy | Decision and reason |
|---|---|---|---|---|---|
| `src/components/work-atlas/WorkAtlas.astro` | authored | composition | all Atlas components | public-safe | include; single baseline/enhancement composition |
| `src/components/work-atlas/AtlasHeader.astro` | authored | header | view switch | none | include; identity and counts |
| `src/components/work-atlas/AtlasViewSwitch.astro` | authored | navigation | native links | none | include; Register boundary |
| `src/components/work-atlas/AtlasControls.astro` | authored | controls | approved state vocabularies | public-safe | include; gated search/filter/zoom |
| `src/components/work-atlas/AtlasLegend.astro` | authored | legends | regions/relation language | none | include; non-color meaning |
| `src/components/work-atlas/AtlasViewport.astro` | authored | viewport | plane | public-safe | include; labeled native scroll |
| `src/components/work-atlas/AtlasPlane.astro` | authored | plane | regions/nodes/relations | public-safe | include; spatial composition |
| `src/components/work-atlas/AtlasRegion.astro` | authored | region | layout region | none | include; equal-status field |
| `src/components/work-atlas/AtlasNode.astro` | authored | node | public record/layout node | public-safe | include; uniform native button |
| `src/components/work-atlas/AtlasRelations.astro` | authored | SVG relations | safe layout edges | public-safe | include; non-color geometry |
| `src/components/work-atlas/AtlasInspector.astro` | authored | inspector | public record/relation summary | public-safe | include; supplemental selection detail |
| `src/components/work-atlas/AtlasIndex.astro` | authored | semantic indexes | public records/relations | public-safe | include; complete no-JS baseline |
| `src/components/work-atlas/AtlasEmptyState.astro` | authored | empty state | Register link | none | include; truthful zero state |
| `src/components/work-atlas/AtlasHelp.astro` | authored | help | governing semantics | none | include; cognitive explanation |

## Data, layout, and manifest

| Path | State | Owner | Dependencies | Privacy | Decision and reason |
|---|---|---|---|---|---|
| `src/lib/work-atlas/atlas-types.ts` | authored | data contract | content enums/world types | public-safe | include; bounded public types |
| `src/lib/work-atlas/atlas-view-model.ts` | authored | projection | Register/routes/relations/worlds | reviewed | include; central exclusion boundary |
| `src/lib/work-atlas/atlas-regions.ts` | authored | regions | five categories | none | include; equal-status geometry |
| `src/lib/work-atlas/atlas-relations.ts` | authored | relation language | existing relation enum | none | include; direction/wording/patterns |
| `src/lib/work-atlas/atlas-layout.ts` | authored | layout | records/relations/regions | public-safe | include; deterministic placement/paths |
| `src/lib/work-atlas/atlas-state.ts` | authored | interaction state | Register normalization/filter | public-safe | include; approved filters/focus |
| `src/lib/work-atlas/atlas-url.ts` | authored | URL handoff | state serializers | public-safe | include; deterministic route state |
| `src/lib/work-atlas/atlas-manifest.ts` | authored | generator model | layout and crypto hash | public-safe | include; deterministic manifest contract |
| `src/lib/work-atlas/generated/work-atlas-manifest.json` | generated | generator | zero production view model | reviewed | include; generated production evidence |

## Validation and isolated tests

| Path | State | Owner | Dependencies | Privacy | Decision and reason |
|---|---|---|---|---|---|
| `scripts/generate-work-atlas-manifest.mjs` | authored tool | generation | production bundles/view model | reviewed | include; only generator authority |
| `scripts/validate-work-atlas.mjs` | authored tool | static QA | repository source/manifest | none | include; stable-code policy gate |
| `scripts/test-work-atlas-layout.mjs` | authored wrapper | layout QA | Node test runner | fixtures private to tests | include; focused command |
| `scripts/test-work-atlas-state.mjs` | authored wrapper | state QA | Node test runner | fixtures private to tests | include; focused command |
| `scripts/browser-work-atlas-audit.mjs` | authored tool; temporary harness at runtime | browser QA | Astro, Chrome/CDP | temporary synthetic only | include; removes harness in finally |
| `tests/support/work-atlas-fixtures.ts` | test only | fixture QA | public-safe synthetic models | no production import | include; deterministic scale sets |
| `tests/work-atlas/contracts.test.mjs` | test only | layout/data QA | Atlas modules/fixtures | private exclusion asserted | include; contract and geometry proof |
| `tests/work-atlas/manifest.test.mjs` | test only | manifest QA | Atlas generator/fixtures | forbidden fields asserted | include; determinism/budget proof |
| `tests/work-atlas/state.test.mjs` | test only | state QA | state/URL/Register helpers | public-only state | include; normalization/history contract |

## Architecture, QA, and review records

| Path | State | Owner | Dependencies | Privacy | Decision and reason |
|---|---|---|---|---|---|
| `docs/portfolio/architecture/work-atlas-existing-state-v0.1.md` | authored record | architecture | merged foundation evidence | no private content | include; baseline authority |
| `docs/portfolio/architecture/work-atlas-architecture-v0.1.md` | authored record | architecture | implementation | no private content | include; system boundary |
| `docs/portfolio/architecture/work-atlas-data-contract-v0.1.md` | authored record | data | public model/resolvers | privacy explicit | include; serialization boundary |
| `docs/portfolio/architecture/work-atlas-layout-contract-v0.1.md` | authored record | layout | deterministic algorithm | none | include; spatial semantics |
| `docs/portfolio/architecture/work-atlas-interaction-contract-v0.1.md` | authored record | interaction | baseline/client state | none | include; enhancement contract |
| `docs/portfolio/architecture/work-atlas-relation-language-v0.1.md` | authored record | relations | approved enum | none | include; complete language table |
| `docs/portfolio/architecture/work-register-atlas-handoff-v0.1.md` | authored record | discovery | Register/Atlas URL logic | public-only queries | include; local switch contract |
| `docs/portfolio/architecture/work-atlas-accessibility-contract-v0.1.md` | authored record | accessibility | components/modes | none | include; semantic and manual gates |
| `docs/portfolio/qa/work-atlas-validation-v0.1.md` | authored evidence | QA | measured command/browser output | no private content | include; honest validation record |
| `docs/portfolio/planning/azwerks-portfolio-work-atlas-implementation-report-v0.1.md` | authored report | planning | all phase evidence | no private content | include; canonical implementation report |
| `azwerks-portfolio-work-atlas-implementation-report-v0.1.md` | mechanical review copy | review | canonical report | identical public-safe copy | include; root review convention |
| `docs/portfolio/planning/work-atlas-staging-manifest-v0.1.md` | authored record | Git safety | path review | privacy decisions recorded | include; explicit staging authority |

## Explicit exclusions

| Path | State | Decision and reason |
|---|---|---|
| `azwerks-portfolio-prototype-compliance-validator-v0.1.py` | pre-existing untracked | exclude; unrelated user material |
| `azwerks-portfolio-prototype-compliance-validator-v0.2.py` | pre-existing untracked | exclude; unrelated user material |
| `scripts/.gitkeep` | pre-existing untracked | exclude; unrelated placeholder |
| `docs/superpowers/` | ignored working notes | exclude; process-only plan/design, not production record |
| `src/pages/work-atlas-audit/` | temporary runtime harness | exclude; removed in `finally` and absent before staging |
| `dist/`, `.astro/`, `node_modules/` | generated/local | exclude; build/cache/dependency output |
