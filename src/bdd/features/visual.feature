# NOTE: Visual testing moved to Playwright tests (src/tests/visual.spec.ts)
# Use npm run test:visual instead of BDD for visual regression testing

@visual-disabled @ignore
Feature: Visual baselines (DISABLED - Use Playwright visual tests)

  Background:
    Given I am logged in and on the Dashboard for visuals

  Scenario: Dashboard page matches baseline (DISABLED)
    # Visual testing not supported in Cucumber - use Playwright tests
    Then the full page should match the baseline "dashboard"

  @regression
  Scenario: Quick Actions widget looks correct (DISABLED)
    # Visual testing not supported in Cucumber - use Playwright tests
    Then the widget "Quick Actions" should match the baseline

