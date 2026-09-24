from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_restaurant
from app.database.database import get_db
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.schemas.table import (
    TableCreate,
    TableResponse,
    TableStatusUpdate,
    TableUpdate,
)

router = APIRouter(
    prefix="/tables",
    tags=["Tables"],
)


@router.post(
    "",
    response_model=TableResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_table(
    table_data: TableCreate,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    existing_table = (
        db.query(Table)
        .filter(
            Table.restaurant_id == current_restaurant.id,
            Table.table_number == table_data.table_number,
        )
        .first()
    )

    if existing_table:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Table number already exists",
        )

    table = Table(
        restaurant_id=current_restaurant.id,
        table_number=table_data.table_number,
        qr_code_url="",
        is_active=True,
    )

    db.add(table)
    db.commit()
    db.refresh(table)

    return table


@router.get(
    "",
    response_model=list[TableResponse],
)
def get_tables(
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    tables = (
        db.query(Table)
        .filter(Table.restaurant_id == current_restaurant.id)
        .all()
    )

    return tables


@router.get(
    "/{table_id}",
    response_model=TableResponse,
)
def get_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    return table


@router.put(
    "/{table_id}",
    response_model=TableResponse,
)
def update_table(
    table_id: int,
    table_data: TableUpdate,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    if table_data.table_number is not None:
        existing_table = (
            db.query(Table)
            .filter(
                Table.restaurant_id == current_restaurant.id,
                Table.table_number == table_data.table_number,
                Table.id != table_id,
            )
            .first()
        )

        if existing_table:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Table number already exists",
            )

        table.table_number = table_data.table_number

    if table_data.is_active is not None:
        table.is_active = table_data.is_active

    db.commit()
    db.refresh(table)

    return table


@router.patch(
    "/{table_id}/status",
    response_model=TableResponse,
)
def update_table_status(
    table_id: int,
    table_data: TableStatusUpdate,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    table.is_active = table_data.is_active

    db.commit()
    db.refresh(table)

    return table


@router.patch(
    "/{table_id}",
    response_model=TableResponse,
)
def patch_table(
    table_id: int,
    table_data: TableUpdate,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    if table_data.table_number is not None:
        existing_table = (
            db.query(Table)
            .filter(
                Table.restaurant_id == current_restaurant.id,
                Table.table_number == table_data.table_number,
                Table.id != table_id,
            )
            .first()
        )
        if existing_table:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Table number already exists",
            )
        table.table_number = table_data.table_number

    if table_data.is_active is not None:
        table.is_active = table_data.is_active

    db.commit()
    db.refresh(table)

    return table


@router.delete(
    "/{table_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    table.is_active = False
    db.commit()
