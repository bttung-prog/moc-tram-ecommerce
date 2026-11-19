import type {
  ApiResult,
  InventoryBatch,
  InventoryMovement,
  Order,
  ReturnRequest,
} from "@/types";
import { randomDelay, generateId } from "@/utils/helpers";
import { products } from "@/mock/products";
import {
  inventoryBatches,
  inventoryMovements,
  orders,
  returnRequests,
} from "@/mock/orders";

function ok<T>(data: T, message = "Thành công"): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string): ApiResult<never> {
  return { success: false, data: null, message };
}

export interface InventorySummary {
  skuId: string;
  productId: string;
  productName: string;
  specLabel: string;
  image: string;
  onHand: number;
  committed: number;
  available: number;
  lowStock: boolean;
  threshold: number;
  fragilityLevel?: number;
  flammabilityLevel?: number;
  moistureSensitive?: boolean;
  weightG?: number;
  price?: number;
}

export interface InboundReceiptData {
  skuId: string;
  batchCode: string;
  quantity: number;
  receivedDate: string;
  supplierOrWorkshop: string;
  note: string;
}

export const inventoryApi = {
  async getInventorySummary(): Promise<ApiResult<InventorySummary[]>> {
    await randomDelay();
    const summaries: InventorySummary[] = [];

    // Calculate committed stock from pending/confirmed/packing orders
    const committedMap = new Map<string, number>();
    for (const o of orders) {
      if (["PENDING", "CONFIRMED", "PAID", "PACKING"].includes(o.status)) {
        for (const item of o.items) {
          committedMap.set(
            item.skuId,
            (committedMap.get(item.skuId) || 0) + item.quantity,
          );
        }
      }
    }

    for (const product of products) {
      for (const sku of product.skus) {
        const committed = committedMap.get(sku.id) || 0;
        const available = Math.max(0, sku.stock - committed);
        summaries.push({
          skuId: sku.id,
          productId: product.id,
          productName: product.name,
          specLabel: sku.specLabel,
          image: product.images[0] || "/images/products/placeholder.jpg",
          onHand: sku.stock,
          committed,
          available,
          lowStock: sku.stock <= 10,
          threshold: 10,
          fragilityLevel: product.fragilityLevel,
          flammabilityLevel: product.flammabilityLevel,
          moistureSensitive: product.moistureSensitive,
          weightG: sku.weightG,
          price: sku.price,
        });
      }
    }
    return ok(summaries);
  },

  async getBatches(): Promise<ApiResult<InventoryBatch[]>> {
    await randomDelay();
    return ok(
      [...inventoryBatches].sort(
        (a, b) =>
          new Date(b.receivedDate).getTime() -
          new Date(a.receivedDate).getTime(),
      ),
    );
  },

  async getMovements(skuId?: string): Promise<ApiResult<InventoryMovement[]>> {
    await randomDelay();
    let result = [...inventoryMovements].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    if (skuId) result = result.filter((m) => m.skuId === skuId);
    return ok(result);
  },

  async stockIn(
    data: InboundReceiptData,
  ): Promise<ApiResult<InventoryMovement>> {
    await randomDelay();
    const product = products.find((p) =>
      p.skus.some((s) => s.id === data.skuId),
    );
    const sku = product?.skus.find((s) => s.id === data.skuId);
    if (!sku || !product) return fail("Không tìm thấy SKU sản phẩm");

    sku.stock += data.quantity;

    // Create batch entry
    const newBatch: InventoryBatch = {
      id: generateId("ib"),
      productId: product.id,
      productName: product.name,
      skuId: data.skuId,
      specLabel: sku.specLabel,
      batchCode:
        data.batchCode.trim() ||
        `LOT-${new Date().toISOString().slice(2, 7).replace("-", "")}-${Math.floor(100 + Math.random() * 900)}`,
      quantity: data.quantity,
      receivedDate: data.receivedDate || new Date().toISOString().slice(0, 10),
      note: `${data.supplierOrWorkshop ? `[Xưởng: ${data.supplierOrWorkshop}] ` : ""}${data.note}`.trim(),
    };
    inventoryBatches.unshift(newBatch);

    const movement: InventoryMovement = {
      id: generateId("im"),
      skuId: data.skuId,
      productName: product.name,
      specLabel: sku.specLabel,
      type: "IN",
      quantity: data.quantity,
      reason: `Nhập kho Lô ${newBatch.batchCode}${data.supplierOrWorkshop ? ` từ ${data.supplierOrWorkshop}` : ""}${data.note ? ` - ${data.note}` : ""}`,
      timestamp: new Date().toISOString(),
    };
    inventoryMovements.unshift(movement);

    return ok(
      movement,
      `Nhập kho thành công ${data.quantity} sản phẩm (Lô: ${newBatch.batchCode})`,
    );
  },

  async adjustStock(data: {
    skuId: string;
    actualStock: number;
    reason: string;
  }): Promise<ApiResult<InventoryMovement>> {
    await randomDelay();
    const product = products.find((p) =>
      p.skus.some((s) => s.id === data.skuId),
    );
    const sku = product?.skus.find((s) => s.id === data.skuId);
    if (!sku || !product) return fail("Không tìm thấy SKU sản phẩm");

    const oldStock = sku.stock;
    const diff = data.actualStock - oldStock;
    sku.stock = data.actualStock;

    const movement: InventoryMovement = {
      id: generateId("im"),
      skuId: data.skuId,
      productName: product.name,
      specLabel: sku.specLabel,
      type: "ADJUST",
      quantity: Math.abs(diff),
      reason: `Kiểm kê cân bằng: Từ ${oldStock} sang ${data.actualStock} (${diff >= 0 ? "+" : ""}${diff}) - Lý do: ${data.reason}`,
      timestamp: new Date().toISOString(),
    };
    inventoryMovements.unshift(movement);

    return ok(
      movement,
      `Đã cân bằng tồn kho SKU ${sku.id} thành ${data.actualStock}`,
    );
  },

  async getFulfillmentOrders(): Promise<ApiResult<Order[]>> {
    await randomDelay();
    const fulfillmentOrders = orders
      .filter((o) =>
        ["CONFIRMED", "PAID", "PACKING", "SHIPPING"].includes(o.status),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return ok(fulfillmentOrders);
  },

  async packOrder(
    orderId: string,
    data: { carrier: string; trackingCode: string; note?: string },
  ): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return fail("Không tìm thấy đơn hàng");

    order.status = "PACKING";
    order.updatedAt = new Date().toISOString();
    order.shipment = {
      id: generateId("ship"),
      carrier: data.carrier,
      trackingCode: data.trackingCode.trim().toUpperCase(),
      status: "CREATED",
      codStatus: order.paymentMethod === "COD" ? "PENDING" : "NONE",
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      timeline: [
        {
          status: "CREATED",
          label: "Đã đóng gói & tạo mã vận đơn",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    order.timeline.push({
      status: "PACKING",
      label: "Kho đóng gói",
      timestamp: new Date().toISOString(),
      note: `Đã đóng gói và dán mã vận đơn ${data.trackingCode} (${data.carrier})${data.note ? ` - ${data.note}` : ""}`,
    });

    return ok(order, `Đã đóng gói đơn hàng ${order.orderCode} thành công`);
  },

  async dispatchOrder(
    orderId: string,
    note?: string,
  ): Promise<ApiResult<Order>> {
    await randomDelay();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return fail("Không tìm thấy đơn hàng");

    order.status = "SHIPPING";
    order.updatedAt = new Date().toISOString();

    if (order.shipment) {
      order.shipment.status = "PICKED_UP";
      order.shipment.timeline.push({
        status: "PICKED_UP",
        label: "Bưu tá đã lấy hàng",
        timestamp: new Date().toISOString(),
      });
    }

    order.timeline.push({
      status: "SHIPPING",
      label: "Bàn giao vận chuyển",
      timestamp: new Date().toISOString(),
      note:
        note ||
        `Đã bàn giao cho đơn vị vận chuyển ${order.shipment?.carrier || ""}`,
    });

    // Record OUT movement for items
    for (const item of order.items) {
      inventoryMovements.unshift({
        id: generateId("im"),
        skuId: item.skuId,
        productName: item.productName,
        specLabel: item.specLabel,
        type: "OUT",
        quantity: item.quantity,
        reason: `Xuất kho giao đơn hàng ${order.orderCode} (Vận đơn: ${order.shipment?.trackingCode || "N/A"})`,
        timestamp: new Date().toISOString(),
      });
    }

    return ok(
      order,
      `Đã xuất kho và bàn giao đơn ${order.orderCode} cho bưu tá`,
    );
  },

  async getReturnRequests(): Promise<ApiResult<ReturnRequest[]>> {
    await randomDelay();
    return ok(
      [...returnRequests].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  },

  async inspectReturnItem(
    returnId: string,
    action: "RESTOCK" | "DAMAGED",
    note: string,
  ): Promise<ApiResult<ReturnRequest>> {
    await randomDelay();
    const ret = returnRequests.find((r) => r.id === returnId);
    if (!ret) return fail("Không tìm thấy yêu cầu đổi trả");

    ret.status = "ITEM_RECEIVED";
    const now = new Date().toISOString();
    ret.timeline.push({
      status: "ITEM_RECEIVED",
      label:
        action === "RESTOCK"
          ? "Đã nhận hàng hoàn - Đủ điều kiện nhập kho"
          : "Đã nhận hàng hoàn - Hàng lỗi/hư hỏng",
      timestamp: now,
      note,
    });

    // If restockable, add stock back to products
    const order = orders.find(
      (o) => o.id === ret.orderId || o.orderCode === ret.orderCode,
    );
    if (action === "RESTOCK" && order) {
      for (const item of order.items) {
        const product = products.find((p) => p.id === item.productId);
        const sku = product?.skus.find((s) => s.id === item.skuId);
        if (sku) {
          sku.stock += item.quantity;
          inventoryMovements.unshift({
            id: generateId("im"),
            skuId: sku.id,
            productName: item.productName,
            specLabel: sku.specLabel,
            type: "IN",
            quantity: item.quantity,
            reason: `Nhập lại kho từ đơn hoàn ${order.orderCode} (Yêu cầu ${ret.requestCode}): ${note}`,
            timestamp: now,
          });
        }
      }
    }

    return ok(
      ret,
      action === "RESTOCK"
        ? "Đã tiếp nhận và nhập lại kho thành công"
        : "Đã tiếp nhận và phân loại hàng hư hỏng",
    );
  },
};
