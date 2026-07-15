# Work Atlas validation `v0.1`

Date: 2026-07-15  
Branch: `feat/work-atlas-v0.1`  
Base: `4ec096653cec9768669602253dc301ea6bd32000`

## Automated verdict

The static, layout, state, browser, privacy, performance, and regression gates
passed on the pre-commit working tree. The production corpus remains at zero
public projects, zero generated project routes, and zero safe public relations.
The generated production Atlas manifest is a valid deterministic zero-state.

The isolated Chrome/CDP audit passed 33 scenarios. It covered the production
zero state and temporary 0, 1, 10, 50, and 200-record Atlas sets. The temporary
route was removed in `finally` and a production build restored afterward.

## Environment and method

- Linux `x64`; Node `24.16.0`; npm `11.13.0`.
- Astro `7.0.9`; installed headless Google Chrome driven through CDP.
- Measurements are local-machine observations, not universal device claims.
- Initialization was measured from page load until the Atlas enhancement
  contract became true. The 200-record update measured an explicit filter
  application and settled DOM update.
- Physical touch hardware and a physical screen reader were not used.
  Screen-reader-facing DOM semantics and CDP-dispatched keyboard input were
  inspected; no spoken-output result is claimed.

## Fixture and state matrix

| Records | Relations | Edge policy | DOM nodes | Initialization | CLS |
|---:|---:|---|---:|---:|---:|
| 0 | 0 | all | 125 | 0 ms | 0 |
| 1 | 0 | all | 329 | 2.5 ms | 0 |
| 10 | 7 | all | 477 | 3.4 ms | 0 |
| 50 | 49 | focused | 1,049 | 4.2 ms | 0 |
| 200 | 140 | focused | 2,795 | 6.3 ms | 0 |

The 200-record filter/update measured 30.5 ms. Its focused default exposed one
selected-project visual edge; the explicit Show all relations control exposed
all 140. The full semantic relation index remained present in both states.
Layout tests found zero overlaps at every required size and verified bounds,
stable regions, uniform `240 x 88` plane-unit nodes, safe endpoints, stable
paths, duplicate rejection, and byte-identical layout output.

The fixture matrix covers all five categories, all seven relation types,
directional and non-directional relations, cross-category endpoints, no
relations, duplicate short titles, long titles and summaries, one dense
category, sparse and equal distributions, missing media, private/archived/
ineligible/unroutable exclusion, invalid URL state, enhancement failure,
selected focus, dense relation reduction, and narrow-screen index-first order.
No fixture publication metadata or production query was changed.

## Browser behavior and modes

The audit asserted one H1 and main landmark, global Work state, the native
Register/Atlas switch, canonical/noindex policy, no-JavaScript project and
relation indexes, enhancement gating, failure recovery, five named fields,
native internal scrolling, zoom in/out/reset, center selected, selection and
inspector updates, direct project links, relation filters, direction-aware
edge geometry and text, URL normalization, Apply/Reset/popstate behavior,
keyboard map entry/arrow movement/Escape exit, and complete indexes.

Widths 320, 375, 768 landscape, 1024, 1440, and 1600 pixels passed without
page-level horizontal overflow. 200% text, emulated browser zoom, system and
explicit light/dark modes, invalid stored mode, failed-storage-safe shell
behavior, reduced motion, forced colors, and print passed. Print suppressed the
spatial workspace and retained the title, help, separate legends, project
index, and relation index. No continuous animation was detected.

## Privacy and request boundary

Rendered source and generated artifacts were checked for local paths, private
URLs, raw companions, unpublished evidence, rights/review/redaction notes,
internal identities, fixture collection names, and synthetic production
markers. No prohibited field entered the public Atlas model or manifest.
Production and fixture pages made zero runtime content or relation requests;
the Atlas adds no analytics or tracking.

## Assets and performance

| Measure | Result | Target |
|---|---:|---:|
| Atlas CSS | 10,328 B / 2,086 B gzip | <=18 KiB compressed |
| essential Atlas JavaScript | 8,466 B / 2,927 B gzip | <=16 KiB minified before compression |
| production route HTML | 8,324 B | recorded |
| 200-record fixture HTML | 402,895 B | recorded |
| production manifest | 1,904 B | deterministic zero state |
| 200-record isolated manifest | 62,716 B | <=250,000 B |
| production audit build | 1,973.87 ms | recorded |
| fixture audit build | 2,843.68 ms | recorded |

Third-party Atlas runtime, runtime content requests, runtime relation requests,
continuous animation, and Atlas CLS are all zero. The 10/50/200 initialization
and 200-record update observations passed their local-machine targets.

## Commands and regressions

The required final command sequence includes clean install; token, content,
shell, Register, detail, and world gates; Atlas generation, validation, layout,
state, browser, and composite checks; Astro check/build; manifest double-run
comparison; `git diff --check`; fixture-route absence; and explicit status
review. The final implementation report records the post-documentation rerun.

No dependency or lockfile changed. CI workflow and `permissions: contents:
read` remain unchanged. The Work Register, detail-route invariant, project
world manifest, token outputs, and publication boundary remain intact.

## Manual review items

- Perform a physical screen-reader pass before production content publication.
- Perform a physical touch-device pass for kinetic scrolling and target feel.
- Review editorial density and category balance when real public projects
  exist; synthetic fixture scale proves the contract, not final art direction.
