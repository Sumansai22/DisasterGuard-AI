import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

Base = declarative_base()

def get_engine():
    db_url = settings.database_url or "sqlite:///./landslide_guard.db"
    
    # Render and Supabase often supply postgres:// which SQLAlchemy 2.0 requires as postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    try:
        if db_url.startswith("postgresql"):
            eng = create_engine(db_url, pool_pre_ping=True)
            with eng.connect() as conn:
                pass
            return eng
        else:
            return create_engine(db_url, connect_args={"check_same_thread": False})
    except Exception as exc:
        print(f"Notice: Primary database unavailable ({exc}). Using local SQLite database (sqlite:///./landslide_guard.db).")
        sqlite_url = "sqlite:///./landslide_guard.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

try:
    from app.models import Station, Prediction, Alert, WeatherData, AuditLog, LandScanResult
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

def init_db():
    from app.models import Station, Prediction, Alert, WeatherData, AuditLog, LandScanResult
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial stations if empty
    db = SessionLocal()
    try:
        if db.query(Station).count() == 0:
            initial_stations = [
                Station(station_code="LS-001", name="Nilgiri North", latitude=11.4064, longitude=76.6932, region="Nilgiris", elevation=1850.0, status="active"),
                Station(station_code="LS-002", name="Munnar East", latitude=10.0889, longitude=77.0595, region="Munnar", elevation=1520.0, status="active"),
                Station(station_code="LS-003", name="Wayanad South", latitude=11.6854, longitude=76.1320, region="Wayanad", elevation=900.0, status="active"),
            ]
            db.add_all(initial_stations)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
