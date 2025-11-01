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

  private readonly timeout = 5_000;

  constructor(page: Page) {
    this.page = page;
    // Use multiple selector strategies for better reliability
    this.usernameInput = page.locator(
      'input[name="username"], input[placeholder="Username"], input[data-placeholder="Username"], .oxd-input:first-of-type'
    );
    this.passwordInput = page.locator(
      'input[name="password"], input[placeholder="Password"], input[data-placeholder="Password"], input[type="password"]'
    );
    this.loginBtn = page.locator(
      'button[type="submit"], .oxd-button--main, button:has-text("Login")'
    );

    // More specific error locators
    this.errorAlert = page.locator('[role="alert"], .oxd-alert').first();
    this.usernameValidation = page
      .locator("[data-v-957b4417] .oxd-input-field-error-message")
      .first();
    this.passwordValidation = page
      .locator("[data-v-957b4417] .oxd-input-field-error-message")
      .last();
  }

  async goto() {
    console.log(
      `🌐 Navigating to: ${TEST_ENV.baseURL}/web/index.php/auth/login`
    );

    // Navigate with longer timeout for slow environments
    await this.page.goto(`${TEST_ENV.baseURL}/web/index.php/auth/login`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });

    // Wait for page to be interactive
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle", { timeout: 30000 });

    console.log(`📄 Page loaded, current URL: ${this.page.url()}`);

    // Wait for login form to be ready with extended timeout and better error handling
    try {
      await expect(this.usernameInput).toBeVisible({ timeout: 20_000 });
      await expect(this.passwordInput).toBeVisible({ timeout: 20_000 });
      await expect(this.loginBtn).toBeVisible({ timeout: 20_000 });
      console.log("✅ Login form elements are visible");
    } catch (error) {
      console.log("❌ Login form not found, checking page content...");
      const pageContent = await this.page.content();
      console.log(`Page title: ${await this.page.title()}`);
      console.log(`Page URL: ${this.page.url()}`);
      console.log(
        `Page contains 'login': ${pageContent.toLowerCase().includes("login")}`
      );
      console.log(
        `Page contains 'username': ${pageContent.toLowerCase().includes("username")}`
      );

      // Take a screenshot for debugging
      await this.page.screenshot({
        path: "debug-login-page.png",
        fullPage: true,
      });
      console.log("🖼️ Screenshot saved as debug-login-page.png");

      throw error;
    }
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

    // Click login and wait for navigation with longer timeout for CI
    await this.loginBtn.click();

    // Wait for either navigation or error with longer timeout for CI environments
    try {
      await this.page.waitForURL(
        (url) => !url.toString().includes("/auth/login"),
        {
          timeout: 15000,
        }
      );
      console.log(`✅ Login successful. Navigated to: ${this.page.url()}`);
    } catch (error) {
      const currentUrl = this.page.url();
      console.log(`Still on login page after login attempt`);
      console.log(`Current URL: ${currentUrl}`);
      console.log(`Navigation timeout error: ${error}`);

      // Check for error messages
      const errorVisible = await this.errorAlert.isVisible();
      if (errorVisible) {
        const errorText = await this.errorAlert.textContent();
        console.log(`Login error: ${errorText}`);
      }
    }

    // Ensure page is fully loaded after login attempt
    await this.page.waitForLoadState("domcontentloaded");
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
