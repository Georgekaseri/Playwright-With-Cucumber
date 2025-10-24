import { test } from '../../fixtures/test-fixtures';

test('user can log in to OrangeHRM', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login(process.env.USER_EMAIL!, process.env.USER_PASSWORD!);
  await loginPage.expectDashboard();
});