# Bùi Ngọc Thái — DevOps portfolio

A static React, TypeScript and Vite portfolio with an editorial layout inspired by Hyprland workstations and developer platforms. Includes a static profile terminal and three source-grounded engineering case studies. The website is under construction; this repository does not configure a live deployment.

## Development

Validated locally with Node 24.11.1 and npm 11.7.0. Use a Node version compatible with the locked toolchain.

```sh
npm ci
npm run dev
```

Development runs at [localhost:5173](http://127.0.0.1:5173/). The server binds only to localhost and requires that port to be free.

```sh
npm run typecheck
npm run build
npm run preview
```

The build runs strict TypeScript validation and writes production assets to `dist`. Production preview runs at [localhost:4174](http://127.0.0.1:4174/).

## Structure

```text
src/main.tsx             React entry
src/App.tsx              Semantic page structure
src/components/          Navigation, Hero, terminal, Projects and SVG figures
src/content/             Publishable profile, project claims and pinned sources
src/styles/              Design tokens, responsive layouts and focus styles
src/assets/              Local favicon
scripts/                 Content, browser and bundle checks
```

Case studies use permanent native anchors:

- `#project-eks-cilium`
- `#project-sagelms`
- `#project-mlops`

No router, UI library, animation package or remote font is required.

## Checks

Build before running browser checks:

```sh
npm run build
npm run check:foundation
npm run check:hero
npm run check:projects
```

The checks use Node built-ins and an installed Chrome/Chromium or Edge. Set `CHROME_PATH` when the browser is not detected automatically. Node must support native TypeScript type stripping for the content-check imports (tested with Node 24).

Browser checks start temporary dev/production servers on ports 5175/4180, launch their own headless browser and stop those processes afterward. Results and screenshots go into ignored local folders under `docs/validation`. Hero/Projects checks cover six widths from 320px to 1440px, keyboard navigation, focus, hash destinations, wrapping, reduced motion and bundle boundaries. Projects additionally checks refresh/history, source-link wiring and figure accessibility metadata.

An internal evidence audit is deliberately excluded from Git. When present locally, the content check resolves source IDs against it. Public clones validate source-ID format/presence and other content invariants, and explicitly report the internal registry lookup as skipped. HTTP reachability of external source links is a separate check; these scripts do not promise that a repository or service remains available.

These checks do not certify complete WCAG compliance, screen-reader behavior, every browser or cross-platform typography.

## Content boundaries

Project descriptions distinguish team functionality, configured capabilities, historical execution and experimental limitations. Technology labels describe project coverage. Specific personal implementation claims, contact channels, a resume download and publication status remain unpublished pending approval.

Internal plans/audits, original references, QA screenshots, environment files and build output are ignored. Only public-safe source and development instructions belong in this repository. Review exact staged paths before future pushes.

## Hosting

The intended GitHub Pages repository is `nashitaz13/nashitaz13.github.io`; Vite uses `base: '/'`. Assets are local imports rewritten by the build. `publicDir: false` prevents automatic copying of loose source documents. Local development denies private document/reference paths, and production source maps are disabled.

Only `dist` is the deployable artifact. No GitHub Actions deployment is configured. Search indexing remains disabled while the website is under construction. Pushing this repository is separate from configuring or publishing GitHub Pages.
