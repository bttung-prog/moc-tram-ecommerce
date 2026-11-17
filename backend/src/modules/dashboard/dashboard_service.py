from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal

from typing import Any

from constants.order_statuses import ORDER_STATUSES
from modules.dashboard import dashboard_repository


def get_overview(db: Any, days: int = 30) -> dict:
    end_date = datetime.now(UTC).date()
    start_date = end_date - timedelta(days=days - 1)
    start_at = datetime.combine(start_date, time.min, tzinfo=UTC)
    end_at = datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=UTC)

    summary = dashboard_repository.get_summary(db, start_at, end_at)
    revenue_by_date = {
        value.isoformat() if isinstance(value, (date, datetime)) else str(value): amount
        for value, amount in dashboard_repository.get_revenue_by_day(
            db, start_at, end_at
        )
    }
    revenue_by_day = [
        {
            "date": (start_date + timedelta(days=offset)).isoformat(),
            "revenue": revenue_by_date.get(
                (start_date + timedelta(days=offset)).isoformat(),
                Decimal("0.00"),
            ),
        }
        for offset in range(days)
    ]

    status_counts = dashboard_repository.get_order_status_counts(db)
    orders_by_status = [
        {
            "status": status.value,
            "count": status_counts.get(status.value, 0),
        }
        for status in ORDER_STATUSES
    ]
    recent_orders = [
        {
            "id": order.id,
            "order_number": order.order_number,
            "recipient_name": order.recipient_name,
            "total_amount": order.total_amount,
            "status": order.status.value,
            "created_at": order.created_at,
        }
        for order in dashboard_repository.get_recent_orders(db)
    ]

    return {
        "period": {
            "days": days,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        },
        "summary": summary,
        "revenue_by_day": revenue_by_day,
        "orders_by_status": orders_by_status,
        "recent_orders": recent_orders,
        "top_products": dashboard_repository.get_top_products(db, start_at, end_at),
    }
