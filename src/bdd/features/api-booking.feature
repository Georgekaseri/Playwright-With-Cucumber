@api @day04
Feature: API Booking Management
  As a test automation engineer
  I want to test booking API functionality
  So that I can ensure API reliability for day04 integration

  Background:
    Given I have access to the booking API
    And I can create valid booking requests

  @smoke @api
  Scenario: Create booking with George Kaseri data
    Given I have a booking request for George Kaseri
    When I submit the booking request to the API
    Then the booking should be created successfully
    And the response should contain a valid booking ID
    And the booking details should match the request data

  @regression @api
  Scenario: Retrieve created booking
    Given I have created a booking for George Kaseri
    When I retrieve the booking by ID
    Then the booking details should be returned correctly
    And all booking fields should match the original request

  @api @error-handling
  Scenario: Handle invalid booking data
    Given I have an invalid booking request
    When I submit the invalid booking request
    Then the API should reject the request
    And an appropriate error should be returned

  @api @performance
  Scenario: API response time validation
    Given I have a valid booking request
    When I submit the booking request
    Then the API should respond within 5 seconds
    And the response should be successful

  @api @health
  Scenario: Verify API service availability
    Given the booking service is running
    When I check the API health endpoint
    Then the service should be available
    And return a healthy status