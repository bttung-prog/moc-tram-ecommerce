import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  adminDashboardApi,
  type DashboardPeriod,
  type DashboardStats,
  type RevenueChartPoint,
  type ChannelShare,
  type PaymentStat,
  type TopProduct,
  type InventoryAlert,
} from "@/services/adminDashboardApi";
import { orderApi } from "@/services/orderApi";
import type { Order } from "@/types";
import { formatVND, formatCompactVND } from "@/utils/format";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { SalesChannelBreakdown } from "@/components/admin/SalesChannelBreakdown";
import { PaymentMethodBreakdown } from "@/components/admin/PaymentMethodBreakdown";
import { ActionAlerts } from "@/components/admin/ActionAlerts";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { TopProductsList } from "@/components/admin/TopProductsList";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Sparkles,
  Download,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

interface OutletContextType {
  period: DashboardPeriod;
  searchTerm?: string;
  stats?: DashboardStats | null;
  onRefresh?: () => void;
}

export const AdminDashboardPage: React.FC = () => {
  const context = useOutletContext<OutletContextType>();
  const period = context?.period || "7days";
  const searchTerm = context?.searchTerm || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<RevenueChartPoint[]>([]);
  const [channels, setChannels] = useState<ChannelShare[]>([]);
  const [payments, setPayments] = useState<PaymentStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [
        statsRes,
        chartRes,
        channelRes,
        paymentRes,
        topProdRes,
        invRes,
        ordersRes,
      ] = await Promise.all([
        adminDashboardApi.getStats(period),
        adminDashboardApi.getRevenueChart(period),
        adminDashboardApi.getChannelBreakdown(),
        adminDashboardApi.getPaymentBreakdown(),
        adminDashboardApi.getTopSellingProducts(5),
        adminDashboardApi.getInventoryAlerts(5),
        orderApi.getAllOrders({ limit: 6 }),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (chartRes.success && chartRes.data) setChartData(chartRes.data);
      if (channelRes.success && channelRes.data) setChannels(channelRes.data);
      if (paymentRes.success && paymentRes.data) setPayments(paymentRes.data);
      if (topProdRes.success && topProdRes.data)
        setTopProducts(topProdRes.data);
      if (invRes.success && invRes.data) setInventoryAlerts(invRes.data);
      if (ordersRes.success && ordersRes.data?.items) {
        setRecentOrders(ordersRes.data.items);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    context?.onRefresh?.();
    loadData();
  };

  // Quick confirm order
  const handleConfirmOrder = async (orderId: string) => {
    const res = await adminDashboardApi.confirmPendingOrder(orderId);
    if (res.success) {
      showToast(res.message || "Xác nhận đơn thành công");
      loadData();
      context?.onRefresh?.();
    }
  };

  // Export report
  const handleExportReport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          stats,
          chartData,
          channels,
          payments,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `Bao_cao_Moc_Tram_${period}_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Đã xuất báo cáo số liệu thành công");
  };

  // Filter orders by global search
  const filteredOrders = recentOrders.filter((o) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.orderCode.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-xl bg-charcoal-700 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold text-cream shadow-2xl border border-agarwood-400/40 animate-fade-up max-w-[calc(100vw-2rem)]">
          <Sparkles className="h-4 w-4 text-agarwood-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-agarwood-900 tracking-tight">
            Tổng quan Vận hành & Doanh thu
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-charcoal-400 mt-0.5 sm:mt-1">
            Trung tâm kiểm soát bán lẻ Website, Khách sỉ và Showroom
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-outline text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1.5"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleExportReport}
            className="btn-primary text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard
          title="Tổng Doanh thu"
          value={stats ? formatVND(stats.totalRevenue) : "0 ₫"}
          subValue={
            stats
              ? `Kỳ trước: ${formatCompactVND(stats.previousRevenue)}`
              : undefined
          }
          change={stats?.revenueGrowth}
          icon={DollarSign}
          colorScheme="agarwood"
          badgeNote="Đã trừ hoàn/hủy"
        />

        <StatCard
          title="Số Đơn Hàng"
          value={stats ? `${stats.totalOrders} đơn` : "0"}
          subValue="Website, sỉ & showroom"
          change={stats?.ordersGrowth}
          icon={ShoppingBag}
          colorScheme="moss"
          badgeNote="Tăng trưởng"
        />

        <StatCard
          title="Đơn Chờ Xử Lý"
          value={stats ? `${stats.pendingOrdersCount} đơn` : "0"}
          subValue="Chờ xác nhận / xuất kho"
          icon={Clock}
          colorScheme="amber"
          badgeNote={stats?.pendingOrdersCount ? "Cần duyệt gấp" : "Đã xong"}
          onClick={() => navigate("/admin/don-hang")}
        />

        <StatCard
          title="Giá trị TB / Đơn (AOV)"
          value={stats ? formatVND(stats.averageOrderValue) : "0 ₫"}
          subValue="Đơn lẻ & khách sỉ"
          change={4.8}
          icon={TrendingUp}
          colorScheme="sky"
          badgeNote="Giỏ hàng"
        />
      </div>

      {/* 2. Action Required Banner */}
      <ActionAlerts
        stats={stats}
        inventoryAlerts={inventoryAlerts}
        loading={loading}
      />

      {/* 3. Charts & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} loading={loading} />
        </div>
        <div>
          <SalesChannelBreakdown shares={channels} loading={loading} />
        </div>
      </div>

      {/* 4. Payment breakdown & Top products / Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PaymentMethodBreakdown stats={payments} loading={loading} />
        <TopProductsList
          topProducts={topProducts}
          inventoryAlerts={inventoryAlerts}
          loading={loading}
        />
      </div>

      {/* 5. Recent Orders Table */}
      <RecentOrdersTable
        orders={filteredOrders}
        loading={loading}
        onConfirmOrder={handleConfirmOrder}
        onViewAll={() => navigate("/admin/don-hang")}
      />
    </div>
  );
};
