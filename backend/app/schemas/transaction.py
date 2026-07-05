from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TransactionCreate(BaseModel):
    account_id: str
    category_id: str | None = None
    amount: float
    description: str | None = None
    date: datetime | None = None  # defaults to now if omitted
    is_income: bool = False


class TransactionUpdate(BaseModel):
    account_id: str
    category_id: str | None = None
    amount: float
    description: str | None = None
    date: datetime
    is_income: bool = False


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    account_id: str
    category_id: str | None
    amount: float
    description: str | None
    date: datetime
    is_income: bool
    created_at: datetime