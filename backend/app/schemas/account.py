from pydantic import BaseModel, ConfigDict
from app.models.account import AccountType
from datetime import datetime


class AccountCreate(BaseModel):
    name: str
    type: AccountType
    balance: float = 0.0


class AccountUpdate(BaseModel):
    name: str
    type: AccountType
    balance: float


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    type: AccountType
    balance: float
    created_at: datetime