from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, delete, func
from typing import Any
import uuid

from app.api.deps import SessionDep, CurrentUser, get_current_active_superuser
from app.models import (
    Category,
    CategoryCreate,
    CategoryUpdate,
    CategoryPublic,
    CategoriesPublic,
)

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=CategoriesPublic)
def read_categories(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    count = session.exec(select(func.count()).select_from(Category)).one()
    categories = session.exec(select(Category).offset(skip).limit(limit)).all()
    return CategoriesPublic(data=categories, count=count)


@router.post(
    "/",
    response_model=CategoryPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def create_category(session: SessionDep, category_in: CategoryCreate) -> Any:
    category = Category.model_validate(category_in)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryPublic)
def read_category(category_id: uuid.UUID, session: SessionDep) -> Any:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.patch(
    "/{category_id}",
    response_model=CategoryPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def update_category(
    category_id: uuid.UUID, session: SessionDep, category_in: CategoryUpdate
) -> Any:
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    for key, value in category_in.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)

    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category


@router.delete(
    "/{category_id}",
    response_model=dict,
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_category(category_id: uuid.UUID, session: SessionDep) -> Any:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(category)
    session.commit()
    return {"message": "Category deleted successfully"}
