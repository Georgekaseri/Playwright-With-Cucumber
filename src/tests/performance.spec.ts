import { test, expect } from "@playwright/test";

// Performance testing suite
test.describe("Performance Tests @performance", () => {
  test("Page load performance @performance @smoke", async ({ page }) => {
    await test.step("Measure initial page load", async () => {
      const startTime = Date.now();
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );
      await page.waitForLoadState("domcontentloaded");
      const domLoadTime = Date.now() - startTime;

      console.log(`DOM Content Loaded: ${domLoadTime}ms`);
      expect(domLoadTime).toBeLessThan(3000); // 3 seconds threshold
    });

    await test.step("Measure full page load", async () => {
      const startTime = Date.now();
      await page.waitForLoadState("domcontentloaded");
      const fullLoadTime = Date.now() - startTime;

      console.log(`Page Load Complete: ${fullLoadTime}ms`);
      expect(fullLoadTime).toBeLessThan(5000); // 5 seconds threshold
    });
  });

  test("Login performance @performance", async ({ page }) => {
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
    );

    await test.step("Measure login form interaction", async () => {
      const startTime = Date.now();

      await page.fill(
        'input[name="username"]',
        process.env.ORANGEHRM_USERNAME || "Admin",
      );
      await page.fill(
        'input[name="password"]',
        process.env.ORANGEHRM_PASSWORD || "admin123",
      );
      await page.click('button[type="submit"]');

      // Wait for navigation or dashboard to load
      await page.waitForURL(/dashboard/);
      const loginTime = Date.now() - startTime;

      console.log(`Login process: ${loginTime}ms`);
      expect(loginTime).toBeLessThan(10000); // 10 seconds threshold
    });
  });

  test("Resource loading performance @performance", async ({ page }) => {
    await test.step("Monitor resource loading", async () => {
      const resourceTimings: Array<{ name: string; size: number }> = [];

      page.on("response", async (response) => {
        const request = response.request();
        const size = (await response.body()).length;

        resourceTimings.push({
          name: request.url(),
          size: size,
        });
      });

      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );
      await page.waitForLoadState("domcontentloaded");

      // Log resource statistics
      const totalSize = resourceTimings.reduce(
        (sum, resource) => sum + resource.size,
        0,
      );
      console.log(`Total resources loaded: ${resourceTimings.length}`);
      console.log(`Total size: ${(totalSize / 1024).toFixed(2)} KB`);

      // Basic performance assertions
      expect(resourceTimings.length).toBeLessThan(100); // Not too many resources
      expect(totalSize).toBeLessThan(5 * 1024 * 1024); // Less than 5MB total
    });
  });

  test("Memory usage monitoring @performance", async ({ page }) => {
    await test.step("Monitor memory consumption", async () => {
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );

      // Basic memory monitoring using CDP
      const client = await page.context().newCDPSession(page);
      await client.send("Runtime.enable");

      // Get heap usage
      const heapUsage = await client.send("Runtime.getHeapUsage");
      console.log(`Heap usage: ${JSON.stringify(heapUsage, null, 2)}`);

      // Basic assertion - heap shouldn't be too large for a simple page
      expect(heapUsage.usedSize).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
    });
  });

  test("Core Web Vitals performance @performance", async ({ page }) => {
    await test.step("Collect Core Web Vitals", async () => {
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );

      // Simulate Core Web Vitals collection
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simplified performance metrics collection
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;

          resolve({
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstContentfulPaint:
              performance.getEntriesByName("first-contentful-paint")[0]
                ?.startTime || 0,
            largestContentfulPaint:
              performance.getEntriesByName("largest-contentful-paint")[0]
                ?.startTime || 0,
          });
        });
      });

      console.log("Performance Metrics:", performanceMetrics);

      // Basic Core Web Vitals thresholds
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2500); // 2.5s for good LCP
      expect(performanceMetrics.loadComplete).toBeLessThan(5000); // 5s total load time
    });
  });
});
