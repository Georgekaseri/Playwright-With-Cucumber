import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  timeout: 60_000, // Increased for CI
  expect: { timeout: 10_000 }, // Increased for CI
  // 🔁 Retries only in CI
  retries: process.env.CI ? 2 : 0,
  // 🚀 Workers configuration for better performance
  workers: process.env.CI ? 4 : "50%", // CI: 4 workers, Local: 50% of cores
  fullyParallel: true, // Run tests in parallel across files
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
    // Increased timeouts for CI
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    // 🔒 Ignore HTTPS errors for test environments
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--font-render-hinting=none",
            "--disable-web-security",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
          ],
        },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "media.navigator.streams.fake": true,
            "media.navigator.permission.disabled": true,
          },
          args: ["--no-sandbox"],
        },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        launchOptions: {
          // WebKit doesn't support --font-render-hinting=none
          // Use WebKit-specific options if needed
        },
      },
    },
  ],
  // 📸 Store snapshots in a predictable folder
  snapshotDir: "src/__screenshots__",
});
