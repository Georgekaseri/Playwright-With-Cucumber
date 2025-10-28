import * as dotenv from 'dotenv';
dotenv.config();

export const TEST_ENV = {
  baseURL: process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  username: process.env.ORANGEHRM_USERNAME || '',
  password: process.env.ORANGEHRM_PASSWORD || '',
};
