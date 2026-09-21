from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.core.database import Base

class LandScanResult(Base):
    __tablename__ = "land_scan_results"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    landslide_detected = Column(Boolean, nullable=False, default=False)
    landslide_percentage = Column(Float, nullable=False, default=0.0)
    severity = Column(String(50), nullable=False, default="LOW")
    confidence = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
