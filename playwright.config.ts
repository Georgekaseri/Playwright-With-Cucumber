import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  timeout: 35_000,
  expect: { timeout: 5_000 },
  // 🔁 Retries only in CI
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL:
      process.env.ORANGEHRM_BASE_URL ||
      "https://opensource-demo.orangehrmlive.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // 🧊 Visual stability
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    // disable animations/fonts jitter
    launchOptions: { args: ["--font-render-hinting=none"] },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  // 📸 Store snapshots in a predictable folder
  snapshotDir: "src/__screenshots__",
});
