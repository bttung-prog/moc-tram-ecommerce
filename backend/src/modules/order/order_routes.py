

from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from configs.db_connection import get_db

order_router = APIRouter()
admin_order_router = APIRouter()


class OrderItemInput(BaseModel):
    productId: int = Field(gt=0)
    quantity: int = Field(gt=0, le=100)


class CreateOrderInput(BaseModel):
    items: list[OrderItemInput] = Field(min_length=1)
    shippingFullName: str = Field(min_length=1, max_length=150)
    shippingPhone: str = Field(min_length=1, max_length=20)
    shippingProvince: str = Field(min_length=1)
    shippingWard: str = Field(min_length=1)
    shippingDetail: str = Field(min_length=1)
    paymentMethod: str
    privacyConsent: bool
    customerEmail: str | None = None


@order_router.post("/orders", status_code=201)
def create_order(
    data: CreateOrderInput,
    request: Request,
    db: Session = Depends(get_db),
):
    if not data.privacyConsent:
        raise HTTPException(400, "Bạn phải đồng ý với chính sách bảo mật.")

    payment_method = data.paymentMethod.lower()
    if payment_method not in {"cod", "vietqr", "paypal"}:
        raise HTTPException(400, "Phương thức thanh toán không hợp lệ.")

    user_payload = getattr(request.state, "user", {}) or {}
    user_id = user_payload.get("id") or user_payload.get("user_id") or user_payload.get("sub")

    if not user_id:
        raise HTTPException(401, "Không xác định được tài khoản từ access token.")

    order_code = "MT" + uuid4().hex[:12].upper()
    subtotal = Decimal("0.00")
    item_rows = []

    try:
        for item in data.items:
            product = db.execute(
                text("""
                    SELECT id, name, sku, price
                    FROM products
                    WHERE id = :product_id AND is_active = 1
                    FOR UPDATE
                """),
                {"product_id": item.productId},
            ).mappings().first()

            if not product:
                raise HTTPException(
                    400,
                    f"Sản phẩm ID {item.productId} không tồn tại hoặc đã ngừng bán.",
                )

            unit_price = Decimal(str(product["price"]))
            line_total = unit_price * item.quantity
            subtotal += line_total

            item_rows.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "sku": product["sku"],
                "unit_price": unit_price,
                "quantity": item.quantity,
                "line_total": line_total,
            })

        # Giữ nguyên quy tắc phí ship hiện tại ở mức cơ bản.
        # Cần đồng bộ ngưỡng miễn phí ship với APP_CONFIG của frontend.
        shipping_fee = Decimal("0.00")
        discount = Decimal("0.00")
        total = subtotal + shipping_fee - discount

        address = ", ".join([
            data.shippingDetail.strip(),
            data.shippingWard.strip(),
            data.shippingProvince.strip(),
        ])

        order_result = db.execute(
            text("""
                INSERT INTO orders (
                    order_code, user_id, customer_name, customer_email,
                    customer_phone, shipping_address, subtotal,
                    discount_amount, shipping_fee, total_amount,
                    payment_method, payment_status, order_status
                ) VALUES (
                    :order_code, :user_id, :customer_name, :customer_email,
                    :customer_phone, :shipping_address, :subtotal,
                    :discount, :shipping_fee, :total,
                    :payment_method, 'pending', 'pending'
                )
            """),
            {
                "order_code": order_code,
                "user_id": str(user_id),
                "customer_name": data.shippingFullName.strip(),
                "customer_email": data.customerEmail,
                "customer_phone": data.shippingPhone.strip(),
                "shipping_address": address,
                "subtotal": subtotal,
                "discount": discount,
                "shipping_fee": shipping_fee,
                "total": total,
                "payment_method": payment_method,
            },
        )
        order_id = order_result.lastrowid

        for item in item_rows:
            db.execute(
                text("""
                    INSERT INTO order_items (
                        order_id, product_id, product_name_snapshot,
                        sku_snapshot, unit_price, quantity, line_total
                    ) VALUES (
                        :order_id, :product_id, :product_name,
                        :sku, :unit_price, :quantity, :line_total
                    )
                """),
                {"order_id": order_id, **item},
            )

        db.execute(
            text("""
                INSERT INTO payments (
                    order_id, provider, amount, currency, status
                ) VALUES (
                    :order_id, :provider, :amount, 'VND', 'pending'
                )
            """),
            {
                "order_id": order_id,
                "provider": payment_method,
                "amount": total,
            },
        )

        db.commit()

        return {
            "success": True,
            "message": "Đặt hàng thành công.",
            "data": {
                "id": order_id,
                "orderCode": order_code,
                "subtotal": float(subtotal),
                "shippingFee": float(shipping_fee),
                "discount": float(discount),
                "total": float(total),
                "paymentMethod": payment_method.upper(),
                "status": "PENDING",
            },
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Không thể tạo đơn hàng. Hãy kiểm tra cấu hình database và log backend.",
        )

@admin_order_router.get("/orders")
def get_orders(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    paymentMethod: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    conditions = []
    params = {
        "offset": (page - 1) * limit,
        "limit": limit,
    }

    if search and search.strip():
        conditions.append("""
            (
                order_code LIKE :search
                OR customer_name LIKE :search
                OR customer_phone LIKE :search
                OR customer_email LIKE :search
            )
        """)
        params["search"] = f"%{search.strip()}%"

    if status:
        conditions.append("order_status = :status")
        params["status"] = status.strip().lower()

    if paymentMethod:
        conditions.append("payment_method = :payment_method")
        params["payment_method"] = paymentMethod.strip().lower()

    where_clause = (
        " WHERE " + " AND ".join(conditions)
        if conditions else ""
    )

    total = db.execute(
        text(f"SELECT COUNT(*) FROM orders{where_clause}"),
        params,
    ).scalar_one()

    rows = db.execute(
        text(f"""
            SELECT
                id,
                order_code,
                user_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                subtotal,
                discount_amount,
                shipping_fee,
                total_amount,
                payment_method,
                payment_status,
                order_status,
                created_at,
                updated_at
            FROM orders
            {where_clause}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """),
        params,
    ).mappings().all()

    status_map = {
        "pending": "PENDING",
        "confirmed": "CONFIRMED",
        "processing": "PACKING",
        "packed": "PACKING",
        "shipping": "SHIPPING",
        "delivered": "COMPLETED",
        "cancelled": "CANCELLED",
        "returned": "RETURNED",
    }

    items = []

    for row in rows:
        items.append({
            "id": str(row["id"]),
            "orderCode": row["order_code"],
            "userId": row["user_id"],
            "customerName": row["customer_name"],
            "customerEmail": row["customer_email"],
            "customerPhone": row["customer_phone"],
            "shippingAddress": row["shipping_address"],
            "subtotal": float(row["subtotal"] or 0),
            "discount": float(row["discount_amount"] or 0),
            "shippingFee": float(row["shipping_fee"] or 0),
            "total": float(row["total_amount"] or 0),
            "paymentMethod": str(row["payment_method"]).upper(),
            "paymentStatus": str(row["payment_status"]).upper(),
            "status": status_map.get(
                str(row["order_status"]).lower(),
                str(row["order_status"]).upper(),
            ),
            "createdAt": row["created_at"].isoformat()
                if row["created_at"] else None,
            "updatedAt": row["updated_at"].isoformat()
                if row["updated_at"] else None,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit,
    }


    if search and search.strip():
        conditions.append("""
            (
                order_code LIKE :search
                OR customer_name LIKE :search
                OR customer_phone LIKE :search
            )
        """)
        params["search"] = f"%{search.strip()}%"

    if status:
        conditions.append("order_status = :status")
        params["status"] = status.lower()

    where_clause = (
        " WHERE " + " AND ".join(conditions)
        if conditions else ""
    )

    total = db.execute(
        text(f"SELECT COUNT(*) FROM orders{where_clause}"),
        params,
    ).scalar_one()

    rows = db.execute(
        text(f"""
            SELECT
                id,
                order_code,
                user_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                subtotal,
                discount_amount,
                shipping_fee,
                total_amount,
                payment_method,
                payment_status,
                order_status,
                created_at,
                updated_at
            FROM orders
            {where_clause}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """),
        params,
    ).mappings().all()

    return {
        "items": [dict(row) for row in rows],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit,
    }