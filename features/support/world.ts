import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';
import * as dotenv from 'dotenv';
dotenv.config();

export class PWWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  baseUrl = process.env.BASE_URL ||
    'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  // POM factory
  po<T>(ctor: new (...args: any[]) => T): T {
    // every page object receives the Playwright page
    return new ctor(this.page!);
  }
}

setWorldConstructor(PWWorld);
