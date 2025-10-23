import uuid
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from app.models.product import Product


class CategoryBase(SQLModel):
    name: str
    parent_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="category.id",
        description="ID родительской категории (если это подкатегория)",
    )


class Category(CategoryBase, table=True):
    __tablename__ = "category"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    parent: Optional["Category"] = Relationship(
        back_populates="subcategories",
        sa_relationship_kwargs={"remote_side": "Category.id"},
    )

    subcategories: list["Category"] = Relationship(back_populates="parent")

    products: list["Product"] = Relationship(back_populates="category")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(SQLModel):
    name: str | None = None
    parent_id: uuid.UUID | None = None


class CategoryPublic(CategoryBase):
    id: uuid.UUID


class CategoriesPublic(SQLModel):
    data: list[CategoryPublic]
    count: int
