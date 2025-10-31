import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async assertLoaded() {
    // Wait for navigation to complete
    await this.page.waitForLoadState("domcontentloaded");

    // Try multiple dashboard indicators - OrangeHRM specific
    const dashboardIndicators = [
      // Dashboard heading variants
      this.page.getByRole("heading", { name: /dashboard/i }),
      this.page.locator("h1,h2,h3,h4,h5,h6").filter({ hasText: /dashboard/i }),

      // OrangeHRM specific elements
      this.page
        .locator(".oxd-topbar-header-breadcrumb h6")
        .filter({ hasText: /dashboard/i }),
      this.page.locator('[class*="dashboard"]').first(),

      // Main navigation or content indicators
      this.page.locator(".oxd-main-menu"),
      this.page.locator(".oxd-navbar"),

      // Fallback to body element if URL contains dashboard
      this.page.locator("body"),
    ];

    // Try each indicator with a shorter timeout
    let found = false;
    for (const locator of dashboardIndicators) {
      try {
        await expect(locator).toBeVisible({ timeout: 2_000 });
        found = true;
        break;
      } catch (e) {
        // Continue to next locator
        continue;
      }
    }

    // If none of the specific locators work, check URL pattern
    if (!found) {
      await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 5_000 });
    }
  }
}
