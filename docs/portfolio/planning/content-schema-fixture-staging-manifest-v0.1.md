# Content schema fixture staging manifest v0.1

Status: explicit-path staging contract.

## Include classes

Every included path is repository-owned, contains no private path/URL, and is staged explicitly:

- `package.json`, `package-lock.json`: scripts and exact development-only Node types.
- `src/content.config.ts`: authored Astro collection registry.
- `src/content-model/`: authored schemas/helpers/validators plus approved generated manifest.
- `src/content/navigation.json` and production `.gitkeep` files: deliberately empty production sources.
- `src/content/fixtures/`: synthetic private fixtures and isolated geometric assets.
- `tests/content-model/`: authored unit tests.
- `tests/fixtures/content-invalid/`: isolated authored negative descriptors.
- `tests/fixtures/content-expected/`: generated deterministic summaries.
- `scripts/check-content-manifest.mjs`, `scripts/generate-content-manifest.mjs`, `scripts/test-invalid-content-fixtures.mjs`, `scripts/validate-content-foundation.mjs`: authored offline tooling.
- Required content, QA, planning, design, and implementation documents listed in the final appendix.

## Exclusions

The following unrelated untracked files are excluded: `azwerks-portfolio-prototype-compliance-validator-v0.1.py`, `azwerks-portfolio-prototype-compliance-validator-v0.2.py`, and `scripts/.gitkeep`. Also excluded are `node_modules`, `dist`, `.astro`, private/vault content, caches, temporary test files, exploration/prototype source, and build output.

## Privacy and ownership

All fixtures are synthetic and private. No real project, private repository, credential, local filesystem path, production media, or external copyrighted asset is included. Generated files are source-derived and reproducible. Documentation is ignored by default repository rules and therefore requires deliberate force-add by exact path.

## Final path appendix

Legend: `A` authored, `G` generated, `F` synthetic fixture, `D` documentation. Every item below is owned by the portfolio content-model foundation, privacy-reviewed, and included.

- `package.json` — A; content commands and exact dev type dependency.
- `package-lock.json` — G; reviewed lock resolution.
- `src/content.config.ts` — A; ten build-time collections.
- `scripts/check-content-manifest.mjs` — A; drift gate.
- `scripts/generate-content-manifest.mjs` — A; deterministic generator.
- `scripts/test-invalid-content-fixtures.mjs` — A; negative harness.
- `scripts/validate-content-foundation.mjs` — A; cross-entry/privacy/docs gate.
- `src/content-model/README.md` — D; module ownership contract.
- `src/content-model/enums.ts` — A; vocabularies.
- `src/content-model/error-codes.ts` — A; stable failures.
- `src/content-model/fixture-contract.ts` — A; fixture-only loader.
- `src/content-model/generated/content-model-manifest.json` — G; deterministic manifest.
- `src/content-model/merge.ts` — A; bundles and sorting.
- `src/content-model/publication.ts` — A; eligibility policy.
- `src/content-model/queries.ts` — A; production-only queries.
- `src/content-model/relations.ts` — A; relation integrity/helpers.
- `src/content-model/schemas.ts` — A; strict schemas.
- `src/content-model/source.ts` — A; flat Markdown/safety parsing.
- `src/content-model/types.ts` — A; shared types.
- `src/content-model/validation.ts` — A; cross-entry checks.
- `src/content/navigation.json` — A; empty production navigation.
- `src/content/pages/.gitkeep` — A; empty production source boundary.
- `src/content/project-data/.gitkeep` — A; empty production source boundary.
- `src/content/project-relations/.gitkeep` — A; empty production source boundary.
- `src/content/projects/.gitkeep` — A; empty production source boundary.
- `src/content/fixtures/assets/art-window.svg` — F; geometric art media.
- `src/content/fixtures/assets/interface-grid.svg` — F; geometric interface/specimen media.
- `src/content/fixtures/assets/protocol-diagram.svg` — F; geometric diagram media.
- `src/content/fixtures/navigation.json` — F; private navigation data.
- `src/content/fixtures/pages/about.md` — F; private page.
- `src/content/fixtures/pages/archive.md` — F; private page.
- `src/content/fixtures/pages/contact.md` — F; private page.
- `src/content/fixtures/pages/work.md` — F; private page.
- `src/content/fixtures/projects/absent-image-ledger.md` — F; unavailable-image art.
- `src/content/fixtures/projects/amber-console-study.md` — F; rich software.
- `src/content/fixtures/projects/chromatic-window-study.md` — F; image-led art.
- `src/content/fixtures/projects/field-notes-index.md` — F; limited-media record.
- `src/content/fixtures/projects/folded-protocol-model.md` — F; technical system.
- `src/content/fixtures/projects/long-form-boundary-study.md` — F; boundary stress.
- `src/content/fixtures/projects/minimum-proof-record.md` — F; minimum valid record.
- `src/content/fixtures/projects/paper-signal-system.md` — F; visual system.
- `src/content/fixtures/projects/quiet-workflow-study.md` — F; sparse software.
- `src/content/fixtures/projects/retired-sequence-engine.md` — F; archived record.
- `src/content/fixtures/project-data/absent-image-ledger.json` — F; companion.
- `src/content/fixtures/project-data/amber-console-study.json` — F; companion.
- `src/content/fixtures/project-data/chromatic-window-study.json` — F; companion.
- `src/content/fixtures/project-data/field-notes-index.json` — F; companion.
- `src/content/fixtures/project-data/folded-protocol-model.json` — F; companion.
- `src/content/fixtures/project-data/long-form-boundary-study.json` — F; companion.
- `src/content/fixtures/project-data/minimum-proof-record.json` — F; companion.
- `src/content/fixtures/project-data/paper-signal-system.json` — F; companion.
- `src/content/fixtures/project-data/quiet-workflow-study.json` — F; companion.
- `src/content/fixtures/project-data/retired-sequence-engine.json` — F; companion.
- `src/content/fixtures/project-relations/boundary-related-protocol.json` — F; related edge.
- `src/content/fixtures/project-relations/console-protocol-dependency.json` — F; dependency edge.
- `src/content/fixtures/project-relations/console-supersedes-sequence.json` — F; supersedes edge.
- `src/content/fixtures/project-relations/documentary-shared-method.json` — F; shared-method edge.
- `src/content/fixtures/project-relations/sequence-lineage.json` — F; lineage edge.
- `src/content/fixtures/project-relations/signal-supports-console.json` — F; supports edge.
- `src/content/fixtures/project-relations/study-family.json` — F; family edge.
- `tests/content-model/collections.test.mjs` — A; collection contract test.
- `tests/content-model/fixtures.test.mjs` — A; valid corpus test.
- `tests/content-model/invalid.test.mjs` — A; harness test.
- `tests/content-model/manifest.test.mjs` — A; determinism test.
- `tests/content-model/model.test.mjs` — A; bundle/relation/publication test.
- `tests/content-model/schemas.test.mjs` — A; schema test.
- `tests/content-model/source.test.mjs` — A; frontmatter/body test.
- `tests/fixtures/content-invalid/navigation/cases.json` — F; negative descriptors.
- `tests/fixtures/content-invalid/project-data/cases.json` — F; negative descriptors.
- `tests/fixtures/content-invalid/project-relations/cases.json` — F; negative descriptors.
- `tests/fixtures/content-invalid/projects/cases.json` — F; negative descriptors.
- `tests/fixtures/content-expected/invalid-summary.json` — G; expected negative summary.
- `tests/fixtures/content-expected/valid-summary.json` — G; expected valid summary.
- `docs/portfolio/content/content-boundary-inventory-v0.1.md` — D; source inventory.
- `docs/portfolio/content/content-fixture-catalog-v0.1.md` — D; fixture coverage.
- `docs/portfolio/content/content-model-v0.1.md` — D; architecture.
- `docs/portfolio/content/content-publication-policy-v0.1.md` — D; publication gate.
- `docs/portfolio/content/content-schema-change-policy-v0.1.md` — D; version/change policy.
- `docs/portfolio/content/project-authoring-guide-v0.1.md` — D; author workflow.
- `docs/portfolio/content/project-companion-data-reference-v0.1.md` — D; JSON contract.
- `docs/portfolio/content/project-frontmatter-reference-v0.1.md` — D; Markdown contract.
- `docs/portfolio/content/project-relation-reference-v0.1.md` — D; relation contract.
- `docs/portfolio/planning/content-schema-prerequisite-block-v0.1.md` — D; preserved historical gate evidence.
- `docs/portfolio/planning/content-schema-fixture-staging-manifest-v0.1.md` — D; this explicit review.
- `docs/portfolio/planning/azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md` — D; implementation report.
- `docs/portfolio/qa/content-schema-and-fixture-validation-v0.1.md` — D; command evidence.
- `docs/superpowers/specs/2026-07-14-content-schema-fixture-foundation-design.md` — D; approved design.
- `docs/superpowers/plans/2026-07-14-content-schema-fixture-foundation.md` — D; implementation plan.
- `azwerks-portfolio-content-schema-and-fixture-foundation-implementation-report-v0.1.md` — D; byte-identical root review copy.
