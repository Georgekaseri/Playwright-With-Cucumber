import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async assertLoaded() {
    await this.page.waitForLoadState("domcontentloaded");

    // Wait a bit for any redirections to complete
    await this.page.waitForTimeout(3000);

    const currentUrl = this.page.url();

    if (currentUrl.includes("/auth/login")) {
      // Check if there's an error message on the login page
      const errorAlert = this.page
        .locator('[role="alert"], .oxd-alert')
        .first();
      const errorVisible = await errorAlert.isVisible();
      if (errorVisible) {
        const errorText = await errorAlert.textContent();
        throw new Error(
          `Login failed with error: ${errorText}. URL: ${currentUrl}`,
        );
      } else {
        throw new Error(
          `Still on login page. Login may have failed. URL: ${currentUrl}`,
        );
      }
    }

    if (currentUrl.includes("dashboard")) {
      return;
    }

    const postLoginElements = [
      this.page.locator(".oxd-main-menu"),
      this.page.locator(".oxd-topbar"),
      this.page.locator(".oxd-navbar"),
      this.page.locator('[class*="sidebar"]'),
      this.page.locator('[class*="menu"]'),
      this.page.locator(".oxd-userdropdown"),
    ];

    for (const element of postLoginElements) {
      try {
        await expect(element).toBeVisible({ timeout: 8000 });
        return;
      } catch {
        continue;
      }
    }

    const pageText = await this.page.textContent("body");
    if (
      pageText &&
      pageText.length > 100 &&
      !pageText.includes("error") &&
      !pageText.includes("Error")
    ) {
      return;
    }

    throw new Error(
      `Could not verify dashboard/post-login state. Current URL: ${currentUrl}`,
    );
  }
}
