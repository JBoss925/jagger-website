import { profileContent } from "../../content/profile";
export const projects = profileContent.projects;
export const clean = (text: string) => text.replace(/\*\*/g, "");
export const summaries: Record<string, string> = {
  ojaml:
    "An ML-family language. From source code to WebAssembly, in your browser.",
  risk:
    "A browser-native quant terminal. 62 WebAssembly indicators, 24 strategies, backtesting, and paper trading.",
  jaggerscript:
    "A typed language, a heap-backed runtime, and a playground to explore both.",
  liveboard: "An infinite canvas built for realtime collaboration.",
  hearth:
    "Warmth, texture, and character. An audio effect grounded in DSP research.",
  "genetic-ts":
    "Watch a population learn. An interactive experiment in evolution and physics.",
  "aixc-compressor":
    "A different approach to compression, built around a shared predictor.",
  "jagger-games":
    "Six small reasons to take a break. Daily puzzles and a strategy game.",
  rengine: "Scenes, entities, and rendering, built from first principles.",
  jetstream: "A weather dashboard powered by Open-Meteo, NestJS, and a PWA shell.",
  "tsxlight-renderer":
    "A custom JSX factory and server-driven rendering engine for web and Electron.",
  "random-arena":
    "Deterministic 60 Hz elastic ball fights with seeded daily matchups and unique kits.",
  chains:
    "A TypeScript monadic abstraction for composable type-changing pipelines and undo.",
  "portfolio-site": "Five different portfolio frontends, all powered by one shared data model.",
};
export const views = [
  {
    title: "Interactive 3D",
    detail: "Spatial storytelling",
    href: "https://interactive3d.jaggerbrulato.com",
    mark: "◇",
  },
  {
    title: "Design",
    detail: "An editorial perspective",
    href: "https://design.jaggerbrulato.com",
    mark: "Aa",
  },
  {
    title: "Editor",
    detail: "Inside the workspace",
    href: "https://editor.jaggerbrulato.com",
    mark: "</>",
  },
  {
    title: "Finance",
    detail: "A terminal for the work",
    href: "https://finance.jaggerbrulato.com",
    mark: "↗",
  },
];
