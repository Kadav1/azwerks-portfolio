# Work Atlas accessibility contract `v0.1`

Date: 2026-07-15  
Status: implemented and browser-audited; manual assistive-technology review pending

## Semantic equivalence

The route has one H1, one main landmark, Work-current global navigation, a
native local view switch, plain-language map help, separate textual legends,
visible category headings, readable node titles, a complete category-grouped
project index, and a complete relation index. Every project has a native detail
link in the index. SVG is `aria-hidden` and never owns accessibility-critical
information.

The inspector supplements explicit map selection. It is non-modal, does not
steal focus, contains a visible selected-project heading and native links, and
flows in document order. The no-JavaScript and fail-open states retain all
public information.

## Controls and focus

Controls use native form, input, checkbox, details/summary, fieldset/legend,
button, and link semantics. Map entry, roving arrow navigation, selection,
Escape exit, inspector actions, Reset, zoom, and semantic indexes are keyboard
reachable. There is no role application, ARIA grid, focus trap, or gesture-only
action. Minimum visible control targets use the governed 44 CSS pixel token.

## Non-color meaning and modes

Every category has a heading and explicit node label; boundaries and legend
samples vary structurally. Every relation has a textual type, pattern, and
direction sentence; directional edges alone use arrows. Forced colors retains
boundaries, focus, selection, patterns, arrows, controls, and indexes. Reduced
motion uses immediate scrolling and no required animation. Print removes the
interactive plane and retains explanation, legends, native links, relations,
and useful href text.

System/explicit dark and light modes inherit the global theme contract. Invalid
stored mode and storage failure fall back through the existing shell runtime.
No authored mark, artwork tint, idle motion, or continuous animation exists.

## Reflow, zoom, and touch

The page has no intentional horizontal overflow at 320, 375, 768 landscape,
1024, 1440, or 1600 pixels. The labeled Atlas viewport alone may scroll in two
axes with native scrollbars and `touch-action: pan-x pan-y`. Controls wrap,
indexes lead on narrow screens, long synthetic text wraps, and no fixed text
container clips at 200% text enlargement or native browser zoom.

Headless Chrome/CDP verified DOM semantics, dispatched keyboard events,
forced-colors emulation, reduced-motion emulation, print media, 200% root text,
and native browser zoom. No physical touch device or spoken screen-reader
session was used. NVDA/JAWS/VoiceOver/TalkBack output is therefore not claimed
and remains a manual pre-release check.
