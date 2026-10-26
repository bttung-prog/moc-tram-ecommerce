export type LiteralUnion<T extends string> = T;

export type OrderStatus = LiteralUnion<'PENDING' | 'CONFIRMED' | 'PAID' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED'>;
export type PaymentMethod = LiteralUnion<'COD' | 'VIETQR' | 'PAYPAL'>;
export type PaymentStatus = LiteralUnion<'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'>;
export type SalesChannel = LiteralUnion<'D2C' | 'B2B' | 'O2O'>;
export type ShipmentStatus = LiteralUnion<'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNING' | 'RETURNED'>;
export type CodStatus = LiteralUnion<'NONE' | 'PENDING' | 'COLLECTED' | 'SETTLED'>;
export type ReturnStatusType = LiteralUnion<'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'ITEM_RECEIVED' | 'COMPLETED' | 'CANCELLED'>;
export type ReturnReason = LiteralUnion<'DAMAGED_IN_TRANSIT' | 'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'OTHER'>;
export type Resolution = LiteralUnion<'EXCHANGE' | 'REFUND_PARTIAL' | 'REFUND_FULL'>;
export type RequestStatus = LiteralUnion<'NEW' | 'IN_PROGRESS' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED'>;
export type B2BType = LiteralUnion<'TEA_HOUSE' | 'ZEN_MONASTERY' | 'SPA' | 'RESORT' | 'CORPORATE_GIFT' | 'OTHER'>;
export type AppointmentStatus = LiteralUnion<'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'>;
export type CertType = LiteralUnion<'ORIGIN' | 'SMOKE_SAFETY' | 'QUALITY' | 'OTHER'>;
export type ProductStatus = LiteralUnion<'DRAFT' | 'ACTIVE' | 'HIDDEN'>;
export type DiscountType = LiteralUnion<'PERCENT' | 'FIXED'>;
export type ArticleType = LiteralUnion<'ABOUT' | 'GUIDE' | 'POLICY'>;
export type UserRole = LiteralUnion<'GUEST' | 'CUSTOMER' | 'STAFF_WAREHOUSE' | 'STAFF_CS' | 'ADMIN'>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon?: string;
}

export interface Origin {
  id: string;
  name: string;
  region: string;
}

export interface AgarwoodType {
  id: string;
  name: string;
}

export interface AgarwoodGrade {
  id: string;
  name: string;
  level: number;
}

export interface Certification {
  id: string;
  certType: CertType;
  certNumber: string;
  issuer: string;
  issueDate: string;
  scanUrl?: string;
  isDemo: boolean;
}

export interface ProductSku {
  id: string;
  productId: string;
  specLabel: string;
  price: number;
  compareAtPrice?: number;
  weightG: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  originId: string;
  agarwoodTypeId: string;
  agarwoodGradeId: string;
  shortDescription: string;
  description: string;
  scentNotes: string;
  status: ProductStatus;
  fragilityLevel: number;
  flammabilityLevel: number;
  moistureSensitive: boolean;
  safetyWarning?: string;
  certifications: Certification[];
  images: string[];
  skus: ProductSku[];
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface CartItem {
  skuId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  specLabel: string;
  price: number;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  skuId: string;
  specLabel: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderTimelineEvent {
  status: string;
  label: string;
  timestamp: string;
  note?: string;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  transferContent?: string;
  paidAt?: string;
  expiresAt?: string;
}

export interface Shipment {
  id: string;
  trackingCode: string;
  carrier: string;
  status: ShipmentStatus;
  codStatus: CodStatus;
  estimatedDelivery: string;
  timeline: { status: string; label: string; timestamp: string }[];
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  payment: Payment | null;
  shipment: Shipment | null;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  salesChannel: SalesChannel;
  couponCode?: string;
  note?: string;
  privacyConsentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  requestCode: string;
  orderId: string;
  orderCode: string;
  userId: string;
  reason: ReturnReason;
  resolution: Resolution;
  description: string;
  attachments: string[];
  status: ReturnStatusType;
  timeline: { status: string; label: string; timestamp: string; note?: string }[];
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  requestCode: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  b2bType: B2BType;
  productsInterested: string;
  quantity: string;
  budget: string;
  note: string;
  status: RequestStatus;
  quotedAmount?: number;
  createdAt: string;
}

export interface ShowroomAppointment {
  id: string;
  showroomId: string;
  showroomName: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  slot: string;
  numGuests: number;
  note: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  type: ArticleType;
  excerpt: string;
  content: string;
  image?: string;
  createdAt: string;
}

export interface InventoryBatch {
  id: string;
  productId: string;
  productName: string;
  skuId: string;
  specLabel: string;
  batchCode: string;
  quantity: number;
  receivedDate: string;
  note: string;
}

export interface InventoryMovement {
  id: string;
  skuId: string;
  productName: string;
  specLabel: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason: string;
  timestamp: string;
}

export interface ApiResult<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: Record<string, string>;
}
