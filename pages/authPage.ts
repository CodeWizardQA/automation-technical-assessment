import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get usernameInput() { 
    return this.page.locator('input[name="email"], input#username, input[placeholder="Email"], input[placeholder="Username"], [data-testid="email-input"], [data-testid="username-input"]');
  }
  
  get passwordInput() { 
    return this.page.locator('input[type="password"], input#password, input[placeholder="Password"], [data-testid="password-input"]');
  }
  
  get loginButton() { 
    return this.page.locator('button[type="submit"], #login-button, [data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');
  }
  
  get twoFactorCodeInput() { 
    return this.page.locator('input[name="2fa-code"], input#two-factor-code, input[placeholder="Code"], [data-testid="2fa-input"], input[aria-label="Two Factor Code"]');
  }
  
  get twoFactorSubmitButton() { 
    return this.page.locator('button#two-factor-submit, [data-testid="2fa-submit-button"], button:has-text("Submit Code"), button:has-text("Verify")');
  }
  
  get resetPasswordLink() { 
    return this.page.locator('a:has-text("Forgot Password"), a:has-text("Reset Password"), #reset-password-link, [data-testid="reset-password-link"]');
  }
  
  get newPasswordInput() { 
    return this.page.locator('input#new-password, input[placeholder="New Password"], [data-testid="new-password-input"]');
  }
  
  get confirmPasswordInput() { 
    return this.page.locator('input#confirm-password, input[placeholder="Confirm Password"], [data-testid="confirm-password-input"]');
  }
  
  get resetPasswordButton() { 
    return this.page.locator('button#reset-password-button, [data-testid="reset-password-button"], button:has-text("Reset Password")');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.waitForSelector('input[name="email"], input#username, input[placeholder="Email"], input[placeholder="Username"], [data-testid="email-input"], [data-testid="username-input"]', { state: 'visible' });
    await this.usernameInput.fill(username);
    await this.page.waitForSelector('input[type="password"], input#password, input[placeholder="Password"], [data-testid="password-input"]', { state: 'visible' });
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async enterTwoFactorCode(code: string): Promise<void> {
    await this.page.waitForSelector('input[name="2fa-code"], input#two-factor-code, input[placeholder="Code"], [data-testid="2fa-input"], input[aria-label="Two Factor Code"]', { state: 'visible' });
    await this.twoFactorCodeInput.fill(code);
    await this.twoFactorSubmitButton.click();
  }

  async resetPassword(newPassword: string, confirmPassword: string): Promise<void> {
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.resetPasswordButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.page.waitForSelector('.error-message, [data-testid="error-message"], [role="alert"]', { state: 'visible', timeout: 5000 });
      const errorElement = this.page.locator('.error-message, [data-testid="error-message"], [role="alert"]');
      if (await errorElement.isVisible()) {
        return await errorElement.textContent();
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  async isLockedOut(): Promise<boolean> {
    try {
      await this.page.waitForSelector('.lockout-message, [data-testid="lockout-message"], [data-testid="blocked-message"]', { state: 'visible', timeout: 5000 });
      const lockoutElement = this.page.locator('.lockout-message, [data-testid="lockout-message"], [data-testid="blocked-message"]');
      return await lockoutElement.isVisible();
    } catch (e) {
      return false;
    }
  }
}