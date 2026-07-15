# Project detail existing state `v0.1`

Date: 2026-07-15  
Base: `origin/main` at `f83ec2b61929b0af36c668324c8d52e3edd9ef97`

## Counts and routes

- Production project Markdown records: `0`.
- Production companion records: `0`.
- Production relation records: `0`.
- Valid fixture projects: `10`; publishable fixtures: `0`.
- Existing production dynamic project-detail routes: none.
- The `/work/` route builds a truthful noindex empty-corpus state.

## Work Register destination contract

`createWorkRegisterRecords()` currently leaves `href` undefined unless a caller opts into a Boolean `detailRoutesAvailable` flag. The opt-in branch constructs `/work/${bundle.id}/` inline. The project-detail phase must replace that duplicated construction with the canonical route helper and derive availability per routable bundle.

## Content query and rendering state

`getPublicProjectBundles()` calls the production-only `projects`, `projectData`, and `projectRelations` collections and filters the deterministic bundle order by computed publication eligibility. It imports no fixture collection. `ProjectBundle.project` is a repository projection with frontmatter and Markdown body text, not the original Astro collection entry; the detail route must therefore reacquire or preserve the typed production entry during build-time path construction so Astro `render()` remains authoritative.

No production route currently calls Astro `render()`, and there is no project narrative wrapper or heading/contents contract.

## Shell and world profiles

`GlobalShell` owns the single `main` landmark, title/description/canonical/noindex metadata, skip links, current navigation, theme behavior, and controlled `shellProfile` and `worldProfile` attributes. The five categories already map one-to-one to allowed world profiles. Shell profiles are `standard`, `quiet`, `immersive`, and `technical`; project detail must choose only through a bounded mapping.

## Media, evidence, relations, and provenance

Complex companion data already models public links, seven media types, evidence trust/availability, process, limitations, releases, and provenance. The fixtures cover all five categories, no-media, art ratios, audio/video transcript requirements, verified metrics, private evidence, long content, archived exclusion, and seven relation types. Production components for these structures do not yet exist.

## Privacy and indexing

Content schemas already reject private hosts, local paths, unsafe URLs, missing media accessibility data, and private evidence URLs. Raw companions may still contain fields that are intentionally non-public (`reviewedBy`, source/rights/redaction notes), so a detail-specific projection boundary remains required. A routable public production page must set `noindex=false`; zero routes remain absent rather than generating hidden or fallback pages.

## Conflicts and decisions

- Canonical route file: `src/pages/work/[slug].astro`, matching repository route conventions and the approved brief.
- `scripts/validate-work-register.mjs` currently rejects the very detail route this phase must introduce; the validator must be updated to require shared-helper integration instead.
- Existing Work Register browser fixtures intentionally have no destinations. They remain isolated and unchanged; project-detail gets a separate temporary harness.
- No project component directory, project-detail library, project-detail stylesheet, or route manifest exists.
