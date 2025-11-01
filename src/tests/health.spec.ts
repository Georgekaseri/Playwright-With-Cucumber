import { test, expect } from "@playwright/test";
import { checkSiteHealth, skipIfSiteDown } from "../utils/siteHealthCheck";

// Health check tests for monitoring pipeline
test.describe("System Health Checks @health", () => {
  let siteHealthy: boolean;

  test.beforeAll(async () => {
    const baseUrl =
      process.env.ORANGEHRM_BASE_URL ||
      "https://opensource-demo.orangehrmlive.com";
    siteHealthy = await checkSiteHealth(baseUrl);
  });

  test("Application is accessible @health @quick @smoke", async ({ page }) => {
    // Skip if external site is down
    test.skip(
      skipIfSiteDown(siteHealthy, "Application accessibility check"),
      "External OrangeHRM site is not available",
    );

    console.log("🏥 Starting health check...");

    // Navigate to application with extended timeout
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
      {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      },
    );

    // Wait for page to be stable
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    // Verify page loads successfully
    await expect(page).toHaveTitle(/OrangeHRM/);
    console.log(`✅ Page title verified: ${await page.title()}`);

    // Use robust selector strategy for OrangeHRM login page
    const usernameInput = page.locator(
      'input[name="username"], input[placeholder="Username"], input[data-placeholder="Username"], .oxd-input:first-of-type',
    );

    try {
      await expect(usernameInput).toBeVisible({ timeout: 20000 });
      console.log("✅ Username input found");

      // Check basic functionality
      await usernameInput.fill("test");
      await expect(usernameInput).toHaveValue("test");
      console.log("✅ Username input functionality verified");
    } catch (error) {
      console.log("❌ Username input not found, debugging...");
      console.log(`Current URL: ${page.url()}`);
      const pageContent = await page.content();
      console.log(`Page contains input: ${pageContent.includes("<input")}`);
      await page.screenshot({ path: "debug-health-check.png", fullPage: true });
      throw error;
    }
  });

  test("API endpoints are responsive @health @api", async ({ request }) => {
    // Check main application endpoint
    const response = await request.get(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
    );
    expect(response.status()).toBe(200);
  });

  test("Critical user flows work @health", async ({ page }) => {
    // Navigate and attempt login flow
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
    );

    // Check login form elements exist
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify navigation elements
    const pageContent = page.locator("body");
    await expect(pageContent).toBeVisible();
  });

  test("Performance baseline check @health @performance", async ({ page }) => {
    // Measure page load time
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

// Staging environment specific tests
test.describe("Staging Environment Health @staging", () => {
  test.skip(
    process.env.TEST_ENV !== "staging",
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
    process.env.TEST_ENV !== "production",
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
