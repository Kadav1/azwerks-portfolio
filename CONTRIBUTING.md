# Contributing

## Branches and pull requests

The initial empty-remote bootstrap is the only direct `main` push authorized by the repository-readiness phase. After bootstrap, create a focused branch for feature, fix, content, or documentation work and open a pull request. Do not begin feature work directly on `main`.

Keep each pull request reviewable and aligned with one focused implementation prompt. Describe the change, its evidence, risks, validation, documentation impact, and any deliberately deferred work.

## Change safety

- Inspect `git status --short --branch` before editing.
- Preserve unrelated and untracked work.
- Stage explicit paths; do not use broad staging for convenience.
- Never commit generated output, credentials, environment files, private source material, or local filesystem paths.
- Never copy exploration prototype code, styles, DOM, fixture schemas, screenshots, or generator output into production source.
- Add or update dependencies only after review of need, license, maintenance, performance, and lockfile impact.

## Required checks

Run from the repository root:

```bash
npm ci
npm run check
npm run build
git diff --check
```

Add focused tests when a later prompt introduces testable behavior or a test system. A passing automated check does not replace manual accessibility, responsive, privacy, or content review where those apply.

## Documentation and quality

Update the relevant planning, architecture, content, or QA record whenever a contract changes. Maintain WCAG 2.2 AA intent, keyboard operability, semantic HTML, visible focus, reduced-motion support, static/no-JavaScript meaning, and the performance budgets in the approved product brief.

Use concise imperative commit messages, for example `feat: add work register query model` or `docs: clarify content provenance boundary`. Do not claim results that were not run or evidence that does not exist.
