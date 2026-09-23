import sys
from decimal import Decimal
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

# Force utf-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.database.base import Base
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.table import Table
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderItemCreate, OrderStatusUpdate
from app.enums.order_status import OrderStatus
from app.api.orders import (
    create_order,
    get_public_order,
    get_orders,
    get_order,
    update_order_status,
)
from app.api.public import get_public_menu

def run_tests():
    print("=" * 60)
    print(" LIVE AUTOMATED TEST EXECUTION: PHASE 8 SECURITY & FLOW")
    print("=" * 60)

    # Use clean in-memory SQLite database
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    # 1. Setup Multi-tenant Fixtures
    res_a = Restaurant(id=1, name="Bistro Alpha", email="alpha@bistro.com", hashed_password="hash", address="Rome", phone="111", is_active=True)
    res_b = Restaurant(id=2, name="Cafe Beta", email="beta@cafe.com", hashed_password="hash", address="Milan", phone="222", is_active=True)
    res_inactive = Restaurant(id=3, name="Closed Res", email="closed@res.com", hashed_password="hash", address="Naples", phone="333", is_active=False)
    db.add_all([res_a, res_b, res_inactive])
    db.commit()

    cat_a = Category(id=1, restaurant_id=1, name="Alpha Starters", is_active=True)
    cat_b = Category(id=2, restaurant_id=2, name="Beta Mains", is_active=True)
    db.add_all([cat_a, cat_b])
    db.commit()

    food_a1 = FoodItem(id=101, category_id=1, name="Alpha Bruschetta", price=Decimal("250.00"), is_active=True, is_available=True)
    food_a2_unavail = FoodItem(id=102, category_id=1, name="Alpha Lobster", price=Decimal("800.00"), is_active=True, is_available=False)
    food_a3_inact = FoodItem(id=103, category_id=1, name="Alpha Old Dish", price=Decimal("150.00"), is_active=False, is_available=True)
    food_b1 = FoodItem(id=201, category_id=2, name="Beta Pasta", price=Decimal("400.00"), is_active=True, is_available=True)
    db.add_all([food_a1, food_a2_unavail, food_a3_inact, food_b1])
    db.commit()

    table_a_active = Table(id=8, restaurant_id=1, table_number="T8", qr_code_url="url8", is_active=True)
    table_a_inactive = Table(id=9, restaurant_id=1, table_number="T9", qr_code_url="url9", is_active=False)
    table_b_active = Table(id=20, restaurant_id=2, table_number="T20", qr_code_url="url20", is_active=True)
    table_c_inactive_res = Table(id=30, restaurant_id=3, table_number="T30", qr_code_url="url30", is_active=True)
    db.add_all([table_a_active, table_a_inactive, table_b_active, table_c_inactive_res])
    db.commit()

    print("[FIXTURES READY] Created 3 Restaurants, 2 Categories, 4 Food Items, 4 Tables in SQLite.\n")

    # TEST 1: Valid Table + Food -> 201 Created
    req1 = OrderCreate(table_id=8, items=[OrderItemCreate(food_item_id=101, quantity=2, special_instructions="Extra garlic")])
    order1 = create_order(order_data=req1, db=db)
    assert order1["total_price"] == Decimal("500.00")
    assert order1["status"] == "Received"
    print("✔ TEST 1: Valid Order Creation -> Total computed: Rs. 500.00 (250 x 2), Status: Received")

    # TEST 2: Invalid Table ID -> 404
    try:
        create_order(order_data=OrderCreate(table_id=9999, items=[OrderItemCreate(food_item_id=101, quantity=1)]), db=db)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 2: Non-existent Table 9999 -> Blocked with {e.status_code} ({e.detail})")

    # TEST 3: Inactive Table -> 404
    try:
        create_order(order_data=OrderCreate(table_id=9, items=[OrderItemCreate(food_item_id=101, quantity=1)]), db=db)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 3: Inactive Table 9 -> Blocked with {e.status_code} ({e.detail})")

    # TEST 4: Inactive Restaurant -> 404
    try:
        create_order(order_data=OrderCreate(table_id=30, items=[OrderItemCreate(food_item_id=101, quantity=1)]), db=db)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 4: Inactive Restaurant 3 -> Blocked with {e.status_code} ({e.detail})")

    # TEST 5: Tenant Isolation (Table of Restaurant A ordering Restaurant B Food) -> 404
    try:
        create_order(order_data=OrderCreate(table_id=8, items=[OrderItemCreate(food_item_id=201, quantity=1)]), db=db)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 5: Cross-Tenant Injection (Table A + Food B) -> Blocked with {e.status_code} ({e.detail})")

    # TEST 6: Unavailable Food Item -> 400
    try:
        create_order(order_data=OrderCreate(table_id=8, items=[OrderItemCreate(food_item_id=102, quantity=1)]), db=db)
        assert False
    except HTTPException as e:
        assert e.status_code == 400
        print(f"✔ TEST 6: Out-of-Stock Food Item -> Blocked with {e.status_code} ({e.detail})")

    # TEST 7: Inactive (Archived) Food Item -> 404
    try:
        create_order(order_data=OrderCreate(table_id=8, items=[OrderItemCreate(food_item_id=103, quantity=1)]), db=db)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 7: Inactive Food Item -> Blocked with {e.status_code} ({e.detail})")

    # TEST 8 & 9: Quantity Validation
    try:
        OrderItemCreate(food_item_id=101, quantity=0)
        assert False
    except ValidationError:
        print("✔ TEST 8: quantity=0 -> Rejected by Pydantic Schema (Field gt=0)")

    try:
        OrderItemCreate(food_item_id=101, quantity=-5)
        assert False
    except ValidationError:
        print("✔ TEST 9: quantity=-5 -> Rejected by Pydantic Schema (Field gt=0)")

    # TEST 10: Server-side Pricing Immuntability
    req10 = OrderCreate(table_id=8, items=[OrderItemCreate(food_item_id=101, quantity=3)])
    order10 = create_order(order_data=req10, db=db)
    assert order10["total_price"] == Decimal("750.00")
    print(f"✔ TEST 10: Price Tampering Immunity -> Calculated exactly from DB price: Rs. {order10['total_price']}")

    # TEST 11: Cross-Restaurant Inspection & Status Patching
    try:
        get_order(order_id=order1["id"], db=db, current_restaurant=res_b)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 11.A: Restaurant B inspecting Restaurant A Order -> Blocked with {e.status_code} ({e.detail})")

    try:
        update_order_status(order_id=order1["id"], status_data=OrderStatusUpdate(status=OrderStatus.PREPARING), db=db, current_restaurant=res_b)
        assert False
    except HTTPException as e:
        assert e.status_code == 404
        print(f"✔ TEST 11.B: Restaurant B patching Restaurant A Order status -> Blocked with {e.status_code} ({e.detail})")

    # TEST 12: Public Live Tracking & Status Progression
    tracking = get_public_order(order_id=order1["id"], db=db)
    assert tracking["id"] == order1["id"]
    assert tracking["status"] == "Received"
    print(f"✔ TEST 12.A: Public tracking GET /public/orders/{order1['id']} -> Status: Received")

    update_order_status(order_id=order1["id"], status_data=OrderStatusUpdate(status=OrderStatus.PREPARING), db=db, current_restaurant=res_a)
    tracking_prep = get_public_order(order_id=order1["id"], db=db)
    assert tracking_prep["status"] == "Preparing"
    print(f"✔ TEST 12.B: Live status transition -> Status: Preparing")

    db.close()
    print("\n" + "=" * 60)
    print(" ALL 12 TESTS EXECUTED AND PASSED AGAINST ACTUAL SOURCE CODE")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
