# Work Atlas existing state `v0.1`

Date: 2026-07-15  
Status: verified pre-implementation record  
Repository: `Kadav1/azwerks-portfolio`  
Required branch: `feat/work-atlas-v0.1`

## Prerequisite and Git state

Fresh `origin/main` resolved to
`4ec096653cec9768669602253dc301ea6bd32000`, the merge commit for PR #6.
GitHub reported PR #6 merged into `main` on 2026-07-15 at 10:02:26 UTC with
project-world commit `8d0859f3d9b7e6bedffb04eb9a56eb0db33c2120` as its feature parent.

Merged prerequisite sequence:

| Foundation | Feature commit | Merge commit |
|---|---|---|
| token/theme | `4d924bc53a06819d94669028bc1ac0431e2886e0` | `57c893292b53dd5017502d7cbcae616aa36f3fb3` |
| content schema/fixtures | `f7aa6fef18364c0a2b16723efe96fb100b2ddb07` | `1df784993abc5545cebee31601da1b2a5d93863e` |
| global shell | `a9010937eee7dcbdd56345485face8917477b5d9` | `2a1b16118914f66b7d20f3ea9582b86aa76521dc` |
| Work Register | `4c83e22358bbf56633ae712db48cf4bdba3a974e` | `f83ec2b61929b0af36c668324c8d52e3edd9ef97` |
| project detail | `013268526ce631e36480618c1e845067dec607df` | `2937ac391a37d574b74c4a9eff6d2eef020044eb` |
| project worlds | `8d0859f3d9b7e6bedffb04eb9a56eb0db33c2120` | `4ec096653cec9768669602253dc301ea6bd32000` |

The feature branch was created directly from that `origin/main`. The tracked
tree was clean. Three unrelated pre-existing untracked paths were recorded and
are excluded from this phase: two root prototype-compliance validator copies
and `scripts/.gitkeep`. No stash, reset, discard, deletion, or staging operation
was used during the gate.

The prerequisite command set passed under Node `24.16.0` and npm `11.13.0`:
clean `npm ci`, token/content/shell/Register/detail/world checks, full Astro
check, and static build. The ambient shell initially selected Node 22 and the
mounted sandbox rejected the esbuild install executable; rerunning the locked
install with the repository-required Node 24 runtime outside that execution
restriction succeeded without source changes.

## Production and fixture baseline

| Measure | Current value |
|---|---:|
| public production projects | 0 |
| public production archived projects | 0 |
| generated detail routes | 0 |
| generated project-world routes | 0 |
| safe public production relations | 0 |
| valid synthetic fixture projects | 10 |
| publication-eligible fixture projects | 0 |
| invalid fixture cases | 36 |
| fixture relations | 7 |

Fixture category distribution is software 3, visual system 1, art 2,
technical system 2, and limited media 2. Fixture lifecycle distribution is
draft 1, candidate 3, reviewed 5, approved 0, published 0, and archived 1.
Fixture relation distribution is exactly one each of related, lineage,
dependency, shared method, family, supersedes, and supports. These fixtures are
private test evidence and are not queried by production routes.

The Work Register emits a truthful corpus-empty state, omits enhancement
controls, uses canonical `/work/`, and is `noindex` because there are no public
routable project destinations. Zero Atlas records is therefore the truthful
initial production state; fixtures must not be published to make the map
visible.

## Generated baseline

The project-detail manifest reports route count 0 and embedded generated hash
`9244673ac3561024a157f491aa742f2ca3dba26b769b6ae409270a65c3a05839`.
Its file SHA-256 is
`8e7b337164e63df65b48ab148bbe84427480377b5338c1a85868399f19c7ddcd`.

The project-world manifest reports five frozen category mappings and embedded
generated hash
`2f8f21ee7db71e86febb2fcf307e1258da604eb666ead94ce186afb67f152812`.
Its file SHA-256 is
`6cd2b1e3ab6315492d62c18129fe15e76532e592bfae8f41c30638c70a44eed2`.

The content manifest source hash is
`dae25a1f02883f029b1077f1405c2169ed22382a7b8517242d5e504f26890ac8`.

## Existing discovery contracts

`src/pages/work/index.astro` calls `getPublicProjectBundles()` and immediately
projects through `createWorkRegisterRecords()`. The projection rechecks
publication eligibility, excludes archives, uses the shared detail-route
helper, and serializes only public discovery fields. Search uses normalized
approved title/summary/category/tag/capability/platform/tool text. Filter groups
combine with AND and repeated values within a group combine with OR. URL state
recognizes `q`, `category`, `maintenance`, `evidence`, and `sort`; Apply/Reset
use `pushState`, initial normalization uses `replaceState`, and `popstate`
restores the view.

`getProjectDetailRouteRecords()` is the sole public detail-route set and
`getProjectDetailHref()` is the href authority. `createPublicProjectRelations()`
is the existing safe relation resolver: it requires public, non-synthetic
relations, a routable opposite endpoint, a non-self relation, stable
de-duplication, and correct incoming/outgoing/undirected language. The Atlas
must reuse it rather than create a second relation model.

The content enum contains the five required categories and seven required
relation types. Directed types are lineage, dependency, supersedes, and
supports. Undirected types are related, shared method, and family.

`PROJECT_WORLD_REGISTRY` is the frozen category-to-world mapping. Each category
maps one-to-one to the world with the same ID. All mappings currently use
authored-mark Level 0 and motion profile `none`; art uses the neutral theme
profile and the other worlds use system theme.

## Source and token authority

Repository contracts and generated manifests are implementation authority.
The accepted token authority register resolves current versions as Radium
palette 1.4, design-token 1.5, asset-palette map 1.4, universal-theme 1.2,
visual-system 1.6, brand-product 1.5, authored-mark 1.2, and iconography 1.2.
The asset-size suite remains missing and is not required for token output or
this record-map phase.

The generated token system already exposes semantic Atlas surface, node,
active-node, relation, and muted-relation roles through portfolio aliases.
Production components may consume those aliases or other semantic tokens and
component-local `--_atlas-*` aliases. Primitive tokens and raw design values
remain prohibited. The outdated local Radium package is excluded from
authority, import, inspection, and implementation.

The selected-direction and greenfield documents describe Atlas and Register as
two modes of `/work/`. The later focused implementation contract explicitly
approves a canonical `/work/atlas/` route with a local native view switch.
This phase follows that newer route contract while preserving the underlying
one-dataset, Register-canonical, progressive-enhancement doctrine.

## Baseline build sizes

Measured from the prerequisite production build on the local test machine:

| Asset | Uncompressed | gzip |
|---|---:|---:|
| shared shell JavaScript | 4,615 B | 1,771 B |
| shared shell CSS | 34,579 B | 5,812 B |
| Work Register JavaScript | 8,309 B | 3,158 B |
| Work route CSS | 7,405 B | 1,539 B |
| `/work/` HTML | 6,106 B | 1,732 B |

The build generated nine static pages. There were no production content or
relation requests because the route is fully static and the production corpus
is empty.

## Existing test and browser infrastructure

Owned validation scripts use stable error codes and repository-native Node
built-ins. Register fixture expansion creates isolated public-shaped records at
0, 1, 10, 50, and 200 without changing content publication metadata. Browser
audits create temporary Astro routes, build, drive the installed headless
Chrome through CDP, remove the harness in `finally`, and rebuild production.
The Atlas will follow those patterns while adding layout/geometry, relation,
map-keyboard, zoom, inspector, and density assertions.

No production Atlas implementation or reusable Atlas-like production module
existed at this baseline. Historical prototypes remain non-authoritative and
are not imported or adapted as source.
