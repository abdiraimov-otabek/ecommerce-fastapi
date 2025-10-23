import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Product(SQLModel, table=True):
    __tablename__ = "product"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(max_length=150, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    sku: str = Field(unique=True, index=True, max_length=50)
    price: Decimal = Field(default=Decimal("0.00"))
    quantity: int = Field(default=0)
    in_stock: bool = Field(default=True)
    image_url: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)

    category_id: uuid.UUID = Field(foreign_key="category.id")
    category: "Category" = Relationship(back_populates="products")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # optional relationships for future
    # order_items: List["OrderItem"] = Relationship(back_populates="product")
    # reviews: List["Review"] = Relationship(back_populates="product")
