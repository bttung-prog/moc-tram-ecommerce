import type { ApiResult, Product, Category, Origin, AgarwoodType, AgarwoodGrade, Review, Certification } from '@/types';
import { randomDelay } from '@/utils/helpers';
import { products, reviews } from '@/mock/products';
import { categories, origins, agarwoodTypes, agarwoodGrades } from '@/mock/catalog';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string, errors?: Record<string, string>): ApiResult<never> {
  return { success: false, data: null, message, errors };
}

export interface ProductFilter {
  categorySlug?: string;
  originId?: string;
  agarwoodTypeId?: string;
  agarwoodGradeId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export const productApi = {
  async getCategories(): Promise<ApiResult<Category[]>> {
    await randomDelay(100, 300);
    return ok(categories);
  },

  async getOrigins(): Promise<ApiResult<Origin[]>> {
    await randomDelay(100, 200);
    return ok(origins);
  },

  async getAgarwoodTypes(): Promise<ApiResult<AgarwoodType[]>> {
    await randomDelay(100, 200);
    return ok(agarwoodTypes);
  },

  async getAgarwoodGrades(): Promise<ApiResult<AgarwoodGrade[]>> {
    await randomDelay(100, 200);
    return ok(agarwoodGrades);
  },

  async getProducts(filter: ProductFilter = {}): Promise<ApiResult<{ items: Product[]; total: number; page: number; totalPages: number }>> {
    await randomDelay();
    let result = products.filter((p) => p.status === 'ACTIVE');

    if (filter.categorySlug) {
      const cat = categories.find((c) => c.slug === filter.categorySlug);
      if (cat) {
        const childIds = categories.filter((c) => c.parentId === cat.id).map((c) => c.id);
        const allIds = [cat.id, ...childIds];
        result = result.filter((p) => allIds.includes(p.categoryId));
      }
    }

    if (filter.originId) result = result.filter((p) => p.originId === filter.originId);
    if (filter.agarwoodTypeId) result = result.filter((p) => p.agarwoodTypeId === filter.agarwoodTypeId);
    if (filter.agarwoodGradeId) result = result.filter((p) => p.agarwoodGradeId === filter.agarwoodGradeId);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.scentNotes.toLowerCase().includes(q)
      );
    }

    if (filter.minPrice !== undefined) result = result.filter((p) => p.skus.some((s) => s.price >= filter.minPrice!));
    if (filter.maxPrice !== undefined) result = result.filter((p) => p.skus.some((s) => s.price <= filter.maxPrice!));

    switch (filter.sort) {
      case 'price-asc':
        result = [...result].sort((a, b) => Math.min(...a.skus.map((s) => s.price)) - Math.min(...b.skus.map((s) => s.price)));
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => Math.min(...b.skus.map((s) => s.price)) - Math.min(...a.skus.map((s) => s.price)));
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    const total = result.length;
    const page = filter.page || 1;
    const limit = filter.limit || 12;
    const totalPages = Math.ceil(total / limit);
    const items = result.slice((page - 1) * limit, page * limit);

    return ok({ items, total, page, totalPages });
  },

  async getProductBySlug(slug: string): Promise<ApiResult<Product>> {
    await randomDelay();
    const product = products.find((p) => p.slug === slug);
    if (!product) return fail('Không tìm thấy sản phẩm');
    return ok(product);
  },

  async getFeaturedProducts(): Promise<ApiResult<Product[]>> {
    await randomDelay(100, 300);
    return ok(products.filter((p) => p.featured && p.status === 'ACTIVE'));
  },

  async getReviews(productId: string): Promise<ApiResult<Review[]>> {
    await randomDelay(100, 300);
    return ok(reviews.filter((r) => r.productId === productId));
  },

  async createReview(data: { productId: string; rating: number; title: string; content: string }): Promise<ApiResult<Review>> {
    await randomDelay();
    const user = JSON.parse(localStorage.getItem('moctram_user') || '{}');
    const review: Review = {
      id: `rev-${Date.now()}`,
      productId: data.productId,
      userId: user.id || 'unknown',
      userName: user.fullName || 'Khách hàng',
      rating: data.rating,
      title: data.title,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
    reviews.push(review);
    return ok(review, 'Đánh giá đã được gửi');
  },

  async checkCanReview(productId: string): Promise<ApiResult<{ canReview: boolean; reason?: string }>> {
    await randomDelay(100, 200);
    return ok({ canReview: true });
  },
};
