# Work Atlas data contract `v0.1`

Date: 2026-07-15  
Status: implemented

## Source and parity

Production data begins with `getPublicProjectBundles()`. Atlas projection then
requires the same `createWorkRegisterRecords()` destination set and the same
`getProjectDetailRouteRecords()` set. Any ID/order mismatch throws
`WORK_ATLAS_REGISTER_PARITY`; the Atlas never repairs disagreement by silently
adding or removing a record.

`AtlasRecord` contains ID, slug, shared local detail href, title/short title,
summary, category and label, frozen project world, optional public state
labels, curated index, and approved normalized search text. `AtlasRelation`
contains stable relation ID, safe source/target IDs, the content-model relation
type, public label, directionality, and public summary.

## Exclusions

Archived, synthetic, private, unlisted, publication-ineligible, and unroutable
bundles are excluded centrally and counted by reason. Relations must survive
`createPublicProjectRelations()`, have two Atlas endpoints, be public,
non-synthetic, non-self, and unique. Unsafe endpoints are counted and omitted.
No proximity, category co-membership, featured state, or relation degree creates
an edge.

Production projection never serializes companions, local/source paths,
external/private URLs, raw media/evidence, reviewer identity, rights/source/
redaction notes, internal provenance, or publication reasons.

## Search, routes, and serialization

Search uses the already-approved Register `searchText`, normalization, term-AND
matching, and category/maintenance/evidence filter semantics. The only project
destination comes from `getProjectDetailHref()`. Query state cannot affect
publication eligibility.

The generated manifest contains schema version, counts, exclusions, category
and relation distributions, plane/region geometry, node coordinates, explicit
edge paths, density policy, algorithm version, layout-policy hash, public-data
hash, and manifest hash. It contains no timestamp, session/viewport state,
local path, private field, or fixture identifier. Canonical construction and
sorted inputs make serialization deterministic.

Current production counts are 0 records, 0 archived production records,
0 detail routes, and 0 safe public relations. The generated zero-state manifest
is valid and remains the production truth until reviewed real content exists.
