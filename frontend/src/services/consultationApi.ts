import type { ApiResult, QuoteRequest, ShowroomAppointment } from '@/types';
import { randomDelay, generateId } from '@/utils/helpers';
import { quoteRequests, appointments } from '@/mock/orders';
import { SHOWROOMS, APPOINTMENT_SLOTS } from '@/constants/enums';

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string, errors?: Record<string, string>): ApiResult<never> {
  return { success: false, data: null, message, errors };
}

export const consultationApi = {
  async createQuoteRequest(data: {
    companyName: string; contactName: string; email: string; phone: string;
    b2bType: string; productsInterested: string; quantity: string; budget: string; note: string;
  }): Promise<ApiResult<QuoteRequest>> {
    await randomDelay();
    const qr: QuoteRequest = {
      id: generateId('qr'),
      requestCode: `B2B-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      b2bType: data.b2bType as QuoteRequest['b2bType'],
      productsInterested: data.productsInterested,
      quantity: data.quantity,
      budget: data.budget,
      note: data.note,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    quoteRequests.push(qr);
    return ok(qr, 'Yêu cầu báo giá đã được gửi');
  },

  async getAllQuoteRequests(): Promise<ApiResult<QuoteRequest[]>> {
    await randomDelay();
    return ok([...quoteRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },

  async updateQuoteStatus(id: string, status: string, quotedAmount?: number): Promise<ApiResult<QuoteRequest>> {
    await randomDelay();
    const qr = quoteRequests.find((q) => q.id === id);
    if (!qr) return fail('Không tìm thấy yêu cầu');
    qr.status = status as QuoteRequest['status'];
    if (quotedAmount !== undefined) qr.quotedAmount = quotedAmount;
    return ok(qr, 'Cập nhật thành công');
  },

  async createAppointment(data: {
    showroomId: string; customerName: string; phone: string; email: string;
    date: string; slot: string; numGuests: number; note: string;
  }): Promise<ApiResult<ShowroomAppointment>> {
    await randomDelay();
    const showroom = SHOWROOMS.find((s) => s.id === data.showroomId);
    const appt: ShowroomAppointment = {
      id: generateId('appt'),
      ...data,
      showroomId: data.showroomId,
      showroomName: showroom?.name || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    appointments.push(appt);
    return ok(appt, 'Đặt lịch thành công');
  },

  async getAllAppointments(): Promise<ApiResult<ShowroomAppointment[]>> {
    await randomDelay();
    return ok([...appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResult<ShowroomAppointment>> {
    await randomDelay();
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return fail('Không tìm thấy lịch hẹn');
    appt.status = status as ShowroomAppointment['status'];
    return ok(appt, 'Cập nhật thành công');
  },

  async getAvailableSlots(showroomId: string, date: string): Promise<ApiResult<{ slot: string; available: number }[]>> {
    await randomDelay(100, 200);
    // Mock: each slot has capacity 4, subtract booked
    const booked = appointments.filter((a) => a.showroomId === showroomId && a.date.startsWith(date) && a.status !== 'CANCELLED');
    return ok(APPOINTMENT_SLOTS.map((slot) => {
      const count = booked.filter((a) => a.slot === slot).reduce((sum, a) => sum + a.numGuests, 0);
      return { slot, available: Math.max(0, 4 - count) };
    }));
  },
};
