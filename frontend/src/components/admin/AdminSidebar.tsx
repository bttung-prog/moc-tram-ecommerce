import React, { useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { ADMIN_MENU } from "@/constants/permissions";
import { X } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrdersCount?: number;
  pendingReturnsCount?: number;
  newQuotesCount?: number;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
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
          <Link to="/admin" onClick={onClose} className="block">
            <div className="font-serif text-lg font-bold tracking-wider text-cream">
              MỘC TRẦM
            </div>
            <p className="text-xs text-agarwood-300">Quản trị hệ thống</p>
          </Link>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-charcoal-200 hover:text-cream hover:bg-white/10 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links - Pure Text Only */}
        <nav className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-300">
            Menu Quản trị
          </div>

          {ADMIN_MENU.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-agarwood-500 text-cream font-semibold shadow-sm"
                    : "text-charcoal-100 hover:bg-white/10 hover:text-cream"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-4 shrink-0">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-xl bg-white/10 px-4 py-2.5 text-xs font-medium text-cream hover:bg-white/15 transition-colors border border-white/10"
          >
            Xem Cửa hàng
          </Link>
        </div>
      </aside>
    </>
  );
};
