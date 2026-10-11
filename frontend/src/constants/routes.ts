/**
 * Danh sách định tuyến URL chuẩn cho dự án TMĐT Mộc Trầm
 */
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/san-pham',
  CATEGORY: '/danh-muc/:slug',
  PRODUCT_DETAIL: '/san-pham/:slug',
  CART: '/gio-hang',
  CHECKOUT: '/thanh-toan',
  AUTH: '/dang-nhap',
  ORDER_LOOKUP: '/tra-cuu-don-hang',
  ORDER_LOOKUP_CODE: '/tra-cuu-don-hang/:orderCode',
  ABOUT: '/gioi-thieu',
  GUIDE: '/cam-nang',
  GUIDE_DETAIL: '/cam-nang/:slug',
  POLICY: '/chinh-sach/:slug',
  B2B: '/bao-gia-b2b',
  SHOWROOM: '/showroom',
  ACCOUNT: '/tai-khoan',
  ACCOUNT_ORDER_DETAIL: '/tai-khoan/don-hang/:orderCode',
} as const;
