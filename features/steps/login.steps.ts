import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PWWorld } from '../support/world';
import { LoginPage } from '../../tests/pages/auth/login.page';

Given('I open the OrangeHRM login page', async function (this: PWWorld) {
  const login = this.po(LoginPage);
  await this.page!.goto(this.baseUrl);
});

When('I login with valid credentials', async function (this: PWWorld) {
  const login = this.po(LoginPage);
  await login.login(process.env.USER_EMAIL!, process.env.USER_PASSWORD!);
});

Then('I should see the Dashboard page', async function (this: PWWorld) {
  const login = this.po(LoginPage);
  await login.expectDashboard();
});
