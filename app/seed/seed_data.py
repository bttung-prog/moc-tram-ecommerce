import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.product import Category, Product, ProductVariant
from app.models.coupon import Coupon, DiscountType


def seed_database(db: Session):
    """
    Khởi tạo dữ liệu mẫu phong phú, bám sát nghiệp vụ kinh doanh
    Trầm Hương & Dụng Cụ Thiền Định (Tĩnh Tâm Các - Trầm Hương Thiền An).
    """
    # Tạo cấu trúc bảng nếu chưa có
    Base.metadata.create_all(bind=engine)

    # Nếu đã có sản phẩm thì không seed lại
    if db.query(Product).first():
        print("Cơ sở dữ liệu đã có dữ liệu sản phẩm, bỏ qua seeding.")
        return

    print("Đang khởi tạo dữ liệu mẫu Trầm Hương & Dụng Cụ Thiền Định...")

    # 1. DANH MỤC SẢN PHẨM (Categories)
    cat_tram = Category(
        name="Trầm Hương Tự Nhiên & Phong Thủy",
        slug="tram-huong-tu-nhien",
        description="Trầm hương rừng tự nhiên Khánh Hòa, tụ khí linh thiêng đất trời, chiêu tài tích lộc"
    )
    cat_nhang = Category(
        name="Nhang & Nụ Trầm Thiền Định",
        slug="nhang-nu-tram-thien",
        description="Nhang không tăm, nụ trầm xông nhà, nhang vòng thanh lọc không gian, định tâm thiền tọa"
    )
    cat_lu = Category(
        name="Dụng Cụ Xông Đốt & Thác Khói",
        slug="dung-cu-xong-dot-thac-khoi",
        description="Lư đồng nguyên khối, lư gốm tử sa Bát Tràng, thác khói trầm hương tiểu cảnh non bộ"
    )
    cat_chuong = Category(
        name="Chuông Xoay & Pháp Khí Thiền",
        slug="chuong-xoay-phap-khi-thien",
        description="Chuông xoay Singing Bowl 7 kim loại từ dãy Himalaya Nepal, chuông gõ chánh niệm"
    )
    cat_dem = Category(
        name="Bồ Đoàn & Toạ Cụ Ngồi Thiền",
        slug="bo-doan-toa-cu-thien",
        description="Bồ đoàn vỏ đậu xanh 100% organic, toạ cụ chống tê mỏi cột sống khi thiền định"
    )

    db.add_all([cat_tram, cat_nhang, cat_lu, cat_chuong, cat_dem])
    db.flush()

    # 2. SẢN PHẨM & BIẾN THỂ (Products & Variants)
    
    # P1: Vòng tay trầm hương 108 hạt
    p1 = Product(
        category_id=cat_tram.id,
        name="Chuỗi Vòng Tay Trầm Hương Tự Nhiên 108 Hạt Chìm Nước",
        slug="chuoi-vong-tay-tram-huong-108-hat",
        description="108 hạt biểu trưng cho đoạn trừ 108 phiền não, làm từ phôi trầm tự nhiên tích tụ trên 35 năm, hương thơm ngọt sâu vĩnh viễn.",
        origin="Khánh Hòa, Việt Nam",
        fragrance_notes="Ngọt sâu, trầm ấm, thanh tịnh",
        base_price=1850000.0,
        weight_grams=150
    )
    db.add(p1)
    db.flush()

    v1_1 = ProductVariant(
        product_id=p1.id,
        sku="TRAM-108-8MM",
        name="Chuỗi 108 Hạt - Size 8mm (Cỡ nữ / tay thanh)",
        price=1850000.0,
        stock_quantity=30,
        reserved_quantity=0,
        weight_grams=120
    )
    v1_2 = ProductVariant(
        product_id=p1.id,
        sku="TRAM-108-10MM",
        name="Chuỗi 108 Hạt - Size 10mm (Cỡ vừa nam/nữ)",
        price=2450000.0,
        stock_quantity=20,
        reserved_quantity=0,
        weight_grams=150
    )
    v1_3 = ProductVariant(
        product_id=p1.id,
        sku="TRAM-108-12MM",
        name="Chuỗi 108 Hạt - Size 12mm (Cỡ lớn nam tính)",
        price=3200000.0,
        stock_quantity=15,
        reserved_quantity=0,
        weight_grams=180
    )
    db.add_all([v1_1, v1_2, v1_3])

    # P2: Nhang trầm không tăm thượng hạng
    p2 = Product(
        category_id=cat_nhang.id,
        name="Nhang Trầm Hương Không Tăm Thượng Hạng Khánh Hòa",
        slug="nhang-tram-khong-tam-thuong-hang",
        description="100% bột trầm hương nguyên chất trộn keo bời lời tự nhiên, không hóa chất độc hại, ít khói, lưu hương thanh nhẹ dễ chịu trong phòng thiền kín.",
        origin="Vạn Giã, Khánh Hòa",
        fragrance_notes="Hương thảo mộc trầm ấm, thoang thoảng dịu nhẹ",
        base_price=350000.0,
        weight_grams=250
    )
    db.add(p2)
    db.flush()

    v2_1 = ProductVariant(
        product_id=p2.id,
        sku="NHANG-KT-100N",
        name="Ống Gỗ Hương 100 nén (Kèm đế cắm)",
        price=350000.0,
        stock_quantity=80,
        reserved_quantity=0,
        weight_grams=200
    )
    v2_2 = ProductVariant(
        product_id=p2.id,
        sku="NHANG-KT-200N",
        name="Hộp Gỗ Sang Trọng 200 nén (Quà tặng thiền trà)",
        price=650000.0,
        stock_quantity=50,
        reserved_quantity=0,
        weight_grams=350
    )
    db.add_all([v2_1, v2_2])

    # P3: Nụ trầm hương xông nhà phong thủy
    p3 = Product(
        category_id=cat_nhang.id,
        name="Nụ Trầm Hương Thác Khói Ngược Tự Nhiên",
        slug="nu-tram-huong-thac-khoi-nguoc",
        description="Nụ trầm tạo dòng khói chảy ngược như thác nước bồng bềnh, dùng cho bàn trà thiền đạo và tẩy uế không gian sống.",
        origin="Khánh Hòa, Việt Nam",
        fragrance_notes="Đậm đà, thanh lọc không khí, ấm áp",
        base_price=220000.0,
        weight_grams=300
    )
    db.add(p3)
    db.flush()

    v3_1 = ProductVariant(
        product_id=p3.id,
        sku="NU-TRAM-40V",
        name="Hộp 40 viên nụ khói ngược",
        price=220000.0,
        stock_quantity=100,
        reserved_quantity=0,
        weight_grams=250
    )
    v3_2 = ProductVariant(
        product_id=p3.id,
        sku="NU-TRAM-80V",
        name="Hộp Tiết Kiệm 80 viên nụ khói ngược",
        price=390000.0,
        stock_quantity=60,
        reserved_quantity=0,
        weight_grams=450
    )
    db.add_all([v3_1, v3_2])

    # P4: Lư xông trầm bằng đồng hoa sen
    p4 = Product(
        category_id=cat_lu.id,
        name="Lư Xông Trầm Bằng Đồng Hoa Sen Nguyên Khối Chạm Nổi",
        slug="lu-xong-tram-dong-hoa-sen",
        description="Đúc thủ công từ đồng vàng nguyên chất, hoa văn hoa sen thanh tịnh, nắp lư thoát khói uốn lượn huyền ảo.",
        origin="Làng nghề Ý Yên, Nam Định",
        fragrance_notes="Dụng cụ xông đốt an toàn, cách nhiệt cao",
        base_price=480000.0,
        weight_grams=600
    )
    db.add(p4)
    db.flush()

    v4_1 = ProductVariant(
        product_id=p4.id,
        sku="LU-DONG-SEN-CO",
        name="Lư Đồng Hoa Sen - Màu Đồng Cổ Hun Khói",
        price=480000.0,
        stock_quantity=40,
        reserved_quantity=0,
        weight_grams=600
    )
    v4_2 = ProductVariant(
        product_id=p4.id,
        sku="LU-DONG-SEN-VANG",
        name="Lư Đồng Hoa Sen - Màu Đồng Vàng Ánh Kim",
        price=520000.0,
        stock_quantity=30,
        reserved_quantity=0,
        weight_grams=600
    )
    db.add_all([v4_1, v4_2])

    # P5: Chuông xoay Tây Tạng Sing Bowl
    p5 = Product(
        category_id=cat_chuong.id,
        name="Chuông Xoay Tây Tạng Full Moon 7 Kim Loại Thủ Công Nepal",
        slug="chuong-xoay-tay-tang-full-moon-singing-bowl",
        description="Rèn tay thủ công vào đêm trăng tròn tại Kathmandu Nepal từ 7 kim loại thiêng, tần số rung động thanh lọc trường năng lượng và luân xa tim.",
        origin="Kathmandu, Nepal",
        fragrance_notes="Âm ngân vang sâu 432Hz, hỗ trợ thiền định sâu",
        base_price=1650000.0,
        weight_grams=1200
    )
    db.add(p5)
    db.flush()

    v5_1 = ProductVariant(
        product_id=p5.id,
        sku="CHUONG-SING-12CM",
        name="Chuông Sing Bowl Đường Kính 12cm (Kèm chày & đệm gấm)",
        price=1650000.0,
        stock_quantity=25,
        reserved_quantity=0,
        weight_grams=850
    )
    v5_2 = ProductVariant(
        product_id=p5.id,
        sku="CHUONG-SING-16CM",
        name="Chuông Sing Bowl Đường Kính 16cm (Âm vang ngân dài)",
        price=2650000.0,
        stock_quantity=15,
        reserved_quantity=0,
        weight_grams=1400
    )
    db.add_all([v5_1, v5_2])

    # P6: Bồ đoàn ngồi thiền vỏ đậu xanh
    p6 = Product(
        category_id=cat_dem.id,
        name="Bồ Đoàn Ngồi Thiền Vỏ Đậu Xanh 100% Organic Chống Đau Mỏi",
        slug="bo-doan-ngoi-thien-vo-dau-xanh",
        description="Ruột 100% vỏ đậu xanh phơi sấy tự nhiên, tự điều chỉnh theo vóc dáng cơ thể giúp nâng đỡ xương cụt, thẳng cột sống khi tọa thiền nhiều giờ.",
        origin="Việt Nam",
        fragrance_notes="Thoáng khí, mùi vỏ đậu khô thơm tự nhiên",
        base_price=320000.0,
        weight_grams=1600
    )
    db.add(p6)
    db.flush()

    v6_1 = ProductVariant(
        product_id=p6.id,
        sku="BODOAN-NAU",
        name="Bồ Đoàn Tròn - Vải Đũi Màu Nâu Đất Thiền Tịnh (Đường kính 35cm, cao 12cm)",
        price=320000.0,
        stock_quantity=50,
        reserved_quantity=0,
        weight_grams=1600
    )
    v6_2 = ProductVariant(
        product_id=p6.id,
        sku="BODOAN-LAM",
        name="Bồ Đoàn Tròn - Vải Đũi Màu Lam Khói An Nhiên",
        price=320000.0,
        stock_quantity=45,
        reserved_quantity=0,
        weight_grams=1600
    )
    db.add_all([v6_1, v6_2])

    # 3. MÃ KHUYẾN MÃI (Coupons)
    c1 = Coupon(
        code="THIENAN10",
        description="Giảm 10% tối đa 100.000đ cho đơn hàng từ 300.000đ",
        discount_type=DiscountType.PERCENTAGE,
        discount_value=10.0,
        max_discount_amount=100000.0,
        min_order_value=300000.0,
        start_date=datetime.utcnow() - timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=90),
        usage_limit_total=500,
        used_count=0,
        usage_limit_per_user=2,
        is_active=True
    )

    c2 = Coupon(
        code="TRAMVIP500",
        description="Giảm ngay 500.000đ cho đơn hàng Trầm Hương từ 2.000.000đ",
        discount_type=DiscountType.FIXED_AMOUNT,
        discount_value=500000.0,
        max_discount_amount=500000.0,
        min_order_value=2000000.0,
        start_date=datetime.utcnow() - timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=60),
        usage_limit_total=100,
        used_count=0,
        usage_limit_per_user=1,
        applicable_category_id=cat_tram.id,
        is_active=True
    )

    c3 = Coupon(
        code="FREESHIP",
        description="Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ",
        discount_type=DiscountType.FREE_SHIPPING,
        discount_value=0.0,
        min_order_value=500000.0,
        start_date=datetime.utcnow() - timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=180),
        usage_limit_total=1000,
        used_count=0,
        usage_limit_per_user=5,
        is_active=True
    )

    c4 = Coupon(
        code="HOASEN20",
        description="Giảm 20% tối đa 300.000đ dành riêng cho danh mục Chuông Xoay & Pháp Khí Thiền",
        discount_type=DiscountType.PERCENTAGE,
        discount_value=20.0,
        max_discount_amount=300000.0,
        min_order_value=1000000.0,
        start_date=datetime.utcnow() - timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=45),
        usage_limit_total=50,
        used_count=0,
        usage_limit_per_user=1,
        applicable_category_id=cat_chuong.id,
        is_active=True
    )

    db.add_all([c1, c2, c3, c4])

    db.commit()
    print("Khởi tạo dữ liệu mẫu Trầm Hương & Thiền Định thành công!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
