import type { ApiResult, InventoryBatch, InventoryMovement, Product } from '@/types';
import { randomDelay, generateId } from '@/utils/helpers';
import { products } from '@/mock/products';
import { inventoryBatches, inventoryMovements } from '@/mock/orders';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string): ApiResult<never> {
  return { success: false, data: null, message };
}

export interface InventorySummary {
  skuId: string;
  productName: string;
  specLabel: string;
  onHand: number;
  committed: number;
  available: number;
  lowStock: boolean;
  threshold: number;
}

export const inventoryApi = {
  async getInventorySummary(): Promise<ApiResult<InventorySummary[]>> {
    await randomDelay();
    const summaries: InventorySummary[] = [];
    for (const product of products) {
      for (const sku of product.skus) {
        const committed = Math.floor(sku.stock * 0.1); // mock committed
        summaries.push({
          skuId: sku.id,
          productName: product.name,
          specLabel: sku.specLabel,
          onHand: sku.stock,
          committed,
          available: sku.stock - committed,
          lowStock: sku.stock > 0 && sku.stock < 10,
          threshold: 10,
        });
      }
    }
    return ok(summaries);
  },

  async getBatches(): Promise<ApiResult<InventoryBatch[]>> {
    await randomDelay();
    return ok([...inventoryBatches]);
  },

  async getMovements(skuId?: string): Promise<ApiResult<InventoryMovement[]>> {
    await randomDelay();
    let result = [...inventoryMovements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (skuId) result = result.filter((m) => m.skuId === skuId);
    return ok(result);
  },

  async stockIn(data: { skuId: string; quantity: number; note: string }): Promise<ApiResult<InventoryMovement>> {
    await randomDelay();
    const product = products.find((p) => p.skus.some((s) => s.id === data.skuId));
    const sku = product?.skus.find((s) => s.id === data.skuId);
    if (!sku || !product) return fail('Không tìm thấy SKU');
    sku.stock += data.quantity;
    const movement: InventoryMovement = {
      id: generateId('im'),
      skuId: data.skuId,
      productName: product.name,
      specLabel: sku.specLabel,
      type: 'IN',
      quantity: data.quantity,
      reason: data.note,
      timestamp: new Date().toISOString(),
    };
    inventoryMovements.push(movement);
    return ok(movement, 'Nhập kho thành công');
  },
};
