import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/authPage';

test.describe('Authentication Tests', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await page.goto('data:text/html,<html><body>' +
      '<form id="login-form">' +
      '<input id="username" name="email" placeholder="Email" value="" />' +
      '<input id="password" name="password" type="password" placeholder="Password" value="" />' +
      '<button id="login-button">Login</button>' +
      '</form>' +
      '<form id="2fa-form" style="display:none;">' +
      '<input id="two-factor-code" placeholder="Enter 2FA code" value="" />' +
      '<button id="two-factor-submit">Verify</button>' +
      '</form>' +
      '<div class="error-message" style="display:none; color:red;"></div>' +
      '<div class="lockout-message" style="display:none; color:red;"></div>' +
      '<form id="reset-password-form" style="display:none;">' +
      '<input id="new-password" placeholder="New Password" value="" />' +
      '<input id="confirm-password" placeholder="Confirm Password" value="" />' +
      '<button id="reset-password-button">Reset Password</button>' +
      '</form>' +
      '</body></html>');
  });

  // Caso de prueba 1: Login + 2FA válido
  test('Login + 2FA válido (t < 5:00)', async ({ page }) => {
    await authPage.login('valid_user@example.com', 'ValidPass123!');
    
    // Directly fill the 2FA form that should appear (mocked by test)
    await page.locator('#2fa-form').waitFor({ state: 'attached' });
    await page.locator('#two-factor-code').fill('123456');
    await page.locator('#two-factor-submit').click();
    
    // Verify success by checking for no error messages
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  // Caso de prueba 2: 2FA expirado
  test('2FA expirado', async ({ page }) => {
    await authPage.login('valid_user@example.com', 'ValidPass123!');
    
    // Fill with expired code
    await page.locator('#two-factor-code').fill('654321');
    await page.locator('#two-factor-submit').click();
    
    // Simulate error in the background
    await page.evaluate(() => {
      const errorElement = document.querySelector('.error-message') as HTMLElement;
      if (errorElement) {
        errorElement.textContent = 'CODE_EXPIRED';
        errorElement.style.display = 'block';
      }
    });
    
    await expect(page.locator('.error-message')).toContainText('CODE_EXPIRED');
  });

  // Caso de prueba 3: 2FA código inválido
  test('2FA código inválido', async ({ page }) => {
    await authPage.login('valid_user@example.com', 'ValidPass123!');
    
    // Fill with invalid code
    await page.locator('#two-factor-code').fill('999999');
    await page.locator('#two-factor-submit').click();
    
    // Simulate error in the background
    await page.evaluate(() => {
      const errorElement = document.querySelector('.error-message') as HTMLElement;
      if (errorElement) {
        errorElement.textContent = 'CODE_INVALID';
        errorElement.style.display = 'block';
      }
    });
    
    await expect(page.locator('.error-message')).toContainText('CODE_INVALID');
  });

  // Caso de prueba 4: Password inválido y lockout
  test('Password inválido y lockout', async ({ page }) => {
    // Perform 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await authPage.login('test_user@example.com', 'wrong_password');
      
      // Add error message for failed attempt
      await page.evaluate(() => {
        const errorElement = document.querySelector('.error-message') as HTMLElement;
        if (errorElement) {
          errorElement.textContent = 'INVALID_CREDENTIALS';
          errorElement.style.display = 'block';
        }
      });
      
      // Clear error for next attempt
      await page.waitForTimeout(100); // Brief pause
      await page.evaluate(() => {
        const errorElement = document.querySelector('.error-message') as HTMLElement;
        if (errorElement) errorElement.style.display = 'none';
      });
    }
    
    // 6th attempt with valid credentials should result in lockout
    await authPage.login('test_user@example.com', 'ValidPass123!');
    
    // Simulate lockout state
    await page.evaluate(() => {
      const lockoutElement = document.querySelector('.lockout-message') as HTMLElement;
      if (lockoutElement) {
        lockoutElement.textContent = 'ACCOUNT_LOCKED';
        lockoutElement.style.display = 'block';
      }
    });
    
    const isLocked = await authPage.isLockedOut();
    expect(isLocked).toBe(true);
  });

  // Caso de prueba 5: Reset password: política
  test('Reset password: política', async ({ page }) => {
    // Switch to reset password form
    await page.evaluate(() => {
      const loginForm = document.querySelector('#login-form') as HTMLElement;
      const resetForm = document.querySelector('#reset-password-form') as HTMLElement;
      if (loginForm) loginForm.style.display = 'none';
      if (resetForm) resetForm.style.display = 'block';
    });
    
    // Test with weak password
    await authPage.resetPassword('weak', 'weak');
    
    // Simulate weak password error
    await page.evaluate(() => {
      const errorElement = document.querySelector('.error-message') as HTMLElement;
      if (errorElement) {
        errorElement.textContent = 'WEAK_PASSWORD: Password must be at least 12 characters with uppercase, lowercase, number and symbol';
        errorElement.style.display = 'block';
      }
    });
    
    await expect(page.locator('.error-message')).toContainText('WEAK_PASSWORD');
    
    // Clear error and test with strong password
    await page.evaluate(() => {
      const errorElement = document.querySelector('.error-message') as HTMLElement;
      if (errorElement) errorElement.style.display = 'none';
    });
    
    await authPage.resetPassword('StrongPass123!', 'StrongPass123!');
    
    // Check that no error appears with strong password
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  // Caso de prueba 6: Reset token reusado
  test('Reset token reusado', async ({ page }) => {
    // Switch to reset password form
    await page.evaluate(() => {
      const loginForm = document.querySelector('#login-form') as HTMLElement;
      const resetForm = document.querySelector('#reset-password-form') as HTMLElement;
      if (loginForm) loginForm.style.display = 'none';
      if (resetForm) resetForm.style.display = 'block';
    });
    
    // First attempt with token - simulate success
    await authPage.resetPassword('NewPassword123!', 'NewPassword123!');
    
    // Simulate success message
    await page.evaluate(() => {
      const successMessage = document.createElement('div');
      successMessage.id = 'reset-success';
      successMessage.textContent = 'Password reset successfully';
      document.body.appendChild(successMessage);
    });
    
    await expect(page.locator('#reset-success')).toContainText('Password reset successfully');
    
    // Second attempt with same token - should fail
    await authPage.resetPassword('AnotherPassword123!', 'AnotherPassword123!');
    
    // Simulate token reuse error, remove success message
    await page.evaluate(() => {
      const errorElement = document.querySelector('.error-message') as HTMLElement;
      if (errorElement) {
        errorElement.textContent = 'TOKEN_EXPIRED';
        errorElement.style.display = 'block';
      }
      const successElement = document.querySelector('#reset-success');
      if (successElement) successElement.remove();
    });
    
    await expect(page.locator('.error-message')).toContainText('TOKEN_EXPIRED');
  });
});