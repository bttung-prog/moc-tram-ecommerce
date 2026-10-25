COMMON_MESSAGES = {
    "SUCCESS": "Thành công",
    "CREATED": "Tạo thành công",
    "UPDATED": "Cập nhật thành công",
    "DELETED": "Xóa thành công",
    "RESTORED": "Khôi phục thành công",
    "ERROR": "Đã xảy ra lỗi",
    "SERVER_ERROR": "Lỗi máy chủ nội bộ",
    "UNAUTHORIZED": "Chưa được xác thực",
    "FORBIDDEN": "Bạn không có quyền thực hiện thao tác này",
    "FORBIDDEN_DEFAULT": "Truy cập bị từ chối",
    "VALIDATION_ERROR": "Dữ liệu không hợp lệ",
    "NOT_FOUND": "Không tìm thấy dữ liệu",
    "ALL_FIELDS_REQUIRED": "Vui lòng cung cấp đầy đủ thông tin các trường bắt buộc",
}


AUTH_MESSAGES = {
    "REGISTER_SUCCESS": "Đăng ký tài khoản thành công",
    "LOGIN_SUCCESS": "Đăng nhập thành công",
    "REFRESH_TOKEN_SUCCESS": "Làm mới mã truy cập thành công",
    "LOGOUT_SUCCESS": "Đăng xuất thành công",
    "INVALID_CREDENTIALS": "Email hoặc mật khẩu không chính xác",
    "INVALID_OR_EXPIRED_REFRESH_TOKEN": "Mã làm mới không hợp lệ hoặc đã hết hạn",
    "TOKEN_EXPIRED": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    "INVALID_ACCESS_TOKEN": "Mã truy cập không hợp lệ",
    "USER_NOT_FOUND": "Không tìm thấy người dùng",
    "ACCOUNT_INACTIVE_OR_LOCKED": "Tài khoản không hoạt động hoặc đã bị khóa",
    "EMAIL_NOT_FOUND": "Email không tồn tại trong hệ thống",
    "OTP_SENT_SUCCESS": "Mã xác thực OTP đã được gửi về email của bạn",
    "OTP_RESEND_COOLDOWN": "Vui lòng đợi 60 giây trước khi yêu cầu mã OTP mới",
    "OTP_NOT_FOUND": "Không tìm thấy mã OTP hoặc mã chưa được yêu cầu",
    "OTP_EXPIRED": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới",
    "OTP_INVALID": "Mã OTP không chính xác",
    "OTP_MAX_ATTEMPTS": "Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới",
    "OTP_VERIFIED_SUCCESS": "Xác thực mã OTP thành công",
    "RESET_PASSWORD_SUCCESS": "Đặt lại mật khẩu mới thành công",
    "NEW_PASSWORD_SAME_AS_OLD": "Mật khẩu mới không được trùng với mật khẩu cũ",
    "CHANGE_PASSWORD_SUCCESS": "Đổi mật khẩu thành công",
    "OLD_PASSWORD_INCORRECT": "Mật khẩu cũ không chính xác",
}


USER_MESSAGES = {
    "GET_PROFILE_SUCCESS": "Lấy thông tin người dùng thành công",
    "UPDATE_PROFILE_SUCCESS": "Cập nhật thông tin người dùng thành công",
    "EMAIL_EXISTS": "Email đã tồn tại",
    "PHONE_EXISTS": "Số điện thoại đã tồn tại",
    "NOT_FOUND": "Không tìm thấy người dùng",
}

COUPON_MESSAGES = {
    "CREATED": "Tạo mã giảm giá thành công",
    "UPDATED": "Cập nhật mã giảm giá thành công",
    "DELETED": "Xóa mã giảm giá thành công",
    "RESTORED": "Khôi phục mã giảm giá thành công",
    "NOT_FOUND": "Không tìm thấy mã giảm giá",
    "CODE_EXISTS": "Mã giảm giá đã tồn tại",
    "INVALID_DISCOUNT_TYPE": "Loại giảm giá không hợp lệ",
    "INVALID_DISCOUNT_VALUE": "Giá trị giảm giá không hợp lệ",
    "MISSING_REQUIRED_FIELDS": "Thiếu thông tin trường bắt buộc",
    "INVALID_MAX_DISCOUNT_AMOUNT": "Giá trị giảm giá tối đa không được âm",
    "INVALID_MIN_ORDER_AMOUNT": "Giá trị đơn hàng tối thiểu không được âm",
    "INVALID_DATE_RANGE": "Thời gian kết thúc không được trước thời gian bắt đầu",
    "AT_LEAST_ONE_FIELD_REQUIRED": "Vui lòng cung cấp ít nhất một trường để cập nhật",
}

CATEGORY_MESSAGES = {
    "CREATED": "Tạo danh mục thành công",
    "UPDATED": "Cập nhật danh mục thành công",
    "DELETED": "Xóa danh mục thành công",
    "NOT_FOUND": "Không tìm thấy danh mục",
    "NAME_EXISTS": "Tên danh mục đã tồn tại",
    "NAME_REQUIRED": "Tên danh mục không được để trống",
    "HAS_PRODUCTS": "Không thể xóa danh mục đang có sản phẩm liên kết",
    "STATUS_UPDATED": "Cập nhật trạng thái danh mục thành công",
    "AT_LEAST_ONE_FIELD_REQUIRED": "Vui lòng cung cấp ít nhất một trường để cập nhật",
}

PRODUCT_MESSAGES = {
    "CREATED": "Tạo sản phẩm thành công",
    "UPDATED": "Cập nhật sản phẩm thành công",
    "DELETED": "Xóa sản phẩm thành công",
    "NOT_FOUND": "Không tìm thấy sản phẩm",
    "NAME_EXISTS": "Tên sản phẩm đã tồn tại",
    "NAME_REQUIRED": "Tên sản phẩm không được để trống",
    "CATEGORY_NOT_FOUND": "Danh mục sản phẩm không tồn tại",
    "CATEGORY_INACTIVE": "Danh mục sản phẩm đang bị vô hiệu hóa",
    "INVALID_PRICE": "Giá sản phẩm phải lớn hơn 0",
    "STATUS_UPDATED": "Cập nhật trạng thái sản phẩm thành công",
    "DISCONTINUED": "Ngừng kinh doanh sản phẩm thành công",
    "INVALID_STATUS": "Trạng thái sản phẩm không hợp lệ",
    "AT_LEAST_ONE_FIELD_REQUIRED": "Vui lòng cung cấp ít nhất một trường để cập nhật",
}

WAREHOUSE_MESSAGES = {
    "CREATED": "Tạo kho hàng thành công",
    "UPDATED": "Cập nhật kho hàng thành công",
    "DELETED": "Xóa kho hàng thành công",
    "RESTORED": "Khôi phục kho hàng thành công",
    "NOT_FOUND": "Không tìm thấy kho hàng",
    "INACTIVE": "Kho hàng hiện không hoạt động",
    "NAME_EXISTS": "Tên kho hàng đã tồn tại",
    "NAME_REQUIRED": "Tên kho hàng không được để trống",
    "ADDRESS_REQUIRED": "Địa chỉ kho hàng không được để trống",
    "INVALID_STATUS": "Trạng thái kho hàng không hợp lệ",
    "STATUS_UPDATED": "Cập nhật trạng thái kho hàng thành công",
    "AT_LEAST_ONE_FIELD_REQUIRED": "Vui lòng cung cấp ít nhất một trường để cập nhật",
}
