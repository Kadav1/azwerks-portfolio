# Token architecture `v0.2`

Status: **production foundation implemented**  
Implementation version: `0.1.0`

## Authority and normalization

Current canonical local azwerks documents are the only authority. The accepted
register and section-level evidence matrix sit beside this document. The
portfolio owns the normalized source under `src/tokens/source/`; it is not a
package, package snapshot, or private-document copy.

Each group declares one of four classifications: direct, mapped, derived, or
portfolio-alias. Exact values stay traceable without pretending that structural
choices are direct doctrine.

## Layer model

```text
canonical documents
  → primitive source
  → semantic source
  → portfolio aliases
  → project-world aliases
  → component-local custom properties or semantic consumption
```

References may point only to the same or a lower layer. Mode variants share a
semantic name but have separate dark/light definitions. Components cannot use
`--azw-p-*`; the usage validator enforces that boundary.

## Domains and names

Implemented domains are color, typography, spacing, sizing, radius, border,
elevation, z-index, motion, opacity, breakpoints, content widths, media ratios,
focus, interaction, lifecycle state, trust, authored marks, iconography, atlas,
portfolio shell, and project worlds.

Names use `--azw-*`: primitives `--azw-p-*`, colors `--azw-color-*`, state
`--azw-state-*`, trust `--azw-trust-*`, typography `--azw-type-*`, spacing
`--azw-space-*`, sizing `--azw-size-*`, shape/layer/motion domains, mark/icon
hooks, portfolio aliases, and project-world aliases. Future component-only
variables use `--_component-property-state` and must resolve to approved roles.

## Project-world boundary

Software, visual-system, art, technical-system, and limited-media worlds expose
only canvas/surface emphasis, media surround, density, measure, type emphasis,
and mark intensity. The generator emits generic `--azw-world-*` aliases inside
`[data-world]` selectors. A denylist rejects world names that attempt to govern
focus, action, state, trust, warning, danger, success, selection, or target
geometry.

Art maps its canvas, emphasis, and surround to the mode-specific neutral art
surface and disables marks by default. Limited-media provides a type-led
reading measure and intentional alternate surface without inventing imagery.

## Generated contract

`scripts/generate-tokens.mjs` uses Node built-ins, repository-owned JSON only,
and no network. It sorts declarations, emits stable whitespace, and produces:

- `generated/tokens.css` with cascade layers, modes, aliases, reduced motion,
  higher-contrast enhancement, forced-colors hooks, and print mappings;
- `generated/tokens.ts` with readonly metadata and mode/world types;
- `generated/token-names.ts` with the typed name union;
- `generated/token-manifest.json` with counts and hashes but no current time.

The cascade order is primitives, semantics, portfolio aliases, then worlds.
System light is applied only to `:root:not([data-theme])`; explicit dark/light
selectors therefore win. Generated files are never hand-edited.

## Raw-value policy

Authored production CSS consumes semantic tokens. The leakage scanner rejects
raw colors, primitive variables, arbitrary radii, spacing, content widths,
shadows, z-index, type sizes, durations, and easing. Narrow reset values such as
`0`, `100%`, `currentColor`, `auto`, `none`, and intrinsic layout expressions
remain allowed.

## Versioning, deprecation, and updates

Implementation, generator, portfolio-alias, and project-world-alias versions
are explicit in `source-manifest.json`. A breaking rename or semantic change
increments the implementation contract; document revisions update accepted
hashes and evidence before values change. Deprecated tokens remain aliases for
one reviewed contract cycle, carry a replacement note, and may not become new
component dependencies.

Update workflow:

1. verify canonical status, supersession, headings, and hashes;
2. update the authority register and evidence matrix;
3. edit normalized source with the correct classification;
4. run generation and all validators;
5. review generated diff, contrast, browser modes, and performance;
6. stage authored and generated paths explicitly.

Any missing authority, reference, contrast failure, parity mismatch, leakage,
drift, or performance breach stops publication. The outdated package is never
a fallback.
