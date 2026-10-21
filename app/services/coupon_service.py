from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.coupon import Coupon, CouponUsage, DiscountType
from app.models.product import ProductVariant, Product
from app.core.exceptions import InvalidCouponException, ResourceNotFoundException


class CouponService:
    """
    Business Logic xử lý mã giảm giá (Coupon & Discount Validation):
    - Kiểm tra tính hợp lệ: thời hạn, lượt dùng toàn hệ thống, giới hạn mỗi khách hàng.
    - Giá trị đơn hàng tối thiểu.
    - Ràng buộc theo danh mục sản phẩm (vd: chỉ áp dụng cho Chuông Xoay hoặc Trầm Hương Tự Nhiên).
    - Tính toán chiết khấu % (có trần tối đa) hoặc số tiền cố định.
    """

    def validate_coupon(
        self,
        db: Session,
        code: str,
        subtotal: float,
        customer_phone: str,
        customer_email: str,
        variant_ids: Optional[List[int]] = None
    ) -> Tuple[Coupon, float, str]:
        """
        Xác thực mã giảm giá.
        Returns: (coupon_model, discount_amount, message)
        Raises: InvalidCouponException nếu không hợp lệ.
        """
        normalized_code = code.strip().upper()
        coupon = db.query(Coupon).filter(
            Coupon.code == normalized_code,
            Coupon.is_active == True
        ).first()

        if not coupon:
            raise InvalidCouponException("Mã giảm giá không tồn tại hoặc đã bị ngừng áp dụng.", normalized_code)

        now = datetime.utcnow()
        if now < coupon.start_date:
            raise InvalidCouponException(f"Mã giảm giá chưa đến ngày kích hoạt (bắt đầu từ {coupon.start_date.strftime('%d/%m/%Y')}).", normalized_code)

        if now > coupon.end_date:
            raise InvalidCouponException(f"Mã giảm giá đã hết hạn sử dụng (hạn chót {coupon.end_date.strftime('%d/%m/%Y')}).", normalized_code)

        if coupon.usage_limit_total and coupon.used_count >= coupon.usage_limit_total:
            raise InvalidCouponException("Mã giảm giá đã đạt giới hạn số lượt sử dụng tối đa của chương trình.", normalized_code)

        # Kiểm tra số lần sử dụng của khách hàng này
        user_usage_count = db.query(CouponUsage).filter(
            CouponUsage.coupon_id == coupon.id,
            (CouponUsage.customer_phone == customer_phone) | (CouponUsage.customer_email == customer_email)
        ).count()

        if user_usage_count >= coupon.usage_limit_per_user:
            raise InvalidCouponException(f"Bạn đã sử dụng hết số lần cho phép của mã này ({coupon.usage_limit_per_user} lần/khách hàng).", normalized_code)

        # Kiểm tra đơn hàng tối thiểu
        if subtotal < coupon.min_order_value:
            raise InvalidCouponException(
                f"Đơn hàng cần đạt tối thiểu {coupon.min_order_value:,.0f}đ để áp dụng mã này (hiện tại: {subtotal:,.0f}đ).",
                normalized_code
            )

        # Kiểm tra danh mục áp dụng (nếu có giới hạn)
        if coupon.applicable_category_id and variant_ids:
            matches_category = db.query(ProductVariant).join(Product).filter(
                ProductVariant.id.in_(variant_ids),
                Product.category_id == coupon.applicable_category_id
            ).first()

            if not matches_category:
                raise InvalidCouponException(
                    "Mã giảm giá này chỉ áp dụng cho nhóm sản phẩm chuyên biệt trong danh mục quy định.",
                    normalized_code
                )

        # Tính toán giá trị chiết khấu
        discount_amount = 0.0
        if coupon.discount_type == DiscountType.PERCENTAGE:
            discount_amount = subtotal * (coupon.discount_value / 100.0)
            if coupon.max_discount_amount and discount_amount > coupon.max_discount_amount:
                discount_amount = coupon.max_discount_amount
        elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
            discount_amount = min(subtotal, coupon.discount_value)
        elif coupon.discount_type == DiscountType.FREE_SHIPPING:
            discount_amount = 0.0  # Sẽ được cấn trừ vào shipping_fee

        return coupon, round(discount_amount, 2), "Mã giảm giá hợp lệ"

    def record_coupon_usage(
        self,
        db: Session,
        coupon_id: int,
        order_id: int,
        customer_phone: str,
        customer_email: str,
        discount_applied: float
    ) -> CouponUsage:
        """Ghi nhận lịch sử dùng coupon khi đơn hàng được tạo thành công."""
        coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if coupon:
            coupon.used_count += 1

        usage = CouponUsage(
            coupon_id=coupon_id,
            order_id=order_id,
            customer_phone=customer_phone,
            customer_email=customer_email,
            discount_applied=discount_applied
        )
        db.add(usage)
        db.flush()
        return usage


coupon_service = CouponService()
