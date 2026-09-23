from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_restaurant
from app.database.database import get_db
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant
from app.schemas.food_item import (
    FoodItemCreate,
    FoodItemResponse,
    FoodItemUpdate,
)

router = APIRouter(
    prefix="/food-items",
    tags=["Food Items"],
)


@router.post(
    "",
    response_model=FoodItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_food_item(
    food_item_data: FoodItemCreate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    category = (
        db.query(Category)
        .filter(
            Category.id == food_item_data.category_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    new_food_item = FoodItem(
        category_id=food_item_data.category_id,
        name=food_item_data.name,
        description=food_item_data.description,
        price=food_item_data.price,
        image_url=food_item_data.image_url,
        is_available=food_item_data.is_available,
        is_veg=food_item_data.is_veg,
        display_order=food_item_data.display_order,
    )

    db.add(new_food_item)
    db.commit()
    db.refresh(new_food_item)

    return new_food_item

@router.get(
    "",
    response_model=list[FoodItemResponse],
)
def get_food_items(
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    food_items = (
        db.query(FoodItem)
        .join(Category, FoodItem.category_id == Category.id)
        .filter(Category.restaurant_id == current_restaurant.id)
        .all()
    )

    return food_items

@router.get(
    "/{food_item_id}",
    response_model=FoodItemResponse,
)
def get_food_item(
    food_item_id: int,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    food_item = (
        db.query(FoodItem)
        .join(Category, FoodItem.category_id == Category.id)
        .filter(
            FoodItem.id == food_item_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if food_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    return food_item

@router.put(
    "/{food_item_id}",
    response_model=FoodItemResponse,
)
def update_food_item(
    food_item_id: int,
    food_item_data: FoodItemCreate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    food_item = (
        db.query(FoodItem)
        .join(Category, FoodItem.category_id == Category.id)
        .filter(
            FoodItem.id == food_item_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if food_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    category = (
        db.query(Category)
        .filter(
            Category.id == food_item_data.category_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    food_item.category_id = food_item_data.category_id
    food_item.name = food_item_data.name
    food_item.description = food_item_data.description
    food_item.price = food_item_data.price
    food_item.image_url = food_item_data.image_url
    food_item.is_available = food_item_data.is_available
    food_item.is_veg = food_item_data.is_veg
    food_item.display_order = food_item_data.display_order

    db.commit()
    db.refresh(food_item)

    return food_item

@router.delete(
    "/{food_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_food_item(
    food_item_id: int,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    food_item = (
        db.query(FoodItem)
        .join(Category, FoodItem.category_id == Category.id)
        .filter(
            FoodItem.id == food_item_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if food_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    food_item.is_active = False

    db.commit()


@router.patch(
    "/{food_item_id}",
    response_model=FoodItemResponse,
)
def patch_food_item(
    food_item_id: int,
    food_item_data: FoodItemUpdate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    food_item = (
        db.query(FoodItem)
        .join(Category, FoodItem.category_id == Category.id)
        .filter(
            FoodItem.id == food_item_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if food_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food item not found",
        )

    if food_item_data.category_id is not None:
        category = (
            db.query(Category)
            .filter(
                Category.id == food_item_data.category_id,
                Category.restaurant_id == current_restaurant.id,
            )
            .first()
        )
        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )
        food_item.category_id = food_item_data.category_id

    if food_item_data.name is not None:
        food_item.name = food_item_data.name
    if food_item_data.description is not None:
        food_item.description = food_item_data.description
    if food_item_data.price is not None:
        food_item.price = food_item_data.price
    if food_item_data.image_url is not None:
        food_item.image_url = food_item_data.image_url
    if food_item_data.is_available is not None:
        food_item.is_available = food_item_data.is_available
    if food_item_data.is_veg is not None:
        food_item.is_veg = food_item_data.is_veg
    if food_item_data.is_active is not None:
        food_item.is_active = food_item_data.is_active
    if food_item_data.display_order is not None:
        food_item.display_order = food_item_data.display_order

    db.commit()
    db.refresh(food_item)

    return food_item