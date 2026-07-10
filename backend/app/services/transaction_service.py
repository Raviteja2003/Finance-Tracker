from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.category import Category, CategoryType
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def _transaction_delta(amount: float, is_income: bool) -> float:
    """Signed effect a transaction has on its account's balance."""
    return amount if is_income else -amount


def _verify_account_ownership(db: Session, account_id: str, user: User) -> Account:
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


def _verify_category(db: Session, category_id: str, is_income: bool, user: User) -> Category:
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == user.id,
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    expected_type = CategoryType.income if is_income else CategoryType.expense
    if category.type != expected_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{category.name}' is an {category.type.value} category and can't be used on "
                   f"a{'n' if is_income else ''} {'income' if is_income else 'expense'} transaction",
        )
    return category


def get_transactions(db: Session, user: User) -> list[Transaction]:
    return (
        db.query(Transaction)
        .join(Account)
        .filter(Account.user_id == user.id)
        .order_by(Transaction.date.desc())
        .all()
    )


def get_transaction(db: Session, transaction_id: str, user: User) -> Transaction:
    transaction = (
        db.query(Transaction)
        .join(Account)
        .filter(Transaction.id == transaction_id, Account.user_id == user.id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction


def create_transaction(db: Session, payload: TransactionCreate, user: User) -> Transaction:
    account = _verify_account_ownership(db, payload.account_id, user)
    _verify_category(db, payload.category_id, payload.is_income, user)

    transaction = Transaction(
        account_id=payload.account_id,
        category_id=payload.category_id,
        amount=payload.amount,
        description=payload.description,
        date=payload.date or datetime.utcnow(),
        is_income=payload.is_income,
    )
    db.add(transaction)
    account.balance += _transaction_delta(payload.amount, payload.is_income)

    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction_id: str, payload: TransactionUpdate, user: User) -> Transaction:
    transaction = get_transaction(db, transaction_id, user)

    old_account = db.query(Account).filter(Account.id == transaction.account_id).first()
    old_account.balance -= _transaction_delta(transaction.amount, transaction.is_income)

    new_account = _verify_account_ownership(db, payload.account_id, user)
    _verify_category(db, payload.category_id, payload.is_income, user)

    new_account.balance += _transaction_delta(payload.amount, payload.is_income)

    transaction.account_id = payload.account_id
    transaction.category_id = payload.category_id
    transaction.amount = payload.amount
    transaction.description = payload.description
    transaction.date = payload.date
    transaction.is_income = payload.is_income

    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction_id: str, user: User) -> None:
    transaction = get_transaction(db, transaction_id, user)

    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if account:
        account.balance -= _transaction_delta(transaction.amount, transaction.is_income)

    db.delete(transaction)
    db.commit()