import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Flame,
  Gem,
  Leaf,
  Mail,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
  Compass,
  CreditCard,
  QrCode,
  User as UserIcon,
  Warehouse,
  Headphones,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminPlaceholderPage } from "@/pages/admin/AdminPlaceholderPage";
import {
  Breadcrumb,
  EmptyState,
  ErrorState,
  Pagination,
  SkeletonCard,
  StatusBadge,
  ScrollToTop,
  ProtectedRoute,
} from "@/components/common";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { productApi } from "@/services/productApi";
import { orderApi } from "@/services/orderApi";
import { authApi } from "@/services/authApi";
import { consultationApi } from "@/services/consultationApi";
import { articles } from "@/mock/orders";
import {
  categories,
  origins,
  agarwoodTypes,
  agarwoodGrades,
} from "@/mock/catalog";
import { products } from "@/mock/products";
import { formatVND, formatDateTime } from "@/utils/format";
import { validateEmail, validatePhone } from "@/utils/validation";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants/enums";
import { ROUTES } from "@/constants/routes";
import type { Product, Order } from "@/types";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { label: string; to: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-agarwood-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-3xl text-agarwood-800 sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal-300">
            {description}
          </p>
        )}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex items-center gap-2 text-sm font-medium text-agarwood-700 hover:text-agarwood-500"
        >
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
      <section className="relative overflow-hidden text-cream min-h-[560px] lg:min-h-[620px] flex items-center">
        {/* Full Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-banner.jpg"
            alt="Mộc Trầm - Trầm hương thuần khiết"
            className="w-full h-full object-cover object-right lg:object-center"
          />
          {/* Subtle gradient overlay to enhance text readability on the left while keeping the incense burner and bracelet visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-agarwood-950/90 via-agarwood-950/65 to-transparent sm:w-4/5 lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-agarwood-950/40 via-transparent to-black/20" />
        </div>

        <div className="container-content relative py-20 lg:py-24">
          <div className="max-w-xl animate-fade-up">
            <p className="mb-5 flex items-center gap-2 text-sm tracking-[0.2em] text-agarwood-200">
              <span className="h-px w-8 bg-agarwood-300" />
              TRẦM HƯƠNG VIỆT NAM
            </p>
            <h1 className="font-serif text-5xl leading-[1.08] text-cream sm:text-6xl lg:text-7xl">
              Hương thanh tịnh.
              <br />
              <em className="text-agarwood-300 font-normal">Tâm an nhiên.</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/80">
              Mộc Trầm mang hương thơm nguyên bản từ vùng trầm danh tiếng đến
              không gian sống của bạn.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/san-pham" className="btn-accent">
                Khám phá sản phẩm <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/gioi-thieu"
                className="btn border border-cream/40 bg-black/25 text-cream backdrop-blur-sm hover:bg-cream/15 transition-all"
              >
                Câu chuyện Mộc Trầm
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-xs text-cream/75">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-agarwood-300" />
                Nguồn gốc minh bạch
              </span>
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-agarwood-300" />
                Tự nhiên & an lành
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-agarwood-100 bg-cream">
        <div className="container-content grid grid-cols-2 divide-x divide-agarwood-100 py-5 md:grid-cols-4">
          <TrustItem
            icon={<ShieldCheck />}
            title="Nguồn gốc rõ ràng"
            text="Hương Khê (Hà Tĩnh)"
          />
          <TrustItem
            icon={<Award />}
            title="Chứng nhận kiểm định"
            text="An toàn khói nhang"
          />
          <TrustItem
            icon={<Truck />}
            title="Giao hàng toàn quốc"
            text="Miễn phí từ 500.000 ₫"
          />
          <TrustItem
            icon={<PackageCheck />}
            title="Đóng gói cẩn thận"
            text="An tâm từng đơn hàng"
          />
        </div>
      </section>

      <section className="py-20">
        <div className="container-content">
          <SectionHeading
            eyebrow="Danh mục nổi bật"
            title="Thưởng thức theo cách của bạn"
            description="Mỗi dòng sản phẩm là một trải nghiệm hương thơm và không gian sống trọn vẹn."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryFeature
              title="Trầm hương đốt"
              text="Nhang nụ, nhang vòng, nhang tăm, bột trầm tự nhiên."
              to="/san-pham/tram-huong-dot"
              icon={<Flame className="h-6 w-6" />}
              image="/images/cat-tram-huong-dot.jpg"
              className="bg-agarwood-800 text-cream"
            />
            <CategoryFeature
              title="Vòng tay trầm hương"
              text="Chuỗi 108 hạt, vòng đơn, đốt trúc tự nhiên tinh tế."
              to="/san-pham/vong-tay-tram-huong"
              icon={<Gem className="h-6 w-6" />}
              image="/images/products/prod-012-wearing.jpg"
              className="bg-agarwood-900 text-cream"
            />
          </div>
        </div>
      </section>

      <section className="bg-agarwood-50/50 py-20">
        <div className="container-content">
          <SectionHeading
            eyebrow="Tuyển chọn tiêu biểu"
            title="Sản phẩm được yêu thích"
            description="Những tạo tác hương thơm được cộng đồng thưởng trầm trân quý và lựa chọn nhiều nhất."
            link={{ label: "Xem tất cả", to: "/san-pham" }}
          />
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
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">
              Giá trị cốt lõi
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-agarwood-800">
              Cam kết vì sức khỏe & sự tĩnh tại của bạn
            </h2>
            <div className="mt-8 space-y-5">
              <ValueRow
                title="100% bột trầm tự nhiên"
                text="Không tẩm ép hóa chất tạo mùi, không dùng keo độc hại, đảm bảo khói nhang thanh nhẹ."
              />
              <ValueRow
                title="Kiểm nghiệm an toàn khói"
                text="Sản phẩm được kiểm định hàm lượng khí phát thải theo tiêu chuẩn an toàn không gian kín."
              />
              <ValueRow
                title="Tư vấn chuẩn xác theo nhu cầu"
                text="Đội ngũ am hiểu hương học hỗ trợ bạn chọn đúng loại trầm cho thiền, trà hay tiếp khách."
              />
            </div>
          </div>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-agarwood-200">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80"
              alt="Thiền định cùng hương trầm"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 first:pl-0 last:pr-0 md:px-5">
      <span className="text-agarwood-500">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-charcoal-500 md:text-sm">
          {title}
        </p>
        <p className="mt-0.5 hidden text-xs text-charcoal-300 sm:block">
          {text}
        </p>
      </div>
    </div>
  );
}

function CategoryFeature({
  title,
  text,
  to,
  icon,
  image,
  className,
}: {
  title: string;
  text: string;
  to: string;
  icon: React.ReactNode;
  image?: string;
  className: string;
}) {
  return (
    <Link
      to={to}
      className={`group relative min-h-[240px] overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${className}`}
    >
      {image && (
        <>
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
        </>
      )}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-black/20 backdrop-blur-sm text-cream">
            {icon}
          </span>
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
  const categorySlug =
    categorySlugProp ||
    (routeSlug && categories.some((c) => c.slug === routeSlug)
      ? routeSlug
      : undefined);

  const [data, setData] = useState<{
    items: Product[];
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "rating">(
    "rating",
  );
  const search = params.get("search") || "";
  const [origin, setOrigin] = useState("");
  const [type, setType] = useState("");
  const [grade, setGrade] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
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
      .catch(() => setError("Không thể tải danh sách sản phẩm"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [categorySlug, search, origin, type, grade, sort, page]);

  const currentCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;
  const title = currentCategory ? currentCategory.name : "Tất cả sản phẩm";

  return (
    <PageShell>
      <div className="container-content py-8">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: "/" },
            ...(currentCategory
              ? [{ label: "Sản phẩm", path: "/san-pham" }]
              : []),
            { label: title },
          ]}
        />
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">
              Bộ sưu tập Mộc Trầm
            </p>
            <h1 className="mt-2 font-serif text-4xl text-agarwood-800">
              {title}
            </h1>
            <p className="mt-2 text-sm text-charcoal-300">
              {data?.total ?? "..."} sản phẩm được chọn lọc
            </p>
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-outline sm:hidden"
          >
            Bộ lọc <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <FilterPanel
              origin={origin}
              setOrigin={setOrigin}
              type={type}
              setType={setType}
              grade={grade}
              setGrade={setGrade}
              clear={() => {
                setOrigin("");
                setType("");
                setGrade("");
              }}
            />
          </aside>
          <section>
            <div className="mb-5 flex items-center justify-between border-b border-agarwood-100 pb-4">
              <p className="text-sm text-charcoal-300">
                {data?.total || 0} kết quả
              </p>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as typeof sort);
                  setPage(1);
                }}
                className="rounded-lg border border-agarwood-100 bg-white px-3 py-2 text-sm text-charcoal-500"
              >
                <option value="rating">Phổ biến nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={load} />
            ) : data?.items.length ? (
              <>
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                  {data.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  onPage={setPage}
                />
              </>
            ) : (
              <EmptyState
                icon={<PackageCheck className="h-12 w-12" />}
                title="Chưa tìm thấy sản phẩm"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function FilterPanel({
  origin,
  setOrigin,
  type,
  setType,
  grade,
  setGrade,
  clear,
}: {
  origin: string;
  setOrigin: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  grade: string;
  setGrade: (v: string) => void;
  clear: () => void;
}) {
  return (
    <div className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-medium text-charcoal-500">Bộ lọc</h3>
        <button
          onClick={clear}
          className="text-xs text-agarwood-600 hover:underline"
        >
          Xóa lọc
        </button>
      </div>
      <FilterSelect
        label="Xuất xứ"
        value={origin}
        onChange={setOrigin}
        options={origins.map((o) => [o.id, o.name])}
      />
      <FilterSelect
        label="Loại trầm"
        value={type}
        onChange={setType}
        options={agarwoodTypes.map((o) => [o.id, o.name])}
      />
      <FilterSelect
        label="Cấp trầm"
        value={grade}
        onChange={setGrade}
        options={agarwoodGrades.map((o) => [o.id, o.name])}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[][];
}) {
  return (
    <label className="mb-5 block last:mb-0">
      <span className="mb-2 block text-xs font-medium text-charcoal-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base"
      >
        <option value="">Tất cả</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
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
            action={
              <Link to="/san-pham" className="btn-primary">
                Xem các sản phẩm khác
              </Link>
            }
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
      image: product.images?.[0] || "",
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
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: "/" },
            { label: "Sản phẩm", path: "/san-pham" },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Images Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-gradient-to-br from-agarwood-50 via-cream/30 to-agarwood-100/60 border border-agarwood-100 shadow-sm flex items-center justify-center">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-contain object-center transition-all duration-500"
                />
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
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? "border-agarwood-600 ring-2 ring-agarwood-600/20" : "border-agarwood-100 hover:border-agarwood-300 opacity-70 hover:opacity-100"}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-serif text-4xl leading-tight text-agarwood-800">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-agarwood-400">★★★★★</span>
              <span className="text-sm text-charcoal-300">
                {product.rating.toFixed(1)} · {product.reviewCount} đánh giá
              </span>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-charcoal-400">
              {product.description}
            </p>
            {product.scentNotes && (
              <div className="mt-5 rounded-xl bg-agarwood-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-agarwood-600">
                  Hương thơm
                </p>
                <p className="mt-1 text-sm text-charcoal-500">
                  {product.scentNotes}
                </p>
              </div>
            )}
            <div className="mt-7">
              <p className="mb-2 text-sm font-medium text-charcoal-500">
                Chọn phân loại
              </p>
              <div className="flex flex-wrap gap-2">
                {product.skus.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSku(i)}
                    disabled={!s.stock}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${sku === i ? "border-agarwood-500 bg-agarwood-50 text-agarwood-800" : "border-agarwood-100 text-charcoal-400"} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {s.specLabel}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <span className="text-3xl font-semibold text-agarwood-800">
                  {selected ? formatVND(selected.price) : "0 ₫"}
                </span>
                {selected?.compareAtPrice ? (
                  <span className="ml-2 text-sm text-charcoal-300 line-through">
                    {formatVND(selected.compareAtPrice)}
                  </span>
                ) : null}
              </div>
              <span
                className={`badge ${selected?.stock ? "bg-success-light text-success-dark" : "bg-error-light text-error-dark"}`}
              >
                {selected?.stock ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <div className="flex items-center rounded-lg border border-agarwood-200">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-charcoal-400"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 text-charcoal-400"
                >
                  +
                </button>
              </div>
              <button
                onClick={add}
                disabled={!selected?.stock}
                className="btn-primary flex-1"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Thêm vào giỏ
                  </>
                )}
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
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Chứng nhận kiểm định
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-agarwood-500" />
                  Nguồn gốc minh bạch
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-moss-400" />
                  Đổi trả 7 ngày
                </span>
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
  const { user } = useAuth();
  const [totals, setTotals] = useState({
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    total: 0,
  });
  useEffect(() => {
    import("@/services/cartApi").then(({ cartApi }) =>
      cartApi
        .getCartTotals(items)
        .then((r) => r.success && r.data && setTotals(r.data)),
    );
  }, [items]);

  return (
    <PageShell>
      <div className="container-content py-10">
        <Breadcrumb
          items={[{ label: "Trang chủ", path: "/" }, { label: "Giỏ hàng" }]}
        />
        <h1 className="mt-6 font-serif text-4xl text-agarwood-800">Giỏ hàng</h1>
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-14 w-14" />}
            title="Giỏ hàng đang trống"
            description="Hãy chọn một mùi hương để bắt đầu hành trình an nhiên."
            action={
              <Link to="/san-pham" className="btn-primary">
                Khám phá sản phẩm
              </Link>
            }
          />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.skuId} className="card flex gap-4 p-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-agarwood-50 border border-agarwood-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Flame className="h-8 w-8 text-agarwood-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/san-pham/${item.productSlug}`}
                      className="font-serif text-lg text-agarwood-800 hover:text-agarwood-600 line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-xs text-charcoal-300">
                      {item.specLabel}
                    </p>
                    <p className="mt-2 font-medium text-agarwood-700">
                      {formatVND(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="text-charcoal-300 hover:text-error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center rounded-lg border border-agarwood-100">
                      <button
                        onClick={() =>
                          updateQuantity(item.skuId, item.quantity - 1)
                        }
                        className="px-2 py-1 text-charcoal-400"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.skuId, item.quantity + 1)
                        }
                        className="px-2 py-1 text-charcoal-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card h-fit p-6">
              <h2 className="font-serif text-xl text-agarwood-800">
                Tóm tắt đơn hàng
              </h2>
              <div className="mt-5 space-y-3 border-b border-agarwood-100 pb-5 text-sm">
                <div className="flex justify-between text-charcoal-400">
                  <span>Tạm tính</span>
                  <span>{formatVND(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-400">
                  <span>Phí vận chuyển</span>
                  <span>
                    {totals.shippingFee
                      ? formatVND(totals.shippingFee)
                      : "Miễn phí"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-5 font-semibold text-agarwood-800">
                <span>Tổng cộng</span>
                <span>{formatVND(totals.total)}</span>
              </div>
              {!user ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-agarwood-200 bg-agarwood-50/80 p-3.5 text-xs text-agarwood-900">
                    <p className="font-semibold flex items-center gap-1.5 text-agarwood-800">
                      <UserIcon className="h-4 w-4 text-agarwood-600" />
                      Yêu cầu tài khoản đặt hàng
                    </p>
                    <p className="mt-1 text-charcoal-400 leading-relaxed">
                      Quý khách cần đăng nhập hoặc tạo tài khoản mới để tiến
                      hành thanh toán và lưu đơn hàng.
                    </p>
                  </div>
                  <Link
                    to="/dang-nhap?redirect=/thanh-toan"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    Đăng nhập / Đăng ký để đặt hàng{" "}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <Link
                  to="/thanh-toan"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Tiến hành thanh toán <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-charcoal-300">
                Giá và phí được xác nhận từ hệ thống
              </p>
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

  if (!user) {
    return <Navigate to="/dang-nhap?redirect=/thanh-toan" replace />;
  }

  const [form, setForm] = useState({
    shippingFullName: user.fullName || "",
    shippingPhone: user.phone || "",
    shippingProvince: user.addresses?.[0]?.province || "Hồ Chí Minh",
    shippingWard: user.addresses?.[0]?.ward || "Phường Bến Nghé, Quận 1",
    shippingDetail: user.addresses?.[0]?.detail || "",
    paymentMethod: "COD" as "COD" | "VIETQR" | "PAYPAL",
    note: "",
    couponCode: "",
    privacyConsent: true,
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    total: 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    import("@/services/cartApi").then(({ cartApi }) =>
      cartApi
        .getCartTotals(items)
        .then((r) => r.success && r.data && setTotals(r.data)),
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
            action={
              <Link to="/san-pham" className="btn-primary">
                Khám phá sản phẩm
              </Link>
            }
          />
        </div>
      </PageShell>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const pErr = validatePhone(form.shippingPhone);
    if (pErr) {
      setError(pErr);
      return;
    }
    if (!form.privacyConsent) {
      setError("Bạn cần đồng ý với chính sách bảo mật để tiếp tục.");
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
        setError(res.message || "Không thể tạo đơn hàng");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="container-content py-10 max-w-5xl">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: "/" },
            { label: "Giỏ hàng", path: "/gio-hang" },
            { label: "Thanh toán" },
          ]}
        />
        <h1 className="mt-6 font-serif text-4xl text-agarwood-800">
          Thanh toán đơn hàng
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* Thông tin giao hàng & phương thức thanh toán */}
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-agarwood-200 bg-agarwood-50/80 p-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-agarwood-200/70 font-serif font-bold text-agarwood-800">
                  {user.fullName ? user.fullName.charAt(0) : "M"}
                </div>
                <div>
                  <p className="font-medium text-agarwood-800">
                    Đặt hàng với tài khoản:{" "}
                    <span className="font-semibold">{user.fullName}</span>
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {user.email} · {user.phone || "Chưa có SĐT"}
                  </p>
                </div>
              </div>
              <span className="badge bg-agarwood-800 text-cream text-xs">
                {user.role}
              </span>
            </div>

            <div className="card p-6">
              <h2 className="font-serif text-xl text-agarwood-800 mb-4">
                1. Thông tin giao hàng
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Họ và tên người nhận"
                  value={form.shippingFullName}
                  set={(v) => setForm({ ...form, shippingFullName: v })}
                  required
                />
                <Field
                  label="Số điện thoại"
                  value={form.shippingPhone}
                  set={(v) => setForm({ ...form, shippingPhone: v })}
                  required
                />
                <Field
                  label="Tỉnh / Thành phố"
                  value={form.shippingProvince}
                  set={(v) => setForm({ ...form, shippingProvince: v })}
                  required
                />
                <Field
                  label="Phường / Xã / Quận"
                  value={form.shippingWard}
                  set={(v) => setForm({ ...form, shippingWard: v })}
                  required
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Địa chỉ cụ thể (Số nhà, tên đường)"
                    value={form.shippingDetail}
                    set={(v) => setForm({ ...form, shippingDetail: v })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label>
                    <span className="label-base">
                      Ghi chú giao hàng (Tùy chọn)
                    </span>
                    <input
                      className="input-base"
                      value={form.note}
                      onChange={(e) =>
                        setForm({ ...form, note: e.target.value })
                      }
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-serif text-xl text-agarwood-800 mb-4">
                2. Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === "COD" ? "border-agarwood-600 bg-agarwood-50/60 ring-1 ring-agarwood-600/30" : "border-agarwood-100 hover:border-agarwood-300"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === "COD"}
                    onChange={() => setForm({ ...form, paymentMethod: "COD" })}
                    className="accent-agarwood-700"
                  />
                  <Truck className="h-5 w-5 text-agarwood-600" />
                  <div>
                    <p className="text-sm font-semibold text-agarwood-800">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-charcoal-300">
                      Kiểm tra hàng trước khi thanh toán tiền mặt
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === "VIETQR" ? "border-agarwood-600 bg-agarwood-50/60 ring-1 ring-agarwood-600/30" : "border-agarwood-100 hover:border-agarwood-300"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VIETQR"
                    checked={form.paymentMethod === "VIETQR"}
                    onChange={() =>
                      setForm({ ...form, paymentMethod: "VIETQR" })
                    }
                    className="accent-agarwood-700"
                  />
                  <QrCode className="h-5 w-5 text-agarwood-600" />
                  <div>
                    <p className="text-sm font-semibold text-agarwood-800">
                      Chuyển khoản VietQR (Khuyên dùng)
                    </p>
                    <p className="text-xs text-charcoal-300">
                      Quét mã QR qua ứng dụng ngân hàng, xác nhận tự động
                    </p>
                  </div>
                </label>

                {form.paymentMethod === "VIETQR" && (
                  <div className="p-4 bg-white rounded-xl border border-agarwood-300 shadow-sm animate-fade-in space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Ảnh QR card */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="p-2 bg-agarwood-50/60 rounded-xl border border-agarwood-200 shadow-inner">
                          <img
                            src="/images/vietqr-card.png"
                            alt="Mã QR Chuyển khoản VietQR - NGUYEN NHU TRUNG"
                            className="w-48 sm:w-52 h-auto object-contain rounded-lg shadow-sm"
                          />
                        </div>
                        <span className="text-[11px] text-charcoal-400 mt-1.5 flex items-center gap-1 font-medium">
                          <QrCode className="w-3.5 h-3.5 text-agarwood-600" />{" "}
                          Quét qua App Ngân hàng / Viettel Money
                        </span>
                      </div>

                      {/* Thông tin tài khoản */}
                      <div className="flex-1 w-full space-y-2 text-xs">
                        <div className="rounded-lg bg-agarwood-50/80 p-3 border border-agarwood-100 space-y-1.5 text-charcoal-400">
                          <div className="flex justify-between items-center">
                            <span className="text-charcoal-300">
                              Ngân hàng / Đơn vị:
                            </span>
                            <span className="font-semibold text-agarwood-800">
                              Viettel Money (Napas 247)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-charcoal-300">
                              Chủ tài khoản:
                            </span>
                            <span className="font-bold text-agarwood-900 uppercase tracking-wide">
                              NGUYEN NHU TRUNG
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-charcoal-300">
                              Số tài khoản / SĐT:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-base text-agarwood-900">
                                0365117151
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText("0365117151");
                                  alert("Đã sao chép số tài khoản: 0365117151");
                                }}
                                className="px-2 py-0.5 rounded text-[11px] bg-agarwood-200/80 text-agarwood-800 hover:bg-agarwood-300 transition-colors font-medium"
                              >
                                Sao chép
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-agarwood-200/60">
                            <span className="text-charcoal-300">
                              Số tiền cần thanh toán:
                            </span>
                            <span className="font-bold text-base text-agarwood-800">
                              {formatVND(totals.total)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-charcoal-300">
                              Nội dung chuyển khoản:
                            </span>
                            <span className="font-mono font-semibold text-agarwood-700">
                              MT {form.shippingPhone || "DONHANG"}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                          <p className="font-semibold">
                            💡 Hướng dẫn thanh toán:
                          </p>
                          <ol className="list-decimal list-inside space-y-0.5 pl-0.5 text-charcoal-400">
                            <li>
                              Mở ứng dụng ngân hàng bất kỳ hoặc Viettel Money,
                              chọn <strong>Quét mã QR</strong>.
                            </li>
                            <li>
                              Quét mã QR bên cạnh hoặc chuyển khoản theo số tài
                              khoản ở trên.
                            </li>
                            <li>
                              Sau khi quét chuyển khoản xong, bấm nút{" "}
                              <strong>Xác nhận đặt hàng</strong> bên dưới.
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <label
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === "PAYPAL" ? "border-agarwood-600 bg-agarwood-50/60 ring-1 ring-agarwood-600/30" : "border-agarwood-100 hover:border-agarwood-300"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYPAL"
                    checked={form.paymentMethod === "PAYPAL"}
                    onChange={() =>
                      setForm({ ...form, paymentMethod: "PAYPAL" })
                    }
                    className="accent-agarwood-700"
                  />
                  <CreditCard className="h-5 w-5 text-agarwood-600" />
                  <div>
                    <p className="text-sm font-semibold text-agarwood-800">
                      PayPal / Thẻ quốc tế
                    </p>
                    <p className="text-xs text-charcoal-300">
                      Dành cho khách hàng quốc tế
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-5 pt-4 border-t border-agarwood-100">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-charcoal-400">
                  <input
                    type="checkbox"
                    checked={form.privacyConsent}
                    onChange={(e) =>
                      setForm({ ...form, privacyConsent: e.target.checked })
                    }
                    className="mt-0.5 accent-agarwood-700"
                  />
                  <span>
                    Tôi đã đọc và đồng ý với{" "}
                    <Link
                      to="/chinh-sach/chinh-sach-bao-mat"
                      className="text-agarwood-700 underline"
                      target="_blank"
                    >
                      Chính sách bảo mật
                    </Link>{" "}
                    và điều khoản mua sắm của Mộc Trầm.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Tóm tắt & Nút đặt hàng */}
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-serif text-xl text-agarwood-800">
                Sản phẩm ({items.length})
              </h2>
              <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-agarwood-100 pr-1">
                {items.map((i) => (
                  <div
                    key={i.skuId}
                    className="py-2.5 flex justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-medium text-agarwood-800 line-clamp-1">
                        {i.productName}
                      </p>
                      <p className="text-charcoal-300">
                        {i.specLabel} × {i.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-agarwood-700 shrink-0">
                      {formatVND(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-agarwood-100 pt-4 text-sm">
                <div className="flex justify-between text-charcoal-400">
                  <span>Tạm tính</span>
                  <span>{formatVND(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-400">
                  <span>Phí vận chuyển</span>
                  <span>
                    {totals.shippingFee
                      ? formatVND(totals.shippingFee)
                      : "Miễn phí"}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Giảm giá</span>
                    <span>-{formatVND(totals.discount)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between border-t border-agarwood-100 py-4 font-semibold text-lg text-agarwood-800">
                <span>Tổng thanh toán</span>
                <span className="text-agarwood-700">
                  {formatVND(totals.total)}
                </span>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-error-light p-3 text-xs text-error-dark">
                  {error}
                </p>
              )}

              <button disabled={busy} className="btn-primary w-full">
                {busy ? "Đang tạo đơn hàng..." : "Xác nhận đặt hàng"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function AuthPage({
  initialMode = "login",
}: {
  initialMode?: "login" | "register";
}) {
  const { user, login, register, verifyRegisterOtp, resendRegisterOtp } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tai-khoan";

  const defaultMode =
    location.pathname === "/dang-ky" ? "register" : initialMode;
  const [mode, setMode] = useState<"login" | "register" | "verify_otp">(
    defaultMode,
  );

  useEffect(() => {
    if (location.pathname === "/dang-ky") {
      setMode("register");
    } else if (location.pathname === "/dang-nhap") {
      setMode("login");
    }
  }, [location.pathname]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (user) return <Navigate to={redirect} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);

    try {
      if (mode === "login") {
        if (!form.email || !form.password) {
          throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
        }
        await login(form.email, form.password);
        navigate(redirect);
      } else if (mode === "register") {
        const em = validateEmail(form.email);
        if (em) throw new Error(em);

        const p = validatePhone(form.phone);
        if (p) throw new Error(p);

        if (form.fullName.trim().length < 3) {
          throw new Error("Họ và tên phải có ít nhất 3 ký tự");
        }

        if (form.password.length < 6 || form.password.length > 24) {
          throw new Error("Mật khẩu phải từ 6 đến 24 ký tự theo quy định");
        }

        if (form.password !== form.confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp");
        }

        const res = await register({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
        });

        setSuccessMsg(
          res.message ||
            "Mã OTP kích hoạt gồm 8 chữ số đã được gửi đến email " +
              form.email +
              ".",
        );
        setMode("verify_otp");
        setCountdown(60);
      } else if (mode === "verify_otp") {
        if (!/^\d{8}$/.test(otp.trim())) {
          throw new Error("Mã OTP phải gồm đúng 8 chữ số");
        }

        await verifyRegisterOtp(form.email, otp.trim());

        setSuccessMsg(
          "Kích hoạt tài khoản thành công! Đang tự động đăng nhập...",
        );
        await login(form.email, form.password);
        navigate(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || busy) return;
    setError("");
    setSuccessMsg("");
    setBusy(true);
    try {
      await resendRegisterOtp(form.email);
      setSuccessMsg("Đã gửi lại mã OTP mới đến email " + form.email);
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại mã OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="container-content flex min-h-[620px] items-center justify-center py-12">
        <div className="w-full max-w-xl">
          {redirect.includes("/thanh-toan") && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-agarwood-300 bg-agarwood-50 p-4 text-sm text-agarwood-900 shadow-sm animate-fade-in">
              <ShoppingBag className="h-5 w-5 shrink-0 text-agarwood-600 mt-0.5" />
              <div>
                <p className="font-semibold text-agarwood-800">
                  Quý khách cần tài khoản để tiến hành đặt hàng
                </p>
                <p className="mt-0.5 text-xs text-charcoal-400 leading-relaxed">
                  Vui lòng đăng nhập hoặc chọn <strong>"Đăng ký ngay"</strong>{" "}
                  để tạo tài khoản mới. Ngay sau khi hoàn tất, bạn sẽ được tự
                  động chuyển tiếp về trang Thanh toán.
                </p>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-agarwood-400 bg-agarwood-50 font-serif text-2xl text-agarwood-800">
              {mode === "verify_otp" ? (
                <Mail className="h-7 w-7 text-agarwood-700" />
              ) : (
                "M"
              )}
            </div>
            <h1 className="mt-5 font-serif text-3xl text-agarwood-800">
              {mode === "verify_otp"
                ? "Kích hoạt tài khoản"
                : mode === "login"
                  ? "Chào mừng trở lại"
                  : "Tạo tài khoản"}
            </h1>
            <p className="mt-2 text-sm text-charcoal-300">
              {mode === "verify_otp"
                ? "Nhập mã OTP 8 chữ số gửi tới " +
                  form.email +
                  " để hoàn tất kích hoạt."
                : mode === "login"
                  ? "Đăng nhập để theo dõi hành trình đơn hàng."
                  : "Lưu lại những khoảnh khắc an nhiên của bạn."}
            </p>
          </div>

          <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
            {successMsg && (
              <div className="flex items-start gap-2.5 rounded-lg bg-success-light/30 border border-success/30 p-3 text-xs text-success-dark">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-success" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === "verify_otp" ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="label-base">Mã OTP (8 chữ số)</span>
                  <input
                    required
                    maxLength={8}
                    className="input-base text-center tracking-[0.3em] font-mono text-xl py-2.5"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678"
                    autoFocus
                  />
                </label>

                <div className="flex items-center justify-between text-xs text-charcoal-300">
                  <span>Chưa nhận được mã?</span>
                  <button
                    type="button"
                    disabled={countdown > 0 || busy}
                    onClick={handleResendOtp}
                    className="flex items-center gap-1 font-medium text-agarwood-700 hover:underline disabled:text-charcoal-300 disabled:no-underline"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${busy ? "animate-spin" : ""}`}
                    />
                    {countdown > 0
                      ? `Gửi lại sau (${countdown}s)`
                      : "Gửi lại mã"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {mode === "register" && (
                  <>
                    <label className="block">
                      <span className="label-base">Họ và tên</span>
                      <input
                        required
                        className="input-base"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        placeholder="Nguyễn Văn A"
                      />
                    </label>
                    <label className="block">
                      <span className="label-base">Số điện thoại (10 số)</span>
                      <input
                        required
                        className="input-base"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="0901234567"
                        maxLength={10}
                      />
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="label-base">
                    {mode === "login" ? "Tài khoản / Email / SĐT" : "Email"}
                  </span>
                  <input
                    required
                    type={mode === "login" ? "text" : "email"}
                    className="input-base"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder={
                      mode === "login"
                        ? "dochet89 hoặc email@moctram.vn"
                        : "name@example.com"
                    }
                  />
                </label>

                <label className="block">
                  <span className="label-base">Mật khẩu</span>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      className="input-base pr-10"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder={
                        mode === "register"
                          ? "Từ 6 đến 24 ký tự"
                          : "Nhập mật khẩu"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                {mode === "register" && (
                  <label className="block">
                    <span className="label-base">Xác nhận mật khẩu</span>
                    <div className="relative">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        className="input-base pr-10"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>
                )}
              </>
            )}

            {error && (
              <p className="rounded-lg bg-error-light p-3 text-sm text-error-dark leading-relaxed">
                {error}
              </p>
            )}

            <button disabled={busy} className="btn-primary w-full">
              {busy
                ? "Đang xử lý..."
                : mode === "verify_otp"
                  ? "Kích hoạt & Đăng nhập"
                  : mode === "login"
                    ? "Đăng nhập"
                    : "Đăng ký tài khoản"}
            </button>

            {mode === "verify_otp" ? (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-agarwood-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Quay lại chỉnh sửa thông tin đăng ký
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-charcoal-300">
                {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="font-medium text-agarwood-700 hover:underline"
                >
                  {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </div>
            )}
          </form>

          {mode === "login" && (
            <div className="mt-8 rounded-2xl border border-agarwood-200/80 bg-gradient-to-b from-cream to-agarwood-50/40 p-5 shadow-sm">
              <div className="pb-3 border-b border-agarwood-100">
                <h3 className="font-serif text-base font-semibold text-agarwood-800">
                  Tài khoản đăng nhập hệ thống theo từng vai trò
                </h3>
                <p className="text-xs text-charcoal-400 mt-0.5">
                  Chọn vai trò bên dưới để tự động điền và đăng nhập ngay:
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Khách hàng */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setForm({
                      ...form,
                      email: "khachhang@moctram.vn",
                      password: "Moctram@123",
                    });
                    try {
                      setBusy(true);
                      await login("khachhang@moctram.vn", "Moctram@123");
                      navigate(redirect);
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Lỗi đăng nhập",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-agarwood-200 bg-white hover:border-agarwood-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-agarwood-800 flex items-center gap-1.5">
                      <UserIcon className="h-4 w-4 text-agarwood-600" />
                      Khách hàng
                    </span>
                    <span className="text-[10px] font-bold text-agarwood-700 bg-agarwood-50 border border-agarwood-200 px-2 py-0.5 rounded-md group-hover:bg-agarwood-700 group-hover:text-cream transition-colors">
                      Đăng nhập ➔
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-agarwood-900 mt-2">
                    khachhang@moctram.vn
                  </p>
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    Vai trò: CUSTOMER · Đặt hàng, theo dõi đơn, bảo hành
                  </p>
                </button>

                {/* 2. Nhân viên Kho */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setForm({
                      ...form,
                      email: "kho@moctram.vn",
                      password: "Moctram@123",
                    });
                    try {
                      setBusy(true);
                      await login("kho@moctram.vn", "Moctram@123");
                      navigate(
                        redirect !== "/tai-khoan" ? redirect : "/admin/kho",
                      );
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Lỗi đăng nhập",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-agarwood-200 bg-white hover:border-agarwood-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-agarwood-800 flex items-center gap-1.5">
                      <Warehouse className="h-4 w-4 text-moss-600" />
                      Nhân viên Kho
                    </span>
                    <span className="text-[10px] font-bold text-moss-700 bg-moss-50 border border-moss-200 px-2 py-0.5 rounded-md group-hover:bg-moss-700 group-hover:text-cream transition-colors">
                      Đăng nhập ➔
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-agarwood-900 mt-2">
                    kho@moctram.vn
                  </p>
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    Vai trò: STAFF_WAREHOUSE · Quản lý tồn kho, đóng gói, xuất
                    nhập
                  </p>
                </button>

                {/* 3. Chăm sóc KH */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setForm({
                      ...form,
                      email: "cskh@moctram.vn",
                      password: "Moctram@123",
                    });
                    try {
                      setBusy(true);
                      await login("cskh@moctram.vn", "Moctram@123");
                      navigate(
                        redirect !== "/tai-khoan" ? redirect : "/admin/doi-tra",
                      );
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Lỗi đăng nhập",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-agarwood-200 bg-white hover:border-agarwood-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-agarwood-800 flex items-center gap-1.5">
                      <Headphones className="h-4 w-4 text-warning-dark" />
                      Chăm sóc KH (CS)
                    </span>
                    <span className="text-[10px] font-bold text-warning-dark bg-warning-light/50 border border-warning/30 px-2 py-0.5 rounded-md group-hover:bg-warning-dark group-hover:text-cream transition-colors">
                      Đăng nhập ➔
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-agarwood-900 mt-2">
                    cskh@moctram.vn
                  </p>
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    Vai trò: STAFF_CS · Đổi trả, tư vấn showroom & báo giá B2B
                  </p>
                </button>

                {/* 4. Quản trị viên */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setForm({
                      ...form,
                      email: "admin@moctram.vn",
                      password: "Moctram@123",
                    });
                    try {
                      setBusy(true);
                      await login("admin@moctram.vn", "Moctram@123");
                      navigate(redirect !== "/tai-khoan" ? redirect : "/admin");
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Lỗi đăng nhập",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-agarwood-200 bg-white hover:border-agarwood-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-agarwood-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-error" />
                      Quản trị viên (Admin)
                    </span>
                    <span className="text-[10px] font-bold text-error bg-error-light/40 border border-error/30 px-2 py-0.5 rounded-md group-hover:bg-error group-hover:text-cream transition-colors">
                      Đăng nhập ➔
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-agarwood-900 mt-2">
                    admin@moctram.vn
                  </p>
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    Vai trò: ADMIN · Toàn quyền quản trị hệ thống & cấu hình
                  </p>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-agarwood-100 flex items-center justify-center gap-2 text-xs text-charcoal-400">
                <span>Mật khẩu mặc định:</span>
                <code className="bg-agarwood-100 px-2 py-0.5 rounded font-mono font-bold text-agarwood-800">
                  Moctram@123
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function LookupPage() {
  const { orderCode: urlCode } = useParams();
  const [code, setCode] = useState(urlCode || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

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
    setError("");
    const r = await orderApi.getOrderByCode(
      code.trim(),
      phone.trim() || undefined,
    );
    if (r.success && r.data) setOrder(r.data);
    else setError(r.message || "Không tìm thấy đơn hàng");
  };

  return (
    <PageShell>
      <div className="container-content max-w-3xl py-12">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: "/" },
            { label: "Tra cứu đơn hàng" },
          ]}
        />
        <div className="mt-8 text-center">
          <PackageCheck className="mx-auto h-12 w-12 text-agarwood-400" />
          <h1 className="mt-4 font-serif text-4xl text-agarwood-800">
            Tra cứu đơn hàng
          </h1>
          <p className="mt-2 text-sm text-charcoal-300">
            Nhập mã đơn hàng và số điện thoại để xem trạng thái vận chuyển
          </p>
        </div>
        <form
          onSubmit={submit}
          className="card mx-auto mt-8 grid gap-4 p-6 sm:grid-cols-2"
        >
          <label>
            <span className="label-base">Mã đơn hàng</span>
            <input
              required
              className="input-base"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: MT251003A7K2"
            />
          </label>
          <label>
            <span className="label-base">
              Số điện thoại (Tùy chọn khi tra cứu theo mã)
            </span>
            <input
              className="input-base"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
            />
          </label>
          <button className="btn-primary sm:col-span-2">
            Tra cứu đơn hàng <Search className="h-4 w-4" />
          </button>
          {error && (
            <p className="sm:col-span-2 rounded-lg bg-error-light p-3 text-sm text-error-dark">
              {error}
            </p>
          )}
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
          <span className="text-xs uppercase tracking-wider text-agarwood-500">
            Mã đơn hàng
          </span>
          <h2 className="font-serif text-2xl text-agarwood-800">
            {order.orderCode}
          </h2>
          <p className="text-xs text-charcoal-300 mt-1">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge
          label={ORDER_STATUS_LABELS[order.status] || order.status}
          colorClass={
            ORDER_STATUS_COLORS[order.status] ||
            "bg-agarwood-100 text-agarwood-700"
          }
        />
      </div>

      <div className="mt-6 divide-y divide-agarwood-100 border-y border-agarwood-100 py-4">
        {order.items.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between py-2 text-sm"
          >
            <div>
              <p className="font-medium text-agarwood-800">{i.productName}</p>
              <p className="text-xs text-charcoal-300">
                {i.specLabel} × {i.quantity}
              </p>
            </div>
            <span className="font-medium text-agarwood-700">
              {formatVND(i.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-charcoal-400">Tổng thanh toán:</span>
        <span className="font-semibold text-agarwood-800 text-base">
          {formatVND(order.total)}
        </span>
      </div>

      {order.paymentMethod === "VIETQR" && (
        <div className="mt-6 p-4 rounded-xl border border-agarwood-200 bg-agarwood-50/60">
          <h3 className="font-serif text-base font-semibold text-agarwood-800 mb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-agarwood-600" /> Mã QR thanh toán
            VietQR
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl border border-agarwood-200 shadow-sm shrink-0">
              <img
                src="/images/vietqr-card.png"
                alt="Mã QR thanh toán đơn hàng"
                className="w-44 h-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex-1 w-full space-y-2 text-xs">
              <div className="p-3 bg-white rounded-lg border border-agarwood-100 space-y-1.5 text-charcoal-400">
                <div className="flex justify-between">
                  <span className="text-charcoal-300">Chủ tài khoản:</span>
                  <span className="font-bold text-agarwood-900 uppercase">
                    NGUYEN NHU TRUNG
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-300">Số tài khoản / SĐT:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-agarwood-900 text-sm">
                      0365117151
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("0365117151");
                        alert("Đã sao chép số tài khoản: 0365117151");
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-agarwood-100 text-agarwood-700 hover:bg-agarwood-200"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-300">Số tiền:</span>
                  <span className="font-bold text-agarwood-800 text-sm">
                    {formatVND(order.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-300">
                    Nội dung chuyển khoản:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-agarwood-700">
                      {order.orderCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.orderCode);
                        alert(`Đã sao chép mã đơn hàng: ${order.orderCode}`);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-agarwood-100 text-agarwood-700 hover:bg-agarwood-200"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-charcoal-300 italic">
                * Sau khi quý khách chuyển khoản thành công, hệ thống Mộc Trầm
                sẽ tự động xác nhận đơn hàng và tiến hành đóng gói giao đến bạn.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentPage({ slug }: { slug: string }) {
  const article =
    articles.find((a) => a.slug === slug) ||
    articles.find((a) => a.slug === "gioi-thieu");
  if (!article) return null;
  return (
    <PageShell>
      <div className="container-content max-w-3xl py-12">
        <Breadcrumb
          items={[
            { label: "Trang chủ", path: "/" },
            {
              label:
                article.type === "POLICY"
                  ? "Chính sách"
                  : article.type === "ABOUT"
                    ? "Giới thiệu"
                    : "Cẩm nang",
              path: article.type === "GUIDE" ? "/cam-nang" : undefined,
            },
            { label: article.title },
          ]}
        />
        <article className="mt-10">
          <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">
            {article.type === "GUIDE"
              ? "Cẩm nang thưởng trầm"
              : article.type === "POLICY"
                ? "Thông tin pháp lý"
                : "Về Mộc Trầm"}
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl leading-tight text-agarwood-800">
            {article.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-charcoal-400">
            {article.excerpt}
          </p>
          {article.image && (
            <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-md border border-agarwood-100">
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="mt-10 border-t border-agarwood-100 pt-8 text-base leading-[1.9] text-charcoal-500 whitespace-pre-line">
            {article.content}
          </div>
        </article>
      </div>
    </PageShell>
  );
}

function AccountPage() {
  const { user, logout, updateUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"orders" | "profile" | "addresses">("profile");

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // Password Form state
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  // New Address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    province: "Hồ Chí Minh",
    ward: "Phường Bến Nghé, Quận 1",
    detail: "",
  });
  const [addrBusy, setAddrBusy] = useState(false);
  const [addrMsg, setAddrMsg] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    orderApi
      .getMyOrders()
      .then((r) => r.success && r.data && setOrders(r.data));
  }, []);

  if (!user) return <Navigate to="/dang-nhap" replace />;

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");

    if (profileForm.fullName.trim().length < 2) {
      setProfileErr("Họ và tên phải có ít nhất 2 ký tự");
      return;
    }
    const pErr = validatePhone(profileForm.phone);
    if (pErr) {
      setProfileErr(pErr);
      return;
    }

    setProfileBusy(true);
    try {
      const res = await authApi.updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setProfileMsg("Cập nhật thông tin cá nhân thành công!");
      } else {
        setProfileErr(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setProfileBusy(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");

    if (!pwdForm.currentPassword) {
      setPwdErr("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (pwdForm.newPassword.length < 6 || pwdForm.newPassword.length > 24) {
      setPwdErr("Mật khẩu mới phải từ 6 đến 24 ký tự");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdErr("Mật khẩu xác nhận không khớp");
      return;
    }

    setPwdBusy(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      if (res.success) {
        setPwdMsg("Đổi mật khẩu thành công!");
        setPwdForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPwdErr(res.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      setPwdErr(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setPwdBusy(false);
    }
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.detail) {
      return;
    }
    setAddrBusy(true);
    try {
      const res = await authApi.addAddress(newAddr);
      if (res.success && res.data) {
        updateUser(res.data);
        setShowAddAddress(false);
        setNewAddr({
          fullName: user.fullName || "",
          phone: user.phone || "",
          province: "Hồ Chí Minh",
          ward: "Phường Bến Nghé, Quận 1",
          detail: "",
        });
        setAddrMsg("Đã thêm địa chỉ giao hàng mới thành công!");
      }
    } catch {
      // ignore
    } finally {
      setAddrBusy(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    const res = await authApi.deleteAddress(addrId);
    if (res.success && res.data) {
      updateUser(res.data);
      setAddrMsg("Đã xóa địa chỉ thành công!");
    }
  };

  const handleSetDefaultAddress = async (addrId: string) => {
    const res = await authApi.setDefaultAddress(addrId);
    if (res.success && res.data) {
      updateUser(res.data);
      setAddrMsg("Đã đặt làm địa chỉ mặc định!");
    }
  };

  return (
    <PageShell>
      <div className="container-content py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">
              Xin chào
            </p>
            <h1 className="mt-2 font-serif text-4xl text-agarwood-800">
              {user.fullName}
            </h1>
          </div>
          <button onClick={logout} className="btn-outline">
            Đăng xuất
          </button>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Tabs */}
          <aside className="card h-fit p-2 space-y-1">
            <button
              type="button"
              onClick={() => setTab("orders")}
              className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors flex items-center gap-2.5 ${
                tab === "orders"
                  ? "bg-agarwood-100 font-semibold text-agarwood-900"
                  : "text-charcoal-400 hover:text-agarwood-800 hover:bg-agarwood-50/70"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Đơn hàng của tôi</span>
              {orders.length > 0 && (
                <span className="ml-auto rounded-full bg-agarwood-200 px-2 py-0.5 text-[11px] font-bold text-agarwood-800">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab("profile")}
              className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors flex items-center gap-2.5 ${
                tab === "profile"
                  ? "bg-agarwood-100 font-semibold text-agarwood-900"
                  : "text-charcoal-400 hover:text-agarwood-800 hover:bg-agarwood-50/70"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Thông tin cá nhân</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("addresses")}
              className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors flex items-center gap-2.5 ${
                tab === "addresses"
                  ? "bg-agarwood-100 font-semibold text-agarwood-900"
                  : "text-charcoal-400 hover:text-agarwood-800 hover:bg-agarwood-50/70"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Sổ địa chỉ</span>
              {user.addresses && user.addresses.length > 0 && (
                <span className="ml-auto rounded-full bg-agarwood-100 px-2 py-0.5 text-[11px] font-bold text-charcoal-400">
                  {user.addresses.length}
                </span>
              )}
            </button>
          </aside>

          {/* Tab Content */}
          <section className="space-y-6">
            {/* 1. Tab: Thông tin cá nhân */}
            {tab === "profile" && (
              <div className="space-y-8">
                {/* Thông tin hồ sơ */}
                <div className="card p-6 sm:p-8">
                  <div className="border-b border-agarwood-100 pb-4 mb-6">
                    <h2 className="font-serif text-2xl text-agarwood-800">
                      Hồ sơ cá nhân
                    </h2>
                    <p className="mt-1 text-xs text-charcoal-400">
                      Cập nhật thông tin họ tên và số điện thoại liên hệ của
                      bạn.
                    </p>
                  </div>

                  {profileMsg && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-light/40 border border-success/30 p-3 text-xs text-success-dark">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>{profileMsg}</span>
                    </div>
                  )}

                  {profileErr && (
                    <div className="mb-5 rounded-lg bg-error-light p-3 text-xs text-error-dark">
                      {profileErr}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="label-base">Họ và tên</span>
                        <input
                          required
                          className="input-base"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Nguyễn Văn A"
                        />
                      </label>

                      <label className="block">
                        <span className="label-base">Số điện thoại</span>
                        <input
                          required
                          className="input-base"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="0901234567"
                          maxLength={10}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="label-base">Email đăng nhập</span>
                        <div className="relative">
                          <input
                            disabled
                            className="input-base bg-charcoal-50/70 text-charcoal-400 cursor-not-allowed"
                            value={user.email}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] font-medium text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã xác thực
                          </span>
                        </div>
                      </label>

                      <label className="block">
                        <span className="label-base">Vai trò tài khoản</span>
                        <div className="flex h-10 items-center">
                          <span className="badge bg-agarwood-800 text-cream px-3 py-1 font-mono text-xs">
                            {user.role}
                          </span>
                          <span className="ml-3 text-xs text-charcoal-400">
                            {user.role === "CUSTOMER"
                              ? "Khách hàng thân thiết"
                              : user.role === "ADMIN"
                                ? "Quản trị viên"
                                : user.role === "STAFF_WAREHOUSE"
                                  ? "Nhân viên Kho"
                                  : "Nhân viên CSKH"}
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={profileBusy}
                        className="btn-primary"
                      >
                        {profileBusy ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Đổi mật khẩu */}
                <div className="card p-6 sm:p-8">
                  <div className="border-b border-agarwood-100 pb-4 mb-6">
                    <h2 className="font-serif text-2xl text-agarwood-800 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-agarwood-600" />
                      Đổi mật khẩu
                    </h2>
                    <p className="mt-1 text-xs text-charcoal-400">
                      Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh từ 6 đến 24
                      ký tự.
                    </p>
                  </div>

                  {pwdMsg && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-light/40 border border-success/30 p-3 text-xs text-success-dark">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>{pwdMsg}</span>
                    </div>
                  )}

                  {pwdErr && (
                    <div className="mb-5 rounded-lg bg-error-light p-3 text-xs text-error-dark">
                      {pwdErr}
                    </div>
                  )}

                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-4 max-w-md"
                  >
                    <label className="block">
                      <span className="label-base">Mật khẩu hiện tại</span>
                      <input
                        required
                        type="password"
                        className="input-base"
                        value={pwdForm.currentPassword}
                        onChange={(e) =>
                          setPwdForm({
                            ...pwdForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Nhập mật khẩu đang dùng"
                      />
                    </label>

                    <label className="block">
                      <span className="label-base">Mật khẩu mới</span>
                      <input
                        required
                        type="password"
                        className="input-base"
                        value={pwdForm.newPassword}
                        onChange={(e) =>
                          setPwdForm({
                            ...pwdForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Từ 6 đến 24 ký tự"
                      />
                    </label>

                    <label className="block">
                      <span className="label-base">Xác nhận mật khẩu mới</span>
                      <input
                        required
                        type="password"
                        className="input-base"
                        value={pwdForm.confirmPassword}
                        onChange={(e) =>
                          setPwdForm({
                            ...pwdForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </label>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={pwdBusy}
                        className="btn-primary"
                      >
                        {pwdBusy ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. Tab: Đơn hàng của tôi */}
            {tab === "orders" && (
              <div className="card p-6 sm:p-8">
                <div className="border-b border-agarwood-100 pb-4 mb-6">
                  <h2 className="font-serif text-2xl text-agarwood-800">
                    Lịch sử đơn hàng
                  </h2>
                  <p className="mt-1 text-xs text-charcoal-400">
                    Theo dõi hành trình và trạng thái các đơn hàng bạn đã đặt.
                  </p>
                </div>

                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-sm text-charcoal-400">
                      <ShoppingBag className="mx-auto h-12 w-12 text-agarwood-200 mb-3" />
                      <p className="font-medium text-agarwood-800">
                        Bạn chưa có đơn hàng nào
                      </p>
                      <p className="text-xs text-charcoal-300 mt-1">
                        Hãy chọn cho mình mùi hương thanh khiết để bắt đầu.
                      </p>
                      <Link
                        to="/san-pham"
                        className="btn-primary mt-4 inline-flex items-center gap-2"
                      >
                        Khám phá sản phẩm <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/tai-khoan/don-hang/${order.orderCode}`}
                        className="card flex flex-wrap items-center justify-between gap-4 p-4 transition-all hover:border-agarwood-300 hover:shadow-md"
                      >
                        <div>
                          <p className="font-semibold text-agarwood-900">
                            {order.orderCode}
                          </p>
                          <p className="mt-1 text-xs text-charcoal-400">
                            {formatDateTime(order.createdAt)} ·{" "}
                            {order.items.length} sản phẩm
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <span className="text-sm font-semibold text-agarwood-800">
                            {formatVND(order.total)}
                          </span>
                          <StatusBadge
                            label={
                              ORDER_STATUS_LABELS[order.status] || order.status
                            }
                            colorClass={
                              ORDER_STATUS_COLORS[order.status] ||
                              "bg-agarwood-100 text-agarwood-700"
                            }
                          />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Tab: Sổ địa chỉ */}
            {tab === "addresses" && (
              <div className="card p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-agarwood-100 pb-4 mb-6">
                  <div>
                    <h2 className="font-serif text-2xl text-agarwood-800">
                      Sổ địa chỉ nhận hàng
                    </h2>
                    <p className="mt-1 text-xs text-charcoal-400">
                      Quản lý địa chỉ giao hàng để điền thông tin nhanh khi
                      thanh toán.
                    </p>
                  </div>
                  {!showAddAddress && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(true)}
                      className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3.5"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm địa chỉ mới
                    </button>
                  )}
                </div>

                {addrMsg && (
                  <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-light/40 border border-success/30 p-3 text-xs text-success-dark">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span>{addrMsg}</span>
                  </div>
                )}

                {/* Form thêm địa chỉ */}
                {showAddAddress && (
                  <form
                    onSubmit={handleAddAddress}
                    className="mb-8 rounded-2xl border border-agarwood-200 bg-agarwood-50/50 p-5 space-y-4 animate-fade-in"
                  >
                    <h3 className="font-semibold text-sm text-agarwood-800">
                      Thêm địa chỉ giao hàng mới
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="label-base">Họ và tên người nhận</span>
                        <input
                          required
                          className="input-base bg-white"
                          value={newAddr.fullName}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, fullName: e.target.value })
                          }
                          placeholder="Nguyễn Văn A"
                        />
                      </label>
                      <label className="block">
                        <span className="label-base">Số điện thoại</span>
                        <input
                          required
                          className="input-base bg-white"
                          value={newAddr.phone}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, phone: e.target.value })
                          }
                          placeholder="0901234567"
                          maxLength={10}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="label-base">Tỉnh / Thành phố</span>
                        <input
                          required
                          className="input-base bg-white"
                          value={newAddr.province}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, province: e.target.value })
                          }
                          placeholder="Hà Nội / TP. Hồ Chí Minh"
                        />
                      </label>
                      <label className="block">
                        <span className="label-base">
                          Quận / Huyện / Phường
                        </span>
                        <input
                          required
                          className="input-base bg-white"
                          value={newAddr.ward}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, ward: e.target.value })
                          }
                          placeholder="Phường Bến Nghé, Quận 1"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="label-base">
                        Địa chỉ chi tiết (Số nhà, đường)
                      </span>
                      <input
                        required
                        className="input-base bg-white"
                        value={newAddr.detail}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, detail: e.target.value })
                        }
                        placeholder="Số 12 Lý Tự Trọng, Tòa nhà A"
                      />
                    </label>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={addrBusy}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        {addrBusy ? "Đang lưu..." : "Lưu địa chỉ"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="btn-outline text-xs py-2 px-4"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                {/* Danh sách địa chỉ */}
                <div className="space-y-3">
                  {!user.addresses || user.addresses.length === 0 ? (
                    <p className="text-center py-6 text-xs text-charcoal-400">
                      Bạn chưa lưu địa chỉ nào. Bấm nút "Thêm địa chỉ mới" để
                      thêm.
                    </p>
                  ) : (
                    user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-xl border border-agarwood-100 p-4 transition-all hover:border-agarwood-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-agarwood-900">
                              {addr.fullName}
                            </span>
                            <span className="text-xs text-charcoal-400">
                              ({addr.phone})
                            </span>
                            {addr.isDefault && (
                              <span className="rounded bg-agarwood-100 px-2 py-0.5 text-[10px] font-bold text-agarwood-800">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-500">
                            {addr.detail}, {addr.ward}, {addr.province}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs text-agarwood-700 hover:underline"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-xs text-error hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function B2BPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    b2bType: "SPA",
    productsInterested: "",
    quantity: "",
    budget: "",
    note: "",
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await consultationApi.createQuoteRequest(form);
    setSent(true);
  };

  return (
    <PageShell>
      <div className="container-content max-w-3xl py-12">
        <Breadcrumb
          items={[{ label: "Trang chủ", path: "/" }, { label: "Báo giá B2B" }]}
        />
        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-agarwood-500">
            Giải pháp cho doanh nghiệp
          </p>
          <h1 className="mt-3 font-serif text-5xl text-agarwood-800">
            Báo giá B2B & Đặt lịch showroom
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal-300">
            Từ trà thất, thiền viện đến spa, resort và quà tặng doanh nghiệp —
            hãy để chúng tôi cùng bạn tạo nên một không gian có hương.
          </p>
        </div>
        {sent ? (
          <div className="card mt-10 p-10 text-center">
            <Check className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 font-serif text-2xl text-agarwood-800">
              Đã nhận yêu cầu
            </h2>
            <p className="mt-2 text-sm text-charcoal-300">
              Đội ngũ Mộc Trầm sẽ liên hệ với bạn trong 1 ngày làm việc.
            </p>
            <Link to="/" className="btn-primary mt-6">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="card mt-10 grid gap-4 p-6 sm:grid-cols-2"
          >
            <Field
              label="Tên đơn vị"
              value={form.companyName}
              set={(v) => setForm({ ...form, companyName: v })}
              required
            />
            <Field
              label="Người liên hệ"
              value={form.contactName}
              set={(v) => setForm({ ...form, contactName: v })}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              set={(v) => setForm({ ...form, email: v })}
              required
            />
            <Field
              label="Số điện thoại"
              value={form.phone}
              set={(v) => setForm({ ...form, phone: v })}
              required
            />
            <label>
              <span className="label-base">Loại hình</span>
              <select
                className="input-base"
                value={form.b2bType}
                onChange={(e) => setForm({ ...form, b2bType: e.target.value })}
              >
                <option value="TEA_HOUSE">Trà thất</option>
                <option value="ZEN_MONASTERY">Thiền viện</option>
                <option value="SPA">Spa</option>
                <option value="RESORT">Resort</option>
                <option value="CORPORATE_GIFT">Quà tặng doanh nghiệp</option>
                <option value="OTHER">Khác</option>
              </select>
            </label>
            <Field
              label="Ngân sách dự kiến"
              value={form.budget}
              set={(v) => setForm({ ...form, budget: v })}
            />
            <Field
              label="Sản phẩm quan tâm"
              value={form.productsInterested}
              set={(v) => setForm({ ...form, productsInterested: v })}
              required
            />
            <Field
              label="Số lượng dự kiến"
              value={form.quantity}
              set={(v) => setForm({ ...form, quantity: v })}
              required
            />
            <label className="sm:col-span-2">
              <span className="label-base">Nhu cầu chi tiết</span>
              <textarea
                className="input-base min-h-28"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <button className="btn-primary sm:col-span-2">
              Gửi yêu cầu báo giá <ArrowRight className="h-4 w-4" />
            </button>
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
        <p className="text-xs uppercase tracking-[0.25em] text-agarwood-500 font-semibold">
          Lỗi 404 — Không tìm thấy trang
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-agarwood-800">
          Lạc giữa làn khói trầm
        </h1>
        <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-charcoal-300">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường
          dẫn khác. Hãy cùng Mộc Trầm quay về không gian an nhiên ban đầu.
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

function Field({
  label,
  value,
  set,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="label-base">{label}</span>
      <input
        required={required}
        type={type}
        className="input-base"
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}

function PolicyRoute() {
  const { slug } = useParams();
  return <ContentPage slug={slug || "chinh-sach-bao-mat"} />;
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
      <Route
        path={ROUTES.PRODUCT_DETAIL}
        element={<ProductOrCategoryRoute />}
      />

      {/* 3. Giỏ hàng & Thanh toán */}
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route
        path={ROUTES.CHECKOUT}
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      {/* 4. Xác thực & Tài khoản */}
      <Route path={ROUTES.AUTH} element={<AuthPage initialMode="login" />} />
      <Route
        path={ROUTES.REGISTER}
        element={<AuthPage initialMode="register" />}
      />
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
      <Route
        path={ROUTES.GUIDE}
        element={<ContentPage slug="cach-thuong-tram-dung-cach" />}
      />
      <Route
        path={ROUTES.GUIDE_DETAIL}
        element={<ContentPage slug="cach-thuong-tram-dung-cach" />}
      />
      <Route path={ROUTES.POLICY} element={<PolicyRoute />} />

      {/* 7. B2B & Showroom */}
      <Route path={ROUTES.B2B} element={<B2BPage />} />
      <Route path={ROUTES.SHOWROOM} element={<B2BPage />} />

      {/* 8. Admin & Staff Management */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "STAFF_WAREHOUSE", "STAFF_CS"]}
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="san-pham" element={<AdminPlaceholderPage />} />
        <Route path="kho" element={<AdminPlaceholderPage />} />
        <Route path="don-hang" element={<AdminPlaceholderPage />} />
        <Route path="thanh-toan" element={<AdminPlaceholderPage />} />
        <Route path="van-chuyen" element={<AdminPlaceholderPage />} />
        <Route path="doi-tra" element={<AdminPlaceholderPage />} />
        <Route path="tu-van" element={<AdminPlaceholderPage />} />
        <Route path="ma-giam-gia" element={<AdminPlaceholderPage />} />
        <Route path="nguoi-dung" element={<AdminPlaceholderPage />} />
      </Route>

      {/* 9. Trang 404 Not Found (Xử lý tất cả các đường dẫn không hợp lệ) */}
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
