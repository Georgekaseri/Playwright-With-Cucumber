import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as dotenv from 'dotenv';
dotenv.config();

export class PWWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  baseUrl = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
}

setWorldConstructor(PWWorld);
