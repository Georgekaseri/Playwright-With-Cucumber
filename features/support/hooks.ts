import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import { PWWorld } from './world';

let sharedBrowser: Browser;

// Increase default step timeout to 60s to allow slow network/page loads during end-to-end flows
setDefaultTimeout(60 * 1000);

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
