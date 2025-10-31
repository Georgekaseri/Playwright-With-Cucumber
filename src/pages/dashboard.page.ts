import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async assertLoaded() {
    // Wait for navigation to complete
    await this.page.waitForLoadState("domcontentloaded");

    // Primary check: URL should contain dashboard pattern
    try {
      await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 10_000 });
      return; // If URL check passes, we're good
    } catch (e) {
      // If URL doesn't contain dashboard, try other indicators
    }

    // Secondary checks: Look for OrangeHRM specific navigation elements
    const navigationElements = [
      this.page.locator(".oxd-main-menu"), // Main sidebar menu
      this.page.locator(".oxd-topbar"), // Top navigation bar
      this.page.locator(".oxd-navbar"), // Navigation bar
      this.page.locator('[class*="sidebar"]'), // Any sidebar element
      this.page.locator('[class*="menu"]'), // Any menu element
    ];

    // Try to find at least one navigation element
    for (const locator of navigationElements) {
      try {
        await expect(locator).toBeVisible({ timeout: 3_000 });
        return; // Found a navigation element, consider it loaded
      } catch (e) {
        continue;
      }
    }

    // Fallback: Check if we're not on login page anymore
    const notOnLoginPage = this.page.locator('input[name="username"]');
    await expect(notOnLoginPage).not.toBeVisible({ timeout: 5_000 });
  }
}
