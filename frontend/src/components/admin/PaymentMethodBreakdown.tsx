import React from "react";
import type { PaymentStat } from "@/services/adminDashboardApi";
import { formatVND } from "@/utils/format";
import { QrCode, Banknote, CreditCard, ShieldCheck } from "lucide-react";

interface PaymentMethodBreakdownProps {
  stats: PaymentStat[];
  loading?: boolean;
}

const paymentIcons = {
  VIETQR: QrCode,
  COD: Banknote,
  PAYPAL: CreditCard,
};

export const PaymentMethodBreakdown: React.FC<PaymentMethodBreakdownProps> = ({
  stats,
  loading,
}) => {
  if (loading || !stats || stats.length === 0) {
    return (
      <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="h-5 w-1/2 skeleton mb-4" />
        <div className="space-y-3">
          <div className="h-12 skeleton w-full rounded-xl" />
          <div className="h-12 skeleton w-full rounded-xl" />
          <div className="h-12 skeleton w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-agarwood-50">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-agarwood-900">
            Cơ cấu Phương thức Thanh toán
          </h3>
          <p className="text-[11px] sm:text-xs text-charcoal-400">
            Theo dõi dòng tiền & rủi ro đối soát COD
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium self-start sm:self-auto shrink-0">
          <ShieldCheck className="h-3.5 w-3.5" /> Khớp lệnh tự động
        </div>
      </div>

      <div className="mt-3.5 sm:mt-4 space-y-2.5 sm:space-y-3">
        {stats.map((item) => {
          const Icon = paymentIcons[item.method] || Banknote;
          const isVqr = item.method === "VIETQR";
          const isCod = item.method === "COD";

          return (
            <div
              key={item.method}
              className="rounded-xl border border-agarwood-100 p-2.5 sm:p-3 hover:border-agarwood-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${isVqr ? "bg-emerald-50 text-emerald-700" : isCod ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-charcoal-600 truncate block">
                      {item.label}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-charcoal-400">
                      ({item.count} giao dịch)
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-agarwood-900 block">
                    {formatVND(item.totalAmount)}
                  </span>
                  <span className="text-[11px] font-bold text-agarwood-600">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-agarwood-50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isVqr
                      ? "bg-emerald-600"
                      : isCod
                        ? "bg-amber-500"
                        : "bg-sky-600"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
