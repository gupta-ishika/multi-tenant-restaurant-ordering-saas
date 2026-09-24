from pydantic import BaseModel, ConfigDict


class TableCreate(BaseModel):
    table_number: str


class TableUpdate(BaseModel):
    table_number: str | None = None
    is_active: bool | None = None


class TableStatusUpdate(BaseModel):
    is_active: bool


class TableResponse(BaseModel):
    id: int
    restaurant_id: int
    table_number: str
    qr_code_url: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)