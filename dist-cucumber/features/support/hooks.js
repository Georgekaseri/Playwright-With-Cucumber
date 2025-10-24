"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const playwright_1 = require("playwright");
let sharedBrowser;
(0, cucumber_1.BeforeAll)(async function () {
    sharedBrowser = await playwright_1.chromium.launch({ headless: true });
});
(0, cucumber_1.AfterAll)(async function () {
    await (sharedBrowser === null || sharedBrowser === void 0 ? void 0 : sharedBrowser.close());
});
(0, cucumber_1.Before)(async function () {
    this.browser = sharedBrowser;
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
});
(0, cucumber_1.After)(async function () {
    var _a, _b;
    await ((_a = this.page) === null || _a === void 0 ? void 0 : _a.close());
    await ((_b = this.context) === null || _b === void 0 ? void 0 : _b.close());
});
