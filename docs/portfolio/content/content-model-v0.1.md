# Content model v0.1

## Architecture

The repository is the canonical build source. Astro 7 build-time collections use `src/content.config.ts`, `glob()` for Markdown/JSON collections, and `file()` for navigation. There are five production collections and five schema-equivalent fixture collections. No live collection, remote loader, CMS, database, API, MDX, or runtime fetch exists.

The canonical project model is one strict category union. Common identity, editorial state, visibility, maintenance, dates, and discovery fields remain shared; category refinements add only meaningful requirements. Markdown body owns narrative sequence. Flat frontmatter owns conservative scalars and string arrays. Companion JSON owns complex repeatable structures.

## Collections

| Production | Fixture | Source |
| --- | --- | --- |
| `projects` | `fixtureProjects` | Markdown glob |
| `projectData` | `fixtureProjectData` | JSON glob |
| `projectRelations` | `fixtureProjectRelations` | JSON glob |
| `sitePages` | `fixtureSitePages` | Markdown glob |
| `navigation` | `fixtureNavigation` | JSON file loader |

Astro references connect companions and relations to projects. Pure validation also checks filename/ID equality, one companion per project, orphan/duplicate companions, category rules, relation integrity, and fixture publication safety.

## State separation

Lifecycle, visibility, maintenance, evidence trust, rights, source availability, and provenance review are independent controlled vocabularies. `verified` is evidence trust, never lifecycle. `archived` preserves a record and is distinct from maintenance.

## Bundles and sorting

`ProjectBundle` computes companion, incoming/outgoing/undirected relations, publication result, display period, media/evidence state, relation count, normalized search text, archive state, and featured state. Authored files do not duplicate these values.

Sorting is deterministic: featured first, lifecycle rank, known release/update/start/year descending, ASCII title, then ID. Filesystem and collection-loader order are ignored. Production query helpers never import fixture collections.

## Privacy and failure

Strict schemas reject unknown fields. Source scans reject private filesystem paths, unsafe/local/private URLs, scripts, event handlers, JavaScript URLs, iframes, trackers, wikilinks, Obsidian embeds, and raw HTML in fixture Markdown. Validation fails closed with stable error codes. Generated files omit timestamps.

## Error-code register

- Source/body: `CONTENT_BODY_UNSAFE`, `CONTENT_FRONTMATTER_DUPLICATE`, `CONTENT_FRONTMATTER_INVALID`, `CONTENT_FRONTMATTER_NESTED`, `CONTENT_FRONTMATTER_UNKNOWN`.
- Identity/state: `CONTENT_SLUG_INVALID`, `CONTENT_FILENAME_MISMATCH`, `CONTENT_CATEGORY_INVALID`, `CONTENT_CATEGORY_REQUIREMENT`, `CONTENT_LIFECYCLE_INVALID`, `CONTENT_VISIBILITY_INVALID`, `CONTENT_DATE_INVALID`, `CONTENT_SCHEMA_INVALID`.
- Companions/references: `CONTENT_COMPANION_DUPLICATE`, `CONTENT_COMPANION_MISSING`, `CONTENT_COMPANION_ORPHAN`, `CONTENT_REFERENCE_INVALID`, `CONTENT_EVIDENCE_REFERENCE`.
- Relations: `CONTENT_RELATION_DIRECTION`, `CONTENT_RELATION_DUPLICATE`, `CONTENT_RELATION_ORPHAN`, `CONTENT_RELATION_SELF`.
- Privacy/navigation: `CONTENT_PRIVATE_PATH`, `CONTENT_UNSAFE_URL`, `CONTENT_NAVIGATION_INVALID`.
- Media/evidence: `CONTENT_MEDIA_ALT_MISSING`, `CONTENT_MEDIA_DUPLICATE`, `CONTENT_MEDIA_SOURCE_MISSING`, `CONTENT_MEDIA_TRANSCRIPT_MISSING`, `CONTENT_RIGHTS_UNKNOWN`, `CONTENT_EVIDENCE_DUPLICATE`, `CONTENT_EVIDENCE_UNSUPPORTED`, `CONTENT_METRIC_INCOMPLETE`, `CONTENT_LIMITATION_STATUS_MISSING`.
- Determinism/profiles: `CONTENT_ORDER_DUPLICATE`, `CONTENT_PROFILE_INVALID`, `CONTENT_SORT_NONDETERMINISTIC`, `CONTENT_MANIFEST_DRIFT`.
- Fixture/publication/docs: `CONTENT_FIXTURE_COUNT`, `CONTENT_FIXTURE_IMPORTED`, `CONTENT_FIXTURE_PUBLIC`, `CONTENT_PRODUCTION_NOT_EMPTY`, `CONTENT_PUBLICATION_INELIGIBLE`, `CONTENT_DOCUMENTATION_DRIFT`, `CONTENT_DOCUMENTATION_MISSING`.
