import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:8000", browserName: "chromium", locale: "en-US", screenshot: "only-on-failure" },
  workers: 1,
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npm run start", port: 8000,
    reuseExistingServer: false, timeout: 60_000,
  },
});
