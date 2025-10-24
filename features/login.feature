Feature: OrangeHRM Login

  Scenario: Successful login
    Given I open the OrangeHRM login page
    When I login with valid credentials
    Then I should see the Dashboard page
    And the page should have no serious accessibility issues
