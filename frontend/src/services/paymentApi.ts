import type { ApiResult, Payment, Order } from '@/types';
import { randomDelay } from '@/utils/helpers';
import { orders } from '@/mock/orders';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> { return { success: true, data, message }; }
function fail(message: string): ApiResult<never> { return { success: false, data: null, message }; }

export const paymentApi = {
  async getPayment(orderId: string): Promise<ApiResult<Payment>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.payment) return fail('Không tìm thấy thông tin thanh toán');
    return ok(order.payment);
  },

  // Không tự tạo giao dịch thành công từ frontend. Cần tích hợp cổng thanh toán và xác minh chữ ký ở backend.
  async simulatePayment(_orderId: string): Promise<ApiResult<Payment>> {
    return fail('Thanh toán mô phỏng đã bị tắt để tránh ghi nhận giao dịch giả. Hãy tích hợp cổng thanh toán và xác minh tại backend.');
  },

  async confirmPayment(_orderId: string): Promise<ApiResult<Order>> {
    return fail('Frontend không được tự xác nhận thanh toán. Trạng thái chỉ được cập nhật sau khi backend xác minh callback/webhook từ cổng thanh toán.');
  },

  async getAllPayments(filter?: { status?: string; method?: string }): Promise<ApiResult<{ order: Order; payment: Payment }[]>> {
    await randomDelay();
    let result = orders.filter((o) => o.payment).map((o) => ({ order: o, payment: o.payment! }));
    if (filter?.status) result = result.filter((r) => r.payment.status === filter.status);
    if (filter?.method) result = result.filter((r) => r.payment.method === filter.method);
    return ok(result, 'Dữ liệu hiện là mẫu giao diện, chưa phải dữ liệu đối soát từ cổng thanh toán.');
  },
};
