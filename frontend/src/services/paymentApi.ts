import type { ApiResult, Payment, Order } from '@/types';
import { randomDelay } from '@/utils/helpers';
import { orders } from '@/mock/orders';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string): ApiResult<never> {
  return { success: false, data: null, message };
}

export const paymentApi = {
  async getPayment(orderId: string): Promise<ApiResult<Payment>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.payment) return fail('Không tìm thấy thông tin thanh toán');
    return ok(order.payment);
  },

  // Mock: simulate payment success (dev only)
  async simulatePayment(orderId: string): Promise<ApiResult<Payment>> {
    await randomDelay(500, 1000);
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.payment) return fail('Không tìm thấy đơn hàng');
    order.payment.status = 'SUCCESS';
    order.payment.paidAt = new Date().toISOString();
    order.payment.transactionId = `VQR-DEMO-${Date.now()}`;
    if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
      order.status = 'PAID';
      order.timeline.push({ status: 'PAID', label: 'Thanh toán', timestamp: new Date().toISOString() });
    }
    return ok(order.payment, 'Giả lập thanh toán thành công');
  },

  async confirmPayment(orderId: string): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return fail('Không tìm thấy đơn hàng');
    if (order.payment) {
      order.payment.status = 'SUCCESS';
      order.payment.paidAt = new Date().toISOString();
    }
    return ok(order, 'Xác nhận thanh toán thành công');
  },

  async getAllPayments(filter?: { status?: string; method?: string }): Promise<ApiResult<{ order: Order; payment: Payment }[]>> {
    await randomDelay();
    let result = orders.filter((o) => o.payment).map((o) => ({ order: o, payment: o.payment! }));
    if (filter?.status) result = result.filter((r) => r.payment.status === filter.status);
    if (filter?.method) result = result.filter((r) => r.payment.method === filter.method);
    return ok(result);
  },
};
