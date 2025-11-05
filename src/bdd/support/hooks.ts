import { Before, After, Status } from "@cucumber/cucumber";
import type { CustomWorld } from "./world";
import { chromium, request } from "playwright";

const isCI = !!process.env.CI;
const headless = process.env.HEADLESS === "0" ? false : true; // HEADLESS=0 for headed

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: isCI ? true : headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  // Initialize API request context for booking API
  this.baseURL =
    process.env.BOOKER_BASE_URL || "https://restful-booker.herokuapp.com";
  this.request = await request.newContext({
    baseURL: this.baseURL,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Initialize page objects after page is created
  this.initializePageObjects();
});

After(async function (this: CustomWorld, { result }) {
  // Clean up created booking before disposing context
  if (this.createdBookingId && this.bookingAPI) {
    try {
      await this.bookingAPI.deleteBooking(this.createdBookingId);
      console.log(`Cleaned up booking ID: ${this.createdBookingId}`);
    } catch (error) {
      console.warn(
        `Failed to cleanup booking ${this.createdBookingId}:`,
        error,
      );
    }
  }

  if (result?.status === Status.FAILED && this.page) {
    const buf = await this.page.screenshot({ fullPage: true });
    await this.attach(buf, "image/png");

    // Attach API response for debugging if available
    if (this.lastAPIResponse) {
      const responseBody = await this.lastAPIResponse.text();
      await this.attach(
        `Status: ${this.lastAPIResponse.status()}\nBody: ${responseBody}`,
        "text/plain",
      );
    }
  }

  // Clean up resources
  if (this.request) await this.request.dispose();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
