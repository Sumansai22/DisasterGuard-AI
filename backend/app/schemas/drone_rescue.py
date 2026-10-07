from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class BoundingBox(BaseModel):
    x: float  # Top-left x or normalized [0, 1] or pixel
    y: float  # Top-left y
    width: float
    height: float
    x_px: Optional[int] = None
    y_px: Optional[int] = None
    width_px: Optional[int] = None
    height_px: Optional[int] = None

class DistressIndicator(BaseModel):
    name: str
    description: str
    weight: float
    detected: bool

class TrackedPersonDetection(BaseModel):
    detection_id: str
    person_id: str  # e.g., "PERSON #12"
    tracking_id: int
    confidence: float
    timestamp_sec: float
    timestamp_str: str  # e.g., "00:03:21"
    frame_number: int
    bbox: BoundingBox
    distress_score: float  # 0.0 - 1.0 (e.g. 0.91 -> 91%)
    priority: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    status: str  # "AI_DETECTED" | "PENDING_VERIFICATION" | "VERIFIED" | "DISPATCHED" | "RESCUED" | "FALSE_POSITIVE"
    indicators: List[str] = Field(default_factory=list)
    hazard_context: Optional[str] = None  # e.g. "FLOOD", "LANDSLIDE"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gps_available: bool = False
    location_label: Optional[str] = None
    posture: Optional[str] = "Normal"
    snapshot_url: Optional[str] = None

class DroneTelemetry(BaseModel):
    drone_id: str = "DRONE-01"
    connected: bool = False
    altitude_m: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    heading_deg: Optional[float] = None
    speed_kmh: Optional[float] = None
    battery_pct: Optional[int] = None
    signal_pct: Optional[int] = None
    stream_url: Optional[str] = None
    mission_name: Optional[str] = "DISASTER RESCUE SCAN"
    active_hazard: Optional[str] = "FLOOD"

class DroneAnalysisSummary(BaseModel):
    total_people_detected: int = 0
    possible_distress_count: int = 0
    high_priority_count: int = 0
    rescue_alerts_count: int = 0
    verified_count: int = 0
    dispatched_count: int = 0

class DroneAnalysisResult(BaseModel):
    analysis_id: str
    media_type: str  # "video" | "image" | "live_stream"
    filename: str
    duration_sec: float = 0.0
    total_frames_analyzed: int = 0
    fps_sampled: float = 2.0
    summary: DroneAnalysisSummary
    detections: List[TrackedPersonDetection] = Field(default_factory=list)
    telemetry: Optional[DroneTelemetry] = None
    disaster_location: Optional[str] = "Bhimavaram"
    active_hazard: Optional[str] = "FLASH FLOOD"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DroneIncidentUpdateRequest(BaseModel):
    status: str  # "VERIFIED" | "FALSE_POSITIVE" | "DISPATCHED" | "RESCUED"
    notes: Optional[str] = None
    destination_team: Optional[str] = None

class RescueAlertDispatchPayload(BaseModel):
    incident_id: str
    person_id: str
    priority: str
    distress_score: float
    confidence: float
    hazard: str
    destination: str  # e.g., "NDRF Search & Rescue Team", "Emergency Operations Center"
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
