# Work Register staging manifest `v0.1`

Date: 2026-07-15  
Branch: `feat/work-register-v0.1`  
Base: `2a1b16118914f66b7d20f3ea9582b86aa76521dc`

All included paths are authored unless marked test data. All depend on the
merged token, content, and shell contracts as applicable. Privacy review found
no private paths, URLs, content, media, provenance notes, or secrets.

| Path | Purpose | Status / owner | Dependencies | Decision and reason |
| --- | --- | --- | --- | --- |
| `package.json` | Register scripts and composite gates | Authored / QA | token, content, shell | Include: required non-recursive gates; no dependency change |
| `scripts/validate-global-shell.mjs` | Recognize componentized promoted Work route | Authored / shell QA | shell, register | Include: preserves shell regression gate |
| `scripts/validate-work-register.mjs` | Static production-boundary validator | Authored / register QA | all foundations | Include: stable register error codes |
| `scripts/test-work-register-state.mjs` | In-process state test entry | Authored / register QA | Node 24 | Include: avoids sandbox subprocess boundary |
| `scripts/browser-work-register-audit.mjs` | Temporary-route browser and performance audit | Authored / register QA | Astro, Chrome | Include: removes harness and rebuilds production in `finally` |
| `src/pages/work/index.astro` | Canonical production route | Authored / route | shell, public query | Include: production deliverable |
| `src/components/work/WorkRegister.astro` | Result landmark/list/branch composition | Authored / register | view model, shell target | Include |
| `src/components/work/WorkRegisterHeader.astro` | H1 and corpus-aware introduction | Authored / register | corpus count | Include |
| `src/components/work/WorkRegisterControls.astro` | Native enhancement-gated form | Authored / controls | records, labels | Include |
| `src/components/work/WorkSearch.astro` | Labeled bounded search | Authored / controls | query contract | Include |
| `src/components/work/WorkFilterGroup.astro` | Native checkbox fieldset | Authored / controls | filter contract | Include |
| `src/components/work/WorkSortControl.astro` | Native sort select | Authored / controls | sort contract | Include |
| `src/components/work/WorkRegisterSummary.astro` | Visible count/constraints and live region | Authored / summary | state summary | Include |
| `src/components/work/WorkRegisterEmptyState.astro` | Corpus/filter/failure states | Authored / register | state contract | Include |
| `src/components/work/ProjectRegisterItem.astro` | Controlled semantic item | Authored / item | item contract, tokens | Include |
| `src/components/work/ProjectPreview.astro` | Optional intrinsic public preview | Authored / preview | media contract, tokens | Include |
| `src/lib/work-register/types.ts` | Serializable record/state types | Authored / model | content enums | Include |
| `src/lib/work-register/constants.ts` | Bounds, valid values, defaults | Authored / state | content enums | Include |
| `src/lib/work-register/labels.ts` | Governed public labels | Authored / model | content enums | Include |
| `src/lib/work-register/query-state.ts` | Parse/normalize/summarize | Authored / state | constants, labels | Include |
| `src/lib/work-register/filter.ts` | Pure AND/OR retrieval | Authored / state | query normalization | Include |
| `src/lib/work-register/sort.ts` | Pure stable sort modes | Authored / state | record keys | Include |
| `src/lib/work-register/url.ts` | Stable repeated-value serialization | Authored / state | query normalization | Include |
| `src/lib/work-register/view-model.ts` | Public-safe bundle projection/archive split | Authored / model | `ProjectBundle`, publication | Include |
| `src/scripts/work-register.ts` | Framework-free enhancement/history/fail-open | Authored / interaction | pure state modules | Include |
| `src/styles/work-register.css` | Responsive semantic-token presentation | Authored / styling | token/theme/world aliases | Include |
| `tests/work-register/state.test.mjs` | Pure behavior and scale tests | Authored test / QA | state/model modules | Include |
| `tests/support/work-register-fixtures.ts` | Isolated public-shaped synthetic records | Authored test / QA | register types only | Include: never imported by production |
| `tests/fixtures/work-register/expected-states.json` | Dataset and state expectations | Test data / QA | none | Include: non-public deterministic fixture |
| `docs/portfolio/architecture/work-register-existing-state-v0.1.md` | Pre-change inventory | Authored / architecture | merged base | Include |
| `docs/portfolio/architecture/work-register-architecture-v0.1.md` | Durable system architecture | Authored / architecture | implementation | Include |
| `docs/portfolio/architecture/work-register-query-state-contract-v0.1.md` | URL/history semantics | Authored / architecture | pure state | Include |
| `docs/portfolio/architecture/project-register-item-contract-v0.1.md` | Item/media/destination contract | Authored / architecture | view model/components | Include |
| `docs/portfolio/qa/work-register-validation-v0.1.md` | Actual QA and measured limitations | Authored / QA | validators/audit | Include |
| `docs/superpowers/plans/2026-07-15-work-register.md` | Repository-specific execution plan | Authored / planning | approved prompt | Include: test-first traceability |
| `docs/portfolio/planning/work-register-staging-manifest-v0.1.md` | Explicit staging boundary | Authored / Git safety | complete diff | Include |
| `docs/portfolio/planning/azwerks-portfolio-work-register-implementation-report-v0.1.md` | Canonical review record | Authored / planning | all evidence | Include |
| `azwerks-portfolio-work-register-implementation-report-v0.1.md` | Root review copy | Authored copy / planning | canonical report | Include: repository convention |

## Explicit exclusions

| Path | Decision and reason |
| --- | --- |
| `azwerks-portfolio-prototype-compliance-validator-v0.1.py` | Exclude: pre-existing unrelated untracked exploration tool |
| `azwerks-portfolio-prototype-compliance-validator-v0.2.py` | Exclude: pre-existing unrelated untracked exploration tool |
| `scripts/.gitkeep` | Exclude: pre-existing unrelated untracked placeholder |
| `node_modules/` | Exclude: installed dependency output |
| `dist/` | Exclude: generated build output |
| `.astro/` | Exclude: generated Astro metadata |
| `src/pages/work-register-audit/` | Exclude and require absent: temporary browser harness |
| `public/` media and screenshots | Exclude: no real or synthetic production asset authorized |
| `.github/workflows/ci.yml` | Unchanged: existing least-privilege CI already runs composite `check` and `build`, which now include `register:check`; browser audit remains explicit pre-review |

Staging uses explicit paths from the include table. No broad `git add -A`,
stash, reset, cleanup, history rewrite, or force push is authorized.
