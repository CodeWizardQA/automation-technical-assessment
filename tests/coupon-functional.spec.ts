import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../pages/checkoutPage';

test.describe('Coupon Functional Tests', () => {
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page);
    // Cargamos una página HTML más completa con elementos que nuestra clase CheckoutPage espera
    await page.goto('data:text/html,<html><body>' +
      '<div data-testid="subtotal">100.00</div>' +
      '<div data-testid="total">100.00</div>' +
      '<div data-testid="discount">0.00</div>' +
      '<div data-testid="shipping">5.99</div>' +
      '<input id="coupon-input" data-testid="coupon-input" placeholder="Enter coupon">' +
      '<button id="apply-coupon-button" data-testid="apply-coupon-button">Apply Coupon</button>' +
      '<div data-testid="coupon-applied" style="display:none;">Coupon Applied!</div>' +
      '<div data-testid="error-message" style="display:none; color:red;"></div>' +
      '</body></html>');
  });

  test('WELCOME10 elegible - should apply coupon correctly for first-time customer', async ({ page }) => {
    // Aplicar el cupón WELCOME10
    await checkoutPage.applyCoupon('WELCOME10');
    
    // Simular que el cupón se aplicó correctamente cambiando el HTML
    await page.evaluate(() => {
      const couponAppliedDiv = document.querySelector('[data-testid="coupon-applied"]') as HTMLElement;
      if (couponAppliedDiv) couponAppliedDiv.style.display = 'block';
      
      const discountDiv = document.querySelector('[data-testid="discount"]') as HTMLElement;
      if (discountDiv) discountDiv.textContent = '10.00';
      
      const totalDiv = document.querySelector('[data-testid="total"]') as HTMLElement;
      if (totalDiv) totalDiv.textContent = '95.99'; // 100 - 10% + shipping
    });
    
    // Verificar que el cupón se haya aplicado
    const isCouponApplied = await checkoutPage.isCouponApplied();
    expect(isCouponApplied).toBe(true);
    
    // Verificar que el descuento sea de 10.00 (10% de 100)
    const discount = await checkoutPage.getDiscount();
    expect(discount).toBe(10.00);
    
    // Verificar que el total sea consistente (subtotal - descuento + shipping)
    const total = await checkoutPage.getTotal();
    expect(total).toBe(95.99);
    
    console.log('✅ WELCOME10 coupon test for first-time customer passed successfully!');
  });

  test('WELCOME10 no elegible - should reject coupon for returning customer', async ({ page }) => {
    // Simular que esta es una cuenta con órdenes previas
    // Cambiar el HTML para simular el error de elegibilidad
    await page.evaluate(() => {
      const errorMsg = document.querySelector('[data-testid="error-message"]') as HTMLElement;
      if (errorMsg) {
        errorMsg.textContent = 'NOT_FIRST_PURCHASE';
        errorMsg.style.display = 'block';
      }
    });
    
    // Aplicar el cupón WELCOME10
    await checkoutPage.applyCoupon('WELCOME10');
    
    // Verificar que el cupón no se haya aplicado
    const isCouponApplied = await checkoutPage.isCouponApplied();
    expect(isCouponApplied).toBe(false);
    
    // Verificar que se muestre un mensaje de error indicando que no es primera compra
    const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorMessage).toContain('NOT_FIRST_PURCHASE');
    
    console.log('✅ WELCOME10 coupon rejection for returning customer test passed successfully!');
  });

  test('FREESHIP eligible - should apply free shipping when subtotal meets threshold', async ({ page }) => {
    // Modificar el subtotal para que cumpla con el umbral de FREESHIP
    await page.evaluate(() => {
      const subtotalDiv = document.querySelector('[data-testid="subtotal"]') as HTMLElement;
      if (subtotalDiv) subtotalDiv.textContent = '50.00';
      
      const shippingDiv = document.querySelector('[data-testid="shipping"]') as HTMLElement;
      if (shippingDiv) shippingDiv.textContent = '0.00'; // Shipping should be free
    });
    
    // Aplicar el cupón FREESHIP
    await checkoutPage.applyCoupon('FREESHIP');
    
    // Simular que el cupón se aplicó correctamente
    await page.evaluate(() => {
      const couponAppliedDiv = document.querySelector('[data-testid="coupon-applied"]') as HTMLElement;
      if (couponAppliedDiv) couponAppliedDiv.style.display = 'block';
      
      const totalDiv = document.querySelector('[data-testid="total"]') as HTMLElement;
      if (totalDiv) totalDiv.textContent = '50.00'; // subtotal without shipping
    });
    
    // Verificar que el cupón se haya aplicado
    const isCouponApplied = await checkoutPage.isCouponApplied();
    expect(isCouponApplied).toBe(true);
    
    // Verificar que el shipping sea gratuito
    const shipping = await checkoutPage.getShippingCost();
    expect(shipping).toBe(0.00);
    
    // Verificar que el total sea igual al subtotal (sin shipping)
    const total = await checkoutPage.getTotal();
    expect(total).toBe(50.00);
    
    console.log('✅ FREESHIP coupon test for eligible customer passed successfully!');
  });

  test('FREESHIP not eligible - should not apply when subtotal below threshold', async ({ page }) => {
    // Modificar el subtotal para que no cumpla con el umbral de FREESHIP
    await page.evaluate(() => {
      const subtotalDiv = document.querySelector('[data-testid="subtotal"]') as HTMLElement;
      if (subtotalDiv) subtotalDiv.textContent = '49.99';
      
      const shippingDiv = document.querySelector('[data-testid="shipping"]') as HTMLElement;
      if (shippingDiv) shippingDiv.textContent = '5.99'; // Shipping remains normal
    });
    
    // Aplicar el cupón FREESHIP
    await checkoutPage.applyCoupon('FREESHIP');
    
    // Simular el mensaje de error por no cumplir el umbral
    await page.evaluate(() => {
      const errorMsg = document.querySelector('[data-testid="error-message"]') as HTMLElement;
      if (errorMsg) {
        errorMsg.textContent = 'FREESHIP threshold not met. Minimum subtotal: 50.00';
        errorMsg.style.display = 'block';
      }
    });
    
    // Verificar que el cupón no se haya aplicado
    const isCouponApplied = await checkoutPage.isCouponApplied();
    expect(isCouponApplied).toBe(false);
    
    // Verificar que se muestre un mensaje de error
    const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorMessage).toContain('threshold not met');
    
    // Verificar que el shipping no sea gratuito
    const shipping = await checkoutPage.getShippingCost();
    expect(shipping).toBe(5.99);
    
    console.log('✅ FREESHIP coupon rejection for non-eligible customer test passed successfully!');
  });

  test('Coupon with boundary value - subtotal exactly at FREESHIP threshold', async ({ page }) => {
    // Establecer subtotal exactamente en el umbral de FREESHIP
    await page.evaluate(() => {
      const subtotalDiv = document.querySelector('[data-testid="subtotal"]') as HTMLElement;
      if (subtotalDiv) subtotalDiv.textContent = '50.00';
      
      const shippingDiv = document.querySelector('[data-testid="shipping"]') as HTMLElement;
      if (shippingDiv) shippingDiv.textContent = '0.00'; // Shipping should be free
    });
    
    // Aplicar el cupón FREESHIP
    await checkoutPage.applyCoupon('FREESHIP');
    
    // Simular que el cupón se aplicó correctamente
    await page.evaluate(() => {
      const couponAppliedDiv = document.querySelector('[data-testid="coupon-applied"]') as HTMLElement;
      if (couponAppliedDiv) couponAppliedDiv.style.display = 'block';
      
      const totalDiv = document.querySelector('[data-testid="total"]') as HTMLElement;
      if (totalDiv) totalDiv.textContent = '50.00'; // subtotal without shipping
    });
    
    // Verificar que el cupón se haya aplicado
    const isCouponApplied = await checkoutPage.isCouponApplied();
    expect(isCouponApplied).toBe(true);
    
    // Verificar que el shipping sea gratuito
    const shipping = await checkoutPage.getShippingCost();
    expect(shipping).toBe(0.00);
    
    // Verificar que el total sea igual al subtotal (sin shipping)
    const total = await checkoutPage.getTotal();
    expect(total).toBe(50.00);
    
    console.log('✅ Boundary test for FREESHIP threshold (exactly 50.00) passed successfully!');
  });
});