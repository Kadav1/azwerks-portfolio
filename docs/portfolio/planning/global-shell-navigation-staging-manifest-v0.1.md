# Global shell navigation staging manifest v0.1

Date: 2026-07-15  
Branch: `feat/global-shell-navigation-v0.1`

Privacy review for every included path: no secret, private source path, fixture
project content, real project content, analytics identifier, form endpoint, or
personal contact data. Canonical brand source-vault paths appear only in local
research and are not published in production files.

| Path | Purpose / class / owner | Dependency | Decision and reason |
| --- | --- | --- | --- |
| `package.json` | Authored shell scripts / tooling | token, content, Astro | Include: composes shell gates without recursion. |
| `scripts/browser-global-shell-audit.mjs` | Authored browser audit / QA | built site, local Chrome/CDP | Include: deterministic non-framework browser validation. |
| `scripts/validate-global-shell.mjs` | Authored static audit / QA | navigation model, filesystem | Include: stable shell errors and scope checks. |
| `scripts/validate-content-foundation.mjs` | Authored compatibility adaptation / content owner | merged navigation schema | Include: permits only public non-synthetic production navigation while content stays empty. |
| `scripts/validate-token-usage.mjs` | Authored parser correction / token owner | token usage gate | Include: exact CSS property and percentage parsing; no gate weakening. |
| `src/assets/brand/az-wordmark.svg` | Authored approved asset / BrandIdentity | canonical v1.2 identity | Include: verified dark-surface SVG. |
| `src/assets/brand/wordmark-dark.png` | Authored approved asset / BrandIdentity | canonical v1.2 identity | Include: verified light-surface PNG. |
| `src/content/navigation.json` | Authored production navigation / content contract | merged navigation schema | Include: seven public non-synthetic routes; no fixture. |
| `src/components/navigation/NavigationLink.astro` | Authored internal-link component | normalized model/current matcher | Include: exact/section current treatment. |
| `src/components/navigation/ExternalNavigationLink.astro` | Authored external-link component | normalized model | Include: visible external indication. |
| `src/components/shell/BrandIdentity.astro` | Authored shell component | verified assets | Include: Home identity boundary. |
| `src/components/shell/GlobalFooter.astro` | Authored shell component | footer model | Include: concise footer. |
| `src/components/shell/GlobalHeader.astro` | Authored shell component | identity/nav/theme/status | Include: compact responsive composition. |
| `src/components/shell/MobileNavigation.astro` | Authored shell component | shared primary model | Include: native fallback/enhancement hooks. |
| `src/components/shell/PrimaryNavigation.astro` | Authored shell component | shared primary model | Include: static semantic desktop nav. |
| `src/components/shell/ShellStatus.astro` | Authored optional component | strict props | Include: truthful empty-by-default status boundary. |
| `src/components/shell/SkipLinks.astro` | Authored shell component | main/work IDs | Include: focus retrieval. |
| `src/components/shell/ThemeControl.astro` | Authored shell component | existing theme runtime | Include: visible native modes, truthful no-JS state. |
| `src/layouts/BaseLayout.astro` | Authored adaptation / document owner | tokens/global CSS/theme bootstrap | Include: metadata/canonical/noindex boundary. |
| `src/layouts/GlobalShell.astro` | Authored production layout / shell owner | all shell owners/model | Include: typed stable master composition. |
| `src/lib/navigation/current-route.ts` | Authored utility / navigation owner | URL normalization | Include: deterministic exact/section state. |
| `src/lib/navigation/navigation-model.ts` | Authored model / navigation owner | merged types/validator | Include: one desktop/mobile/footer model. |
| `src/lib/navigation/navigation-validation.ts` | Authored validation / navigation owner | merged schema | Include: public/safe/direct-Work contract. |
| `src/lib/shell/shell-context.ts` | Authored context / shell owner | strict profile types | Include: runtime profile validation/invariants. |
| `src/lib/shell/shell-types.ts` | Authored types / shell owner | none | Include: controlled profile/world values. |
| `src/scripts/shell-navigation.ts` | Authored enhancement / shell interaction owner | existing theme runtime | Include: menu/theme lifecycle only. |
| `src/styles/global.css` | Authored adaptation / document styling | semantic tokens | Include: reset/base/focus; temporary foundation styles removed. |
| `src/styles/shell.css` | Authored shell/scaffold styling / shell owner | semantic/portfolio tokens | Include: responsive/accessibility/profile contract. |
| `src/pages/index.astro` | Temporary noindex scaffold / Home owner | GlobalShell | Include: exercises Home without final composition/copy. |
| `src/pages/work/index.astro` | Temporary noindex scaffold / Work owner | GlobalShell | Include: future results target; no register/projects. |
| `src/pages/archive/index.astro` | Temporary noindex scaffold / Archive owner | GlobalShell | Include: no rows/filters/index implementation. |
| `src/pages/about.astro` | Temporary noindex scaffold / About owner | GlobalShell | Include: no invented biography. |
| `src/pages/contact.astro` | Temporary noindex scaffold / Contact owner | GlobalShell | Include: no form/private address. |
| `src/pages/accessibility.astro` | Temporary noindex scaffold / Accessibility owner | GlobalShell | Include: bounded truthful shell commitments. |
| `src/pages/privacy.astro` | Temporary noindex scaffold / Privacy owner | GlobalShell | Include: current no-tracking posture, not final legal policy. |
| `src/pages/colophon.astro` | Temporary noindex scaffold / Colophon owner | GlobalShell | Include: verified stack/stage only. |
| `src/pages/404.astro` | Temporary noindex scaffold / error route owner | GlobalShell | Include: clear Home/Work recovery, no current route. |
| `tests/shell/current-route.test.mjs` | Authored unit test / navigation owner | current-route utility | Include: normalization and collision regression. |
| `tests/shell/navigation-model.test.mjs` | Authored unit test / navigation owner | model/merged schema | Include: parity, order, safety regression. |
| `tests/shell/shell-context.test.mjs` | Authored unit test / shell owner | context utility | Include: profile invariants/errors. |
| `docs/portfolio/architecture/global-shell-existing-state-v0.1.md` | Authored architecture inventory | base repository | Include: records pre-change purpose/classification. |
| `docs/portfolio/architecture/global-shell-architecture-v0.1.md` | Authored architecture contract | implementation | Include: stable-master ownership and limits. |
| `docs/portfolio/architecture/navigation-contract-v0.1.md` | Authored architecture contract | navigation implementation | Include: route/menu/focus behavior. |
| `docs/portfolio/architecture/shell-context-profile-contract-v0.1.md` | Authored architecture contract | profile implementation | Include: controlled variation/invariants. |
| `docs/portfolio/architecture/wordmark-asset-resolution-v0.1.md` | Authored identity record | canonical local brand specs/assets | Include: hashes, authority, accessible use. |
| `docs/portfolio/qa/global-shell-and-navigation-validation-v0.1.md` | Authored QA record | commands/browser evidence | Include: honest results/manual gaps. |
| `docs/portfolio/planning/global-shell-navigation-staging-manifest-v0.1.md` | Authored staging record | full intended diff | Include: explicit path decisions. |
| `docs/portfolio/planning/azwerks-portfolio-global-shell-and-navigation-implementation-report-v0.1.md` | Authored report | all evidence | Include: review handoff. |
| `azwerks-portfolio-global-shell-and-navigation-implementation-report-v0.1.md` | Authored root review copy | planning report | Include: repository convention/reviewer access. |

## Explicit exclusions

| Path | Decision | Reason |
| --- | --- | --- |
| `azwerks-portfolio-prototype-compliance-validator-v0.1.py` | Exclude | Pre-existing unrelated untracked exploration tool. |
| `azwerks-portfolio-prototype-compliance-validator-v0.2.py` | Exclude | Pre-existing unrelated untracked exploration tool. |
| `scripts/.gitkeep` | Exclude | Pre-existing unrelated untracked placeholder. |
| `docs/portfolio/planning/global-shell-prerequisite-block-v0.1.md` | Exclude | Local evidence from the earlier correctly blocked run; obsolete after PR #2 merge and not part of successful implementation. |
| `dist/`, `.astro/`, `node_modules/` | Exclude | Generated/cache/dependency output. |
| screenshots/browser profiles | Exclude | Temporary audit evidence; deterministic assertions are retained instead. |
| local brand vault/handoff sources | Exclude | Private source boundary; only verified public-use assets are copied. |
