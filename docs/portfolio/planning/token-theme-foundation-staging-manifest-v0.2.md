# Token theme foundation staging manifest `v0.2`

Status: **approved explicit staging set**  
Privacy rule: all included paths are repository-owned and contain no private
absolute path or full private source document.

| Path | Purpose | Kind | Authority | Include | Reason/privacy review |
|---|---|---|---|---|---|
| `package.json` | token/check/build scripts | authored | repository contract | yes | no dependency added |
| `src/layouts/BaseLayout.astro` | CSS import and pre-paint contract | authored | theme documents | yes | minimal inline script only |
| `src/pages/index.astro` | neutral verification page | authored | portfolio aliases | yes | no production content |
| `src/styles/global.css` | semantic consumption baseline | authored | generated semantics | yes | leakage scan passes |
| `src/tokens/README.md` | update/consumption guidance | authored | architecture | yes | public-safe |
| `src/tokens/index.ts` | typed public exports | authored | architecture | yes | no JSON runtime import |
| `src/tokens/runtime/theme.ts` | server-safe theme API | authored | theme contract | yes | guarded browser access |
| `src/tokens/schema/token-source.schema.json` | source structure contract | authored | token spec | yes | repository-owned schema |
| `src/tokens/source/source-manifest.json` | authority/provenance | authored | document register | yes | logical paths only |
| `src/tokens/source/primitives.json` | exact/derived primitives | authored | palette/token documents | yes | no package values |
| `src/tokens/source/semantics.dark.json` | dark mappings | authored | palette/theme documents | yes | contrast passes |
| `src/tokens/source/semantics.light.json` | light mappings | authored | palette/theme documents | yes | independent and tested |
| `src/tokens/source/portfolio.aliases.json` | portfolio context aliases | authored | product/direction docs | yes | no component layouts |
| `src/tokens/source/project-world.aliases.json` | five governed worlds | authored | product/asset docs | yes | functional overrides denied |
| `src/tokens/source/typography.json` | family/role hooks | authored | token/visual docs | yes | system fonts only |
| `src/tokens/source/spacing-layout.json` | space/sizing/layout/media | authored | token/visual docs | yes | classifications explicit |
| `src/tokens/source/shape-layer-motion.json` | shape/layer/motion/focus | authored | palette/token/visual docs | yes | small governed scales |
| `src/tokens/source/marks-icons.json` | mark/icon hooks | authored | mark/icon documents | yes | no assets |
| `src/tokens/source/contrast-pairs.json` | required contrast contract | authored | accessibility matrix | yes | 62 tested pairs |
| `src/tokens/generated/tokens.css` | CSS contract | generated | normalized source | yes | deterministic/provenance header |
| `src/tokens/generated/tokens.ts` | readonly TS metadata/types | generated | normalized source | yes | deterministic |
| `src/tokens/generated/token-names.ts` | typed token names | generated | normalized source | yes | deterministic |
| `src/tokens/generated/token-manifest.json` | counts/hashes | generated | normalized source | yes | no current timestamp |
| `scripts/token-utils.mjs` | validator/generator utilities | authored | repository contract | yes | Node built-ins only |
| `scripts/generate-tokens.mjs` | offline generator | authored | token architecture | yes | no network/package read |
| `scripts/validate-token-source.mjs` | document/source validation | authored | authority contract | yes | hashes and privacy checked |
| `scripts/validate-token-references.mjs` | aliases/parity/world boundary | authored | architecture | yes | cycles/layers checked |
| `scripts/validate-token-contrast.mjs` | WCAG ratio validation | authored | accessibility | yes | deterministic math |
| `scripts/validate-theme-runtime.mjs` | runtime/storage safety validation | authored | theme contract | yes | Node built-ins and native TS stripping |
| `scripts/validate-token-usage.mjs` | leakage/package absence | authored | raw-value policy | yes | repo scope only |
| `scripts/check-generated-tokens.mjs` | drift gate | authored | generator | yes | byte comparison |
| `scripts/browser-token-foundation-audit.mjs` | 16-scenario local browser audit | authored | QA contract | yes | no dependency; temp state cleaned |
| `docs/portfolio/architecture/token-source-resolution-block-v0.1.md` | historical first-run record | authored historical | preserved evidence | yes | unchanged, explicitly superseded |
| `docs/portfolio/architecture/outdated-radium-package-removal-v0.1.md` | external-deletion boundary | authored | latest owner instruction | yes | redacted logical path |
| `docs/portfolio/architecture/token-document-authority-register-v0.2.md` | document register | authored | canonical docs | yes | hashes/headings, no full docs |
| `docs/portfolio/architecture/token-normalization-evidence-matrix-v0.2.md` | section evidence | authored | canonical docs | yes | short labels only |
| `docs/portfolio/architecture/token-source-resolution-correction-v0.2.md` | corrected authority decision | authored | owner direction | yes | preserves history |
| `docs/portfolio/architecture/token-architecture-v0.2.md` | architecture contract | authored | accepted docs | yes | public-safe |
| `docs/portfolio/architecture/theme-contract-v0.2.md` | mode/runtime contract | authored | accepted docs | yes | CSP truth included |
| `docs/portfolio/planning/azwerks-portfolio-token-authority-addendum-v0.1.md` | brief correction | authored | owner direction | yes | selected direction unchanged |
| `docs/portfolio/qa/token-and-theme-validation-v0.2.md` | evidence/results | authored | executed QA | yes | no fabricated checks |
| `docs/portfolio/planning/azwerks-portfolio-token-and-theme-foundation-implementation-report-v0.2.md` | implementation record | authored | executed work | yes | public-safe |
| `docs/portfolio/planning/token-theme-foundation-staging-manifest-v0.2.md` | explicit staging record | authored | repository policy | yes | this list |
| `azwerks-portfolio-token-and-theme-foundation-implementation-report-v0.2.md` | root review copy | copied authored report | repository review convention | yes | same public-safe bytes |

## Explicit exclusions

| Path/material | Include | Reason |
|---|---|---|
| `azwerks-portfolio-prototype-compliance-validator-v0.1.py` | no | pre-existing unrelated untracked file |
| `azwerks-portfolio-prototype-compliance-validator-v0.2.py` | no | pre-existing unrelated untracked file |
| `scripts/.gitkeep` | no | pre-existing unrelated placeholder |
| `node_modules/`, `dist/`, `.astro/` | no | ignored install/build/browser output |
| external package and vault files | no | outside repository and prohibited by latest instruction |
| full canonical documents or temporary copies | no | private source boundary |
| prototype CSS, exploration candidates, screenshots | no | evidence is not production source |
