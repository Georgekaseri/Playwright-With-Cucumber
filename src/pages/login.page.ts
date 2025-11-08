import { Page, Locator, expect } from "@playwright/test";
import { CONFIG } from "../config/config";

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
    await this.page.goto(`${CONFIG.baseURL}/web/index.php/auth/login`);
    await this.page.waitForLoadState("domcontentloaded");

    await expect(this.usernameInput).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 10_000 });
    await expect(this.loginBtn).toBeVisible({ timeout: 10_000 });
  }

  async login(username: string, password: string) {
    await this.page.waitForLoadState("domcontentloaded");

    // Clear and fill username with retries
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
    await expect(this.usernameInput).toHaveValue(username);

    // Clear and fill password with retries
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);

    // Click login button
    await this.loginBtn.click();

    // Handle different scenarios based on input
    if (username === "" || password === "") {
      // For empty credentials, wait for validation errors instead of navigation
      try {
        await this.page.waitForSelector('text="Required"', { timeout: 8000 });
        console.log("Validation errors appeared for empty credentials");
        return; // Don't wait for navigation for validation scenarios
      } catch (error) {
        console.warn(
          "Expected validation errors not found, continuing with normal flow",
        );
      }
    }

    try {
      // Wait for either URL change or error message for valid/invalid credentials
      await Promise.race([
        this.page.waitForURL(/.*dashboard.*/, { timeout: 15000 }),
        this.page.waitForURL((url) => !url.toString().includes("/auth/login"), {
          timeout: 15000,
        }),
        this.errorAlert.waitFor({ state: "visible", timeout: 15000 }),
      ]);
    } catch (error) {
      console.warn("Login navigation timeout, checking current state...");
    }

    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2000);

    const currentUrl = this.page.url();
    if (currentUrl.includes("/auth/login")) {
      // Check if there's an error message
      const errorVisible = await this.errorAlert.isVisible();
      if (errorVisible) {
        const errorText = await this.errorAlert.textContent();
        console.log(`Login error: ${errorText}`);
      } else {
        console.log("Still on login page after login attempt");
      }
    } else {
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
    // Wait for validation messages to appear with a longer timeout
    const validationMessages = this.page.locator('text="Required"');

    try {
      // First wait for at least one validation message to appear
      await validationMessages
        .first()
        .waitFor({ state: "visible", timeout: 8000 });

      // Then check that we have exactly 2 validation messages (username and password)
      await expect(validationMessages).toHaveCount(2, {
        timeout: this.timeout,
      });

      console.log("Successfully found required field validation messages");
    } catch (error) {
      console.error(
        "Failed to find required field validation messages:",
        error,
      );

      // Try alternative selectors for validation messages
      const alternativeValidation = this.page.locator(
        ".oxd-input-field-error-message, [data-v-957b4417] .oxd-text--span",
      );
      const hasAlternative = await alternativeValidation.count();

      if (hasAlternative > 0) {
        console.log(`Found ${hasAlternative} alternative validation messages`);
        await expect(alternativeValidation).toHaveCount(2, {
          timeout: this.timeout,
        });
      } else {
        throw new Error("No validation messages found for required fields");
      }
    }
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
