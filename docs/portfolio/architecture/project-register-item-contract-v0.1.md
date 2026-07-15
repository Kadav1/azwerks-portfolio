# Project Register Item contract `v0.1`

Date: 2026-07-15

## Hierarchy

Each semantic list item contains an article and presents, in order: title,
concise summary, category, known display period, meaningful maintenance state,
evidence cue, bounded capabilities/tags, and one optional preview. Lifecycle,
maintenance, and evidence trust remain separate concepts.

Category labels are Software, Visual system, Art, Technical system, and Limited
media. Evidence labels are Verified evidence, Reviewed evidence, Evidence
available, Evidence unavailable, or Private evidence. `not-applicable`
maintenance is omitted rather than shown as administrative noise.

## Bounded discovery terms

Capabilities precede tags, duplicates are removed, and at most four terms are
visible. Remaining terms are summarized as “N more”; there is no hidden
interaction, tooltip dependency, or permanent metadata strip. Platforms remain
searchable but are not automatically displayed.

## Preview

One public image may render only when availability, rights, source, alt text,
and positive intrinsic width/height are valid. Images reserve dimensions, lazy
load, decode asynchronously, and never autoplay or form a carousel. Art uses
the governed neutral surface and `contain` behavior to preserve ratio and
fidelity. Caption text remains adjacent when present.

Media absence renders no placeholder, apology, empty frame, or fabricated
preview. Limited-media records rely on title, summary, state, evidence, and
type-led rhythm.

## Destinations and long content

Title is a native link only when `href` is backed by the implemented detail-
route contract. Before that contract, it is ordinary heading text. Nested
interactivity and disabled fake links are prohibited.

Titles and summaries wrap; no display truncation is used. Facts flex and wrap.
The single-column DOM order remains canonical at every width and 200% text.

## Prohibited fields and patterns

Items never expose private links, source paths, source/rights/redaction notes,
unpublished evidence detail, provenance detail, relation counts, scores,
metrics theater, pulsing status, decorative dots, hover-only meaning, universal
card decoration, equal mandatory thumbnails, or color-only state.
