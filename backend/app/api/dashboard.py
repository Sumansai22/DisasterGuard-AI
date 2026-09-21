from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.models.station import Station
from app.models.prediction import Prediction
from app.models.alert import Alert
from app.models.land_scan import LandScanResult

router = APIRouter()

@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Station.id)).scalar() or 0
    active = db.query(func.count(Station.id)).filter(Station.status == "active").scalar() or 0
    high = db.query(func.count(Prediction.id)).filter(Prediction.risk_level == "HIGH").scalar() or 0
    moderate = db.query(func.count(Prediction.id)).filter(Prediction.risk_level == "MODERATE").scalar() or 0
    elevated = db.query(func.count(Prediction.id)).filter(Prediction.risk_level == "ELEVATED").scalar() or 0
    low = db.query(func.count(Prediction.id)).filter(Prediction.risk_level == "LOW").scalar() or 0
    active_alerts = db.query(func.count(Alert.id)).filter(Alert.is_acknowledged == False).scalar() or 0
    
    # Land scan counts & recent stats
    total_land_scans = db.query(func.count(LandScanResult.id)).scalar() or 0
    detected_land_scans = db.query(func.count(LandScanResult.id)).filter(LandScanResult.landslide_detected == True).scalar() or 0
    
    recent_scans = (
        db.query(LandScanResult)
        .order_by(desc(LandScanResult.created_at))
        .limit(5)
        .all()
    )

    return {
        "total_stations": total,
        "active_stations": active,
        "high_risk_predictions": high,
        "elevated_risk_predictions": elevated,
        "moderate_risk_predictions": moderate,
        "low_risk_predictions": low,
        "active_alerts": active_alerts,
        "total_land_scans": total_land_scans,
        "detected_land_scans": detected_land_scans,
        "recent_scans": [
            {
                "id": s.id,
                "filename": s.filename,
                "landslide_detected": s.landslide_detected,
                "landslide_percentage": s.landslide_percentage,
                "severity": s.severity,
                "confidence": s.confidence,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in recent_scans
        ],
    }
