import { Page, Locator, expect } from "@playwright/test";
import { TEST_ENV } from "../config/test-env";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginBtn: Locator;
  readonly errorAlert: Locator;
  readonly usernameValidation: Locator;
  readonly passwordValidation: Locator;

  private readonly timeout = 5000;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginBtn = page.getByRole("button", { name: "Login" });
    this.errorAlert = page.locator('[role="alert"], .oxd-alert').first();
    this.usernameValidation = page
      .locator("[data-v-957b4417] .oxd-input-field-error-message")
      .first();
    this.passwordValidation = page
      .locator("[data-v-957b4417] .oxd-input-field-error-message")
      .last();
  }

  async goto() {
    await this.page.goto(`${TEST_ENV.baseURL}/web/index.php/auth/login`);
    await this.page.waitForLoadState("domcontentloaded");

    // Wait for login form to be ready
    await expect(this.usernameInput).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 10_000 });
    await expect(this.loginBtn).toBeVisible({ timeout: 10_000 });
  }

  async login(username: string, password: string) {
    // Wait for form to be fully loaded
    await this.page.waitForLoadState("domcontentloaded");

    // Clear and fill username
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
    await expect(this.usernameInput).toHaveValue(username);

    // Clear and fill password
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);

    // Click login and wait for navigation
    await this.loginBtn.click();

    // Give more time for the login process
    await this.page.waitForLoadState("domcontentloaded");

    // Small delay to allow for navigation (disabling ESLint for this specific case)
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(2000);

    // Check if we're still on login page (error case) or navigated (success)
    const currentUrl = this.page.url();
    if (currentUrl.includes("/auth/login")) {
      // Still on login page, might be an error
      console.log("Still on login page after login attempt");
    } else {
      // Navigated away from login page
      console.log(`Navigated to: ${currentUrl}`);
      await this.page.waitForLoadState("domcontentloaded");
    }
  }

  async assertOnLoginPage() {
    await expect(this.loginBtn).toBeVisible({ timeout: this.timeout });
    await expect(this.page).toHaveTitle(/login/i);
  }

  async assertInvalidCredentialsError() {
    // Handle both invalid credentials and empty field errors
    const errorAlert = this.page
      .locator('[role="alert"], .oxd-alert, .oxd-input-field-error-message')
      .first();
    await expect(errorAlert).toBeVisible({ timeout: this.timeout });

    // Check for either invalid credentials or required field messages
    const hasRequiredFields = await this.page
      .locator('text="Required"')
      .count();

    if (hasRequiredFields > 0) {
      // For empty credentials, check validation messages
      await this.assertRequiredFieldValidation();
    } else {
      // For invalid credentials, check error message
      await expect(errorAlert).toContainText(/invalid credentials/i);
    }
  }

  async assertRequiredFieldValidation() {
    const validationMessages = this.page.locator('text="Required"');
    await expect(validationMessages).toHaveCount(2, { timeout: this.timeout });
  }

  async assertUsernameRequired() {
    await expect(this.usernameValidation).toBeVisible({
      timeout: this.timeout,
    });
    await expect(this.usernameValidation).toContainText(/required/i);
  }

  async assertPasswordRequired() {
    await expect(this.passwordValidation).toBeVisible({
      timeout: this.timeout,
    });
    await expect(this.passwordValidation).toContainText(/required/i);
  }
}
