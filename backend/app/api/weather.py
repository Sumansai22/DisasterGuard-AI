from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.station import Station
from app.models.weather import WeatherData

router = APIRouter()

class WeatherIn(BaseModel):
    rainfall: float | None = None
    temperature: float | None = None
    humidity: float | None = None
    soil_moisture: float | None = None
    wind_speed: float | None = None
    recorded_at: datetime | None = None

@router.get("/{station_id}")
def get_weather(station_id: int, limit: int = 100, db: Session = Depends(get_db)):
    if not db.get(Station, station_id):
        raise HTTPException(404, "Station not found")
    limit = max(1, min(limit, 500))
    return (
        db.query(WeatherData)
        .filter(WeatherData.station_id == station_id)
        .order_by(WeatherData.recorded_at.desc())
        .limit(limit)
        .all()
    )

@router.post("/{station_id}", status_code=201)
def add_weather(station_id: int, payload: WeatherIn, db: Session = Depends(get_db)):
    if not db.get(Station, station_id):
        raise HTTPException(404, "Station not found")
    record = WeatherData(station_id=station_id, **payload.model_dump(exclude_none=True))
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
