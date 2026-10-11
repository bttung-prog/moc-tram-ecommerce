import { useState } from 'react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Flame, Gem, Flower2, AlertTriangle, Droplets } from 'lucide-react';
import { formatVND } from '@/utils/format';
import { categories } from '@/mock/catalog';

const categoryIcon: Record<string, typeof Flame> = {
  'cat-burn': Flame,
  'cat-tool': Gem,
  'cat-zen': Flower2,
};

export function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const parentCat = categories.find((c) => c.id === product.categoryId)?.parentId;
  const topLevelCat = parentCat ? categories.find((c) => c.id === parentCat) : categories.find((c) => c.id === product.categoryId);
  const Icon = topLevelCat ? categoryIcon[topLevelCat.id] || Flame : Flame;

  const minPrice = Math.min(...product.skus.map((s) => s.price));
  const hasCompare = product.skus.some((s) => s.compareAtPrice && s.compareAtPrice > 0);
  const comparePrice = product.skus.find((s) => s.compareAtPrice && s.compareAtPrice > s.price)?.compareAtPrice;
  const inStock = product.skus.some((s) => s.stock > 0);
  const mainImage = product.images?.[0];

  return (
    <Link
      to={`/san-pham/${product.slug}`}
      className="card group overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-agarwood-50 to-agarwood-100 overflow-hidden">
        {mainImage && !imgError ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agarwood-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="h-16 w-16 text-agarwood-300/50 group-hover:scale-110 transition-transform duration-500" />
            </div>
            {/* Smoke effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-20 w-8 rounded-full bg-cream/20 blur-xl animate-smoke" />
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.featured && (
            <span className="badge bg-agarwood-800/90 text-cream backdrop-blur-sm">Nổi bật</span>
          )}
          {hasCompare && (
            <span className="badge bg-error/90 text-white">Giảm giá</span>
          )}
        </div>
        {!inStock && (
          <div className="absolute inset-0 z-10 bg-charcoal-600/40 flex items-center justify-center">
            <span className="badge bg-charcoal-600 text-cream">Hết hàng</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-base text-agarwood-800 line-clamp-2 group-hover:text-agarwood-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-charcoal-300 line-clamp-1">{product.shortDescription}</p>

        {/* Safety indicators */}
        <div className="mt-2 flex items-center gap-1.5">
          {product.fragilityLevel >= 2 && (
            <span title="Dễ vỡ" className="inline-flex items-center gap-0.5 text-xs text-warning-dark">
              <AlertTriangle className="h-3 w-3" />
            </span>
          )}
          {product.flammabilityLevel >= 2 && (
            <span title="Dễ cháy" className="inline-flex items-center gap-0.5 text-xs text-error">
              <Flame className="h-3 w-3" />
            </span>
          )}
          {product.moistureSensitive && (
            <span title="Tránh ẩm" className="inline-flex items-center gap-0.5 text-xs text-moss-500">
              <Droplets className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-charcoal-300">
            <span className="text-agarwood-400">★</span>
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-agarwood-800">{formatVND(minPrice)}</span>
            {comparePrice && (
              <span className="text-xs text-charcoal-300 line-through">{formatVND(comparePrice)}</span>
            )}
          </div>
          {product.skus.length > 1 && (
            <p className="text-xs text-charcoal-300 mt-0.5">{product.skus.length} phân loại</p>
          )}
        </div>
      </div>
    </Link>
  );
}
