# Visual Regression Testing Guide

## Overview

This project uses Playwright for visual regression testing with baseline snapshots stored in `src/__screenshots__/visual.spec.ts-snapshots/`.

## Key Commands

### Run Visual Tests

```bash
# Run all visual tests (Chromium only)
npm run test:visual:chromium

# Update all visual baselines
npm run test:visual:update

# Run visual tests with Playwright UI
npx playwright test --project=chromium --grep @visual --ui
```

### Update Baselines

```bash
# Update specific test baselines
npx playwright test src/tests/visual.spec.ts --project=chromium --update-snapshots

# Update all snapshots
npx playwright test --project=chromium --grep @visual --update-snapshots
```

## Environment Considerations

### Local Development (macOS)

- Creates snapshots with `-darwin` suffix
- Example: `dashboard-chromium-desktop-darwin.png`

### CI Environment (Linux Ubuntu)

- Creates snapshots with `-linux` suffix
- Example: `dashboard-chromium-desktop-linux.png`

### Required Baseline Files for CI

Ensure these files exist for GitHub Actions:

- `dashboard-chromium-desktop-linux.png`
- `quick-actions-widget-chromium-desktop-linux.png`
- `login-form-chromium-desktop-linux.png`

## Visual Test Structure

### Current Visual Tests

1. **Dashboard Page** (`@visual @smoke`)
   - Full page screenshot with authentication
   - Masked dynamic elements for stability

2. **Quick Actions Widget** (`@visual @regression`)
   - Specific component visual validation
   - Fallback selectors for reliability

3. **Login Form** (`@visual @smoke`)
   - Full page screenshot of login page
   - No authentication required

### Test Configuration

- **Browser**: Chromium only (baselines exist only for Chromium)
- **Viewport**: Desktop resolution
- **Animations**: Disabled for deterministic screenshots
- **Tolerance**: Configurable per test (2-30% pixel difference)

## Troubleshooting

### Missing Baseline Snapshots

If CI fails with "snapshot doesn't exist":

1. Run tests locally: `npm run test:visual:chromium`
2. Copy local snapshots to match CI naming convention
3. Commit and push baseline files

### Visual Differences

If tests fail due to UI changes:

1. Review actual vs expected in test results
2. If changes are intentional, update baselines:
   ```bash
   npm run test:visual:update
   git add src/__screenshots__/
   git commit -m "Update visual baselines for UI changes"
   ```

### Browser Compatibility

- Visual tests only run on Chromium
- Other browsers skip visual tests automatically
- Separate CI job ensures proper isolation

## Best Practices

### Creating New Visual Tests

1. Add test with `@visual` tag
2. Run locally to generate initial baseline
3. Create corresponding Linux baseline for CI
4. Commit both baseline versions

### Maintaining Baselines

- Review visual changes carefully before updating baselines
- Use consistent test data and authentication
- Mask dynamic content (timestamps, user-specific data)
- Test in both local and CI environments

### CI Integration

- Dedicated `visual-tests` job in GitHub Actions
- Runs only on Chromium with Linux baselines
- Artifacts uploaded for manual review
- Fails fast if baselines missing

## File Locations

- **Test files**: `src/tests/visual.spec.ts`
- **Baseline snapshots**: `src/__screenshots__/visual.spec.ts-snapshots/`
- **CI configuration**: `.github/workflows/playwright-cucumber-enterprise.yml`
- **Package scripts**: `package.json` (test:visual:\* commands)
