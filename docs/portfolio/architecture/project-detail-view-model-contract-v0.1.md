# Project detail view-model contract `v0.1`

Date: 2026-07-15

## Public fields

`ProjectDetailViewModel` is a strict serializable projection with:

- identity: `id`, `slug`, `href`, `title`, `shortTitle`, optional `subtitle`, `summary`, `seoTitle`, `seoDescription`;
- state: `category` and label, `lifecycle` and label, `maintenance` and label, optional period/version, `experimental`;
- profiles: `worldProfile`, `shellProfile`, `layoutProfile`, `themeProfile`, `motionProfile`;
- media: `mediaState`, optional `leadMedia`, `allPublicMedia`;
- proof: `evidenceState`, label, `publicEvidence`, process, limitations, releases;
- access: `publicLinks`, public-safe provenance, safe relations, optional contents;
- context: optional position/previous/next, canonical, and noindex.

## Serialization boundary

The route never passes a raw `ProjectBundle` or companion through props. `getStaticPaths()` constructs the view model at build time and separately passes the original production Markdown entry required by Astro `render()`. No client script receives or requires the view model.

## Sanitization

Media retains only safe render fields after availability, rights, source, alt, dimensions/ratio, poster, and transcript checks. Evidence keeps exact trust/availability and public URLs only. Process, limitations, and releases retain references only to public evidence. Public links require `public: true` and a safe HTTPS or truthful mail destination. Relations require a generated public target.

Provenance allows owner, authorship, source availability, rights status, review status, and reviewed date. The projection excludes `reviewedBy`, source notes, rights notes, redaction notes, local/content paths, raw repository identifiers, companion objects, private media, and private evidence URLs.

## Labels and profiles

Labels are explicit repository-owned maps. Category maps directly to its existing world profile. Default shell mapping is software/technical-system → technical, art/limited-media → quiet, visual-system → standard. Only bounded layout hints may select technical or immersive shell profiles. Theme and motion profiles become descriptive data attributes; they cannot override visitor theme or reduced motion.

Any new public field requires a content/publication contract change, focused privacy review, tests, and documentation update before it enters this view model.
