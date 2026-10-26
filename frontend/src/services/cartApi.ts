import type { ApiResult, CartItem } from '@/types';
import { randomDelay } from '@/utils/helpers';

const CART_KEY = 'moctram_cart';
const SESSION_KEY = 'moctram_session_token';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string): ApiResult<never> {
  return { success: false, data: null, message };
}

function getCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getSessionToken(): string {
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

export const cartApi = {
  async getCart(): Promise<ApiResult<CartItem[]>> {
    await randomDelay(100, 200);
    return ok(getCart());
  },

  async addToCart(item: Omit<CartItem, 'quantity'> & { quantity: number }): Promise<ApiResult<CartItem[]>> {
    await randomDelay();
    const cart = getCart();
    const existing = cart.find((i) => i.skuId === item.skuId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    return ok(cart, 'Đã thêm vào giỏ hàng');
  },

  async updateQuantity(skuId: string, quantity: number): Promise<ApiResult<CartItem[]>> {
    await randomDelay(100, 200);
    const cart = getCart();
    const item = cart.find((i) => i.skuId === skuId);
    if (item) {
      if (quantity <= 0) {
        const idx = cart.indexOf(item);
        cart.splice(idx, 1);
      } else {
        item.quantity = quantity;
      }
    }
    saveCart(cart);
    return ok(cart);
  },

  async removeItem(skuId: string): Promise<ApiResult<CartItem[]>> {
    await randomDelay(100, 200);
    const cart = getCart().filter((i) => i.skuId !== skuId);
    saveCart(cart);
    return ok(cart, 'Đã xóa sản phẩm');
  },

  async clearCart(): Promise<ApiResult<null>> {
    saveCart([]);
    return ok(null, 'Đã xóa giỏ hàng');
  },

  async mergeCart(): Promise<ApiResult<CartItem[]>> {
    await randomDelay();
    // In mock mode, cart is already in localStorage
    return ok(getCart());
  },

  // Server calculates totals (mock simulates server-side calc)
  async getCartTotals(items: CartItem[]): Promise<ApiResult<{ subtotal: number; shippingFee: number; discount: number; total: number }>> {
    await randomDelay(100, 200);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 500000 ? 0 : 35000;
    return ok({ subtotal, shippingFee, discount: 0, total: subtotal + shippingFee });
  },
};
