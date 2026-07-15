# Content schema change policy v0.1

Schema version begins at `1.0`.

- Patch: compatible clarification, validation-message correction, or non-semantic documentation improvement.
- Minor: new optional field, reviewed enum extension, or new relation type with backward-compatible handling.
- Major: required-field or meaning change, stable-ID change, collection split, field removal, or incompatible reference behavior.

Every change requires a version decision, valid and invalid fixture updates, migration notes where applicable, regenerated manifest/summaries, documentation updates, and the complete token/content/Astro validation sequence. Published ID changes additionally require migration and redirect decisions. Generated artifacts are never hand-edited.
