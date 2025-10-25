# Playwright-With-Cucumber

Lightweight Playwright + Cucumber example project.

## Quick start

Requirements:
- Node 18+ (project `engines` requires >=18)
- npm

Install:

```bash
npm ci
```

Run the BDD scenarios (build TypeScript first):

```bash
npm run bdd
```

Run Playwright tests (Playwright Test runner):

```bash
npm run test:playwright
```

Clean generated artifacts:

```bash
npm run clean
```

## Environment variables

- `BASE_URL` — base URL for the app under test (defaults to the OpenSource OrangeHRM demo).
- `USER_EMAIL` / `USER_PASSWORD` — credentials used by the login scenario.
- `A11Y_FAIL_ON` — control a11y strictness. Values: `critical` | `serious` | `none`. The `bdd` script currently sets this to `critical` by default.
- `A11Y_SKIP_DOMAINS` — comma-separated substrings to skip a11y assertions for external domains (defaults to `opensource-demo.orangehrmlive.com`). The step will still save axe JSON reports in `reports/a11y/`.

## Reports

- Cucumber HTML report: `reports/cucumber-report.html`
- Playwright HTML report: `reports/html/` (if using playwright test runner)
- Axe raw JSON: `reports/a11y/*.json`

## CI

A GitHub Actions workflow is included at `.github/workflows/bdd.yml`. It:
- installs dependencies
- installs Playwright browsers
- builds TypeScript
- runs the BDD scenarios
- uploads `reports/cucumber-report.html` and `reports/a11y/*` as build artifacts

## Notes

- The project intentionally skips (by default) axe assertions for the public OrangeHRM demo; set `A11Y_SKIP_DOMAINS` in CI if you run tests against your own environments and want strict a11y enforcement.
- Consider adding `eslint` / `prettier` and a `lint` script for consistency.
