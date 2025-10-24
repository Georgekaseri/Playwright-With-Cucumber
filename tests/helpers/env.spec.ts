import { test } from '@playwright/test';

test('prints env', async () => {
  console.log('BASE_URL =', process.env.BASE_URL);
  console.log('USER_EMAIL =', process.env.USER_EMAIL);
});
