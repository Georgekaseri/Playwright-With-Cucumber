import { chromium, FullConfig } from "@playwright/test";
import DataHelper from "../data/dataHelper";

async function globalSetup(config: FullConfig) {
  console.log("Starting global setup for parallel execution...");

  // Log environment and worker configuration
  const workerCount = config.workers;
  const environment = process.env.NODE_ENV || "dev";
  const envConfig = DataHelper.getEnvironmentConfig();

  console.log(`Environment: ${environment}`);
  console.log(`Workers: ${workerCount}`);
  console.log(`Projects: ${config.projects.length}`);
  console.log(`Features enabled:`, envConfig.features);

  // Validate environment configuration
  if (!envConfig) {
    throw new Error(`Invalid environment configuration for: ${environment}`);
  }

  // Optional: Pre-warm the application if needed
  if (process.env.PREWARM_APPLICATION === "true") {
    console.log("Pre-warming application...");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
        {
          timeout: DataHelper.getTimeout("long"),
        },
      );
      console.log("Application pre-warmed successfully");
    } catch (error) {
      console.warn("Application pre-warm failed:", error);
    } finally {
      await browser.close();
    }
  }

  // Set up parallel execution environment variables
  process.env.PARALLEL_EXECUTION = "true";
  process.env.WORKER_COUNT = String(workerCount);

  // Initialize test data for parallel execution
  if (DataHelper.shouldResetDataAfterTest()) {
    console.log("Initializing clean test data state...");
    // Add any data initialization logic here
  }

  console.log("Global setup completed successfully");
}

export default globalSetup;
