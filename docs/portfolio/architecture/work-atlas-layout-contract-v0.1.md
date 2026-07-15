# Work Atlas layout contract `v0.1`

Date: 2026-07-15  
Algorithm: `equal-regions-grid-1.0.0`

## Position meaning

Position encodes only the canonical category field, curated `defaultIndex`, and
stable ID tie-breaking. It does not encode quality, importance, popularity,
featured state, evidence, maintenance, completion, recency, commercial value,
or relation degree. Node base geometry is invariant at 240 by 88 plane units.

The five equal-width fields appear in canonical category order: Software,
Visual system, Art, Technical system, and Limited media. That stable reading
order is not a rank. Every field has the same width, height, boundary role, and
heading treatment; none is a central hub.

## Placement and collision handling

Records sort by curated index and stable ID within their category. Each field
uses two fixed columns, fixed cell gaps, and enough rows for its population.
All fields share the maximum required row height. The plane is bounded by
declared padding. A bounded occupied-cell scan resolves any cell collision and
throws `WORK_ATLAS_COLLISION_UNRESOLVED` rather than shrinking or overlapping a
node. Duplicate project IDs fail with `WORK_ATLAS_NODE_DUPLICATE`.

Tests at 0, 1, 10, 50, and 200 compare every node rectangle pair, verify plane
bounds, field membership, uniform dimensions, deterministic serialization, and
stable region geometry. All tested base layouts have zero overlaps.

## Relation geometry

Only explicit `AtlasRelation` values enter geometry. Endpoints intersect the
boundary of the uniform source and target rectangles rather than their center.
A deterministic cubic path then uses dominant axis, relation-type order, and
stable endpoint coordinates. Directional types receive arrow markers;
undirected types do not. Duplicate edge IDs fail with
`WORK_ATLAS_EDGE_DUPLICATE`; missing, self, or unsafe endpoints fail with
`WORK_ATLAS_RELATION_ENDPOINT`.

Line pattern, arrow geometry, text labels, inspector sentences, and the
semantic index carry relation meaning without depending on color. At 50 or
more nodes, or more than 40 relations, the visual policy is `focused`; the
complete relation index and every relation path remain in the document.

## Determinism and manifest

No clock, random seed, locale comparison, browser measurement, viewport size,
or runtime simulation enters layout. Integer plane geometry and three-decimal
path normalization produce stable bytes. The production manifest was generated
twice with byte identity. Its embedded manifest hash is
`0d73217a1047aa0ebd777840abb199e4ff17d41c24c37a3dca081a98c5e8a5f4`;
the file SHA-256 is
`d324b50927a95d997239687cd16a74da3df33b6197010f2e4e4351690a6c5116`.

The isolated 200-record manifest remains below the 250 KB uncompressed budget.
The current production zero manifest is 0-node/0-edge and intentionally keeps
valid region/plane policy metadata.
