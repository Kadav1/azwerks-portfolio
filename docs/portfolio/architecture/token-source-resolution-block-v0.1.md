# azwerks portfolio token source resolution block `v0.1`

Status: **blocked before token creation**

Date: 2026-07-14

Task: token and theme foundation `v0.1`

## Executive verdict

The current canonical Radium authority is identifiable, and the previously
unresolved universal-theme document is present. Implementation is nevertheless
blocked because the canonical machine-readable source is explicitly
`UNLICENSED`, has restricted publication metadata, and has no separate
redistribution grant. No source bytes or normalized token values may be copied
into the public portfolio repository until the owner supplies a compatible
license or an exact, written redistribution authorization.

This is a source-license block, not a palette, theme, contrast, or technical
generation block.

## Repository and branch gate

| Field | Verified value |
|---|---|
| Repository | `Kadav1/azwerks-portfolio` |
| Remote | `https://github.com/Kadav1/azwerks-portfolio.git` |
| Base branch | `main` |
| Resolved `origin/main` | `d4a263cb67660b41d08f0a22402866749e133d58` |
| Work branch | `feat/token-theme-foundation-v0.1` |
| Work branch start | `d4a263cb67660b41d08f0a22402866749e133d58` |
| Tracked changes before this report | none |
| Preserved unrelated local material | two root prototype validators and the pre-existing untracked `scripts/` tree |
| Remote reachability | verified by fetch and live head query |

The feature branch was created from the live `origin/main`. No feature work was
performed on `main`.

## Authority decision

### Accepted as current authority, rejected for redistribution

The approved brand vault identifies `@azwerks/radium` v0.6.0 as the shipped
canonical implementation. The current canonical prose specifications explicitly
name the package and its CSS token files as implementation authority.

| Field | Value |
|---|---|
| Title | azwerks Radium design system |
| Type | local canonical machine-readable CSS source and derived DTCG export |
| Version | `0.6.0` |
| Status | canonical implementation; pre-1.0 |
| Owner | `azwerks` |
| Reference | `<approved-brand-vault>/10_Brand/06_design_system/` |
| Commit or tag | unavailable; the approved vault is not a Git repository |
| Package modification date | 2026-07-04 |
| License | `UNLICENSED` |
| Publication access | `restricted` |
| Machine-readable | yes |
| Redistribution in this public repository | **no verified permission** |
| Decision | authoritative for meaning and values, rejected as a redistributable source snapshot |

The package manifest has SHA-256
`974d50877f40994fbbb6e478fc6c8a33864141cc488a112e97735be780a45bbf`.
It declares `"license": "UNLICENSED"` and restricted publication access. No
`LICENSE`, `COPYING`, `COPYRIGHT`, or `NOTICE` file was found in the approved
brand source tree.

### Canonical machine-source hashes

The package's export contract states that CSS is the source of truth and that
the JSON files are generated derivatives.

| Package-relative path | Role | SHA-256 |
|---|---|---|
| `tokens/colors.css` | primitive color ramps, dark semantics, ratified light semantics | `733802b4336f25d143279784b26fcdb4d5d6218a3fc263f75500b7900f3ca452` |
| `tokens/extensions.css` | fenced non-UI expression extensions | `fb831bb6371c0a85e5b3abf21b97c19e92f3e4df5622bbfa64c3e5659127cc60` |
| `tokens/typography.css` | typography primitives and roles | `21ce191e7dd2e4633b762f174b001cc21762090e5be6a467a1091b421e7de42d` |
| `tokens/spacing.css` | spacing, shape, elevation, and motion foundations | `3a16efb495b7401c694ba728b5be5015c309ca2b3231a170800b0a7060bd608e` |
| `tokens/modes.css` | mode contracts | `5699443eb52431fdb0dc40b05789023b3fe4cdc073121c3de810b5b807ea4e81` |
| `tokens/marks.css` | authored-mark levels | `78c16e6a20a24f750cb28f5ed403ffaf6ff69adb45ca90117965bc50e424aae1` |

These hashes are evidence only. The files were not copied.

### Derived machine exports

| Package-relative path | Type | SHA-256 | Decision |
|---|---|---|---|
| `tokens/tokens.json` | generated DTCG dark/default export | `98dc3269f0d140261d2b5095e0ecc0131e63e2897da19383686ce97cb2adc03b` | rejected: derived from unlicensed package and not the canonical source of truth |
| `tokens/tokens.light.json` | generated DTCG light semantic overrides | `2e77785d2ddad3e0ad929805a1e8199f9dbd2bc7a0d3c59f597e672dca289143` | rejected: derived from unlicensed package and not the canonical source of truth |

Identical DTCG copies were found in downstream product/vendor snapshots. Those
copies do not change ownership, authority, or redistribution status and were
rejected as secondary copies.

## Canonical prose source register

The following current documents were found under
`<approved-brand-vault>/10_Brand/00_Standards/`. They establish status,
supersession, roles, and mode requirements but do not provide a redistribution
license for a public repository.

| Title and version | Status and supersession | SHA-256 | Decision |
|---|---|---|---|
| Radium Color Palette Spec v1.4 | canonical; supersedes v1.3 | `d8d63f9a4b2255978e0e1893fad46c2607852b6f8390b0ac5063c47180d70fc9` | accepted as authority evidence; not copied as token source |
| Design Token Spec v1.5 | canonical; supersedes v1.4 | `918a20e8ffd25bd1b058456226f647a7524b552b519ab796188ad85792814db4` | accepted as architecture evidence |
| Asset Palette Application Map v1.4 | canonical; supersedes v1.3 | `90d0fa5b3330510e878beef98e7752d67cf950d03974966b1a6607b42d082648` | accepted as role-boundary evidence |
| Universal Theme Spec v1.2 | canonical; supersedes v1.1 | `f13e7e969c3695791c0af754843ce0137e144f3e938d3c9c65bf3e315fe6f98e` | accepted; resolves the missing-document gap |
| Visual System Spec v1.6 | canonical; supersedes v1.5 | `ab800a65b6cd7d9fd682b6b34d840c5e5f207bf78e8f9c42033e384167ed7cf0` | accepted as visual-governance evidence |
| Brand Product Design Spec v1.5 | canonical; supersedes v1.4 | `4b0949a111df9278ec455f431a8e210305e86a4e116d884348bbc9f4dd1ac3b1` | accepted as product-boundary evidence |
| Wordmark Direction Spec v1.2 | canonical; supersedes v1.1 | `90b2400e7fc200c1190cc63bf15bfc2bcc728c530a2b6df5b434e68563372e34` | accepted as hook-only identity evidence |
| Authored Mark Language Spec v1.2 | canonical; supersedes v1.1 | `54b79efeb636a4b95cdc4239a886dafec719716b264653c0a7077dab15802e7c` | accepted as hook-only mark evidence |
| Iconography System Spec v1.2 | canonical; supersedes v1.1 | `110cf3b30ba6ba0e148bcbb102366d8d329a04bd2fbf63f59dbac52f27e7e88d` | accepted as hook-only icon evidence |

Normalizing the same values from prose would not cure the missing publication
license. It would reproduce the governed source into a public repository by a
different technical path while leaving the redistribution question unanswered.

## Universal-theme resolution

Resolution: **A — current universal-theme spec found and verified.**

`universal-theme-spec-v1.2.md` exists in the approved canonical standards tree,
is marked canonical, is dated 2026-07-12, supersedes v1.1, and has SHA-256
`f13e7e969c3695791c0af754843ce0137e144f3e938d3c9c65bf3e315fe6f98e`.

The earlier portfolio brief's missing-file statement was accurate for its
source snapshot but is no longer current. No supersession fiction is needed.

## Rejected alternatives

| Candidate | Evidence | Rejection reason |
|---|---|---|
| Legacy Radium v1.1 JSON export | metadata says canonical for its release; SHA-256 `f06e2875716d6e6be816f030fce62fbb6fc724b1d8718a166a1d93dc869be101` | superseded by the current v0.6.0 package and v1.4/v1.5 standards; no current redistribution license |
| Published npm `@azwerks/radium` | live registry query returned `E404 Not Found` | no verifiable public package, ownership record, version, or license |
| Approved-owner GitHub Radium repository | live owner search returned no matching repository | no current public repository to verify or license |
| Historical `Kadav1/azw-portfolio` source named by Radium's provenance note | live GitHub repository and content queries returned 404 | unavailable and historical; cannot supersede current machine source or establish current redistribution rights |
| Downstream product token copies | byte-identical copies of the generated DTCG export | secondary snapshots from unrelated products; not current source authority and inherit the same license gap |
| Portfolio exploration sources and candidate CSS | historical or synthetic evidence | explicitly prohibited as production token authority |
| Remembered, inferred, or visually selected values | none accepted | prohibited by the task and not reproducible authority |

## Exact blocking decision

The owner must provide one of the following before this task can continue:

1. a current canonical Radium source bundle released under an explicit license
   compatible with redistribution in the public portfolio repository; or
2. an exact written authorization permitting redistribution of a named source
   version and exact hashes in `Kadav1/azwerks-portfolio`; or
3. a current licensed public package or approved-owner repository with a
   verifiable version/tag, source paths, and license.

The authorization must clarify whether it covers:

- the canonical CSS source;
- generated or normalized JSON snapshots;
- generated CSS and TypeScript derivatives;
- token names and values; and
- public documentation of the source hashes and version.

No particular license is inferred or selected by this report.

## Actions deliberately not taken

- No `src/tokens/` directory or token-value file was created.
- No `source-manifest.json` was created because its redistributable source
  contract cannot be completed truthfully.
- No generated CSS, TypeScript, name map, or token manifest was created.
- `src/styles/global.css`, `src/layouts/BaseLayout.astro`, and
  `src/pages/index.astro` were not changed.
- No dependency was installed or added.
- No token generator, validator, contrast checker, or runtime theme module was
  created.
- No prototype CSS, fixture style, screenshot value, or generated design
  recommendation was used.
- No implementation validation, browser matrix, performance measurement, or
  contrast result is claimed.
- No files were staged.
- No commit or push was made.
- No pull request was created or merged.
- No force push was used.

## Resume gate

After a license or explicit redistribution authorization is supplied, rerun the
source search and verify the exact licensed bytes, version, status, owner,
hashes, and source date before creating `src/tokens/source/source-manifest.json`
or any token values. The implementation should then resume from Phase 2 rather
than assuming this report remains current.
