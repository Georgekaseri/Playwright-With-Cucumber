import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "playwright";
import { LoginPage } from "../../pages/login.page";
import { DashboardPage } from "../../pages/dashboard.page";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Page objects - initialize once per scenario
  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;

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
