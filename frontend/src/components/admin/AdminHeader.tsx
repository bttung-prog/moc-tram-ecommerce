import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { DashboardPeriod } from "@/services/adminDashboardApi";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  pendingOrdersCount?: number;
  pendingReturnsCount?: number;
  newQuotesCount?: number;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  period,
  onPeriodChange,
  pendingOrdersCount = 0,
  pendingReturnsCount = 0,
  newQuotesCount = 0,
  searchTerm = "",
  onSearchChange,
}) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const totalAlerts = pendingOrdersCount + pendingReturnsCount + newQuotesCount;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSwitch = (
    newRole: "ADMIN" | "STAFF_WAREHOUSE" | "STAFF_CS",
  ) => {
    if (user) {
      updateUser({ ...user, role: newRole });
      setShowUserMenu(false);
    }
  };

  const periodOptions: { value: DashboardPeriod; label: string }[] = [
    { value: "today", label: "Hôm nay" },
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "this_month", label: "Tháng này" },
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-agarwood-100 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 sm:h-20 w-full items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Desktop Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="rounded-xl p-2 text-charcoal-500 hover:bg-agarwood-50 hover:text-agarwood-800 lg:hidden shrink-0 border border-transparent hover:border-agarwood-200"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Desktop Search */}
          <div className="relative w-full hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
            <input
              type="text"
              placeholder="Tìm nhanh mã đơn, SĐT khách, tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-xl border border-agarwood-200 bg-ivory/60 pl-9 pr-4 py-2 text-xs sm:text-sm text-charcoal-600 placeholder:text-charcoal-300 focus:border-agarwood-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-agarwood-400 transition-all"
            />
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 rounded-xl text-charcoal-500 hover:bg-agarwood-50 sm:hidden shrink-0"
            aria-label="Tìm kiếm"
          >
            {showMobileSearch ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Right: Period Filter, Notifications, Role & User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Period Selector - Desktop (buttons) */}
          <div className="hidden md:flex items-center rounded-xl bg-agarwood-50 p-1 border border-agarwood-200/70">
            <Calendar className="ml-2 h-4 w-4 text-agarwood-600" />
            <div className="flex gap-1 ml-1.5">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onPeriodChange(opt.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    period === opt.value
                      ? "bg-agarwood-800 text-cream shadow-sm"
                      : "text-charcoal-500 hover:text-agarwood-800 hover:bg-agarwood-100/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Selector - Mobile/Tablet Compact Select */}
          <div className="md:hidden flex items-center">
            <select
              value={period}
              onChange={(e) =>
                onPeriodChange(e.target.value as DashboardPeriod)
              }
              className="rounded-xl border border-agarwood-200 bg-agarwood-50/80 px-2 py-1.5 text-xs font-semibold text-agarwood-900 focus:border-agarwood-400 focus:outline-none"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-2 sm:p-2.5 text-charcoal-500 hover:bg-agarwood-50 hover:text-agarwood-800 transition-colors border border-transparent hover:border-agarwood-200"
              aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl bg-white p-3.5 sm:p-4 shadow-2xl border border-agarwood-100 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2.5 border-b border-agarwood-100">
                  <div className="font-serif font-bold text-agarwood-900 flex items-center gap-2 text-sm sm:text-base">
                    <span>Thông báo vận hành</span>
                    {totalAlerts > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                        {totalAlerts} mới
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-charcoal-300">
                    Thời gian thực
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 max-h-72 overflow-y-auto">
                  {pendingOrdersCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/admin/don-hang");
                      }}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl p-2.5 hover:bg-agarwood-50/70 transition-colors border border-amber-100 bg-amber-50/30 text-xs"
                    >
                      <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal-600">
                          {pendingOrdersCount} đơn hàng mới đang chờ duyệt
                        </p>
                        <p className="text-charcoal-400 mt-0.5 text-[11px]">
                          Cần xác nhận đơn và đối soát
                        </p>
                      </div>
                    </div>
                  )}

                  {pendingReturnsCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/admin/doi-tra");
                      }}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl p-2.5 hover:bg-agarwood-50/70 transition-colors border border-rose-100 bg-rose-50/30 text-xs"
                    >
                      <div className="rounded-lg bg-rose-100 p-2 text-rose-700 shrink-0">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal-600">
                          {pendingReturnsCount} yêu cầu đổi trả cần xử lý
                        </p>
                        <p className="text-charcoal-400 mt-0.5 text-[11px]">
                          Khách hàng yêu cầu đổi hàng / hoàn tiền
                        </p>
                      </div>
                    </div>
                  )}

                  {newQuotesCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/admin/tu-van");
                      }}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl p-2.5 hover:bg-agarwood-50/70 transition-colors border border-sky-100 bg-sky-50/30 text-xs"
                    >
                      <div className="rounded-lg bg-sky-100 p-2 text-sky-700 shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal-600">
                          {newQuotesCount} yêu cầu báo giá sỉ mới
                        </p>
                        <p className="text-charcoal-400 mt-0.5 text-[11px]">
                          Khách mua sỉ & đối tác chờ gửi giá
                        </p>
                      </div>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="py-6 text-center text-xs text-charcoal-400 flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      <p>Mọi tác vụ vận hành đã xử lý xong!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu & Role Switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl border border-agarwood-200/80 p-1 sm:px-3 hover:bg-agarwood-50/60 transition-colors"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-agarwood-800 text-cream font-bold text-xs shrink-0">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-charcoal-600 leading-tight truncate max-w-[100px]">
                  {user?.fullName || "Admin"}
                </div>
                <div className="text-[10px] text-agarwood-600 font-mono font-medium">
                  {user?.role || "ADMIN"}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-charcoal-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs rounded-2xl bg-white p-2 shadow-2xl border border-agarwood-100 z-50 animate-fade-in text-xs">
                <div className="p-3 border-b border-agarwood-100 bg-agarwood-50/50 rounded-xl mb-1">
                  <p className="font-semibold text-charcoal-600 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-[11px] text-charcoal-400 truncate">
                    {user?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-agarwood-600" />
                    <span className="font-mono text-[10px] font-bold text-agarwood-700 bg-agarwood-100 px-2 py-0.5 rounded">
                      Role: {user?.role}
                    </span>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="p-2 border-b border-agarwood-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-300 block mb-1.5 px-1">
                    Chuyển vai trò thử nghiệm
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleRoleSwitch("ADMIN")}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                        user?.role === "ADMIN"
                          ? "bg-agarwood-100 font-bold text-agarwood-900"
                          : "hover:bg-agarwood-50"
                      }`}
                    >
                      <span>Quản trị viên (ADMIN)</span>
                      {user?.role === "ADMIN" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-agarwood-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch("STAFF_WAREHOUSE")}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                        user?.role === "STAFF_WAREHOUSE"
                          ? "bg-agarwood-100 font-bold text-agarwood-900"
                          : "hover:bg-agarwood-50"
                      }`}
                    >
                      <span>NV Kho (STAFF_WAREHOUSE)</span>
                      {user?.role === "STAFF_WAREHOUSE" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-agarwood-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch("STAFF_CS")}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                        user?.role === "STAFF_CS"
                          ? "bg-agarwood-100 font-bold text-agarwood-900"
                          : "hover:bg-agarwood-50"
                      }`}
                    >
                      <span>NV CSKH (STAFF_CS)</span>
                      {user?.role === "STAFF_CS" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-agarwood-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => navigate("/")}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-agarwood-50 text-charcoal-500"
                  >
                    <Store className="h-4 w-4 text-agarwood-600" />
                    <span>Xem Cửa hàng Khách</span>
                  </button>
                  <button
                    onClick={() => navigate("/tai-khoan")}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-agarwood-50 text-charcoal-500"
                  >
                    <User className="h-4 w-4 text-agarwood-600" />
                    <span>Hồ sơ tài khoản</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/dang-nhap");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-medium"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {showMobileSearch && (
        <div className="p-3 border-t border-agarwood-100 sm:hidden bg-ivory/60 animate-fade-in">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
            <input
              type="text"
              placeholder="Tìm mã đơn, SĐT khách..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-xl border border-agarwood-200 bg-white pl-9 pr-4 py-2 text-xs text-charcoal-600 placeholder:text-charcoal-300 focus:border-agarwood-400 focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};
