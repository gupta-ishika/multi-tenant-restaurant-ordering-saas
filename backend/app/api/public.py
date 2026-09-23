from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.models.category import Category
from app.models.food_item import FoodItem

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/tables/{table_id}")
def get_public_table(table_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(Table, Restaurant)
        .join(Restaurant, Table.restaurant_id == Restaurant.id)
        .filter(
            Table.id == table_id,
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

    return {
        "table_id": table.id,
        "table_number": table.table_number,
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
    }

@router.get("/menu/{table_id}")
def get_public_menu(
    table_id: int,
    db: Session = Depends(get_db),
):
    result = (
        db.query(Table, Restaurant)
        .join(Restaurant, Table.restaurant_id == Restaurant.id)
        .filter(
            Table.id == table_id,
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

    categories = (
        db.query(Category)
        .filter(
            Category.restaurant_id == restaurant.id,
            Category.is_active == True,
        )
        .all()
    )

    menu = []

    for category in categories:
        food_items = (
            db.query(FoodItem)
            .filter(
                FoodItem.category_id == category.id,
                FoodItem.is_active == True,
            )
            .order_by(FoodItem.display_order, FoodItem.id)
            .all()
        )

        menu.append({
            "category_id": category.id,
            "category_name": category.name,
            "food_items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "is_veg": item.is_veg,
                    "is_available": item.is_available,
                }
                for item in food_items
            ],
        })

    return {
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
        "table_id": table.id,
        "table_number": table.table_number,
        "categories": menu,
    }