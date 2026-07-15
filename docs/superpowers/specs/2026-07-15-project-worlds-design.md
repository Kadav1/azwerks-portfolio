# Project worlds design

## Status

Approved by the supplied project-world implementation brief. This specification records the implementation interpretation without reopening the locked direction.

## Architecture

The merged project-detail route, public view model, shell, publication policy, and shared semantic components remain invariant. `ProjectWorld.astro` resolves the project category through one frozen typed registry and dispatches to one of five explicit composition components. Each composition declares semantic section order using a shared `WorldSection` renderer, so evidence, limitations, provenance, relations, media safety, and navigation logic are never forked.

## World distinctions

- Software prioritizes product purpose, interface evidence, maintenance, releases, and inspectable proof with a technical shell and compact-to-balanced density.
- Visual system prioritizes a specimen stage, system narrative, selected implementation/accessibility evidence, limitations, and versioning with a standard shell.
- Art prioritizes an uncropped neutral artwork stage, compact metadata, narrow reflection, process, rights/provenance, and quiet relations with a quiet shell.
- Technical system prioritizes architecture/diagram evidence, compatibility, implementation narrative, limitations, releases, and source truth with a technical shell.
- Limited media prioritizes document-led identity, chronology/narrative, evidence, limitations, and provenance without inventing media, using a quiet shell.

Every world remains one linear semantic document on small screens, no JavaScript, forced colors, and print. Wider compositions use intrinsic grid behavior and governed measures rather than a parallel breakpoint or token system.

## Registry and policy

The registry derives only from `ProjectCategory`. Unknown values throw `PROJECT_WORLD_CATEGORY_UNKNOWN`. Definitions include controlled shell/world/layout/theme/motion profiles, lead/narrative strategies, section emphasis, one typed section policy, and authored-mark level. All definitions and nested arrays are frozen and sorted deterministically.

Required sections are orientation, header, limitations, provenance, and context navigation. Limitations and provenance cannot be disabled; they render when meaningful under the invariant rules. Empty optional sections remain absent.

## Authored marks and media

All five worlds ship at authored-mark Level 0. No mark asset, pseudo-element, or decorative substitute is created. The policy permits future Level 1 only on an approved non-functional surface with clean, reduced, forced-colors, print, and removal proofs.

World media policy may change prominence, alignment, caption measure, neutral surround, and sequence rhythm. It cannot change source safety, rights, availability, intrinsic geometry, alt text, captions, transcript access, or lead selection truth. Art always uses the existing neutral art surface and `object-fit: contain`.

## Accessibility, fallbacks, and performance

The five compositions retain one H1, normal links, stable shell focus/theme/touch semantics, visible limitations, public provenance, native media controls, named relations, and Back/previous/next behavior. Forced colors removes expressive surfaces; print removes only navigation/media controls; no JavaScript retains all content. Reduced motion introduces no world animation because essential project-world JavaScript is zero.

Combined world CSS must remain at or below 24KB gzip, world JavaScript at zero, third-party runtime and content fetches at zero, world CLS at zero, and equivalent fixture build regression at or below 20% against the recorded invariant baseline.

## Validation

Test-first registry coverage proves the exact five mappings, category-only derivation, frozen definitions, section policies, Level 0 posture, view-model privacy, and deterministic manifest. Static validation proves invariant ownership and prohibited dependencies. A temporary browser harness covers rich/sparse software, visual system, art with/without media, technical system, limited media, long/minimum records, all required modes and widths, keyboard focus, semantics, privacy, overflow, media fidelity, and performance; it removes temporary routes and assets in `finally`.
