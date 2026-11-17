/**
 * Danh sách định tuyến URL chuẩn cho dự án TMĐT Mộc Trầm
 */
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/san-pham",
  CATEGORY: "/danh-muc/:slug",
  PRODUCT_DETAIL: "/san-pham/:slug",
  CART: "/gio-hang",
  CHECKOUT: "/thanh-toan",
  AUTH: "/dang-nhap",
  REGISTER: "/dang-ky",
  ORDER_LOOKUP: "/tra-cuu-don-hang",
  ORDER_LOOKUP_CODE: "/tra-cuu-don-hang/:orderCode",
  ABOUT: "/gioi-thieu",
  GUIDE: "/cam-nang",
  GUIDE_DETAIL: "/cam-nang/:slug",
  POLICY: "/chinh-sach/:slug",
  B2B: "/bao-gia-b2b",
  SHOWROOM: "/showroom",
  ACCOUNT: "/tai-khoan",
  ACCOUNT_ORDER_DETAIL: "/tai-khoan/don-hang/:orderCode",

  // Admin & Staff routes
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/san-pham",
  ADMIN_INVENTORY: "/admin/kho",
  ADMIN_ORDERS: "/admin/don-hang",
  ADMIN_PAYMENTS: "/admin/thanh-toan",
  ADMIN_SHIPPING: "/admin/van-chuyen",
  ADMIN_RETURNS: "/admin/doi-tra",
  ADMIN_CONSULTATION: "/admin/tu-van",
  ADMIN_COUPONS: "/admin/ma-giam-gia",
  ADMIN_USERS: "/admin/nguoi-dung",
} as const;
