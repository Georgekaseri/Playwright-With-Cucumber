import { defineConfig, devices } from "@playwright/test";
import DataHelper from "./src/data/dataHelper";

// Advanced parallelization configuration
const getOptimalWorkerCount = (): number | string => {
  const cpuCount = require("os").cpus().length;
  const availableMemoryGB = require("os").totalmem() / 1024 ** 3;

  if (process.env.CI) {
    // CI environment optimization
    if (process.env.GITHUB_ACTIONS) return 4;
    if (process.env.AZURE_PIPELINES) return 6;
    if (process.env.JENKINS_URL) return Math.min(cpuCount, 8);
    return 4; // Default CI workers
  }

  // Local development optimization
  if (availableMemoryGB < 8) return Math.max(2, Math.floor(cpuCount * 0.3));
  if (availableMemoryGB < 16) return Math.max(4, Math.floor(cpuCount * 0.5));
  return Math.max(6, Math.floor(cpuCount * 0.7)); // High-memory systems
};

// Test sharding configuration for large test suites
const getShardConfig = () => {
  const totalShards = parseInt(process.env.TOTAL_SHARDS || "1");
  const currentShard = parseInt(process.env.CURRENT_SHARD || "1");

  if (totalShards > 1) {
    return {
      shard: { total: totalShards, current: currentShard },
    };
  }
  return {};
};

// Environment-aware timeout configuration
const getTimeoutConfig = () => {
  const env = process.env.NODE_ENV || "dev";

  return {
    timeout: DataHelper.getTimeout("long"),
    expect: { timeout: DataHelper.getTimeout("medium") },
    // Retry strategy based on environment
    retries: env === "prod" ? 3 : process.env.CI ? 2 : 0,
  };
};

export default defineConfig({
  testDir: "./src/tests",
  ...getTimeoutConfig(),
  ...getShardConfig(),

  // Advanced worker configuration
  workers: getOptimalWorkerCount(),
  fullyParallel: true,

  // Enhanced reporting for parallel execution
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never",
        // Include worker information in reports
        attachmentsBaseURL: process.env.CI ? undefined : "file:///",
      },
    ],
    ["allure-playwright", { outputFolder: "allure-results" }], //  Allure integration
    ["json", { outputFile: "test-results/results.json" }],
    ...(process.env.CI ? [["github", {}] as const] : []),
  ],

  // Global test configuration
  use: {
    baseURL:
      process.env.ORANGEHRM_BASE_URL ||
      "https://opensource-demo.orangehrmlive.com",

    // Parallel execution optimizations
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",

    // Performance optimizations for parallel execution
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",

    // Environment-aware timeouts
    actionTimeout: DataHelper.getTimeout("medium"),
    navigationTimeout: DataHelper.getTimeout("long"),

    // Network optimizations
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  },

  // Enhanced project configuration for parallel execution
  projects: [
    // Desktop browsers - optimized for parallel execution
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--font-render-hinting=none",
            "--disable-web-security",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            // Memory optimizations for parallel execution
            "--memory-pressure-off",
            "--max_old_space_size=4096",
          ],
        },
      },
      testIgnore: process.env.BROWSER_FILTER === "firefox" ? "**/*" : undefined,
    },
    {
      name: "firefox-desktop",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "media.navigator.streams.fake": true,
            "media.navigator.permission.disabled": true,
            // Performance optimizations
            "browser.tabs.remote.autostart": true,
            "layers.acceleration.force-enabled": true,
          },
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
      },
      testIgnore:
        process.env.BROWSER_FILTER === "chromium" ? "**/*" : undefined,
    },
    {
      name: "webkit-desktop",
      use: {
        ...devices["Desktop Safari"],
        launchOptions: {
          // WebKit optimizations for parallel execution
        },
      },
      testIgnore: process.env.BROWSER_FILTER ? "**/*" : undefined,
    },

    // Mobile projects for comprehensive coverage
    ...(process.env.INCLUDE_MOBILE === "true"
      ? [
          {
            name: "mobile-chrome",
            use: {
              ...devices["Pixel 7"],
            },
          },
          {
            name: "mobile-safari",
            use: {
              ...devices["iPhone 14"],
            },
          },
        ]
      : []),

    // API testing project for parallel API tests
    {
      name: "api-tests",
      testMatch: "**/api/**/*.spec.ts",
      use: {
        // API tests don't need browser context
        baseURL: process.env.API_BASE_URL || process.env.ORANGEHRM_BASE_URL,
      },
    },
  ],

  // Output configuration for parallel execution
  outputDir: "test-results/",
  snapshotDir: "src/__screenshots__",

  // Global setup and teardown for parallel execution
  globalSetup: process.env.GLOBAL_SETUP_DISABLED
    ? undefined
    : require.resolve("./src/setup/globalSetup"),
  globalTeardown: process.env.GLOBAL_TEARDOWN_DISABLED
    ? undefined
    : require.resolve("./src/setup/globalTeardown"),

  // Test matching patterns for selective execution
  testMatch: ["**/tests/**/*.spec.ts", "**/integration/**/*.spec.ts"],

  // Ignore patterns for parallel execution optimization
  testIgnore: ["**/examples/**", "**/backup/**", "**/*.example.ts"],
});
