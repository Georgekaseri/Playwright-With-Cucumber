import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TEST_ENV } from '../config/test-env';

test.describe('Auth', () => {
  test('can login and reach Dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);

    await login.goto();
    await login.login(TEST_ENV.username, TEST_ENV.password);
    await dash.assertLoaded();
  });
});
