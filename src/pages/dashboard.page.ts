import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async assertLoaded() {
    // Wait for navigation to complete
    await this.page.waitForLoadState("domcontentloaded");

    console.log(`Current URL: ${this.page.url()}`);

    // Check if we're actually logged in by looking for any post-login indicators
    const currentUrl = this.page.url();

    // If still on login page, fail immediately with clear message
    if (currentUrl.includes("/auth/login")) {
      throw new Error(
        `Still on login page. Login may have failed. URL: ${currentUrl}`
      );
    }

    // If URL contains dashboard, we're good
    if (currentUrl.includes("dashboard")) {
      console.log("✅ Dashboard URL detected");
      return;
    }

    // Try to find any OrangeHRM navigation elements that indicate successful login
    const postLoginElements = [
      this.page.locator(".oxd-main-menu"),
      this.page.locator(".oxd-topbar"),
      this.page.locator(".oxd-navbar"),
      this.page.locator('[class*="sidebar"]'),
      this.page.locator('[class*="menu"]'),
      this.page.locator(".oxd-userdropdown"), // User dropdown indicates logged in
    ];

    for (const element of postLoginElements) {
      try {
        await expect(element).toBeVisible({ timeout: 5_000 });
        console.log("✅ Found post-login navigation element");
        return;
      } catch {
        continue;
      }
    }

    // Final check: make sure we're not on an error page
    const pageText = await this.page.textContent("body");
    if (
      pageText &&
      pageText.length > 100 &&
      !pageText.includes("error") &&
      !pageText.includes("Error")
    ) {
      console.log("✅ Page has content and no errors, considering logged in");
      return;
    }

    throw new Error(
      `Could not verify dashboard/post-login state. Current URL: ${currentUrl}`
    );
  }
}
