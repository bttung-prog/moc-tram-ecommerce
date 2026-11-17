import type { ApiResult, Order } from "@/types";
import {
  orders,
  returnRequests,
  quoteRequests,
  appointments,
} from "@/mock/orders";
import { products } from "@/mock/products";
import { randomDelay } from "@/utils/helpers";
import { ORDER_STATUS } from "@/constants/enums";

function ok<T>(data: T, message = "Thành công"): ApiResult<T> {
  return { success: true, data, message };
}

export type DashboardPeriod = "today" | "7days" | "30days" | "this_month";

export interface DashboardStats {
  totalRevenue: number;
  previousRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  pendingOrdersCount: number;
  averageOrderValue: number;
  lowStockCount: number;
  pendingReturnsCount: number;
  newQuotesCount: number;
  upcomingAppointmentsCount: number;
  pendingVietQrCount: number;
}

export interface RevenueChartPoint {
  date: string;
  label: string;
  revenue: number;
  d2cRevenue: number;
  b2bRevenue: number;
  o2oRevenue: number;
  orderCount: number;
}

export interface ChannelShare {
  channel: "D2C" | "B2B" | "O2O";
  label: string;
  revenue: number;
  percentage: number;
  orderCount: number;
}

export interface PaymentStat {
  method: "VIETQR" | "COD" | "PAYPAL";
  label: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  specLabel: string;
  image: string;
  price: number;
  soldCount: number;
  revenue: number;
  currentStock: number;
  isLowStock: boolean;
}

export interface InventoryAlert {
  skuId: string;
  productId: string;
  productName: string;
  specLabel: string;
  stock: number;
  threshold: number;
  fragilityLevel: number;
}

export const adminDashboardApi = {
  async getStats(
    period: DashboardPeriod = "7days",
  ): Promise<ApiResult<DashboardStats>> {
    await randomDelay();

    // Valid non-cancelled orders
    const validOrders = orders.filter(
      (o) => o.status !== ORDER_STATUS.CANCELLED,
    );
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    // Pending orders requiring admin/warehouse attention
    const pendingOrdersCount = orders.filter(
      (o) => o.status === ORDER_STATUS.PENDING,
    ).length;

    // AOV
    const averageOrderValue =
      validOrders.length > 0
        ? Math.round(totalRevenue / validOrders.length)
        : 0;

    // Low stock SKUs
    let lowStockCount = 0;
    products.forEach((p) => {
      p.skus.forEach((s) => {
        if (s.stock < 15) lowStockCount++;
      });
    });

    // Pending returns
    const pendingReturnsCount = returnRequests.filter(
      (r) => r.status === "SUBMITTED",
    ).length;

    // New B2B quote requests
    const newQuotesCount = quoteRequests.filter(
      (q) => q.status === "NEW",
    ).length;

    // Upcoming showroom appointments
    const upcomingAppointmentsCount = appointments.filter(
      (a) => a.status === "CONFIRMED" || a.status === "PENDING",
    ).length;

    // Pending VietQR
    const pendingVietQrCount = orders.filter(
      (o) =>
        o.paymentMethod === "VIETQR" &&
        (o.payment?.status === "PENDING" || o.status === "PENDING"),
    ).length;

    // Simulated benchmark growth
    const previousRevenue = Math.round(totalRevenue * 0.86);
    const revenueGrowth = 15.4;
    const ordersGrowth = 11.2;

    return ok({
      totalRevenue,
      previousRevenue,
      revenueGrowth,
      totalOrders,
      ordersGrowth,
      pendingOrdersCount,
      averageOrderValue,
      lowStockCount,
      pendingReturnsCount,
      newQuotesCount,
      upcomingAppointmentsCount,
      pendingVietQrCount,
    });
  },

  async getRevenueChart(
    period: DashboardPeriod = "7days",
  ): Promise<ApiResult<RevenueChartPoint[]>> {
    await randomDelay();

    const points: RevenueChartPoint[] = [
      {
        date: "2025-09-28",
        label: "28/09",
        revenue: 470000,
        d2cRevenue: 470000,
        b2bRevenue: 0,
        o2oRevenue: 0,
        orderCount: 1,
      },
      {
        date: "2025-09-29",
        label: "29/09",
        revenue: 805000,
        d2cRevenue: 805000,
        b2bRevenue: 0,
        o2oRevenue: 0,
        orderCount: 1,
      },
      {
        date: "2025-09-30",
        label: "30/09",
        revenue: 1250000,
        d2cRevenue: 1250000,
        b2bRevenue: 0,
        o2oRevenue: 0,
        orderCount: 2,
      },
      {
        date: "2025-10-01",
        label: "01/10",
        revenue: 1480000,
        d2cRevenue: 1480000,
        b2bRevenue: 0,
        o2oRevenue: 0,
        orderCount: 2,
      },
      {
        date: "2025-10-02",
        label: "02/10",
        revenue: 1750000,
        d2cRevenue: 1750000,
        b2bRevenue: 0,
        o2oRevenue: 0,
        orderCount: 1,
      },
      {
        date: "2025-10-03",
        label: "03/10",
        revenue: 2030000,
        d2cRevenue: 870000,
        b2bRevenue: 1160000,
        o2oRevenue: 0,
        orderCount: 2,
      },
      {
        date: "2025-10-04",
        label: "Hôm nay",
        revenue: 3250000,
        d2cRevenue: 740000,
        b2bRevenue: 1140000,
        o2oRevenue: 1370000,
        orderCount: 3,
      },
    ];

    return ok(points);
  },

  async getChannelBreakdown(): Promise<ApiResult<ChannelShare[]>> {
    await randomDelay();

    const validOrders = orders.filter(
      (o) => o.status !== ORDER_STATUS.CANCELLED,
    );
    let d2c = 0,
      b2b = 0,
      o2o = 0;
    let d2cCount = 0,
      b2bCount = 0,
      o2oCount = 0;

    validOrders.forEach((o) => {
      const channel = o.salesChannel || "D2C";
      if (channel === "B2B") {
        b2b += o.total;
        b2bCount++;
      } else if (channel === "O2O") {
        o2o += o.total;
        o2oCount++;
      } else {
        d2c += o.total;
        d2cCount++;
      }
    });

    const total = d2c + b2b + o2o || 1;

    const shares: ChannelShare[] = [
      {
        channel: "D2C",
        label: "Bán lẻ Website",
        revenue: d2c,
        percentage: Math.round((d2c / total) * 100),
        orderCount: d2cCount,
      },
      {
        channel: "B2B",
        label: "Khách sỉ & Đại lý",
        revenue: b2b,
        percentage: Math.round((b2b / total) * 100),
        orderCount: b2bCount,
      },
      {
        channel: "O2O",
        label: "Mua tại Showroom",
        revenue: o2o,
        percentage: Math.round((o2o / total) * 100),
        orderCount: o2oCount,
      },
    ];

    return ok(shares);
  },

  async getPaymentBreakdown(): Promise<ApiResult<PaymentStat[]>> {
    await randomDelay();

    const validOrders = orders.filter(
      (o) => o.status !== ORDER_STATUS.CANCELLED,
    );
    let vqr = 0,
      cod = 0,
      ppl = 0;
    let vqrCount = 0,
      codCount = 0,
      pplCount = 0;

    validOrders.forEach((o) => {
      if (o.paymentMethod === "VIETQR") {
        vqr += o.total;
        vqrCount++;
      } else if (o.paymentMethod === "PAYPAL") {
        ppl += o.total;
        pplCount++;
      } else {
        cod += o.total;
        codCount++;
      }
    });

    const total = validOrders.length || 1;

    return ok([
      {
        method: "VIETQR",
        label: "Chuyển khoản VietQR (Tự động)",
        count: vqrCount,
        percentage: Math.round((vqrCount / total) * 100),
        totalAmount: vqr,
      },
      {
        method: "COD",
        label: "Thu hộ tiền mặt (COD)",
        count: codCount,
        percentage: Math.round((codCount / total) * 100),
        totalAmount: cod,
      },
      {
        method: "PAYPAL",
        label: "Cổng thanh toán quốc tế (PayPal)",
        count: pplCount,
        percentage: Math.round((pplCount / total) * 100),
        totalAmount: ppl,
      },
    ]);
  },

  async getTopSellingProducts(limit = 5): Promise<ApiResult<TopProduct[]>> {
    await randomDelay();

    // Map sales counts from orders
    const counts: Record<
      string,
      { sold: number; revenue: number; prodId: string; spec: string }
    > = {};

    orders.forEach((o) => {
      if (o.status === ORDER_STATUS.CANCELLED) return;
      o.items.forEach((item) => {
        if (!counts[item.skuId]) {
          counts[item.skuId] = {
            sold: 0,
            revenue: 0,
            prodId: item.productId,
            spec: item.specLabel,
          };
        }
        counts[item.skuId].sold += item.quantity;
        counts[item.skuId].revenue += item.lineTotal;
      });
    });

    const results: TopProduct[] = [];

    for (const [skuId, stats] of Object.entries(counts)) {
      const prod = products.find((p) => p.id === stats.prodId);
      const sku = prod?.skus.find((s) => s.id === skuId);
      if (prod && sku) {
        results.push({
          productId: prod.id,
          productName: prod.name,
          specLabel: sku.specLabel,
          image: prod.images[0] || "/images/products/placeholder.jpg",
          price: sku.price,
          soldCount: stats.sold,
          revenue: stats.revenue,
          currentStock: sku.stock,
          isLowStock: sku.stock < 15,
        });
      }
    }

    // Sort by revenue descending
    results.sort((a, b) => b.revenue - a.revenue);

    return ok(results.slice(0, limit));
  },

  async getInventoryAlerts(limit = 5): Promise<ApiResult<InventoryAlert[]>> {
    await randomDelay();

    const alerts: InventoryAlert[] = [];

    products.forEach((p) => {
      p.skus.forEach((s) => {
        if (s.stock <= 15) {
          alerts.push({
            skuId: s.id,
            productId: p.id,
            productName: p.name,
            specLabel: s.specLabel,
            stock: s.stock,
            threshold: 15,
            fragilityLevel: p.fragilityLevel,
          });
        }
      });
    });

    alerts.sort((a, b) => a.stock - b.stock);

    return ok(alerts.slice(0, limit));
  },

  async confirmPendingOrder(orderId: string): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return {
        success: false,
        data: null as any,
        message: "Không tìm thấy đơn hàng",
      };
    }
    order.status = ORDER_STATUS.CONFIRMED;
    order.updatedAt = new Date().toISOString();
    order.timeline.push({
      status: ORDER_STATUS.CONFIRMED,
      label: "Xác nhận đơn bởi Quản trị viên",
      timestamp: new Date().toISOString(),
    });

    return ok(order, `Đã xác nhận đơn hàng ${order.orderCode}`);
  },
};
