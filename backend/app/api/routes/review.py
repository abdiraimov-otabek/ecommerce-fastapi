from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from typing import Any
import uuid

from backend.app.api.deps import SessionDep, get_current_active_user, get_current_active_superuser
from backend.app.models import (
    Review, ReviewCreate, ReviewUpdate,
    ReviewPublic, ReviewsPublic, Product, User
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


# ✅ Получить все отзывы (с пагинацией)
@router.get("/", response_model=ReviewsPublic)
def read_reviews(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    product_id: uuid.UUID | None = None
) -> Any:
    query = select(Review)
    if product_id:
        query = query.where(Review.product_id == product_id)

    count = session.exec(select(func.count()).select_from(query.subquery())).one()
    reviews = session.exec(query.offset(skip).limit(limit)).all()

    return ReviewsPublic(data=reviews, count=count)


# ✅ Получить один отзыв
@router.get("/{review_id}", response_model=ReviewPublic)
def read_review(review_id: uuid.UUID, session: SessionDep) -> Any:
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


# ✅ Создать отзыв (может обычный пользователь)
@router.post("/", response_model=ReviewPublic)
def create_review(
    review_in: ReviewCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # Проверка продукта
    product = session.get(Product, review_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = Review(
        full_name=review_in.full_name,
        description=review_in.description,
        rating=review_in.rating,
        product_id=review_in.product_id,
        user_id=current_user.id
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


# ✅ Обновить отзыв (только автор или админ)
@router.patch("/{review_id}", response_model=ReviewPublic)
def update_review(
    review_id: uuid.UUID,
    review_in: ReviewUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Разрешаем редактировать только автору или администратору
    if review.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = review_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)

    session.add(review)
    session.commit()
    session.refresh(review)
    return review


# ✅ Удалить отзыв (только автор или админ)
@router.delete("/{review_id}", response_model=dict)
def delete_review(
    review_id: uuid.UUID,
    session: SessionDep,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(review)
    session.commit()
    return {"message": "Review deleted successfully"}
