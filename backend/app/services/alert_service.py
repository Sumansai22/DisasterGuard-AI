from datetime import datetime
from sqlalchemy.orm import Session
from app.models.alert import Alert

def create_alert_if_needed(db: Session, station_id: int, prediction_id: int, level: str, score: float):
    if level not in {"ELEVATED", "HIGH"}:
        return None
    message = f"{level} landslide risk detected (risk score: {score:.2f})."
    alert = Alert(
        station_id=station_id,
        prediction_id=prediction_id,
        alert_level=level,
        message=message,
    )
    db.add(alert)
    return alert
