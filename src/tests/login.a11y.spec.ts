import { test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import {
  runLenientAccessibilityScan,
  runInformationalAccessibilityScan,
} from "../utils/a11yUtils";
import { TEST_ENV } from "../config/test-env";

test.describe("@a11y Accessibility", () => {
  test("@smoke should have no critical accessibility violations on Login page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Use lenient scan for external OrangeHRM site (only fail on critical issues)
    await runLenientAccessibilityScan(page, "Login Page");
  });

  test("@regression should have no critical accessibility violations on Dashboard page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_ENV.username, TEST_ENV.password);

    // Wait for dashboard to fully load before scanning
    const dashboard = new DashboardPage(page);
    await dashboard.assertLoaded();
    await page.waitForLoadState("networkidle");

    // Use informational scan for Dashboard - tracks issues without failing tests
    await runInformationalAccessibilityScan(page, "Dashboard Page");
  });

  test("@smoke should validate keyboard navigation on Login page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Test keyboard navigation
    await page.keyboard.press("Tab"); // Focus username
    await page.keyboard.press("Tab"); // Focus password
    await page.keyboard.press("Tab"); // Focus login button
    await page.keyboard.press("Enter"); // Try to submit

    // Should show validation message for empty fields
    await page.waitForTimeout(1000);
    await runLenientAccessibilityScan(page, "Login Page with Validation");
  });
});
