import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum, Numeric
from app.db import Base



class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=False),ForeignKey("categories.id"),nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)  # 1-12

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

    __table_args__ = (
        Index(
            "uq_budget_category_month", "user_id", "category_id", "year", "month",
            unique=True, postgresql_where=category_id.isnot(None),
        ),
        Index(
            "uq_budget_overall_month", "user_id", "year", "month",
            unique=True, postgresql_where=category_id.is_(None),
        ),
    )