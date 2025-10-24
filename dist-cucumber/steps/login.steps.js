"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
(0, cucumber_1.Given)('I open the OrangeHRM login page', async function () {
    await this.page.goto(this.baseUrl);
});
(0, cucumber_1.When)('I login with valid credentials', async function () {
    await this.page.getByPlaceholder('Username').fill(process.env.USER_EMAIL);
    await this.page.getByPlaceholder('Password').fill(process.env.USER_PASSWORD);
    await Promise.all([
        this.page.waitForURL(/dashboard/i),
        this.page.getByRole('button', { name: /login/i }).click()
    ]);
});
(0, cucumber_1.Then)('I should see the Dashboard page', async function () {
    await (0, test_1.expect)(this.page).toHaveURL(/dashboard/i);
    const header = this.page.locator('h6.oxd-topbar-header-breadcrumb-module');
    await (0, test_1.expect)(header).toHaveText('Dashboard');
});
