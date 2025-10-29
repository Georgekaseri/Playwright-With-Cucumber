@login
Feature: Login functionality

  As an OrangeHRM user
  I want to log in with credentials
  So that I can access the system or receive appropriate feedback

  Background:
    Given I am on the OrangeHRM login page

  @smoke @positive
  Scenario: Login with valid admin credentials
    When I login with valid credentials
    Then I should see the dashboard

  @negative @regression
  Scenario: Login with invalid username
    When I login with username "InvalidUser" and password "admin123"
    Then I should see an error message

  @negative @regression
  Scenario: Login with invalid password
    When I login with username "Admin" and password "wrongpassword"
    Then I should see an error message

  @negative @regression
  Scenario: Login with empty credentials
    When I login with username "" and password ""
    Then I should see validation errors