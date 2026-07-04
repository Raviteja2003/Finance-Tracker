from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
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
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, account_id: str, user: User) -> None:
    account = get_account(db, account_id, user)
    db.delete(account)
    db.commit()