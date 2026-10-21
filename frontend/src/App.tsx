import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useSearchParams, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, Award, Check, ChevronDown, Flame, Leaf, MapPin, Menu, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, X, Compass, CreditCard, QrCode } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb, EmptyState, ErrorState, Pagination, SkeletonCard, StatusBadge, ScrollToTop, ProtectedRoute } from '@/components/common';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { productApi } from '@/services/productApi';
import { orderApi } from '@/services/orderApi';
import { consultationApi } from '@/services/consultationApi';
import { articles } from '@/mock/orders';
import { categories, origins, agarwoodTypes, agarwoodGrades } from '@/mock/catalog';
import { products } from '@/mock/products';
import { formatVND, formatDateTime } from '@/utils/format';
import { validateEmail, validatePhone } from '@/utils/validation';
import { APP_CONFIG, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import type { Product, Order, User } from '@/types';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, link }: { eyebrow?: string; title: string; description?: string; link?: { label: string; to: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-agarwood-500">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl text-agarwood-800 sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal-300">{description}</p>}
      </div>
      {link && (
        <Link to={link.to} className="group inline-flex items-center gap-2 text-sm font-medium text-agarwood-700 hover:text-agarwood-500">
          {link.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-agarwood-900 text-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(176,141,87,0.25),transparent_32%),radial-gradient(circle_at_12%_90%,rgba(79,93,69,0.25),transparent_35%)]" />
        <div className="container-content relative grid min-h-[580px] items-center py-16 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl animate-fade-up">
            <p className="mb-5 flex items-center gap-2 text-sm tracking-[0.2em] text-agarwood-200">
              <span className="h-px w-8 bg-agarwood-300" />TRẦM HƯƠNG VIỆT NAM
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] text-cream sm:text-7xl">
              Hương thanh tịnh.<br /><em className="text-agarwood-300">Tâm an nhiên.</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-cream/70">
              Mộc Trầm mang hương thơm nguyên bản từ những vùng trầm Khánh Hòa, Quảng Nam đến không gian sống của bạn.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/san-pham" className="btn-accent">Khám phá sản phẩm <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/gioi-thieu" className="btn border border-cream/30 text-cream hover:bg-cream/10">Câu chuyện Mộc Trầm</Link>
            </div>
            <div className="mt-12 flex items-center gap-6 text-xs text-cream/65">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-agarwood-300" />Nguồn gốc minh bạch</span>
              <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-agarwood-300" />Tự nhiên & an lành</span>
            </div>
          </div>
          <div className="relative hidden h-[460px] lg:flex items-center justify-center">
            <div className="relative w-full h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-agarwood-400/25 group">
              <img
                src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=85"
                alt="Không gian trà đạo thưởng trầm Mộc Trầm"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agarwood-950/85 via-agarwood-950/20 to-transparent" />
              <div className="absolute top-4 right-4 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5 border border-cream/20 text-xs text-cream flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-agarwood-300" />
                <span>Nghệ thuật thưởng trầm</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="font-serif text-2xl text-cream font-medium">Từ đất lành</p>
                  <p className="text-xs text-cream/70 mt-1">Đến không gian an nhiên · Tự nhiên thuần khiết</p>
                </div>
                <span className="badge bg-agarwood-800/80 text-cream backdrop-blur-sm border border-agarwood-400/30">100% Nguyên bản</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-agarwood-100 bg-cream">
        <div className="container-content grid grid-cols-2 divide-x divide-agarwood-100 py-5 md:grid-cols-4">
          <TrustItem icon={<ShieldCheck />} title="Nguồn gốc rõ ràng" text="Khánh Hòa · Quảng Nam" />
          <TrustItem icon={<Award />} title="Chứng nhận kiểm định" text="An toàn khói nhang" />
          <TrustItem icon={<Truck />} title="Giao hàng toàn quốc" text="Miễn phí từ 500.000 ₫" />
          <TrustItem icon={<PackageCheck />} title="Đóng gói cẩn thận" text="An tâm từng đơn hàng" />
        </div>
      </section>

      <section className="py-20">
        <div className="container-content">
          <SectionHeading eyebrow="Danh mục nổi bật" title="Thưởng thức theo cách của bạn" description="Mỗi dòng sản phẩm là một trải nghiệm hương thơm và không gian sống trọn vẹn." />
          <div className="grid gap-6 md:grid-cols-3">
            <CategoryFeature title="Trầm hương đốt" text="Nhang nụ, nhang vòng, bột trầm nguyên chất từ tự nhiên." to="/san-pham/tram-huong-dot" icon={<Flame className="h-6 w-6" />} image="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80" className="bg-agarwood-800 text-cream" />
            <CategoryFeature title="Dụng cụ thưởng trầm" text="Lư gốm Bát Tràng, thác khói, máy xông điện thanh lịch." to="/san-pham/dung-cu-thuong-tram" icon={<Sparkles className="h-6 w-6" />} image="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80" className="bg-agarwood-700 text-cream" />
            <CategoryFeature title="Không gian Thiền & Trà" text="Bồ đoàn thiền định, bộ trà cụ tao nhã và chuỗi hạt an yên." to="/san-pham/khong-gian-thien-tra" icon={<Leaf className="h-6 w-6" />} image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" className="bg-moss-700 text-cream" />
          </div>
        </div>
      </section>

      <section className="bg-agarwood-50/50 py-20">
        <div className="container-content">
          <SectionHeading eyebrow="Tuyển chọn tiêu biểu" title="Sản phẩm được yêu thích" description="Những tạo tác hương thơm được cộng đồng thưởng trầm trân quý và lựa chọn nhiều nhất." link={{ label: 'Xem tất cả', to: '/san-pham' }} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-content grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">Giá trị cốt lõi</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-agarwood-800">Cam kết vì sức khỏe & sự tĩnh tại của bạn</h2>
            <div className="mt-8 space-y-5">
              <ValueRow title="100% bột trầm tự nhiên" text="Không tẩm ép hóa chất tạo mùi, không dùng keo độc hại, đảm bảo khói nhang thanh nhẹ." />
              <ValueRow title="Kiểm nghiệm an toàn khói" text="Sản phẩm được kiểm định hàm lượng khí phát thải theo tiêu chuẩn an toàn không gian kín." />
              <ValueRow title="Tư vấn chuẩn xác theo nhu cầu" text="Đội ngũ am hiểu hương học hỗ trợ bạn chọn đúng loại trầm cho thiền, trà hay tiếp khách." />
            </div>
          </div>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-agarwood-200">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80" alt="Thiền định cùng hương trầm" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-3 first:pl-0 last:pr-0 md:px-5">
      <span className="text-agarwood-500">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-charcoal-500 md:text-sm">{title}</p>
        <p className="mt-0.5 hidden text-xs text-charcoal-300 sm:block">{text}</p>
      </div>
    </div>
  );
}

function CategoryFeature({ title, text, to, icon, image, className }: { title: string; text: string; to: string; icon: React.ReactNode; image?: string; className: string }) {
  return (
    <Link to={to} className={`group relative min-h-[240px] overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${className}`}>
      {image && (
        <>
          <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
        </>
      )}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-black/20 backdrop-blur-sm text-cream">{icon}</span>
          <h3 className="mt-6 font-serif text-2xl text-cream">{title}</h3>
          <p className="mt-2 max-w-xs text-sm text-cream/80">{text}</p>
        </div>
        <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-agarwood-300 group-hover:text-cream transition-colors">
          <span>Khám phá ngay</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function ValueRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-agarwood-100 text-agarwood-700">
        <Check className="h-3.5 w-3.5" />
      </span>
      <div>
        <h3 className="font-medium text-charcoal-500">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-charcoal-300">{text}</p>
      </div>
    </div>
  );
}

function ProductListPage({ categorySlugProp }: { categorySlugProp?: string }) {
  const [params] = useSearchParams();
  const routeSlug = useParams().slug;
  const categorySlug = categorySlugProp || (routeSlug && categories.some((c) => c.slug === routeSlug) ? routeSlug : undefined);

  const [data, setData] = useState<{ items: Product[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');
  const search = params.get('search') || '';
  const [origin, setOrigin] = useState('');
  const [type, setType] = useState('');
  const [grade, setGrade] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    productApi
      .getProducts({
        categorySlug,
        search,
        originId: origin || undefined,
        agarwoodTypeId: type || undefined,
        agarwoodGradeId: grade || undefined,
        sort,
        page,
        limit: 12,
      })
      .then((r) => {
        if (r.success && r.data) setData(r.data);
        else setError(r.message);
      })
      .catch(() => setError('Không thể tải danh sách sản phẩm'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [categorySlug, search, origin, type, grade, sort, page]);

  const currentCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
  const title = currentCategory ? currentCategory.name : 'Tất cả sản phẩm';

  return (
    <PageShell>
      <div className="container-content py-8">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, ...(currentCategory ? [{ label: 'Sản phẩm', path: '/san-pham' }] : []), { label: title }]} />
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">Bộ sưu tập Mộc Trầm</p>
            <h1 className="mt-2 font-serif text-4xl text-agarwood-800">{title}</h1>
            <p className="mt-2 text-sm text-charcoal-300">{data?.total ?? '...'} sản phẩm được chọn lọc</p>
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline sm:hidden">
            Bộ lọc <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <FilterPanel origin={origin} setOrigin={setOrigin} type={type} setType={setType} grade={grade} setGrade={setGrade} clear={() => { setOrigin(''); setType(''); setGrade(''); }} />
          </aside>
          <section>
            <div className="mb-5 flex items-center justify-between border-b border-agarwood-100 pb-4">
              <p className="text-sm text-charcoal-300">{data?.total || 0} kết quả</p>
              <select value={sort} onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }} className="rounded-lg border border-agarwood-100 bg-white px-3 py-2 text-sm text-charcoal-500">
                <option value="rating">Phổ biến nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}</div>
            ) : error ? (
              <ErrorState message={error} onRetry={load} />
            ) : data?.items.length ? (
              <>
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">{data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
              </>
            ) : (
              <EmptyState icon={<PackageCheck className="h-12 w-12" />} title="Chưa tìm thấy sản phẩm" description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm." />
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function FilterPanel({ origin, setOrigin, type, setType, grade, setGrade, clear }: { origin: string; setOrigin: (v: string) => void; type: string; setType: (v: string) => void; grade: string; setGrade: (v: string) => void; clear: () => void }) {
  return (
    <div className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-medium text-charcoal-500">Bộ lọc</h3>
        <button onClick={clear} className="text-xs text-agarwood-600 hover:underline">Xóa lọc</button>
      </div>
      <FilterSelect label="Xuất xứ" value={origin} onChange={setOrigin} options={origins.map((o) => [o.id, o.name])} />
      <FilterSelect label="Loại trầm" value={type} onChange={setType} options={agarwoodTypes.map((o) => [o.id, o.name])} />
      <FilterSelect label="Cấp trầm" value={grade} onChange={setGrade} options={agarwoodGrades.map((o) => [o.id, o.name])} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <label className="mb-5 block last:mb-0">
      <span className="mb-2 block text-xs font-medium text-charcoal-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-base">
        <option value="">Tất cả</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [sku, setSku] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      productApi.getProductBySlug(slug).then((r) => {
        if (r.success && r.data) {
          setProduct(r.data);
          setActiveImg(0);
        } else {
          setProduct(null);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <PageShell>
        <div className="container-content py-24 text-center">
          <div className="skeleton mx-auto h-8 w-64" />
        </div>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell>
        <div className="container-content py-20">
          <EmptyState
            icon={<Flame className="h-12 w-12" />}
            title="Không tìm thấy sản phẩm"
            description="Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác."
            action={<Link to="/san-pham" className="btn-primary">Xem các sản phẩm khác</Link>}
          />
        </div>
      </PageShell>
    );
  }

  const selected = product.skus[sku] || product.skus[0];
  const currentImage = product.images?.[activeImg] || product.images?.[0];

  const add = async () => {
    if (!selected) return;
    await addToCart({
      skuId: selected.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images?.[0] || '',
      specLabel: selected.specLabel,
      price: selected.price,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <PageShell>
      <div className="container-content py-8">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, { label: 'Sản phẩm', path: '/san-pham' }, { label: product.name }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Images Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-agarwood-50 to-agarwood-100 border border-agarwood-100 shadow-sm">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="h-full w-full object-cover object-center transition-all duration-500" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="h-32 w-32 text-agarwood-300/50" />
                  <div className="absolute bottom-10 left-1/2 h-32 w-12 -translate-x-1/2 rounded-full bg-cream/30 blur-2xl animate-smoke" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? 'border-agarwood-600 ring-2 ring-agarwood-600/20' : 'border-agarwood-100 hover:border-agarwood-300 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">
              {origins.find((o) => o.id === product.originId)?.name} · {agarwoodTypes.find((t) => t.id === product.agarwoodTypeId)?.name}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-agarwood-800">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-agarwood-400">★★★★★</span>
              <span className="text-sm text-charcoal-300">{product.rating.toFixed(1)} · {product.reviewCount} đánh giá</span>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-charcoal-400">{product.description}</p>
            {product.scentNotes && (
              <div className="mt-5 rounded-xl bg-agarwood-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-agarwood-600">Hương thơm</p>
                <p className="mt-1 text-sm text-charcoal-500">{product.scentNotes}</p>
              </div>
            )}
            <div className="mt-7">
              <p className="mb-2 text-sm font-medium text-charcoal-500">Chọn phân loại</p>
              <div className="flex flex-wrap gap-2">
                {product.skus.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSku(i)}
                    disabled={!s.stock}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${sku === i ? 'border-agarwood-500 bg-agarwood-50 text-agarwood-800' : 'border-agarwood-100 text-charcoal-400'} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {s.specLabel}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <span className="text-3xl font-semibold text-agarwood-800">{selected ? formatVND(selected.price) : '0 ₫'}</span>
                {selected?.compareAtPrice ? <span className="ml-2 text-sm text-charcoal-300 line-through">{formatVND(selected.compareAtPrice)}</span> : null}
              </div>
              <span className={`badge ${selected?.stock ? 'bg-success-light text-success-dark' : 'bg-error-light text-error-dark'}`}>
                {selected?.stock ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <div className="flex items-center rounded-lg border border-agarwood-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-charcoal-400">−</button>
                <span className="min-w-8 text-center text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-charcoal-400">+</button>
              </div>
              <button onClick={add} disabled={!selected?.stock} className="btn-primary flex-1">
                {added ? <><Check className="h-4 w-4" />Đã thêm vào giỏ</> : <><ShoppingBag className="h-4 w-4" />Thêm vào giỏ</>}
              </button>
            </div>
            {product.safetyWarning && (
              <div className="mt-6 flex gap-2 rounded-lg border border-warning/30 bg-warning-light/40 p-3 text-xs text-warning-dark">
                <span>!</span>
                <p>{product.safetyWarning}</p>
              </div>
            )}
            <div className="mt-6 border-t border-agarwood-100 pt-5">
              <div className="flex flex-wrap gap-4 text-xs text-charcoal-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" />Chứng nhận kiểm định</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-agarwood-500" />Nguồn gốc minh bạch</span>
                <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-moss-400" />Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/**
 * Tuyến thông minh: Tự động phân định xem `:slug` là danh mục hay sản phẩm
 */
function ProductOrCategoryRoute() {
  const { slug } = useParams();
  const isCategory = categories.some((c) => c.slug === slug);
  if (isCategory) {
    return <ProductListPage categorySlugProp={slug} />;
  }
  return <ProductDetailPage />;
}

function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [totals, setTotals] = useState({ subtotal: 0, shippingFee: 0, discount: 0, total: 0 });
  useEffect(() => {
    import('@/services/cartApi').then(({ cartApi }) => cartApi.getCartTotals(items).then((r) => r.success && r.data && setTotals(r.data)));
  }, [items]);

  return (
    <PageShell>
      <div className="container-content py-10">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, { label: 'Giỏ hàng' }]} />
        <h1 className="mt-6 font-serif text-4xl text-agarwood-800">Giỏ hàng</h1>
        {items.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="h-14 w-14" />} title="Giỏ hàng đang trống" description="Hãy chọn một mùi hương để bắt đầu hành trình an nhiên." action={<Link to="/san-pham" className="btn-primary">Khám phá sản phẩm</Link>} />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.skuId} className="card flex gap-4 p-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-agarwood-50 border border-agarwood-100">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Flame className="h-8 w-8 text-agarwood-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/san-pham/${item.productSlug}`} className="font-serif text-lg text-agarwood-800 hover:text-agarwood-600 line-clamp-1">{item.productName}</Link>
                    <p className="mt-1 text-xs text-charcoal-300">{item.specLabel}</p>
                    <p className="mt-2 font-medium text-agarwood-700">{formatVND(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.skuId)} className="text-charcoal-300 hover:text-error"><X className="h-4 w-4" /></button>
                    <div className="flex items-center rounded-lg border border-agarwood-100">
                      <button onClick={() => updateQuantity(item.skuId, item.quantity - 1)} className="px-2 py-1 text-charcoal-400">−</button>
                      <span className="min-w-7 text-center text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.skuId, item.quantity + 1)} className="px-2 py-1 text-charcoal-400">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card h-fit p-6">
              <h2 className="font-serif text-xl text-agarwood-800">Tóm tắt đơn hàng</h2>
              <div className="mt-5 space-y-3 border-b border-agarwood-100 pb-5 text-sm">
                <div className="flex justify-between text-charcoal-400"><span>Tạm tính</span><span>{formatVND(totals.subtotal)}</span></div>
                <div className="flex justify-between text-charcoal-400"><span>Phí vận chuyển</span><span>{totals.shippingFee ? formatVND(totals.shippingFee) : 'Miễn phí'}</span></div>
              </div>
              <div className="flex justify-between py-5 font-semibold text-agarwood-800"><span>Tổng cộng</span><span>{formatVND(totals.total)}</span></div>
              <Link to="/thanh-toan" className="btn-primary w-full">Tiến hành thanh toán <ArrowRight className="h-4 w-4" /></Link>
              <p className="mt-3 text-center text-xs text-charcoal-300">Giá và phí được xác nhận từ hệ thống</p>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shippingFullName: user?.fullName || '',
    shippingPhone: user?.phone || '',
    shippingProvince: 'Hồ Chí Minh',
    shippingWard: 'Phường Bến Nghé, Quận 1',
    shippingDetail: '',
    paymentMethod: 'COD' as 'COD' | 'VIETQR' | 'PAYPAL',
    note: '',
    couponCode: '',
    privacyConsent: true,
  });

  const [totals, setTotals] = useState({ subtotal: 0, shippingFee: 0, discount: 0, total: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    import('@/services/cartApi').then(({ cartApi }) =>
      cartApi.getCartTotals(items).then((r) => r.success && r.data && setTotals(r.data))
    );
  }, [items]);

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="container-content py-16">
          <EmptyState
            icon={<ShoppingBag className="h-14 w-14" />}
            title="Chưa có sản phẩm nào để thanh toán"
            description="Giỏ hàng của bạn đang trống. Hãy chọn sản phẩm trước khi thanh toán."
            action={<Link to="/san-pham" className="btn-primary">Khám phá sản phẩm</Link>}
          />
        </div>
      </PageShell>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const pErr = validatePhone(form.shippingPhone);
    if (pErr) {
      setError(pErr);
      return;
    }
    if (!form.privacyConsent) {
      setError('Bạn cần đồng ý với chính sách bảo mật để tiếp tục.');
      return;
    }

    setBusy(true);
    try {
      const res = await orderApi.createOrder({
        items: items.map((i) => ({
          skuId: i.skuId,
          productId: i.productId,
          productName: i.productName,
          productSlug: i.productSlug,
          specLabel: i.specLabel,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingFullName: form.shippingFullName,
        shippingPhone: form.shippingPhone,
        shippingProvince: form.shippingProvince,
        shippingWard: form.shippingWard,
        shippingDetail: form.shippingDetail,
        paymentMethod: form.paymentMethod,
        note: form.note,
        couponCode: form.couponCode,
        privacyConsent: form.privacyConsent,
        customerName: form.shippingFullName,
      });

      if (res.success && res.data) {
        await clearCart();
        navigate(`/tra-cuu-don-hang/${res.data.orderCode}`);
      } else {
        setError(res.message || 'Không thể tạo đơn hàng');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="container-content py-10 max-w-5xl">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, { label: 'Giỏ hàng', path: '/gio-hang' }, { label: 'Thanh toán' }]} />
        <h1 className="mt-6 font-serif text-4xl text-agarwood-800">Thanh toán đơn hàng</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Thông tin giao hàng & phương thức thanh toán */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-serif text-xl text-agarwood-800 mb-4">1. Thông tin giao hàng</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Họ và tên người nhận" value={form.shippingFullName} set={(v) => setForm({ ...form, shippingFullName: v })} required />
                <Field label="Số điện thoại" value={form.shippingPhone} set={(v) => setForm({ ...form, shippingPhone: v })} required />
                <Field label="Tỉnh / Thành phố" value={form.shippingProvince} set={(v) => setForm({ ...form, shippingProvince: v })} required />
                <Field label="Phường / Xã / Quận" value={form.shippingWard} set={(v) => setForm({ ...form, shippingWard: v })} required />
                <div className="sm:col-span-2">
                  <Field label="Địa chỉ cụ thể (Số nhà, tên đường)" value={form.shippingDetail} set={(v) => setForm({ ...form, shippingDetail: v })} required />
                </div>
                <div className="sm:col-span-2">
                  <label>
                    <span className="label-base">Ghi chú giao hàng (Tùy chọn)</span>
                    <input className="input-base" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao" />
                  </label>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-serif text-xl text-agarwood-800 mb-4">2. Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'COD' ? 'border-agarwood-600 bg-agarwood-50/60 ring-1 ring-agarwood-600/30' : 'border-agarwood-100 hover:border-agarwood-300'}`}>
                  <input type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === 'COD'} onChange={() => setForm({ ...form, paymentMethod: 'COD' })} className="accent-agarwood-700" />
                  <Truck className="h-5 w-5 text-agarwood-600" />
                  <div>
                    <p className="text-sm font-semibold text-agarwood-800">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-charcoal-300">Kiểm tra hàng trước khi thanh toán tiền mặt</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'VIETQR' ? 'border-agarwood-600 bg-agarwood-50/60 ring-1 ring-agarwood-600/30' : 'border-agarwood-100 hover:border-agarwood-300'}`}>
                  <input type="radio" name="paymentMethod" value="VIETQR" checked={form.paymentMethod === 'VIETQR'} onChange={() => setForm({ ...form, paymentMethod: 'VIETQR' })} className="accent-agarwood-700" />
                  <QrCode className="h-5 w-5 text-agarwood-600" />
                  <div>
                    <p className="text-sm font-semibold text-agarwood-800">Chuyển khoản VietQR (Khuyên dùng)</p>
                    <p className="text-xs text-charcoal-300">Quét mã QR qua ứng dụng ngân hàng, xác nhận tự động</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'PAYPAL' ? 'border-agarwood-600 bg-agarwood-50/60 ring-1 ring-agarwood-600/30' : 'border-agarwood-100 hover:border-agarwood-300'}`}>
                  <input type="radio" name="paymentMethod" value="PAYPAL" checked={form.paymentMethod === 'PAYPAL'} onChange={() => setForm({ ...form, paymentMethod: 'PAYPAL' })} className="accent-agarwood-700" />
                  <CreditCard className="h-5 w-5 text-agarwood-600" />
                  <div>
                    <p className="text-sm font-semibold text-agarwood-800">PayPal / Thẻ quốc tế</p>
                    <p className="text-xs text-charcoal-300">Dành cho khách hàng quốc tế</p>
                  </div>
                </label>
              </div>

              <div className="mt-5 pt-4 border-t border-agarwood-100">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-charcoal-400">
                  <input type="checkbox" checked={form.privacyConsent} onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })} className="mt-0.5 accent-agarwood-700" />
                  <span>Tôi đã đọc và đồng ý với <Link to="/chinh-sach/chinh-sach-bao-mat" className="text-agarwood-700 underline" target="_blank">Chính sách bảo mật</Link> và điều khoản mua sắm của Mộc Trầm.</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tóm tắt & Nút đặt hàng */}
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-serif text-xl text-agarwood-800">Sản phẩm ({items.length})</h2>
              <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-agarwood-100 pr-1">
                {items.map((i) => (
                  <div key={i.skuId} className="py-2.5 flex justify-between gap-3 text-xs">
                    <div>
                      <p className="font-medium text-agarwood-800 line-clamp-1">{i.productName}</p>
                      <p className="text-charcoal-300">{i.specLabel} × {i.quantity}</p>
                    </div>
                    <span className="font-medium text-agarwood-700 shrink-0">{formatVND(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-agarwood-100 pt-4 text-sm">
                <div className="flex justify-between text-charcoal-400"><span>Tạm tính</span><span>{formatVND(totals.subtotal)}</span></div>
                <div className="flex justify-between text-charcoal-400"><span>Phí vận chuyển</span><span>{totals.shippingFee ? formatVND(totals.shippingFee) : 'Miễn phí'}</span></div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-success"><span>Giảm giá</span><span>-{formatVND(totals.discount)}</span></div>
                )}
              </div>

              <div className="mt-4 flex justify-between border-t border-agarwood-100 py-4 font-semibold text-lg text-agarwood-800">
                <span>Tổng thanh toán</span>
                <span className="text-agarwood-700">{formatVND(totals.total)}</span>
              </div>

              {error && <p className="mb-4 rounded-lg bg-error-light p-3 text-xs text-error-dark">{error}</p>}

              <button disabled={busy} className="btn-primary w-full">
                {busy ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/tai-khoan';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={redirect} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const result = await login(form.email, form.password);
        if (result.requiresMfa) {
          setError('Tài khoản nhân viên cần xác thực MFA. Demo: nhập 6 chữ số bất kỳ.');
        } else {
          navigate(redirect);
        }
      } else {
        const p = validatePhone(form.phone);
        const em = validateEmail(form.email);
        if (p || em) throw new Error(p || em || 'Thông tin chưa hợp lệ');
        await register(form);
        navigate(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="container-content flex min-h-[620px] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-agarwood-400 bg-agarwood-50 font-serif text-2xl text-agarwood-800">M</div>
            <h1 className="mt-5 font-serif text-3xl text-agarwood-800">{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</h1>
            <p className="mt-2 text-sm text-charcoal-300">{mode === 'login' ? 'Đăng nhập để theo dõi hành trình đơn hàng.' : 'Lưu lại những khoảnh khắc an nhiên của bạn.'}</p>
          </div>
          <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
            {mode === 'register' && (
              <>
                <label className="block">
                  <span className="label-base">Họ và tên</span>
                  <input required className="input-base" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </label>
                <label className="block">
                  <span className="label-base">Số điện thoại</span>
                  <input required className="input-base" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090 123 4567" />
                </label>
              </>
            )}
            <label className="block">
              <span className="label-base">Email</span>
              <input required type="email" className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="label-base">Mật khẩu</span>
              <input required type="password" className="input-base" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 8 ký tự" />
            </label>
            {error && <p className="rounded-lg bg-error-light p-3 text-sm text-error-dark">{error}</p>}
            <button disabled={busy} className="btn-primary w-full">{busy ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button>
            <div className="text-center text-sm text-charcoal-300">
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="font-medium text-agarwood-700 hover:underline">
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-xs text-charcoal-300">Demo khách hàng: annguyen@email.com<br />Demo quản trị: admin@moctram.vn</p>
        </div>
      </div>
    </PageShell>
  );
}

function LookupPage() {
  const { orderCode: urlCode } = useParams();
  const [code, setCode] = useState(urlCode || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode);
      orderApi.getOrderByCode(urlCode).then((r) => {
        if (r.success && r.data) {
          setOrder(r.data);
        }
      });
    }
  }, [urlCode]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const r = await orderApi.getOrderByCode(code.trim(), phone.trim() || undefined);
    if (r.success && r.data) setOrder(r.data);
    else setError(r.message || 'Không tìm thấy đơn hàng');
  };

  return (
    <PageShell>
      <div className="container-content max-w-3xl py-12">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, { label: 'Tra cứu đơn hàng' }]} />
        <div className="mt-8 text-center">
          <PackageCheck className="mx-auto h-12 w-12 text-agarwood-400" />
          <h1 className="mt-4 font-serif text-4xl text-agarwood-800">Tra cứu đơn hàng</h1>
          <p className="mt-2 text-sm text-charcoal-300">Nhập mã đơn hàng và số điện thoại để xem trạng thái vận chuyển</p>
        </div>
        <form onSubmit={submit} className="card mx-auto mt-8 grid gap-4 p-6 sm:grid-cols-2">
          <label>
            <span className="label-base">Mã đơn hàng</span>
            <input required className="input-base" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ví dụ: MT251003A7K2" />
          </label>
          <label>
            <span className="label-base">Số điện thoại (Tùy chọn khi tra cứu theo mã)</span>
            <input className="input-base" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" />
          </label>
          <button className="btn-primary sm:col-span-2">Tra cứu đơn hàng <Search className="h-4 w-4" /></button>
          {error && <p className="sm:col-span-2 rounded-lg bg-error-light p-3 text-sm text-error-dark">{error}</p>}
        </form>
        {order && <OrderSummary order={order} />}
      </div>
    </PageShell>
  );
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="card mt-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-agarwood-500">Mã đơn hàng</span>
          <h2 className="font-serif text-2xl text-agarwood-800">{order.orderCode}</h2>
          <p className="text-xs text-charcoal-300 mt-1">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge label={ORDER_STATUS_LABELS[order.status] || order.status} colorClass={ORDER_STATUS_COLORS[order.status] || 'bg-agarwood-100 text-agarwood-700'} />
      </div>

      <div className="mt-6 divide-y divide-agarwood-100 border-y border-agarwood-100 py-4">
        {order.items.map((i) => (
          <div key={i.id} className="flex items-center justify-between py-2 text-sm">
            <div>
              <p className="font-medium text-agarwood-800">{i.productName}</p>
              <p className="text-xs text-charcoal-300">{i.specLabel} × {i.quantity}</p>
            </div>
            <span className="font-medium text-agarwood-700">{formatVND(i.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-charcoal-400">Tổng thanh toán:</span>
        <span className="font-semibold text-agarwood-800 text-base">{formatVND(order.total)}</span>
      </div>
    </div>
  );
}

function ContentPage({ slug }: { slug: string }) {
  const article = articles.find((a) => a.slug === slug) || articles.find((a) => a.slug === 'gioi-thieu');
  if (!article) return null;
  return (
    <PageShell>
      <div className="container-content max-w-3xl py-12">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, { label: article.type === 'POLICY' ? 'Chính sách' : article.type === 'ABOUT' ? 'Giới thiệu' : 'Cẩm nang', path: article.type === 'GUIDE' ? '/cam-nang' : undefined }, { label: article.title }]} />
        <article className="mt-10">
          <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">{article.type === 'GUIDE' ? 'Cẩm nang thưởng trầm' : article.type === 'POLICY' ? 'Thông tin pháp lý' : 'Về Mộc Trầm'}</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl leading-tight text-agarwood-800">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-charcoal-400">{article.excerpt}</p>
          {article.image && (
            <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-md border border-agarwood-100">
              <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="mt-10 border-t border-agarwood-100 pt-8 text-base leading-[1.9] text-charcoal-500 whitespace-pre-line">{article.content}</div>
        </article>
      </div>
    </PageShell>
  );
}

function AccountPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    orderApi.getMyOrders().then((r) => r.success && r.data && setOrders(r.data));
  }, []);

  if (!user) return <Navigate to="/dang-nhap" replace />;

  return (
    <PageShell>
      <div className="container-content py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">Xin chào</p>
            <h1 className="mt-2 font-serif text-4xl text-agarwood-800">{user.fullName}</h1>
          </div>
          <button onClick={logout} className="btn-outline">Đăng xuất</button>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="card h-fit p-2">
            <div className="rounded-lg bg-agarwood-50 px-4 py-3 text-sm font-medium text-agarwood-800">Đơn hàng của tôi</div>
            <div className="px-4 py-3 text-sm text-charcoal-400">Thông tin cá nhân</div>
            <div className="px-4 py-3 text-sm text-charcoal-400">Sổ địa chỉ</div>
          </aside>
          <section>
            <h2 className="font-serif text-2xl text-agarwood-800">Lịch sử đơn hàng</h2>
            <div className="mt-5 space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-charcoal-300">Bạn chưa có đơn hàng nào.</p>
              ) : (
                orders.map((order) => (
                  <Link key={order.id} to={`/tai-khoan/don-hang/${order.orderCode}`} className="card flex flex-wrap items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md">
                    <div>
                      <p className="font-medium text-agarwood-800">{order.orderCode}</p>
                      <p className="mt-1 text-xs text-charcoal-300">{formatDateTime(order.createdAt)} · {order.items.length} sản phẩm</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-sm font-medium text-agarwood-700">{formatVND(order.total)}</span>
                      <StatusBadge label={ORDER_STATUS_LABELS[order.status] || order.status} colorClass={ORDER_STATUS_COLORS[order.status] || 'bg-agarwood-100 text-agarwood-700'} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function B2BPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', b2bType: 'SPA', productsInterested: '', quantity: '', budget: '', note: '' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await consultationApi.createQuoteRequest(form);
    setSent(true);
  };

  return (
    <PageShell>
      <div className="container-content max-w-3xl py-12">
        <Breadcrumb items={[{ label: 'Trang chủ', path: '/' }, { label: 'Báo giá B2B' }]} />
        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">Giải pháp cho doanh nghiệp</p>
          <h1 className="mt-3 font-serif text-5xl text-agarwood-800">Báo giá B2B & Đặt lịch showroom</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal-300">Từ trà thất, thiền viện đến spa, resort và quà tặng doanh nghiệp — hãy để chúng tôi cùng bạn tạo nên một không gian có hương.</p>
        </div>
        {sent ? (
          <div className="card mt-10 p-10 text-center">
            <Check className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 font-serif text-2xl text-agarwood-800">Đã nhận yêu cầu</h2>
            <p className="mt-2 text-sm text-charcoal-300">Đội ngũ Mộc Trầm sẽ liên hệ với bạn trong 1 ngày làm việc.</p>
            <Link to="/" className="btn-primary mt-6">Về trang chủ</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-10 grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Tên đơn vị" value={form.companyName} set={(v) => setForm({ ...form, companyName: v })} required />
            <Field label="Người liên hệ" value={form.contactName} set={(v) => setForm({ ...form, contactName: v })} required />
            <Field label="Email" type="email" value={form.email} set={(v) => setForm({ ...form, email: v })} required />
            <Field label="Số điện thoại" value={form.phone} set={(v) => setForm({ ...form, phone: v })} required />
            <label>
              <span className="label-base">Loại hình</span>
              <select className="input-base" value={form.b2bType} onChange={(e) => setForm({ ...form, b2bType: e.target.value })}>
                <option value="TEA_HOUSE">Trà thất</option>
                <option value="ZEN_MONASTERY">Thiền viện</option>
                <option value="SPA">Spa</option>
                <option value="RESORT">Resort</option>
                <option value="CORPORATE_GIFT">Quà tặng doanh nghiệp</option>
                <option value="OTHER">Khác</option>
              </select>
            </label>
            <Field label="Ngân sách dự kiến" value={form.budget} set={(v) => setForm({ ...form, budget: v })} />
            <Field label="Sản phẩm quan tâm" value={form.productsInterested} set={(v) => setForm({ ...form, productsInterested: v })} required />
            <Field label="Số lượng dự kiến" value={form.quantity} set={(v) => setForm({ ...form, quantity: v })} required />
            <label className="sm:col-span-2">
              <span className="label-base">Nhu cầu chi tiết</span>
              <textarea className="input-base min-h-28" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </label>
            <button className="btn-primary sm:col-span-2">Gửi yêu cầu báo giá <ArrowRight className="h-4 w-4" /></button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

function NotFoundPage() {
  return (
    <PageShell>
      <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-agarwood-100/60 text-agarwood-700 mb-6">
          <Compass className="h-10 w-10 animate-pulse text-agarwood-600" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-agarwood-500 font-semibold">Lỗi 404 — Không tìm thấy trang</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-agarwood-800">Lạc giữa làn khói trầm</h1>
        <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-charcoal-300">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác. Hãy cùng Mộc Trầm quay về không gian an nhiên ban đầu.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            Về trang chủ
          </Link>
          <Link to="/san-pham" className="btn-outline">
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, value, set, type = 'text', required }: { label: string; value: string; set: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="label-base">{label}</span>
      <input required={required} type={type} className="input-base" value={value} onChange={(e) => set(e.target.value)} />
    </label>
  );
}

function PolicyRoute() {
  const { slug } = useParams();
  return <ContentPage slug={slug || 'chinh-sach-bao-mat'} />;
}

/**
 * CẤU HÌNH ĐỊNH TUYẾN URL (ROUTING) CHO DỰ ÁN
 */
function AppRoutes() {
  return (
    <Routes>
      {/* 1. Trang chủ */}
      <Route path={ROUTES.HOME} element={<HomePage />} />

      {/* 2. Danh sách sản phẩm & danh mục */}
      <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
      <Route path={ROUTES.CATEGORY} element={<ProductListPage />} />
      {/* Hỗ trợ cả category slug và product slug từ menu & card */}
      <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductOrCategoryRoute />} />

      {/* 3. Giỏ hàng & Thanh toán */}
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />

      {/* 4. Xác thực & Tài khoản */}
      <Route path={ROUTES.AUTH} element={<AuthPage />} />
      <Route
        path={ROUTES.ACCOUNT}
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ACCOUNT_ORDER_DETAIL}
        element={
          <ProtectedRoute>
            <LookupPage />
          </ProtectedRoute>
        }
      />

      {/* 5. Tra cứu đơn hàng */}
      <Route path={ROUTES.ORDER_LOOKUP} element={<LookupPage />} />
      <Route path={ROUTES.ORDER_LOOKUP_CODE} element={<LookupPage />} />

      {/* 6. Trang thông tin, cẩm nang & chính sách */}
      <Route path={ROUTES.ABOUT} element={<ContentPage slug="gioi-thieu" />} />
      <Route path={ROUTES.GUIDE} element={<ContentPage slug="cach-thuong-tram-dung-cach" />} />
      <Route path={ROUTES.GUIDE_DETAIL} element={<ContentPage slug="cach-thuong-tram-dung-cach" />} />
      <Route path={ROUTES.POLICY} element={<PolicyRoute />} />

      {/* 7. B2B & Showroom */}
      <Route path={ROUTES.B2B} element={<B2BPage />} />
      <Route path={ROUTES.SHOWROOM} element={<B2BPage />} />

      {/* 8. Trang 404 Not Found (Xử lý tất cả các đường dẫn không hợp lệ) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Tự động cuộn trang lên đầu khi chuyển route */}
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
