import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { CONFIG } from "../../config/config";

Given("I am on the OrangeHRM login page", async function (this: CustomWorld) {
  await this.loginPage.goto();
});

When("I login with valid credentials", async function (this: CustomWorld) {
  await this.loginPage.login(CONFIG.username, CONFIG.password);
});

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
