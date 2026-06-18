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

Build the production bundle:

```bash
cd frontend
npm run build
```

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

- Homepage profile/projects: `frontend/src/content/profile.ts`
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

## Known Limitations

- Homepage cards use CSS `backdrop-filter` for the glass/readability effect. Some browsers, browser settings, GPU paths, or page-transition compositing states can delay or skip that blur effect, so the cards may briefly render as flat translucent panels before the blur resolves.
- The homepage background scene is GPU/WebGL-dependent. The site includes black CSS and renderer fallbacks, but very fast refreshes can still expose browser or driver-specific canvas initialization behavior.
