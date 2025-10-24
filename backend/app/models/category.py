import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

from backend.app.models import Product


class CategoryBase(SQLModel):
    name: str

class Category(CategoryBase, table=True):
    __tablename__ = "category"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    subcategories: List["SubCategory"] = Relationship(back_populates="category")


class SubCategoryBase(SQLModel):
    name: str

class SubCategory(SubCategoryBase, table=True):
    __tablename__ = "subcategory"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    category_id: uuid.UUID = Field(foreign_key="category.id")
    category: Optional[Category] = Relationship(back_populates="subcategories")
    products: list["Product"] = Relationship(back_populates="subcategory")


# Schemas for API
class CategoryCreate(CategoryBase): pass
class SubCategoryCreate(SubCategoryBase): pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None

class SubCategoryUpdate(SQLModel):
    name: Optional[str] = None
    category_id: Optional[uuid.UUID] = None

class CategoryPublic(CategoryBase):
    id: uuid.UUID
    subcategories: List["SubCategoryPublic"] = []

class SubCategoryPublic(SubCategoryBase):
    id: uuid.UUID
    category_id: uuid.UUID

class CategoriesPublic(SQLModel):
    data: List[CategoryPublic]
    count: int
