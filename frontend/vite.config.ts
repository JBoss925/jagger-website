import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const inheritedTempDir = process.env.TMPDIR ?? process.env.TMP ?? process.env.TEMP;
if (
  process.platform !== "win32" &&
  !process.env.TMPDIR &&
  typeof inheritedTempDir === "string" &&
  inheritedTempDir.startsWith("/mnt/")
) {
  process.env.TMPDIR = "/tmp";
  process.env.TMP = "/tmp";
  process.env.TEMP = "/tmp";
}

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));
const utilShim = path.resolve(workspaceRoot, "jaggerscript/src/utilShim.ts");
const monacoReactEntry = path.resolve(frontendRoot, "node_modules/@monaco-editor/react/dist/index.mjs");
const monacoEditorEntry = path.resolve(frontendRoot, "node_modules/monaco-editor/esm/vs/editor/editor.api.js");
const matterJsEntry = path.resolve(frontendRoot, "node_modules/matter-js/build/matter.js");
const wabtEntry = path.resolve(frontendRoot, "node_modules/wabt/index.js");

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: /^util$/, replacement: utilShim },
      { find: /^@monaco-editor\/react$/, replacement: monacoReactEntry },
      { find: /^monaco-editor$/, replacement: monacoEditorEntry },
      { find: /^matter-js$/, replacement: matterJsEntry },
      { find: /^wabt$/, replacement: wabtEntry },
      { find: "@genetic-ts", replacement: path.resolve(workspaceRoot, "genetic_ts/src") },
      { find: "@jaggerscript", replacement: path.resolve(workspaceRoot, "jaggerscript/src") },
      { find: "@ojaml", replacement: path.resolve(workspaceRoot, "ojaml/src") },
      { find: "@rengine", replacement: path.resolve(workspaceRoot, "rengine/src") },
      { find: "@", replacement: path.resolve(frontendRoot, "src") }
    ]
  },
  define: {
    "process.env": {}
  },
  server: {
    fs: {
      allow: [workspaceRoot]
    }
  },
  build: {
    chunkSizeWarningLimit: 1100
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["tests/**/*"]
  }
});
