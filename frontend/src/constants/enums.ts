// Order lifecycle
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  PACKING: 'PACKING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Hoàn trả',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning-light text-warning-dark',
  CONFIRMED: 'bg-moss-100 text-moss-600',
  PAID: 'bg-moss-100 text-moss-600',
  PACKING: 'bg-agarwood-100 text-agarwood-700',
  SHIPPING: 'bg-agarwood-100 text-agarwood-700',
  COMPLETED: 'bg-success-light text-success-dark',
  CANCELLED: 'bg-error-light text-error-dark',
  RETURNED: 'bg-error-light text-error-dark',
};

// Payment
export const PAYMENT_METHOD = {
  COD: 'COD',
  VIETQR: 'VIETQR',
  PAYPAL: 'PAYPAL',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  VIETQR: 'Chuyển khoản qua VietQR',
  PAYPAL: 'PayPal',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  EXPIRED: 'Hết hạn',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Hoàn tiền một phần',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning-light text-warning-dark',
  SUCCESS: 'bg-success-light text-success-dark',
  FAILED: 'bg-error-light text-error-dark',
  EXPIRED: 'bg-error-light text-error-dark',
  REFUNDED: 'bg-error-light text-error-dark',
  PARTIALLY_REFUNDED: 'bg-warning-light text-warning-dark',
};

// Sales channel
export const SALES_CHANNEL = {
  D2C: 'D2C',
  B2B: 'B2B',
  O2O: 'O2O',
} as const;

export const SALES_CHANNEL_LABELS: Record<string, string> = {
  D2C: 'Bán lẻ trực tiếp',
  B2B: 'Bán sỉ / Doanh nghiệp',
  O2O: 'Đặt lịch showroom',
};

// Shipment
export const SHIPMENT_STATUS = {
  CREATED: 'CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNING: 'RETURNING',
  RETURNED: 'RETURNED',
} as const;

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Đã tạo vận đơn',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao đến',
  DELIVERED: 'Đã giao thành công',
  FAILED: 'Giao thất bại',
  RETURNING: 'Đang hoàn trả',
  RETURNED: 'Đã hoàn trả',
};

export const COD_STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  COLLECTED: 'COLLECTED',
  SETTLED: 'SETTLED',
} as const;

export const COD_STATUS_LABELS: Record<string, string> = {
  NONE: 'Không áp dụng',
  PENDING: 'Chờ thu tiền',
  COLLECTED: 'Đã thu tiền',
  SETTLED: 'Đã đối soát',
};

// Returns
export const RETURN_STATUS = {
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ITEM_RECEIVED: 'ITEM_RECEIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const RETURN_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Đã gửi yêu cầu',
  VERIFIED: 'Đã kiểm tra',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
  ITEM_RECEIVED: 'Đã nhận hàng hoàn',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

export const RETURN_REASON = {
  DAMAGED_IN_TRANSIT: 'DAMAGED_IN_TRANSIT',
  WRONG_ITEM: 'WRONG_ITEM',
  NOT_AS_DESCRIBED: 'NOT_AS_DESCRIBED',
  OTHER: 'OTHER',
} as const;

export const RETURN_REASON_LABELS: Record<string, string> = {
  DAMAGED_IN_TRANSIT: 'Hàng hỏng trong vận chuyển',
  WRONG_ITEM: 'Nhầm hàng',
  NOT_AS_DESCRIBED: 'Không đúng mô tả',
  OTHER: 'Lý do khác',
};

export const RESOLUTION = {
  EXCHANGE: 'EXCHANGE',
  REFUND_PARTIAL: 'REFUND_PARTIAL',
  REFUND_FULL: 'REFUND_FULL',
} as const;

export const RESOLUTION_LABELS: Record<string, string> = {
  EXCHANGE: 'Đổi hàng',
  REFUND_PARTIAL: 'Hoàn tiền một phần',
  REFUND_FULL: 'Hoàn tiền toàn phần',
};

// B2B quote request
export const REQUEST_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
} as const;

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xử lý',
  QUOTED: 'Đã báo giá',
  ACCEPTED: 'Khách đồng ý',
  REJECTED: 'Khách từ chối',
  CLOSED: 'Đã đóng',
};

export const B2B_TYPE = {
  TEA_HOUSE: 'TEA_HOUSE',
  ZEN_MONASTERY: 'ZEN_MONASTERY',
  SPA: 'SPA',
  RESORT: 'RESORT',
  CORPORATE_GIFT: 'CORPORATE_GIFT',
  OTHER: 'OTHER',
} as const;

export const B2B_TYPE_LABELS: Record<string, string> = {
  TEA_HOUSE: 'Trà thất',
  ZEN_MONASTERY: 'Thiền viện',
  SPA: 'Spa',
  RESORT: 'Resort',
  CORPORATE_GIFT: 'Quà tặng doanh nghiệp',
  OTHER: 'Khác',
};

// Appointments
export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Không đến hẹn',
};

// Certifications
export const CERT_TYPE = {
  ORIGIN: 'ORIGIN',
  SMOKE_SAFETY: 'SMOKE_SAFETY',
  QUALITY: 'QUALITY',
  OTHER: 'OTHER',
} as const;

export const CERT_TYPE_LABELS: Record<string, string> = {
  ORIGIN: 'Nguồn gốc',
  SMOKE_SAFETY: 'An toàn khói nhang',
  QUALITY: 'Chất lượng',
  OTHER: 'Khác',
};

// Product status
export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  HIDDEN: 'HIDDEN',
} as const;

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang bán',
  HIDDEN: 'Đã ẩn',
};

// Discount
export const DISCOUNT_TYPE = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
} as const;

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  PERCENT: 'Theo phần trăm',
  FIXED: 'Số tiền cố định',
};

// Articles
export const ARTICLE_TYPE = {
  ABOUT: 'ABOUT',
  GUIDE: 'GUIDE',
  POLICY: 'POLICY',
} as const;

export const ARTICLE_TYPE_LABELS: Record<string, string> = {
  ABOUT: 'Giới thiệu',
  GUIDE: 'Cẩm nang',
  POLICY: 'Chính sách',
};

// User roles
export const USER_ROLE = {
  GUEST: 'GUEST',
  CUSTOMER: 'CUSTOMER',
  STAFF_WAREHOUSE: 'STAFF_WAREHOUSE',
  STAFF_CS: 'STAFF_CS',
  ADMIN: 'ADMIN',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  GUEST: 'Khách',
  CUSTOMER: 'Khách hàng',
  STAFF_WAREHOUSE: 'NV Kho & Đơn hàng',
  STAFF_CS: 'NV CSKH & Tư vấn',
  ADMIN: 'Quản lý',
};

// Fragility / safety levels 0-3
export const FRAGILITY_LABELS: Record<number, string> = {
  0: 'Bình thường',
  1: 'Dễ vỡ nhẹ',
  2: 'Dễ vỡ',
  3: 'Rất dễ vỡ',
};

export const FLAMMABILITY_LABELS: Record<number, string> = {
  0: 'Không cháy',
  1: 'Dễ cháy nhẹ',
  2: 'Dễ cháy',
  3: 'Rất dễ cháy',
};

// Order lifecycle transitions (valid next states from current)
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PAID', 'PACKING', 'CANCELLED'],
  PAID: ['PACKING'],
  PACKING: ['SHIPPING'],
  SHIPPING: ['COMPLETED', 'RETURNED'],
  COMPLETED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

// For COD orders, no PAID step
export const ORDER_TRANSITIONS_COD: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['SHIPPING'],
  SHIPPING: ['COMPLETED', 'RETURNED'],
  COMPLETED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

// Order timeline steps (for customer-facing display)
export const ORDER_TIMELINE_STEPS = [
  { status: 'PENDING', label: 'Đặt hàng', icon: 'ShoppingBag' },
  { status: 'CONFIRMED', label: 'Xác nhận', icon: 'CheckCircle' },
  { status: 'PAID', label: 'Thanh toán', icon: 'CreditCard' },
  { status: 'PACKING', label: 'Đóng gói', icon: 'Package' },
  { status: 'SHIPPING', label: 'Giao hàng', icon: 'Truck' },
  { status: 'COMPLETED', label: 'Hoàn tất', icon: 'CheckCircle' },
];

// COD timeline skips PAID
export const ORDER_TIMELINE_STEPS_COD = [
  { status: 'PENDING', label: 'Đặt hàng', icon: 'ShoppingBag' },
  { status: 'CONFIRMED', label: 'Xác nhận', icon: 'CheckCircle' },
  { status: 'PACKING', label: 'Đóng gói', icon: 'Package' },
  { status: 'SHIPPING', label: 'Giao hàng', icon: 'Truck' },
  { status: 'COMPLETED', label: 'Hoàn tất', icon: 'CheckCircle' },
];

// Showroom locations
export const SHOWROOMS = [
  { id: 'sr-hcm', name: 'Showroom TP. HCM', address: '12 Lý Tự Trọng, Phường Bến Nghé, TP. HCM', phone: '0283 829 4567' },
  { id: 'sr-hn', name: 'Showroom Hà Nội', address: '88 Trần Nhân Tông, Phường Cẩm Châu, Hà Nội', phone: '0243 722 1188' },
  { id: 'sr-dn', name: 'Showroom Đà Nẵng', address: '56 Bạch Đằng, Phường Hải Châu, Đà Nẵng', phone: '0236 388 9966' },
];

export const APPOINTMENT_SLOTS = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00',
];

// App config
export const APP_CONFIG = {
  brandName: 'Mộc Trầm',
  slogan: 'Hương thanh tịnh – Tâm an nhiên',
  supportPhone: '1900 6750',
  supportEmail: 'lienhe@moctram.vn',
  businessName: 'Công ty TNHH Mộc Trầm',
  businessAddress: '12 Lý Tự Trọng, Phường Bến Nghé, TP. HCM',
  businessTaxCode: '0301234567',
  freeShipThreshold: 500000,
  shippingFee: 35000,
};

// Use mock data by default
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
