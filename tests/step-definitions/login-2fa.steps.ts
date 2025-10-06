import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AuthPage } from '../../pages/authPage';
import { get2FACode } from '../../utils/2fa';

let authPage: AuthPage;

Given('I am on the login page', async function () {
  const page = this.page;
  authPage = new AuthPage(page);
  await page.goto('data:text/html,<html><body><form><input id="username" placeholder="Email"><input id="password" type="password" placeholder="Password"><button id="login-button">Login</button></form><div class="error-message" style="display:none;"></div></body></html>');
});

When('I sign in with {string} and {string}', async function (email: string, password: string) {
  await authPage.login(email, password);
});

When('I submit the 2FA code', async function () {
  const code = await get2FACode('test@example.com');
  await authPage.enterTwoFactorCode(code);
});

When('I submit an invalid 2FA code {string}', async function (code: string) {
  await authPage.enterTwoFactorCode(code);
});

When('I submit an expired 2FA code', async function () {
  await authPage.enterTwoFactorCode('654321');
});

Then('I should see the dashboard', async function () {
  const page = this.page;
  await expect(page.locator('body')).toContainText('dashboard');
});

Then('I should see an {string} error', async function (errorType: string) {
  let expectedErrorText: string;
  
  switch (errorType) {
    case 'invalid credentials':
      expectedErrorText = 'INVALID_CREDENTIALS';
      break;
    case 'invalid 2FA code':
      expectedErrorText = 'CODE_INVALID';
      break;
    case 'expired 2FA code':
      expectedErrorText = 'CODE_EXPIRED';
      break;
    default:
      expectedErrorText = errorType;
  }
  
  const errorMessage = await authPage.getErrorMessage();
  expect(errorMessage).toContain(expectedErrorText);
});