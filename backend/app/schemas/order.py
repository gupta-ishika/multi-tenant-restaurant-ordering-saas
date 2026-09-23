from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.enums.order_status import OrderStatus


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemCreate(BaseModel):
    food_item_id: int
    quantity: int = Field(gt=0)
    special_instructions: str | None = None


class OrderCreate(BaseModel):
    table_id: int
    items: list[OrderItemCreate]


class FoodItemSummary(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }


class OrderItemResponse(BaseModel):
    id: int
    food_item_id: int
    quantity: int
    price: Decimal
    subtotal: Decimal
    special_instructions: str | None
    food_item: FoodItemSummary | None = None

    model_config = {
        "from_attributes": True
    }


class OrderResponse(BaseModel):
    id: int
    restaurant_id: int
    table_id: int
    status: str
    total_price: Decimal
    items: list[OrderItemResponse]
    created_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }