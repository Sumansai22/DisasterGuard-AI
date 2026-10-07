"""
Multi-Hazard Decision-Support API Router.
Provides multi-hazard assessments, hazard profiles, and cascading risk chains.
"""
from fastapi import APIRouter, Query
from typing import Optional, Dict, Any

from app.services.multi_hazard_engine import multi_hazard_engine, HAZARD_DEFINITIONS

router = APIRouter()

@router.get("/types")
async def get_hazard_types() -> Dict[str, Any]:
    """Returns metadata and profiles for all supported disaster hazard types."""
    return {
        "count": len(HAZARD_DEFINITIONS),
        "hazard_types": list(HAZARD_DEFINITIONS.values()),
    }

@router.get("/assessment")
async def get_multi_hazard_assessment(
    lat: float = Query(default=10.0889, description="Latitude"),
    lng: float = Query(default=77.0595, description="Longitude"),
    location_name: str = Query(default="Active Sector", description="Location name"),
    rainfall_mm: float = Query(default=68.5, description="Rainfall in mm"),
    slope_angle: float = Query(default=34.2, description="Slope angle in degrees"),
    soil_saturation: float = Query(default=78.0, description="Soil saturation percentage"),
    vegetation_cover: float = Query(default=45.0, description="Vegetation cover percentage"),
    earthquake_activity: float = Query(default=0.2, description="Earthquake activity / PGA"),
    proximity_to_water: float = Query(default=220.0, description="Proximity to water bodies in meters"),
    is_monitored: bool = Query(default=True, description="Whether location has live telemetry station"),
) -> Dict[str, Any]:
    """Evaluates compound multi-hazard risks, cascading triggers, impact exposure, and emergency SOP."""
    return multi_hazard_engine.calculate_location_risk(
        lat=lat,
        lng=lng,
        location_name=location_name,
        rainfall_mm=rainfall_mm,
        slope_angle=slope_angle,
        soil_saturation=soil_saturation,
        vegetation_cover=vegetation_cover,
        earthquake_activity=earthquake_activity,
        proximity_to_water=proximity_to_water,
        is_monitored=is_monitored,
    )

@router.get("/summary")
async def get_multi_hazard_summary(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> Dict[str, Any]:
    """Returns high-level multi-hazard summary for top-level dashboard KPI integration."""
    latitude = lat if lat is not None else 10.0889
    longitude = lng if lng is not None else 77.0595
    assessment = multi_hazard_engine.calculate_location_risk(
        lat=latitude,
        lng=longitude,
        location_name="Regional Command Area",
    )
    return {
        "composite_risk_score": assessment["compositeRiskScore"],
        "composite_risk_level": assessment["compositeRiskLevel"],
        "dominant_hazard": assessment["dominantHazard"],
        "active_hazards_count": assessment["activeHazardsCount"],
        "emergency_alert_level": assessment["emergencyResponse"]["alertLevel"],
        "ndma_code": assessment["emergencyResponse"]["ndmaProtocolCode"],
        "population_at_risk": assessment["impactExposure"]["estimatedPopulationAtRisk"],
        "top_hazards": assessment["hazards"][:3],
    }
