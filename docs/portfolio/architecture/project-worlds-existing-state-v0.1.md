# Project worlds existing state v0.1

## Baseline

The feature branch began at `2937ac391a37d574b74c4a9eff6d2eef020044eb`, the current `origin/main` merge of project-detail invariant PR #5. The baseline contained the static `/work/[slug]/` route, a public-safe detail view model, shared invariant components, world/profile attributes, isolated fixture QA, and deterministic detail-route manifest.

Production contains zero project Markdown entries, zero companion entries, zero relation entries, and therefore zero generated detail routes. This is valid. Ten private synthetic fixture bundles cover all five categories; zero fixtures are publication eligible in their source collections.

## Extension boundary

Before this phase, `ProjectDetail.astro` rendered one fixed semantic sequence. `ProjectDetailLayout.astro` exposed category and profile attributes, while project-world aliases supplied canvas, surface, media-surround, measure, density, and emphasis values. Lead/no-media selection, evidence filtering, visible limitations, provenance sanitization, safe relations, and context navigation were already centralized.

The allowed seam is composition above those components: world selection may alter section order, reading measure, media prominence, density, and emphasis. It may not alter route generation, publication, privacy, state meaning, one-H1 ownership, native navigation, evidence trust, limitation visibility, provenance truth, or no-JavaScript access.

## Baseline performance and audit

- Detail browser audit: 28/28 scenarios passed.
- Detail CSS: 6,624 bytes uncompressed; 1,449 bytes gzip.
- Detail JavaScript: 0 bytes.
- Fixture build samples: 0 routes 1,919.58 ms; 5 routes 2,670.03 ms; 10 routes 2,762.67 ms.
- Sparse, normal, and long HTML: 9,312; 10,320; and 13,345 bytes.
- DOM sample: 219 nodes; CLS: 0.

No naming conflict existed under `src/lib/project-worlds/` or `src/components/project-worlds/`. No final category-specific composition existed.
