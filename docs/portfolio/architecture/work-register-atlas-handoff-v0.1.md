# Work Register and Atlas handoff `v0.1`

Date: 2026-07-15  
Status: implemented

The Work Register at `/work/` remains the canonical exhaustive semantic
retrieval surface. The Atlas at `/work/atlas/` is optional. Both routes use a
native local navigation labeled “Work view” with visible Register and Atlas
links and `aria-current="page"` on the local current view. Work remains the
current global navigation section on the nested Atlas route.

The Atlas must consume the routable Register set exactly. Its view-model parity
assertion blocks any production set drift. Both routes use the same approved
search normalization and category/maintenance/evidence semantics and the same
detail href helper.

Compatible state crossing either direction is limited to:

- `q`;
- repeated `category`;
- repeated `maintenance`;
- repeated `evidence`.

Register `sort` does not enter Atlas position. Atlas `relation`, `focus`, zoom,
and viewport origin do not enter Register. The client updates the ordinary
view-switch href after each state transition; without JavaScript the canonical
unconstrained links remain usable.

The Atlas inspector’s “View in Register” link preserves compatible constraints
and targets the Register result region. The project-detail destination remains
the shared native `/work/<slug>/` route. Spatial continuity, source-aware route
motion, and restoration choreography are explicitly deferred.
