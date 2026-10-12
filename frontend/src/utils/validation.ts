// Vietnamese phone number validation: 0xx + 8-9 digits, starting with 03/05/07/08/09
const PHONE_REGEX = /^(0(3|5|7|8|9)\d{8})$/;

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Vui lòng nhập số điện thoại';
  if (!PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
    return 'Số điện thoại không hợp lệ (10 số, bắt đầu 03/05/07/08/09)';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Vui lòng nhập email';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email không hợp lệ';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Vui lòng nhập mật khẩu';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `Vui lòng nhập ${fieldName}`;
  return null;
}

export function validateOtp(otp: string): string | null {
  if (!otp) return 'Vui lòng nhập mã OTP';
  if (!/^\d{6}$/.test(otp)) return 'Mã OTP phải có 6 chữ số';
  return null;
}

export function validateProvince(value: string): string | null {
  return validateRequired(value, 'tỉnh/thành phố');
}

export function validateWard(value: string): string | null {
  return validateRequired(value, 'phường/xã');
}

export function validateAddressDetail(value: string): string | null {
  return validateRequired(value, 'địa chỉ chi tiết');
}

// Vietnamese provinces (simplified — common ones)
export const PROVINCES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

export function getWardsForProvince(province: string): string[] {
  // Mock wards — in real app would come from API
  const common = ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Bến Nghé', 'Phường Cẩm Châu', 'Phường Hải Châu'];
  return common;
}
