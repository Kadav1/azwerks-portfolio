# Token document authority register `v0.2`

Status: **resolved**  
Date: 2026-07-14

Logical references redact the private vault root. Optional local-evidence paths
identify ignored workspace snapshots used for byte verification when present;
they are not published or imported by production modules.

| Document | Version and status | Classification | SHA-256 | Headings used | Governs | Public copy |
|---|---|---|---|---|---|---|
| azwerks Radium Color Palette Spec | 1.4 canonical; supersedes 1.3 | canonical-value-authority | `d8d63f9a4b2255978e0e1893fad46c2607852b6f8390b0ac5063c47180d70fc9` | Primitive Scales; Semantic Token Mapping; Interaction and Structural Signals; Themes and Surfaces; Accessibility Pairing Matrix; Sizing and Rhythm | exact color, modes, interaction, state, trust, radii, borders, fast motion | existing evidence copy only |
| azwerks Design Token Spec | 1.5 canonical; supersedes 1.4 | canonical-role-authority | `918a20e8ffd25bd1b058456226f647a7524b552b519ab796188ad85792814db4` | Required Token Layers; Naming; Typography; Spacing; Shape, Border, Elevation, and Motion; Focus and Keyboard Navigation | architecture, role separation, naming, domains, consumption | existing evidence copy only |
| AZWERKS Asset Palette Application Map | 1.4 canonical; supersedes 1.3 | canonical-application-authority | `90d0fa5b3330510e878beef98e7752d67cf950d03974966b1a6607b42d082648` | Global Color Roles; Mode Base Mapping; Asset-Class Profiles; Accessibility | asset routing, artwork neutrality, expressive boundaries | existing evidence copy only |
| AZWERKS Universal Theme Spec | 1.2 canonical; supersedes 1.1 | canonical-mode-authority | `f13e7e969c3695791c0af754843ce0137e144f3e938d3c9c65bf3e315fe6f98e` | Required Theme Layers; compliance sections recorded by v0.1 discovery | dark/light/system contract and fallback boundary | no |
| azwerks Visual System Spec | 1.6 canonical; supersedes 1.5 | canonical-role-authority | `ab800a65b6cd7d9fd682b6b34d840c5e5f207bf78e8f9c42033e384167ed7cf0` | Surface Hierarchy; Typography System; State Behavior; Responsive Behavior; Accessibility; Motion Behavior | typography, hierarchy, responsive behavior, motion | existing evidence copy only |
| AZWERKS Brand Product Design Spec | 1.5 canonical; supersedes 1.4 | canonical-application-authority | `4b0949a111df9278ec455f431a8e210305e86a4e116d884348bbc9f4dd1ac3b1` | Context Profiles; Product Structure; Content Hierarchy; Trust; Motion | portfolio and project-world constraints | existing evidence copy only |
| azwerks Wordmark and Identity Record | 1.2 canonical; supersedes 1.1 | canonical-identity-boundary | `90b2400e7fc200c1190cc63bf15bfc2bcc728c530a2b6df5b434e68563372e34` | Scale and Responsive Behavior; Clear Space; QA | wordmark sizing and clear-space hooks only | existing evidence copy only |
| azwerks Authored Mark Language Spec | 1.2 canonical; supersedes 1.1 | canonical-mark-boundary | `54b79efeb636a4b95cdc4239a886dafec719716b264653c0a7077dab15802e7c` | Usage Levels; Color; Motion; Accessibility | removable mark intensity and fallback hooks | existing evidence copy only |
| AZWERKS Iconography System Spec | 1.2 canonical; supersedes 1.1 | canonical-icon-boundary | `110cf3b30ba6ba0e148bcbb102366d8d329a04bd2fbf63f59dbac52f27e7e88d` | Grid and Geometry; Sizing; Semantic Color; State; Accessibility | functional icon hooks | existing evidence copy only |

All accepted documents use logical references beneath
`<approved-brand-vault>/10_Brand/00_Standards/`. Exact optional local-evidence
paths and pinned hashes are recorded in `src/tokens/source/source-manifest.json`.

## Other candidates

| Candidate | Classification | Decision |
|---|---|---|
| Radium Palette Reference v1.2 | historical numeric reference tied to v1.2 palette doctrine | rejected for current governance; v1.4 palette spec is direct and newer |
| design-token, universal-theme, component-specific, visual-system, and UI-translation templates | structural-template-only | not used for values; no current repository-local copies required by generation |
| asset-size-suite | missing | not required for token output; asset production remains deferred |
| outdated local package | irrelevant | excluded from all authority and implementation |

No unresolved conflict remains in an implemented domain. Light signal steps and
portfolio scales marked `derived` follow explicit canonical accessibility or
structural rules and are contrast-validated; they are not represented as
direct document values.
