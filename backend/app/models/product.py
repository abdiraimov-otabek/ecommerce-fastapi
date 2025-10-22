import uuid
from sqlmodel import SQLModel, Field, Relationship


class Product(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=100)
    description: str = Field(max_length=500)
    price: float = Field(default=0.0)
    quantity: int = Field(default=0)
