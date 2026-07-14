# Token source resolution correction `v0.2`

Status: **accepted; supersedes the decision in v0.1**  
Date: 2026-07-14

## Corrected decision

The package-first model in `token-source-resolution-block-v0.1.md` was
incorrect. The repository owner explicitly established the current canonical
local azwerks specification documents as the exclusive design authority and
authorized newly authored, portfolio-specific implementation files.

Package licensing, registry status, exports, CSS, JSON, naming, aliases, and
implementation logic do not govern this repository. The outdated package is
irrelevant and contributes no value or code. It was not removed during this run
because the owner's later instruction restricts all work to the portfolio
repository; its isolation is enforced instead.

## Current source chain

```text
canonical local azwerks documents
        ↓
portfolio-owned normalized JSON source
        ↓
offline deterministic generator
        ↓
portfolio CSS and TypeScript contracts
```

These implementation files are newly authored. They are not a vendored
package, prototype translation, screenshot-derived palette, or publication of
the complete private document set.

## Universal-theme resolution

Resolution **A** remains valid. The v0.1 evidence report verified the canonical
Universal Theme Spec v1.2, status canonical, superseding v1.1, with SHA-256
`f13e7e969c3695791c0af754843ce0137e144f3e938d3c9c65bf3e315fe6f98e`.
The repository-local source copies provide the implemented dark/light mode,
semantic, accessibility, and application details. This correction does not
claim that the private universal-theme document is copied into the repository.

## Historical evidence retained

Useful v0.1 evidence retained:

- repository and branch discovery;
- canonical document titles, versions, statuses, and hashes;
- universal-theme discovery;
- outdated package identity and manifest hash.

Superseded v0.1 conclusions:

- package implementation authority;
- package-license block;
- package registry or publication requirements;
- the conclusion that document normalization was prohibited.

The historical report is preserved unchanged so the correction remains
auditable.
