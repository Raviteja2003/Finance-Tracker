from pydantic import BaseModel, ConfigDict, Field

from app.models.category import CategoryType


class CategoryCreate(BaseModel):
    name: str
    type: CategoryType
    color: str | None = Field(default=None, description="Hex color, e.g. #4f46e5")


class CategoryUpdate(BaseModel):
    name: str
    type: CategoryType
    color: str | None = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    type: CategoryType
    color: str | None = None