import { test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { CONFIG } from "../config/config";

test.describe("Auth", () => {
  test("can login and reach Dashboard", async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);

    await login.goto();
    await login.login(CONFIG.username, CONFIG.password);
    await dash.assertLoaded();
  });
});
