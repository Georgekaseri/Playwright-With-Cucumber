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

    await page.waitForLoadState("networkidle");
    await runLenientAccessibilityScan(page, "Login Page");
  });

  test("@regression should have no critical accessibility violations on Dashboard page", async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_ENV.username, TEST_ENV.password);

    const dashboard = new DashboardPage(page);
    await dashboard.assertLoaded();
    await page.waitForLoadState("networkidle");

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

    await page.waitForTimeout(1000);
    await runLenientAccessibilityScan(page, "Login Page with Validation");
  });
});
