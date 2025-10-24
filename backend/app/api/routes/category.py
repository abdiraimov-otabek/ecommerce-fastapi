from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
import uuid
from typing import Any

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Category, CategoryCreate, CategoryUpdate, CategoryPublic, CategoriesPublic,
    SubCategory, SubCategoryCreate, SubCategoryUpdate, SubCategoryPublic
)

router = APIRouter(prefix="/categories", tags=["categories"])


# ✅ CRUD категории (осталось без изменений)
@router.get("/", response_model=CategoriesPublic)
def read_categories(session: SessionDep, skip: int = 0, limit: int = 100):
    count = session.exec(select(func.count()).select_from(Category)).one()
    categories = session.exec(select(Category).offset(skip).limit(limit)).all()
    return CategoriesPublic(data=categories, count=count)

@router.post("/", response_model=CategoryPublic, dependencies=[Depends(get_current_active_superuser)])
def create_category(session: SessionDep, category_in: CategoryCreate):
    category = Category.model_validate(category_in)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.get("/{category_id}", response_model=CategoryPublic)
def read_category(category_id: uuid.UUID, session: SessionDep):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# ✅ Работа с ПОДКАТЕГОРИЯМИ внутри /categories

@router.post("/{category_id}/subcategories", response_model=SubCategoryPublic,
             dependencies=[Depends(get_current_active_superuser)])
def create_subcategory(category_id: uuid.UUID, session: SessionDep, subcategory_in: SubCategoryCreate):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    subcategory = SubCategory(name=subcategory_in.name, category_id=category_id)
    session.add(subcategory)
    session.commit()
    session.refresh(subcategory)
    return subcategory


@router.get("/{category_id}/subcategories", response_model=list[SubCategoryPublic])
def read_subcategories(category_id: uuid.UUID, session: SessionDep):
    subcategories = session.exec(select(SubCategory).where(SubCategory.category_id == category_id)).all()
    return subcategories


@router.patch("/sub/{sub_id}", response_model=SubCategoryPublic,
              dependencies=[Depends(get_current_active_superuser)])
def update_subcategory(sub_id: uuid.UUID, session: SessionDep, sub_in: SubCategoryUpdate):
    subcategory = session.get(SubCategory, sub_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="SubCategory not found")

    for key, value in sub_in.model_dump(exclude_unset=True).items():
        setattr(subcategory, key, value)

    session.add(subcategory)
    session.commit()
    session.refresh(subcategory)
    return subcategory


@router.delete("/sub/{sub_id}", response_model=dict,
               dependencies=[Depends(get_current_active_superuser)])
def delete_subcategory(sub_id: uuid.UUID, session: SessionDep):
    subcategory = session.get(SubCategory, sub_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="SubCategory not found")
    session.delete(subcategory)
    session.commit()
    return {"message": "SubCategory deleted successfully"}
