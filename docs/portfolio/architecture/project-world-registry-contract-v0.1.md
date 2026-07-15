# Project world registry contract v0.1

`src/lib/project-worlds/world-registry.ts` is the single category-to-world registry. The keys are exactly the canonical project categories: `software`, `visual-system`, `art`, `technical-system`, and `limited-media`. Each maps one-to-one to a definition containing its label; shell, world, layout, theme, and motion profiles; lead and narrative strategies; emphasized sections; and authored-mark level.

Resolution accepts only `ProjectCategory`. There is no author-editable world field and no inference from tags, title, media, route, or CSS class. An unknown category throws `PROJECT_WORLD_CATEGORY_UNKNOWN`. Registry objects and section-emphasis arrays are frozen.

Profile mapping is deterministic:

| Category | Shell | World | Layout | Theme | Motion |
| --- | --- | --- | --- | --- | --- |
| software | technical | software | technical | system | none |
| visual-system | standard | visual-system | specimen-led | system | none |
| art | quiet | art | media-led | neutral | none |
| technical-system | technical | technical-system | technical | system | none |
| limited-media | quiet | limited-media | document-led | system | none |

The layout consumes this registry for shell and extension attributes, so companion presentation hints cannot create an ungoverned sixth world. Global visitor theme and reduced-motion choices remain authoritative.
