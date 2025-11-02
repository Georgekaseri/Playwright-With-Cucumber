import { Given } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { LoginPage } from "../../pages/login.page";
import { TEST_ENV } from "../../config/test-env";

// NOTE: Visual testing with Playwright's toHaveScreenshot() only works within
// Playwright's test context, not Cucumber. Use npm run test:visual instead.

// Utility to freeze animations/transitions for deterministic screenshots
async function freezeAnimations(page: CustomWorld["page"]) {
  await page.addStyleTag({
    content: `
      * { transition-duration: 0s !important; animation-duration: 0s !important; }
      html { scroll-behavior: auto !important; }
    `,
  });
}

Given(
  "I am logged in and on the Dashboard for visuals",
  { timeout: 60000 },
  async function (this: CustomWorld) {
    const login = new LoginPage(this.page);
    await login.goto();
    await freezeAnimations(this.page);
    await login.login(TEST_ENV.username, TEST_ENV.password);
    // Wait for load state and main heading visible with longer timeout
    await this.page.waitForLoadState("load");
    // Wait for dashboard to be loaded
    await this.page
      .getByRole("heading", { name: "Dashboard" })
      .waitFor({ timeout: 10000 });
  }
);

// DISABLED: Playwright's toHaveScreenshot() doesn't work in Cucumber context
// Use the Playwright visual tests instead: npm run test:visual

/*
Then(
  "the full page should match the baseline {string}",
  async function (this: CustomWorld, name: string) {
    // This will fail because toHaveScreenshot() must be called during Playwright test
    console.log("Visual testing not supported in Cucumber - use npm run test:visual instead");
    throw new Error("Visual testing with Cucumber is not supported. Use Playwright visual tests instead.");
  }
);

Then(
  "the widget {string} should match the baseline",
  async function (this: CustomWorld, widgetRole: string) {
    // This will fail because toHaveScreenshot() must be called during Playwright test
    console.log("Visual testing not supported in Cucumber - use npm run test:visual instead");
    throw new Error("Visual testing with Cucumber is not supported. Use Playwright visual tests instead.");
  }
);
*/
