"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const login_page_1 = require("../../tests/pages/auth/login.page");
(0, cucumber_1.Given)('I open the OrangeHRM login page', async function () {
    const login = this.po(login_page_1.LoginPage);
    await this.page.goto(this.baseUrl);
});
(0, cucumber_1.When)('I login with valid credentials', async function () {
    const login = this.po(login_page_1.LoginPage);
    await login.login(process.env.USER_EMAIL, process.env.USER_PASSWORD);
});
(0, cucumber_1.Then)('I should see the Dashboard page', async function () {
    const login = this.po(login_page_1.LoginPage);
    await login.expectDashboard();
});
