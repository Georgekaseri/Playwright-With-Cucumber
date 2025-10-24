import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import { PWWorld } from './world';

let sharedBrowser: Browser;

BeforeAll(async function () {
  sharedBrowser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  await sharedBrowser?.close();
});

Before(async function (this: PWWorld) {
  this.browser = sharedBrowser;
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: PWWorld) {
  await this.page?.close();
  await this.context?.close();
});
