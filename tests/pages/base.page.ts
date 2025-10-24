import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async expectUrl(rx: RegExp) {
    await expect(this.page).toHaveURL(rx);
  }
}
