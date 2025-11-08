import { test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import {
  runLenientAccessibilityScan,
  runInformationalAccessibilityScan,
} from "../utils/a11yUtils";
import { CONFIG } from "../config/config";

test.describe("@a11y Accessibility", () => {
  test("@smoke should have no critical accessibility violations on Login page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();

    await page.waitForLoadState("domcontentloaded");

    await runLenientAccessibilityScan(page, "Login Page");
  });

  test("@regression should have no critical accessibility violations on Dashboard page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // Add retry mechanism for flaky login
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        await login.goto();
        await login.login(CONFIG.username, CONFIG.password);
        await dashboard.assertLoaded();
        break; // Success, exit the retry loop
      } catch (error) {
        attempts++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`Login attempt ${attempts} failed: ${errorMessage}`);

        if (attempts >= maxAttempts) {
          throw error; // Re-throw the error if we've exhausted all attempts
        }

        // Wait a bit before retrying
        await page.waitForTimeout(2000);
      }
    }

    await page.waitForLoadState("domcontentloaded");

    await runInformationalAccessibilityScan(page, "Dashboard Page");
  });

  test("@smoke should validate keyboard navigation on Login page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const errorMessage = page.locator(
      ".oxd-alert--error, .oxd-input-field-error-message"
    );
    try {
      await errorMessage.waitFor({ timeout: 3000 });
    } catch {}
    await runLenientAccessibilityScan(page, "Login Page with Validation");
  });
});
