# Theme contract `v0.2`

Status: **implemented**  
Storage key: `azwerks.portfolio.theme.v1`

## Modes

- `dark` is the flagship, deep structured mode. Flat surface changes and
  hairlines provide depth; there is no glow or universal black-card system.
- `light` is an independently mapped companion with complete 50-role parity
  and its own contrast results.
- `system` is represented by the absence of `data-theme`. CSS defaults to dark
  and maps light inside `prefers-color-scheme: light` only when no explicit
  attribute exists.

Only `dark`, `light`, and `system` are valid runtime inputs. The DOM receives
only `data-theme="dark"` or `data-theme="light"`; system removes the attribute.
Invalid stored values and storage exceptions resolve safely to system.

## Initial paint and JavaScript boundaries

`BaseLayout.astro` contains one 211-byte inline bootstrap. It reads only the
versioned key inside `try/catch`, applies an explicit valid value before page
content, and otherwise leaves CSS system behavior intact. It performs no
network request and creates no framework or SPA dependency. With JavaScript
disabled, the CSS contract still follows system preference.

An inline script has Content Security Policy implications: a future CSP must
allow it through an exact hash or nonce, or move an equivalent audited script
into an allowed early-loading strategy. This repository does not claim that a
CSP is currently configured.

## Runtime API

`src/tokens/runtime/theme.ts` exports the type, parser, resolution function,
safe storage helpers, apply/set helpers, event name, and typed event detail.
Browser access is guarded, so importing it during server rendering does not
execute DOM or storage work. A later shell may build a visible control on this
API; no toggle is included now.

## Accessibility and fallback

- `color-scheme: dark light` is declared in CSS and metadata.
- `prefers-reduced-motion: reduce` maps motion and mark allowance to the
  zero-duration contract.
- `forced-colors: active` replaces authored colors with system colors and
  removes decorative mark layers.
- `prefers-contrast: more` strengthens functional boundaries as progressive
  enhancement.
- print uses the ratified light mappings.
- all authored values use broadly supported hex/RGBA syntax; no modern-color
  fallback is needed.
- focus and selection are independent roles with 2px-equivalent ring geometry.
- content and meaning never depend on theme.

## Project worlds

`data-world` can change only expressive surface emphasis, media surround,
density, measure, type emphasis, and mark allowance. Focus, primary actions,
errors, warnings, success, lifecycle, trust, readable text, selection,
wordmark identity, keyboard behavior, and touch targets remain global
semantics.

## Failure behavior

Unavailable storage, invalid stored input, or JavaScript failure leaves
`data-theme` absent and the document readable in system mode. Unsupported
forced-colors or prefers-contrast features simply retain the tested semantic
theme. No external initialization, font, or token request exists.
