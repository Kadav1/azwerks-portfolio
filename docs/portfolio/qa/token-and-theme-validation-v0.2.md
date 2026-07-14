# Token and theme validation `v0.2`

Status: **required repository gates pass**  
Date: 2026-07-14  
Environment: Node `v24.16.0`, npm `11.13.0`, Astro `7.0.9`

## Authority and package boundary

Nine accepted canonical documents carry titles, versions, status,
classification, logical references, headings, and SHA-256 values in the source
manifest and authority register. Available ignored local-evidence bytes were
rehashed; CI validates the same pinned hashes without requiring private source
documents.
Universal Theme Spec v1.2 is resolved through preserved canonical discovery
evidence with SHA-256
`f13e7e969c3695791c0af754843ce0137e144f3e938d3c9c65bf3e315fe6f98e`.

The external outdated package was not inspected or removed after the owner
limited all work to this repository. Its historical manifest hash is recorded
only in the removal record. Package absence validation confirms no dependency,
import, vendored source, value provenance, or path reference in the portfolio
implementation.

## Commands and results

| Command | Result |
|---|---|
| `npm ci` | pass; 273 packages installed, 0 vulnerabilities |
| `npm run tokens:generate` twice | pass; byte-identical four-file output |
| `npm run tokens:validate:source` | pass; 365 scoped declarations, nine token source files |
| `npm run tokens:validate:references` | pass; 315 source names; dark/light parity 50/50 |
| `npm run tokens:validate:contrast` | pass; 62 required pairs |
| `npm run tokens:validate:runtime` | pass; parsing, resolution, SSR, storage, and storage-getter failure |
| `npm run tokens:validate:usage` | pass; five authored production files; package absence confirmed |
| `npm run tokens:check:generated` | pass; four generated files current |
| `npm run tokens:check` | pass |
| `npm run check` | pass; Astro 25 files, 0 errors/warnings/hints |
| `npm run build` | pass; one static route |
| `npm run tokens:audit:browser` | pass; 16 Chrome/CDP scenarios |
| `git diff --check` | pass |

## Counts and deterministic hashes

- scoped declarations: 365;
- unique source token names: 315;
- generated names including seven generic world aliases: 322;
- layers: primitive 107, semantic 204, portfolio 19, world 35;
- theme mappings: 100;
- source-manifest SHA-256:
  `c68865a1617b0374d22840d8fb26103e85a56eaaa09cfeaa080c867bd2a41989`;
- generator SHA-256:
  `4d7d6dc31bd6a51084d74271fe97c2ed94a4aa56878e818d6176b15dacce5100`.

Generated hashes:

| File | SHA-256 |
|---|---|
| `tokens.css` | `1cdb578680088f68a539faeff69046094d8a5b6c8ecc1d3e5e959d0fd6a052ed` |
| `tokens.ts` | `a74cf4f488cb56086e76351b3d4295aba11f62c271362f3ffb17752ff042eb0a` |
| `token-names.ts` | `b10d0df3d8f05c6ea5b9db0de0c4cafd1aafbeda803ae0e3329f3984f2bfc2e4` |
| `token-manifest.json` | `8c14305dfd6142f5e5ddbc1d61f4e0d8201f9b12278559d7f816bf702d86e471` |

## Contrast results

Ratios are WCAG 2.x relative-luminance ratios. Text targets 4.5:1; meaningful
non-text targets 3:1.

### Dark

| Pair | Ratio | Pair | Ratio |
|---|---:|---|---:|
| primary/canvas | 13.87 | primary/surface-primary | 12.51 |
| primary/surface-alternate | 12.96 | primary/surface-raised | 10.75 |
| secondary/surface-primary | 6.04 | muted/surface-alternate | 6.25 |
| faint/surface-primary | 4.94 | link/default | 11.27 |
| link/hover | 13.56 | link/active | 10.20 |
| link/visited | 9.13 | focus/canvas | 12.48 |
| focus/surface | 11.27 | selection | 7.87 |
| action/primary | 11.30 | action/primary-hover | 12.48 |
| action/secondary | 9.79 | control/disabled-boundary | 3.63 |
| state/info | 8.98 | state/success | 7.76 |
| state/warning | 7.44 | state/danger | 12.17 |
| trust/verified | 8.01 | trust/reviewed | 6.84 |
| trust/unverified | 8.32 | code | 12.28 |
| art-neutral-caption | 6.69 | atlas/node | 6.39 |
| atlas/node-active | 11.05 | atlas/relation | 4.85 |
| atlas/relation-muted | 3.56 |  |  |

### Light

| Pair | Ratio | Pair | Ratio |
|---|---:|---|---:|
| primary/canvas | 11.51 | primary/surface-primary | 12.53 |
| primary/surface-alternate | 12.13 | primary/surface-raised | 13.18 |
| secondary/surface-primary | 6.35 | muted/surface-alternate | 5.60 |
| faint/surface-primary | 4.74 | link/default | 6.72 |
| link/hover | 8.55 | link/active | 11.35 |
| link/visited | 9.52 | focus/canvas | 4.39 |
| focus/surface | 4.78 | selection | 5.03 |
| action/primary | 10.88 | action/primary-hover | 12.02 |
| action/secondary | 11.19 | state/info | 9.09 |
| state/success | 8.04 | state/warning | 9.92 |
| state/danger | 8.50 | trust/verified | 8.31 |
| trust/reviewed | 9.52 | trust/unverified | 10.51 |
| code | 11.63 | art-neutral-caption | 6.08 |
| control/boundary | 3.13 | atlas/node | 8.04 |
| atlas/node-active | 6.00 | atlas/relation | 5.44 |
| atlas/relation-muted | 3.64 |  |  |

## Theme parity, references, and leakage

Dark and light each define the same 50 semantic names. Reference validation
found no duplicate scope, missing reference, circular alias, illegal layer
direction, missing world, or project-world functional override. Leakage found
no unauthorized raw color, primitive consumption, z-index, shadow, duration,
easing, spacing, radius, type size, or content width.

The build contains no token JSON and no client framework bundle. The sole
essential JavaScript is the inline theme bootstrap.

## Browser and accessibility review

Headless system Chrome was driven through the DevTools Protocol without a new
dependency. Passing scenarios:

- system-dark and system-light;
- explicit dark over light preference and explicit light over dark preference;
- invalid storage and unavailable storage;
- no JavaScript;
- reduced motion;
- forced colors;
- print;
- 200% root text enlargement;
- widths 320, 375, 768, 1024, and 1440px.

Each scenario checked semantic canvas/text resolution, theme attribute
priority, focus visibility, readable body text, heading clipping, and
horizontal overflow. The 200% run exposed min-content grid expansion from the
code sample; shrinkable grid tracks fixed it while retaining internal code
scrolling. Forced colors resolved to system `Canvas` and system link/focus
roles. Art and code samples retained their governed surfaces.

Manual/unsupported observations: no screen-reader session, color-vision
simulation, APCA calculation, or filmstrip-based flash measurement was run.
Initial-paint readiness is structurally verified by the inline head script and
CSS no-JS fallback, not claimed as a captured filmstrip.

## Performance

| Metric | Result | Gate |
|---|---:|---:|
| generated token CSS | 29,919 bytes | informational |
| generated token CSS gzip `-9` | 4,341 bytes | ≤30KB compressed |
| built route CSS | 28,317 bytes | informational |
| built route CSS gzip `-9` | 4,604 bytes | ≤30KB compressed |
| inline bootstrap | 211 bytes | ≤3KB minified pre-compression |
| first-route HTML + CSS | 30,573 bytes | informational |
| first-route gzip estimate | 5,677 bytes | informational |
| third-party runtime | 0 | 0 |
| theme initialization requests | 0 | 0 |
| continuous animation | 0 | 0 |

The repository had no tracked baseline `dist/`, so an exact before/after build
delta cannot be stated without fabricating a baseline. Current output is fully
measured. All explicit performance gates pass.

## Errors and resolutions

1. The first leakage run exposed a validator whitespace-backtracking false
   positive; declaration-value parsing replaced the regex lookahead.
2. The first browser launch used an obsolete Astro executable path; direct
   stderr identified the correct `bin/astro.mjs` path.
3. Sandbox localhost binding returned `EPERM`; the approved escalated browser
   run supplied the required local listener.
4. The initial 200% run found real nested-grid min-content expansion; explicit
   shrinkable tracks resolved it.
5. Chrome reports `0ms` as computed `0s`; the audit accepts both equivalent
   serialized zero durations.
6. Chrome mobile emulation reports visual viewport width separately from root
   client width; the final audit uses the visual viewport for overflow truth.
