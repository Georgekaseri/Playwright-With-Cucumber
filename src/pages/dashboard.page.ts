import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async assertLoaded() {
    // Try semantic approach first, fallback to text-based
    const dashboardLocator = this.page
      .getByRole("heading", { name: /dashboard/i })
      .or(
        this.page.locator("h1,h2,h3,h4,h5,h6").filter({ hasText: "Dashboard" }),
      );

    await expect(dashboardLocator).toBeVisible({ timeout: 5_000 });
  }
}
