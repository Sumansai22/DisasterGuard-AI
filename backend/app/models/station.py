from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True)
    station_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region = Column(String(120), nullable=True)
    elevation = Column(Float, nullable=True)
    status = Column(String(30), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    predictions = relationship("Prediction", back_populates="station", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="station", cascade="all, delete-orphan")
    weather_data = relationship("WeatherData", back_populates="station", cascade="all, delete-orphan")
