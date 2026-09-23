from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class FoodItemCreate(BaseModel):
    category_id: int
    name: str
    description: str | None = None
    price: Decimal
    image_url: str | None = None
    is_available: bool = True
    is_veg: bool = True
    display_order: int = 0


class FoodItemUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    image_url: str | None = None
    is_available: bool | None = None
    is_veg: bool | None = None
    is_active: bool | None = None
    display_order: int | None = None


class FoodItemResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    is_available: bool
    is_veg: bool
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }