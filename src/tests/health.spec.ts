import { test, expect } from "@playwright/test";

// Health check tests for monitoring pipeline
test.describe("System Health Checks @health", () => {
  test("Application is accessible @health @quick @smoke", async ({ page }) => {
    await test.step("Navigate to application", async () => {
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );
    });

    await test.step("Verify page loads successfully", async () => {
      await expect(page).toHaveTitle(/OrangeHRM/);
      await expect(page.locator('input[name="username"]')).toBeVisible();
    });

    await test.step("Check basic functionality", async () => {
      // Verify login form is interactive
      await page.fill('input[name="username"]', "test");
      await expect(page.locator('input[name="username"]')).toHaveValue("test");
    });
  });

  test("API endpoints are responsive @health @api", async ({ request }) => {
    await test.step("Check main application endpoint", async () => {
      const response = await request.get(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );
      expect(response.status()).toBe(200);
    });
  });

  test("Critical user flows work @health", async ({ page }) => {
    await test.step("Navigate and attempt login flow", async () => {
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );

      // Check login form elements exist
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    await test.step("Verify navigation elements", async () => {
      // Check basic page structure
      const pageContent = page.locator("body");
      await expect(pageContent).toBeVisible();
    });
  });

  test("Performance baseline check @health @performance", async ({ page }) => {
    await test.step("Measure page load time", async () => {
      const startTime = Date.now();
      await page.goto(
        process.env.ORANGEHRM_BASE_URL ||
          "https://opensource-demo.orangehrmlive.com",
      );
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - startTime;

      // Expect page to load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`Page load time: ${loadTime}ms`);
    });
  });
});

// Staging environment specific tests
test.describe("Staging Environment Health @staging", () => {
  test.skip(
    ({}, _testInfo) => process.env.TEST_ENV !== "staging",
    "Staging tests only run in staging environment",
  );

  test("Staging specific health check @health @staging", async ({ page }) => {
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
    );
    await expect(page).toHaveTitle(/OrangeHRM/);
  });
});

// Production environment monitoring
test.describe("Production Environment Health @production", () => {
  test.skip(
    ({}, _testInfo) => process.env.TEST_ENV !== "production",
    "Production tests only run in production environment",
  );

  test("Production health check @health @production", async ({ page }) => {
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
    );
    await expect(page).toHaveTitle(/OrangeHRM/);
  });
});
