import { FullConfig } from "@playwright/test";
import DataHelper from "../data/dataHelper";

async function globalTeardown(config: FullConfig) {
  console.log("Starting global teardown for parallel execution...");

  const environment = process.env.NODE_ENV || "dev";
  const workerCount = config.workers;

  console.log(
    `Completed execution with ${workerCount} workers in ${environment} environment`,
  );

  // Clean up test data if required by environment
  if (DataHelper.shouldResetDataAfterTest()) {
    console.log("Cleaning up test data...");
    // Add cleanup logic here if needed

    // Example: Clean up any temporary files created during parallel execution
    const fs = require("fs").promises;
    const path = require("path");

    try {
      const tempDir = path.join(process.cwd(), "temp-test-data");
      await fs.rmdir(tempDir, { recursive: true }).catch(() => {
        // Directory might not exist, ignore error
      });
      console.log("Temporary test data cleaned up");
    } catch (error) {
      console.warn("Cleanup warning:", error);
    }
  }

  // Performance metrics for parallel execution
  if (process.env.TRACK_PERFORMANCE === "true") {
    const endTime = Date.now();
    const startTime = parseInt(process.env.TEST_START_TIME || String(endTime));
    const duration = endTime - startTime;

    console.log("Parallel execution metrics:");
    console.log(`Total duration: ${duration}ms`);
    console.log(`Workers used: ${workerCount}`);
    console.log(
      `Average per worker: ${Math.round(duration / Number(workerCount))}ms`,
    );
  }

  console.log("Global teardown completed successfully");
}

export default globalTeardown;
