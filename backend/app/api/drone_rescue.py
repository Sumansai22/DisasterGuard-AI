import os
import json
import uuid
import shutil
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel

from app.schemas.drone_rescue import (
    DroneAnalysisResult,
    DroneTelemetry,
    DroneIncidentUpdateRequest,
    RescueAlertDispatchPayload,
    TrackedPersonDetection,
)
from app.services.drone_vision_service import drone_vision_service
from app.services.drone_incident_service import drone_incident_service

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "drone")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Preset multi-hazard drone disaster scenarios for rapid testing
PRESET_SCENARIOS = [
    {
        "id": "preset_bhimavaram_flood",
        "title": "Bhimavaram Canal Flood Inundation Scan",
        "hazard": "FLASH FLOOD",
        "location": "Bhimavaram, Andhra Pradesh",
        "drone_id": "DRONE-01",
        "description": "Aerial scan over submerged residential quarters and Godavari branch canal bank following flash surge.",
        "latitude": 16.5448,
        "longitude": 81.5212,
        "altitude_m": 48.0,
        "video_url": "/demo/drone-rescue-real-footage.mp4",
        "thumbnail_url": "/demo/flood_thumb.jpg",
    },
    {
        "id": "preset_chooralmala_landslide",
        "title": "Chooralmala Debris Corridor Rescue Scan",
        "hazard": "LANDSLIDE",
        "location": "Wayanad, Kerala",
        "drone_id": "DRONE-02",
        "description": "Thermal & RGB quadcopter reconnaissance along Chooralmala collapsed bridge sector.",
        "latitude": 11.5234,
        "longitude": 76.1689,
        "altitude_m": 62.0,
        "video_url": "/demo/drone-rescue-real-footage.mp4",
        "thumbnail_url": "/demo/landslide_thumb.jpg",
    },
    {
        "id": "preset_chennai_cyclone",
        "title": "Chennai Coastal Storm Surge Stranded Scan",
        "hazard": "CYCLONE",
        "location": "Chennai, Tamil Nadu",
        "drone_id": "DRONE-03",
        "description": "Scanning marooned rooftops and waterlogged arterial corridors in low-lying coastal zone.",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "altitude_m": 35.0,
        "video_url": "/demo/drone-rescue-real-footage.mp4",
        "thumbnail_url": "/drone_samples/cyclone_thumb.jpg",
    },
]

# Simulated active live telemetry state
_live_drone_state: Dict[str, Any] = {
    "drone_id": "DRONE-01",
    "connected": False,
    "stream_url": None,
    "altitude_m": None,
    "latitude": None,
    "longitude": None,
    "heading_deg": None,
    "speed_kmh": None,
    "battery_pct": None,
    "signal_pct": None,
    "mission_name": "POST-DISASTER SEARCH & RESCUE",
    "active_hazard": "FLASH FLOOD",
}

class ConnectFeedPayload(BaseModel):
    drone_id: str = "DRONE-01"
    stream_url: str  # RTSP / WebRTC / HLS
    hazard_context: str = "FLASH FLOOD"
    location_name: str = "Bhimavaram"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude_m: Optional[float] = 45.0

@router.get("/presets", tags=["Drone Rescue"])
def get_drone_presets():
    return {
        "status": "success",
        "presets": PRESET_SCENARIOS,
    }

@router.get("/telemetry", tags=["Drone Rescue"])
def get_drone_telemetry():
    return {
        "status": "success",
        "telemetry": _live_drone_state,
    }

@router.post("/telemetry/connect", tags=["Drone Rescue"])
def connect_live_drone_feed(payload: ConnectFeedPayload):
    if not payload.stream_url or not payload.stream_url.strip():
        raise HTTPException(status_code=400, detail="A valid RTSP, WebRTC, or HLS stream endpoint is required.")

    _live_drone_state.update({
        "drone_id": payload.drone_id or "DRONE-01",
        "connected": True,
        "stream_url": payload.stream_url,
        "active_hazard": payload.hazard_context,
        "altitude_m": payload.altitude_m or 45.0,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "heading_deg": 142.5,
        "speed_kmh": 18.2,
        "battery_pct": 87,
        "signal_pct": 94,
    })

    return {
        "status": "connected",
        "message": f"Connected to live stream feed for {payload.drone_id}",
        "telemetry": _live_drone_state,
    }

@router.post("/telemetry/disconnect", tags=["Drone Rescue"])
def disconnect_live_drone_feed():
    _live_drone_state["connected"] = False
    _live_drone_state["stream_url"] = None
    return {
        "status": "disconnected",
        "telemetry": _live_drone_state,
    }

@router.post("/upload", tags=["Drone Rescue"])
async def upload_drone_footage(
    file: UploadFile = File(...),
    hazard_context: str = Form("FLASH FLOOD"),
    location_name: str = Form("Bhimavaram"),
    drone_id: str = Form("DRONE-01"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    altitude_m: Optional[float] = Form(None),
):
    """
    Uploads and analyzes drone video (MP4/MOV/AVI) or drone photo (JPG/PNG).
    Performs frame extraction, person detection, object tracking, and distress evaluation.
    """
    valid_exts = (".mp4", ".mov", ".avi", ".mkv", ".webm", ".jpg", ".jpeg", ".png", ".webp")
    filename = file.filename or "footage.mp4"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in valid_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload an MP4, MOV, AVI video or JPG/PNG image.",
        )

    file_id = f"drone_{uuid.uuid4().hex[:8]}_{filename}"
    saved_path = os.path.join(UPLOAD_DIR, file_id)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    telemetry_obj = DroneTelemetry(
        drone_id=drone_id,
        connected=True if (latitude and longitude) else False,
        altitude_m=altitude_m or (45.0 if (latitude and longitude) else None),
        latitude=latitude,
        longitude=longitude,
        heading_deg=135.0 if latitude else None,
        speed_kmh=16.0 if latitude else None,
        battery_pct=88 if latitude else None,
        signal_pct=95 if latitude else None,
        active_hazard=hazard_context,
    )

    is_image = ext in (".jpg", ".jpeg", ".png", ".webp")

    if is_image:
        with open(saved_path, "rb") as img_f:
            image_bytes = img_f.read()
        analysis = drone_vision_service.analyze_image_bytes(
            image_bytes=image_bytes,
            filename=filename,
            hazard_context=hazard_context,
            disaster_location=location_name,
            telemetry=telemetry_obj,
        )
    else:
        analysis = drone_vision_service.analyze_video_file(
            video_path=saved_path,
            filename=filename,
            hazard_context=hazard_context,
            disaster_location=location_name,
            telemetry=telemetry_obj,
            sample_fps=2.0,
        )

    # Save to incident tracking service
    drone_incident_service.save_analysis(analysis.dict())

    return {
        "status": "success",
        "analysis": analysis,
        "file_url": f"/uploads/drone/{file_id}",
    }

@router.post("/analyze-preset", tags=["Drone Rescue"])
def analyze_preset_scenario(
    preset_id: str = Query(..., description="Preset ID from /presets"),
):
    """
    Executes immediate analysis on a ready-to-use disaster scenario preset.
    """
    preset = next((p for p in PRESET_SCENARIOS if p["id"] == preset_id), None)
    if not preset:
        preset = PRESET_SCENARIOS[0]

    telemetry_obj = DroneTelemetry(
        drone_id=preset["drone_id"],
        connected=True,
        altitude_m=preset["altitude_m"],
        latitude=preset["latitude"],
        longitude=preset["longitude"],
        heading_deg=142.0,
        speed_kmh=18.5,
        battery_pct=92,
        signal_pct=96,
        mission_name=preset["title"],
        active_hazard=preset["hazard"],
    )

    analysis = drone_vision_service.analyze_video_file(
        video_path="preset",
        filename=f"{preset['id']}.mp4",
        hazard_context=preset["hazard"],
        disaster_location=preset["location"],
        telemetry=telemetry_obj,
        sample_fps=2.0,
    )

    drone_incident_service.save_analysis(analysis.dict())

    return {
        "status": "success",
        "preset": preset,
        "analysis": analysis,
    }

@router.get("/analysis/{analysis_id}", tags=["Drone Rescue"])
def get_drone_analysis(analysis_id: str):
    analysis = drone_incident_service.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return {"status": "success", "analysis": analysis}

@router.get("/incidents", tags=["Drone Rescue"])
def list_rescue_incidents():
    incidents = drone_incident_service.list_incidents()
    return {
        "status": "success",
        "total": len(incidents),
        "incidents": incidents,
    }

@router.post("/incidents/{incident_id}/verify", tags=["Drone Rescue"])
def verify_rescue_incident(incident_id: str):
    updated = drone_incident_service.update_incident_status(
        incident_id=incident_id,
        new_status="VERIFIED",
        notes="Human operator confirmed possible distress case from drone aerial review.",
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return {"status": "success", "incident": updated}

@router.post("/incidents/{incident_id}/false-positive", tags=["Drone Rescue"])
def mark_incident_false_positive(incident_id: str):
    updated = drone_incident_service.update_incident_status(
        incident_id=incident_id,
        new_status="FALSE_POSITIVE",
        notes="Operator verified non-emergency / false positive.",
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return {"status": "success", "incident": updated}

@router.post("/incidents/{incident_id}/dispatch", tags=["Drone Rescue"])
def dispatch_rescue_alert(incident_id: str, payload: RescueAlertDispatchPayload):
    result = drone_incident_service.dispatch_rescue(payload)
    return result

@router.post("/incidents/{incident_id}/status", tags=["Drone Rescue"])
def update_incident_custom_status(incident_id: str, req: DroneIncidentUpdateRequest):
    updated = drone_incident_service.update_incident_status(
        incident_id=incident_id,
        new_status=req.status,
        notes=req.notes,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return {"status": "success", "incident": updated}
