from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)

    # Exact ML model inputs
    rainfall = Column(Float, nullable=True)
    slope_angle = Column(Float, nullable=True)
    soil_saturation = Column(Float, nullable=True)
    vegetation_cover = Column(Float, nullable=True)
    earthquake_activity = Column(Float, nullable=True)
    proximity_to_water = Column(Float, nullable=True)
    soil_type_gravel = Column(Float, nullable=True)
    soil_type_sand = Column(Float, nullable=True)
    soil_type_silt = Column(Float, nullable=True)

    # Result
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(30), nullable=False)
    prediction = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    station = relationship("Station", back_populates="predictions")
    alerts = relationship("Alert", back_populates="prediction", cascade="all, delete-orphan")
