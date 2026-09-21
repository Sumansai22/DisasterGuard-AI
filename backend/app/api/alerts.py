from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.alert import Alert

router = APIRouter()

@router.get("")
def list_alerts(
    acknowledged: bool | None = None,
    station_id: int | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 500))
    query = db.query(Alert)
    if acknowledged is not None:
        query = query.filter(Alert.is_acknowledged == acknowledged)
    if station_id:
        query = query.filter(Alert.station_id == station_id)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()

@router.get("/{alert_id}")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert

@router.put("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
