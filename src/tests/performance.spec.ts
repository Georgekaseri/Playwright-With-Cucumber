import { test, expect } from "@playwright/test";

// Performance thresholds - configurable via environment variables for CI
const INITIAL_PAGE_LOAD_THRESHOLD = Number(
  process.env.INITIAL_PAGE_LOAD_THRESHOLD ?? 8000
); // 8s for CI
const INTERACTION_THRESHOLD = Number(
  process.env.INTERACTION_THRESHOLD ?? 20000
); // 20s for CI
const FULL_PAGE_LOAD_THRESHOLD = Number(
  process.env.FULL_PAGE_LOAD_THRESHOLD ?? 10000
); // 10s for CI
const MEMORY_THRESHOLD = Number(
  process.env.MEMORY_THRESHOLD ?? 100 * 1024 * 1024
); // 100MB for CI
const WEB_VITALS_THRESHOLD = Number(process.env.WEB_VITALS_THRESHOLD ?? 8000); // 8s for CI

// Performance testing suite
test.describe("Performance Tests @performance", () => {
  test.beforeEach(async ({ page }) => {
    // Warm up browser to reduce cold-start noise
    await page.goto("about:blank");
  });

  test("Page load performance @performance @smoke", async ({ page }) => {
    await test.step("Measure initial page load", async () => {
      const startTime = Date.now();
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com"
      );
      await page.waitForLoadState("domcontentloaded");

      // Use navigation timing for more accurate measurement
      const navTiming = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          "navigation"
        ) as PerformanceNavigationTiming[];
        if (entries && entries.length) return entries[0].duration;
        // fallback to difference of timing values
        const t = (performance as any).timing;
        return (
          (t.loadEventEnd || Date.now()) - (t.navigationStart || Date.now())
        );
      });

      const measured = Math.round(navTiming ?? Date.now() - startTime);
      console.log(
        `DOM Content Loaded: ${measured}ms (threshold ${INITIAL_PAGE_LOAD_THRESHOLD}ms)`
      );
      expect(measured).toBeLessThanOrEqual(INITIAL_PAGE_LOAD_THRESHOLD);
    });

    await test.step("Measure full page load", async () => {
      const startTime = Date.now();
      await page.waitForLoadState("load");
      await page
        .waitForLoadState("networkidle", { timeout: 10000 })
        .catch(() => {
          console.log("Network idle timeout - continuing with test");
        });
      const fullLoadTime = Date.now() - startTime;

      console.log(
        `Page Load Complete: ${fullLoadTime}ms (threshold ${FULL_PAGE_LOAD_THRESHOLD}ms)`
      );
      expect(fullLoadTime).toBeLessThanOrEqual(FULL_PAGE_LOAD_THRESHOLD);
    });
  });

  test("Login performance @performance", async ({ page }) => {
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com"
    );
    await page.waitForLoadState("load");

    await test.step("Measure login form interaction", async () => {
      const startTime = Date.now();

      await page.fill(
        'input[name="username"]',
        process.env.ORANGEHRM_USERNAME || "Admin"
      );
      await page.fill(
        'input[name="password"]',
        process.env.ORANGEHRM_PASSWORD || "admin123"
      );
      await page.click('button[type="submit"]');

      // Wait for navigation or dashboard to load with longer timeout for CI
      await page.waitForURL(/dashboard/, { timeout: 30000 });
      const loginTime = Date.now() - startTime;

      console.log(
        `Login process: ${loginTime}ms (threshold ${INTERACTION_THRESHOLD}ms)`
      );
      expect(loginTime).toBeLessThanOrEqual(INTERACTION_THRESHOLD);
    });
  });

  test("Resource loading performance @performance", async ({ page }) => {
    await test.step("Monitor resource loading", async () => {
      const resourceTimings: Array<{ name: string; size: number }> = [];

      page.on("response", async (response) => {
        const request = response.request();

        // Skip redirect responses as they don't have body content
        if (response.status() >= 300 && response.status() < 400) {
          return;
        }

        try {
          const size = (await response.body()).length;
          resourceTimings.push({
            name: request.url(),
            size: size,
          });
        } catch (error) {
          // Skip responses that can't provide body (e.g., some redirects, errors)
          console.log(`Skipped resource: ${request.url()} - ${error}`);
        }
      });

      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com"
      );
      await page.waitForLoadState("domcontentloaded");

      // Log resource statistics
      const totalSize = resourceTimings.reduce(
        (sum, resource) => sum + resource.size,
        0
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
          "https://opensource-demo.orangehrmlive.com"
      );

      // Basic memory monitoring using CDP
      const client = await page.context().newCDPSession(page);
      await client.send("Runtime.enable");

      // Get heap usage
      const heapUsage = await client.send("Runtime.getHeapUsage");
      console.log(`Heap usage: ${JSON.stringify(heapUsage, null, 2)}`);

      // Basic assertion - heap shouldn't be too large for a simple page
      console.log(
        `Heap usage: ${(heapUsage.usedSize / 1024 / 1024).toFixed(2)}MB (threshold ${(MEMORY_THRESHOLD / 1024 / 1024).toFixed(2)}MB)`
      );
      expect(heapUsage.usedSize).toBeLessThanOrEqual(MEMORY_THRESHOLD);
    });
  });

  test("Core Web Vitals performance @performance", async ({ page }) => {
    await test.step("Collect Core Web Vitals", async () => {
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com"
      );

      // Simulate Core Web Vitals collection
      const performanceMetrics = (await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simplified performance metrics collection
          const navigation = performance.getEntriesByType(
            "navigation"
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
      })) as {
        domContentLoaded: number;
        loadComplete: number;
        firstContentfulPaint: number;
        largestContentfulPaint: number;
      };

      console.log("Performance Metrics:", performanceMetrics);

      // Basic Core Web Vitals thresholds - more lenient for CI
      console.log(
        `DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms (threshold ${WEB_VITALS_THRESHOLD}ms)`
      );
      console.log(
        `Load Complete: ${performanceMetrics.loadComplete}ms (threshold ${WEB_VITALS_THRESHOLD}ms)`
      );
      expect(performanceMetrics.domContentLoaded).toBeLessThanOrEqual(
        WEB_VITALS_THRESHOLD
      );
      expect(performanceMetrics.loadComplete).toBeLessThanOrEqual(
        WEB_VITALS_THRESHOLD
      );
    });
  });
});
