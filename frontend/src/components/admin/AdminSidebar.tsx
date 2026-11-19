import React, { useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { ADMIN_MENU } from "@/constants/permissions";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ReceiptText,
  Truck,
  RefreshCw,
  Headphones,
  TicketPercent,
  Users,
  X,
  LogOut,
  ExternalLink,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrdersCount?: number;
  pendingReturnsCount?: number;
  newQuotesCount?: number;
  lowStockCount?: number;
}

const MENU_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ReceiptText,
  Truck,
  RefreshCw,
  Headphones,
  TicketPercent,
  Users,
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  // Prevent background scroll on mobile when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Filter menu items based on user role & permissions
  const visibleMenuItems = ADMIN_MENU.filter((item) => {
    if (!user) return hasPermission(item.permission);
    if (user.role === "ADMIN") return true;
    return hasPermission(item.permission);
  });

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "STAFF_WAREHOUSE":
        return "Thủ kho";
      case "STAFF_CS":
        return "Chăm sóc khách hàng";
      default:
        return "Nhân viên";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      // Handled in context
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-charcoal-700/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-charcoal-700 text-cream transition-transform duration-300 ease-in-out lg:static lg:h-full lg:w-64 xl:w-72 lg:shrink-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-white/10 px-5 sm:px-6">
          <Link
            to={user?.role === "STAFF_WAREHOUSE" ? "/admin/kho" : "/admin"}
            onClick={onClose}
            className="block"
          >
            <div className="font-serif text-lg font-bold tracking-wider text-cream">
              MỘC TRẦM
            </div>
            <p className="text-xs text-agarwood-300 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>{getRoleLabel(user?.role)}</span>
            </p>
          </Link>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-charcoal-200 hover:text-cream hover:bg-white/10 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1.5 scrollbar-thin">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-charcoal-300">
            Menu Quản trị
          </div>

          {visibleMenuItems.map((item) => {
            const IconComponent = MENU_ICONS[item.icon] || Package;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-agarwood-500 text-cream font-semibold shadow-sm"
                      : "text-charcoal-100 hover:bg-white/10 hover:text-cream"
                  }`
                }
              >
                <IconComponent className="h-4 w-4 shrink-0 transition-colors opacity-90 group-hover:opacity-100" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Footer Actions */}
        <div className="border-t border-white/10 p-3 sm:p-4 shrink-0 space-y-2 bg-charcoal-800/40">
          {/* User info */}
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-agarwood-600 font-bold text-white text-xs">
                  {user.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cream truncate">
                    {user.fullName || "Nhân viên"}
                  </p>
                  <p className="text-[10px] text-agarwood-300 truncate">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 rounded-lg text-charcoal-300 hover:text-red-300 hover:bg-white/10 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Quick link to store */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-cream hover:bg-white/15 transition-colors border border-white/10"
          >
            <span>Xem Cửa hàng Khách</span>
            <ExternalLink className="h-3.5 w-3.5 text-charcoal-300" />
          </Link>
        </div>
      </aside>
    </>
  );
};
