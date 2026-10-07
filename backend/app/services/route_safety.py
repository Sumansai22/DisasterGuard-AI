from __future__ import annotations
import math
import logging
from typing import List, Dict, Any, Tuple, Optional, Set
from sqlalchemy.orm import Session

from app.models.station import Station
from app.models.alert import Alert
from app.services.routing_service import haversine_distance_m

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------------
# COMPREHENSIVE MULTI-HAZARD DISASTER ZONES & GEOMETRIC POLYGONS ACROSS INDIA
# -------------------------------------------------------------------------
ACTIVE_HAZARD_ZONES = [
    # --- Andhra Pradesh / Godavari Delta / Bhimavaram / Macherla / Guntur ---
    {
        "id": "ZONE-BHIMAVARAM-FLOOD",
        "name": "Yenamadurru Drain Flash Inundation Zone",
        "region": "West Godavari District",
        "state": "Andhra Pradesh",
        "type": "FLOOD",
        "riskLevel": "HIGH",
        "riskScore": 86,
        "severity": "HIGH",
        "source": "CWC Hydrological Inundation Telemetry & Delta Flood Gauge",
        "center": {"lat": 16.5280, "lng": 81.5050},
        "radiusMeters": 850.0,
        "polygon": [
            [16.5380, 81.4950],
            [16.5410, 81.5150],
            [16.5180, 81.5180],
            [16.5150, 81.4980],
        ],
    },
    {
        "id": "ZONE-GODAVARI-CANAL-BLOCK",
        "name": "Low-Lying Canal Bund Road Breach",
        "region": "West Godavari District",
        "state": "Andhra Pradesh",
        "type": "ROAD_BLOCKAGE",
        "riskLevel": "CRITICAL",
        "riskScore": 94,
        "severity": "CRITICAL",
        "source": "APSDMA Emergency Road Infrastructure Bulletin",
        "center": {"lat": 16.5320, "lng": 81.5080},
        "radiusMeters": 450.0,
        "polygon": [
            [16.5360, 81.5020],
            [16.5380, 81.5140],
            [16.5260, 81.5160],
            [16.5240, 81.5040],
        ],
    },
    {
        "id": "ZONE-MACHERLA-GHAT",
        "name": "Nagarjuna Sagar Ghat Ingress Obstruction",
        "region": "Palnadu District",
        "state": "Andhra Pradesh",
        "type": "ROAD_BLOCKAGE",
        "riskLevel": "CRITICAL",
        "riskScore": 95,
        "severity": "CRITICAL",
        "source": "State Highway Patrol Real-Time Road Closure Notice",
        "center": {"lat": 16.4920, "lng": 79.4180},
        "radiusMeters": 800.0,
        "polygon": [
            [16.5020, 79.4080],
            [16.5050, 79.4280],
            [16.4800, 79.4300],
            [16.4780, 79.4100],
        ],
    },

    # --- Kerala / Western Ghats / Wayanad / Munnar / Idukki / Kochi ---
    {
        "id": "ZONE-WAYANAD-RED",
        "name": "Chooralmala Slope Rupture Sector",
        "region": "Wayanad District",
        "state": "Kerala",
        "type": "LANDSLIDE",
        "riskLevel": "CRITICAL",
        "riskScore": 92,
        "severity": "CRITICAL",
        "source": "Geological Survey of India (GSI) Landslide Emergency Survey",
        "center": {"lat": 11.5362, "lng": 76.1308},
        "radiusMeters": 900.0,
        "polygon": [
            [11.550, 76.115],
            [11.555, 76.145],
            [11.525, 76.155],
            [11.515, 76.120],
        ],
    },
    {
        "id": "ZONE-MUNNAR-ORANGE",
        "name": "Munnar Valley High Risk Sector",
        "region": "Idukki District",
        "state": "Kerala",
        "type": "LANDSLIDE",
        "riskLevel": "HIGH",
        "riskScore": 84,
        "severity": "HIGH",
        "source": "KSDMA Telemetry Grid & Slope Pore-Water Gauge",
        "center": {"lat": 10.0889, "lng": 77.0595},
        "radiusMeters": 800.0,
        "polygon": [
            [10.105, 77.040],
            [10.110, 77.075],
            [10.070, 77.080],
            [10.065, 77.045],
        ],
    },
    {
        "id": "ZONE-KOCHI-INUNDATION",
        "name": "Periyar River Lowland Flood Inundation",
        "region": "Ernakulam District",
        "state": "Kerala",
        "type": "FLASH_FLOOD",
        "riskLevel": "HIGH",
        "riskScore": 82,
        "severity": "HIGH",
        "source": "IMD Doppler & River Stage Hydrograph",
        "center": {"lat": 9.9720, "lng": 76.2850},
        "radiusMeters": 1100.0,
        "polygon": [
            [9.9850, 76.2700],
            [9.9900, 76.3000],
            [9.9550, 76.3050],
            [9.9500, 76.2750],
        ],
    },

    # --- Himachal Pradesh / Shimla / Manali / Kullu ---
    {
        "id": "ZONE-SHIMLA-ORANGE",
        "name": "Shimla Urban Slope Slump Zone",
        "region": "Shimla District",
        "state": "Himachal Pradesh",
        "type": "LANDSLIDE",
        "riskLevel": "HIGH",
        "riskScore": 76,
        "severity": "HIGH",
        "source": "HPSDMA Geo-Technical Sensor Network",
        "center": {"lat": 31.1048, "lng": 77.1734},
        "radiusMeters": 750.0,
        "polygon": [
            [31.118, 77.155],
            [31.120, 77.190],
            [31.090, 77.195],
            [31.088, 77.160],
        ],
    },
    {
        "id": "ZONE-MANALI-BEAS",
        "name": "Beas River Torrent Flash Inundation Zone",
        "region": "Kullu District",
        "state": "Himachal Pradesh",
        "type": "FLASH_FLOOD",
        "riskLevel": "CRITICAL",
        "riskScore": 91,
        "severity": "CRITICAL",
        "source": "CWC Catchment Flood Stage Warning",
        "center": {"lat": 32.2350, "lng": 77.1850},
        "radiusMeters": 950.0,
        "polygon": [
            [32.2500, 77.1720],
            [32.2520, 77.2000],
            [32.2200, 77.2020],
            [32.2180, 77.1750],
        ],
    },

    # --- Tamil Nadu / Chennai ---
    {
        "id": "ZONE-CHENNAI-SURGE",
        "name": "Adyar Estuary Storm Surge Coastal Inundation",
        "region": "Chennai District",
        "state": "Tamil Nadu",
        "type": "CYCLONE",
        "riskLevel": "HIGH",
        "riskScore": 80,
        "severity": "HIGH",
        "source": "INCOIS Coastal Storm Surge Telemetry",
        "center": {"lat": 13.0100, "lng": 80.2600},
        "radiusMeters": 1200.0,
        "polygon": [
            [13.0250, 80.2450],
            [13.0300, 80.2780],
            [12.9950, 80.2800],
            [12.9900, 80.2500],
        ],
    },

    # --- West Bengal / Darjeeling ---
    {
        "id": "ZONE-DARJEELING-YELLOW",
        "name": "Paglajhora Moderate Advisory Polygon",
        "region": "Darjeeling District",
        "state": "West Bengal",
        "type": "LANDSLIDE",
        "riskLevel": "ELEVATED",
        "riskScore": 58,
        "severity": "MEDIUM",
        "source": "GSI Sub-Divisional Hazard Mapping",
        "center": {"lat": 26.9854, "lng": 88.2831},
        "radiusMeters": 650.0,
        "polygon": [
            [27.000, 88.265],
            [27.005, 88.300],
            [26.965, 88.305],
            [26.960, 88.270],
        ],
    },
]

# -------------------------------------------------------------------------
# GEOMETRIC POLYGON & LINESTRING INTERSECTION UTILITIES
# -------------------------------------------------------------------------

def is_point_in_polygon(lat: float, lng: float, polygon: List[List[float]]) -> bool:
    """Ray-casting algorithm to determine if a point (lat, lng) is inside a polygon."""
    num_pts = len(polygon)
    if num_pts < 3:
        return False

    inside = False
    p1_lat, p1_lng = polygon[0]

    for i in range(1, num_pts + 1):
        p2_lat, p2_lng = polygon[i % num_pts]
        if min(p1_lat, p2_lat) < lat <= max(p1_lat, p2_lat):
            if lng <= max(p1_lng, p2_lng):
                if p1_lat != p2_lat:
                    x_inters = (lat - p1_lat) * (p2_lng - p1_lng) / (p2_lat - p1_lat) + p1_lng
                if p1_lng == p2_lng or lng <= x_inters:
                    inside = not inside
        p1_lat, p1_lng = p2_lat, p2_lng

    return inside

def orientation(p: Tuple[float, float], q: Tuple[float, float], r: Tuple[float, float]) -> int:
    val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])
    if abs(val) < 1e-12:
        return 0
    return 1 if val > 0 else 2

def on_segment(p: Tuple[float, float], q: Tuple[float, float], r: Tuple[float, float]) -> bool:
    return min(p[0], r[0]) <= q[0] <= max(p[0], r[0]) and min(p[1], r[1]) <= q[1] <= max(p[1], r[1])

def do_segments_intersect(
    p1: Tuple[float, float], q1: Tuple[float, float],
    p2: Tuple[float, float], q2: Tuple[float, float]
) -> bool:
    o1 = orientation(p1, q1, p2)
    o2 = orientation(p1, q1, q2)
    o3 = orientation(p2, q2, p1)
    o4 = orientation(p2, q2, q1)

    if o1 != o2 and o3 != o4:
        return True

    if o1 == 0 and on_segment(p1, p2, q1): return True
    if o2 == 0 and on_segment(p1, q2, q1): return True
    if o3 == 0 and on_segment(p2, p1, q2): return True
    if o4 == 0 and on_segment(p2, q1, q2): return True

    return False

def check_segment_polygon_intersection(
    seg_start: Tuple[float, float],
    seg_end: Tuple[float, float],
    polygon: List[List[float]]
) -> bool:
    # 1. Check if either endpoint is inside polygon
    if is_point_in_polygon(seg_start[0], seg_start[1], polygon) or is_point_in_polygon(seg_end[0], seg_end[1], polygon):
        return True

    # 2. Check if segment crosses any polygon edge
    num_pts = len(polygon)
    for i in range(num_pts):
        edge_start = (polygon[i][0], polygon[i][1])
        edge_end = (polygon[(i + 1) % num_pts][0], polygon[(i + 1) % num_pts][1])
        if do_segments_intersect(seg_start, seg_end, edge_start, edge_end):
            return True

    return False

# -------------------------------------------------------------------------
# MULTI-HAZARD ROUTE SAFETY EVALUATOR
# -------------------------------------------------------------------------

class RouteSafetyService:
    """
    Evaluates multi-hazard intersection, affected distance, severity penalties,
    classifies routes (SAFE, CAUTION, DANGEROUS, BLOCKED), and prioritizes life safety.
    """

    def get_all_hazard_zones(self, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        """Collects static multi-hazard zones plus dynamic database alerts."""
        zones = [dict(z) for z in ACTIVE_HAZARD_ZONES]

        if db is not None:
            try:
                stations = db.query(Station).filter(Station.status == "active").all()
                for stn in stations:
                    has_critical_alert = any(a.alert_level in {"CRITICAL", "HIGH"} and not a.is_acknowledged for a in stn.alerts)
                    if has_critical_alert:
                        zones.append({
                            "id": f"STN-HAZARD-{stn.id}",
                            "name": f"{stn.name} Alert Epicenter",
                            "region": stn.region or "Regional Sector",
                            "state": stn.state or "India",
                            "type": "LANDSLIDE",
                            "riskLevel": "CRITICAL",
                            "riskScore": 92,
                            "severity": "CRITICAL",
                            "source": f"Station {stn.id} Live Telemetry Surcharge",
                            "center": {"lat": stn.latitude, "lng": stn.longitude},
                            "radiusMeters": 500.0,
                            "polygon": None,
                        })
            except Exception as e:
                logger.warning(f"[RouteSafety] Error querying dynamic station hazard zones: {e}")

        return zones

    def evaluate_route_safety(
        self,
        candidate_routes: List[Dict[str, Any]],
        hazard_zones: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Evaluates geometric hazard intersection for each candidate route,
        computes affected hazard distance (km), applies severity penalties,
        and assigns status (SAFE, CAUTION, DANGEROUS, BLOCKED).
        """
        evaluated_routes = []

        for route_idx, route in enumerate(candidate_routes):
            waypoints = route.get("waypoints", [])
            steps = route.get("steps", [])
            dist_km = route.get("distanceKm", 0.0)

            min_dist_to_hazard = float("inf")
            hazard_records: Dict[str, Dict[str, Any]] = {}
            total_hazard_exposure_m = 0.0
            highest_severity = "NONE"

            # Check every road segment in the route against all active hazard zones
            for i in range(len(waypoints) - 1):
                p1 = (waypoints[i][0], waypoints[i][1])
                p2 = (waypoints[i + 1][0], waypoints[i + 1][1])
                seg_length = haversine_distance_m(p1[0], p1[1], p2[0], p2[1])

                for hz in hazard_zones:
                    poly = hz.get("polygon")
                    center = hz["center"]
                    radius = hz.get("radiusMeters", 600.0)
                    hz_type = hz.get("type", "LANDSLIDE")
                    hz_sev = hz.get("severity", hz.get("riskLevel", "HIGH"))

                    mid_lat = (p1[0] + p2[0]) / 2.0
                    mid_lng = (p1[1] + p2[1]) / 2.0
                    dist_to_center = haversine_distance_m(mid_lat, mid_lng, center["lat"], center["lng"])

                    if dist_to_center < min_dist_to_hazard:
                        min_dist_to_hazard = dist_to_center

                    is_intersecting = False
                    if poly and len(poly) >= 3:
                        is_intersecting = check_segment_polygon_intersection(p1, p2, poly)
                    else:
                        is_intersecting = dist_to_center <= radius

                    if is_intersecting:
                        hz_id = hz["id"]
                        if hz_id not in hazard_records:
                            hazard_records[hz_id] = {
                                "id": hz_id,
                                "type": hz_type,
                                "name": hz["name"],
                                "severity": hz_sev,
                                "source": hz.get("source", "NDMA Disaster GIS Catalog"),
                                "affected_distance_meters": 0.0,
                            }
                        hazard_records[hz_id]["affected_distance_meters"] += seg_length
                        total_hazard_exposure_m += seg_length

                        # Update highest severity
                        if hz_sev == "CRITICAL":
                            highest_severity = "CRITICAL"
                        elif hz_sev == "HIGH" and highest_severity != "CRITICAL":
                            highest_severity = "HIGH"
                        elif hz_sev in {"MEDIUM", "MODERATE"} and highest_severity not in {"CRITICAL", "HIGH"}:
                            highest_severity = "MEDIUM"
                        elif hz_sev == "LOW" and highest_severity == "NONE":
                            highest_severity = "LOW"

            # Check if destination shelter itself is inside a critical hazard zone
            dest_pt = waypoints[-1] if waypoints else (0, 0)
            dest_in_hazard = any(
                (hz.get("polygon") and is_point_in_polygon(dest_pt[0], dest_pt[1], hz["polygon"]))
                or (haversine_distance_m(dest_pt[0], dest_pt[1], hz["center"]["lat"], hz["center"]["lng"]) < hz.get("radiusMeters", 500.0))
                for hz in hazard_zones if hz.get("severity") in {"CRITICAL", "HIGH"}
            )

            # Format hazard list
            hazards_list = []
            for h in hazard_records.values():
                hazards_list.append({
                    "id": h["id"],
                    "type": h["type"],
                    "name": h["name"],
                    "severity": h["severity"],
                    "affected_distance_km": round(h["affected_distance_meters"] / 1000.0, 2),
                    "source": h["source"],
                })

            total_hazard_exposure_km = round(total_hazard_exposure_m / 1000.0, 2)

            # -----------------------------------------------------------------
            # STRICT SEVERITY CLASSIFICATION RULES
            # -----------------------------------------------------------------
            # 1. CRITICAL hazard exposure or Road Blockage -> BLOCKED (Score < 30)
            # 2. HIGH hazard exposure (> 0.4 km) -> DANGEROUS (Score 30-50)
            # 3. MEDIUM hazard exposure or nearby buffer (< 400m) -> CAUTION (Score 55-75)
            # 4. No hazard exposure -> SAFE (Score 88-98)
            if dest_in_hazard or highest_severity == "CRITICAL" or any(h["type"] == "ROAD_BLOCKAGE" for h in hazards_list):
                route_status = "BLOCKED"
                safety_score = max(10, min(28, int(30 - (total_hazard_exposure_km * 3))))
                route_safety = "BLOCKED"
                is_safe = False
                label = "BLOCKED — DO NOT TRAVEL"
            elif highest_severity == "HIGH" or total_hazard_exposure_km >= 0.5:
                route_status = "DANGEROUS"
                safety_score = max(30, min(52, int(55 - (total_hazard_exposure_km * 4))))
                route_safety = "DANGEROUS"
                is_safe = False
                label = "DANGEROUS — AVOID THIS ROUTE"
            elif highest_severity in {"MEDIUM", "MODERATE"} or total_hazard_exposure_km > 0 or min_dist_to_hazard < 500.0:
                route_status = "CAUTION"
                safety_score = max(58, min(75, int(75 - (total_hazard_exposure_km * 2))))
                route_safety = "CAUTION"
                is_safe = True
                label = "CAUTION — ELEVATED HAZARD NEARBY"
            else:
                route_status = "SAFE"
                bonus = min(8, int(min_dist_to_hazard / 300.0)) if min_dist_to_hazard != float("inf") else 6
                safety_score = min(99, max(88, 90 + bonus))
                route_safety = "SAFE"
                is_safe = True
                label = "SAFE CORRIDOR"

            # Turn-by-Turn Steps hazard annotations
            evaluated_steps = []
            for s in steps:
                step_copy = dict(s)
                if route_status in {"BLOCKED", "DANGEROUS"}:
                    step_copy["status"] = "DANGER"
                    hazard_types_str = ", ".join(set(h["type"] for h in hazards_list)) or "Hazard"
                    step_copy["hazardNote"] = f"WARNING: Segment traverses active {hazard_types_str} zone."
                elif route_status == "CAUTION":
                    step_copy["status"] = "CAUTION"
                    step_copy["hazardNote"] = "Advisory: Proceed with extreme caution; secondary buffer."
                else:
                    step_copy["status"] = "SAFE"
                evaluated_steps.append(step_copy)

            eval_route = dict(route)
            eval_route["route_id"] = route.get("route_id", f"route_{route_idx + 1}")
            eval_route["status"] = route_status
            eval_route["routeSafety"] = route_safety
            eval_route["safety_score"] = safety_score
            eval_route["safetyScore"] = safety_score
            eval_route["status_label"] = label
            eval_route["isSafe"] = is_safe
            eval_route["hazard_exposure_km"] = total_hazard_exposure_km
            eval_route["hazardExposureMeters"] = round(total_hazard_exposure_m, 1)
            eval_route["hazardProximityMeters"] = round(min_dist_to_hazard, 1) if min_dist_to_hazard != float("inf") else 3500.0
            eval_route["hazards"] = hazards_list
            eval_route["steps"] = evaluated_steps

            evaluated_routes.append(eval_route)

        # -----------------------------------------------------------------
        # ROUTE RECOMMENDATION LOGIC (Safety Has Priority Over Distance!)
        # -----------------------------------------------------------------
        # 1. BLOCKED routes -> Reject
        # 2. DANGEROUS routes -> Reject
        # 3. Prefer highest safety score
        # 4. Among similarly safe routes -> prefer shorter travel time/distance
        def recommendation_rank(r):
            status_penalty = {
                "SAFE": 0,
                "CAUTION": 1,
                "DANGEROUS": 10,
                "BLOCKED": 100,
            }
            # Penalty by status, then negative safety score (so highest score comes first), then duration
            return (status_penalty.get(r["status"], 50), -r["safety_score"], r.get("durationSeconds", 0))

        evaluated_routes.sort(key=recommendation_rank)

        # Set recommendation flag:
        # The top-ranked route (if safe/caution) is recommended.
        has_safe_route = any(r["status"] in {"SAFE", "CAUTION"} for r in evaluated_routes)
        for idx, r in enumerate(evaluated_routes):
            if idx == 0 and has_safe_route and r["status"] in {"SAFE", "CAUTION"}:
                r["recommended"] = True
                r["isRecommended"] = True
                r["route_type"] = "RECOMMENDED_SAFE"
            elif r["status"] == "SAFE":
                r["recommended"] = False
                r["isRecommended"] = False
                r["route_type"] = "SAFE_ALTERNATIVE"
            elif r["status"] == "CAUTION":
                r["recommended"] = False
                r["isRecommended"] = False
                r["route_type"] = "CAUTION_ROUTE"
            elif r["status"] == "DANGEROUS":
                r["recommended"] = False
                r["isRecommended"] = False
                r["route_type"] = "DANGEROUS_ROUTE"
            else: # BLOCKED
                r["recommended"] = False
                r["isRecommended"] = False
                r["route_type"] = "BLOCKED_ROUTE"

        return evaluated_routes

route_safety_service = RouteSafetyService()
