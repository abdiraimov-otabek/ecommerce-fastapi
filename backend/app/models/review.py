import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from backend.app.models import User, Product


class ReviewBase(SQLModel):
    full_name: str = Field(max_length=150, index=True)
    description: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5, description="Оценка от 1 до 5")


class Review(ReviewBase, table=True):
    __tablename__ = "review"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    product_id: Optional[uuid.UUID] = Field(default=None, foreign_key="product.id")
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    product: Optional["Product"] = Relationship(back_populates="reviews")
    user: Optional["User"] = Relationship(back_populates="reviews")


# ✅ Схемы для API (Create/Update/Public)
class ReviewCreate(ReviewBase):
    product_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None


class ReviewUpdate(SQLModel):
    full_name: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class ReviewPublic(ReviewBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ReviewsPublic(SQLModel):
    data: list[ReviewPublic]
    count: int
