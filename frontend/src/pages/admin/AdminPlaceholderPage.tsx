import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ADMIN_MENU } from "@/constants/permissions";
import { ArrowLeft, Construction, ExternalLink } from "lucide-react";

export const AdminPlaceholderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItem = ADMIN_MENU.find((item) => item.path === location.pathname);
  const title = menuItem ? menuItem.label : "Phân hệ Quản trị";

  return (
    <div className="rounded-2xl border border-agarwood-100 bg-white p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto my-8 animate-fade-in">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-agarwood-100 text-agarwood-800 mb-6">
        <Construction className="h-8 w-8 text-agarwood-700" />
      </div>

      <span className="rounded-full bg-agarwood-50 px-3 py-1 text-xs font-semibold text-agarwood-700 border border-agarwood-200">
        Phân hệ: {location.pathname}
      </span>

      <h2 className="font-serif text-2xl font-bold text-agarwood-900 mt-4">
        {title}
      </h2>

      <p className="text-sm text-charcoal-400 mt-2 max-w-md mx-auto">
        Module này đang được kết nối với API backend và hoàn thiện giao diện chi
        tiết. Bạn có thể quay lại trang Tổng quan để kiểm soát các chỉ số vận
        hành chính.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => navigate("/admin")}
          className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang Tổng quan (Dashboard)</span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="btn-outline text-xs px-5 py-2.5 flex items-center gap-2"
        >
          <span>Xem Cửa hàng Khách</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
