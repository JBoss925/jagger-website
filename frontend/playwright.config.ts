import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 12_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173"
  },
  webServer: {
    command: process.env.PLAYWRIGHT_PREVIEW === "1"
      ? "npm run preview -- --host 127.0.0.1 --port 4173"
      : "npm run dev -- --host 127.0.0.1 --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    cwd: "."
  }
});
