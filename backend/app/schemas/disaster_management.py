"""
Central Disaster Management & Early Warning Schemas
===================================================
Standardized schemas for:
- LocationModel
- DisasterEvent
- IncidentModel
- AlertModel
- EmergencyResource
- RouteModel
- DroneDetectionModel
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LocationModel(BaseModel):
    id: str
    name: str
    display_name: str
    latitude: float
    longitude: float
    country: Optional[str] = "India"
    state: Optional[str] = None
    district: Optional[str] = None
    postal_code: Optional[str] = None
    elevation_m: Optional[float] = None
    source: str = "Nominatim / OpenStreetMap"
    source_type: str = "LIVE"  # LIVE, FORECAST, DEMO, MODEL_ESTIMATE, UNAVAILABLE
    updated_at: str
    has_local_telemetry: bool = False
    telemetry_station_id: Optional[str] = None
    telemetry_distance_km: Optional[float] = None
    environmental_data_available: bool = True

class DisasterEvent(BaseModel):
    id: str
    hazard_type: str = "LANDSLIDE"  # LANDSLIDE, FLOOD, FLASH_FLOOD, CYCLONE, etc.
    title: str
    severity: str = "HIGH"  # LOW, MEDIUM, HIGH, CRITICAL
    status: str = "ACTIVE"  # WATCH, ADVISORY, ACTIVE, RESOLVED, EXPIRED
    latitude: float
    longitude: float
    affected_radius_km: float = 5.0
    probability: float = 0.85
    confidence: float = 0.90
    source: str = "Multi-Hazard Assessment Engine"
    source_type: str = "MODEL_ESTIMATE"
    description: str
    affected_area_sqkm: Optional[float] = None
    affected_population: Optional[int] = None
    issued_at: str
    updated_at: str
    expires_at: Optional[str] = None
    recommended_actions: List[str] = []

class IncidentModel(BaseModel):
    id: str
    type: str = "RESCUE_SEARCH"
    priority: str = "CRITICAL"  # LOW, MEDIUM, HIGH, CRITICAL
    status: str = "DETECTED"    # DETECTED -> ASSESSED -> PENDING_VERIFICATION -> VERIFIED -> ALERTED -> DISPATCHED -> RESPONDING -> RESOLVED
    hazard_type: str = "FLASH_FLOOD"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    source: str = "AI Drone Vision (YOLOv8)"
    confidence: float = 0.92
    distress_score: Optional[float] = None
    indicators: List[str] = []
    created_at: str
    verified_at: Optional[str] = None
    acknowledged_at: Optional[str] = None
    dispatched_at: Optional[str] = None
    on_scene_at: Optional[str] = None
    resolved_at: Optional[str] = None
    assigned_team: Optional[str] = None
    assigned_team_type: Optional[str] = None
    notes: Optional[str] = None
    person_id: Optional[str] = None
    tracking_id: Optional[int] = None

class AlertModel(BaseModel):
    id: str
    type: str = "HAZARD_WARNING"
    hazard_type: str = "LANDSLIDE"
    severity: str = "HIGH"
    status: str = "ACTIVE"
    title: str
    location_name: str
    latitude: float
    longitude: float
    zone_id: Optional[str] = None
    risk_score: float = 85.0
    source: str = "Early Warning System"
    source_type: str = "MODEL_ESTIMATE"
    reason: str
    recommended_action: str
    safe_evacuation_route_available: bool = True
    recipients: List[str] = []
    created_at: str
    updated_at: str

class EmergencyResource(BaseModel):
    id: str
    name: str
    type: str  # SHELTER, HOSPITAL, FIRE_STATION, POLICE, AMBULANCE, RESCUE_TEAM, EOC
    latitude: float
    longitude: float
    status: str = "AVAILABLE"
    capacity: int = 100
    occupancy: int = 0
    available_capacity: int = 100
    contact: str
    facilities: List[str] = []
    source: str = "National Disaster Infrastructure GIS"
    distance_km: Optional[float] = None
    address: Optional[str] = None

class RouteModel(BaseModel):
    id: str
    origin_name: str
    destination_name: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    distance_km: float
    duration_minutes: float
    safety_score: float
    hazard_exposure_km: float
    status: str  # SAFE, CAUTION, DANGEROUS, BLOCKED
    route_type: str  # RECOMMENDED_SAFE, SAFE_ALTERNATIVE, CAUTION_ROUTE, DANGEROUS_ROUTE, BLOCKED_ROUTE
    is_recommended: bool
    waypoints: List[List[float]] = []
    warnings: List[str] = []
    blocked_reason: Optional[str] = None
