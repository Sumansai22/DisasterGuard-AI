from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.station import Station
from app.schemas.station import StationCreate, StationUpdate, StationOut

router = APIRouter()

@router.get("", response_model=list[StationOut])
def list_stations(db: Session = Depends(get_db)):
    return db.query(Station).order_by(Station.id).all()

@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(404, "Station not found")
    return station

@router.post("", response_model=StationOut, status_code=201)
def create_station(payload: StationCreate, db: Session = Depends(get_db)):
    if db.query(Station).filter_by(station_code=payload.station_code).first():
        raise HTTPException(409, "station_code already exists")
    station = Station(**payload.model_dump())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station

@router.put("/{station_id}", response_model=StationOut)
def update_station(station_id: int, payload: StationUpdate, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(404, "Station not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(station, key, value)
    db.commit()
    db.refresh(station)
    return station

@router.delete("/{station_id}")
def decommission_station(station_id: int, db: Session = Depends(get_db)):
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(404, "Station not found")
    station.status = "decommissioned"
    db.commit()
    return {"message": "Station decommissioned", "station_id": station_id}
