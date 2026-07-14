# azwerks portfolio content schema and fixture foundation implementation report v0.1

## 1. Executive verdict

Complete and ready for draft review. The foundation is static, strict, synthetic-only, deterministic, route-neutral, and passed all required local gates.

## 2. Prerequisite PR verification

Token/theme PR #1 was merged before branch creation. Its merged files and token/check/build gates were verified on `origin/main`.

## 3. Base and branch

Base: `main` at `57c893292b53dd5017502d7cbcae616aa36f3fb3`. Branch: `feat/content-schema-fixture-foundation-v0.1`, created from that exact remote commit.

## 4. Repository state

Work remained in the approved repository. Three unrelated untracked files are preserved and excluded. No work occurred on `main`.

## 5. Boundary inventory

No prior production content or collection model existed. Production sources remain deliberately empty; fixtures and invalid cases are isolated.

## 6. Astro architecture

Astro 7 build-time content collections use current `src/content.config.ts`, built-in glob/file loaders, `astro/zod`, and references.

## 7. Collection list

Production: projects, projectData, projectRelations, sitePages, navigation. Fixture equivalents use the same schemas.

## 8. Fixture isolation

Fixture loaders have separate names and paths. Production queries reference only production collections. A source gate rejects fixture collection use.

## 9. Project schema

One strict schema version 1.0 union governs all projects and rejects unknown fields.

## 10. Category rules

Software, visual-system, art, technical-system, and limited-media add focused requirements without separate models.

## 11. Frontmatter policy

Frontmatter is flat and Obsidian-safe: scalar values and simple string arrays only.

## 12. Body policy

Standard Markdown is accepted. Scripts, event handlers, unsafe URLs, iframes, embeds, local paths, wikilinks, and unreviewed HTML fail fixture parsing.

## 13. Companion schema

Strict companion JSON owns profiles, links, media, evidence, process, limitations, releases, and provenance.

## 14. Links

Links require stable IDs, descriptive labels, safe absolute URLs, and explicit public state.

## 15. Media

Media contracts cover purpose, availability, rights, accessibility text, transcripts, and layout-stabilizing dimensions/ratios.

## 16. Evidence

Trust is separate from lifecycle. Verified evidence names an artifact; metrics require method, unit, and provenance.

## 17. Process

Process steps have stable IDs and unique positive order values with optional evidence links.

## 18. Limitations

Known, accepted, mitigated, and resolved limitations remain explicit and evidence-linkable.

## 19. Releases

Planned, candidate, released, superseded, and withdrawn releases preserve history without implying publication.

## 20. Provenance

Owner, authorship, availability, rights, and review state are mandatory. Private provenance exposes no private URL.

## 21. Relations

Seven typed relation meanings enforce direction, endpoints, uniqueness, rationale, and visibility safety without atlas geometry.

## 22. Site pages

Strict flat page records support future About, Contact, Accessibility, Privacy, and Colophon content without routes.

## 23. Navigation

File-loaded data validates labels, order, target safety, visibility, and non-icon-only meaning; no UI is rendered.

## 24. State vocabularies

Category, lifecycle, visibility, maintenance, trust, rights, source availability, relations, links, media, profiles, limitations, releases, reviews, and navigation kinds are centralized.

## 25. Publication policy

Eligibility is computed from synthetic state, visibility, lifecycle, companion, provenance, rights, media, links, limitations, relations, and validation blocks.

## 26. ID policy

IDs are stable lowercase ASCII kebab-case and match filenames. Published changes require migration and redirect decisions.

## 27. Sorting

Explicit stable sorting uses featured state, lifecycle relevance, date, ASCII title, and ID; loader/filesystem order is never trusted.

## 28. Project bundle

Bundles compute companion, relation groups, publication, period, media/evidence states, search text, relation count, and archive state.

## 29. Query helpers

Required production queries and fixture-only bundle loading are typed and separated.

## 30. Valid fixtures

Ten visibly fictional projects cover all five categories, rich/sparse/no-media/archive/minimum/maximum cases, and three isolated geometric assets.

## 31. Relation graph

Seven meaningful edges cover related, lineage, dependency, shared-method, family, supersedes, and supports.

## 32. Invalid fixtures

Thirty-six isolated descriptors exercise every required negative class outside Astro production loaders.

## 33. Cross-entry validation

Companion cardinality, references, relation integrity, nested IDs/orders, category rules, fixture safety, assets, and publication eligibility are checked.

## 34. Error codes

Stable `CONTENT_*` codes identify slug, frontmatter, schema, reference, privacy, URL, media, evidence, relation, fixture, order, profile, and drift failures.

## 35. Manifest

The deterministic manifest records model/validator/generator versions, collection/enums/schema hashes, fixture counts, coverage, source hash, and generated summary hashes.

## 36. Drift

Generation omits timestamps and uses stable recursive key sorting. Final evidence records two byte-identical runs.

## 37. Authoring docs

Repository/Obsidian-safe authoring, flat frontmatter, companion data, relations, publication, fixtures, and privacy are documented.

## 38. Schema changes

Patch/minor/major rules require versioning, fixtures, migration notes, generated artifacts, docs, and validation.

## 39. Scripts

Focused content sync, unit, validation, negative, generation, and drift scripts are integrated without recursion.

## 40. Dependencies

One exact development-only dependency, `@types/node@24.13.3` (MIT), types Node 24 fixture/generator code. Runtime impact is zero.

## 41. CI

Existing `npm ci`, `npm run check`, and `npm run build` automatically execute content gates. Permissions remain read-only; workflow structure is unchanged.

## 42. Checks

`npm ci`, token regression, content sync/generation/validation/negative/drift, combined check, and diff checks pass. Seven unit suites pass; Astro reports 49 files with zero diagnostics.

## 43. Build

Astro build passes with one static page, unchanged from the prerequisite baseline. No route is added.

## 44. Token regression

The existing token gate remains in both check and build and is rerun before delivery.

## 45. Performance

Client JavaScript, runtime requests, remote sources, and database queries remain zero. Manifest size is 5,127 bytes (1,841 gzip), fixtures total 32,618 bytes, `index.html` is 2,256 bytes, and complete static output is 30,573 bytes with no emitted JavaScript.

## 46. Files changed

Changes are confined to content configuration/model/sources, synthetic fixtures, tests, offline scripts, package scripts/types, generated manifests, and required documentation.

## 47. Deferred work

Global shell/navigation UI, homepage, register/atlas UI, project routes/world layouts, real content, migration/sync, CMS/API/database, MDX, analytics, deployment, and production assets remain deferred.

## 48. Risks

Production collections intentionally emit empty-loader warnings until real content is separately approved. Future authors must keep companion/reference versions synchronized.

## 49. Commit

Planned: `feat: establish content schema and fixture foundation` after every required gate passes.

## 50. Pull request

Planned draft PR from the content branch to `main`; it will not be merged in this task.

## 51. Next prompt

`azwerks-portfolio-global-shell-and-navigation-codex-prompt-v0.1.md` is recommended after review and merge; it is not written or executed here.

## 52. Checklist

Prerequisite, collection, schema, fixture, truth/privacy, deterministic generation, and local validation gates pass. Explicit staging, commit, push, and draft PR are the remaining delivery actions; no merge is authorized.
