import { Before, After, Status } from "@cucumber/cucumber";
import type { CustomWorld } from "./world";
import { chromium, request } from "playwright";

const isCI = !!process.env.CI;
const headless = process.env.HEADLESS === "0" ? false : true; // HEADLESS=0 for headed

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: isCI ? true : headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  // Initialize API request context for API tests
  this.request = await request.newContext();

  // Initialize page objects after page is created
  this.initializePageObjects();
});

After(async function (this: CustomWorld, { result }) {
  if (result?.status === Status.FAILED && this.page) {
    const buf = await this.page.screenshot({ fullPage: true });
    await this.attach(buf, "image/png");
  }

  // Clean up resources
  if (this.request) await this.request.dispose();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
