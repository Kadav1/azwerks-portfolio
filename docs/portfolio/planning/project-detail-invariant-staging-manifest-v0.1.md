# Project detail invariant staging manifest v0.1

All included paths are privacy-reviewed for production-safe structure only. Dependencies are abbreviated as token (T), content model/publication (C), global shell (S), and Work Register (W). No temporary audit file, private content, or generated build output is included.

| Path | Status | Owner / purpose | Dependencies | Decision and privacy reason |
| --- | --- | --- | --- | --- |
| `package.json` | authored | package scripts / focused gates | T/C/S/W | Include; no dependency change or secret. |
| `scripts/generate-project-detail-manifest.mjs` | authored | route manifest generation | C | Include; emits public IDs/slugs and counts only. |
| `scripts/check-project-detail-manifest.mjs` | authored | generated-file drift check | C | Include; no content disclosure. |
| `scripts/validate-project-detail.mjs` | authored | static architecture gate | T/C/S/W | Include; source inspection only. |
| `scripts/test-project-detail-view-model.mjs` | authored | focused Node test runner | C | Include; synthetic values remain test-only. |
| `scripts/browser-project-detail-audit.mjs` | authored/test | isolated browser harness | T/C/S/W | Include; temporary routes/assets removed in `finally`. |
| `scripts/validate-work-register.mjs` | authored | shared-href integration validation | W | Include; replaces the former inline-href assumption. |
| `scripts/validate-global-shell.mjs` | authored | detail-route shell ownership validation | S | Include; replaces the former route deferral assertion. |
| `src/pages/work/[slug].astro` | authored | static production route | C/S/W | Include; production collection boundary only. |
| `src/layouts/ProjectDetailLayout.astro` | authored | shell-integrated invariant layout | T/S | Include; sanitized props and content renderer. |
| `src/styles/project-detail.css` | authored | invariant presentation | T | Include; governed tokens only, zero runtime. |
| `src/lib/project-detail/routes.ts` | authored | canonical href and route records | C/W | Include; public IDs/slugs only. |
| `src/lib/project-detail/navigation.ts` | authored | deterministic previous/next | C/W | Include; no wraparound or state restoration. |
| `src/lib/project-detail/manifest.ts` | authored | deterministic manifest/hash | C | Include; rejects duplicates/private output. |
| `src/lib/project-detail/headings.ts` | authored | Markdown heading/contents contract | C | Include; metadata only. |
| `src/lib/project-detail/labels.ts` | authored | public display labels | C | Include; no private notes. |
| `src/lib/project-detail/profiles.ts` | authored | bounded world/shell mapping | T/C/S | Include; no category-specific layout. |
| `src/lib/project-detail/media.ts` | authored | media filtering/lead choice | C | Include; unavailable/private sources excluded. |
| `src/lib/project-detail/evidence.ts` | authored | evidence filtering/trust | C | Include; private/unavailable URLs excluded. |
| `src/lib/project-detail/relations.ts` | authored | safe routable relations | C/W | Include; private endpoints excluded. |
| `src/lib/project-detail/types.ts` | authored | serializable contracts | C | Include; raw companions not exposed. |
| `src/lib/project-detail/view-model.ts` | authored | public view-model assembly | C/W | Include; notes, paths, private URLs, reviewer identities excluded. |
| `src/lib/project-detail/generated/project-detail-route-manifest.json` | generated | public route inventory | C | Include; deterministic, zero routes, no fixture IDs. |
| `src/lib/work-register/view-model.ts` | authored | canonical detail href consumer | C/W | Include; one helper owns `/work/<slug>/`. |
| `src/components/project/ProjectDetail.astro` | authored | anatomy orchestration | T/C/S | Include; optional sections guarded. |
| `src/components/project/ProjectOrientation.astro` | authored | Back/category/position | T/W | Include; native links. |
| `src/components/project/ProjectHeader.astro` | authored | single H1/summary/actions | T/C | Include; media-independent identity. |
| `src/components/project/ProjectStateSummary.astro` | authored | distinct state semantics | T/C | Include; textual labels. |
| `src/components/project/ProjectLeadMedia.astro` | authored | lead-media boundary | T/C | Include; sanitized media only. |
| `src/components/project/ProjectMedia.astro` | authored | native media rendering | T/C | Include; no embeds/autoplay/private source. |
| `src/components/project/ProjectNoMediaState.astro` | authored | truthful no-media state | T/C | Include; no placeholder. |
| `src/components/project/ProjectNarrative.astro` | authored | rendered Markdown region | T/C | Include; Astro renderer only. |
| `src/components/project/ProjectContents.astro` | authored | optional anchor contents | T/C | Include; no script/scroll spy. |
| `src/components/project/ProjectEvidence.astro` | authored | public evidence section | T/C | Include; empty guard. |
| `src/components/project/ProjectEvidenceItem.astro` | authored | trust/artifact/metric anatomy | T/C | Include; verified artifact required. |
| `src/components/project/ProjectEvidenceReferences.astro` | authored | safe evidence references | T/C | Include; public references only. |
| `src/components/project/ProjectLimitations.astro` | authored | visible limitation truth | T/C | Include; not disclosure-hidden. |
| `src/components/project/ProjectProcess.astro` | authored | ordered process record | T/C | Include; no fabricated chronology. |
| `src/components/project/ProjectReleases.astro` | authored | deterministic releases | T/C | Include; explicit status. |
| `src/components/project/ProjectLinks.astro` | authored | purpose-labelled links | T/C/S | Include; private/duplicate/unsafe links absent. |
| `src/components/project/ProjectProvenance.astro` | authored | public provenance | T/C | Include; notes/internal reviewer excluded. |
| `src/components/project/ProjectRelations.astro` | authored | safe related work | T/C/W | Include; no graph/Atlas output. |
| `src/components/project/ProjectContextNavigation.astro` | authored | Back/previous/next | T/W | Include; deterministic native links. |
| `tests/project-detail/contracts.test.mjs` | authored/test | route/manifest/headings | C/W | Include; synthetic test data only. |
| `tests/project-detail/view-model.test.mjs` | authored/test | VM/media/evidence/profiles | C | Include; privacy assertions. |
| `tests/support/project-detail-fixtures.ts` | authored/test | test bundle factory | C | Include; never imported by production. |
| `tests/work-register/state.test.mjs` | authored/test | shared-href expectation | W | Include; no production content. |
| `docs/portfolio/architecture/project-detail-existing-state-v0.1.md` | authored/doc | pre-change inventory | C/S/W | Include; repository facts. |
| `docs/portfolio/architecture/project-detail-invariant-v0.1.md` | authored/doc | invariant ownership/anatomy | T/C/S/W | Include; public architecture. |
| `docs/portfolio/architecture/project-detail-route-contract-v0.1.md` | authored/doc | route/manifest contract | C/W | Include; no private paths. |
| `docs/portfolio/architecture/project-detail-view-model-contract-v0.1.md` | authored/doc | field/privacy contract | C | Include; exclusions documented. |
| `docs/portfolio/architecture/project-detail-media-and-evidence-contract-v0.1.md` | authored/doc | renderer/trust contract | T/C | Include; rights boundary. |
| `docs/portfolio/architecture/project-detail-world-extension-contract-v0.1.md` | authored/doc | future composition seam | T/C/S | Include; prohibits semantic divergence. |
| `docs/portfolio/qa/project-detail-invariant-validation-v0.1.md` | authored/doc | actual QA evidence | T/C/S/W | Include; unsupported checks named. |
| `docs/portfolio/planning/azwerks-portfolio-project-detail-invariant-implementation-report-v0.1.md` | authored/doc | canonical handoff | T/C/S/W | Include; no fabricated result. |
| `docs/portfolio/planning/project-detail-invariant-staging-manifest-v0.1.md` | authored/doc | release boundary | T/C/S/W | Include; this manifest. |
| `docs/superpowers/plans/2026-07-15-project-detail-invariant.md` | authored/doc | implementation plan | T/C/S/W | Include by force-add; no private data. |
| `azwerks-portfolio-project-detail-invariant-implementation-report-v0.1.md` | authored/doc | root review copy | T/C/S/W | Include by force-add; synchronized. |

## Explicit exclusions

| Path/pattern | Decision | Reason |
| --- | --- | --- |
| `azwerks-portfolio-prototype-compliance-validator-v0.1.py` | Exclude | Pre-existing unrelated untracked work. |
| `azwerks-portfolio-prototype-compliance-validator-v0.2.py` | Exclude | Pre-existing unrelated untracked work. |
| `scripts/.gitkeep` | Exclude | Pre-existing unrelated untracked file. |
| `src/pages/project-detail-audit/` | Exclude / absent | Temporary audit route. |
| `public/project-detail-audit/` | Exclude / absent | Temporary audit media. |
| `dist/`, `.astro/`, `node_modules/` | Exclude | Generated/cache/dependency output. |
| production project content or private media | Exclude | Real content/publication is outside scope. |
