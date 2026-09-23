from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_restaurant
from app.database.database import get_db
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.schemas.table import (
    TableCreate,
    TableResponse,
    TableUpdate,
)
from app.services.qr_service import generate_qr_code

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
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
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

    new_table = Table(
        restaurant_id=current_restaurant.id,
        table_number=table_data.table_number,
        qr_code_url="temporary",
    )

    db.add(new_table)

    # Get the database-generated ID
    db.flush()

    # Generate the actual QR code
    new_table.qr_code_url = generate_qr_code(new_table.id)

    db.commit()
    db.refresh(new_table)

    return new_table

@router.get(
    "",
    response_model=list[TableResponse],
)
def get_tables(
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
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
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if table is None:
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
    table_data: TableCreate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if table is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

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

    db.commit()
    db.refresh(table)

    return table

@router.delete(
    "/{table_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_table(
    table_id: int,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if table is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found",
        )

    table.is_active = False

    db.commit()


@router.patch(
    "/{table_id}",
    response_model=TableResponse,
)
def patch_table(
    table_id: int,
    table_data: TableUpdate,
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db),
):
    table = (
        db.query(Table)
        .filter(
            Table.id == table_id,
            Table.restaurant_id == current_restaurant.id,
        )
        .first()
    )

    if table is None:
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


