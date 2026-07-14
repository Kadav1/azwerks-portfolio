# Token normalization evidence matrix `v0.2`

Status: **complete for foundation v0.1**  
Date: 2026-07-14

Classifications mean: `direct` is an exact stated value, `mapped` connects a
canonical primitive and role, `derived` applies an explicit mathematical or
structural rule, and `portfolio-alias` is a constrained portfolio role.

| Normalized group | Authority and version | Heading/table | Classification and rule | Conflicts checked | Output | Validation |
|---|---|---|---|---|---|---|
| Radium 50–950 primitives | Palette 1.4 | 2.1 Radium | direct; every listed step copied exactly | rejected invalid historical accent | `primitives.json` | source hash and schema |
| Sage 50–1000 primitives | Palette 1.4 | 2.2 Sage | direct; every listed step copied exactly | v1.2 reference not used | `primitives.json` | source hash and schema |
| Chrome 50–950 primitives | Palette 1.4 | 2.3 Chrome | direct; every listed step copied exactly | no conflict | `primitives.json` | source hash and schema |
| Warning 50–950 primitives | Palette 1.4 | 2.4 Warning | direct; every listed step copied exactly | superseded v1.2 values rejected | `primitives.json` | source hash and schema |
| Danger 50–950 primitives | Palette 1.4 | 2.5 Danger | direct; every listed step copied exactly | superseded v1.2 danger-950 rejected | `primitives.json` | source hash and schema |
| Info 50–950 primitives | Palette 1.4 | 2.6 Info | direct; every listed step copied exactly | no conflict | `primitives.json` | source hash and schema |
| Success 50–950 primitives | Palette 1.4 | 2.7 Success | direct; every listed step copied exactly | no conflict | `primitives.json` | source hash and schema |
| Core dark/light extensions | Palette 1.4 | 2.8 Core Surface Extensions; 5.2 Light Companion | direct values | package outputs ignored | `primitives.json` | source and contrast |
| Dark surfaces and text | Palette 1.4 | 3 Semantic Mapping; 5.1 Dark Flagship | mapped | visual-system role alignment | `semantics.dark.json` | parity and contrast |
| Light surfaces and text | Palette 1.4 | 5.2 Light Companion | mapped, independently authored | no inversion | `semantics.light.json` | parity and contrast |
| Borders and dividers | Palette 1.4 | 3.2 Borders and Dividers | mapped | asset-only focus variation does not override UI palette authority | both semantics | control contrast |
| Links and actions | Palette 1.4; Token 1.5 | 4.1 Interaction; Color and Focus | mapped; visited and accessible light link steps derived | project worlds prohibited | both semantics | 16 link/action pairs |
| Focus and selection | Palette 1.4; Token 1.5 | 4.1 Interaction; Focus and Keyboard Navigation | mapped/direct geometry | selection kept distinct from trust | semantics and shape | mode contrast and browser focus |
| Lifecycle state | Palette 1.4 | 4.2 Fill, Line, and Tint; 7.2 Form Validation | mapped; light foreground steps derived by darker-accessible-step rule | no decorative status use | both semantics | 8 state pairs |
| Trust/provenance | Palette 1.4; Product 1.5 | 4.3 Trust Ladder; Trust model | mapped; portfolio labels constrained to canonical ladder hues | separate from selection | both semantics | 6 tested trust pairs |
| Atlas roles | Product 1.5; Visual 1.6 | System Surfaces and State Behavior | portfolio-alias | future atlas structure not implemented | semantics and portfolio aliases | node/relation contrast |
| Typography families and roles | Token 1.5; Visual 1.6 | Typography Tokens; Typography System | derived system stacks and bounded role scale; no font download | three-family ceiling | `typography.json` | leakage, Astro, 200% browser |
| Spacing scale and roles | Palette 1.4; Token 1.5 | 11 Sizing and Rhythm; Spacing Tokens | derived multiples of direct 4px unit | no universal card rhythm | primitives and `spacing-layout.json` | leakage and browser |
| Sizing and wordmark hooks | Wordmark 1.2; Product 1.5 | Scale and Responsive Behavior; Controls | derived 44px target and QA hook | no asset created | `spacing-layout.json` | browser and source |
| Content measures and breakpoints | Visual 1.6; selected direction | Responsive Behavior; content hierarchy | derived bounded reading/technical/media roles | layouts deferred | `spacing-layout.json` | 320–1440 and 200% browser |
| Media ratios and surround | Asset Map 1.4 | Asset-Class Profiles and Composition | derived intrinsic ratios; art surround alias | no crop or card rule | `spacing-layout.json` | browser art sample |
| Radius, borders, elevation | Palette 1.4; Token 1.5 | 11 Sizing and Rhythm; Shape/Border/Elevation | direct 4/8/12 and 1/2px; one derived overlay shadow | no glass or shadow scale | `shape-layer-motion.json` | leakage |
| Layering | Token 1.5 | Shape, Border, Elevation, and Motion | derived small ordered scale | no arbitrary large values | `shape-layer-motion.json` | schema and leakage |
| Motion | Palette 1.4; Visual 1.6 | 11 Sizing and Rhythm; Motion Behavior | direct 120ms/easing plus derived bounded roles | transform/opacity policy only | `shape-layer-motion.json` | reduced-motion browser |
| Opacity | Mark 1.2 | Usage Levels | direct levels 0/.04/.07/.12 | never semantic state | `shape-layer-motion.json` | source and references |
| Authored marks | Mark 1.2 | Usage Levels; Color; Motion; Accessibility | mapped hooks only | identity/state/focus boundary | `marks-icons.json` | forced colors and reduced motion |
| Iconography | Icon 1.2 | Grid; Sizing; Semantic Color; Accessibility | direct sizes/strokes plus semantic mappings | no assets; navigation not icon-only | `marks-icons.json` | references and forced colors |
| Portfolio aliases | Product 1.5; selected direction | Context Profiles; Surface Hierarchy | portfolio-alias | no component layouts | `portfolio.aliases.json` | layer-direction validation |
| Five project worlds | Product 1.5; Asset Map 1.4 | Context Profiles; Asset-Class Profiles | portfolio-alias for atmosphere, media, density, measure, type, and marks only | functional-name denylist | `project-world.aliases.json` | world-boundary validation |
| System, no-JS, storage, print | Universal Theme 1.2; Palette 1.4 | Required Theme Layers; Themes and Surfaces | mapped runtime/CSS contract | explicit mode wins | generated CSS and runtime | 16-scenario browser audit |

Every source group embeds its document ID, heading, and normalization class.
The generator rejects missing evidence, unknown domains, invalid references,
cycles, and illegal layer direction.
