# Outdated Radium package removal record `v0.1`

Status: **external removal not performed; package isolated and excluded**  
Date: 2026-07-14

## Owner boundary

The superseding task authorized removal of the outdated package, but the later
owner instruction is narrower: stay in this repository and work only in this
folder. That later boundary controls this run. No filesystem read, write, or
deletion was performed against the external package during the resumed
implementation.

The token task proceeds under the prompt's package-deletion-block behavior:
the package is provably excluded from authority, imports, generation,
dependencies, and provenance. External removal remains a separate manual owner
action.

## Preserved historical identity

| Field | Preserved evidence |
|---|---|
| Logical reference | `<approved-brand-vault>/10_Brand/06_design_system/` |
| Package name | `@azwerks/radium` |
| Version | `0.6.0` |
| Manifest SHA-256 | `974d50877f40994fbbb6e478fc6c8a33864141cc488a112e97735be780a45bbf` |
| Classification | outdated package-shaped implementation; never portfolio authority |
| Token values used | none |
| Implementation logic used | none |
| Repository dependency or import | none |

The identity and hash above are retained only from
`token-source-resolution-block-v0.1.md`. Package token-file hashes are not
repeated as portfolio provenance.

## Deletion gates

Deletion gates were intentionally not executed because doing so would inspect
and mutate a directory outside the approved repository root. Consequently no
claim is made about current file count, total bytes, realpath, symlink state,
Git-root state, package contents, removal time, or post-removal external search.

## Repository-local verification

- `package.json` does not declare the package.
- Authored production source does not import or name the package.
- Normalized source does not name the package or cite package outputs.
- The generator reads only `src/tokens/source/`.
- No `vendor/radium`, package workspace, or package-shaped source exists.
- `npm run tokens:validate:usage` enforces package absence inside this
  repository.

Canonical document evidence already present in this repository remains
untouched. The external package also remains untouched.
