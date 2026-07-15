# Global shell and navigation validation v0.1

Date: 2026-07-15  
Environment: Linux, Node 24.16.0, Astro 7.0.7, headless Google Chrome via CDP

## Verdict

Static, compiler, content/token regression, build, and deterministic browser
gates pass. The shell is reviewable as a production foundation; route bodies
remain explicitly temporary and `noindex`.

## Commands and results

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 275 packages, zero reported vulnerabilities. |
| `npm run tokens:check` | Pass; source/reference/contrast/runtime/usage/generated gates. |
| `npm run content:check` | Pass; 7 suites, 36 invalid cases, zero publishable fixtures, 7 public production navigation items. |
| `npm run shell:validate` | Pass; 13 required shell files and 9 scaffold routes. |
| `npm run shell:audit:browser` | Pass; 27 deterministic scenarios. |
| `npm run shell:check` | Pass; 3 shell unit suites plus static validator. |
| `npm run check` | Pass in final pre-commit verification. |
| `npm run build` | Pass; 9 static pages. |
| `git diff --check` | Pass in final pre-commit verification. |

The content validator was advanced at the intended phase boundary: production
project/page collections must remain empty, while production navigation may be
non-empty only when the merged schema accepts it and every item is public and
non-synthetic. The token usage parser was corrected to distinguish
`min-inline-size` from `inline-size` and to recognize exact `100%`; the complete
token suite passed after the correction.

## Static validation

Stable `SHELL_*` errors cover missing components/routes, GlobalShell use, one
H1, unique main IDs, `noindex`, scaffold disclosure, work-results target,
primary order/direct Work, fixture imports, unsafe interactions, primitive/raw
token leakage, ungoverned breakpoints, split route lists, wordmark hashes, and
deferred-route scope.

Unit tests cover path normalization; exact, section, root, and collision-safe
current states; ordered shared regions; direct Work; schema/privacy/fixture/
duplicate/unsafe failures; and shell/world profile invariants.

## Browser matrix

CDP assertions use rendered output rather than screenshots.

| Scenario | Result and assertions |
| --- | --- |
| `/`, `/work/`, `/archive/`, `/about/`, `/contact/`, `/accessibility/`, `/privacy/`, `/colophon/`, `/404.html` | Pass: title, one H1/main, noindex, shared primary order, correct/no current page, single identity name, footer. |
| 320, 375, 768, 1024, 1440 CSS px | Pass: no page overflow/clipping, visible 44px compact Work/Menu targets, visible focus. |
| Mobile no JavaScript | Pass: unenhanced native disclosure, complete route order, visible links, disabled/truthful theme control, direct Work, no false modal semantics. |
| Mobile enhanced open | Pass: open/expanded, initial Close focus, inert main, scroll lock, current route, dialog semantics. |
| Focus containment | Pass: Tab wraps from the last visible control to Close. |
| Escape/restoration | Pass: closes, collapses, restores Menu focus, inertness and scroll. |
| Viewport change | Pass: open menu closes on crossing to workspace width. |
| Theme | Pass: system/dark/light application, exposed select value, storage remove/write, invalid and blocked-storage recovery. |
| Reduced motion | Pass: media mode active; shell has no authored animation/continuous motion. |
| Forced colors | Pass: media mode active, no overflow, text identity fallback visible, skip focus visible. |
| Print | Pass: print mode active and global navigation/footer furniture hidden. |
| 200% text at 320px on Work | Pass: no horizontal overflow, identity remains at least 90 CSS px wide, and skip focus remains visible. |
| 200% text at 1024px on Work | Pass: header remains below 25% of viewport height and static positioning cannot obscure anchors. |

Landscape-mobile evidence uses the 768 by 520 scenario. Static safe-area and
internal-scroll rules were inspected; the viewport scenarios exercise the
rendered compact header and menu boundaries.

## Keyboard and focus

Browser key injection verified Tab containment and Escape dismissal. DOM/source
and rendered focus checks verify skip links first, identity before navigation,
native link/control semantics, closed-details descendants absent from active
layout, tokenized `:focus-visible`, stable focus targets, current state separate
from focus, and restoration to Menu. Close is a native button; routes are native
anchors. There is no closed-menu trap or hidden off-canvas focus surface.

## Semantics

Rendered routes expose header, labeled Primary/Mobile primary/Footer/Skip links
navigation landmarks, one main, one H1, exact `aria-current="page"`, labeled
theme selects, one accessible identity name, and enhancement-only dialog/
modal/expanded semantics. The 404 has no false current item. Section-current
uses hidden text and styling without misusing `aria-current`.

## Screen-reader and touch limits

No physical screen reader was available; NVDA, JAWS, VoiceOver, and TalkBack
were not run and are not claimed. Semantic DOM and Chrome accessibility-facing
attributes were inspected in rendered output. Physical-device touch testing was
also unavailable; CDP geometry verified the 44 by 44 CSS-pixel minimum for the
visible compact Work and Menu controls, while all controls remain native and no
gesture or hover is required.

## Performance

| Measure | Result | Gate |
| --- | ---: | ---: |
| Shell source CSS gzip | 2,056 bytes | at most 12 KB compressed |
| Combined built initial CSS | 34,579 bytes / 5,812 bytes gzip | recorded |
| Essential built shell JS | 4,615 bytes minified / 1,771 bytes gzip | at most 8 KB minified |
| HTML | 5,047–5,383 bytes for representative routes; 5,092-byte 404 | recorded |
| Client bundles | one module plus existing inline pre-paint bootstrap | recorded |
| Third-party runtime | zero | zero |
| Navigation/theme data requests | zero | zero |
| Continuous animation | zero | zero |

Static HTML contains the identity and complete desktop/mobile/footer link sets.
Both identity assets have intrinsic dimensions, preventing their shell box from
shifting. No JavaScript-rendered navigation, font request, runtime data request,
or shell animation is present. A buffered browser PerformanceObserver measured
CLS `0` on all nine audited routes. Release reviewers may repeat a physical
lab performance trace if desired.

## Regressions and unresolved manual coverage

Token parity/contrast/runtime/generated checks and content schema/invalid/
publication/determinism checks pass unchanged in strength. No fixture content
is imported by production shell code or rendered by routes.

Manual coverage still recommended before a public launch: physical Safari and
Firefox zoom/reflow, platform screen readers, physical touch/safe-area devices,
and a lab performance trace. These are later launch gates, not fabricated as
completed here.
