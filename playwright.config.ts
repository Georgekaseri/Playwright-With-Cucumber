import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  timeout: 60_000, // Increased timeout for CI environments
  expect: { timeout: 10_000 }, // Increased expect timeout
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL:
      process.env.ORANGEHRM_BASE_URL ||
      "https://opensource-demo.orangehrmlive.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 60_000, // Increased navigation timeout for CI
    actionTimeout: 10_000, // Increased action timeout
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
