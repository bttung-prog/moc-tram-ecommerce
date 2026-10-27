import type { User, Order, ReturnRequest, QuoteRequest, ShowroomAppointment, Coupon, Article, InventoryBatch, InventoryMovement } from '@/types';

export const users: User[] = [
  {
    id: 'user-001',
    email: 'annguyen@email.com',
    fullName: 'Nguyễn Thị An',
    phone: '0901234567',
    role: 'CUSTOMER',
    isActive: true,
    addresses: [
      { id: 'addr-001', fullName: 'Nguyễn Thị An', phone: '0901234567', province: 'TP. Hồ Chí Minh', ward: 'Phường Bến Nghé', detail: '12 Lý Tự Trọng, căn hộ 502', isDefault: true },
    ],
    createdAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 'user-002',
    email: 'binhtran@email.com',
    fullName: 'Trần Văn Bình',
    phone: '0912345678',
    role: 'CUSTOMER',
    isActive: true,
    addresses: [
      { id: 'addr-002', fullName: 'Trần Văn Bình', phone: '0912345678', province: 'Hà Nội', ward: 'Phường Cẩm Châu', detail: '88 Trần Nhân Tông', isDefault: true },
    ],
    createdAt: '2025-07-15T10:00:00Z',
  },
  {
    id: 'user-admin',
    email: 'admin@moctram.vn',
    fullName: 'Phạm Quản Trị',
    phone: '0987654321',
    role: 'ADMIN',
    isActive: true,
    addresses: [],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-warehouse',
    email: 'kho@moctram.vn',
    fullName: 'Hoàng Văn Kho',
    phone: '0977123456',
    role: 'STAFF_WAREHOUSE',
    isActive: true,
    addresses: [],
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'user-cs',
    email: 'cskh@moctram.vn',
    fullName: 'Đỗ Thị Chăm',
    phone: '0966789012',
    role: 'STAFF_CS',
    isActive: true,
    addresses: [],
    createdAt: '2025-03-01T00:00:00Z',
  },
];

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => iso(new Date(now.getTime() - n * 86400000));
const hoursAgo = (n: number) => iso(new Date(now.getTime() - n * 3600000));

export const orders: Order[] = [
  {
    id: 'order-001',
    orderCode: 'MT251003A7K2',
    userId: 'user-001',
    customerName: 'Nguyễn Thị An',
    customerPhone: '0901234567',
    customerEmail: 'annguyen@email.com',
    shippingFullName: 'Nguyễn Thị An',
    shippingPhone: '0901234567',
    shippingProvince: 'TP. Hồ Chí Minh',
    shippingWard: 'Phường Bến Nghé',
    shippingDetail: '12 Lý Tự Trọng, căn hộ 502',
    items: [
      { id: 'oi-001', productId: 'prod-001', productName: 'Nhang nụ trầm hương Khánh Hòa', productSlug: 'nhang-nu-tram-huong-khanh-hoa', skuId: 'sku-001-a', specLabel: 'Hộp 50 nụ', image: '/images/products/prod-001.jpg', price: 185000, quantity: 2, lineTotal: 370000 },
      { id: 'oi-002', productId: 'prod-006', productName: 'Lư xông gốm Thanh Hà', productSlug: 'lu-xong-gom-thanh-ha', skuId: 'sku-006-a', specLabel: 'Màu nâu trầm', image: '/images/products/prod-006.jpg', price: 280000, quantity: 1, lineTotal: 280000 },
    ],
    subtotal: 650000,
    shippingFee: 0,
    discount: 0,
    total: 650000,
    paymentMethod: 'VIETQR',
    payment: { id: 'pay-001', method: 'VIETQR', status: 'SUCCESS', amount: 650000, transactionId: 'VQR-DEMO-001', transferContent: 'MOC TRAM MT251003A7K2', paidAt: hoursAgo(20) },
    shipment: { id: 'ship-001', trackingCode: 'GHN-DEMO-001', carrier: 'GHN (demo)', status: 'IN_TRANSIT', codStatus: 'NONE', estimatedDelivery: daysAgo(-1), timeline: [
      { status: 'CREATED', label: 'Đã tạo vận đơn', timestamp: hoursAgo(18) },
      { status: 'PICKED_UP', label: 'Đã lấy hàng', timestamp: hoursAgo(16) },
      { status: 'IN_TRANSIT', label: 'Đang vận chuyển', timestamp: hoursAgo(10) },
    ] },
    status: 'SHIPPING',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: hoursAgo(22) },
      { status: 'CONFIRMED', label: 'Xác nhận', timestamp: hoursAgo(21) },
      { status: 'PAID', label: 'Thanh toán', timestamp: hoursAgo(20) },
      { status: 'PACKING', label: 'Đóng gói', timestamp: hoursAgo(18) },
      { status: 'SHIPPING', label: 'Giao hàng', timestamp: hoursAgo(10) },
    ],
    salesChannel: 'D2C',
    privacyConsentAt: hoursAgo(22),
    createdAt: hoursAgo(22),
    updatedAt: hoursAgo(10),
  },
  {
    id: 'order-002',
    orderCode: 'MT251002B3F9',
    userId: 'user-002',
    customerName: 'Trần Văn Bình',
    customerPhone: '0912345678',
    customerEmail: 'binhtran@email.com',
    shippingFullName: 'Trần Văn Bình',
    shippingPhone: '0912345678',
    shippingProvince: 'Hà Nội',
    shippingWard: 'Phường Cẩm Châu',
    shippingDetail: '88 Trần Nhân Tông',
    items: [
      { id: 'oi-003', productId: 'prod-012', productName: 'Chuỗi hạt trầm hương 108 hạt', productSlug: 'chuoi-hat-tram-huong-108-hat', skuId: 'sku-012-a', specLabel: 'Hạt 8mm', image: '/images/products/prod-012.jpg', price: 1850000, quantity: 1, lineTotal: 1850000 },
    ],
    subtotal: 1850000,
    shippingFee: 0,
    discount: 100000,
    total: 1750000,
    paymentMethod: 'COD',
    payment: { id: 'pay-002', method: 'COD', status: 'PENDING', amount: 1750000 },
    shipment: { id: 'ship-002', trackingCode: 'VNP-DEMO-002', carrier: 'Vietnam Post (demo)', status: 'OUT_FOR_DELIVERY', codStatus: 'PENDING', estimatedDelivery: hoursAgo(-2), timeline: [
      { status: 'CREATED', label: 'Đã tạo vận đơn', timestamp: hoursAgo(30) },
      { status: 'PICKED_UP', label: 'Đã lấy hàng', timestamp: hoursAgo(28) },
      { status: 'IN_TRANSIT', label: 'Đang vận chuyển', timestamp: hoursAgo(20) },
      { status: 'OUT_FOR_DELIVERY', label: 'Đang giao đến', timestamp: hoursAgo(2) },
    ] },
    status: 'SHIPPING',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: hoursAgo(34) },
      { status: 'CONFIRMED', label: 'Xác nhận', timestamp: hoursAgo(33) },
      { status: 'PACKING', label: 'Đóng gói', timestamp: hoursAgo(30) },
      { status: 'SHIPPING', label: 'Giao hàng', timestamp: hoursAgo(20) },
    ],
    salesChannel: 'D2C',
    couponCode: 'TRAM100',
    privacyConsentAt: hoursAgo(34),
    createdAt: hoursAgo(34),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'order-003',
    orderCode: 'MT250930C1D5',
    userId: 'user-001',
    customerName: 'Nguyễn Thị An',
    customerPhone: '0901234567',
    customerEmail: 'annguyen@email.com',
    shippingFullName: 'Nguyễn Thị An',
    shippingPhone: '0901234567',
    shippingProvince: 'TP. Hồ Chí Minh',
    shippingWard: 'Phường Bến Nghé',
    shippingDetail: '12 Lý Tự Trọng, căn hộ 502',
    items: [
      { id: 'oi-004', productId: 'prod-005', productName: 'Trầm miếng xông tự nhiên', productSlug: 'tram-mieng-xong-tu-nhien', skuId: 'sku-005-a', specLabel: 'Hộp 20g', image: '/images/products/prod-005.jpg', price: 550000, quantity: 1, lineTotal: 550000 },
      { id: 'oi-005', productId: 'prod-004', productName: 'Bột trầm hương tinh khiết', productSlug: 'bot-tram-huong-tinh-khiat', skuId: 'sku-004-a', specLabel: 'Hộp 50g', image: '/images/products/prod-004.jpg', price: 220000, quantity: 1, lineTotal: 220000 },
    ],
    subtotal: 770000,
    shippingFee: 35000,
    discount: 0,
    total: 805000,
    paymentMethod: 'PAYPAL',
    payment: { id: 'pay-003', method: 'PAYPAL', status: 'SUCCESS', amount: 805000, transactionId: 'PAYPAL-DEMO-003', paidAt: daysAgo(3) },
    shipment: { id: 'ship-003', trackingCode: 'GHN-DEMO-003', carrier: 'GHN (demo)', status: 'DELIVERED', codStatus: 'NONE', estimatedDelivery: daysAgo(1), timeline: [
      { status: 'CREATED', label: 'Đã tạo vận đơn', timestamp: daysAgo(3) },
      { status: 'PICKED_UP', label: 'Đã lấy hàng', timestamp: daysAgo(3) },
      { status: 'IN_TRANSIT', label: 'Đang vận chuyển', timestamp: daysAgo(2) },
      { status: 'DELIVERED', label: 'Đã giao thành công', timestamp: daysAgo(1) },
    ] },
    status: 'COMPLETED',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: daysAgo(4) },
      { status: 'CONFIRMED', label: 'Xác nhận', timestamp: daysAgo(4) },
      { status: 'PAID', label: 'Thanh toán', timestamp: daysAgo(3) },
      { status: 'PACKING', label: 'Đóng gói', timestamp: daysAgo(3) },
      { status: 'SHIPPING', label: 'Giao hàng', timestamp: daysAgo(2) },
      { status: 'COMPLETED', label: 'Hoàn tất', timestamp: daysAgo(1) },
    ],
    salesChannel: 'D2C',
    privacyConsentAt: daysAgo(4),
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
  },
  {
    id: 'order-004',
    orderCode: 'MT250928E2G7',
    userId: null,
    customerName: 'Lê Minh Châu',
    customerPhone: '0923456789',
    customerEmail: 'chaule@email.com',
    shippingFullName: 'Lê Minh Châu',
    shippingPhone: '0923456789',
    shippingProvince: 'Đà Nẵng',
    shippingWard: 'Phường Hải Châu',
    shippingDetail: '56 Bạch Đằng',
    items: [
      { id: 'oi-006', productId: 'prod-002', productName: 'Nhang vòng trầm hương Quảng Nam', productSlug: 'nhang-vong-tram-huong-quang-nam', skuId: 'sku-002-a', specLabel: 'Hộp 10 vòng', image: '/images/products/prod-002.jpg', price: 145000, quantity: 3, lineTotal: 435000 },
    ],
    subtotal: 435000,
    shippingFee: 35000,
    discount: 0,
    total: 470000,
    paymentMethod: 'COD',
    payment: { id: 'pay-004', method: 'COD', status: 'SUCCESS', amount: 470000, paidAt: daysAgo(5) },
    shipment: { id: 'ship-004', trackingCode: 'VNP-DEMO-004', carrier: 'Vietnam Post (demo)', status: 'DELIVERED', codStatus: 'COLLECTED', estimatedDelivery: daysAgo(5), timeline: [
      { status: 'CREATED', label: 'Đã tạo vận đơn', timestamp: daysAgo(7) },
      { status: 'DELIVERED', label: 'Đã giao thành công', timestamp: daysAgo(5) },
    ] },
    status: 'COMPLETED',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: daysAgo(7) },
      { status: 'CONFIRMED', label: 'Xác nhận', timestamp: daysAgo(7) },
      { status: 'PACKING', label: 'Đóng gói', timestamp: daysAgo(6) },
      { status: 'SHIPPING', label: 'Giao hàng', timestamp: daysAgo(6) },
      { status: 'COMPLETED', label: 'Hoàn tất', timestamp: daysAgo(5) },
    ],
    salesChannel: 'D2C',
    privacyConsentAt: daysAgo(7),
    createdAt: daysAgo(7),
    updatedAt: daysAgo(5),
  },
  {
    id: 'order-005',
    orderCode: 'MT250925H4J1',
    userId: 'user-002',
    customerName: 'Trần Văn Bình',
    customerPhone: '0912345678',
    customerEmail: 'binhtran@email.com',
    shippingFullName: 'Trần Văn Bình',
    shippingPhone: '0912345678',
    shippingProvince: 'Hà Nội',
    shippingWard: 'Phường Cẩm Châu',
    shippingDetail: '88 Trần Nhân Tông',
    items: [
      { id: 'oi-007', productId: 'prod-008', productName: 'Thác khói trầm hương gốm nghệ thuật', productSlug: 'thac-khoi-tram-huong-gom-nghe-thuat', skuId: 'sku-008-a', specLabel: 'Màu xanh rêu', image: '/images/products/prod-008.jpg', price: 420000, quantity: 1, lineTotal: 420000 },
    ],
    subtotal: 420000,
    shippingFee: 35000,
    discount: 0,
    total: 455000,
    paymentMethod: 'VIETQR',
    payment: { id: 'pay-005', method: 'VIETQR', status: 'EXPIRED', amount: 455000, transferContent: 'MOC TRAM MT250925H4J1', expiresAt: daysAgo(9) },
    shipment: null,
    status: 'CANCELLED',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: daysAgo(10) },
      { status: 'CANCELLED', label: 'Đã hủy', timestamp: daysAgo(9), note: 'Hết hạn thanh toán' },
    ],
    salesChannel: 'D2C',
    privacyConsentAt: daysAgo(10),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(9),
  },
  {
    id: 'order-006',
    orderCode: 'MT250920K6L8',
    userId: 'user-001',
    customerName: 'Nguyễn Thị An',
    customerPhone: '0901234567',
    customerEmail: 'annguyen@email.com',
    shippingFullName: 'Nguyễn Thị An',
    shippingPhone: '0901234567',
    shippingProvince: 'TP. Hồ Chí Minh',
    shippingWard: 'Phường Bến Nghé',
    shippingDetail: '12 Lý Tự Trọng, căn hộ 502',
    items: [
      { id: 'oi-008', productId: 'prod-011', productName: 'Bộ dụng cụ pha trà gốm Bát Tràng', productSlug: 'bo-dung-cu-pha-tra-gom-bat-trang', skuId: 'sku-011-a', specLabel: 'Bộ 8 món', image: '/images/products/prod-011.jpg', price: 1250000, quantity: 1, lineTotal: 1250000 },
    ],
    subtotal: 1250000,
    shippingFee: 0,
    discount: 0,
    total: 1250000,
    paymentMethod: 'VIETQR',
    payment: { id: 'pay-006', method: 'VIETQR', status: 'SUCCESS', amount: 1250000, transactionId: 'VQR-DEMO-006', transferContent: 'MOC TRAM MT250920K6L8', paidAt: daysAgo(12) },
    shipment: { id: 'ship-006', trackingCode: 'GHN-DEMO-006', carrier: 'GHN (demo)', status: 'DELIVERED', codStatus: 'NONE', estimatedDelivery: daysAgo(10), timeline: [
      { status: 'DELIVERED', label: 'Đã giao thành công', timestamp: daysAgo(10) },
    ] },
    status: 'COMPLETED',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: daysAgo(13) },
      { status: 'CONFIRMED', label: 'Xác nhận', timestamp: daysAgo(13) },
      { status: 'PAID', label: 'Thanh toán', timestamp: daysAgo(12) },
      { status: 'PACKING', label: 'Đóng gói', timestamp: daysAgo(12) },
      { status: 'SHIPPING', label: 'Giao hàng', timestamp: daysAgo(11) },
      { status: 'COMPLETED', label: 'Hoàn tất', timestamp: daysAgo(10) },
    ],
    salesChannel: 'D2C',
    privacyConsentAt: daysAgo(13),
    createdAt: daysAgo(13),
    updatedAt: daysAgo(10),
  },
  {
    id: 'order-007',
    orderCode: 'MT251003M9N3',
    userId: null,
    customerName: 'Phạm Thị Dung',
    customerPhone: '0934567890',
    customerEmail: 'dungpham@email.com',
    shippingFullName: 'Phạm Thị Dung',
    shippingPhone: '0934567890',
    shippingProvince: 'Khánh Hòa',
    shippingWard: 'Phường 1',
    shippingDetail: '23 Trần Phú',
    items: [
      { id: 'oi-009', productId: 'prod-013', productName: 'Nhang nụ kỳ nam siêu phẩm', productSlug: 'nhang-nu-ky-nam-sieu-pham', skuId: 'sku-013-a', specLabel: 'Hộp 20 nụ', image: '/images/products/prod-013.jpg', price: 1200000, quantity: 1, lineTotal: 1200000 },
    ],
    subtotal: 1200000,
    shippingFee: 0,
    discount: 0,
    total: 1200000,
    paymentMethod: 'COD',
    payment: { id: 'pay-007', method: 'COD', status: 'PENDING', amount: 1200000 },
    shipment: null,
    status: 'PENDING',
    timeline: [
      { status: 'PENDING', label: 'Đặt hàng', timestamp: hoursAgo(2) },
    ],
    salesChannel: 'D2C',
    privacyConsentAt: hoursAgo(2),
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
];

export const returnRequests: ReturnRequest[] = [
  {
    id: 'ret-001',
    requestCode: 'RT250928A1B2',
    orderId: 'order-004',
    orderCode: 'MT250928E2G7',
    userId: 'user-guest',
    reason: 'DAMAGED_IN_TRANSIT',
    resolution: 'EXCHANGE',
    description: 'Hộp nhang vòng bị móp, 2 vòng bên trong bị vỡ.',
    attachments: [],
    status: 'SUBMITTED',
    timeline: [
      { status: 'SUBMITTED', label: 'Đã gửi yêu cầu', timestamp: hoursAgo(5) },
    ],
    createdAt: hoursAgo(5),
  },
];

export const quoteRequests: QuoteRequest[] = [
  {
    id: 'qr-001',
    requestCode: 'B2B-250925-001',
    companyName: 'Thiền viện Linh Sơn',
    contactName: 'Thích Tâm Minh',
    email: 'linhson@thienvien.vn',
    phone: '0956789012',
    b2bType: 'ZEN_MONASTERY',
    productsInterested: 'Nhang nụ, nhang vòng, trầm miếng xông',
    quantity: 'Nhang nụ 500 hộp, nhang vòng 200 hộp, trầm miếng 100 hộp',
    budget: '50-100 triệu',
    note: 'Phục vụ thiền đường, cần giao trước 15/10.',
    status: 'QUOTED',
    quotedAmount: 85000000,
    createdAt: daysAgo(8),
  },
  {
    id: 'qr-002',
    requestCode: 'B2B-250928-002',
    companyName: 'Spa An Nhiên',
    contactName: 'Võ Thị Hạnh',
    email: 'hanh@annhienspa.vn',
    phone: '0945678901',
    b2bType: 'SPA',
    productsInterested: 'Máy xông trầm điện, thác khói, nhang nụ',
    quantity: 'Máy xông 10 cái, thác khói 5 cái, nhang nụ 100 hộp',
    budget: '20-30 triệu',
    note: 'Trang bị 10 phòng spa.',
    status: 'NEW',
    createdAt: daysAgo(2),
  },
];

export const appointments: ShowroomAppointment[] = [
  {
    id: 'appt-001',
    showroomId: 'sr-hcm',
    showroomName: 'Showroom TP. HCM',
    customerName: 'Nguyễn Thị An',
    phone: '0901234567',
    email: 'annguyen@email.com',
    date: daysAgo(-3),
    slot: '15:00',
    numGuests: 2,
    note: 'Muốn thử hương nhang nụ kỳ nam.',
    status: 'CONFIRMED',
    createdAt: daysAgo(1),
  },
  {
    id: 'appt-002',
    showroomId: 'sr-hn',
    showroomName: 'Showroom Hà Nội',
    customerName: 'Trần Văn Bình',
    phone: '0912345678',
    email: 'binhtran@email.com',
    date: daysAgo(-5),
    slot: '10:00',
    numGuests: 1,
    note: '',
    status: 'PENDING',
    createdAt: hoursAgo(12),
  },
];

export const coupons: Coupon[] = [
  {
    id: 'cpn-001',
    code: 'TRAM100',
    description: 'Giảm 100.000 ₫ cho đơn từ 1.000.000 ₫',
    discountType: 'FIXED',
    discountValue: 100000,
    minOrder: 1000000,
    maxDiscount: 100000,
    usageLimit: 100,
    usedCount: 23,
    validFrom: '2027-09-01T00:00:00Z',
    validUntil: '2027-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'cpn-002',
    code: 'MOCTRAM10',
    description: 'Giảm 10% cho đơn từ 300.000 ₫ (tối đa 50.000 ₫)',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrder: 300000,
    maxDiscount: 50000,
    usageLimit: 200,
    usedCount: 87,
    validFrom: '2027-08-01T00:00:00Z',
    validUntil: '2027-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'cpn-003',
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển cho đơn từ 500.000 ₫',
    discountType: 'FIXED',
    discountValue: 35000,
    minOrder: 500000,
    maxDiscount: 35000,
    usageLimit: 500,
    usedCount: 312,
    validFrom: '2025-07-01T00:00:00Z',
    validUntil: '2025-12-31T23:59:59Z',
    isActive: true,
  },
];

export const articles: Article[] = [
  {
    id: 'art-001',
    title: 'Về Mộc Trầm — Hành trình của hương thơm',
    slug: 'gioi-thieu',
    type: 'ABOUT',
    excerpt: 'Câu chuyện thương hiệu Mộc Trầm, từ những cánh rừng trầm Khánh Hòa đến không gian thiền của bạn.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    content: `Mộc Trầm ra đời từ niềm tin rằng trầm hương không chỉ là sản phẩm, mà là cầu nối giữa con người và sự tĩnh tại nội tâm.

Chúng tôi bắt đầu từ năm 2018, khi người sáng lập — sau nhiều năm nghiên cứu trầm hương tại Khánh Hòa — quyết định mang sản phẩm trầm chất lượng cao đến với nhiều người hơn, với cam kết minh bạch về nguồn gốc.

**Sứ mệnh**

Mang hương thơm thanh tịnh của trầm hương Việt Nam đến mọi không gian sống, thiền đường, trà thất — từ những nụ nhang nhỏ nhất đến chuỗi hạt trầm tự nhiên.

**Giá trị cốt lõi**

- Tự nhiên: không hóa chất, không hương liệu
- Minh bạch: chứng nhận nguồn gốc và kiểm định an toàn
- Thẩm mỹ: thiết kế truyền thống pha hiện đại
- Bền vững: trầm trồng có quản lý, khai thác có trách nhiệm`,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'art-002',
    title: 'Cách thưởng trầm đúng cách',
    slug: 'cach-thuong-tram-dung-cach',
    type: 'GUIDE',
    excerpt: 'Hướng dẫn cơ bản về cách đốt nhang nụ, xông bột trầm và thưởng thức hương trầm.',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
    content: `Thưởng trầm là một nghệ thuật chậm rãi. Dưới đây là những bước cơ bản để bạn bắt đầu.

**1. Chọn không gian**

Phòng kín gió, nhiệt độ thoải mái. Đừng bật quạt hay điều hòa mạnh — gió sẽ làm tan hương nhanh.

**2. Đốt nhang nụ**

Dùng diêm hoặc bật lửa đốt ngọn nụ. Để ngọn lửa cháy 2-3 giây rồi khẽ nụ ra cho tàn lửa đỏ. Nụ sẽ âm ỉm và tỏa hương.

**3. Xông bột trầm**

Dùng lư than hoặc máy xông điện. Nếu dùng than, đặt than đỏ rồi phủ bột trầm lên. Nếu dùng máy điện, cho bột vào khay và bật.

**4. Thưởng thức**

Nhắm mắt, hít nhẹ. Đừng hít quá sâu — hương trầm thưởng từ từ, để khói lan tự nhiên trong phòng.

**5. Bảo quản**

Trầm sợ ẩm. Bảo quản trong hộp kín, nơi khô ráo. Nhang nụ đã mở nên dùng trong 6 tháng.`,
    createdAt: '2025-07-10T00:00:00Z',
  },
  {
    id: 'art-003',
    title: 'Phân biệt trầm tự nhiên và trầm trồng',
    slug: 'phan-biet-tram-tu-nhien-va-tram-trong',
    type: 'GUIDE',
    excerpt: 'Làm sao để nhận biết trầm tự nhiên, trầm trồng và trầm giả? Bài viết giúp bạn hiểu rõ hơn.',
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=1200&q=80',
    content: `Trầm hương có nhiều loại, và việc phân biệt không dễ dàng. Dưới đây là những đặc điểm cơ bản.

**Trầm tự nhiên**

Là gỗ trầm bị nhiễm nhựa do vết thương trong tự nhiên, qua nhiều năm. Hương nồng, sâu, phức tạp. Giá cao vì hiếm. Cần có chứng nhận nguồn gốc.

**Trầm trồng**

Gỗ trầm được chủ động tạo vết thương và kích thích tiết nhựa. Chất lượng tùy thuộc vào thời gian và kỹ thuật. Hương dịu hơn trầm tự nhiên nhưng giá hợp lý hơn nhiều.

**Trầm giả / trầm hóa học**

Gỗ thường được tẩm hương liệu hóa học. Hương gắt, nhức đầu, bay nhanh. Không có chứng nhận. Mộc Trầm không bán loại này.

**Lời khuyên**

Hãy chọn sản phẩm có chứng nhận nguồn gốc và kiểm định an toàn khói. Nếu giá quá rẻ so với thị trường, hãy cẩn trọng.`,
    createdAt: '2025-07-20T00:00:00Z',
  },
  {
    id: 'art-004',
    title: 'Chính sách bảo mật thông tin',
    slug: 'chinh-sach-bao-mat',
    type: 'POLICY',
    excerpt: 'Mộc Trầm cam kết bảo vệ thông tin cá nhân của khách hàng theo quy định pháp luật.',
    content: `Mộc Trầm cam kết bảo vệ quyền riêng tư của khách hàng.

**1. Thông tin thu thập**

- Họ tên, số điện thoại, email, địa chỉ giao hàng
- Lịch sử đơn hàng, đánh giá sản phẩm
- Không bao giờ thu thập số thẻ ngân hàng

**2. Mục đích sử dụng**

- Xử lý đơn hàng, vận chuyển
- Thông báo trạng thái đơn
- Hỗ trợ khách hàng, giải quyết khiếu nại

**3. Chia sẻ với bên thứ ba**

Chỉ chia sẻ thông tin cần thiết cho đối tác vận chuyển. Không bán dữ liệu cho bên thứ ba.

**4. Bảo mật**

Mật khẩu được mã hóa. Giao dịch thanh toán qua đối tác cấp phép (VietQR, PayPal).

**5. Quyền của khách hàng**

Quyền xem, sửa, xóa thông tin cá nhân. Liên hệ lienhe@moctram.vn để thực hiện.`,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'art-005',
    title: 'Chính sách giao hàng',
    slug: 'chinh-sach-giao-hang',
    type: 'POLICY',
    excerpt: 'Thời gian giao hàng, phí vận chuyển và khu vực phục vụ.',
    content: `**1. Khu vực phục vụ**

Mộc Trầm giao hàng toàn quốc.

**2. Thời gian giao hàng**

- Nội thành TP. HCM, Hà Nội, Đà Nẵng: 1-2 ngày
- Các tỉnh khác: 2-5 ngày
- B2B: thỏa thuận riêng

**3. Phí vận chuyển**

- Miễn phí cho đơn từ 500.000 ₫
- Dưới 500.000 ₫: 35.000 ₫
- B2B: thỏa thuận riêng

**4. Đóng gói**

Sản phẩm dễ vỡ (lư gốm, thác khói) được đóng xốp chống sốc. Sản phẩm dễ cháy (nhang) đóng gói cẩn thận, dán nhãn cảnh báo.`,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'art-006',
    title: 'Chính sách đổi trả và hoàn tiền',
    slug: 'chinh-sach-doi-tra-va-hoan-tien',
    type: 'POLICY',
    excerpt: 'Điều kiện, quy trình đổi trả và hoàn tiền.',
    content: `**1. Điều kiện đổi trả**

- Trong vòng 7 ngày kể từ ngày nhận hàng
- Sản phẩm còn nguyên tem, hộp
- Không áp dụng cho nhang đã đốt, bột trầm đã mở

**2. Lý do đổi trả hợp lệ**

- Hàng hỏng trong vận chuyển
- Nhầm hàng
- Không đúng mô tả

**3. Quy trình**

1. Gửi yêu cầu qua trang tài khoản hoặc liên hệ CSKH
2. NV CSKH tiếp nhận và kiểm tra
3. Kho kiểm hàng hoàn
4. Admin phê duyệt
5. Đổi hàng hoặc hoàn tiền

**4. Hoàn tiền**

- Hoàn tiền qua phương thức thanh toán ban đầu
- VietQR/PayPal: 3-5 ngày làm việc
- COD: chuyển khoản ngân hàng`,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'art-007',
    title: 'Quyền và nghĩa vụ các bên',
    slug: 'quyen-va-nghia-vu-cac-ben',
    type: 'POLICY',
    excerpt: 'Quyền lợi và trách nhiệm của khách hàng và Mộc Trầm theo Luật TMĐT.',
    content: `**Quyền của khách hàng**

- Được cung cấp thông tin đầy đủ về sản phẩm, giá cả, phí vận chuyển
- Được hủy đơn trước khi giao hàng
- Được đổi trả theo chính sách
- Được bảo mật thông tin cá nhân
- Được gửi khiếu nại

**Nghĩa vụ của khách hàng**

- Cung cấp thông tin chính xác khi đặt hàng
- Thanh toán đầy đủ theo phương thức đã chọn
- Nhận hàng đúng thời gian đã thỏa thuận

**Quyền của Mộc Trầm**

- Từ chối đơn hàng nếu thông tin không hợp lệ
- Hủy đơn nếu không liên lạc được với khách
- Yêu cầu bằng chứng khi khách khiếu nại

**Nghĩa vụ của Mộc Trầm**

- Giao hàng đúng mô tả, đúng số lượng
- Bảo mật thông tin khách hàng
- Xử lý khiếu nại trong thời gian quy định

**Cách gửi khiếu nại**

Email: lienhe@moctram.vn
Điện thoại: 1900 6750
Tại showroom: 12 Lý Tự Trọng, Phường Bến Nghé, TP. HCM`,
    createdAt: '2025-06-01T00:00:00Z',
  },
];

export const inventoryBatches: InventoryBatch[] = [
  { id: 'ib-001', productId: 'prod-001', productName: 'Nhang nụ trầm hương Khánh Hòa', skuId: 'sku-001-a', specLabel: 'Hộp 50 nụ', batchCode: 'LOT-2509-001', quantity: 50, receivedDate: '2025-09-15', note: 'Nhập từ xưởng Khánh Hòa' },
  { id: 'ib-002', productId: 'prod-004', productName: 'Bột trầm hương tinh khiết', skuId: 'sku-004-a', specLabel: 'Hộp 50g', batchCode: 'LOT-2509-002', quantity: 40, receivedDate: '2025-09-20', note: 'Nhập lô mới' },
  { id: 'ib-003', productId: 'prod-012', productName: 'Chuỗi hạt trầm hương 108 hạt', skuId: 'sku-012-a', specLabel: 'Hạt 8mm', batchCode: 'LOT-2508-010', quantity: 8, receivedDate: '2025-08-28', note: 'Hàng chọn tay' },
];

export const inventoryMovements: InventoryMovement[] = [
  { id: 'im-001', skuId: 'sku-001-a', productName: 'Nhang nụ trầm hương Khánh Hòa', specLabel: 'Hộp 50 nụ', type: 'IN', quantity: 50, reason: 'Nhập kho lô LOT-2509-001', timestamp: '2025-09-15T08:00:00Z' },
  { id: 'im-002', skuId: 'sku-001-a', productName: 'Nhang nụ trầm hương Khánh Hòa', specLabel: 'Hộp 50 nụ', type: 'OUT', quantity: 2, reason: 'Xuất đơn MT251003A7K2', timestamp: hoursAgo(18) },
  { id: 'im-003', skuId: 'sku-006-a', productName: 'Lư xông gốm Thanh Hà', specLabel: 'Màu nâu trầm', type: 'OUT', quantity: 1, reason: 'Xuất đơn MT251003A7K2', timestamp: hoursAgo(18) },
  { id: 'im-004', skuId: 'sku-004-a', productName: 'Bột trầm hương tinh khiết', specLabel: 'Hộp 50g', type: 'IN', quantity: 40, reason: 'Nhập kho lô LOT-2509-002', timestamp: '2025-09-20T09:00:00Z' },
];
