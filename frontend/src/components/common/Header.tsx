import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, Phone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { APP_CONFIG } from '@/constants/enums';

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: 'Trầm hương đốt', path: '/san-pham/tram-huong-dot' },
    { label: 'Dụng cụ thưởng trầm', path: '/san-pham/dung-cu-thuong-tram' },
    { label: 'Thiền & Trà', path: '/san-pham/khong-gian-thien-tra' },
    { label: 'Cẩm nang', path: '/cam-nang' },
    { label: 'Về Mộc Trầm', path: '/gioi-thieu' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ivory/95 backdrop-blur-md shadow-sm' : 'bg-ivory'}`}>
      {/* Top bar */}
      <div className="border-b border-agarwood-100 bg-agarwood-800 text-cream">
        <div className="container-content flex items-center justify-between py-1.5 text-xs">
          <span className="hidden sm:block">Miễn phí vận chuyển cho đơn từ 500.000 ₫</span>
          <a href={`tel:${APP_CONFIG.supportPhone}`} className="flex items-center gap-1.5 hover:text-agarwood-200 transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span>{APP_CONFIG.supportPhone}</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <div className="container-content py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-agarwood-400 bg-agarwood-50">
              <span className="font-serif text-xl font-semibold text-agarwood-800">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif text-xl font-semibold text-agarwood-800 leading-none">{APP_CONFIG.brandName}</h1>
              <p className="text-xs text-charcoal-300 mt-0.5 italic">{APP_CONFIG.slogan}</p>
            </div>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="input-base pl-10"
                aria-label="Tìm kiếm sản phẩm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-300" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to={user.role === 'ADMIN' || user.role === 'STAFF_WAREHOUSE' || user.role === 'STAFF_CS' ? '/admin' : '/tai-khoan'} className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-agarwood-800 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user.fullName}</span>
                </Link>
                <button onClick={() => logout()} className="text-xs text-charcoal-300 hover:text-error transition-colors">Đăng xuất</button>
              </div>
            ) : (
              <Link to="/dang-nhap" className="hidden sm:flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-agarwood-800 transition-colors">
                <User className="h-4 w-4" />
                <span>Đăng nhập</span>
              </Link>
            )}

            <Link to="/gio-hang" className="relative flex items-center gap-1.5 text-charcoal-500 hover:text-agarwood-800 transition-colors" aria-label="Giỏ hàng">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-agarwood-400 px-1 text-xs font-medium text-white animate-fade-in">
                  {count}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-charcoal-500" aria-label="Menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav — desktop */}
      <nav className="hidden md:block border-t border-agarwood-100">
        <div className="container-content">
          <ul className="flex items-center gap-6 py-3">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm text-charcoal-500 hover:text-agarwood-800 transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-agarwood-400 transition-all group-hover:w-full" />
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <Link to="/bao-gia-b2b" className="text-sm font-medium text-agarwood-700 hover:text-agarwood-800 transition-colors">Báo giá B2B</Link>
            </li>
            <li>
              <Link to="/showroom" className="text-sm font-medium text-moss-500 hover:text-moss-600 transition-colors">Đặt lịch thử hương</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-agarwood-100 bg-ivory animate-fade-in">
          <div className="container-content py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="input-base pl-10"
                aria-label="Tìm kiếm sản phẩm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-300" />
            </form>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-charcoal-500 hover:text-agarwood-800 transition-colors">
                {link.label}
              </Link>
            ))}
            <Link to="/bao-gia-b2b" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-agarwood-700">Báo giá B2B</Link>
            <Link to="/showroom" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-moss-500">Đặt lịch thử hương</Link>
            {user ? (
              <>
                <Link to={user.role === 'ADMIN' || user.role === 'STAFF_WAREHOUSE' || user.role === 'STAFF_CS' ? '/admin' : '/tai-khoan'} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-charcoal-500">Tài khoản: {user.fullName}</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-sm text-error">Đăng xuất</button>
              </>
            ) : (
              <Link to="/dang-nhap" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-charcoal-500">Đăng nhập / Đăng ký</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
