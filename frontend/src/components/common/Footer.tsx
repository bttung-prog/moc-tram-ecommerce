import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { APP_CONFIG } from '@/constants/enums';

export function Footer() {
  const policyLinks = [
    { label: 'Chính sách bảo mật', slug: 'chinh-sach-bao-mat' },
    { label: 'Quyền và nghĩa vụ các bên', slug: 'quyen-va-nghia-vu-cac-ben' },
    { label: 'Chính sách giao hàng', slug: 'chinh-sach-giao-hang' },
    { label: 'Đổi trả và hoàn tiền', slug: 'chinh-sach-doi-tra-va-hoan-tien' },
  ];

  const navLinks = [
    { label: 'Trầm hương đốt', path: '/san-pham/tram-huong-dot' },
    { label: 'Dụng cụ thưởng trầm', path: '/san-pham/dung-cu-thuong-tram' },
    { label: 'Thiền & Trà', path: '/san-pham/khong-gian-thien-tra' },
    { label: 'Cẩm nang', path: '/cam-nang' },
    { label: 'Tra cứu đơn hàng', path: '/tra-cuu-don-hang' },
    { label: 'Báo giá B2B', path: '/bao-gia-b2b' },
    { label: 'Đặt lịch thử hương', path: '/showroom' },
  ];

  return (
    <footer className="mt-auto bg-charcoal-600 text-cream/80">
      {/* Main footer */}
      <div className="container-content py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-agarwood-400">
                <span className="font-serif text-lg font-semibold text-agarwood-400">M</span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-cream">{APP_CONFIG.brandName}</h3>
                <p className="text-xs text-cream/60 italic">{APP_CONFIG.slogan}</p>
              </div>
            </div>
            <p className="text-sm text-cream/60 leading-relaxed">
              Trầm hương Việt Nam, nguồn gốc minh bạch, chứng nhận kiểm định an toàn khói nhang.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4">Khám phá</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-cream/60 hover:text-agarwood-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4">Chính sách</h4>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.slug}>
                  <Link to={`/chinh-sach/${link.slug}`} className="text-sm text-cream/60 hover:text-agarwood-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-cream/60">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-agarwood-400" />
                <span>{APP_CONFIG.businessAddress}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-cream/60">
                <Phone className="h-4 w-4 shrink-0 text-agarwood-400" />
                <a href={`tel:${APP_CONFIG.supportPhone}`} className="hover:text-agarwood-400 transition-colors">{APP_CONFIG.supportPhone}</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-cream/60">
                <Mail className="h-4 w-4 shrink-0 text-agarwood-400" />
                <a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:text-agarwood-400 transition-colors">{APP_CONFIG.supportEmail}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal bar — required by Luật TMĐT */}
      <div className="border-t border-cream/10">
        <div className="container-content py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/40">
            <p>
              {APP_CONFIG.businessName} — MST: {APP_CONFIG.businessTaxCode}
            </p>
            <p>
              Địa chỉ: {APP_CONFIG.businessAddress}
            </p>
          </div>
          <div className="mt-2 text-center text-xs text-cream/30">
            <p>
              Gửi khiếu nại: {APP_CONFIG.supportEmail} — {APP_CONFIG.supportPhone}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
