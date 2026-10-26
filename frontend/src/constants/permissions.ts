import { USER_ROLE } from './enums';

// Permission codes: UCxx-VIEW / UCxx-MANAGE
// MANAGE includes VIEW
export const PERMISSIONS = {
  // Customer-facing (no permission needed, open to all)
  UC01_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER, USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC02_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER, USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC03_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER, USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC04_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC05_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC06_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC07_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC08_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC09_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC10_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC11_VIEW: [USER_ROLE.GUEST, USER_ROLE.CUSTOMER],
  UC12_VIEW: [USER_ROLE.CUSTOMER],
  UC13_VIEW: [USER_ROLE.CUSTOMER],
  UC14_VIEW: [USER_ROLE.CUSTOMER],
  UC15_VIEW: [USER_ROLE.CUSTOMER],

  // Admin/Staff
  UC16_VIEW: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC16_MANAGE: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.ADMIN],
  UC17_VIEW: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.ADMIN],
  UC17_MANAGE: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.ADMIN],
  UC18_VIEW: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC18_MANAGE: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.ADMIN],
  UC19_VIEW: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC19_MANAGE: [USER_ROLE.ADMIN],
  UC20_VIEW: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.ADMIN],
  UC20_MANAGE: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.ADMIN],
  UC21_VIEW: [USER_ROLE.STAFF_WAREHOUSE, USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC21_MANAGE: [USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC22_VIEW: [USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC22_MANAGE: [USER_ROLE.STAFF_CS, USER_ROLE.ADMIN],
  UC23_VIEW: [USER_ROLE.ADMIN],
  UC23_MANAGE: [USER_ROLE.ADMIN],
  UC24_VIEW: [USER_ROLE.ADMIN],
  UC24_MANAGE: [USER_ROLE.ADMIN],
  UC25_VIEW: [USER_ROLE.ADMIN],
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

// Staff/Admin menu items
export const ADMIN_MENU = [
  {
    label: 'Tổng quan',
    icon: 'LayoutDashboard',
    path: '/admin',
    permission: 'UC25_VIEW',
  },
  {
    label: 'Sản phẩm & danh mục',
    icon: 'Package',
    path: '/admin/san-pham',
    permission: 'UC16_VIEW',
  },
  {
    label: 'Kho & tồn kho',
    icon: 'Warehouse',
    path: '/admin/kho',
    permission: 'UC17_VIEW',
  },
  {
    label: 'Đơn hàng',
    icon: 'ShoppingCart',
    path: '/admin/don-hang',
    permission: 'UC18_VIEW',
  },
  {
    label: 'Đối soát thanh toán',
    icon: 'ReceiptText',
    path: '/admin/thanh-toan',
    permission: 'UC19_VIEW',
  },
  {
    label: 'Vận chuyển',
    icon: 'Truck',
    path: '/admin/van-chuyen',
    permission: 'UC20_VIEW',
  },
  {
    label: 'Đổi trả & hoàn tiền',
    icon: 'RefreshCw',
    path: '/admin/doi-tra',
    permission: 'UC21_VIEW',
  },
  {
    label: 'Tư vấn',
    icon: 'Headphones',
    path: '/admin/tu-van',
    permission: 'UC22_VIEW',
  },
  {
    label: 'Mã giảm giá',
    icon: 'TicketPercent',
    path: '/admin/ma-giam-gia',
    permission: 'UC23_VIEW',
  },
  {
    label: 'Người dùng & phân quyền',
    icon: 'Users',
    path: '/admin/nguoi-dung',
    permission: 'UC24_VIEW',
  },
] as const;
