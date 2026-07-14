# azwerks portfolio

An evidence-led, static-first portfolio for azwerks work across art, design, and digital systems.

This repository is currently in the greenfield foundation phase. The toolchain and production boundaries exist, but product features have not been implemented. This is not a production-ready site.

## Requirements

- Node `24.16.0` (declared in `.node-version`)
- npm `11.13.0` or a compatible npm 11 release

## Local development

Install exactly from the lockfile:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Run the baseline quality gates:

```bash
npm run check
npm run build
```

Preview the generated static build with `npm run preview`. Generated output is written to `dist/` and is not committed.

## Repository structure

- `src/` — production Astro source only
- `public/` — immutable files copied directly to the built site
- Local planning, governance, and exploration documents are intentionally excluded from the public repository.

## Remote repository

The approved repository is [Kadav1/azwerks-portfolio](https://github.com/Kadav1/azwerks-portfolio), with `origin` set to `https://github.com/Kadav1/azwerks-portfolio.git` and `main` as the default branch.

## Contribution boundary

The initial empty-remote bootstrap is the only direct push to `main` authorized by the repository-readiness phase. Subsequent feature work belongs on reviewed branches and pull requests. Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing dependencies, production boundaries, or documentation contracts.
