# Global shell architecture v0.1

Date: 2026-07-15  
Status: implemented foundation contract

## Stable-master role

The global shell is the stable, static-first master around later editorial
project worlds. It provides identity, orientation, retrieval, theme choice,
focus behavior, and concise global closure. It does not provide project data,
page composition, filters, route transitions, or project-world expression.

The shell is deliberately compact and work-first. The lowercase azwerks
identity leads, Work remains directly available at every supported width, and
Archive, About, and Contact retain predictable positions.

## Ownership

| Owner | Responsibility |
| --- | --- |
| `BaseLayout.astro` | HTML document, language, metadata, viewport, color scheme, canonical/noindex hooks, token/global CSS, pre-paint theme bootstrap, and body slot. |
| `GlobalShell.astro` | Typed shell context, shared navigation model, skip links, header, main landmark, footer, shell CSS, and one enhancement bundle. |
| `GlobalHeader.astro` | Identity/header composition, direct mobile Work access, desktop and mobile navigation, optional theme control, optional truthful status. |
| `BrandIdentity.astro` | One Home link and one accessible identity name around verified surface-specific wordmark assets. |
| `PrimaryNavigation.astro` | Semantic desktop list navigation from normalized items. |
| `MobileNavigation.astro` | Native details fallback and enhancement hooks from the same normalized items. |
| `ThemeControl.astro` | Labeled native system/dark/light select; disabled truthfully until JavaScript binds it. |
| `SkipLinks.astro` | First focusable main target and optional work-results target. |
| `GlobalFooter.astro` | Rights statement and bounded secondary/contact routes. |
| `ShellStatus.astro` | Optional truthful portfolio-wide state; renders nothing by default. |

`BaseLayout` never owns route navigation markup or the main landmark.
`GlobalShell` never owns final route copy or project content. `GlobalShell`
accepts strict props for title, description, current path, noindex, shell/world
profiles, theme/status visibility, main ID, work-results ID, and canonical URL;
it exposes no arbitrary class-name escape hatch.

## Identity

`BrandIdentity` uses the canonical local v1.2 wordmark assets copied
byte-for-byte into `src/assets/brand/`. The vector is used on dark surfaces and
the verified dark artwork PNG on light surfaces. Both images are silent; the
link supplies the sole accessible name, `azwerks, home`. Forced colors hides
both images and exposes plain lowercase identity text without pretending it is
a replacement logo. No animation or recoloring is applied.

## Navigation and footer

`src/content/navigation.json` is the merged production source. The strict
content schema remains authoritative; the shell validator additionally
requires public, non-synthetic, unique, safe items and a direct `/work/`
route. One normalized model is split into primary and footer regions.

The footer is not a duplicate sitemap. It exposes Contact plus the scaffolded
Accessibility, Privacy, and Colophon routes. It contains no status theater,
newsletter, social fabrication, theme duplication, or technology wall.

## Mobile enhancement and no-JavaScript behavior

The baseline is native `<details>` containing the complete primary route list
and disabled theme control. With JavaScript absent, Menu opens natively and all
routes remain available; it does not claim modal semantics.

The framework-free enhancement adds dialog semantics, expanded state, Close,
Escape, initial Close focus, focus containment, background inertness, scroll
lock with scrollbar compensation, focus restoration, internal-link close, and
workspace-width close. Cleanup removes listeners and enhancement-only
semantics. The header keeps a separate direct Work link at compact widths.

## Theme control and CSP note

The selects call only `src/tokens/runtime/theme.ts`. They use its existing
`azwerks.portfolio.theme.v1` key, parsing, safe reads/writes, custom change
event, immediate application, and system-media response. Invalid or blocked
storage falls back to system. Without JavaScript, system rendering remains
valid and the controls state that JavaScript is required.

The pre-paint bootstrap remains a 211-byte inline script. A future Content
Security Policy must permit it through a reviewed hash or nonce. This phase
does not configure or claim a CSP.

## Skip links and focus

Skip links are the first focusable document controls. Main and optional
work-results targets have stable IDs and programmatic focusability. Sticky
header offset uses the shell-size token; focus rings inherit the global
semantic token contract and are never removed, clipped, or reused as current
state.

Native full-page links remain the route system. Each page has its own title,
one H1, one main landmark, and normal browser history. There is no client-side
router, View Transition, cosmetic announcement, or custom route-live region.

## Styling, responsiveness, and profiles

`shell.css` consumes semantic and portfolio aliases and uses only local
`--_shell-*`, `--_nav-*`, `--_menu-*`, and `--_footer-*` variables. The single
CSS media literal is `64rem`, exactly matching the governed workspace token;
CSS custom properties cannot be evaluated in media conditions, so the shell
validator enforces this equality.

The mobile-first header is `identity | Work | Menu`; workspace widths use one
compact row with identity, primary links, and theme control. Safe-area insets,
internal menu scrolling, 44px controls, wrapping footer links, forced colors,
print, and text enlargement are explicit. Header positioning is static in v0.1
so wrapped/enlarged navigation cannot obscure focus or anchor targets. Profile
contracts retain the option for a later justified sticky mode only after a
no-JavaScript-safe height/offset solution; technical currently changes surface
emphasis without dashboard chrome.

Profiles may change density, surface, boundary, footer rhythm, and justified
sticky behavior. They cannot change route labels/order, identity meaning,
focus, target size, theme behavior, keyboard order, or contrast.

## Script and performance boundary

The single client bundle owns mobile disclosure and theme binding only. It is
server-safe at import boundaries, initializes idempotently, cleans up on
`pagehide`, makes no network request, has no continuous loop, and stores no
content or routing state. Built output is 4,615 bytes minified and 1,771 bytes
gzip. Static HTML contains all navigation.

## Future project-world integration

Later project routes may pass a controlled `worldProfile` and one of the four
shell profiles. They may add page composition beneath the main slot, but may
not replace shell semantics or import exploration prototypes. Register/atlas
integration may use the dormant `workResultsId` skip boundary and the documented
section-current behavior; it must not move content/routing into the shell
script.

## Prohibited use

The shell is not a dashboard rail, publication folio, scene deck, floating
dock, proof/status strip, generic agency header, content API, analytics owner,
or project media system. Project aliases cannot weaken identity, navigation,
focus, actions, contrast, or target semantics.
