"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = void 0;
const base_page_1 = require("../base.page");
const test_1 = require("@playwright/test");
class LoginPage extends base_page_1.BasePage {
    async open() {
        await this.goto(process.env.BASE_URL);
    }
    async login(email, password) {
        await this.page.getByPlaceholder('Username').fill(email);
        await this.page.getByPlaceholder('Password').fill(password);
        await Promise.all([
            this.page.waitForURL(/dashboard/i),
            this.page.getByRole('button', { name: /login/i }).click(),
        ]);
    }
    async expectDashboard() {
        await (0, test_1.expect)(this.page).toHaveURL(/dashboard/i);
        const dashboardHeading = this.page.locator('h6.oxd-topbar-header-breadcrumb-module');
        await (0, test_1.expect)(dashboardHeading).toBeVisible();
        await (0, test_1.expect)(dashboardHeading).toHaveText('Dashboard');
    }
}
exports.LoginPage = LoginPage;
