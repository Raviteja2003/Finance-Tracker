from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from fastapi import HTTPException, status

from app.models import Budget, Category, Transaction, CategoryType
from app.schemas.budget import BudgetCreate, BudgetUpdate


def _calculate_spent(db: Session, user_id: str, category_id: int | None, year: int, month: int) -> float:
    query = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        extract("year", Transaction.date) == year,
        extract("month", Transaction.date) == month,
    )
    if category_id is not None:
        query = query.filter(Transaction.category_id == category_id)
    else:
        # Overall budget: only expense transactions count against a spending limit
        query = query.join(Category, Transaction.category_id == Category.id).filter(
            Category.type == CategoryType.EXPENSE
        )
    total = query.scalar()
    return float(total or 0)


def _to_response(db: Session, budget: Budget) -> dict:
    spent = _calculate_spent(db, budget.user_id, budget.category_id, budget.year, budget.month)
    amount = float(budget.amount)
    remaining = amount - spent
    percentage_used = round((spent / amount) * 100, 1) if amount > 0 else 0.0

    return {
        "id": budget.id,
        "category_id": budget.category_id,
        "amount": amount,
        "year": budget.year,
        "month": budget.month,
        "spent": spent,
        "remaining": remaining,
        "percentage_used": percentage_used,
        "category_name": budget.category.name if budget.category else None,
        "category_color": budget.category.color if budget.category else None,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
    }


def get_budgets_for_month(db: Session, user_id: str, year: int, month: int) -> list[dict]:
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.year == year, Budget.month == month)
        .all()
    )
    return [_to_response(db, b) for b in budgets]


def create_budget(db: Session, user_id: str, payload: BudgetCreate) -> dict:
    if payload.category_id is not None:
        category = (
            db.query(Category)
            .filter(Category.id == payload.category_id, Category.user_id == user_id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        if category.type != CategoryType.EXPENSE:
            raise HTTPException(
                status_code=400,
                detail="Budgets can only be set on expense categories",
            )

    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.category_id == payload.category_id,
            Budget.year == payload.year,
            Budget.month == payload.month,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A budget already exists for this scope and month",
        )

    budget = Budget(user_id=user_id, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return _to_response(db, budget)


def update_budget(db: Session, user_id: str, budget_id: int, payload: BudgetUpdate) -> dict:
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.amount = payload.amount
    db.commit()
    db.refresh(budget)
    return _to_response(db, budget)


def delete_budget(db: Session, user_id: str, budget_id: int) -> None:
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()


def copy_previous_month(db: Session, user_id: str, target_year: int, target_month: int) -> list[dict]:
    prev_month = target_month - 1
    prev_year = target_year
    if prev_month == 0:
        prev_month = 12
        prev_year -= 1

    prev_budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.year == prev_year, Budget.month == prev_month)
        .all()
    )

    existing_scopes = {
        b.category_id
        for b in db.query(Budget).filter(
            Budget.user_id == user_id, Budget.year == target_year, Budget.month == target_month
        )
    }

    created = []
    for pb in prev_budgets:
        if pb.category_id in existing_scopes:
            continue  # don't overwrite what's already set for the target month
        new_budget = Budget(
            user_id=user_id,
            category_id=pb.category_id,
            amount=pb.amount,
            year=target_year,
            month=target_month,
        )
        db.add(new_budget)
        created.append(new_budget)

    db.commit()
    for b in created:
        db.refresh(b)
    return [_to_response(db, b) for b in created]