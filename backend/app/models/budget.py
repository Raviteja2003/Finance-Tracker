import uuid

from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=False), ForeignKey("categories.id"), nullable=False)
    month = Column(String, nullable=False)  # "YYYY-MM"
    limit_amount = Column(Float, nullable=False)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")