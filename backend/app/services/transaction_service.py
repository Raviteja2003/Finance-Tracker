from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
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
    # Confirms the account_id in the payload actually belongs to this user
    # before attaching a transaction to it - without this, any authenticated
    # user could write transactions onto someone else's account by guessing
    # an account_id.
    account = _verify_account_ownership(db, payload.account_id, user)

    transaction = Transaction(
        account_id=payload.account_id,
        category_id=payload.category_id,
        amount=payload.amount,
        description=payload.description,
        date=payload.date or datetime.utcnow(),
        is_income=payload.is_income,
    )
    db.add(transaction)

    # Running balance: applied in the same DB transaction as the insert,
    # so the account and its transactions can't drift out of sync even if
    # something fails partway through (db.commit() below covers both).
    account.balance += _transaction_delta(payload.amount, payload.is_income)

    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction_id: str, payload: TransactionUpdate, user: User) -> Transaction:
    transaction = get_transaction(db, transaction_id, user)

    # Reverse this transaction's old effect on its current account BEFORE
    # touching anything else - uses the transaction's pre-update amount/
    # is_income, not the payload's.
    old_account = db.query(Account).filter(Account.id == transaction.account_id).first()
    old_account.balance -= _transaction_delta(transaction.amount, transaction.is_income)

    # Verify + fetch the target account (may be the same account, or a
    # different one the user is moving this transaction to).
    new_account = _verify_account_ownership(db, payload.account_id, user)

    # Apply the new effect. If new_account is the same row as old_account,
    # SQLAlchemy's identity map means this is the same Python object, so
    # the net result is old_account.balance - old_delta + new_delta, which
    # is exactly right whether or not the account changed.
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