import type { ApiResult, Order, ReturnRequest, QuoteRequest, ShowroomAppointment } from '@/types';
import { randomDelay, generateId, generateOrderCode } from '@/utils/helpers';
import { orders, returnRequests, quoteRequests, appointments } from '@/mock/orders';
import { APP_CONFIG } from '@/constants/enums';
import { couponApi } from '@/services/miscApi';
function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string, errors?: Record<string, string>): ApiResult<never> {
  return { success: false, data: null, message, errors };
}

export interface CreateOrderData {
  items: { skuId: string; productId: string; productName: string; productSlug: string; specLabel: string; image: string; price: number; quantity: number }[];
  shippingFullName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  paymentMethod: 'COD' | 'VIETQR' | 'PAYPAL';
  note?: string;
  couponCode?: string;
  privacyConsent: boolean;
  customerEmail?: string;
  customerName?: string;
}

export const orderApi = {
  async createOrder(data: CreateOrderData): Promise<ApiResult<Order>> {
    await randomDelay();
    if (!data.privacyConsent) return fail('Bạn phải đồng ý với chính sách bảo mật');
    
const subtotal = data.items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

const shippingFee =
  subtotal >= APP_CONFIG.freeShipThreshold
    ? 0
    : APP_CONFIG.shippingFee;

let discount = 0;
const couponCode = data.couponCode?.trim().toUpperCase();

if (couponCode) {
  const couponResult = await couponApi.validateCoupon(
    couponCode,
    subtotal
  );

  if (!couponResult.success || !couponResult.data?.valid) {
    return fail(
      couponResult.message || 'Mã giảm giá không hợp lệ'
    );
  }

  discount = couponResult.data.discount;
}

// Không để tổng tiền âm
discount = Math.min(discount, subtotal + shippingFee);

const total = subtotal + shippingFee - discount;


    const orderCode = generateOrderCode();
    const now = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem('moctram_user') || '{}');

    const order: Order = {
      id: generateId('order'),
      orderCode,
      userId: user.id || null,
      customerName: data.customerName || user.fullName || data.shippingFullName,
      customerPhone: data.shippingPhone,
      customerEmail: data.customerEmail || user.email || '',
      shippingFullName: data.shippingFullName,
      shippingPhone: data.shippingPhone,
      shippingProvince: data.shippingProvince,
      shippingWard: data.shippingWard,
      shippingDetail: data.shippingDetail,
      items: data.items.map((i, idx) => ({
        id: `oi-${Date.now()}-${idx}`,
        ...i,
        lineTotal: i.price * i.quantity,
      })),
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod: data.paymentMethod,
      payment: data.paymentMethod === 'COD'
        ? { id: generateId('pay'), method: 'COD', status: 'PENDING', amount: total }
        : data.paymentMethod === 'VIETQR'
        ? { id: generateId('pay'), method: 'VIETQR', status: 'PENDING', amount: total, transferContent: `MOC TRAM ${orderCode}`, expiresAt: new Date(Date.now() + 15 * 60000).toISOString() }
        : { id: generateId('pay'), method: 'PAYPAL', status: 'PENDING', amount: total },
      shipment: null,
      status: 'PENDING',
      timeline: [{ status: 'PENDING', label: 'Đặt hàng', timestamp: now }],
      salesChannel: 'D2C',
      couponCode: data.couponCode,
      note: data.note,
      privacyConsentAt: now,
      createdAt: now,
      updatedAt: now,
    };

    orders.push(order);
    return ok(order, 'Đã tạo đơn mẫu trên frontend. Cần API backend để lưu đơn hàng chính thức và giữ tồn kho an toàn.');
  },

  async getOrderByCode(orderCode: string, phone?: string): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.orderCode === orderCode);
    if (!order) return fail('Không tìm thấy đơn hàng');
    if (phone && order.customerPhone !== phone) return fail('Số điện thoại không khớp với đơn hàng');
    return ok(order);
  },

  async getMyOrders(): Promise<ApiResult<Order[]>> {
    await randomDelay();
    const user = JSON.parse(localStorage.getItem('moctram_user') || '{}');
    const myOrders = orders.filter((o) => o.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return ok(myOrders);
  },

  async getOrderById(id: string): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.id === id);
    if (!order) return fail('Không tìm thấy đơn hàng');
    return ok(order);
  },

  async getAllOrders(filter?: { status?: string; paymentMethod?: string; search?: string; page?: number; limit?: number }): Promise<ApiResult<{ items: Order[]; total: number; page: number; totalPages: number }>> {
    await randomDelay();
    let result = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter?.status) result = result.filter((o) => o.status === filter.status);
    if (filter?.paymentMethod) result = result.filter((o) => o.paymentMethod === filter.paymentMethod);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((o) => o.orderCode.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q));
    }
    const total = result.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const totalPages = Math.ceil(total / limit);
    const items = result.slice((page - 1) * limit, page * limit);
    return ok({ items, total, page, totalPages });
  },

  async updateOrderStatus(orderId: string, newStatus: string, note?: string): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return fail('Không tìm thấy đơn hàng');
    const transitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PACKING', 'CANCELLED'],
      PAID: ['PACKING', 'CANCELLED'],
      PACKING: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['COMPLETED'],
      COMPLETED: ['RETURNED'],
      CANCELLED: [],
      RETURNED: [],
    };
    if (!transitions[order.status]?.includes(newStatus)) {
      return fail(`Không thể chuyển trạng thái đơn từ ${order.status} sang ${newStatus}.`);
    }
    if (newStatus === 'PAID') {
      return fail('Không được đổi trạng thái đơn hàng thành PAID thủ công. Hãy xác minh thanh toán riêng.');
    }
    order.status = newStatus as Order['status'];
    order.updatedAt = new Date().toISOString();
    const labels: Record<string, string> = { PENDING: 'Đặt hàng', CONFIRMED: 'Xác nhận', PAID: 'Thanh toán', PACKING: 'Đóng gói', SHIPPING: 'Giao hàng', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy', RETURNED: 'Hoàn trả' };
    order.timeline.push({ status: newStatus, label: labels[newStatus] || newStatus, timestamp: new Date().toISOString(), note });
    return ok(order, 'Cập nhật trạng thái thành công (dữ liệu mẫu trên frontend).');
  },

  async createReturnRequest(data: { orderId: string; orderCode: string; reason: string; resolution: string; description: string; attachments: string[] }): Promise<ApiResult<ReturnRequest>> {
    await randomDelay();
    const user = JSON.parse(localStorage.getItem('moctram_user') || '{}');
    const ret: ReturnRequest = {
      id: generateId('ret'),
      requestCode: `RT${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.random().toString(36).slice(2, 4).toUpperCase()}`,
      orderId: data.orderId,
      orderCode: data.orderCode,
      userId: user.id || null,
      reason: data.reason as ReturnRequest['reason'],
      resolution: data.resolution as ReturnRequest['resolution'],
      description: data.description,
      attachments: data.attachments,
      status: 'SUBMITTED',
      timeline: [{ status: 'SUBMITTED', label: 'Đã gửi yêu cầu', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    returnRequests.push(ret);
    return ok(ret, 'Yêu cầu đổi trả đã được gửi');
  },

  async getAllReturnRequests(): Promise<ApiResult<ReturnRequest[]>> {
    await randomDelay();
    return ok([...returnRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },

  async updateReturnStatus(id: string, status: string, note?: string): Promise<ApiResult<ReturnRequest>> {
    await randomDelay();
    const ret = returnRequests.find((r) => r.id === id);
    if (!ret) return fail('Không tìm thấy yêu cầu');
    ret.status = status as ReturnRequest['status'];
    const labels: Record<string, string> = { SUBMITTED: 'Đã gửi yêu cầu', VERIFIED: 'Đã kiểm tra', APPROVED: 'Đã phê duyệt', REJECTED: 'Bị từ chối', ITEM_RECEIVED: 'Đã nhận hàng hoàn', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' };
    ret.timeline.push({ status, label: labels[status] || status, timestamp: new Date().toISOString(), note });
    return ok(ret, 'Cập nhật thành công');
  },
};
