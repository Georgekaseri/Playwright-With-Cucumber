"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const test_1 = require("@playwright/test");
class BasePage {
    constructor(page) {
        this.page = page;
    }
    async goto(path = '/') {
        await this.page.goto(path);
    }
    async expectUrl(rx) {
        await (0, test_1.expect)(this.page).toHaveURL(rx);
    }
}
exports.BasePage = BasePage;
