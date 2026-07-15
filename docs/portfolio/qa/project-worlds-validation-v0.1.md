# Project worlds validation v0.1

## Automated result

All reported results are from 2026-07-15 on branch `feat/project-worlds-v0.1` at the pre-commit working tree based on `2937ac391a37d574b74c4a9eff6d2eef020044eb`.

- Prerequisite gates passed: tokens, content, shell, register, detail, Astro check, and build.
- Registry tests passed: exact five mappings, frozen definitions, unknown-category failure, profile mapping, five unique policies, Level 0 marks, safe media policy, sparse derivation, public-safe view model, and deterministic manifest.
- Composition tests passed: dispatcher ownership, five explicit sequences, shared invariant renderer, optional guards, governed CSS, fallbacks, static route preservation, and fixture-free production imports.
- Project-world static validator passed with five worlds and zero production routes.
- Manifest generated twice byte-identically. Hash: `2f8f21ee7db71e86febb2fcf307e1258da604eb666ead94ce186afb67f152812`.
- Detail manifest remained zero routes at hash `9244673ac3561024a157f491aa742f2ca3dba26b769b6ae409270a65c3a05839`.

## Isolated browser audit

Chrome/CDP and ffmpeg were used through the temporary `/project-worlds-audit/` harness. The source route and public assets were removed in `finally`, followed by a restored production build. Result: 31/31 scenarios passed.

Covered rich and sparse software, visual system, art with and without media, technical system, limited media, long content, native audio/video transcripts, portrait/landscape/square art, verified and private evidence, limitations, process, releases, relations, navigation boundaries, unknown slug, and zero/5/10 route sets.

Modes passed: explicit dark/light, system dark/light, invalid storage, no JavaScript, reduced motion, forced colors, and print. Responsive checks passed at 320, 375, 768 landscape, 1024, 1440, and 1600 pixels; 200% text enlargement and emulated 200% browser zoom passed without page overflow.

Keyboard spot-check used physical Tab events through CDP: the shell skip link received first focus. Native links and media controls were included in focusability assertions. No focus trap or hidden synthetic action was found.

No physical screen-reader session was performed. Screen-reader-facing semantics were inspected in DOM: one H1, one main, one project article, labeled navigation, visible headings, figures/captions, text state, transcript text, limitation/provenance sections, relation labels, and previous/next labels. A physical assistive-technology pass remains a manual review item, not a claimed result.

## Privacy and performance

Rendered HTML excluded local/private paths, private URLs, source/rights/redaction notes, internal reviewer identity, fixture collection names, and public synthetic markers. Production route count remained zero; no fixture became a production route.

- Combined emitted CSS containing world rules: 12,187 bytes; 2,092 bytes gzip (budget 24 KiB gzip).
- Essential project-world JavaScript: 0 bytes.
- Third-party runtime and runtime content requests: 0.
- Continuous animations: 0; world-induced CLS: 0.
- HTML: sparse 10,293 bytes; normal 11,342 bytes; long 14,509 bytes.
- Normal DOM: 228 nodes.
- Build samples: 0 routes 2,983.90 ms; 5 routes 2,903.08 ms; 10 routes 2,674.06 ms; restored production zero 3,167.27 ms.
- Ten-route time remained below the recorded baseline-plus-20-percent ceiling of 3,315.20 ms.

Public synthetic media requests were recorded separately and were not content-data requests.
