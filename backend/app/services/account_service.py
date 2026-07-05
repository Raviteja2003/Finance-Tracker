from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.account import AccountCreate, AccountUpdate


def get_accounts(db: Session, user: User) -> list[Account]:
    return db.query(Account).filter(Account.user_id == user.id).all()


def get_account(db: Session, account_id: str, user: User) -> Account:
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user.id,
    ).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


def create_account(db: Session, payload: AccountCreate, user: User) -> Account:
    account = Account(
        user_id=user.id,
        name=payload.name,
        type=payload.type,
        balance=payload.balance,
        credit_limit=payload.credit_limit,
        billing_cycle_day=payload.billing_cycle_day,
        due_date_days_after_billing=payload.due_date_days_after_billing,
        is_secured_by_fd=payload.is_secured_by_fd,
        interest_rate=payload.interest_rate,
        maturity_date=payload.maturity_date,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def update_account(db: Session, account_id: str, payload: AccountUpdate, user: User) -> Account:
    account = get_account(db, account_id, user)
    account.name = payload.name
    account.type = payload.type
    account.balance = payload.balance
    account.credit_limit = payload.credit_limit
    account.billing_cycle_day = payload.billing_cycle_day
    account.due_date_days_after_billing = payload.due_date_days_after_billing
    account.is_secured_by_fd = payload.is_secured_by_fd
    account.interest_rate = payload.interest_rate
    account.maturity_date = payload.maturity_date
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, account_id: str, user: User) -> None:
    account = get_account(db, account_id, user)

    # The ORM relationship has cascade="all, delete-orphan", which would
    # otherwise silently wipe every transaction on this account the moment
    # it's deleted. That's the wrong default for a finance tracker - block
    # instead, and make the user deal with the transactions first.
    has_transactions = db.query(Transaction).filter(Transaction.account_id == account.id).first() is not None
    if has_transactions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete an account that still has transactions. Delete or reassign them first.",
        )

    db.delete(account)
    db.commit()