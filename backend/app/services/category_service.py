from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session, user: User) -> list[Category]:
    return db.query(Category).filter(Category.user_id == user.id).all()


def get_category(db: Session, category_id: str, user: User) -> Category:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == user.id,
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def create_category(db: Session, payload: CategoryCreate, user: User) -> Category:
    category = Category(
        user_id=user.id,
        name=payload.name,
        type=payload.type,
        color=payload.color,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: str, payload: CategoryUpdate, user: User) -> Category:
    category = get_category(db, category_id, user)
    category.name = payload.name
    category.type = payload.type
    category.color = payload.color
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: str, user: User) -> None:
    category = get_category(db, category_id, user)

    # Same reasoning as account deletion: block instead of silently
    # cascading, so the user has to consciously reassign or delete the
    # transactions/budgets that depend on this category first.
    has_transactions = db.query(Transaction).filter(Transaction.category_id == category.id).first() is not None
    if has_transactions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that still has transactions. Reassign or delete them first.",
        )

    has_budgets = db.query(Budget).filter(Budget.category_id == category.id).first() is not None
    if has_budgets:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that has budgets set. Delete those budgets first.",
        )

    db.delete(category)
    db.commit()