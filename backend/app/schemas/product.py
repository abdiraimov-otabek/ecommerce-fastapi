import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


# Shared fields between all schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    price: Decimal
    quantity: int
    in_stock: bool = True
    image_url: Optional[str] = None
    is_active: bool = True
    category_id: Optional[uuid.UUID] = None


# Schema for creating a product
class ProductCreate(ProductBase):
    name: str
    price: Decimal
    sku: str
    category_id: uuid.UUID


# Schema for updating a product
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = None
    in_stock: Optional[bool] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None


# Schema for reading data (response)
class ProductRead(ProductBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
