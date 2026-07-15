# Navigation contract v0.1

Date: 2026-07-15  
Status: implemented

## Source and model

`src/content/navigation.json` is the only authored production route list. It
uses the merged `navigationFileSchema`; desktop, mobile, footer, the static
validator, and route tests consume a normalized view created by
`createNavigationModel()`.

The model preserves schema fields and adds only `direct`, `external`, and
controlled `regions`. Validation rejects schema failures, fixture/synthetic
items, private items, duplicate targets, unsafe targets, duplicate IDs/orders,
and a missing or indirect Work item. Items sort by unique numeric order.

Primary order is Work, Archive, About, Contact. Identity supplies Home. Footer
order is Contact, Accessibility, Privacy, Colophon. Footer membership is a
bounded shell projection, not a second data source.

The content-foundation compatibility decision permits validated public,
non-synthetic production navigation while continuing to require all production
project/page collections to remain empty. This advances the merged contract
without inventing site-page content.

## Path normalization and current state

Paths normalize query strings, hashes, absolute URLs, duplicate separators,
missing trailing slashes, nested routes, and root. Matching is segment-safe:

- Exact normalized targets use `aria-current="page"` and a non-color border,
  underline, and weight treatment.
- Nested `/work/<slug>/` and `/archive/page/<number>/` paths receive the
  documented visual `data-current="section"` treatment plus hidden text
  `current section`; they do not misuse `aria-current`.
- `/workshop/` cannot match `/work/`, `/aboutness/` cannot match `/about/`, and
  root cannot match every page.
- Query and hash changes do not create false states.

The 404 route passes no matching path and therefore exposes no false current
route.

## Desktop/mobile parity

Both primary navigations receive the same ordered array. Both are native link
lists with visible text labels and identical current-state computation.
Desktop remains static HTML and never depends on JavaScript. Mobile uses native
details as the complete no-JavaScript fallback; enhancement does not remove or
reorder routes. The compact direct Work shortcut may coexist with the Work
entry inside Menu because one provides immediate retrieval and the other
preserves complete information architecture.

## Mobile behavior

The enhanced disclosure contract is:

1. Native summary opens Menu.
2. The script sets expanded state, dialog semantics, inert background, scroll
   lock, and focus on Close as soon as the native toggle is semantically ready.
3. Tab and Shift+Tab wrap inside visible menu controls.
4. Escape or Close dismisses and restores focus to Menu.
5. A successful same-origin link activation dismisses without fighting native
   navigation.
6. Crossing the workspace breakpoint closes and restores background state.
7. Cleanup removes every owned listener and enhancement-only attribute.

No gesture, hover, precision pointer, animation, framework, or focus-trap
package is required.

## External links and safety

External targets require HTTPS through the merged schema. Their visible label
includes `(external)`. Primary membership is currently reserved for the four
local route IDs. There are no `javascript:` URLs, inline handlers, nested
interactive controls, icon-only routes, runtime navigation requests, or hidden
route labels.

## Focus and later integration

Source order is skip links, identity, compact/desktop navigation controls,
main, then footer. CSS hides inactive responsive variants from layout and the
tab order. Focus uses the global token contract independently from current
state.

The future work register may provide `#work-results` to the existing skip-link
boundary. The later atlas may link through normal URLs. Neither feature may
fork the route model, make filtering a navigation prerequisite, or transfer
route ownership to client JavaScript.
