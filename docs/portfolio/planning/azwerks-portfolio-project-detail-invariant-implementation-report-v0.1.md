# Azwerks portfolio project-detail invariant implementation report v0.1

## 1. Executive verdict

Implemented a static-first, public-safe project-detail invariant. Production remains correctly at zero generated detail routes; isolated fixtures prove all five categories and edge states without becoming public content.

## 2. Prerequisite verification

Token/theme, content schema, shell, and register gates passed on refreshed `origin/main`. Merge commits are token `57c8932`, content `1df7849`, shell `2a1b161`, and register `f83ec2b`.

## 3. Base and branch

Base is `origin/main` `f83ec2b61929b0af36c668324c8d52e3edd9ef97`. Work is isolated on `feat/project-detail-invariant-v0.1`.

## 4. Repository state

The approved Kadav1 remote was verified. Three pre-existing unrelated untracked paths remain preserved and excluded; no stash, reset, discard, or history rewrite occurred.

## 5. Existing project-detail state

The pre-change inventory is recorded in `project-detail-existing-state-v0.1.md`: there was no production dynamic detail route or detail component system.

## 6. Public and fixture counts

Production project, companion, and relation counts are each 0. Ten synthetic fixture projects exist; none are publication eligible or route-generating.

## 7. Route architecture

`src/pages/work/[slug].astro` uses static `getStaticPaths()` and typed props. It joins the public production bundle set to production collection entries and calls Astro Content `render()` at build time.

## 8. Route source and exclusions

Only `getPublicProjectBundles()` can feed production paths. Synthetic, private, unlisted, archived, and otherwise ineligible records are classified before route creation; duplicate slugs fail.

## 9. Href contract

`getProjectDetailHref(slug)` is the single owner of canonical `/work/<slug>/` hrefs and rejects unsafe slugs.

## 10. Route manifest

The deterministic manifest reports model/helper version 1.0.0, source count 0, route count 0, empty exclusions, and SHA-256 `9244673ac3561024a157f491aa742f2ca3dba26b769b6ae409270a65c3a05839`. Two generations are byte-identical.

## 11. Work Register integration

The register view-model now imports the project-detail helper and routability predicate; duplicated path construction was removed. Zero public projects therefore means zero detail links.

## 12. View-model contract

`ProjectDetailViewModel` serializes identity, labels, profiles, state, safe media/evidence, process, limitations, releases, links, provenance, relations, contents metadata, canonical/noindex, and previous/next context.

## 13. Private-field exclusions

Private URLs and media, source/rights/redaction notes, local paths, `reviewedBy`, internal reviewer identities, and full raw companion records never enter the view model.

## 14. Invariant anatomy

Focused components preserve orientation, header, lead/no-media, narrative, evidence, limitations, process, releases, links, provenance, relations, and context navigation in stable order.

## 15. Orientation

Native Back to Work, category, optional period, and optional project position render early without breadcrumb theater or filter-state interception.

## 16. Project header

One H1, optional subtitle, concise summary, state summary, and safe public actions define identity without requiring media.

## 17. State summary

Category, lifecycle, maintenance, version, period, evidence, source availability, and experimental state remain distinct human-readable facts.

## 18. Lead-media selection

The documented deterministic priority is artwork, interface, diagram, informative image/SVG, documentary media, then none; decorative media cannot displace informative media.

## 19. Media types

Images/SVG/interface/diagram use figures and intrinsic geometry; audio/video use native controls and transcript access; documents render descriptive public links. No remote embed, autoplay, crop dependency, carousel, or player package exists.

## 20. Art and no-media behavior

Art keeps intrinsic aspect and a neutral token surface. Missing media is a valid textual state with no placeholder or broken frame.

## 21. Markdown rendering

The route calls current Astro `render(entry)` and passes rendered `<Content />`; Markdown is not parsed, copied, fetched, or serialized manually.

## 22. Heading contract

The page H1 belongs to the header. Markdown headings must begin at H2 or deeper, remain rational and unique, and use unobscured scroll targets.

## 23. Table of contents

At least three meaningful H2/H3 headings enable a native-anchor `On this page` section. There is no scroll spy or JavaScript dependency.

## 24. Evidence

Public evidence preserves exact trust/availability, claim, method, result, limitation, version/date, named artifact, and safe link fields. Verified evidence without an artifact is rejected.

## 25. Metric evidence

Metric result, method, unit, and provenance artifact render adjacently; incomplete metric claims are not promoted into KPI tiles.

## 26. Limitations

Safe limitations are visible first-class content and preserve known, accepted, mitigated, and resolved distinctions without generic disclosure hiding.

## 27. Process

Unique ascending order drives semantic ordered items. No dates, durations, or timeline ornament are fabricated.

## 28. Releases

Deterministic newest-first sorting retains version, date, status, summary, safe link, and evidence references without implying first means current.

## 29. Project links

Only safe, unique public destinations render under content-model purpose labels. There are no private, local-network, icon-only, disabled, or conflicting duplicate links.

## 30. Provenance

Owner, authorship, source availability, rights status, review status, and safe review date render; notes, paths, repository identifiers, and reviewer identities do not.

## 31. Relations

Only public, meaningful, nonduplicate relations whose endpoints have detail routes render. Directed and undirected labels preserve causal meaning; no graph data or Atlas output exists.

## 32. Context navigation

Back to Work is always available. Optional previous/next destinations derive from the same deterministic public Work order, do not wrap, and include titles.

## 33. Profile mapping

Category maps directly to its world profile. A bounded function maps category and allowed companion layout profile to standard, technical, or quiet shell profiles.

## 34. World extension seams

Data attributes expose category, layout, theme, and motion profiles. A later phase may change composition and emphasis but cannot change route identity, public safety, H1, focus, evidence, limitations, provenance, relations, or native access.

## 35. Sparse and long states

Tests cover minimum/no-media, long title/summary/narrative, code and tables, many media/limitations/process/releases, transcript media, no optional data, and one/ten-project navigation.

## 36. Fixture harness

Temporary noindex audit routes adapt public-shaped synthetic bundles only inside the browser script. Software, visual-system, art, technical-system, and limited-media categories pass; temporary routes/assets are removed in `finally`.

## 37. Static validation

The 37-file static gate passes production-only source, static route, renderer, shared href, required anatomy, optional guards, extension seams, token, and prohibited-runtime assertions.

## 38. View-model tests

Focused contract and view-model suites pass route counts 0/1/5/10, duplicates, manifest determinism, sanitization, profiles, media, evidence, relations, navigation, sparse state, and headings.

## 39. Browser audit

The expanded 28-case Chrome/CDP audit passes after rebuilding and restoring the production zero-route output.

## 40. Semantics

Browser assertions pass one H1/main, article and labeled regions, figures/captions, ordered process, labeled relation/context navigation, and empty-section absence.

## 41. Keyboard

Native links/controls, early Back to Work, contents anchors, skip-link focus, and locally scrollable code/table regions pass. No focus trap, hidden focusable content, shortcut, or gesture is introduced.

## 42. Screen-reader checks

Semantic DOM and accessible names were inspected. No physical screen-reader was available or claimed; that remains manual follow-up.

## 43. Responsive and modes

Dark, light, system-dark/light, no JavaScript, forced colors, reduced motion, print, 200% text, deterministic 200% browser-zoom emulation, landscape mobile, and 320/375/768/1024/1440/1600 widths pass automated assertions.

## 44. Privacy assertions

HTML and serialized props contain no local paths, private URLs/evidence/media, redaction/source notes, internal reviewer identity, fixture collection name, or synthetic public-work marker.

## 45. Token regression

`npm run tokens:check`, including usage validation, passes. Project styles resolve through governed semantic/world tokens and local aliases.

## 46. Content regression

`npm run content:check` passes; schemas and fixture publication state are unchanged.

## 47. Shell regression

`npm run shell:check` and Astro checks pass; the shell remains owner of main, focus, theme, external-link, and reduced-motion semantics.

## 48. Register regression

`npm run register:check` passes with the shared helper contract and existing state behavior.

## 49. Performance

Project CSS is 6,624 bytes / 1,449 gzip; essential JS 0; third-party runtime/content requests/continuous animation 0; CLS 0. Sparse/normal/long HTML is 9,312/10,320/13,345 bytes and normal DOM 219 nodes. Local 0/5/10 route builds measured 1,710/1,700/1,738 ms; restored production zero-route build measured 1,844 ms.

## 50. Package scripts

Focused generate, validate, view-model test, generated check, browser audit, and composite detail gates were added without recursive check/build scripts.

## 51. Dependencies

No dependency or lockfile change was made. Astro remains 7.0.9; no MDX, framework, media, gallery, routing, analytics, or sanitization runtime was added.

## 52. CI

Existing least-privilege CI is unchanged. Browser audit remains an explicit review command; immediate draft-PR CI state is recorded at publication.

## 53. Files changed

The explicit path-by-path inventory and exclusions are in `project-detail-invariant-staging-manifest-v0.1.md`.

## 54. Deferred work

Real content/migration, final project worlds, Atlas, continuity/Transitions, archive policy, scene systems, CMS/data services, physical screen-reader, and real-device testing remain deferred.

## 55. Risks

Zero real content means future entries still need authoring review. Local browser timing is indicative rather than a CI guarantee. Future worlds must honor the extension contract.

## 56. Commit

The intended single commit is `feat: establish project detail invariant`; its resulting SHA is recorded in the final handoff because this report is part of that commit.

## 57. Pull request

The branch is pushed and a draft PR is created only after final gates. URL and immediate CI state are recorded in the final handoff; the PR is not merged.

## 58. Next prompt

After successful review and merge: `azwerks-portfolio-project-worlds-codex-prompt-v0.1.md`. It is neither written nor executed here.

## 59. Completion checklist

- Static zero-route production contract and isolated five-category coverage: complete.
- Shared href, deterministic manifest, strict public view model, invariant anatomy, Markdown/media/evidence/navigation contracts: complete.
- Static, unit, browser, privacy, token, content, shell, register, Astro, build, and diff gates: complete when the final command transcript remains green.
- No real content, fixture route, private publication, final world, Atlas, View Transition, CMS, MDX, or third-party runtime: confirmed.
- No direct `main` work, force push, or merge: confirmed.
