from datetime import datetime
from pydantic import BaseModel, Field

class StationCreate(BaseModel):
    station_code: str = Field(min_length=2, max_length=50)
    name: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    region: str | None = None
    elevation: float | None = None
    status: str = "active"

class StationUpdate(BaseModel):
    name: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    region: str | None = None
    elevation: float | None = None
    status: str | None = None

class StationOut(StationCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
