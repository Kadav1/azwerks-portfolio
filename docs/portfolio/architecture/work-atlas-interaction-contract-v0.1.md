# Work Atlas interaction contract `v0.1`

Date: 2026-07-15  
Status: implemented progressive enhancement

## No-JavaScript and failure recovery

Static project and relation indexes are complete before enhancement. Controls
and the spatial viewport are hidden until the controller parses and normalizes
state, validates required DOM ownership, renders the first state, and sets
`data-atlas-enhanced="true"`. A failure hides interactive surfaces, restores
all data, opens the indexes, clears transforms, and explains that only the
spatial view is unavailable.

## Viewport and zoom

The plane sits in a labeled native overflow region. Ordinary wheel and touch
scrolling are not captured. Background dragging is not implemented. Zoom uses
visible buttons at bounded steps 0.8, 1, 1.2, and 1.4. Reset returns to scale 1
and scroll origin. Center selected uses native `scrollTo()` with immediate
behavior. Zoom and scroll origin never enter URL/history.

## Selection and keyboard

Project nodes are native buttons. Explicit selection updates `aria-pressed`,
the external inspector, focused visual relations, and the public focus slug
without moving focus. The inspector contains native project and Register links
and never replaces the semantic indexes.

“Enter map navigation” focuses the selected or first visible node. One node has
roving `tabindex="0"` while map navigation is active. Arrow keys choose the
nearest visible node in the requested direction using deterministic coordinate
distance. Escape removes the roving entry and returns focus to the entry
button. There is no application role, fake grid, pointer emulation, or focus
trap.

## Search, filter, URL, and history

Recognized Atlas state is `q`, repeated `category`, `maintenance`, `evidence`,
repeated `relation`, and one validated public `focus` slug. Compatible fields
reuse Register normalization/filtering. Groups combine with AND; repeated
values combine with OR. Relation filtering only removes explicit visible edges.

Apply and Reset use `pushState`; initial invalid/duplicate normalization and
node focus selection use `replaceState`; `popstate` restores controls, visible
nodes, safe edges, focus, selection, and inspector. No keystroke creates
history. Unknown parameters are dropped safely.

## Density and responsive behavior

Sparse views show all safe edges. Dense views initially show only selected-node
edges; “Show all visible relation lines” reveals the already-existing filtered
edges. The full semantic relation index remains unchanged.

On narrow screens the semantic indexes precede the map visually. Controls wrap,
the inspector follows in document order, and map interaction requires no hover.
The viewport may scroll internally; the page must not scroll horizontally.
