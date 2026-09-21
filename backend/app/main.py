from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api import dashboard, prediction, stations, alerts, weather, audit_logs, segmentation
from app.services.ml_service import ml_service
from app.services.segmentation_service import segmentation_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables & seed data
    try:
        init_db()
    except Exception as exc:
        print(f"Database initialization warning: {exc}")

    # 1. Load tabular Random Forest model
    try:
        ml_service.load()
    except Exception as exc:
        print(f"WARNING: Tabular Random Forest ML model could not be loaded: {exc}")

    # 2. Load U-Net segmentation model
    try:
        segmentation_service.load()
    except Exception as exc:
        print(f"WARNING: U-Net Landslide Segmentation ML model could not be loaded: {exc}")

    yield

app = FastAPI(
    title="LandslideGuard AI API",
    version="1.0.0",
    description="Backend API for SIH26001 AI Early-Warning Landslide Risk Monitoring & Land Image Segmentation.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(prediction.router, prefix="/api/predict", tags=["Predictions"])
app.include_router(segmentation.router, prefix="/api/segmentation", tags=["AI Land Scan"])
app.include_router(stations.router, prefix="/api/stations", tags=["Stations"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["Audit Logs"])

@app.get("/api/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "service": "landslideguard-backend",
        "version": app.version,
        "models": {
            "random_forest": "ready" if ml_service.available else "unavailable",
            "unet_segmentation": "ready" if segmentation_service.is_ready else "unavailable",
        },
    }
