import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Search, Package, ShoppingBag, Warehouse, RotateCcw, BriefcaseBusiness, CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react';
import { orderApi } from '@/services/orderApi';
import { inventoryApi, type InventorySummary } from '@/services/inventoryApi';
import { consultationApi } from '@/services/consultationApi';
import { couponApi } from '@/services/miscApi';
import type { Order, ReturnRequest, QuoteRequest, ShowroomAppointment } from '@/types';
import { formatVND, formatDateTime } from '@/utils/format';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PAID: 'Đã thanh toán', PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy', RETURNED: 'Đã hoàn trả',
};
const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: TrendingUp }, { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  { id: 'inventory', label: 'Kho & tồn', icon: Warehouse }, { id: 'returns', label: 'Đổi trả', icon: RotateCcw },
  { id: 'b2b', label: 'Báo giá B2B', icon: BriefcaseBusiness }, { id: 'appointments', label: 'Lịch thử hương', icon: CalendarDays },
  { id: 'coupons', label: 'Quản lý Coupon', icon: ShoppingBag },
] as const;
type Tab = typeof TABS[number]['id'];

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [appointments, setAppointments] = useState<ShowroomAppointment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponSearch, setCouponSearch] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [o, i, r, q, a] = await Promise.all([
        orderApi.getAllOrders({ limit: 500 }), inventoryApi.getInventorySummary(), orderApi.getAllReturnRequests(),
        consultationApi.getAllQuoteRequests(), consultationApi.getAllAppointments(),
      ]);
      if (o.success && o.data) setOrders(o.data.items);
      if (i.success && i.data) setInventory(i.data);
      if (r.success && r.data) setReturns(r.data);
      if (q.success && q.data) setQuotes(q.data);
      if (a.success && a.data) setAppointments(a.data);
      const couponResult = await couponApi.getAllCoupons();

      if (couponResult.success && couponResult.data) {
    setCoupons(couponResult.data);
}
    } catch { setMessage('Không thể tải dữ liệu. Vui lòng thử tải lại.'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filteredOrders = useMemo(() => orders.filter(o => `${o.orderCode} ${o.customerName} ${o.customerPhone}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const revenue = orders.filter(o => !['CANCELLED', 'RETURNED'].includes(o.status)).reduce((sum, o) => sum + o.total, 0);
  const lowStock = inventory.filter(i => i.available <= i.threshold);

  const changeOrderStatus = async (order: Order, status: string) => {
    const result = await orderApi.updateOrderStatus(order.id, status, 'Cập nhật từ trang quản trị');
    setMessage(result.message); await load();
  };
  const changeReturnStatus = async (item: ReturnRequest, status: string) => {
    const result = await orderApi.updateReturnStatus(item.id, status, 'Cập nhật từ trang quản trị');
    setMessage(result.message); await load();
  };
  const changeQuoteStatus = async (item: QuoteRequest, status: string) => {
    const result = await consultationApi.updateQuoteStatus(item.id, status);
    setMessage(result.message); await load();
  };
  const changeAppointmentStatus = async (item: ShowroomAppointment, status: string) => {
    const result = await consultationApi.updateAppointmentStatus(item.id, status);
    setMessage(result.message); await load();
  };

  return <div className="min-h-screen bg-stone-50 text-stone-800">
    <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <div><p className="text-xs font-semibold uppercase tracking-[.22em] text-amber-800">Mộc Trầm · OMS</p><h1 className="mt-1 font-serif text-2xl">Bảng điều khiển quản trị</h1></div>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800"><ArrowLeft size={16}/> Về cửa hàng</Link>
    </div></header>
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap gap-2">{TABS.map(({id,label,icon:Icon}) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${tab===id?'bg-stone-900 text-white':'border border-stone-200 bg-white hover:bg-stone-100'}`}><Icon size={16}/>{label}</button>)}
        <button onClick={() => void load()} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm"><RefreshCw size={16} className={busy?'animate-spin':''}/> Làm mới</button></div>
      {message && <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{message}<button onClick={() => setMessage('')} aria-label="Đóng">×</button></div>}
      {tab==='overview' && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric title="Doanh thu đơn hợp lệ" value={formatVND(revenue)} icon={<TrendingUp/>}/><Metric title="Tổng đơn hàng" value={String(orders.length)} icon={<ShoppingBag/>}/><Metric title="SKU cần kiểm tra tồn" value={String(lowStock.length)} icon={<AlertTriangle/>}/><Metric title="Yêu cầu đổi trả" value={String(returns.filter(r=>!['COMPLETED','REJECTED','CANCELLED'].includes(r.status)).length)} icon={<RotateCcw/>}/>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="mb-4 font-semibold">Đơn hàng mới nhất</h2><div className="space-y-3">{orders.slice(0,5).map(o=><div key={o.id} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 text-sm"><div><p className="font-medium">{o.orderCode} · {o.customerName}</p><p className="mt-1 text-xs text-stone-500">{formatDateTime(o.createdAt)}</p></div><div className="text-right"><p className="font-semibold">{formatVND(o.total)}</p><p className="mt-1 text-xs text-stone-500">{STATUS_LABEL[o.status] || o.status}</p></div></div>)}{orders.length===0&&<p className="text-sm text-stone-500">Chưa có đơn hàng.</p>}</div></section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="mb-4 font-semibold">Cảnh báo tồn kho khả dụng</h2><div className="space-y-3">{lowStock.slice(0,8).map(i=><div key={i.skuId} className="flex justify-between gap-3 border-b border-stone-100 pb-3 text-sm"><div><p className="font-medium">{i.productName}</p><p className="text-xs text-stone-500">{i.specLabel}</p></div><span className="self-center font-semibold text-red-700">{i.available} còn khả dụng</span></div>)}{lowStock.length===0&&<p className="text-sm text-stone-500">Không có SKU nào dưới ngưỡng.</p>}</div></section></div>
      </>}
      {tab==='orders' && <section className="rounded-2xl border border-stone-200 bg-white p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Quản lý đơn hàng</h2><label className="flex items-center gap-2 rounded-lg border px-3"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-56 py-2 text-sm outline-none" placeholder="Mã đơn, khách, điện thoại"/></label></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b bg-stone-50 text-xs uppercase text-stone-500"><th className="p-3">Đơn hàng</th><th className="p-3">Khách hàng</th><th className="p-3">Tổng tiền</th><th className="p-3">Thanh toán</th><th className="p-3">Trạng thái / cập nhật</th></tr></thead><tbody>{filteredOrders.map(o=><tr key={o.id} className="border-b border-stone-100"><td className="p-3 font-medium">{o.orderCode}<p className="mt-1 text-xs font-normal text-stone-500">{formatDateTime(o.createdAt)}</p></td><td className="p-3">{o.customerName}<p className="text-xs text-stone-500">{o.customerPhone}</p></td><td className="p-3 font-semibold">{formatVND(o.total)}</td><td className="p-3">{o.paymentMethod} · {o.payment?.status || '—'}</td><td className="p-3"><select aria-label={`Trạng thái ${o.orderCode}`} value={o.status} onChange={e=>void changeOrderStatus(o,e.target.value)} className="rounded-lg border border-stone-200 p-2"><option value={o.status}>{STATUS_LABEL[o.status]||o.status}</option>{['CONFIRMED','PAID','PACKING','SHIPPING','COMPLETED','CANCELLED','RETURNED'].filter(s=>s!==o.status).map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></td></tr>)}</tbody></table>{filteredOrders.length===0&&<p className="py-8 text-center text-sm text-stone-500">Không tìm thấy đơn hàng.</p>}</div></section>}
      {tab==='inventory' && <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="mb-4 font-semibold">Tồn kho theo SKU (thực tế, đã cam kết, khả dụng)</h2><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b bg-stone-50 text-xs uppercase text-stone-500"><th className="p-3">Sản phẩm</th><th className="p-3">Quy cách</th><th className="p-3">Tồn thực tế</th><th className="p-3">Đã cam kết</th><th className="p-3">Khả dụng</th><th className="p-3">Cảnh báo</th></tr></thead><tbody>{inventory.map(i=><tr key={i.skuId} className="border-b border-stone-100"><td className="p-3 font-medium">{i.productName}</td><td className="p-3">{i.specLabel}</td><td className="p-3">{i.onHand}</td><td className="p-3">{i.committed}</td><td className="p-3 font-semibold">{i.available}</td><td className="p-3">{i.lowStock?<span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">Sắp hết</span>:<span className="text-xs text-green-700">Bình thường</span>}</td></tr>)}</tbody></table></div><p className="mt-3 text-xs text-stone-500">Lưu ý: dữ liệu tồn hiện lấy từ mock service của frontend, chưa phải tồn kho đồng bộ thời gian thực với backend.</p></section>}
      {tab==='returns' && <DataTable title="Yêu cầu đổi trả / hoàn tiền" headers={['Mã yêu cầu','Mã đơn','Lý do','Trạng thái','Thao tác']} rows={returns.map(r=>[r.requestCode,r.orderCode,r.reason,<span>{r.status}</span>,<select aria-label={`Trạng thái ${r.requestCode}`} className="rounded border p-2" value={r.status} onChange={e=>void changeReturnStatus(r,e.target.value)}><option value={r.status}>{r.status}</option>{['VERIFIED','APPROVED','REJECTED','ITEM_RECEIVED','COMPLETED'].filter(s=>s!==r.status).map(s=><option key={s}>{s}</option>)}</select>])}/>}
      {tab==='b2b' && <DataTable title="Yêu cầu báo giá doanh nghiệp" headers={['Doanh nghiệp','Liên hệ','Sản phẩm / nhu cầu','Số lượng','Trạng thái']} rows={quotes.map(q=>[q.companyName,`${q.contactName} · ${q.phone}`,q.productsInterested,q.quantity,<select aria-label={`Trạng thái báo giá ${q.companyName}`} className="rounded border p-2" value={q.status} onChange={e=>void changeQuoteStatus(q,e.target.value)}><option value={q.status}>{q.status}</option>{['IN_PROGRESS','QUOTED','ACCEPTED','REJECTED','CLOSED'].filter(s=>s!==q.status).map(s=><option key={s}>{s}</option>)}</select>])}/>}
      {tab==='appointments' && <DataTable title="Lịch hẹn thử hương showroom" headers={['Khách hàng','Ngày / giờ','Số khách','Điện thoại','Trạng thái']} rows={appointments.map(a=>[a.customerName,`${a.date} · ${a.slot}`,String(a.numGuests),a.phone,<select aria-label={`Trạng thái lịch ${a.customerName}`} className="rounded border p-2" value={a.status} onChange={e=>void changeAppointmentStatus(a,e.target.value)}><option value={a.status}>{a.status}</option>{['CONFIRMED','COMPLETED','CANCELLED','NO_SHOW'].filter(s=>s!==a.status).map(s=><option key={s}>{s}</option>)}</select>])}/>}
      {tab === 'coupons' && (
  <section className="rounded-2xl border border-stone-200 bg-white p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-semibold">Quản lý Coupon</h2>

      <input
        value={couponSearch}
        onChange={(e) => setCouponSearch(e.target.value)}
        placeholder="Tìm mã Coupon..."
        className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
      />
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b bg-stone-50 text-stone-500">
            <th className="p-3">Mã Coupon</th>
            <th className="p-3">Loại giảm</th>
            <th className="p-3">Giá trị</th>
            <th className="p-3">Lượt dùng</th>
            <th className="p-3">Thời hạn</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {coupons
            .filter((coupon) =>
              coupon.code.toLowerCase().includes(couponSearch.toLowerCase())
            )
            .map((coupon) => (
              <tr key={coupon.id} className="border-b border-stone-100">
                <td className="p-3 font-semibold">{coupon.code}</td>

                <td className="p-3">
                  {coupon.discountType === 'PERCENT'
                    ? 'Phần trăm'
                    : 'Số tiền cố định'}
                </td>

                <td className="p-3">
                  {coupon.discountType === 'PERCENT'
                    ? `${coupon.discountValue}%`
                    : formatVND(coupon.discountValue)}
                </td>

                <td className="p-3">
                  {coupon.usedCount}/{coupon.usageLimit}
                </td>

                <td className="p-3">
                  {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}
                </td>

                <td className="p-3">
                  <span
                    className={
                      coupon.isActive
                        ? 'rounded-full bg-green-50 px-2 py-1 text-xs text-green-700'
                        : 'rounded-full bg-red-50 px-2 py-1 text-xs text-red-700'
                    }
                  >
                    {!coupon.isActive
                      ? 'Đã tắt'
                      : new Date(coupon.validFrom) > new Date()
                        ? 'Chưa bắt đầu'
                      : new Date(coupon.validUntil) < new Date()
                        ? 'Đã hết hạn'
                      : coupon.usedCount >= coupon.usageLimit
                        ? 'Hết lượt dùng'
                      : 'Đang bật'}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={async () => {
                      const result = await couponApi.toggleCoupon(coupon.id);

                      if (result.success) {
                        setMessage(result.message || 'Đã cập nhật Coupon');
                        const refreshed = await couponApi.getAllCoupons();

                        if (refreshed.success && refreshed.data) {
                          setCoupons(refreshed.data);
                        }
                      } else {
                        setMessage(result.message || 'Không thể cập nhật Coupon');
                      }
                    }}
                    className="rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-50"
                  >
                    {coupon.isActive ? 'Tắt Coupon' : 'Bật Coupon'}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {coupons.filter((coupon) =>
        coupon.code.toLowerCase().includes(couponSearch.toLowerCase())
      ).length === 0 && (
        <p className="py-8 text-center text-sm text-stone-500">
          Không tìm thấy Coupon.
        </p>
      )}
    </div>
  </section>
)}
    </main>
  </div>;
}
function Metric({title,value,icon}:{title:string;value:string;icon:React.ReactNode}) { return <div className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between text-stone-500"><span className="text-sm">{title}</span>{icon}</div><p className="mt-3 text-2xl font-semibold">{value}</p></div>; }
function DataTable({title,headers,rows}:{title:string;headers:string[];rows:React.ReactNode[][]}) { return <section className="rounded-2xl border border-stone-200 bg-white p-5"><h2 className="mb-4 font-semibold">{title}</h2><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b bg-stone-50 text-xs uppercase text-stone-500">{headers.map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i} className="border-b border-stone-100">{row.map((cell,j)=><td key={j} className="p-3">{cell}</td>)}</tr>)}</tbody></table>{rows.length===0&&<p className="py-8 text-center text-sm text-stone-500">Chưa có dữ liệu.</p>}</div></section>; }
