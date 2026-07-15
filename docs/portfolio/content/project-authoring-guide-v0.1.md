# Project authoring guide v0.1

## Authoring flow

1. Create `src/content/projects/<slug>.md` with a stable lowercase kebab-case slug.
2. Keep frontmatter flat: scalars and simple string arrays only.
3. Write narrative in Markdown body using headings, paragraphs, lists, blockquotes, code fences, tables, and standard links.
4. Create exactly one `src/content/project-data/<slug>.json` companion.
5. Add relations only when a concise rationale explains the connection.
6. Run `npm run content:generate` and `npm run content:check`.

Repository files remain canonical even when prose begins in Obsidian. Before copying Obsidian-originated Markdown, remove wikilinks, embeds, nested YAML, local paths, private URLs, and unreviewed HTML. Obsidian synchronization is not implemented.

## Flat example

```yaml
---
schemaVersion: "1.0"
slug: example-project
title: Example project
summary: A factual summary that states the purpose without unsupported outcomes.
category: software
lifecycle: draft
visibility: private
maintenance: active
synthetic: false
capabilities:
  - Inspect records
platforms:
  - Static web
noindex: true
---
```

Do not put media, evidence, process, limitations, relations, theme objects, or local paths in frontmatter. Unknown facts are omitted rather than guessed.

## Evidence and truth

Every public claim needs inspectable support. Keep evidence trust separate from lifecycle. Metrics need method, unit, and a provenance artifact. Verified evidence names an artifact. Record limitations honestly. Private evidence may be described but cannot expose a private URL.

## Media and no-media records

Missing media is valid. Set the companion's media state explicitly and leave its media array empty when permitted. Available informative media needs useful alt text and intrinsic dimensions or an aspect ratio. Decorative media needs `alt: ""`. Audio/video needs a transcript contract. Artwork descriptions should convey the work without duplicating captions. Public media rights must be known and publishable.

## Publication

Parsing is not publication approval. A public record must be non-synthetic, public, approved or published, fully accompanied, provenance-reviewed, rights-safe, accessible, limitation-aware, relation-safe, and free of validation blocks. No fixture can qualify.
