from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from modules.issue.issue import Issue


def create(db: Session, issue_data: dict) -> Issue:
    new_issue = Issue(**issue_data)

    db.add(new_issue)
    db.flush()
    db.refresh(new_issue)

    return new_issue


def find_by_id(db: Session, issue_id: UUID) -> Issue | None:
    return db.get(Issue, issue_id)


def find_by_order_id(db: Session, order_id: UUID) -> list[Issue]:
    query = (
        select(Issue).where(Issue.order_id == order_id).order_by(desc(Issue.created_at))
    )
    return list(db.scalars(query).all())


def find_by_product_id(
    db: Session,
    product_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Issue]:
    query = (
        select(Issue)
        .where(Issue.product_id == product_id)
        .order_by(desc(Issue.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def find_by_warehouse_id(
    db: Session,
    warehouse_id: UUID,
    skip: int = 0,
    limit: int = 10,
) -> list[Issue]:
    query = (
        select(Issue)
        .where(Issue.warehouse_id == warehouse_id)
        .order_by(desc(Issue.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(query).all())


def find_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Issue]:
    query = select(Issue)

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(Issue.note.ilike(search_term))

    query = query.order_by(desc(Issue.created_at)).offset(skip).limit(limit)

    return list(db.scalars(query).all())


def count_all(
    db: Session,
    filter: dict | None = None,
    search: str | None = None,
) -> int:
    query = select(func.count(Issue.id)).select_from(Issue)

    if filter:
        query = query.filter_by(**filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(Issue.note.ilike(search_term))

    return db.scalar(query) or 0


def update_by_id(
    db: Session,
    issue_id: UUID,
    issue_data: dict,
) -> Issue | None:
    issue = find_by_id(db, issue_id)

    if not issue:
        return None

    for k, v in issue_data.items():
        setattr(issue, k, v)

    db.flush()
    db.refresh(issue)

    return issue
