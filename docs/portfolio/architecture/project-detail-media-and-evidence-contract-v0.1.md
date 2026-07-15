# Project detail media and evidence contract `v0.1`

Date: 2026-07-15

## Public media boundary

Media renders only when availability is `available`, rights are owned/licensed/permission-granted/public-domain, the source is a safe local or HTTPS destination, and required accessibility fields exist. Private, unavailable, unknown-rights, unsafe-path, and unsafe-host media is removed before rendering.

Lead selection is stable: artwork, interface, diagram, informative image/SVG, documentary media, decorative media, then none. Source order breaks ties. One lead anchors the media region; remaining public media follows in source order. This is a shared invariant boundary, not a category-specific gallery.

Images, SVG, interface captures, and diagrams retain intrinsic dimensions or governed ratio and use contain behavior. Artwork uses the neutral art surface without tint, crop, filter, overlay, or shadow. Video and audio use native controls, never autoplay, and display their transcript contract. Video posters must pass the same source safety rule. Documents render as descriptive links; no PDF viewer, iframe, remote embed, carousel, lightbox, or gallery editor exists.

No safe media is valid. The no-media component states unavailable/private/not-applicable truth without a broken frame, illustration, apology, or fabricated screenshot.

## Evidence truth

Evidence retains `unverified`, `reviewed`, `verified`, `unavailable`, and `private` exactly. Verified requires and renders the named artifact. Metric evidence keeps method, result, unit, and artifact in the same evidence item. Reviewed is never promoted to verified; no score, stars, percentages, KPI tiles, or quality rating is derived.

Public evidence URLs render only for public availability and safe HTTPS destinations. Private and unavailable items can truthfully state existence but expose no URL. Process, limitation, and release references are filtered to public evidence IDs.

Limitations are a first-class visible section with known/accepted/mitigated/resolved labels. Process is an ascending semantic ordered list. Releases sort newest first and retain planned/candidate/released/superseded/withdrawn state. Sorting does not imply which release is current.

## Accessibility and failure

Informative media uses meaningful alt; decorative media uses empty alt. Captions, credits, descriptions, and transcripts remain adjacent. Native controls remain keyboard accessible without project JavaScript. Missing Markdown, unsafe private data, duplicate slug, or invalid heading structure fails the build rather than degrading into raw Markdown, broken media, or overstated evidence.
