import React from "react";
import type { Order } from "@/types";
import { formatVND } from "@/utils/format";
import { Printer, X, ShieldAlert, Package } from "lucide-react";

interface ShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const trackingCode =
    order.shipment?.trackingCode || `VNPOST-${order.orderCode}`;
  const carrier = order.shipment?.carrier || "Giao Hàng Tiết Kiệm (GHTK)";
  const isCOD = order.paymentMethod === "COD";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-700/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-agarwood-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-agarwood-100 px-6 py-4 bg-agarwood-50/50">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-agarwood-700" />
            <h3 className="font-serif text-lg font-bold text-agarwood-900">
              Tem Vận Đơn & Phiếu Xuất Kho
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-white hover:text-charcoal-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Label Container */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            id="printable-shipping-label"
            className="border-2 border-dashed border-charcoal-300 rounded-xl p-5 bg-white font-sans text-charcoal-800 text-xs shadow-inner space-y-4"
          >
            {/* Carrier & Barcode Top Banner */}
            <div className="flex items-center justify-between border-b-2 border-charcoal-800 pb-3">
              <div>
                <span className="font-serif text-base font-extrabold tracking-wider text-agarwood-900">
                  MỘC TRẦM
                </span>
                <p className="text-[10px] text-charcoal-400">
                  Tinh hoa Trầm hương Việt Nam
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded bg-charcoal-800 px-2 py-0.5 font-bold text-white uppercase text-[11px]">
                  {carrier}
                </span>
                <p className="font-mono text-[11px] font-bold mt-0.5 text-charcoal-700">
                  {trackingCode}
                </p>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex flex-col items-center justify-center py-1 bg-charcoal-50 rounded">
              <div className="flex items-center gap-0.5 h-10 w-full max-w-[280px] justify-center">
                {/* Visual barcode representation */}
                {[
                  3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 3, 1,
                  2, 4, 2, 1, 3, 2, 1, 4,
                ].map((width, i) => (
                  <div
                    key={i}
                    className="bg-charcoal-900 h-full"
                    style={{ width: `${width * 2}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] tracking-widest font-bold mt-1">
                *{trackingCode}*
              </span>
            </div>

            {/* Sender & Receiver Boxes */}
            <div className="grid grid-cols-2 gap-3 border-y border-charcoal-200 py-3 text-[11px]">
              <div className="border-r border-charcoal-200 pr-2">
                <span className="font-bold text-charcoal-500 uppercase text-[10px]">
                  Người gửi:
                </span>
                <p className="font-bold text-charcoal-800">MỘC TRẦM OFFICIAL</p>
                <p className="text-charcoal-600">Hotline: 0365 117 151</p>
                <p className="text-charcoal-500 text-[10px] leading-tight mt-0.5">
                  Kho Tổng Mộc Trầm, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="pl-1">
                <span className="font-bold text-charcoal-500 uppercase text-[10px]">
                  Người nhận:
                </span>
                <p className="font-bold text-charcoal-900 text-xs">
                  {order.shippingFullName || order.customerName}
                </p>
                <p className="font-mono font-semibold text-charcoal-800">
                  {order.shippingPhone || order.customerPhone}
                </p>
                <p className="text-charcoal-600 leading-tight mt-0.5">
                  {[
                    order.shippingDetail,
                    order.shippingWard,
                    order.shippingProvince,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            {/* Item Details */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-charcoal-500 border-b border-charcoal-100 pb-1">
                <span>Nội dung hàng hóa (Mã đơn: {order.orderCode})</span>
                <span>SL</span>
              </div>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-[11px]"
                >
                  <div className="pr-2">
                    <p className="font-medium text-charcoal-800">
                      {item.productName}
                    </p>
                    <p className="text-[10px] text-charcoal-400">
                      Quy cách: {item.specLabel}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-charcoal-800">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* COD & Fragility Notice */}
            <div className="rounded-lg bg-agarwood-50 border border-agarwood-200 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-charcoal-700">
                  Tiền thu hộ COD:
                </span>
                <span className="font-mono text-base font-extrabold text-agarwood-800">
                  {isCOD ? formatVND(order.total) : "0 đ (ĐÃ THANH TOÁN)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-agarwood-900 font-medium border-t border-agarwood-200/60 pt-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>HÀNG DỄ VỠ - CHỐNG ẨM - CHO XEM HÀNG, KHÔNG THỬ</span>
              </div>
            </div>

            {/* Footer Checklist */}
            <div className="flex justify-between text-[10px] text-charcoal-400 pt-1">
              <span>Ngày in: {new Date().toLocaleDateString("vi-VN")}</span>
              <span>Chữ ký người giao / nhận: ......................</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-agarwood-100 px-6 py-4 bg-white">
          <p className="text-xs text-charcoal-400">
            Khổ in khuyến nghị: 100x150mm (Decal nhiệt) hoặc A5
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-charcoal-200 px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-agarwood-700 px-4 py-2 text-xs font-semibold text-cream hover:bg-agarwood-800 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>In Phiếu Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
