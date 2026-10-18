import { defineConfig, devices } from "@playwright/test";

// Browser tests against a local preview of the built site (npm run build
// first). Supabase calls are intercepted in the tests, so nothing reaches
// production.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:4179", trace: "retain-on-failure" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: "npx vite preview --port 4179 --strictPort",
    url: "http://localhost:4179",
    reuseExistingServer: !process.env.CI,
  },
});
