# Global shell existing state v0.1

Date: 2026-07-15  
Base reviewed: `origin/main` at `1df784993abc5545cebee31601da1b2a5d93863e`

## Verdict

The merged foundations provide a clean document and token boundary but no
production shell. `BaseLayout` is a document wrapper, the single route is a
token verification page, production navigation is empty, and no client
navigation behavior exists. The shell phase can replace the temporary route
surface while retaining the theme bootstrap and global token contract.

## Classification

| Path or area | Class | Reason |
| --- | --- | --- |
| `src/layouts/BaseLayout.astro` | adapt | Retain document ownership and pre-paint theme bootstrap; remove direct ownership of the main landmark. |
| `src/pages/index.astro` | replace | Temporary token-foundation verification route, not homepage architecture or public copy. |
| `src/styles/global.css` | adapt | Retain reset, semantic base, link, selection, and focus contracts; remove temporary `.foundation*` rules. |
| `src/content/navigation.json` | adapt | Canonical production navigation source exists but is intentionally empty. |
| `src/content/fixtures/navigation.json` | retain | Synthetic validation evidence; it must not be imported or published. |
| `src/tokens/generated/*` | generated | Current generated token contract; never hand-edit. |
| `src/tokens/runtime/theme.ts` | retain | Server-safe system/dark/light runtime and versioned storage contract. |
| `src/components/` | unknown | No production components exist yet. |
| `src/lib/` and `src/scripts/` | unknown | No shell utilities or browser behavior exist yet. |
| `public/.gitkeep` | retain | Public pass-through boundary remains otherwise empty. |
| `src/assets/` | identity-blocked | No approved identity asset is present in the repository at this base. |

## Layout hierarchy

`BaseLayout.astro` currently emits `html`, `head`, `body`, and a direct
`main#main-content` around its slot. There is no separate shell composition,
header, navigation, footer, skip-link owner, shell status, or profile contract.

The production contract must move the main landmark into `GlobalShell` so
`BaseLayout` remains responsible only for document concerns.

## Head metadata and theme bootstrap

The layout currently provides UTF-8, description, viewport, `color-scheme`,
title, generated token CSS, global CSS, and a 211-byte inline theme bootstrap.
It has no canonical or `noindex` hooks. The bootstrap uses
`azwerks.portfolio.theme.v1`, accepts only dark/light storage values, and
leaves system mode attribute-free. Its inline form has documented future CSP
hash/nonce implications; no CSP is currently configured.

## Routes

Only `src/pages/index.astro` exists. It renders one H1 and several token/state
specimens inside the temporary `.foundation` surface. No Work, Archive, About,
Contact, Accessibility, Privacy, Colophon, or 404 route exists.

## Navigation source

`src/content/navigation.json` is `[]`. Its strict merged schema supports
`page`, `route`, and `external` kinds with safe targets, unique IDs/orders,
visibility, and synthetic-state fields. The fixture navigation file contains
private synthetic Work, Archive, About, and Contact entries and is evidence
only.

Because scaffold routes are route files rather than production `sitePages`
content, the compatible production decision is to use public, non-synthetic
`route` items for this phase. This preserves the merged schema without
inventing site-page content or a second route list.

## Identity resolution

The repository contains no approved wordmark asset. The canonical local brand
record is `wordmark-direction-spec-v1.2.md`, hash
`90b2400e7fc200c1190cc63bf15bfc2bcc728c530a2b6df5b434e68563372e34`.
It identifies the custom connected lowercase wordmark and verifies
`10_Brand/06_design_system/assets/az-wordmark.svg` as the canonical vector.

The current local canonical SVG exists with viewBox `0 0 897 237`, hash
`a9190943c1aafca4c183da694e3edbaeba2243ee13ef150049b5ce3133df4027`,
and matches the asset explicitly prepared for a portfolio header handoff. The
canonical package states that the identity is authored azwerks material and
all rights are reserved. It is appropriate for this owner-controlled public
portfolio, but it must remain unmodified and its source-vault path must not be
published. The SVG is the dark-surface treatment; the verified light-surface
PNG is 898 by 237 with hash
`dd842140f95da2b0a4d373e265d7141f7801c7dcee0d9a0cd32e56c2454cc3c5`.

## Focus and access

Global `:focus-visible` uses the tokenized outline and offset. There is no skip
link, sticky obstruction, current-route semantics, dialog, focus containment,
inert handling, focus restoration, or route-specific focus architecture.

## Client scripts and mobile behavior

The only client script is the inline theme pre-paint bootstrap. There is no
mobile navigation, visible theme control, framework island, listener lifecycle,
network request, or third-party runtime. The current route is a single-column
static page and has no navigation responsive behavior.

## Token usage

Authored production CSS consumes semantic and portfolio aliases. The token
usage validator rejects primitive variables, raw colors, raw motion, raw
z-index, raw shadows, raw radii, raw font sizes, raw spacing, and raw content
widths. Generated breakpoints exist as values but CSS custom properties cannot
be evaluated in media conditions; any media-query literal must exactly match a
governed breakpoint and be checked by the shell validator.

## Temporary foundation content

The index copy, state panels, code specimen, and neutral artwork placeholder
are token-foundation evidence only. They contain no project fixture imports and
must not be treated as production portfolio content. The shell phase replaces
them with concise `noindex` foundation scaffolds.

## Conflicts and preservation

- New documentation under `docs/` is ignored by the root `.gitignore` and will
  require explicit force-staging of approved paths.
- Two root prototype validators and `scripts/.gitkeep` are pre-existing,
  unrelated untracked files and remain excluded.
- The prior local prerequisite-block report remains ignored evidence from the
  earlier stopped run and is not part of the successful shell staging scope.
- No exploration prototype, fixture schema, screenshot, or handoff component
  is a production dependency.
