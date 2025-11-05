# NOTE: Visual testing moved to Playwright tests (src/tests/visual.spec.ts)
# Use npm run test:visual instead of BDD for visual regression testing
# These scenarios are disabled in BDD and excluded by @visual-disabled tag

@visual-disabled @ignore
Feature: Visual baselines (DISABLED - Use Playwright visual tests)

  Background:
    Given I am logged in and on the Dashboard for visuals

  @visual-disabled
  Scenario: Dashboard page matches baseline (DISABLED)
    # Visual testing not supported in Cucumber - use Playwright tests
    Then the full page should match the baseline "dashboard"

  @visual-disabled @regression
  Scenario: Quick Actions widget looks correct (DISABLED)
    # Visual testing not supported in Cucumber - use Playwright tests
    Then the widget "Quick Actions" should match the baseline

