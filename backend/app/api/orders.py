from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.food_item import FoodItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
)
from app.api.deps import get_current_restaurant

public_router = APIRouter(
    prefix="/public/orders",
    tags=["Public Orders"],
)

restaurant_router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@public_router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    # 1. Validate table and restaurant
    result = (
        db.query(Table, Restaurant)
        .join(Restaurant, Table.restaurant_id == Restaurant.id)
        .filter(
            Table.id == order_data.table_id,
            Table.is_active == True,
            Restaurant.is_active == True,
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    table, restaurant = result

    # 2. Validate that the order has items
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # 3. Validate ALL food items first
    validated_items = []

    for item_data in order_data.items:
        food_item = (
            db.query(FoodItem)
            .filter(
                FoodItem.id == item_data.food_item_id,
                FoodItem.category.has(
                    restaurant_id=restaurant.id
                ),
            )
            .first()
        )

        if food_item is None or not food_item.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Food item {item_data.food_item_id} not found",
            )

        if not food_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Food item '{food_item.name}' is currently unavailable",
            )

        validated_items.append((item_data, food_item))

    # 4. Create the order
    try:
        order = Order(
            restaurant_id=restaurant.id,
            table_id=table.id,
            total_price=Decimal("0.00"),
        )

        db.add(order)
        db.flush()

        total_price = Decimal("0.00")

        # 5. Create order items
        for item_data, food_item in validated_items:
            price = food_item.price
            subtotal = price * item_data.quantity

            order_item = OrderItem(
                order_id=order.id,
                food_item_id=food_item.id,
                quantity=item_data.quantity,
                price=price,
                subtotal=subtotal,
                special_instructions=item_data.special_instructions,
            )

            db.add(order_item)

            total_price += subtotal

        # 6. Update total
        order.total_price = total_price

        # 7. Commit everything together
        db.commit()
        db.refresh(order)

    except Exception:
        # Undo everything from this transaction
        db.rollback()
        raise

    return {
        "id": order.id,
        "restaurant_id": order.restaurant_id,
        "table_id": order.table_id,
        "status": order.status.value,
        "total_price": order.total_price,
        "items": order.order_items,
        "created_at": order.created_at,
    }


@public_router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_public_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return {
        "id": order.id,
        "restaurant_id": order.restaurant_id,
        "table_id": order.table_id,
        "status": order.status.value,
        "total_price": order.total_price,
        "items": order.order_items,
        "created_at": order.created_at,
    }


@restaurant_router.get(
    "",
    response_model=list[OrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    orders = (
        db.query(Order)
        .filter(
            Order.restaurant_id == current_restaurant.id
        )
        .order_by(Order.created_at.desc())
        .all()
    )

    return [
        {
            "id": order.id,
            "restaurant_id": order.restaurant_id,
            "table_id": order.table_id,
            "status": order.status.value,
            "total_price": order.total_price,
            "items": order.order_items,
            "created_at": order.created_at,
        }
        for order in orders
    ]


@restaurant_router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return {
        "id": order.id,
        "restaurant_id": order.restaurant_id,
        "table_id": order.table_id,
        "status": order.status.value,
        "total_price": order.total_price,
        "items": order.order_items,
        "created_at": order.created_at,
    }


@restaurant_router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order.status = status_data.status

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "restaurant_id": order.restaurant_id,
        "table_id": order.table_id,
        "status": order.status.value,
        "total_price": order.total_price,
        "items": order.order_items,
        "created_at": order.created_at,
    }