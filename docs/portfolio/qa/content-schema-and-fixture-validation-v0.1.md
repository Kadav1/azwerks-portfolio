# Content schema and fixture validation v0.1

Status: required local gates passed on 2026-07-14.

## Environment

- Required runtime: Node 24.16.0, npm 11.x.
- Astro: 7.0.9.
- TypeScript: 6.0.3.
- Model/schema: 1.0 / 1.0.0.
- Fixture set: `synthetic-content-fixtures-v0.1`.

## Deterministic evidence

- Collections: five production and five fixture collections.
- Valid projects/companions/relations: 10 / 10 / 7.
- Fixture pages/navigation items: 4 / 4.
- Invalid cases: 36, each mapped to a stable expected code.
- Publication-eligible fixtures: 0.
- Category counts: software 3, visual-system 1, art 2, technical-system 2, limited-media 2.
- Relation counts: one each of related, lineage, dependency, shared-method, family, supersedes, and supports.
- Unit tests: 7 passed, 0 failed.
- Manifest SHA-256: `c00e0b29d2f3c9e6027a5556695a63648b4ffc240c4df100de3ee5d589fd64e4`.
- Valid summary SHA-256: `953df21b7deb91278d1a22ffb3f03cd42ffdac682462af66ce0d29a33fd39d30`.
- Invalid summary SHA-256: `a55629dce86ae9f70fd2004b532c1054c475d6ac547ccd17d54f12b60de3f957`.
- Two consecutive generations produced the same three hashes.
- Astro check: 49 files, 0 errors, 0 warnings, 0 hints.

## Validation scope

The gate covers flat frontmatter, strict schemas, dates/category rules, nested uniqueness, reference integrity, safe URLs, private paths, media accessibility/rights, evidence support, fixture isolation, publication eligibility, deterministic sorting, production emptiness, asset existence, documentation presence, and generated drift. The invalid harness hashes its fixture descriptors before and after execution and mutates no source.

## Commands and results

- `npm ci`: passed; 275 packages installed, 276 audited, 0 vulnerabilities.
- `npm run tokens:check`: passed; 365 scoped declarations, 315 unique names, 50/50 parity, 62 contrast pairs.
- `npm run content:sync`: passed; expected warnings identify five intentionally empty production sources.
- `npm run content:generate`: passed twice with byte-identical output.
- `npm run content:validate`: passed; 10 projects, 10 companions, 7 relations, 0 publishable fixtures.
- `npm run content:test:invalid`: passed; 36 stable-code cases.
- `npm run content:check:generated`: passed.
- `npm run content:check`: passed; seven unit suites passed.
- `npm run check`: passed; token/content gates and Astro diagnostics passed.
- `npm run build`: passed; one static page built, unchanged from the prerequisite baseline.
- `git diff --check`: passed.

## Accessibility and privacy observations

Informative media requires alt, decorative media requires explicit empty alt, and available audio/video requires a transcript contract. Dimensions/ratios prevent layout shift. Rights and evidence provenance fail closed. No fixture contains a private path, unsafe URL, real project claim, or public eligibility. This phase adds no rendered UI, so no browser, route, keyboard, or screen-reader result is claimed.

## Performance

- Manifest: 5,127 bytes uncompressed; 1,841 bytes gzip.
- Expected summaries: 1,235 and 4,716 bytes.
- Complete fixture corpus: 32,618 bytes.
- Built `index.html`: 2,256 bytes.
- Complete static output: 30,573 bytes.
- Emitted JavaScript files: 0.
- Public routes: 1 before and after.
- Added client JavaScript, runtime requests, remote sources, and database queries: 0.
