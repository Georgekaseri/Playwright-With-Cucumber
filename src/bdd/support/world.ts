import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, APIRequestContext } from "playwright";
import { LoginPage } from "../../pages/login.page";
import { DashboardPage } from "../../pages/dashboard.page";
import {
  BookingClient,
  BookingPayload,
  BookingResponse,
} from "../../api/bookingClient";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  request!: APIRequestContext;

  // Page objects - initialize once per scenario
  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;

  // API testing properties
  baseURL!: string;
  bookingAPI!: BookingClient;
  bookingPayload!: BookingPayload;
  bookingResponse!: BookingResponse;
  createdBookingId!: number;
  retrievedBooking!: BookingPayload;
  invalidPayload!: Partial<BookingPayload>;
  requestError!: Error;
  requestSucceeded!: boolean;
  lastAPIResponse!: any; // For debugging failed API calls
  authToken!: string; // For authenticated operations
  startTime!: number;
  endTime!: number; // Added for performance testing
  duration!: number;
  apiHealthy!: boolean; // Added for health check scenarios
  healthResponse!: import("playwright").APIResponse;

  constructor(options: IWorldOptions) {
    super(options);
  }

  // Initialize page objects after page is available
  initializePageObjects() {
    this.loginPage = new LoginPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
  }
}

setWorldConstructor(CustomWorld);

export type ICustomWorld = CustomWorld;

setWorldConstructor(CustomWorld);
