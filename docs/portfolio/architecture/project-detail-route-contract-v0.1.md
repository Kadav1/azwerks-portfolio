# Project detail route contract `v0.1`

Date: 2026-07-15  
Canonical pattern: `/work/<slug>/`

## Static generation

`src/pages/work/[slug].astro` exports a typed static `getStaticPaths()` and the repository remains `output: 'static'`. It calls `getPublicProjectBundles()`, derives the deterministic route records, joins only the corresponding production Markdown entries, and passes a public-safe view model plus the entry needed by Astro `render()`. It does not enable on-demand rendering, query fixtures, call a runtime content API, or fetch content.

Zero eligible production bundles returns an empty path array and produces no `/work/<slug>/` output. Unknown slugs therefore have no generated page and resolve through the static host's 404 behavior.

## Canonical helper

`getProjectDetailHref(slug)` in `src/lib/project-detail/routes.ts` is the sole href constructor. It accepts lowercase ASCII kebab-case and returns `/work/<slug>/`; unsafe slugs fail with `PROJECT_DETAIL_BROKEN_HREF`. `getProjectDetailRouteRecords()` preserves bundle order and fails with `PROJECT_DETAIL_SLUG_DUPLICATE` while naming both source IDs.

`createWorkRegisterRecords()` uses this helper and `isProjectDetailRoutable()` for each eligible non-archived record. There is no Boolean route-availability shortcut or inline path construction.

## Manifest

`src/lib/project-detail/generated/project-detail-route-manifest.json` contains model/helper versions, source count, route count, sorted public ID/slug/href records, exclusion counts, and a SHA-256 content hash. It contains no titles, source paths, notes, private URLs, fixture IDs, or timestamp. Generation is byte deterministic; drift fails `detail:check:generated`.

Current manifest: `0` source bundles, `0` routes, all exclusion counts `0`, hash `9244673ac3561024a157f491aa742f2ca3dba26b769b6ae409270a65c3a05839`.

## Context order and metadata

Previous/next uses the same ordered route records as the public Work query. It does not wrap. Canonical metadata uses the helper href. `noindex` is false only inside a genuinely routable production view model; the temporary audit clones set it true.

Archived publication policy is unchanged. A future archive-detail decision must extend the publication/query contract rather than silently routing archived records through this helper.
