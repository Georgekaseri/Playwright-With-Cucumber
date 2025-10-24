import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PWWorld } from '../support/world';

Given('I open the OrangeHRM login page', async function (this: PWWorld) {
  await this.page!.goto(this.baseUrl);
});

When('I login with valid credentials', async function (this: PWWorld) {
  await this.page!.getByPlaceholder('Username').fill(process.env.USER_EMAIL!);
  await this.page!.getByPlaceholder('Password').fill(process.env.USER_PASSWORD!);
  await Promise.all([
    this.page!.waitForURL(/dashboard/i),
    this.page!.getByRole('button', { name: /login/i }).click()
  ]);
});

Then('I should see the Dashboard page', async function (this: PWWorld) {
  await expect(this.page!).toHaveURL(/dashboard/i);
  const header = this.page!.locator('h6.oxd-topbar-header-breadcrumb-module');
  await expect(header).toHaveText('Dashboard');
});
