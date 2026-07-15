# Content model

This directory owns the portfolio's build-time content contract. `schemas.ts` is the strict field authority, `enums.ts` owns controlled vocabularies, and `validation.ts` owns cross-entry integrity. Markdown supplies editorial prose; companion JSON supplies repeatable structured evidence, media, process, limitations, releases, and provenance.

Production queries in `queries.ts` read only `projects`, `projectData`, and `projectRelations`. Fixture loading is isolated in `fixture-contract.ts`. Nothing in this layer creates a public route or client bundle.

Run `npm run content:check` after authoring. Generated files under `generated/` and `tests/fixtures/content-expected/` are deterministic and must be regenerated with `npm run content:generate`, never edited manually.

IDs are lowercase ASCII kebab-case. Loader order is never trusted; the model uses an ASCII comparator and explicit tie-breakers. A project is not publishable merely because it parses: publication eligibility also requires public visibility, a publishable lifecycle, complete companion/provenance/rights data, safe accessible media, limitations, and non-synthetic authorship.
