# Project detail invariant validation v0.1

## Scope

This record covers the static project-detail route, public-safe view model, invariant components, generated route manifest, Work Register href integration, and the isolated browser harness. The production collections contain zero projects, so rendered category and edge-case checks use temporary audit-only routes removed in `finally`.

## Baseline and route facts

- Base: `origin/main` at `f83ec2b61929b0af36c668324c8d52e3edd9ef97`.
- Production project bundles: 0.
- Generated production routes: 0.
- Synthetic fixtures: 10; generated production routes from fixtures: 0.
- Canonical route: `/work/<slug>/` from `getProjectDetailHref()`.
- Manifest hash: `9244673ac3561024a157f491aa742f2ca3dba26b769b6ae409270a65c3a05839`.
- Duplicate slugs fail before route creation; unknown slugs have no generated path.

## Automated commands

The final review runs the following commands from the repository root:

```text
npm ci
npm run tokens:check
npm run content:check
npm run shell:check
npm run register:check
npm run detail:generate
npm run detail:validate
npm run detail:test:view-model
npm run detail:check:generated
npm run detail:audit:browser
npm run detail:check
npm run check
npm run build
git diff --check
```

The manifest generator is also run twice around a byte comparison.

## Static and view-model coverage

Static validation checks 37 required production files, the static `getStaticPaths()` boundary, production-only content access, Astro `render()` use, the shared href helper, empty-section guards, extension attributes, token usage, and absence of fixture imports, live content fetches, MDX, client frameworks, final world layouts, and temporary audit routes.

The Node test suite covers canonical and rejected slugs; duplicate detection; exact 0, 1, 5, and 10 route sets; stable manifest bytes and private-value exclusion; previous/next boundaries without wraparound; all five categories and bounded profile mappings; lead-media priority and no-media behavior; evidence trust, metric artifacts, and private URL filtering; strict serialization; process and release ordering; safe relations; sparse records; and rational Markdown headings.

## Isolated browser harness

The browser audit creates a temporary noindex route and local public test media, builds 0/5/10 public-shaped route sets, serves the generated site, drives installed Chrome through CDP, and removes the route, media, captures, and audit output in `finally`. It then restores a production build.

Coverage includes software, visual-system, art, technical-system, and limited-media records; minimum and long narratives; no media; portrait, landscape, square, image, SVG, interface, diagram, video, audio, and document behavior; verified metric, private, and unavailable evidence; limitations, process, releases, relations, contents, and navigation boundaries.

The browser matrix checks dark, light, system-dark, system-light, no JavaScript, forced colors, reduced motion, print, 200% text enlargement, deterministic 200% browser-zoom emulation, landscape mobile, and widths 320, 375, 768, 1024, 1440, and 1600 pixels.

## Accessibility and interaction

Automated DOM and CDP assertions verify one H1, one shell main landmark, labeled article/section/navigation regions, native figures and controls, heading order, contents anchors, early Back to Work access, skip-link focus, locally scrollable code/table regions, native media controls, descriptive relations and context links, and absence of empty sections or hidden focusable content.

No physical screen-reader session was performed. Screen-reader readiness was assessed through semantic DOM and accessible-name inspection only; physical assistive-technology behavior remains a manual review item. No real-device touch test was performed.

## Privacy

Rendered HTML and serialized route props are checked for local absolute paths, private URLs, private evidence and media sources, redaction notes, source notes, reviewer identities, fixture collection names, and synthetic records represented as public work. No matching disclosure is permitted.

## Performance results

The passing browser run records:

- project-detail CSS: 6,624 bytes uncompressed; 1,449 bytes gzip;
- essential project-detail JavaScript: 0 bytes;
- third-party runtime: 0;
- sparse/normal/long route HTML: 9,312 / 10,320 / 13,345 bytes;
- normal fixture DOM: 219 nodes;
- cumulative layout shift: 0;
- runtime content-data requests: 0;
- continuous animation: 0;
- build-time samples: 0 routes 1,710 ms; 5 routes 1,700 ms; 10 routes 1,738 ms; restored production zero-route build 1,844 ms.

Public media requests are declared content assets and are measured separately from runtime content-data requests.

## Limitations and manual follow-up

- Browser timings are local samples, not CI service-level guarantees.
- Physical screen-reader and real-device touch tests remain unsupported in this environment.
- Actual portfolio content remains absent; future production entries must pass the same publication, heading, media, evidence, and privacy gates.
- Immediate pull-request CI state is recorded at publication time in the implementation handoff.
