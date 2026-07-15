# Project detail invariant `v0.1`

Date: 2026-07-15  
Status: implemented production contract

## Purpose and boundary

The project-detail invariant is the stable semantic contract beneath future editorial project worlds. It preserves work-first orientation, one H1 and summary, truthful state, Markdown narrative, public-safe media and evidence, visible limitations, provenance, routable relations, and deterministic context navigation. World phases may change composition and emphasis but cannot fork these semantics.

Production paths come only from publication-eligible, non-archived `ProjectBundle` values returned by `getPublicProjectBundles()`. Fixture, synthetic, private, unlisted, archived, and otherwise ineligible records never enter the production path set. The current production corpus is empty, so the implemented dynamic route generates zero pages.

## Ownership and anatomy

`ProjectDetailLayout` binds the controlled shell/world profiles and stable extension attributes. `ProjectDetail` composes the invariant in this order:

1. orientation;
2. project header and state summary;
3. lead media or intentional no-media state;
4. Markdown narrative and optional contents;
5. evidence;
6. limitations;
7. process;
8. releases;
9. project links;
10. provenance;
11. related work;
12. context navigation.

Orientation and header always render. Narrative renders only when body content exists. Every data section is guarded by safe meaningful data; provenance renders because the content model requires a meaningful public-safe record.

## Narrative and headings

The route obtains the original production collection entry during `getStaticPaths()`, then calls Astro `render(entry)` and renders `<Content />`. Markdown is never manually parsed or copied into JSON. The page H1 is owned only by `ProjectHeader`; Markdown must begin at H2, use meaningful unique slugs, and avoid level skips. H2/H3 contents render only when at least three meaningful entries exist.

## State and truth

Category, lifecycle, maintenance, evidence, source, version, period, and experimental state remain distinct fields with human labels. Publication does not imply active maintenance; reviewed does not imply verified; private source does not imply unavailable work. Empty administrative states such as not-applicable maintenance are omitted.

## Media and evidence

One deterministic selector prioritizes artwork, interface, diagram, informative image/SVG, documentary media, then decorative media. Only available media with publishable rights, safe sources, required alt/dimensions, and audio/video transcripts survives projection. Additional public media remains accessible after the lead. Missing media renders an intentional textual state without a placeholder.

Evidence retains exact trust and availability. Verified evidence retains its named artifact. Metrics retain method, result, unit, and artifact together. Private and unavailable evidence may state their existence but never expose URLs. Limitations remain visible, ordered process remains causal without invented dates, releases sort newest first without claiming currency, and evidence references retain public endpoints only.

## Links, provenance, and relations

Only explicitly public, safe project links render. Provenance exposes owner, authorship, source availability, rights, review state, and safe review date. It excludes reviewer identity and source, rights, and redaction notes.

Relations require public visibility, a non-synthetic relation, a safe generated endpoint, and meaningful summary. Directed relations preserve incoming/outgoing language; undirected relations do not imply causality. Atlas geometry and counts do not enter project detail.

## Navigation and sparse behavior

Back to Work is an ordinary `/work/` link at the start and end. Previous/next use the same deterministic public Work order, never wrap, and disappear at boundaries. One project renders Back to Work only. Sparse, no-media, no-evidence, no-process, no-release, and no-relation states omit empty furniture.

## Prohibited divergence

Future worlds cannot change route identity, public-data boundaries, H1/summary meaning, native navigation, focus/theme/reduced-motion semantics, evidence trust, limitations visibility, provenance truth, relation safety, or no-JavaScript access. Final category DOM orders, galleries, scene engines, custom type systems, View Transitions, and Atlas continuity are outside this invariant.
