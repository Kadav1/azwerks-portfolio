# Project worlds architecture v0.1

Project worlds are deterministic composition layers over the merged project-detail invariant. Category is the only world selector. `ProjectWorld.astro` resolves the frozen registry, derives a small public-safe world view model, and dispatches to one of five explicit Astro compositions.

`WorldFrame.astro` owns stable world attributes and local composition variables. `WorldSection.astro` is the sole renderer of invariant content components. The five category components own only ordered `WorldSection` calls; they do not own publication, evidence, limitation, provenance, relation, media safety, or navigation logic.

The invariant remains responsible for the static canonical route, one H1, title and summary, state vocabulary, safe lead/no-media behavior, Markdown content, optional contents, evidence trust, visible limitations, process, releases, public links, sanitized provenance, routable relations, and deterministic context navigation.

Worlds may vary sequence, measure, density, stage width, adjacency, and surface emphasis. Software foregrounds workflow, evidence, and releases. Visual system foregrounds specimens, process, and proof. Art foregrounds uncropped media, reflection, process, and provenance. Technical system places limitations adjacent to architecture evidence. Limited media foregrounds narrative, limitations, process, and provenance without invented imagery.

All output is static HTML and CSS. There is no world client script, runtime content fetch, framework renderer, transition engine, or third-party runtime. Clean HTML remains complete without JavaScript. Shared forced-colors, reduced-motion, and print fallbacks remove nonessential composition effects while retaining meaning.

World extension must preserve native links, shell focus behavior, theme choice, reduced-motion preference, touch targets, public-data boundaries, evidence trust, limitation visibility, provenance truth, and relation safety. A future world change that needs to weaken any of those contracts requires an invariant/schema review rather than a local category exception.
