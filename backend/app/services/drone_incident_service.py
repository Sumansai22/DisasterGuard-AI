import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas.drone_rescue import (
    TrackedPersonDetection,
    RescueAlertDispatchPayload,
    DroneAnalysisSummary,
)

class DroneIncidentService:
    def __init__(self):
        # In-memory store + sync with system alerts
        self._analyses: Dict[str, Dict[str, Any]] = {}
        self._incidents: Dict[str, Dict[str, Any]] = {}
        self._seed_default_incidents()

    def _seed_default_incidents(self):
        default_items = [
            {
                "incident_id": "INC-DRONE-8821",
                "detection_id": "det_p12",
                "person_id": "PERSON #12",
                "tracking_id": 12,
                "priority": "CRITICAL",
                "status": "PENDING_VERIFICATION",
                "confidence": 0.94,
                "distress_score": 0.91,
                "hazard": "FLASH FLOOD",
                "location_label": "Bhimavaram Canal East Embankment (16.5466° N, 81.5198° E)",
                "latitude": 16.5466,
                "longitude": 81.5198,
                "gps_available": True,
                "timestamp_str": "00:14",
                "indicators": [
                    "Flood water / inundation zone exposure",
                    "Lying posture on ground/surface",
                    "Stationary for unusual duration",
                    "Isolated from rescue corridors / groups",
                ],
                "assigned_team": None,
                "created_at": datetime.utcnow().isoformat(),
            },
            {
                "incident_id": "INC-DRONE-8822",
                "detection_id": "det_p07",
                "person_id": "PERSON #07",
                "tracking_id": 7,
                "priority": "HIGH",
                "status": "AI_DETECTED",
                "confidence": 0.89,
                "distress_score": 0.61,
                "hazard": "FLASH FLOOD",
                "location_label": "Bhimavaram Sector 4 Inundated Perimeter (16.5426° N, 81.5231° E)",
                "latitude": 16.5426,
                "longitude": 81.5231,
                "gps_available": True,
                "timestamp_str": "00:28",
                "indicators": [
                    "Repeated signaling / arm movement pattern",
                    "Active FLASH FLOOD disaster area",
                    "Isolated individual in scan sector",
                ],
                "assigned_team": None,
                "created_at": datetime.utcnow().isoformat(),
            },
            {
                "incident_id": "INC-DRONE-8823",
                "detection_id": "det_p04",
                "person_id": "PERSON #04",
                "tracking_id": 4,
                "priority": "LOW",
                "status": "AI_DETECTED",
                "confidence": 0.96,
                "distress_score": 0.28,
                "hazard": "FLASH FLOOD",
                "location_label": "Bhimavaram High Ground Road Sector (16.5483° N, 81.5240° E)",
                "latitude": 16.5483,
                "longitude": 81.5240,
                "gps_available": True,
                "timestamp_str": "00:42",
                "indicators": [
                    "Normal movement pattern along road edge",
                ],
                "assigned_team": None,
                "created_at": datetime.utcnow().isoformat(),
            },
        ]
        for item in default_items:
            self._incidents[item["incident_id"]] = item

    def save_analysis(self, analysis_dict: Dict[str, Any]):
        analysis_id = analysis_dict["analysis_id"]
        self._analyses[analysis_id] = analysis_dict

        # Auto-create or update incidents for medium, high, and critical detections
        for det in analysis_dict.get("detections", []):
            tracking_id = det.get("tracking_id", 0)
            person_id = det.get("person_id", f"PERSON #{tracking_id}")
            inc_id = f"INC-DRONE-{analysis_id[-4:].upper()}-{tracking_id:02d}"

            if inc_id not in self._incidents:
                self._incidents[inc_id] = {
                    "incident_id": inc_id,
                    "analysis_id": analysis_id,
                    "detection_id": det.get("detection_id"),
                    "person_id": person_id,
                    "tracking_id": tracking_id,
                    "priority": det.get("priority", "MEDIUM"),
                    "status": det.get("status", "AI_DETECTED"),
                    "confidence": det.get("confidence", 0.9),
                    "distress_score": det.get("distress_score", 0.5),
                    "hazard": det.get("hazard_context") or analysis_dict.get("active_hazard", "DISASTER"),
                    "location_label": det.get("location_label") or "Scan Coordinate",
                    "latitude": det.get("latitude"),
                    "longitude": det.get("longitude"),
                    "gps_available": det.get("gps_available", False),
                    "timestamp_str": det.get("timestamp_str", "00:00"),
                    "indicators": det.get("indicators", []),
                    "assigned_team": None,
                    "created_at": datetime.utcnow().isoformat(),
                }

    def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        return self._analyses.get(analysis_id)

    def list_incidents(self) -> List[Dict[str, Any]]:
        return list(self._incidents.values())

    def update_incident_status(self, incident_id: str, new_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if incident_id not in self._incidents:
            return None
        inc = self._incidents[incident_id]
        inc["status"] = new_status
        inc["updated_at"] = datetime.utcnow().isoformat()
        if notes:
            inc["operator_notes"] = notes

        # Update in corresponding analysis if present
        analysis_id = inc.get("analysis_id")
        if analysis_id and analysis_id in self._analyses:
            for det in self._analyses[analysis_id].get("detections", []):
                if det.get("tracking_id") == inc.get("tracking_id"):
                    det["status"] = new_status

        return inc

    def dispatch_rescue(self, payload: RescueAlertDispatchPayload) -> Dict[str, Any]:
        inc_id = payload.incident_id
        if inc_id in self._incidents:
            self._incidents[inc_id]["status"] = "DISPATCHED"
            self._incidents[inc_id]["assigned_team"] = payload.destination
            self._incidents[inc_id]["dispatched_at"] = datetime.utcnow().isoformat()
            if payload.notes:
                self._incidents[inc_id]["dispatch_notes"] = payload.notes

        return {
            "success": True,
            "incident_id": inc_id,
            "status": "DISPATCHED",
            "destination_team": payload.destination,
            "dispatched_at": datetime.utcnow().isoformat(),
            "message": f"Rescue dispatch order sent to {payload.destination} for {payload.person_id} (Priority: {payload.priority})",
        }

drone_incident_service = DroneIncidentService()
