import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class CategoryBase(SQLModel):
    name: str
    parent_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="category.id",
        description="ID родительской категории (если это подкатегория)"
    )


class Category(CategoryBase, table=True):
    __tablename__ = "category"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    parent: Optional["Category"] = Relationship(
        back_populates="subcategories",
        sa_relationship_kwargs={"remote_side": "Category.id"}
    )

    subcategories: List["Category"] = Relationship(back_populates="parent")


class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None


class CategoryPublic(CategoryBase):
    id: uuid.UUID

class CategoriesPublic(SQLModel):
    data: List[CategoryPublic]
    count: int
