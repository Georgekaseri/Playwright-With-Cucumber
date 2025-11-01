import { test, expect } from "@playwright/test";

// Health check tests for monitoring pipeline
test.describe("System Health Checks @health", () => {
  test("Application is accessible @health @quick @smoke", async ({ page }) => {
    // Navigate to application
    await page.goto(
      process.env.ORANGEHRM_BASE_URL ||
        "https://opensource-demo.orangehrmlive.com",
    );

    // Verify page loads successfully
    await expect(page).toHaveTitle(/OrangeHRM/);

    // Use the correct selector for OrangeHRM login page
    const usernameInput = page.getByPlaceholder("Username");
    await expect(usernameInput).toBeVisible({ timeout: 10000 });

    // Check basic functionality
    await usernameInput.fill("test");
    await expect(usernameInput).toHaveValue("test");
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
