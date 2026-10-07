from __future__ import annotations
import math
from typing import List, Optional, Dict, Any, Union, Tuple
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.routing_service import routing_service, normalize_travel_mode, haversine_distance_m
from app.services.route_safety import route_safety_service, ACTIVE_HAZARD_ZONES
from app.services.geocoding_service import geocoding_service

router = APIRouter()

# Comprehensive Master Catalog of Emergency Shelters / Safehouses with Real Coordinates Across India
ALL_EMERGENCY_SHELTERS = [
    # --- Andhra Pradesh / Palnadu / Macherla / Guntur / Bhimavaram / Godavari ---
    {
        "id": "SAFE-AP-BV-01",
        "name": "Bhimavaram DNR College Emergency Cyclone & Disaster Shelter",
        "type": "Higher Ground College Complex",
        "latitude": 16.5480,
        "longitude": 81.5250,
        "capacity": 3000,
        "current_occupancy": 450,
        "facilities": ["High Elevation Staging", "Clean Drinking Water", "Medical Dispensary", "Helipad Access"],
        "phone": "+91 8816 223400",
        "status": "OPEN",
    },
    {
        "id": "SAFE-AP-BV-02",
        "name": "Bhimavaram Town High Plateau Relief Center",
        "type": "Community Hall",
        "latitude": 16.5385,
        "longitude": 81.5360,
        "capacity": 2200,
        "current_occupancy": 310,
        "facilities": ["Community Kitchen", "Backup Power", "Emergency First Aid", "Sanitation Complex"],
        "phone": "+91 8816 225100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-AP-BV-03",
        "name": "Tadepalligudem Disaster Relief Base",
        "type": "Relief Camp",
        "latitude": 16.8120,
        "longitude": 81.5270,
        "capacity": 3500,
        "current_occupancy": 620,
        "facilities": ["SDRF Staging Ground", "Ambulance Hub", "Satellite Comms", "Water Filtration"],
        "phone": "+91 8818 221200",
        "status": "OPEN",
    },
    {
        "id": "SAFE-AP-01",
        "name": "Macherla Government Degree College Disaster Shelter",
        "type": "Relief Camp",
        "latitude": 16.4850,
        "longitude": 79.4350,
        "capacity": 1500,
        "current_occupancy": 320,
        "facilities": ["Emergency Medical Post", "Clean Drinking Water", "Solar Backup Generator", "Community Kitchen"],
        "phone": "+91 8642 222100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-AP-02",
        "name": "Nagarjuna Sagar High Plateau Relief Center",
        "type": "Community Hall",
        "latitude": 16.5750,
        "longitude": 79.3120,
        "capacity": 2000,
        "current_occupancy": 410,
        "facilities": ["High Ground Gathering", "Ambulance Station", "Clean Water Storage", "Helipad Access"],
        "phone": "+91 8642 277200",
        "status": "OPEN",
    },
    {
        "id": "SAFE-AP-03",
        "name": "Guntur District Disaster Management Staging Complex",
        "type": "Hospital Facility",
        "latitude": 16.3067,
        "longitude": 80.4365,
        "capacity": 3500,
        "current_occupancy": 800,
        "facilities": ["Trauma & ICU Unit", "SDRF Staging", "Satellite Communication", "Heavy Transport Depot"],
        "phone": "+91 863 2234100",
        "status": "OPEN",
    },

    # --- Tamil Nadu / Chennai / Nilgiris ---
    {
        "id": "SAFE-TN-01",
        "name": "Chennai Central Multi-Purpose Disaster Shelter",
        "type": "Community Hall",
        "latitude": 13.0835,
        "longitude": 80.2780,
        "capacity": 3000,
        "current_occupancy": 650,
        "facilities": ["Disaster Response Command", "Medical Clinic", "Clean Water Purification", "Emergency Kitchen"],
        "phone": "+91 44 2538 4100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-TN-02",
        "name": "Jawaharlal Nehru Indoor Stadium Relief Complex",
        "type": "Higher Ground Stadium",
        "latitude": 13.0852,
        "longitude": 80.2725,
        "capacity": 4500,
        "current_occupancy": 890,
        "facilities": ["Large Capacity Gathering", "Helipad Access", "Backup Power", "SDRF Staging Base"],
        "phone": "+91 44 2536 2200",
        "status": "OPEN",
    },
    {
        "id": "SAFE-TN-03",
        "name": "Guindy Emergency Relief Staging Facility",
        "type": "Hospital Facility",
        "latitude": 13.0067,
        "longitude": 80.2025,
        "capacity": 2500,
        "current_occupancy": 510,
        "facilities": ["Trauma Center", "Emergency Medical Ward", "Clean Water Reservoirs"],
        "phone": "+91 44 2235 1100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-TN-04",
        "name": "Coonoor Upper Plateau Relief Camp (Nilgiris)",
        "type": "Relief Camp",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "capacity": 1800,
        "current_occupancy": 390,
        "facilities": ["High Ridge Safety Zone", "Medical Station", "Blankets & Winter Stocks", "Clean Water"],
        "phone": "+91 423 2230100",
        "status": "OPEN",
    },

    # --- Kerala / Munnar / Idukki / Wayanad / Kochi ---
    {
        "id": "SAFE-02",
        "name": "Munnar Indoor Sports Complex & Center",
        "type": "Higher Ground Stadium",
        "latitude": 10.1250,
        "longitude": 77.0350,
        "capacity": 2500,
        "current_occupancy": 720,
        "facilities": ["Trauma Center", "Communication Node", "High Elevation Plateau", "Food Stocks"],
        "phone": "+91 4865 230400",
        "status": "OPEN",
    },
    {
        "id": "SAFE-KL-03",
        "name": "Devikulam Sub-Divisional Emergency Shelter",
        "type": "Community Hall",
        "latitude": 10.0620,
        "longitude": 77.1020,
        "capacity": 1600,
        "current_occupancy": 380,
        "facilities": ["Medical Post", "Heated Blankets", "Clean Water", "Solar Generator"],
        "phone": "+91 4865 264200",
        "status": "OPEN",
    },
    {
        "id": "SAFE-01",
        "name": "Government Higher Secondary Relief Camp",
        "type": "Relief Camp",
        "latitude": 11.5650,
        "longitude": 76.1050,
        "capacity": 1200,
        "current_occupancy": 430,
        "facilities": ["Medical Dispensary", "Clean Water", "Backup Generator", "Helipad", "Community Kitchen"],
        "phone": "+91 4936 202100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-KL-04",
        "name": "Kochi Coastal & Flood Emergency Shelter",
        "type": "Relief Camp",
        "latitude": 9.9650,
        "longitude": 76.2420,
        "capacity": 3000,
        "current_occupancy": 620,
        "facilities": ["Flood Barrier Gathering", "Water Purification", "Boat Rescue Staging", "Emergency Kitchen"],
        "phone": "+91 484 2215100",
        "status": "OPEN",
    },

    # --- Telangana / Hyderabad ---
    {
        "id": "SAFE-TS-01",
        "name": "Gachibowli High-Elevation Indoor Complex",
        "type": "Higher Ground Stadium",
        "latitude": 17.4435,
        "longitude": 78.3489,
        "capacity": 4500,
        "current_occupancy": 900,
        "facilities": ["Large Evacuation Arena", "Helipad Access", "Full Trauma Base", "Satellite Comms"],
        "phone": "+91 40 2300 4100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-TS-02",
        "name": "Secunderabad Disaster Response Center",
        "type": "Community Hall",
        "latitude": 17.4399,
        "longitude": 78.4983,
        "capacity": 2500,
        "current_occupancy": 450,
        "facilities": ["Medical Post", "Clean Water", "Emergency Blankets", "Generator Power"],
        "phone": "+91 40 2780 1200",
        "status": "OPEN",
    },

    # --- Karnataka / Bengaluru ---
    {
        "id": "SAFE-KA-01",
        "name": "Kanteerava Indoor Stadium Emergency Shelter",
        "type": "Higher Ground Stadium",
        "latitude": 12.9698,
        "longitude": 77.5927,
        "capacity": 4000,
        "current_occupancy": 600,
        "facilities": ["Disaster Gathering Arena", "Medical Clinic", "Clean Water Filtration", "Backup Power"],
        "phone": "+91 80 2221 4100",
        "status": "OPEN",
    },

    # --- Himachal Pradesh / Shimla / Kullu / Manali ---
    {
        "id": "SAFE-03",
        "name": "Shimla Central Multi-Purpose Shelter",
        "type": "Community Hall",
        "latitude": 31.0850,
        "longitude": 77.1450,
        "capacity": 1500,
        "current_occupancy": 310,
        "facilities": ["Heating System", "Ambulance Station", "Satellite Phone Link", "Blanket Stocks"],
        "phone": "+91 177 2801200",
        "status": "OPEN",
    },
    {
        "id": "SAFE-HP-02",
        "name": "Kullu Valley Emergency Relief Center",
        "type": "Relief Camp",
        "latitude": 31.9579,
        "longitude": 77.1095,
        "capacity": 1800,
        "current_occupancy": 420,
        "facilities": ["High Ridge Safety Zone", "Medical Dispensary", "Clean Water", "Warm Clothing"],
        "phone": "+91 1902 222100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-HP-03",
        "name": "Manali High Ridge Disaster Staging Complex",
        "type": "Community Hall",
        "latitude": 32.2396,
        "longitude": 77.1887,
        "capacity": 1400,
        "current_occupancy": 290,
        "facilities": ["Winter Shelter Heating", "Medical Aid Post", "Clean Water Tank", "Satellite Node"],
        "phone": "+91 1902 252100",
        "status": "OPEN",
    },

    # --- Uttarakhand / Chamoli / Dehradun ---
    {
        "id": "SAFE-05",
        "name": "Chamoli Disaster Management Staging Complex",
        "type": "Hospital Facility",
        "latitude": 30.4100,
        "longitude": 79.3300,
        "capacity": 3000,
        "current_occupancy": 890,
        "facilities": ["ICU & Surgical Trauma", "SDRF Staging", "Helicopter Evacuation"],
        "phone": "+91 1372 252200",
        "status": "OPEN",
    },
    {
        "id": "SAFE-UK-02",
        "name": "Dehradun Parade Ground Relief Staging Camp",
        "type": "Relief Camp",
        "latitude": 30.3244,
        "longitude": 78.0416,
        "capacity": 2800,
        "current_occupancy": 540,
        "facilities": ["High Plateau Safe Gathering", "Medical Support Post", "Clean Water", "Solar Generator"],
        "phone": "+91 135 2712100",
        "status": "OPEN",
    },

    # --- West Bengal / Darjeeling / Sikkim ---
    {
        "id": "SAFE-04",
        "name": "Darjeeling Gorkha Hill Relief Facility",
        "type": "Relief Camp",
        "latitude": 27.0420,
        "longitude": 88.2650,
        "capacity": 1800,
        "current_occupancy": 510,
        "facilities": ["Medical Station", "Helipad", "Water Purification", "Emergency Blankets"],
        "phone": "+91 354 2252100",
        "status": "OPEN",
    },
    {
        "id": "SAFE-SK-01",
        "name": "Gangtok Paljor Stadium Emergency Relief Center",
        "type": "Higher Ground Stadium",
        "latitude": 27.3389,
        "longitude": 88.6065,
        "capacity": 2600,
        "current_occupancy": 480,
        "facilities": ["High Plateau Safe Zone", "Medical Trauma Post", "Clean Water", "Satellite Link"],
        "phone": "+91 3592 202100",
        "status": "OPEN",
    },

    # --- Maharashtra / Mumbai ---
    {
        "id": "SAFE-MH-01",
        "name": "Bandra Kurla Complex Emergency Evacuation Center",
        "type": "Community Hall",
        "latitude": 19.0660,
        "longitude": 72.8680,
        "capacity": 4000,
        "current_occupancy": 750,
        "facilities": ["Disaster Command Post", "Large Arena Gathering", "Medical Hospital Link", "Clean Water"],
        "phone": "+91 22 2659 4100",
        "status": "OPEN",
    },
]

VALID_TRAVEL_MODES = {"DRIVE", "WALK", "BICYCLE", "CAR", "WALKING", "BIKE", "PEDESTRIAN", "CYCLE"}

class LocationPoint(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    formatted_address: Optional[str] = None

class RouteCalculationRequest(BaseModel):
    origin: Optional[Union[LocationPoint, Dict[str, Any]]] = None
    destination: Optional[Union[LocationPoint, Dict[str, Any]]] = None
    originLat: Optional[float] = None
    originLng: Optional[float] = None
    safehouse_id: Optional[str] = None
    safeZoneId: Optional[str] = None
    travel_mode: Optional[str] = Field("DRIVE", description="Travel mode: DRIVE, WALK, or BICYCLE")
    travelMode: Optional[str] = None
    destLat: Optional[float] = None
    destLng: Optional[float] = None
    originName: Optional[str] = None
    destName: Optional[str] = None

def extract_coord(obj: Any, flat_lat: Optional[float], flat_lng: Optional[float]) -> Tuple[Optional[float], Optional[float], Optional[str]]:
    if obj is not None:
        if isinstance(obj, dict):
            lat = obj.get("latitude", obj.get("lat"))
            lng = obj.get("longitude", obj.get("lng"))
            name = obj.get("name", obj.get("formatted_address"))
            if lat is not None and lng is not None:
                return float(lat), float(lng), name
        elif hasattr(obj, "latitude") or hasattr(obj, "lat"):
            lat = getattr(obj, "latitude", None) if getattr(obj, "latitude", None) is not None else getattr(obj, "lat", None)
            lng = getattr(obj, "longitude", None) if getattr(obj, "longitude", None) is not None else getattr(obj, "lng", None)
            name = getattr(obj, "name", None)
            if lat is not None and lng is not None:
                return float(lat), float(lng), name

    if flat_lat is not None and flat_lng is not None:
        return float(flat_lat), float(flat_lng), None

    return None, None, None

def format_shelter_item(s: Dict[str, Any], dist_km: Optional[float] = None) -> Dict[str, Any]:
    lat = s.get("latitude", s.get("location", {}).get("lat", 0.0))
    lng = s.get("longitude", s.get("location", {}).get("lng", 0.0))
    cap = s.get("capacity", s.get("capacityTotal", 1000))
    occ = s.get("current_occupancy", s.get("capacityOccupied", 0))
    avail = max(0, cap - occ)

    status_str = "SAFE"
    if avail <= 0:
        status_str = "FULL"
    elif avail < cap * 0.2:
        status_str = "LIMITED"

    return {
        "id": s["id"],
        "name": s["name"],
        "type": s.get("type", "Relief Camp"),
        "latitude": lat,
        "longitude": lng,
        "location": {"lat": lat, "lng": lng},
        "distance_km": round(dist_km, 1) if dist_km is not None else None,
        "distanceKm": round(dist_km, 1) if dist_km is not None else None,
        "capacity": cap,
        "capacityTotal": cap,
        "current_occupancy": occ,
        "capacityOccupied": occ,
        "available_capacity": avail,
        "availableCapacity": avail,
        "facilities": s.get("facilities", ["Clean Water", "Medical Station"]),
        "phone": s.get("phone", s.get("contactNumber", "+91 112")),
        "contactNumber": s.get("phone", s.get("contactNumber", "+91 112")),
        "status": status_str,
        "isAvailable": avail > 0,
    }

def get_nearby_shelters_for_coords(
    ref_lat: float,
    ref_lng: float,
    radius_km: float = 120.0,
    max_results: int = 6
) -> List[Dict[str, Any]]:
    """
    Computes geodesic distance to all emergency shelters from (ref_lat, ref_lng),
    filters by search radius, and sorts by availability and proximity.
    """
    shelters_with_dist = []
    for s in ALL_EMERGENCY_SHELTERS:
        s_lat = s["latitude"]
        s_lng = s["longitude"]
        dist_m = haversine_distance_m(ref_lat, ref_lng, s_lat, s_lng)
        dist_km = dist_m / 1000.0
        shelters_with_dist.append((s, dist_km))

    # Filter within radius
    within_radius = [pair for pair in shelters_with_dist if pair[1] <= radius_km]

    # If none within primary radius, expand up to 250km
    if not within_radius:
        within_radius = [pair for pair in shelters_with_dist if pair[1] <= 250.0]

    # If still none (e.g. custom remote area), take the closest available shelters
    if not within_radius:
        within_radius = sorted(shelters_with_dist, key=lambda p: p[1])[:3]

    # Sort priority: Available + Safe (0) > Limited (1) > Full (2), then distance
    def shelter_sort_key(pair):
        s, d = pair
        cap = s.get("capacity", 1000)
        occ = s.get("current_occupancy", 0)
        avail = cap - occ
        priority = 0 if avail > (cap * 0.2) else (1 if avail > 0 else 2)
        return (priority, d)

    within_radius.sort(key=shelter_sort_key)

    formatted_results = [format_shelter_item(s, dist_km) for s, dist_km in within_radius[:max_results]]
    return formatted_results

@router.get("/shelters", summary="List Emergency Safe Shelters Filtered by Location")
@router.get("/safe-zones", summary="Alias for safe-zones with location filtering")
def get_safe_zones(
    latitude: Optional[float] = Query(None, description="Reference origin latitude"),
    longitude: Optional[float] = Query(None, description="Reference origin longitude"),
    radius_km: Optional[float] = Query(120.0, description="Search radius in kilometers"),
):
    """
    Returns emergency shelters filtered geographically relative to the user's reference location.
    Calculates exact geodesic distance, available capacity, and safety ranking.
    """
    if latitude is not None and longitude is not None:
        if -90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0:
            nearby = get_nearby_shelters_for_coords(latitude, longitude, radius_km=radius_km or 120.0)
            return {"shelters": nearby, "results": nearby}
    
    # If no coordinates provided, return default catalog with capacities
    default_list = [format_shelter_item(s) for s in ALL_EMERGENCY_SHELTERS[:6]]
    return {"shelters": default_list, "results": default_list}

@router.get("/search-place", summary="Search place names and geocode to real coordinates")
@router.get("/search-places", summary="Alias for search-place")
def search_places(q: str = Query(..., min_length=2, description="Place or address query")):
    """
    Returns real geographic locations with exact latitude/longitude coordinates
    from OpenStreetMap Nominatim and disaster monitoring index.
    """
    results = geocoding_service.search_places(q)
    return {"results": results}

@router.get("/hazard-zones", summary="List Active Landslide Hazard Polygons & Epicenters")
def get_hazard_zones(db: Session = Depends(get_db)):
    """Returns active landslide risk zones and buffers checked during route safety computation."""
    return route_safety_service.get_all_hazard_zones(db)

@router.post("/routes", summary="Compute Multi-Modal Road/Pathway Evacuation Routes & Evaluate Safety")
@router.post("/route", summary="Alias for Compute Evacuation Route")
def calculate_evacuation_routes(
    req: RouteCalculationRequest,
    db: Session = Depends(get_db),
):
    """
    Computes real road-following routes between FROM and TO for WALK, BICYCLE, or DRIVE.
    Runs geometric hazard checks and returns dynamic route metrics and steps.
    """
    # 1. Parse Origin Coordinates & Name
    origin_lat, origin_lng, origin_name = extract_coord(req.origin, req.originLat, req.originLng)
    if origin_lat is None or origin_lng is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a starting location (origin coordinates required)."
        )

    # Validate Origin coordinates
    if not (-90.0 <= origin_lat <= 90.0 and -180.0 <= origin_lng <= 180.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid starting coordinates: ({origin_lat}, {origin_lng}). Latitude must be [-90, 90], Longitude [-180, 180]."
        )

    origin_name = origin_name or req.originName or "Selected Origin Location"

    # 2. Validate & Normalize Travel Mode
    raw_mode = (req.travel_mode or req.travelMode or "DRIVE").strip()
    if raw_mode.upper() not in VALID_TRAVEL_MODES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid travel_mode '{raw_mode}'. Allowed values: 'DRIVE', 'WALK', 'BICYCLE'"
        )
    travel_mode = normalize_travel_mode(raw_mode)

    # 3. Determine Destination Coordinates & Safehouse
    dest_lat, dest_lng, dest_name = extract_coord(req.destination, req.destLat, req.destLng)
    dest_name = dest_name or req.destName

    safehouse_key = req.safehouse_id or req.safeZoneId
    target_safe_zone = None

    if safehouse_key:
        found_s = next((s for s in ALL_EMERGENCY_SHELTERS if s["id"] == safehouse_key), None)
        if found_s:
            dist_m = haversine_distance_m(origin_lat, origin_lng, found_s["latitude"], found_s["longitude"])
            target_safe_zone = format_shelter_item(found_s, dist_m / 1000.0)
            dest_lat = target_safe_zone["latitude"]
            dest_lng = target_safe_zone["longitude"]
            dest_name = target_safe_zone["name"]

    if dest_lat is None or dest_lng is None:
        # Geographically select the nearest available emergency shelter relative to origin
        nearby_shelters = get_nearby_shelters_for_coords(origin_lat, origin_lng, radius_km=150.0, max_results=1)
        if nearby_shelters:
            target_safe_zone = nearby_shelters[0]
            dest_lat = target_safe_zone["latitude"]
            dest_lng = target_safe_zone["longitude"]
            dest_name = target_safe_zone["name"]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No emergency shelters found nearby. Please select a destination location.",
            )

    # Validate Destination coordinates
    if not (-90.0 <= dest_lat <= 90.0 and -180.0 <= dest_lng <= 180.0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid destination coordinates: ({dest_lat}, {dest_lng}). Latitude must be [-90, 90], Longitude [-180, 180]."
        )

    # 4. Check if origin and destination are identical
    if math.hypot(dest_lat - origin_lat, dest_lng - origin_lng) < 0.0001:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Starting location and destination must be different."
        )

    if not target_safe_zone:
        # Check if custom destination matches an existing shelter in our database
        matching_shelter = next((
            s for s in ALL_EMERGENCY_SHELTERS
            if math.hypot(s["latitude"] - dest_lat, s["longitude"] - dest_lng) < 0.005
        ), None)

        if matching_shelter:
            dist_m = haversine_distance_m(origin_lat, origin_lng, matching_shelter["latitude"], matching_shelter["longitude"])
            target_safe_zone = format_shelter_item(matching_shelter, dist_m / 1000.0)
        else:
            dist_m = haversine_distance_m(origin_lat, origin_lng, dest_lat, dest_lng)
            target_safe_zone = {
                "id": "CUSTOM-DESTINATION",
                "name": dest_name or "Custom Selected Destination",
                "type": "Custom Destination",
                "latitude": dest_lat,
                "longitude": dest_lng,
                "location": {"lat": dest_lat, "lng": dest_lng},
                "distance_km": round(dist_m / 1000.0, 1),
                "distanceKm": round(dist_m / 1000.0, 1),
                "capacity": 1000,
                "capacityTotal": 1000,
                "current_occupancy": 0,
                "capacityOccupied": 0,
                "available_capacity": 1000,
                "availableCapacity": 1000,
                "facilities": ["Designated Location"],
                "phone": "112",
                "contactNumber": "112",
                "status": "SAFE",
                "isAvailable": True,
            }

    # 5. Obtain real mode-specific routes from Routing Provider
    candidate_routes = routing_service.compute_routes(
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        dest_lat=dest_lat,
        dest_lng=dest_lng,
        travel_mode=travel_mode,
        compute_alternatives=True,
    )

    if not candidate_routes:
        mode_label = "WALKING" if travel_mode == "WALK" else ("BICYCLE" if travel_mode == "BICYCLE" else "DRIVING")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"NO {mode_label} ROUTE AVAILABLE between {origin_name} and {dest_name}.",
        )

    # 6. Check mode-specific routes against active landslide & hazard zones
    hazard_zones = route_safety_service.get_all_hazard_zones(db)
    evaluated_routes = route_safety_service.evaluate_route_safety(candidate_routes, hazard_zones)

    primary_route = evaluated_routes[0]
    alternatives = evaluated_routes[1:] if len(evaluated_routes) > 1 else []

    all_blocked = all(r["routeSafety"] == "BLOCKED" for r in evaluated_routes)
    is_safe_route_available = not all_blocked

    route_status = primary_route["routeSafety"]
    if route_status == "MODERATE_HAZARD":
        route_status = "CAUTION"

    nav_steps = primary_route.get("steps", [])

    # Prepare routes array with all evaluated candidates
    formatted_routes = []
    for idx, r in enumerate(evaluated_routes):
        formatted_routes.append({
            "route_id": r.get("route_id", f"route_{idx + 1}"),
            "route_index": idx,
            "name": (
                "Recommended Safe Evacuation Corridor"
                if r.get("recommended")
                else (
                    "Safe Alternative Route"
                    if r.get("status") == "SAFE"
                    else (
                        "Caution Route (Near Hazard Buffer)"
                        if r.get("status") == "CAUTION"
                        else (
                            "DANGEROUS — AVOID THIS ROUTE"
                            if r.get("status") == "DANGEROUS"
                            else "BLOCKED — DO NOT TRAVEL"
                        )
                    )
                )
            ),
            "geometry": r.get("waypoints", []),
            "waypoints": r.get("waypoints", []),
            "polyline": r.get("polyline", ""),
            "distance_km": r.get("distanceKm", 0.0),
            "distanceKm": r.get("distanceKm", 0.0),
            "duration_minutes": r.get("estimatedTimeMin", 0),
            "estimatedTimeMin": r.get("estimatedTimeMin", 0),
            "duration_seconds": r.get("durationSeconds", 0),
            "safety_score": r.get("safety_score", 90),
            "safetyScore": r.get("safety_score", 90),
            "status": r.get("status", "SAFE"),
            "routeSafety": r.get("status", "SAFE"),
            "status_label": r.get("status_label", "SAFE CORRIDOR"),
            "recommended": r.get("recommended", False),
            "isRecommended": r.get("recommended", False),
            "hazard_exposure_km": r.get("hazard_exposure_km", 0.0),
            "hazardExposureMeters": r.get("hazardExposureMeters", 0.0),
            "hazard_proximity_meters": r.get("hazardProximityMeters", 0.0),
            "hazardProximityMeters": r.get("hazardProximityMeters", 0.0),
            "hazards": r.get("hazards", []),
            "hazard_intersections": r.get("hazardIntersections", []),
            "hazardIntersections": r.get("hazardIntersections", []),
            "closest_hazard_name": r.get("closestHazardName"),
            "closestHazardName": r.get("closestHazardName"),
            "navigation_steps": r.get("steps", []),
            "steps": r.get("steps", []),
            "provider": r.get("provider", f"Road Network Routing Engine ({travel_mode})"),
        })

    dangerous_routes = [r for r in formatted_routes if r["status"] in {"DANGEROUS", "BLOCKED"}]
    caution_routes = [r for r in formatted_routes if r["status"] == "CAUTION"]
    has_dangerous = len(dangerous_routes) > 0

    warning_summary = {
        "has_dangerous_routes": has_dangerous,
        "dangerous_routes_count": len(dangerous_routes),
        "caution_routes_count": len(caution_routes),
        "recommended_route_id": primary_route.get("route_id", "route_1"),
        "warning_message": (
            f"DANGEROUS ROUTE DETECTED: {len(dangerous_routes)} route(s) intersect active hazard/blocked sectors. Follow the Recommended Green Corridor."
            if has_dangerous
            else "All evaluated escape corridors are verified clear of active hazard polygons."
        ),
    }

    # Filter regional hazard zones near origin / destination (within 80km)
    regional_hazard_zones = []
    for hz in hazard_zones:
        c = hz["center"]
        d_orig = haversine_distance_m(origin_lat, origin_lng, c["lat"], c["lng"]) / 1000.0
        d_dest = haversine_distance_m(dest_lat, dest_lng, c["lat"], c["lng"]) / 1000.0
        if d_orig <= 80.0 or d_dest <= 80.0:
            regional_hazard_zones.append(hz)

    response_payload = {
        # Comprehensive multi-route collection
        "routes": formatted_routes,
        "hazard_zones": regional_hazard_zones or hazard_zones[:4],
        "warning_summary": warning_summary,

        # Strict user-specified schema & primary route
        "origin": {
            "name": origin_name,
            "latitude": origin_lat,
            "longitude": origin_lng,
            "formatted_address": origin_name,
        },
        "destination": {
            "name": dest_name or target_safe_zone["name"],
            "latitude": dest_lat,
            "longitude": dest_lng,
            "formatted_address": dest_name or target_safe_zone["name"],
        },
        "travel_mode": travel_mode,
        "route": {
            "distance_km": primary_route["distanceKm"],
            "duration_minutes": primary_route["estimatedTimeMin"],
            "polyline": primary_route.get("polyline", ""),
            "navigation_steps": nav_steps,
        },
        "safety": {
            "status": primary_route["status"],
            "score": primary_route["safety_score"],
            "hazard_intersections": primary_route.get("hazardIntersections", []),
            "hazard_exposure_meters": primary_route.get("hazardExposureMeters", 0.0),
            "hazard_exposure_km": primary_route.get("hazard_exposure_km", 0.0),
            "hazard_proximity_meters": primary_route.get("hazardProximityMeters", 0.0),
            "closest_hazard_name": primary_route.get("closestHazardName"),
            "hazards": primary_route.get("hazards", []),
        },
        "alternatives": [
            {
                "route_id": alt.get("route_id"),
                "route_index": alt.get("routeIndex"),
                "distance_km": alt["distanceKm"],
                "duration_minutes": alt["estimatedTimeMin"],
                "status": alt.get("status", "SAFE"),
                "safety_status": alt.get("status", "SAFE"),
                "safety_score": alt.get("safety_score", 90),
                "hazard_exposure_km": alt.get("hazard_exposure_km", 0.0),
                "hazards": alt.get("hazards", []),
                "hazard_intersections": alt.get("hazardIntersections", []),
                "waypoints": alt["waypoints"],
                "geometry": alt["waypoints"],
                "navigation_steps": alt["steps"],
            }
            for alt in alternatives
        ],

        # Direct fields for maximum backward compatibility
        "id": f"ROUTE-{travel_mode}-{int(primary_route.get('distanceMeters', 0))}-{primary_route.get('safety_score')}",
        "affectedZoneId": "ACTIVE-ORIGIN",
        "affectedZoneName": origin_name,
        "originCoordinates": {"lat": origin_lat, "lng": origin_lng},
        "targetSafeZone": target_safe_zone,
        "travelMode": travel_mode,
        "distance_km": primary_route["distanceKm"],
        "distanceKm": primary_route["distanceKm"],
        "distanceMeters": primary_route["distanceMeters"],
        "duration_minutes": primary_route["estimatedTimeMin"],
        "estimatedTimeMin": primary_route["estimatedTimeMin"],
        "durationSeconds": primary_route["durationSeconds"],
        "polyline": primary_route.get("polyline", ""),
        "routeSafety": primary_route["status"],
        "safety_score": primary_route["safety_score"],
        "safetyScore": primary_route["safety_score"],
        "status": primary_route["status"],
        "hazard_intersections": primary_route.get("hazardIntersections", []),
        "hazardIntersections": primary_route.get("hazardIntersections", []),
        "hazard_exposure_meters": primary_route.get("hazardExposureMeters", 0.0),
        "hazardExposureMeters": primary_route.get("hazardExposureMeters", 0.0),
        "hazard_exposure_km": primary_route.get("hazard_exposure_km", 0.0),
        "hazard_proximity_meters": primary_route.get("hazardProximityMeters", 0.0),
        "hazardProximityMeters": primary_route.get("hazardProximityMeters", 0.0),
        "closest_hazard_name": primary_route.get("closestHazardName"),
        "closestHazardName": primary_route.get("closestHazardName"),
        "routingProvider": primary_route["provider"],
        "waypoints": primary_route["waypoints"],
        "navigation_steps": nav_steps,
        "steps": nav_steps,
        "is_safe_route_available": is_safe_route_available,
        "isSafeRouteAvailable": is_safe_route_available,
        "isSimulation": False,
        "generatedAt": "2026-10-06T12:00:00Z",
    }

    return response_payload
