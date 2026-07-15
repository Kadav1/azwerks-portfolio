# Work Atlas relation language `v0.1`

Date: 2026-07-15  
Source enum: `src/content-model/enums.ts`

| Type | Label | Direction | Source wording | Target wording | Pattern | Arrow | Semantic sentence form |
|---|---|---|---|---|---|---|---|
| `related` | Related | none | is related to | is related to | solid | no | A is related to B. |
| `lineage` | Lineage | source → target | leads by lineage to | has lineage from | long dash | yes | A leads by lineage to B. |
| `dependency` | Dependency | source → target | depends on | is a dependency of | dash | yes | A depends on B. |
| `shared-method` | Shared method | none | shares a method with | shares a method with | dot | no | A shares a method with B. |
| `family` | Family | none | belongs to a family with | belongs to a family with | compound/double sample | no | A belongs to a family with B. |
| `supersedes` | Supersedes | source → target | supersedes | is superseded by | dash-dot | yes | A supersedes B. |
| `supports` | Supports | source → target | supports | is supported by | short dash | yes | A supports B. |

Every type appears in the separate relation legend, SVG class, inspector
summary, filter label, and complete relation index. Directional geometry uses
an arrow marker and source/target order. Undirected geometry uses no arrow and
does not imply causality. Relation summaries remain content-authored public
text; the UI does not replace them with inferred explanations.

Forced-colors mode retains dash patterns and arrows with system colors. Print
retains textual labels and sentences instead of the giant relation plane.
Color is a secondary structural cue only.

No UI-only relation type, proximity edge, recommendation, strength score, or
relation count as quality is permitted. New relation language must begin with a
content-model review rather than a local Atlas addition.
