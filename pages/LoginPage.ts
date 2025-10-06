import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectores usando accesibilidad
  get emailInput() { 
    return this.page.getByRole('textbox', { name: /email|username/i }); 
  }
  
  get passwordInput() { 
    return this.page.getByRole('textbox', { name: /password/i }); 
  }
  
  get loginButton() { 
    return this.page.getByRole('button', { name: /sign in|login/i }); 
  }
  
  get twoFAInput() { 
    return this.page.getByRole('textbox', { name: /2fa code|code|verification/i }); 
  }
  
  get submitCodeButton() { 
    return this.page.getByRole('button', { name: /verify code|submit/i }); 
  }
  
  get errorMessage() { 
    return this.page.getByRole('alert').or(this.page.locator('.error-message'));
  }

  // Métodos de interacción
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async submit2FACode(code: string) {
    await this.twoFAInput.fill(code);
    await this.submitCodeButton.click();
  }

  async getErrorMessageText() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }
}