# Content Schema and Fixture Foundation Design

Status: approved design, pending implementation  
Date: 2026-07-14  
Base: `origin/main` at `57c893292b53dd5017502d7cbcae616aa36f3fb3`  
Work branch: `feat/content-schema-fixture-foundation-v0.1`

## Purpose

Establish a repository-owned, build-time content model for the azwerks
portfolio without creating public routes or migrating real content. The model
supports software, visual-system, art, technical-system, and limited-media
projects through one canonical contract with category-specific validation.

The foundation must keep Markdown prose simple, move complex repeatable data to
strict JSON companions, make relations first-class, preserve privacy and rights
boundaries, and provide deterministic queries and generated evidence.

## Selected approach

Use one Node-native TypeScript schema kernel under `src/content-model/`.
Astro's collection configuration imports that kernel and adds collection-aware
references. Repository scripts import the same kernel directly under pinned
Node 24, so schema behavior is not duplicated and no TypeScript runner or
additional schema package is required.

The rejected alternatives are:

1. Separate Astro and script schemas. This is initially simple but creates two
   validation authorities and makes drift likely.
2. Custom Astro loaders. They could centralize cross-entry behavior, but the
   built-in local loaders already satisfy the source model and are easier to
   audit.
3. A new test or frontmatter dependency. The required checks can use Astro,
   `astro/zod`, Node built-ins, and a deliberately narrow flat-frontmatter
   parser aligned with the authoring contract.

## Collection architecture

`src/content.config.ts` defines ten build-time collections:

| Collection | Source | Loader | Schema relationship |
|---|---|---|---|
| `projects` | Markdown | `glob()` | Canonical project discriminated union |
| `projectData` | JSON | `glob()` | Companion schema referencing `projects` |
| `projectRelations` | JSON | `glob()` | Relation schema referencing `projects` twice |
| `sitePages` | Markdown | `glob()` | Flat page schema |
| `navigation` | JSON array | `file()` | Navigation item schema |
| `fixtureProjects` | Markdown | `glob()` | Same project schema, fixture refinements |
| `fixtureProjectData` | JSON | `glob()` | Same companion schema, fixture project reference |
| `fixtureProjectRelations` | JSON | `glob()` | Same relation schema, fixture project references |
| `fixtureSitePages` | Markdown | `glob()` | Same page schema, fixture refinements |
| `fixtureNavigation` | JSON array | `file()` | Same navigation schema, fixture refinements |

All loaders are local and build-time. No live loader, API, database, CMS,
Obsidian loader, custom loader, or remote source is introduced. Astro's current
content-layer contract is documented in the official
[content collections guide](https://docs.astro.build/en/guides/content-collections/),
[loader reference](https://docs.astro.build/en/reference/content-loader-reference/),
and [`astro:content` API reference](https://docs.astro.build/en/reference/modules/astro-content/).

Production collections may be empty in this phase. Fixture collections are
separate sources with separate query entry points. Production query modules
must not name or import fixture collections.

## Schema kernel

`enums.ts` owns every controlled vocabulary. `schemas.ts` owns strict Zod
schemas and collection-target factories. `types.ts` exports inferred authored
and computed types. Unknown object keys fail.

Project frontmatter is a strict discriminated union on `category`. It permits
only simple scalars and string arrays. Shared rules cover stable IDs, bounded
text, dates, visibility, lifecycle, maintenance, fixture flags, and optional
editorial metadata. Category rules add only the minimum required distinctions:

- software requires public-purpose summary, capabilities, platforms, and a
  maintainable state;
- visual-system requires a system premise and companion proof, limitation, or
  explicit incomplete state;
- art requires medium, year or period, rights, and artwork availability;
- technical-system requires purpose, compatibility/platform, maintenance or
  version state, and inspectable companion material;
- limited-media requires documentary purpose and an intentional companion
  absence/evidence/limitation contract.

Complex links, media, evidence, process, limitations, releases, and provenance
live only in companion JSON. Relations live only in relation JSON. The
frontmatter parser accepts the documented flat YAML subset and rejects nested
mappings, object arrays, local paths, Obsidian constructs, expressions, and
unknown fields before schema parsing.

Markdown body validation scans raw fixture bodies for prohibited HTML,
scripts, inline handlers, unsafe URLs, iframes, local paths, wikilinks, and
Obsidian embeds. Markdown rendering remains Astro's standard Markdown pipeline;
MDX is not enabled. The later route layer may use Astro's `render()` API as
documented in the official
[Markdown guide](https://docs.astro.build/en/guides/markdown-content/).

## Cross-entry model

Individual Zod parsing is followed by deterministic cross-entry validation:

1. normalize and sort source entries by ASCII ID;
2. enforce filename/declared-ID agreement;
3. require exactly one companion for every project;
4. reject orphan or duplicate companions;
5. validate nested ID uniqueness and process ordering;
6. resolve evidence references;
7. validate category requirements against companion data;
8. validate relation endpoints, direction, uniqueness, visibility, and
   rationale;
9. enforce fixture isolation and zero publication eligibility;
10. scan every public-facing field for unsafe URLs, local paths, credentials,
    private hosts, and private identifiers.

Stable `CONTENT_*` error codes identify failures. Human-readable diagnostics
may evolve, but tests assert codes and source IDs rather than full prose.

## Query and bundle design

Pure merge, relation, publication, and sorting functions accept typed entries
and return deterministic results without importing Astro runtime APIs. Astro
query adapters call `getCollection()` and `getEntry()` and feed those pure
functions.

`queries.ts` exposes production-only helpers. `fixture-contract.ts` is the only
module allowed to query fixture collections. Both reuse the same pure bundle
builder, which computes publication eligibility, display period, media state,
evidence state, relation count, search text, and archive state.

Sorting never depends on filesystem, loader, object-key, or environment-locale
order. Comparisons use normalized ASCII values and explicit descending numeric
or date keys with ID as the final tie-breaker.

## Publication, privacy, and truth gates

Publication eligibility is computed, never authored. A project is eligible
only when it is non-synthetic, public, approved or published, fully paired with
companion data, provenance-complete, rights-safe, accessible-media-safe,
link-safe, limitation-complete, relation-safe, and free of validation blocks.

Every fixture is synthetic, private, noindex, and ineligible. The validator
fails if a fixture is public, unlisted, featured, or otherwise eligible.
Private or unavailable evidence and media carry no private location. Public
media cannot use unknown rights. Informative media requires alternative text;
audio and video require a transcript contract. Verified evidence requires a
named artifact, and metrics require method, unit, and provenance.

## Fixture strategy

The valid fixture set is frozen as `synthetic-content-fixtures-v0.1`. Ten
fictional projects cover all five categories, rich and sparse software,
visual-system specimens, available and unavailable art, technical systems,
limited media, archive state, long-content stress, and the minimum valid model.
Companions and relations exercise media, evidence, release, limitation,
provenance, and graph behavior without resembling real azwerks work.

Invalid fixtures remain under `tests/fixtures/content-invalid/`, outside every
Astro loader pattern. A dependency-free harness executes at least 35 named
cases, verifies each expected error code, and confirms source hashes before and
after the run so temporary processing cannot mutate fixtures.

## Deterministic generation

`generate-content-manifest.mjs` validates the complete fixture model and emits
`src/content-model/generated/content-model-manifest.json` with stable sorted
keys and no current timestamp. It records schema and source hashes, collection
names, enum values, fixture counts, category and relation coverage,
publication-eligible count, validator version, and generated-file hashes.

The drift checker regenerates in a repository-local temporary directory,
compares bytes, and removes temporary files in `finally`. Two consecutive
generations must be byte-identical.

## Validation and delivery

The script chain preserves every token gate and adds content sync, validation,
negative tests, and generated drift checks. `npm run check` and `npm run build`
remain the CI entry points. No dependency or CI permission is added.

Validation covers Astro sync, source schemas, cross-entry integrity, fixture
isolation, publication eligibility, unsafe-source scans, deterministic sorting,
negative cases, manifest drift, Astro/TypeScript diagnostics, token regression,
and static build. Since no route is added, browser and route claims are out of
scope. Performance evidence records zero client JavaScript, network, remote
content, and database impact plus source and generated artifact sizes.

All documentation, generated files, fixtures, and implementation changes are
reviewed through an explicit staging manifest and delivered in one focused
commit, normal push, and draft pull request.

## Scope boundary

This design does not create navigation UI, routes, project layouts, a register,
an atlas, production content, media assets, migration, CMS integration, MDX,
analytics, or deployment behavior. It does not import exploration source or
alter the token/theme contract.
