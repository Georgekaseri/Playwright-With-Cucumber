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
  },
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
  },
);

When(
  "I login with username {string} and password {string}",
  async function (this: CustomWorld, username: string, password: string) {
    await this.loginPage.login(username, password);
  },
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
