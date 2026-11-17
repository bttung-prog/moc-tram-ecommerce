import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import {
  adminDashboardApi,
  type DashboardPeriod,
  type DashboardStats,
} from "@/services/adminDashboardApi";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<DashboardPeriod>("7days");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch quick stats for header & sidebar badges
  useEffect(() => {
    adminDashboardApi.getStats(period).then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      }
    });
  }, [period]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory text-charcoal-600 font-sans">
      {/* Sidebar Navigation - Fixed 100% height, strictly stationary */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingOrdersCount={stats?.pendingOrdersCount}
        pendingReturnsCount={stats?.pendingReturnsCount}
        newQuotesCount={stats?.newQuotesCount}
        lowStockCount={stats?.lowStockCount}
      />

      {/* Main Content Area - Only this container handles vertical scrolling */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          period={period}
          onPeriodChange={setPeriod}
          pendingOrdersCount={stats?.pendingOrdersCount}
          pendingReturnsCount={stats?.pendingReturnsCount}
          newQuotesCount={stats?.newQuotesCount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Dynamic page content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || (
            <Outlet
              context={{
                period,
                searchTerm,
                stats,
                onRefresh: () =>
                  adminDashboardApi
                    .getStats(period)
                    .then((r) => r.data && setStats(r.data)),
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};
