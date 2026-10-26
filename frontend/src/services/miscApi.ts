import type { ApiResult, Coupon, Article, User } from '@/types';
import { randomDelay, generateId } from '@/utils/helpers';
import { coupons, articles } from '@/mock/orders';
import { users } from '@/mock/orders';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string): ApiResult<never> {
  return { success: false, data: null, message };
}

export const shippingApi = {
  async createShipment(data: { orderId: string; carrier: string }): Promise<ApiResult<{ trackingCode: string }>> {
    await randomDelay();
    const trackingCode = `${data.carrier.toUpperCase()}-DEMO-${Date.now().toString().slice(-6)}`;
    return ok({ trackingCode }, 'Tạo vận đơn thành công');
  },

  async getShipments() {
    await randomDelay();
    // Derived from orders
    return ok([]);
  },
};

export const couponApi = {
  async validateCoupon(code: string, subtotal: number): Promise<ApiResult<{ valid: boolean; discount: number; coupon?: Coupon }>> {
    await randomDelay();
    const coupon = coupons.find((c) => c.code === code && c.isActive);
    if (!coupon) return fail('Mã giảm giá không hợp lệ');
    if (subtotal < coupon.minOrder) return fail(`Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')} ₫`);
    const now = new Date();
    if (new Date(coupon.validFrom) > now || new Date(coupon.validUntil) < now) return fail('Mã giảm giá đã hết hạn');
    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = Math.min(coupon.maxDiscount, Math.round(subtotal * coupon.discountValue / 100));
    } else {
      discount = Math.min(coupon.maxDiscount, coupon.discountValue);
    }
    return ok({ valid: true, discount, coupon });
  },

  async getAllCoupons(): Promise<ApiResult<Coupon[]>> {
    await randomDelay();
    return ok([...coupons]);
  },

  async createCoupon(data: Partial<Coupon>): Promise<ApiResult<Coupon>> {
    await randomDelay();
    const coupon: Coupon = {
      id: generateId('cpn'),
      code: data.code || '',
      description: data.description || '',
      discountType: data.discountType || 'FIXED',
      discountValue: data.discountValue || 0,
      minOrder: data.minOrder || 0,
      maxDiscount: data.maxDiscount || 0,
      usageLimit: data.usageLimit || 100,
      usedCount: 0,
      validFrom: data.validFrom || new Date().toISOString(),
      validUntil: data.validUntil || '2025-12-31T23:59:59Z',
      isActive: true,
    };
    coupons.push(coupon);
    return ok(coupon, 'Tạo mã giảm giá thành công');
  },

  async toggleCoupon(id: string): Promise<ApiResult<Coupon>> {
    await randomDelay();
    const c = coupons.find((c) => c.id === id);
    if (!c) return fail('Không tìm thấy mã');
    c.isActive = !c.isActive;
    return ok(c, 'Cập nhật thành công');
  },
};

export const articleApi = {
  async getArticles(type?: string): Promise<ApiResult<Article[]>> {
    await randomDelay();
    let result = [...articles];
    if (type) result = result.filter((a) => a.type === type);
    return ok(result);
  },

  async getArticleBySlug(slug: string): Promise<ApiResult<Article>> {
    await randomDelay();
    const article = articles.find((a) => a.slug === slug);
    if (!article) return fail('Không tìm thấy bài viết');
    return ok(article);
  },
};

export const userApi = {
  async getAllUsers(): Promise<ApiResult<User[]>> {
    await randomDelay();
    return ok([...users]);
  },

  async createUser(data: { email: string; fullName: string; phone: string; role: string }): Promise<ApiResult<User>> {
    await randomDelay();
    const user: User = {
      id: generateId('user'),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role as User['role'],
      isActive: true,
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return ok(user, 'Tạo người dùng thành công');
  },

  async toggleUserStatus(id: string): Promise<ApiResult<User>> {
    await randomDelay();
    const u = users.find((u) => u.id === id);
    if (!u) return fail('Không tìm thấy người dùng');
    u.isActive = !u.isActive;
    return ok(u, 'Cập nhật thành công');
  },
};
