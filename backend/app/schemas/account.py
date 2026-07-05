from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.account import AccountType


def _validate_type_specific_fields(account_type: AccountType, values: dict):
    credit_fields = ("credit_limit", "billing_cycle_day", "due_date_days_after_billing", "is_secured_by_fd")
    fd_fields = ("interest_rate", "maturity_date")

    if account_type != AccountType.credit_card and any(values.get(f) is not None for f in credit_fields):
        raise ValueError("credit_limit, billing_cycle_day, due_date_days_after_billing, and is_secured_by_fd can only be set when type is 'credit_card'")

    if account_type != AccountType.fixed_deposit and any(values.get(f) is not None for f in fd_fields):
        raise ValueError("interest_rate and maturity_date can only be set when type is 'fixed_deposit'")


class AccountCreate(BaseModel):
    name: str
    type: AccountType
    balance: float = 0.0

    # Credit card only
    credit_limit: float | None = None
    billing_cycle_day: int | None = Field(default=None, ge=1, le=31)
    due_date_days_after_billing: int | None = None
    is_secured_by_fd: bool | None = None

    # Fixed deposit only
    interest_rate: float | None = None
    maturity_date: datetime | None = None

    @model_validator(mode="after")
    def _check_type_specific_fields(self):
        _validate_type_specific_fields(self.type, self.__dict__)
        return self


class AccountUpdate(BaseModel):
    name: str
    type: AccountType
    balance: float

    credit_limit: float | None = None
    billing_cycle_day: int | None = Field(default=None, ge=1, le=31)
    due_date_days_after_billing: int | None = None
    is_secured_by_fd: bool | None = None

    interest_rate: float | None = None
    maturity_date: datetime | None = None

    @model_validator(mode="after")
    def _check_type_specific_fields(self):
        _validate_type_specific_fields(self.type, self.__dict__)
        return self


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    type: AccountType
    balance: float
    created_at: datetime

    credit_limit: float | None = None
    billing_cycle_day: int | None = None
    due_date_days_after_billing: int | None = None
    is_secured_by_fd: bool | None = None

    interest_rate: float | None = None
    maturity_date: datetime | None = None