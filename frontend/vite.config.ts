import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));
const utilShim = path.resolve(frontendRoot, "src/lib/jaggerscript/utilShim.ts");

export default defineConfig({
  plugins: [react()],
  resolve: {
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
