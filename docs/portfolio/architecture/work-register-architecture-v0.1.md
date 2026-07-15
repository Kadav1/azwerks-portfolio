# Work Register architecture `v0.1`

Date: 2026-07-15  
Status: implemented production foundation

## Canonical role

`/work/` is the exhaustive accessible retrieval surface for current public
work. The future Atlas may enhance the same dataset and state contract, but it
must never replace, fork, or weaken this server-rendered register.

## Production data boundary

The route calls `getPublicProjectBundles()` and immediately projects the result
through `createWorkRegisterRecords()`. Projection accepts only publication-
eligible bundles and removes `archiveState === true`; it does not recreate the
content publication policy. Production modules never import fixture
collections or fixture helpers.

The serializable view model exposes only public identity, category, lifecycle,
maintenance, display period, evidence/media state, discovery strings, stable
sort keys, optional public preview metadata, and an optional destination.
Private links, source/rights/redaction notes, evidence detail, provenance
detail, relation data, and content source paths are not serialized.

## Component ownership

- `WorkRegister` owns the result landmark, semantic ordered list, category
  navigation, corpus branching, filter-empty/failure blocks, and script gate.
- `WorkRegisterHeader` owns the route H1 and corpus-aware introduction.
- `WorkRegisterControls` composes the native form, progressive filter
  disclosure, Apply, and Reset.
- `WorkSearch`, `WorkFilterGroup`, and `WorkSortControl` own native labeled
  controls.
- `WorkRegisterSummary` owns visible count/constraints and a separate polite
  announcer so initialization does not create announcement noise.
- `ProjectRegisterItem` owns controlled item hierarchy and bounded discovery
  terms; `ProjectPreview` owns one optional intrinsic-size public image.
- `WorkRegisterEmptyState` owns distinct corpus, filter, and fail-open states.
- Pure modules own types, labels, normalization, URL state, filtering, sorting,
  summaries, and view-model projection.
- `work-register.ts` owns DOM enhancement only. It never queries content,
  fetches, routes to detail, stores state outside the URL, or owns Atlas state.

## No-JavaScript and enhancement model

Every public non-archived record is emitted as static list HTML in the content
model's curated order. Category jump links remain available. The form carries
`hidden` until the client has parsed the URL, synchronized controls, and
rendered successfully. In scripting-capable browsers, CSS reserves the exact
control geometry with `visibility: hidden` before initialization, preventing
layout shift; with scripting disabled, no blank reservation or inert form is
present.

Enhancement toggles `hidden` on existing list items, reorders their existing
nodes, and updates text with safe DOM APIs. It creates no content and performs
no network request. Any owned failure removes enhanced state, hides controls,
restores every item in curated order, and reveals an explanatory error block.

## Retrieval and state

Search covers title, short title, summary, category, tags, capabilities,
platforms, and approved tools. It uses NFKC whitespace normalization, NFKD
diacritic removal for matching, case folding, term-AND matching, and a 120-code-
unit bound. Filter groups combine with AND; repeated values within one group
combine with OR. Category supports all five governed types. Maintenance and
evidence options are derived only from states present in the current public
corpus.

Curated preserves `defaultIndex`. Recent uses descending release/update/start/
year keys with curated index and ID tie-breakers. Title uses normalized title
then ID. Comparisons are environment-locale independent and never mutate input.

Only `q`, `category`, `maintenance`, `evidence`, and `sort` are recognized.
Apply and Reset use `pushState`; initial invalid/duplicate normalization uses
`replaceState`; `popstate` restores controls, visibility, order, count, and
constraints. No keystroke creates history or an announcement.

## Empty, indexing, and destination states

The current public corpus is zero. The production route therefore omits
controls, renders a truthful corpus-empty state, and remains `noindex`. It also
remains `noindex` whenever no valid project-detail destination exists. The
canonical remains `/work/`; query states are interactions, not SEO documents.

When a corpus exists but constraints match nothing, controls remain available,
active constraints are stated, and Reset restores all records. Titles are
ordinary text until the project-detail route contract exists. No disabled or
broken anchor is rendered.

## Preview and responsive behavior

One preview is selected only from an available image with publishable rights,
nonempty alternative text, and positive intrinsic width and height. It is lazy
loaded, reserves dimensions, preserves art fidelity with `object-fit: contain`,
and may show its public caption. Missing media renders no placeholder. The
limited-media presentation remains type-led.

The mobile baseline is one column, full-width search, native disclosure,
wrapped facts, and 44px primary controls. At the governed workspace breakpoint
the form becomes a compact rail and preview may occupy a secondary column. No
dashboard sidebar, modal filter drawer, horizontal carousel, or page-level
horizontal overflow is introduced. Forced colors, print, reduced motion, and
200% text are explicit or inherit the global token contract.

## Fixture harness and scale

`tests/support/work-register-fixtures.ts` creates public-shaped synthetic
records without altering content fixtures or publication metadata. The browser
audit temporarily writes `src/pages/work-register-audit/[size].astro`, builds
0/1/10/50/200 static routes, runs headless Chrome assertions, removes the route
in `finally`, and performs a production rebuild. Static validation blocks any
committed or built harness residue.

At roughly 200–300 real records, remeasure HTML/DOM cost and introduce a
separate accessible pagination decision if needed. This phase does not hide
pagination, virtualize, or progressively load records.

## Project-detail and Atlas handoff

The next phase may make `href` available only after a valid detail-route
contract exists. A future Atlas consumes the same public view model and URL
state, preserves register parity, and leaves the register usable when removed.

## Prohibited use

The register is not a card-grid generator, archive index, relationship map,
remote search client, analytics surface, popularity rank, saved-search store,
command palette, content API, or fixture preview route.
