import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.models.message import (
    Message,
)  # same model used for "Item deleted successfully"

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=dict)
def read_products(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve products.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Product)
        count = session.exec(count_statement).one()
        statement = select(Product).offset(skip).limit(limit)
        products = session.exec(statement).all()
    else:
        # if products had an owner_id, you’d filter here
        count_statement = select(func.count()).select_from(Product)
        count = session.exec(count_statement).one()
        statement = select(Product).offset(skip).limit(limit)
        products = session.exec(statement).all()

    return {"data": products, "count": count}


@router.get("/{id}", response_model=ProductRead)
def read_product(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get product by ID.
    """
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductRead)
def create_product(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    product_in: ProductCreate,
) -> Any:
    """
    Create new product.
    """
    db_product = Product.model_validate(product_in)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@router.put("/{id}", response_model=ProductRead)
def update_product(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    product_in: ProductUpdate,
) -> Any:
    """
    Update a product.
    """
    db_product = session.get(Product, id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_dict = product_in.model_dump(exclude_unset=True)
    db_product.sqlmodel_update(update_dict)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@router.delete("/{id}", response_model=Message)
def delete_product(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a product.
    """
    db_product = session.get(Product, id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(db_product)
    session.commit()
    return Message(message="Product deleted successfully")
