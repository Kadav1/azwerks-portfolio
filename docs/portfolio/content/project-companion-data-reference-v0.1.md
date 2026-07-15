# Project companion data reference v0.1

Every project has exactly one strict JSON companion with `schemaVersion`, `project`, `mediaAvailability`, `sourceAvailability`, `rightsStatus`, `artworkAvailability`, `layoutProfile`, `themeProfile`, `motionProfile`, `links`, `media`, `evidence`, `process`, `limitations`, `releases`, and `provenance`.

Profiles are constrained to editorial/technical/media-led/specimen-led/document-led layouts, system/dark/light/neutral scenes, and none/reduced/system motion. These are editorial scene hints and cannot override functional theme semantics.

## Links

Links contain `id`, `type`, `label`, `url`, and `public`. Non-contact links use HTTPS. Credentials, localhost, private IPs, local files, and conflicting duplicate IDs fail.

## Media

Media requires `id`, `type`, `source`, `purpose`, `rights`, and `availability`. Optional fields include alt, caption, credit, dimensions, ratio, poster, transcript, and description. Available informative media requires alt and intrinsic sizing. Decorative media declares empty alt. Available audio/video requires transcript. Unknown rights cannot accompany available media.

## Evidence

Evidence requires `id`, `type`, `title`, `trust`, and `availability`. Optional claim, method, result, limitation, URL, version, date, artifact, and unit fields preserve proof context. Verified items name an artifact; metrics also require method and unit. Private evidence exposes no URL.

## Process, limitations, releases

Process uses unique positive `order` values and may reference existing evidence IDs. Limitations use known/accepted/mitigated/resolved status. Releases use planned/candidate/released/superseded/withdrawn. All nested IDs are unique and all evidence references resolve.

## Provenance

Provenance requires owner, authorship, source availability, rights status, and review status. Review, source, rights, and redaction notes are optional. Never publish local paths or confidential identifiers.
