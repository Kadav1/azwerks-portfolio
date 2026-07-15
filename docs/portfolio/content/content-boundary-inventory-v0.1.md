# Content boundary inventory v0.1

Status: canonical foundation inventory  
Base: `origin/main` at `57c893292b53dd5017502d7cbcae616aa36f3fb3`

## Initial state

No `src/content/`, `src/content.config.ts`, content-model module, tests, production entries, fixture entries, or generated content manifest existed. Existing `src/data/` content was absent. The application contained one neutral foundation route and the merged token/theme system.

## Classification

| Path | Class | Decision |
| --- | --- | --- |
| `src/content.config.ts` | authored | Build-time collection registry. |
| `src/content/projects/` | retain-empty | Future production Markdown; empty in this phase. |
| `src/content/project-data/` | retain-empty | Future production companions; empty in this phase. |
| `src/content/project-relations/` | retain-empty | Future production relations; empty in this phase. |
| `src/content/pages/` | retain-empty | Future production pages; empty in this phase. |
| `src/content/navigation.json` | retain-empty | Production navigation data; empty array. |
| `src/content/fixtures/` | fixture | Frozen, synthetic, private, noindex validation corpus. |
| `src/content-model/` | authored | Schemas, policies, merges, queries, and validation. |
| `src/content-model/generated/` | generated | Deterministic manifest; never hand-edited. |
| `tests/fixtures/content-invalid/` | fixture | Outside every Astro loader. |
| `tests/fixtures/content-expected/` | generated | Deterministic fixture summaries. |
| `docs/portfolio/exploration/` | protected | Historical evidence only; no runtime imports. |

No private URLs, local paths, real content, migration input, or incompatible production schema was found. Obsidian migration remains deferred. Production and fixture helpers are separated, and production query source is checked for fixture collection references.
