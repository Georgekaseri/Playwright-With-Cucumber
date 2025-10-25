import { BasePage } from '../base.page';
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  async open() {
    await this.goto(process.env.BASE_URL!);
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('Username').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await Promise.all([
      this.page.waitForURL(/dashboard/i, { timeout: 5000 }),
      this.page.getByRole('button', { name: /login/i }).click(),
    ]);
  }

 async expectDashboard() {
  await expect(this.page).toHaveURL(/dashboard/i, { timeout: 5000 });

  const dashboardHeading = this.page.locator('h6.oxd-topbar-header-breadcrumb-module');
  await expect(dashboardHeading).toBeVisible();
  await expect(dashboardHeading).toHaveText('Dashboard');
}
}
