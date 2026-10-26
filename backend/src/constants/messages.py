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
    "REGISTER_SUCCESS_WITH_OTP": "Đăng ký tài khoản thành công. Mã xác thực OTP đã được gửi về email của bạn.",
    "ACCOUNT_ACTIVATED_SUCCESS": "Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.",
    "ACCOUNT_ALREADY_ACTIVE": "Tài khoản này đã được kích hoạt trước đó",
    "ACCOUNT_NOT_ACTIVATED": "Tài khoản đã được đăng ký nhưng chưa kích hoạt. Vui lòng xác thực mã OTP.",
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

INVENTORY_MESSAGES = {
    "CREATED": "Tạo bản ghi tồn kho thành công",
    "UPDATED": "Cập nhật tồn kho thành công",
    "DELETED": "Xóa bản ghi tồn kho thành công",
    "NOT_FOUND": "Không tìm thấy thông tin tồn kho",
    "PRODUCT_NOT_FOUND": "Sản phẩm không tồn tại",
    "WAREHOUSE_NOT_FOUND": "Kho hàng không tồn tại",
    "WAREHOUSE_INACTIVE": "Kho hàng hiện không hoạt động",
    "PRODUCT_ALREADY_EXISTS": "Sản phẩm này đã có bản ghi tồn kho",
    "INVALID_QUANTITY": "Số lượng tồn kho không được âm",
    "INVALID_LOCATION": "Vị trí lưu kho không được để trống",
    "INSUFFICIENT_STOCK": "Số lượng hàng trong kho không đủ",
    "CANNOT_DELETE_NON_ZERO": "Chỉ có thể xóa bản ghi tồn kho khi số lượng hàng bằng 0",
    "AT_LEAST_ONE_FIELD_REQUIRED": "Vui lòng cung cấp ít nhất một trường để cập nhật",
}

ISSUE_MESSAGES = {
    "CREATED": "Tạo phiếu xuất kho thành công",
    "UPDATED": "Cập nhật phiếu xuất kho thành công",
    "CANCELLED": "Hủy phiếu xuất kho thành công",
    "NOT_FOUND": "Không tìm thấy phiếu xuất kho",
    "ALREADY_CANCELLED": "Phiếu xuất kho này đã bị hủy trước đó",
    "INVALID_QUANTITY": "Số lượng xuất kho phải lớn hơn 0",
    "INSUFFICIENT_STOCK": "Số lượng hàng trong kho không đủ để xuất",
    "WAREHOUSE_NOT_FOUND": "Kho hàng không tồn tại",
    "PRODUCT_NOT_FOUND": "Sản phẩm không tồn tại",
    "ORDER_NOT_FOUND": "Đơn hàng không tồn tại",
    "CANNOT_UPDATE_CANCELLED": "Không thể chỉnh sửa phiếu xuất kho đã hủy",
}

RECEIPT_MESSAGES = {
    "CREATED": "Tạo phiếu nhập kho thành công",
    "UPDATED": "Cập nhật phiếu nhập kho thành công",
    "CANCELLED": "Hủy phiếu nhập kho thành công",
    "NOT_FOUND": "Không tìm thấy phiếu nhập kho",
    "ALREADY_CANCELLED": "Phiếu nhập kho này đã bị hủy trước đó",
    "INVALID_QUANTITY": "Số lượng nhập kho phải lớn hơn 0",
    "INSUFFICIENT_STOCK_TO_CANCEL": "Số lượng tồn kho hiện tại không đủ để hoàn tác phiếu nhập này",
    "WAREHOUSE_NOT_FOUND": "Kho hàng không tồn tại",
    "PRODUCT_NOT_FOUND": "Sản phẩm không tồn tại",
    "CANNOT_UPDATE_CANCELLED": "Không thể chỉnh sửa phiếu nhập kho đã hủy",
}
