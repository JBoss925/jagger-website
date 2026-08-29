# Jagger Website

Personal portfolio site for Jagger Brulato. The site combines a Three.js homepage, project demos, technical papers, and embedded integrations for OJaml, JaggerScript, GeneticTS, Rengine, and Jagger Games.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Three.js / React Three Fiber
- Monaco Editor
- KaTeX
- Vitest and Playwright

## Repository Layout

```text
frontend/
  src/
    components/       Shared UI components
    content/          Profile/project/paper content
    features/         Route-level feature areas
    hooks/            Shared React hooks
    styles/           Global stylesheet
    tests/            Playwright tests
frontend-v2/          Editor-style portfolio for editor.jaggerbrulato.com
frontend-v3/          Design-focused portfolio for design.jaggerbrulato.com
frontend-v4/          Finance-terminal portfolio for finance.jaggerbrulato.com
shared/               Profile, experience, project, and skills data shared by all frontends
genetic_ts/           GeneticTS submodule
jaggerscript/         JaggerScript submodule
ojaml/                OJaml submodule
rengine/              Rengine submodule
```

## Prerequisites

- Node.js 20 or newer
- npm
- Git with submodule support

## Setup

```bash
git clone --recurse-submodules https://github.com/JBoss925/jagger-website.git
cd jagger-website/frontend
npm install
```

If the repository was cloned without submodules:

```bash
git submodule update --init --recursive
```

## Runbook

Start the local development server:

```bash
cd frontend
npm run dev
```

The main site runs at `http://localhost:5173`. The editor runs at
`http://localhost:5174` from `frontend-v2`, and the earlier editorial variant
runs at `http://localhost:5175` from `frontend-v3`.
The finance-terminal view runs at `http://localhost:5176` from `frontend-v4`.

Build the production bundle:

```bash
cd frontend
npm run build
```

From the repository root, build every frontend together:

```bash
npm run buildAll
```

Each view also has a root-level `build:v1` through `build:v4`, `dev:v1`
through `dev:v4`, and `preview:v1` through `preview:v4` command.

Preview the production bundle locally:

```bash
cd frontend
npm run preview
```

Run unit tests:

```bash
cd frontend
npm test
```

Run Playwright tests:

```bash
cd frontend
npm run test:e2e
```

The Playwright command expects the local browser/runtime dependencies used by this workspace. If browser dependencies are missing, install them through Playwright before running the suite.

## Content Updates

- Shared homepage profile/projects: `shared/content/profile.ts` (the original frontend keeps a compatibility re-export)
- Papers index and paper metadata: `frontend/src/content/papers/`
- Global visual styling: `frontend/src/styles/global.css`
- Route implementations: `frontend/src/features/`

## Deployment

The site is deployed from the `frontend` Vite build output. Netlify should use:

```bash
cd frontend
npm install
npm run build
```

Publish directory:

```text
frontend/dist
```

The main site builds independently with `npm run build:v1` from the repository root. Its publish directory is `frontend/dist`.

The v2 site builds independently with `npm run build:v2` from the repository root. Its publish directory is `frontend-v2/dist`.

The v3 site builds independently with `npm run build:v3` from the repository root. Its publish directory is `frontend-v3/dist`.

The v4 site builds independently with `npm run build:v4` from the repository root. Its publish directory is `frontend-v4/dist`.

## Known Limitations

- Homepage cards use CSS `backdrop-filter` for the glass/readability effect. Some browsers, browser settings, GPU paths, or page-transition compositing states can delay or skip that blur effect, so the cards may briefly render as flat translucent panels before the blur resolves.
- The homepage background scene is GPU/WebGL-dependent. The site includes black CSS and renderer fallbacks, but very fast refreshes can still expose browser or driver-specific canvas initialization behavior.
