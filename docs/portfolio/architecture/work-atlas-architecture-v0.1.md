# Work Atlas architecture `v0.1`

Date: 2026-07-15  
Status: implemented production contract

## Purpose and Register boundary

`/work/atlas/` is an optional spatial discovery surface for the same current,
public, non-archived, routable projects exposed by the canonical Work Register.
It supports category orientation and explicit relation discovery. It does not
replace `/work/`, index archived work, rank projects, or create a second content
or relation model.

The route calls `getPublicProjectBundles()`, projects through
`createAtlasViewModel()`, and creates deterministic layout through
`createAtlasLayout()`. The view model reuses `createWorkRegisterRecords()`,
`getProjectDetailRouteRecords()`, `createPublicProjectRelations()`, and
`getProjectWorldDefinition()`. It throws on Register/Atlas routable-set drift.

## Component ownership

`WorkAtlas` owns corpus branching and enhancement gating. `AtlasHeader`,
`AtlasViewSwitch`, and `AtlasHelp` own identity, local navigation, and the
plain-language position/size/relation explanation. `AtlasLegend` separates
category and relation meaning. `AtlasControls` owns the native form and visible
view buttons. `AtlasViewport`, `AtlasPlane`, `AtlasRegion`, `AtlasNode`, and
`AtlasRelations` own the optional HTML/SVG spatial representation.
`AtlasInspector` supplements explicit selection. `AtlasIndex` owns the complete
native project and relation links. `AtlasEmptyState` owns the truthful zero
state.

The TypeScript modules separately own public projection, region policy,
relation language, deterministic geometry, query state, URL handoff, and
manifest serialization. `work-atlas.ts` owns DOM enhancement only and makes no
content or relation request.

## Baseline and enhancement

With no JavaScript, the route retains its H1, explanation, view switch, help,
category/relation legends, category-grouped project links, summaries, and
complete relation sentences. Enhanced controls and the spatial viewport carry
`hidden` until initialization completes. The semantic indexes remain open and
available after enhancement.

Successful initialization sets `data-atlas-enhanced="true"`. Any owned error
restores every node and edge, removes plane transforms, hides controls and the
spatial viewport, opens the complete indexes, and displays the spatial-view
failure explanation. No content is created by client JavaScript.

## Corpus states

Zero public routes produce no controls, no plane, a Register link, and
`noindex`. One project produces one uniform node and no relation layer. Sparse
sets preserve all five fields and show all safe relation lines. Sets at 50 or
more records use focused-edge visual policy by default; 200 records remain
fully present in HTML and the semantic indexes. Pagination, aggregation,
virtualization, or another dense-map strategy requires a later decision if the
real corpus and route HTML justify it.

## Responsive behavior

The page itself remains inline-size bounded. The labeled map viewport is the
only intentional two-axis scroll region and retains native scrollbars and
touch panning. On narrow screens the complete index precedes the spatial
workspace in visual order. Controls wrap, the inspector remains in document
order, and wide-screen layout may place the non-modal inspector beside the
viewport. Print omits the interactive workspace and prints legends/indexes.

## Prohibited use and extension seam

The Atlas is not a canvas/WebGL surface, force graph, recommendation system,
importance map, archive, popularity rank, thumbnail wall, game, or route
transition engine. It contains no runtime force/randomness, third-party graph
package, remote query, frontend framework, authored mark, analytics, or
continuous animation.

A future spatial-continuity phase may read Atlas focus and source context only
after navigation/focus restoration remains correct without animation. It may
not move publication, layout, relation, or inspector semantics into a
transition layer.
