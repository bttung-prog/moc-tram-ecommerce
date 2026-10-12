import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function StatusBadge({ label, colorClass }: { label: string; colorClass: string }) {
  return <span className={`badge ${colorClass}`}>{label}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-charcoal-200">{icon}</div>}
      <h3 className="font-serif text-lg text-agarwood-700">{title}</h3>
      {description && <p className="mt-2 text-sm text-charcoal-300 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 h-12 w-12 rounded-full bg-error-light flex items-center justify-center text-error">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-serif text-lg text-agarwood-700">Đã có lỗi xảy ra</h3>
      <p className="mt-2 text-sm text-charcoal-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-6">Thử lại</button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="h-6 skeleton w-1/3" />
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-charcoal-300">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          {idx > 0 && <span className="text-charcoal-200">/</span>}
          {item.path ? (
            <Link to={item.path} className="hover:text-agarwood-700 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-agarwood-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="btn-ghost px-3 py-2 disabled:opacity-30">
        Trước
      </button>
      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {showEllipsis && <span className="px-2 text-charcoal-200">...</span>}
            <button
              onClick={() => onPage(p)}
              className={`min-w-9 h-9 rounded-lg text-sm transition-colors ${p === page ? 'bg-agarwood-800 text-cream' : 'text-charcoal-400 hover:bg-agarwood-50'}`}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="btn-ghost px-3 py-2 disabled:opacity-30">
        Sau
      </button>
    </div>
  );
}
export * from './ScrollToTop';
export * from './ProtectedRoute';
