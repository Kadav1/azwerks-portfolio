# Work Register existing state `v0.1`

Date: 2026-07-15  
Base SHA: `2a1b16118914f66b7d20f3ea9582b86aa76521dc`

## Route and shell

`src/pages/work/index.astro` is a shell-integrated scaffold. It renders one H1,
passes `mainId="work"` and `workResultsId="work-results"` to `GlobalShell`, and
keeps the route `noindex`. Its result target contains only truthful foundation
copy. It has no production query, register items, controls, client state, or
route-specific style/script.

`GlobalShell.astro` already owns canonical metadata, primary navigation, the
main landmark, optional Work-results skip link, theme behavior, and the global
shell client bundle. The register must remain route-owned and must not extend
the shell script.

## Production data boundary

`getPublicProjectBundles()` is the production publication query. It loads only
the `projects`, `projectData`, and `projectRelations` collections, builds strict
`ProjectBundle` objects, applies publication eligibility, and returns the
content model's deterministic order. Fixture helpers are isolated from this
module and must remain test-only.

`ProjectBundle` supplies project identity and discovery fields, its validated
companion, relation partitions, publication evaluation, display period,
media/evidence state, relation count, normalized search text, archive state,
and featured state. The current content-model order is featured first,
lifecycle rank, descending release/update/start/year, ASCII title, then ID.

The register requires a focused Work adapter because the public query may
eventually include eligible archived records. The adapter will filter
`archiveState === false` after publication eligibility without duplicating the
publication rules.

## Current counts

- Production projects: 0.
- Public production Work records: 0.
- Archived production records: 0.
- Valid synthetic fixture projects: 10.
- Synthetic archived fixtures: 1.
- Invalid fixture cases: 36.
- Publication-eligible fixtures: 0.
- Production collections: 5.
- Fixture collections: 5.

The production route must therefore render the corpus-empty state and remain
`noindex`. Populated behavior can be exercised only through an isolated,
non-public harness removed after browser QA.

## Existing scripts, styles, and tests

There is no `src/components/work/`, `src/lib/work-register/`, register client
script, register stylesheet, or register-specific test suite. Existing route
styles come from `src/styles/global.css` and `src/styles/shell.css`. Existing
validators cover tokens, content, shell, Astro diagnostics, and static builds.
The browser shell audit demonstrates the repository's Playwright/CDP pattern.

## Conflicts and decisions

- The scaffold description must be replaced with truthful canonical-register
  metadata.
- No project-detail routes exist, so every production register title remains
  text and `href` is omitted.
- No production media exists. Preview support may be implemented in the typed
  model and component contract, but production renders no placeholder.
- The fixture design and assets are evidence only. QA may adapt fixture-shaped
  data to public register records without changing fixture publication state.
- The UI/UX reference search suggested a motion-led card grid; that conflicts
  with the locked semantic-list, quiet editorial, and no-motion-first direction
  and is rejected. Its accessibility, touch-target, state-restoration, and
  responsive checks remain applicable.
