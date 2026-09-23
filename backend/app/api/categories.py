from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_restaurant
from app.database.database import get_db
from app.models.category import Category
from app.models.restaurant import Restaurant
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category_data: CategoryCreate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    existing_category = (
        db.query(Category)
        .filter(
            Category.restaurant_id == current_restaurant.id,
            Category.name == category_data.name,
        )
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists",
        )

    new_category = Category(
        restaurant_id=current_restaurant.id,
        name=category_data.name,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.get(
    "",
    response_model=list[CategoryResponse],
)
def get_categories(
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    categories = (
        db.query(Category)
        .filter(Category.restaurant_id == current_restaurant.id)
        .all()
    )

    return categories

@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def get_category(
    category_id: int,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    category = (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: int,
    category_data: CategoryCreate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    category = (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    existing_category = (
        db.query(Category)
        .filter(
            Category.restaurant_id == current_restaurant.id,
            Category.name == category_data.name,
            Category.id != category_id,
        )
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists",
        )

    category.name = category_data.name

    db.commit()
    db.refresh(category)

    return category

@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category(
    category_id: int,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    category = (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    category.is_active = False

    db.commit()


@router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
)
def patch_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    category = (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if category_data.name is not None:
        category.name = category_data.name
    if category_data.is_active is not None:
        category.is_active = category_data.is_active

    db.commit()
    db.refresh(category)

    return category