import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { CONFIG } from "../../config/config";
import DataHelper from "../../data/dataHelper";

Given("I am on the OrangeHRM login page", async function (this: CustomWorld) {
  await this.loginPage.goto();
});

When("I login with valid credentials", async function (this: CustomWorld) {
  await this.loginPage.login(CONFIG.username, CONFIG.password);
});

When(
  "I login as an {string}",
  async function (this: CustomWorld, role: string) {
    // Use new data management system for role-based login
    const roleMap: Record<
      string,
      keyof typeof import("../../data/users.json")
    > = {
      admin: "admin",
      employee: "essUser",
      manager: "manager",
      "hr user": "hrUser",
    };

    const userRole = roleMap[role.toLowerCase()];
    if (!userRole) {
      throw new Error(`Unknown role: ${role}`);
    }

    const user = DataHelper.getUserByRole(userRole);
    await this.loginPage.login(user.username, user.password);
  }
);

When(
  "I login with a parallel-safe {string} user",
  async function (this: CustomWorld, role: string) {
    // Use parallel-safe user for concurrent test execution
    const roleMap: Record<
      string,
      keyof typeof import("../../data/users.json")
    > = {
      admin: "admin",
      employee: "essUser",
      manager: "manager",
      "hr user": "hrUser",
    };

    const userRole = roleMap[role.toLowerCase()];
    if (!userRole) {
      throw new Error(`Unknown role: ${role}`);
    }

    const user = DataHelper.getParallelSafeUser(userRole);
    await this.loginPage.login(user.username, user.password);
  }
);

When(
  "I login with username {string} and password {string}",
  { timeout: 10000 }, // Increase timeout to 10 seconds for validation scenarios
  async function (this: CustomWorld, username: string, password: string) {
    // For empty credentials, handle form validation differently
    if (username === "" && password === "") {
      // Clear and fill the form fields
      await this.loginPage.usernameInput.clear();
      await this.loginPage.usernameInput.fill(username);
      await this.loginPage.passwordInput.clear();
      await this.loginPage.passwordInput.fill(password);

      // Click login button and wait for validation errors to appear
      await this.loginPage.loginBtn.click();

      // Wait for validation messages to appear instead of navigation
      await this.page.waitForSelector('text="Required"', { timeout: 8000 });
    } else {
      // Use normal login method for non-empty credentials
      await this.loginPage.login(username, password);
    }
  }
);

Then("I should see the dashboard", async function (this: CustomWorld) {
  await this.dashboardPage.assertLoaded();
});

Then("I should see an error message", async function (this: CustomWorld) {
  await this.loginPage.assertInvalidCredentialsError();
});

Then("I should see validation errors", async function (this: CustomWorld) {
  await this.loginPage.assertRequiredFieldValidation();
});
