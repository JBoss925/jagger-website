#!/usr/bin/env node
/**
 * Local full-ecosystem dev runner for jaggerbrulato.com and all subdomains.
 *
 * Spins up the main portfolio alongside every locally-checked-out sibling repo
 * (jagger-games, jagger-docs, jagger-papers, RandomArena, JetStream, Risk) and
 * the alternate portfolio editions (frontend-v2..v5), injecting VITE_*_URL env
 * vars so every cross-subdomain link, iframe, and deep link resolves locally.
 *
 * Missing sibling repos gracefully fall back to their live production URLs.
 *
 * Usage:
 *   npm run dev          # Start everything (main + all subdomains + v2..v5 editions)
 *   npm run dev:core     # Start main + Games, Docs, Papers, Arena, JetStream, Risk
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = process.env.JAGGER_WORKSPACE_ROOT
  ? path.resolve(process.env.JAGGER_WORKSPACE_ROOT)
  : path.resolve(repoRoot, "..");

const args = new Set(process.argv.slice(2));
const coreOnly = args.has("--core");

const COLORS = [
  "\x1b[35m", // magenta
  "\x1b[36m", // cyan
  "\x1b[32m", // green
  "\x1b[33m", // yellow
  "\x1b[34m", // blue
  "\x1b[95m", // bright magenta
  "\x1b[96m", // bright cyan
  "\x1b[92m", // bright green
  "\x1b[93m", // bright yellow
  "\x1b[94m", // bright blue
  "\x1b[91m", // bright red
];
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

const SERVICES = [
  {
    id: "portfolio",
    label: "Portfolio",
    envKey: "VITE_PORTFOLIO_URL",
    port: 5173,
    prodUrl: "https://jaggerbrulato.com",
    cwd: path.join(repoRoot, "frontend"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5173", "--strictPort"],
    core: true,
  },
  {
    id: "games",
    label: "Games",
    envKey: "VITE_GAMES_URL",
    port: 5174,
    prodUrl: "https://games.jaggerbrulato.com",
    cwd: path.join(workspaceRoot, "jagger-games"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5174", "--strictPort"],
    core: true,
  },
  {
    id: "docs",
    label: "Docs",
    envKey: "VITE_DOCS_URL",
    port: 5175,
    prodUrl: "https://docs.jaggerbrulato.com",
    cwd: path.join(workspaceRoot, "jagger-docs"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5175", "--strictPort"],
    core: true,
  },
  {
    id: "papers",
    label: "Papers",
    envKey: "VITE_PAPERS_URL",
    port: 5176,
    prodUrl: "https://papers.jaggerbrulato.com",
    cwd: path.join(workspaceRoot, "jagger-papers"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5176", "--strictPort"],
    core: true,
  },
  {
    id: "arena",
    label: "Arena",
    envKey: "VITE_ARENA_URL",
    port: 5177,
    prodUrl: "https://arena.jaggerbrulato.com",
    cwd: path.join(workspaceRoot, "RandomArena"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5177", "--strictPort"],
    core: true,
  },
  {
    id: "jetstream",
    label: "JetStream",
    envKey: "VITE_JETSTREAM_URL",
    port: 5178,
    prodUrl: "https://jetstream.jaggerbrulato.com",
    cwd: path.join(workspaceRoot, "JetStream", "apps", "web"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5178", "--strictPort"],
    extraEnv: { VITE_WEATHER_DATA_SOURCE: "direct" },
    core: true,
  },
  {
    id: "risk",
    label: "Risk",
    envKey: "VITE_RISK_URL",
    port: 5180,
    prodUrl: "https://risk.jaggerbrulato.com",
    cwd: path.join(workspaceRoot, "Risk"),
    command: ["node", "server.mjs"],
    extraEnv: { PORT: "5180" },
    core: true,
  },
  {
    id: "editor",
    label: "Editor (v2)",
    envKey: "VITE_EDITOR_URL",
    port: 5182,
    prodUrl: "https://editor.jaggerbrulato.com",
    cwd: path.join(repoRoot, "frontend-v2"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5182", "--strictPort"],
    core: false,
  },
  {
    id: "design",
    label: "Design (v3)",
    envKey: "VITE_DESIGN_URL",
    port: 5183,
    prodUrl: "https://design.jaggerbrulato.com",
    cwd: path.join(repoRoot, "frontend-v3"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5183", "--strictPort"],
    core: false,
  },
  {
    id: "finance",
    label: "Finance (v4)",
    envKey: "VITE_FINANCE_URL",
    port: 5184,
    prodUrl: "https://finance.jaggerbrulato.com",
    cwd: path.join(repoRoot, "frontend-v4"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5184", "--strictPort"],
    core: false,
  },
  {
    id: "interactive3d",
    label: "3D View (v5)",
    envKey: "VITE_INTERACTIVE3D_URL",
    port: 5185,
    prodUrl: "https://interactive3d.jaggerbrulato.com",
    cwd: path.join(repoRoot, "frontend-v5"),
    command: ["npx", "vite", "--host", "0.0.0.0", "--port", "5185", "--strictPort"],
    core: false,
  },
];

const selected = SERVICES.filter((svc) => !coreOnly || svc.core);
const available = [];
const skipped = [];

for (const svc of selected) {
  if (fs.existsSync(svc.cwd)) {
    available.push(svc);
  } else {
    skipped.push(svc);
  }
}

// Build shared VITE_*_URL env map for every locally running service.
// Any skipped/missing repo stays unset so apps gracefully fall back to production URLs.
const sharedEnv = { ...process.env };
for (const svc of available) {
  sharedEnv[svc.envKey] = `http://localhost:${svc.port}`;
}

console.log(`\n${BOLD}Jagger Ecosystem Local Dev${RESET} ${DIM}(${coreOnly ? "core services" : "all services"})${RESET}\n`);
for (const svc of available) {
  const pad = svc.label.padEnd(14);
  console.log(`  \x1b[32m●\x1b[0m ${BOLD}${pad}${RESET} http://localhost:${svc.port}  ${DIM}← ${svc.prodUrl}${RESET}`);
}
if (skipped.length > 0) {
  console.log("");
  for (const svc of skipped) {
    const pad = svc.label.padEnd(14);
    console.log(`  \x1b[33m○\x1b[0m ${pad} ${DIM}not found at ${svc.cwd} (falling back to ${svc.prodUrl})${RESET}`);
  }
}
console.log(`\n${DIM}Press Ctrl+C to stop all servers cleanly.${RESET}\n`);

const children = [];
let shuttingDown = false;

function shutdown(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${DIM}Stopping ${children.length} dev servers...${RESET}`);
  for (const child of children) {
    if (!child.killed) {
      try {
        process.kill(-child.pid, signal);
      } catch {
        try {
          child.kill(signal);
        } catch {
          // ignore
        }
      }
    }
  }
  setTimeout(() => process.exit(0), 600).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

function streamLines(stream, prefix, isErr = false) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      // Filter noisy empty Vite ANSI clear screens
      const clean = line.replace(/\x1b\[2J|\x1b\[3J|\x1b\[H|\x1b\[1;1H/g, "");
      if (!clean.trim()) continue;
      (isErr ? process.stderr : process.stdout).write(`${prefix} ${clean}\n`);
    }
  });
}

available.forEach((svc, idx) => {
  const color = COLORS[idx % COLORS.length];
  const prefix = `${color}[${svc.id.padEnd(13)}]${RESET}`;
  const [cmd, ...cmdArgs] = svc.command;
  const child = spawn(cmd, cmdArgs, {
    cwd: svc.cwd,
    env: { ...sharedEnv, ...(svc.extraEnv || {}) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  children.push(child);
  streamLines(child.stdout, prefix, false);
  streamLines(child.stderr, prefix, true);

  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      console.error(`${prefix} exited (code=${code ?? "null"}, signal=${signal ?? "null"})`);
    }
  });
});
