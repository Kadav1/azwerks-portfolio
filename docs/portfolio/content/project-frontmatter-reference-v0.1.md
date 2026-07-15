# Project frontmatter reference v0.1

## Common required fields

`schemaVersion: "1.0"`, `slug`, `title`, `summary`, `category`, `lifecycle`, `visibility`, `maintenance`, and `synthetic`. Filenames and slugs match. Slugs use lowercase ASCII kebab-case.

Allowed optional fields are `shortTitle`, `subtitle`, `year`, `startedAt`, `updatedAt`, `releasedAt`, `scheduled`, `version`, `featured`, `experimental`, `tags`, `capabilities`, `roles`, `tools`, `platforms`, `seoTitle`, `seoDescription`, `socialImage`, `noindex`, `medium`, `dimensions`, `period`, and `archivedAt`. No other field is accepted.

Dates use `YYYY-MM-DD`. Start cannot follow update or release. Published records require a release date. Future release dates require `scheduled: true`. A supplied `year` agrees with the governing known date.

## Category refinements

- `software`: at least one capability and platform; companion evidence, limitation, or source state.
- `visual-system`: at least one capability; companion evidence or explicit incomplete-state limitation.
- `art`: medium and year or period; companion artwork availability and non-unknown rights.
- `technical-system`: at least one platform plus version or maintainable state; companion architecture/evidence/limitation/source data.
- `limited-media`: documentary summary plus companion evidence or limitation; hero media is never required.

## Pages

Site-page frontmatter is flat and strict: `schemaVersion`, `slug`, `title`, `summary`, `visibility`, `navigation`, `order`, `noindex`, and `synthetic`. Defining a page entry does not create a route.

## Body policy

Markdown prose is allowed. Scripts, inline event handlers, JavaScript URLs, arbitrary iframes, trackers, local paths, unresolved wikilinks, Obsidian embeds, and unreviewed raw HTML fail validation.
