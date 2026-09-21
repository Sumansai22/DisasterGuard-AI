from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.station import Station
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionRequest
from app.services.ml_service import ml_service, MODEL_FEATURES
from app.services.risk_service import risk_level
from app.services.alert_service import create_alert_if_needed

router = APIRouter()

@router.post("")
def predict(payload: PredictionRequest, db: Session = Depends(get_db)):
    station = db.get(Station, payload.station_id)
    if not station:
        raise HTTPException(404, "Station not found")

    values = payload.model_dump()
    features = {name: values[name] for name in MODEL_FEATURES}

    try:
        pred, score = ml_service.predict(features)
    except Exception as exc:
        raise HTTPException(503, str(exc))

    level = risk_level(score)
    record = Prediction(
        station_id=payload.station_id,
        rainfall=values["Rainfall_mm"],
        slope_angle=values["Slope_Angle"],
        soil_saturation=values["Soil_Saturation"],
        vegetation_cover=values["Vegetation_Cover"],
        earthquake_activity=values["Earthquake_Activity"],
        proximity_to_water=values["Proximity_to_Water"],
        soil_type_gravel=values["Soil_Type_Gravel"],
        soil_type_sand=values["Soil_Type_Sand"],
        soil_type_silt=values["Soil_Type_Silt"],
        risk_score=score,
        risk_level=level,
        prediction=pred,
    )
    db.add(record)
    db.flush()

    alert = create_alert_if_needed(db, payload.station_id, record.id, level, score)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "station_id": record.station_id,
        "prediction": record.prediction,
        "risk_score": record.risk_score,
        "risk_level": record.risk_level,
        "message": f"{level} landslide risk detected." if level != "LOW" else "Low landslide risk.",
        "alert_created": alert is not None,
        "model_features": MODEL_FEATURES,
        "created_at": record.created_at,
    }

@router.get("")
def prediction_history(station_id: int | None = None, limit: int = 100, db: Session = Depends(get_db)):
    limit = max(1, min(limit, 500))
    query = db.query(Prediction)
    if station_id:
        query = query.filter(Prediction.station_id == station_id)
    return query.order_by(Prediction.created_at.desc()).limit(limit).all()

@router.get("/{prediction_id}")
def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    record = db.get(Prediction, prediction_id)
    if not record:
        raise HTTPException(404, "Prediction not found")
    return record
