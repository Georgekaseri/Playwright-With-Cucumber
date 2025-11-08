import { test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { CONFIG } from "../config/config";

test.describe("Auth", () => {
  test("can login and reach Dashboard", async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);

    // Add retry mechanism for flaky login
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        await login.goto();
        await login.login(CONFIG.username, CONFIG.password);
        await dash.assertLoaded();
        break; // Success, exit the retry loop
      } catch (error) {
        attempts++;
        console.log(
          `Login attempt ${attempts} failed: ${error instanceof Error ? error.message : String(error)}`
        );

        if (attempts >= maxAttempts) {
          throw error; // Re-throw the error if we've exhausted all attempts
        }

        // Wait a bit before retrying
        await page.waitForTimeout(2000);
      }
    }
  });
});
