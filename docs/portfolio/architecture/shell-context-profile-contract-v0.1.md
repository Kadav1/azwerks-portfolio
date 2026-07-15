# Shell context profile contract v0.1

Date: 2026-07-15  
Status: implemented boundary; project worlds deferred

## Profiles

| Profile | Intended context | Current shell expression |
| --- | --- | --- |
| `standard` | Default site routes | Compact static header, primary shell surface, normal boundary/footer rhythm. |
| `quiet` | Later art/reflection contexts | Static header and subtler boundary. |
| `immersive` | Later media-led project context | Static header and reduced shell surface emphasis while preserving orientation. |
| `technical` | Later dense technical/project context | Inset header/footer surfaces without dashboard chrome. |

`createShellContext()` validates the profile and the optional controlled world
values `software`, `visual-system`, `art`, `technical-system`, and
`limited-media`. Invalid runtime values fail with stable codes. No arbitrary
class-name or profile string enters the shell.

## Invariants

Every profile returns stable `navigationSemantics`, `focusSemantics`,
`themeSemantics`, and `targetSemantics`. A profile may change density, surface
emphasis, border visibility, footer rhythm, and justified sticky behavior. It
may not change:

- identity meaning, Home target, or accessible name;
- route labels, source order, matching, or current-route semantics;
- keyboard order, focus visibility/containment/restoration, or skip targets;
- 44px target contract, contrast, theme modes, or storage behavior;
- desktop/mobile information parity;
- full-page navigation baseline.

World profiles are data attributes for later governed styling only. They do
not implement project-world routes or content in this phase and cannot weaken
global semantic tokens through project aliases.
