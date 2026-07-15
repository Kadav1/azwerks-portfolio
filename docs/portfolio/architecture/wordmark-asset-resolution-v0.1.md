# Wordmark asset resolution v0.1

Date: 2026-07-15  
Verdict: approved current assets resolved; temporary text identity not used

## Authority

The canonical local brand authority is
`wordmark-direction-spec-v1.2.md`. It defines the authored connected lowercase
azwerks wordmark, clear-space/ratio rules, and the canonical design-system
asset package. The current `brand-product-design-spec-v1.5.md`,
`visual-system-spec-v1.6.md`, and `iconography-system-spec-v1.2.md` were checked
for supporting identity, surface, and accessibility direction. No exploration
asset, screenshot, generated approximation, old uppercase mark, monogram, or
handoff component was used.

## Verified files

| Repository asset | Format and intrinsic size | SHA-256 | Use |
| --- | --- | --- | --- |
| `src/assets/brand/az-wordmark.svg` | SVG, viewBox `0 0 897 237` | `a9190943c1aafca4c183da694e3edbaeba2243ee13ef150049b5ce3133df4027` | Dark/system-dark shell surface. |
| `src/assets/brand/wordmark-dark.png` | PNG, 898 by 237 | `dd842140f95da2b0a4d373e265d7141f7801c7dcee0d9a0cd32e56c2454cc3c5` | Light/system-light shell surface. |

Both repository files were copied byte-for-byte from the canonical local
design-system assets and re-hashed. The asset is azwerks-owned identity material
for this owner-controlled public portfolio; the source vault and private paths
are not copied or published. The mark is not recolored or modified.

## Component handling

`BrandIdentity` preserves intrinsic dimensions and ratio, stays within the
governed wordmark measure, and receives tokenized clear space through its link
boundary. Both image alternatives use empty alt text and `aria-hidden`; the
Home link supplies one accessible name, `azwerks, home`, preventing duplicate
announcement of SVG text.

Forced colors hides image artwork and exposes accessible-system-color lowercase
text visually while retaining the link's single accessible name. Print keeps
the identity and removes navigation furniture. There is no identity animation,
texture use, authored-mark decoration, or overlap with focus outlines.

Because the final approved assets were available and verified, the
`temporaryTextIdentity` fallback and `wordmark-asset-block-v0.1.md` are not
applicable.
