import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db import Base


class AccountType(str, enum.Enum):
    checking = "checking"
    savings = "savings"
    credit_card = "credit_card"
    cash = "cash"
    salary = "salary"
    fixed_deposit = "fixed_deposit"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(SAEnum(AccountType), nullable=False)
    balance = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Credit card only - all nullable since they're meaningless for other
    # account types. Enforced at the schema layer (see schemas/account.py),
    # not the DB layer, so this stays simple.
    credit_limit = Column(Float, nullable=True)
    billing_cycle_day = Column(Integer, nullable=True)  # day of month, 1-31
    due_date_days_after_billing = Column(Integer, nullable=True)
    is_secured_by_fd = Column(Boolean, nullable=True)

    # Fixed deposit only.
    interest_rate = Column(Float, nullable=True)  # annual %, e.g. 6.5
    maturity_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")