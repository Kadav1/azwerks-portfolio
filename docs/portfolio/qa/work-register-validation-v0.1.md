# Work Register validation `v0.1`

Date: 2026-07-15  
Machine: Linux x86_64, Node 24.16.0, npm 11.13.0, headless Google Chrome,
managed workspace filesystem

## Corpus and fixture boundary

- Production public Work: 0.
- Production archived: 0.
- Valid synthetic projects: 10, including 1 archived fixture.
- Invalid fixture cases: 36.
- Publishable fixtures: 0.
- Production route result: truthful corpus-empty, controls omitted, canonical
  `/work/`, `noindex, nofollow`, no project links, no preview placeholder.

## Commands run

The prerequisite gate ran `npm ci`, `tokens:check`, `content:check`,
`shell:check`, `check`, and `build` under Node 24.16.0. The implementation gate
ran `register:validate`, `register:test:state`, repeated
`register:audit:browser`, shell regression checks, and Astro diagnostics.
Final composite commands and Git diff checks are recorded in the implementation
report after their fresh pre-commit run.

## Static and state tests

Static validation passes 21 required files plus production-query, archive,
fixture, private-field, URL, noindex/canonical, enhancement-gate, safe-DOM,
runtime-request, deferred-pattern, raw-token, destination, and temporary-harness
checks with stable `REGISTER_*` codes.

Ten state tests pass: bounded/invalid/duplicate parsing; stable repeated-value
serialization; AND/OR filtering; partial/case/whitespace/diacritic search;
curated/recent/title sort; immutability; summaries; public-safe projection;
archive exclusion; 0/1/10/50/200 datasets; and the 200-record pure-logic target.

## Browser audit

The final pre-documentation browser run passed 29 deterministic scenarios.
It covered the real production-empty route and temporary 0/1/10/50/200 routes;
no-JavaScript content and category links; enhancement gating; invalid URL
hydration; semantic ordered list/form/fieldsets/live region; deferred project
links; preview/no-preview; explicit search; combined filters; title sort; Reset;
back and forward restoration; filter-empty recovery; fail-open recovery;
physical Enter/Space/disclosure/Reset input; focus stability; the work-results
skip target; forced colors; reduced motion; print; 200% text; 320, 375, 768
landscape, 1024, and 1440 widths; native Ctrl-plus browser zoom (1.25 device
scale, 819px reflow viewport, no overflow); request/animation/CLS absence; and a
200-record Apply benchmark.

## Measured output

| Measure | Result |
| --- | ---: |
| Production empty route HTML | 6,106 bytes |
| Temporary 200-record HTML | 293,019 bytes |
| Register JavaScript, minified | 8,309 bytes |
| Register JavaScript, gzip | 3,104 bytes |
| Register CSS, built uncompressed | 7,405 bytes |
| Register CSS, gzip | 1,507 bytes |
| DOM nodes at 0 / 1 / 10 / 50 / 200 | 111 / 196 / 418 / 1,209 / 4,179 |
| 200-record initialization | 11.2 ms |
| 200-record Apply-to-render | 22.2 ms |
| Runtime content/navigation requests | 0 |
| Third-party runtime | 0 |
| Continuous animation | 0 |
| Register CLS | 0 |

The 100ms benchmark is specific to this test machine and synthetic harness.
The browser audit rebuilds production after removing the route. No temporary
source or `dist/work-register-audit` path remained.

## Accessibility evidence and limitations

Automated semantics and headless physical-keyboard injection passed. Visible
labels, one H1, current Work navigation, main/result landmarks, list/item
headings, fieldset legends, count, hidden result state, intrinsic preview
metadata, focus stability, 44px primary targets, and no nested project
interactivity were inspected.

No real screen reader was available in this environment, so VoiceOver, NVDA,
JAWS, or Orca speech output is not claimed. Headless Chrome DOM/behavior checks
are not a substitute. Native Chrome zoom, 200% root text enlargement, and the
requested CSS viewports passed; real-device touch was not available and remains
appropriate before release.
No visual screenshot baseline was created or claimed.

## Resolved failures

- The default shell exposed Node 22 and sandboxed esbuild; install was rerun
  under the pinned Node 24 path outside the sandbox.
- The first temporary directory began with `__` and Astro did not route it; the
  audit now creates a normal temporary noindex route and removes it in
  `finally`.
- Enhancement-gated controls initially caused CLS; scripting-aware invisible
  space reservation now preserves no-JavaScript absence and yields CLS 0.
- CDP required native virtual key metadata for Enter activation; the audit now
  verifies physical-style Enter and Space behavior.
