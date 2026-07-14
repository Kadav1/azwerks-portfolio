# azwerks portfolio token foundation

This directory contains the portfolio-owned normalization of the current
canonical azwerks documents. It is not a package snapshot and has no runtime
package dependency.

The source order is `primitive → semantic → portfolio alias → project-world
alias → component-local consumption`. Update authored JSON under `source/`, run
`npm run tokens:generate`, and never edit `generated/` directly.

`system` mode leaves `data-theme` absent so CSS follows the operating-system
preference. Explicit `dark` or `light` writes only that valid value. Project
worlds use `data-world` and cannot replace focus, action, lifecycle, trust,
selection, or readable-text semantics.
