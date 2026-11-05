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
npm run check:profile
npm run check:ux
npm run check:motion
npm run check:inline
```

The checks use Node built-ins and an installed Chrome/Chromium or Edge. Set `CHROME_PATH` when the browser is not detected automatically. Node must support native TypeScript type stripping for the content-check imports (tested with Node 24).

Browser checks start temporary dev/production servers on ports 5175/4180, launch their own headless browser and stop those processes afterward. Results and screenshots go into ignored local folders under `docs/validation`. Hero/Projects checks cover six widths from 320px to 1440px, keyboard navigation, focus, hash destinations, wrapping, reduced motion and bundle boundaries. Projects additionally checks refresh/history, source-link wiring and figure accessibility metadata.

`check:profile` includes those regression checks and validates the Expertise, About/Education and Contact sections: published text, project technology coverage, links to case studies, readable body text and contact approval boundaries. It saves screenshots/results under `docs/validation/phase06`.

`check:ux` includes the content/browser regressions plus scroll-based selection without URL changes, section boundaries, explicit/same-hash navigation, hover/focus feedback, native menu Space/Escape and reduced-motion checks. Screenshots/results go to `docs/validation/phase07`. Its 200% reflow check uses half-sized CSS viewports at doubled pixel density; it does not operate Chrome's native zoom control.

`check:motion` adds playback/interruption/failure checks, layout-shift sampling, pointer performance trace, touch emulation, screencast frames and production HTML with scripts disabled. Outputs remain in ignored `docs/validation/phase07_5`; real-device performance needs review. Build also prerenders public content into static HTML and hydrates it; development remains client-rendered. Reading/native links survive a failed browser script, while motion and active-section tracking remain enhancements.

Projects use native inline disclosures with exclusive enhanced selection. Case hashes open the matching article beneath its project; no duplicate articles sit at the page bottom. Diagram details use native dialogs; Copy link provides explicit success/failure feedback. Without JavaScript, summary controls and the full prerendered content remain usable. `npm run check:inline` extends all regressions with disclosure/history/scroll, modal focus, clipboard branches and no-JavaScript operation; its local outputs are ignored under `docs/validation/phase07_6`.

An internal evidence audit is deliberately excluded from Git. When present locally, the content check resolves source IDs against it. Public clones validate source-ID format/presence and other content invariants, and explicitly report the internal registry lookup as skipped. HTTP reachability of external source links is a separate check; these scripts do not promise that a repository or service remains available.

These checks do not certify complete WCAG compliance, screen-reader behavior, every browser or cross-platform typography.

## Content boundaries

Project descriptions distinguish team functionality, configured capabilities, historical execution and experimental limitations. Technology labels describe project coverage. Specific personal project-implementation claims, a resume download and publication status remain unpublished pending approval. The owner has approved the CV email, LinkedIn and city plus GitHub and Instagram for Contact, and confirmed the current DevOps Intern role at Bosch Global Software Technologies Vietnam (BGSV). Phone and Facebook are excluded; no employment dates or duties are inferred.

Internal plans/audits, original references, QA screenshots, environment files and build output are ignored. Only public-safe source and development instructions belong in this repository. Review exact staged paths before future pushes.

## Hosting

The intended GitHub Pages repository is `nashitaz13/nashitaz13.github.io`; Vite uses `base: '/'`. Assets are local imports rewritten by the build. `publicDir: false` prevents automatic copying of loose source documents. Local development denies private document/reference paths, and production source maps are disabled.

The live site is https://nashitaz13.github.io/. In repository Settings → Pages, Source must be **GitHub Actions**.

`.github/workflows/deploy.yml` deploys pushes to `main` and supports **Actions → Deploy portfolio to GitHub Pages → Run workflow**. Build uses Node 24, `npm ci`, content checks, strict TypeScript/Vite/prerender and `npm run check:build`. A separate deployment job publishes only `dist` with Pages/OIDC permissions. Official action versions are pinned by commit SHA; deployments are serialized. No personal access token or cloud secret is required.

`check:build` rejects unexpected files, development references and unapproved emails, and verifies static case studies and local assets before upload. The original CV, audit and review output are not deployment inputs. Check both jobs in Actions and the live site after a push. Search indexing remains disabled while the portfolio is under construction.


## GSAP visual system

Phase 07.7 adds GSAP core + ScrollTrigger with scoped React lifecycle cleanup. Static HTML remains readable; native case disclosures remain usable without scripts. Technology marks are local SVGs with a source/license registry; unidentified marks use a generic symbol. GitHub repository/evidence links use native new-tab anchors.

Run `npm run check:gsap` after `npm run build`. It includes earlier regression checks plus asset loading, one-time scroll reveals, real StrictMode mount/unmount, motion preferences, initialization failure and Chrome trace/recording evidence. Local reports are in the ignored `docs/validation/phase07_7/` directory. `scripts/fixtures/gsap-lifecycle.html` is a development-only lifecycle fixture, excluded from production builds. Prerender resolves Vite asset URLs before hydration and includes public icon credits/licenses in `dist`.


## Sticky navigation and scroll QA

Phase 07.8 uses installed GSAP ScrollToPlugin/DrawSVGPlugin with a CSS sticky header, measured anchor offsets, interruptible native-anchor enhancement and existing-line name masks. Native/no-JS reading and all publication holds remain.

Run `npm run check:scroll` after `npm run build`. This includes previous regressions plus sticky geometry at six widths, five smooth destinations, real wheel cancellation, Back to Top with an expanded article, history restoration, DrawSVG settlement/no-replay and 390/320px touch navigation with visible collapse focus. Evidence is local/ignored under `docs/validation/phase07_8/`. No deployment is configured by this phase.
