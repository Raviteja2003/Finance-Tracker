from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BudgetBase(BaseModel):
    category_id: Optional[int] = None
    amount: float = Field(gt=0)
    year: int
    month: int = Field(ge=1, le=12)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount: float = Field(gt=0)


class BudgetResponse(BudgetBase):
    id: int
    spent: float
    remaining: float
    percentage_used: float
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CopyPreviousMonthRequest(BaseModel):
    year: int
    month: int = Field(ge=1, le=12)