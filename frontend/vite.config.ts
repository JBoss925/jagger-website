import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

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
const utilShim = path.resolve(frontendRoot, "src/lib/jaggerscript/utilShim.ts");

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: /^util$/, replacement: utilShim },
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
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["tests/**/*"]
  }
});
