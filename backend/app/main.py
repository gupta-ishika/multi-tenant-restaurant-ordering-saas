from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database.database import engine
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.restaurants import router as restaurant_router
from app.api.categories import router as category_router
from app.api.food_items import router as food_item_router
from app.api.tables import router as table_router
from app.api.public import router as public_router
from app.api.orders import (
    public_router as public_order_router,
    restaurant_router as restaurant_order_router,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(category_router)
app.include_router(food_item_router)
app.include_router(table_router)
app.include_router(public_router)
app.include_router(restaurant_order_router)
app.include_router(public_order_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Food Ordering API"
    }


@app.get("/api/hello")
def hello():
    return {
        "message": "Hello from FastAPI!"
    }

@app.get("/api/db-test")
def test_database():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "message": "Database connected successfully!"
    }