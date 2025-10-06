import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }


  get subtotalElement() { 
    return this.page.locator('[data-testid="subtotal"], [data-cy="subtotal"], .subtotal, [aria-label="Subtotal"], .cart-subtotal');
  }
  
  get totalElement() { 
    return this.page.locator('[data-testid="total"], [data-cy="total"], .total, [aria-label="Total"], .cart-total');
  }
  
  get shippingElement() { 
    return this.page.locator('[data-testid="shipping"], [data-cy="shipping"], .shipping, [aria-label="Shipping"], .cart-shipping');
  }
  
  get couponInput() { 
    return this.page.locator('#coupon-input, [data-testid="coupon-input"], [data-cy="coupon-input"], input[placeholder="Enter Coupon"], input[placeholder="Discount Code"]');
  }
  
  get applyCouponButton() { 
    return this.page.locator('#apply-coupon-button, [data-testid="apply-coupon-button"], [data-cy="apply-coupon-button"], button:has-text("Apply Coupon"), button:has-text("Apply")');
  }
  
  get couponAppliedIndicator() { 
    return this.page.locator('[data-testid="coupon-applied"], [data-cy="coupon-applied"], .coupon-applied, .discount-applied, [role="status"]');
  }
  
  get discountElement() { 
    return this.page.locator('[data-testid="discount"], [data-cy="discount"], .discount, [aria-label="Discount"], .cart-discount');
  }
  
  get fraudBlockMessage() { 
    return this.page.locator('[data-testid="fraud-block-message"], [data-cy="fraud-block"], .fraud-block, .antifraud-block');
  }


  async applyCoupon(couponCode: string): Promise<void> {
    await this.page.waitForSelector('#coupon-input, [data-testid="coupon-input"], [data-cy="coupon-input"], input[placeholder="Enter Coupon"], input[placeholder="Discount Code"]', { state: 'visible' });
    await this.couponInput.fill(couponCode);
    await this.page.waitForSelector('#apply-coupon-button, [data-testid="apply-coupon-button"], [data-cy="apply-coupon-button"], button:has-text("Apply Coupon"), button:has-text("Apply")', { state: 'visible' });
    await this.applyCouponButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getSubtotal(): Promise<number> {
    // Esperar a que el elemento de subtotal esté disponible
    await this.page.waitForSelector('[data-testid="subtotal"], [data-cy="subtotal"], .subtotal, [aria-label="Subtotal"], .cart-subtotal', { state: 'visible' });
    
    const subtotalText = await this.subtotalElement.textContent();
    return parseFloat(subtotalText?.replace(/[^\d.-]/g, '') || '0');
  }

  async getTotal(): Promise<number> {
    // Esperar a que el elemento de total esté disponible
    await this.page.waitForSelector('[data-testid="total"], [data-cy="total"], .total, [aria-label="Total"], .cart-total', { state: 'visible' });
    
    const totalText = await this.totalElement.textContent();
    return parseFloat(totalText?.replace(/[^\d.-]/g, '') || '0');
  }

  async getShippingCost(): Promise<number> {
    // Esperar a que el elemento de shipping esté disponible
    await this.page.waitForSelector('[data-testid="shipping"], [data-cy="shipping"], .shipping, [aria-label="Shipping"], .cart-shipping', { state: 'visible' });
    
    const shippingText = await this.shippingElement.textContent();
    return parseFloat(shippingText?.replace(/[^\d.-]/g, '') || '0');
  }

  async getDiscount(): Promise<number> {
    // Esperar a that el elemento de descuento esté disponible
    await this.page.waitForSelector('[data-testid="discount"], [data-cy="discount"], .discount, [aria-label="Discount"], .cart-discount', { state: 'visible' });
    
    const discountText = await this.discountElement.textContent();
    return parseFloat(discountText?.replace(/[^\d.-]/g, '') || '0');
  }


  async isCouponApplied(): Promise<boolean> {
    try {
      // Esperar a que el indicador de cupón aplicado aparezca
      await this.page.waitForSelector('[data-testid="coupon-applied"], [data-cy="coupon-applied"], .coupon-applied, .discount-applied, [role="status"]', { state: 'visible', timeout: 5000 });
      return await this.couponAppliedIndicator.isVisible();
    } catch (e) {
      // Si no aparece indicador en el tiempo, devolver falso
      return false;
    }
  }


  async isFraudBlocked(): Promise<boolean> {
    try {
      // Esperar a que aparezca mensaje de bloqueo de fraude
      await this.page.waitForSelector('[data-testid="fraud-block-message"], [data-cy="fraud-block"], .fraud-block, .antifraud-block', { state: 'visible', timeout: 5000 });
      return await this.fraudBlockMessage.isVisible();
    } catch (e) {
      // Si no aparece mensaje de bloqueo, devolver falso
      return false;
    }
  }
}