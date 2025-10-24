from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead


class CRUDProduct(CRUDBase[ProductCreate, ProductUpdate, ProductRead]):
    pass


product = CRUDProduct(Product)
