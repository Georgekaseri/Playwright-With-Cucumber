"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const playwright_1 = __importDefault(require("@axe-core/playwright"));
const test_1 = require("@playwright/test");
(0, cucumber_1.Then)('the page should have no serious accessibility issues', async function () {
    const results = await new playwright_1.default({ page: this.page }).analyze();
    const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    if (serious.length) {
        console.log('A11y violations:', serious.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
    }
    (0, test_1.expect)(serious.length, `Serious/Critical a11y issues found: ${serious.length}`).toBe(0);
});
