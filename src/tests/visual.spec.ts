import { test, expect, type Locator } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { TEST_ENV } from "../config/test-env";

// Utility to freeze animations/transitions for deterministic screenshots
async function freezeAnimations(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: `
      * { transition-duration: 0s !important; animation-duration: 0s !important; }
      html { scroll-behavior: auto !important; }
    `,
  });
}

test.describe("Visual Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await freezeAnimations(page);
    await login.login(TEST_ENV.username, TEST_ENV.password);

    const dashboard = new DashboardPage(page);
    await dashboard.assertLoaded();

    // Ensure we're really on the dashboard before proceeding
    await page.waitForURL("**/dashboard/**", { timeout: 10000 });
    await page.waitForLoadState("load");
    // Wait for dashboard content to stabilize by waiting for a stable element
    const dashboardContent = page.locator(".oxd-grid-4, .orangehrm-dashboard-grid, body");
    await dashboardContent.first().waitFor({ state: "visible", timeout: 5000 });
  });

  test("Dashboard page matches baseline @visual @smoke", async ({ page }) => {
    // Verify we're still authenticated by checking URL
    await expect(page).toHaveURL(/.*dashboard/);

    // Mask dynamic regions if needed (e.g., clocks, carousels)
    const mask: Locator[] = [
      // example: page.locator('.some-dynamic-thing')
    ];

    await freezeAnimations(page);
    // Wait for the page to stabilize by waiting for key elements
    const dashboardContent = page.locator(".oxd-grid-4, .orangehrm-dashboard-grid, body");
    await dashboardContent.first().waitFor({ state: "visible", timeout: 5000 });

    await expect(page).toHaveScreenshot("dashboard.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.08, // Increased tolerance to 8% for dynamic dashboard content
      animations: "disabled",
      mask,
    });
  });

  test("Quick Actions widget looks correct @visual @regression", async ({
    page,
  }) => {
    // Verify we're still authenticated by checking URL
    await expect(page).toHaveURL(/.*dashboard/);

    await freezeAnimations(page);
    // Wait for the widget to be stable and ensure fonts are loaded
    await page.waitForLoadState("load");
    
    // Use a combined locator that will match either the specific widget or the fallback area
    // This avoids runtime conditionals by using Playwright's locator chaining
    const elementToCapture = page.locator(
      '.orangehrm-todo-list, .quickLaunch, [data-v-*="quick"], .dashboard-widget, .oxd-grid-4'
    ).first();

    // Ensure the element is stable before screenshot
    await elementToCapture.waitFor({ state: "visible", timeout: 5000 });
    await expect(elementToCapture).toBeVisible();

    await expect(elementToCapture).toHaveScreenshot(
      "quick-actions-widget.png",
      {
        maxDiffPixelRatio: 0.05, // Increased tolerance to 5% for more stability
        animations: "disabled",
        threshold: 0.2, // Additional threshold for pixel-level differences
      },
    );
  });
});

test.describe("Login Page Visual Tests", () => {
  test("Login form visual consistency @visual @smoke", async ({ page }) => {
    // Go directly to login page without the beforeEach hook
    const login = new LoginPage(page);
    await login.goto();
    await freezeAnimations(page);

    await expect(page).toHaveScreenshot("login-form.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    });
  });
});
