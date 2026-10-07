from __future__ import annotations
import os
import math
import json
import logging
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional, Tuple, Union

from app.core.config import settings

logger = logging.getLogger(__name__)

def decode_google_polyline(polyline_str: str) -> List[List[float]]:
    """
    Decodes a Google encoded polyline string into an exact list of [latitude, longitude] pairs.
    """
    index, lat, lng = 0, 0, 0
    coordinates: List[List[float]] = []
    length = len(polyline_str)
    
    while index < length:
        shift, result = 0, 0
        while True:
            if index >= length:
                break
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        shift, result = 0, 0
        while True:
            if index >= length:
                break
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng

        coordinates.append([round(lat / 1e5, 6), round(lng / 1e5, 6)])
        
    return coordinates

def encode_polyline(points: List[List[float]]) -> str:
    """Encodes a list of [lat, lng] coordinates into a standard encoded polyline string."""
    result = []
    prev_lat = 0
    prev_lng = 0
    for lat, lng in points:
        late5 = int(round(lat * 1e5))
        lnge5 = int(round(lng * 1e5))
        dlat = late5 - prev_lat
        dlng = lnge5 - prev_lng
        prev_lat = late5
        prev_lng = lnge5

        for d in (dlat, dlng):
            val = ~(d << 1) if d < 0 else (d << 1)
            while val >= 0x20:
                result.append(chr((0x20 | (val & 0x1f)) + 63))
                val >>= 5
            result.append(chr(val + 63))
    return "".join(result)

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in meters."""
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def normalize_travel_mode(mode: str) -> str:
    """Normalizes travel mode string to DRIVE, WALK, or BICYCLE."""
    m = (mode or "DRIVE").strip().upper()
    if m in ["WALK", "WALKING", "PEDESTRIAN", "FOOT"]:
        return "WALK"
    if m in ["BICYCLE", "BIKE", "CYCLING", "CYCLE"]:
        return "BICYCLE"
    if m in ["DRIVE", "DRIVING", "CAR", "AUTO", "VEHICLE"]:
        return "DRIVE"
    return "DRIVE"

class RoutingService:
    """
    Production Multi-Modal Routing Service for Evacuation Route Calculation.
    Queries Google Routes API v2 or specialized OpenStreetMap road/pathway engines (OSRM)
    to obtain actual mode-specific routes for:
    - 🚶 WALK (Footways, pedestrian paths, walkable roads)
    - 🚲 BICYCLE (Cycleways, bike lanes, bicycle-compatible routes)
    - 🚗 DRIVE (Vehicle-accessible roads, highways)
    """

    def __init__(self):
        self.google_routes_url = "https://routes.googleapis.com/directions/v2:computeRoutes"
        self.osrm_drive_url = "https://router.project-osrm.org/route/v1/driving"
        self.osrm_walk_url = "https://routing.openstreetmap.de/routed-foot/route/v1/driving"
        self.osrm_bike_url = "https://routing.openstreetmap.de/routed-bike/route/v1/driving"

    @property
    def google_api_key(self) -> str:
        return (
            os.getenv("GOOGLE_ROUTES_API_KEY")
            or os.getenv("GOOGLE_MAPS_API_KEY")
            or getattr(settings, "gemini_api_key", "")
            or os.getenv("GEMINI_API_KEY", "")
        ).strip()

    def get_route(
        self,
        origin: Union[Dict[str, float], Tuple[float, float], List[float]],
        destination: Union[Dict[str, float], Tuple[float, float], List[float]],
        travel_mode: str = "DRIVE"
    ) -> Optional[Dict[str, Any]]:
        """
        Calculates the primary real route for the specified travel mode (DRIVE, WALK, BICYCLE).
        """
        orig_lat, orig_lng = self._parse_coord(origin)
        dest_lat, dest_lng = self._parse_coord(destination)
        routes = self.compute_routes(orig_lat, orig_lng, dest_lat, dest_lng, travel_mode=travel_mode, compute_alternatives=False)
        return routes[0] if routes else None

    def get_alternative_routes(
        self,
        origin: Union[Dict[str, float], Tuple[float, float], List[float]],
        destination: Union[Dict[str, float], Tuple[float, float], List[float]],
        travel_mode: str = "DRIVE"
    ) -> List[Dict[str, Any]]:
        """
        Calculates alternative real routes for the specified travel mode.
        """
        orig_lat, orig_lng = self._parse_coord(origin)
        dest_lat, dest_lng = self._parse_coord(destination)
        routes = self.compute_routes(orig_lat, orig_lng, dest_lat, dest_lng, travel_mode=travel_mode, compute_alternatives=True)
        return routes[1:] if len(routes) > 1 else []

    def compute_routes(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        travel_mode: str = "DRIVE",
        compute_alternatives: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Computes real mode-specific road/pathway routes between origin and destination.
        Returns a list of parsed candidate routes (Primary + Alternatives).
        """
        norm_mode = normalize_travel_mode(travel_mode)

        # 1. Try Google Routes API v2 first
        if self.google_api_key:
            google_routes = self._call_google_routes_api(
                origin_lat, origin_lng, dest_lat, dest_lng, norm_mode, compute_alternatives
            )
            if google_routes:
                logger.info(f"[RoutingService] Fetched {len(google_routes)} {norm_mode} routes from Google Routes API v2.")
                return google_routes

        # 2. Fallback to OpenStreetMap / OSRM Mode-Specific Router
        logger.info(f"[RoutingService] Calling OSRM Multi-Modal Router for mode: {norm_mode}...")
        osrm_routes = self._call_osrm_router(
            origin_lat, origin_lng, dest_lat, dest_lng, norm_mode, compute_alternatives
        )
        if osrm_routes:
            logger.info(f"[RoutingService] Fetched {len(osrm_routes)} {norm_mode} routes from OSRM.")
            return osrm_routes

        logger.error(f"[RoutingService] No route found for mode '{norm_mode}' between ({origin_lat}, {origin_lng}) and ({dest_lat}, {dest_lng})")
        return []

    def _parse_coord(self, coord: Union[Dict[str, float], Tuple[float, float], List[float]]) -> Tuple[float, float]:
        if isinstance(coord, dict):
            lat = coord.get("latitude", coord.get("lat", 0.0))
            lng = coord.get("longitude", coord.get("lng", 0.0))
            return float(lat), float(lng)
        elif isinstance(coord, (list, tuple)) and len(coord) >= 2:
            return float(coord[0]), float(coord[1])
        raise ValueError(f"Invalid coordinate format: {coord}")

    def _call_google_routes_api(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        travel_mode: str,
        compute_alternatives: bool,
    ) -> Optional[List[Dict[str, Any]]]:
        """Calls Google Routes API v2 computeRoutes endpoint with mode-specific payload."""
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.google_api_key,
                "X-Goog-FieldMask": (
                    "routes.duration,"
                    "routes.distanceMeters,"
                    "routes.polyline.encodedPolyline,"
                    "routes.legs.steps,"
                    "routes.legs.distanceMeters,"
                    "routes.legs.duration,"
                    "routes.routeLabels"
                ),
            }

            body: Dict[str, Any] = {
                "origin": {
                    "location": {
                        "latLng": {"latitude": origin_lat, "longitude": origin_lng}
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {"latitude": dest_lat, "longitude": dest_lng}
                    }
                },
                "travelMode": travel_mode,
                "computeAlternativeRoutes": compute_alternatives,
            }

            # Only DRIVE supports routingPreference in Google Routes API v2
            if travel_mode == "DRIVE":
                body["routingPreference"] = "TRAFFIC_AWARE"

            req = urllib.request.Request(
                self.google_routes_url,
                data=json.dumps(body).encode("utf-8"),
                headers=headers,
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=6) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    raw_routes = data.get("routes", [])
                    if not raw_routes:
                        return None

                    parsed_routes = []
                    for idx, r in enumerate(raw_routes):
                        distance_m = float(r.get("distanceMeters", 0))
                        dur_str = r.get("duration", "0s")
                        duration_sec = float(dur_str.rstrip("s")) if "s" in dur_str else 0.0

                        encoded = r.get("polyline", {}).get("encodedPolyline", "")
                        waypoints = decode_google_polyline(encoded) if encoded else []
                        if not waypoints:
                            continue

                        steps = []
                        legs = r.get("legs", [])
                        step_num = 1
                        for leg in legs:
                            for raw_step in leg.get("steps", []):
                                nav_instruction = (
                                    raw_step.get("navigationInstruction", {}).get("instructions")
                                    or raw_step.get("instructions")
                                    or f"Proceed along path for {int(raw_step.get('distanceMeters', 100))}m"
                                )
                                step_dist = int(raw_step.get("distanceMeters", 0))
                                steps.append({
                                    "stepNumber": step_num,
                                    "instruction": nav_instruction,
                                    "distanceMeters": step_dist,
                                    "status": "SAFE",
                                })
                                step_num += 1

                        if not steps:
                            mode_desc = "pedestrian pathway" if travel_mode == "WALK" else ("bicycle corridor" if travel_mode == "BICYCLE" else "road corridor")
                            steps = [{
                                "stepNumber": 1,
                                "instruction": f"Proceed along {mode_desc} directly to relief safe zone.",
                                "distanceMeters": int(distance_m),
                                "status": "SAFE",
                            }]

                        parsed_routes.append({
                            "routeIndex": idx,
                            "isAlternative": idx > 0,
                            "travelMode": travel_mode,
                            "provider": f"Google Routes API v2 ({travel_mode})",
                            "distanceMeters": distance_m,
                            "distanceKm": round(distance_m / 1000.0, 2),
                            "durationSeconds": duration_sec,
                            "estimatedTimeMin": max(1, round(duration_sec / 60.0)),
                            "polyline": encoded,
                            "waypoints": waypoints,
                            "steps": steps,
                        })

                    return parsed_routes
        except Exception as exc:
            logger.info(f"[RoutingService] Google Routes API attempt note ({travel_mode}): {exc}")
            return None

    def _call_osrm_router(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        travel_mode: str,
        compute_alternatives: bool,
    ) -> Optional[List[Dict[str, Any]]]:
        """Calls OpenStreetMap OSRM profile routing engine (Driving, Foot/Walking, Bicycle)."""
        alt_param = "true" if compute_alternatives else "false"

        # Select provider URL by travel mode
        if travel_mode == "WALK":
            primary_url = f"{self.osrm_walk_url}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true&alternatives={alt_param}"
            fallback_url = f"{self.osrm_drive_url}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true&alternatives={alt_param}"
            provider_label = "Pedestrian Footway Router (OSRM Foot)"
            mode_verb = "Walk"
        elif travel_mode == "BICYCLE":
            primary_url = f"{self.osrm_bike_url}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true&alternatives={alt_param}"
            fallback_url = f"{self.osrm_drive_url}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true&alternatives={alt_param}"
            provider_label = "Bicycle Path Router (OSRM Bike)"
            mode_verb = "Cycle"
        else: # DRIVE
            primary_url = f"{self.osrm_drive_url}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true&alternatives={alt_param}"
            fallback_url = None
            provider_label = "Road Network Navigation Engine (OSRM Drive)"
            mode_verb = "Head"

        # Try primary mode router
        routes = self._fetch_osrm_endpoint(primary_url, travel_mode, provider_label, mode_verb)
        
        # Fallback if specific foot/bike server is down
        if not routes and fallback_url:
            logger.warning(f"[RoutingService] Mode-specific server unavailable for {travel_mode}, adapting driving network geometry.")
            routes = self._fetch_osrm_endpoint(fallback_url, travel_mode, f"{provider_label} (Adapted)", mode_verb, speed_mode=travel_mode)

        # If compute_alternatives is requested and only 1 route was returned, query alternative corridors via real road network
        if routes and compute_alternatives and len(routes) == 1:
            try:
                base_router_url = primary_url.split("?")[0].rsplit("/", 1)[0]
                d_lat = dest_lat - origin_lat
                d_lng = dest_lng - origin_lng
                mid_lat = (origin_lat + dest_lat) / 2.0
                mid_lng = (origin_lng + dest_lng) / 2.0

                # Perpendicular offset for alternative arterial corridor
                perp_lat1 = -d_lng * 0.08
                perp_lng1 = d_lat * 0.08
                alt_via_url1 = f"{base_router_url}/{origin_lng},{origin_lat};{round(mid_lng + perp_lng1, 6)},{round(mid_lat + perp_lat1, 6)};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true"
                alt_res1 = self._fetch_osrm_endpoint(alt_via_url1, travel_mode, f"{provider_label} (Corridor B)", mode_verb, speed_mode=speed_mode if travel_mode != "DRIVE" else None)
                if alt_res1 and alt_res1[0]["waypoints"]:
                    alt_route = alt_res1[0]
                    alt_route["routeIndex"] = 1
                    alt_route["isAlternative"] = True
                    routes.append(alt_route)

                # Secondary reverse offset for alternative corridor C
                perp_lat2 = d_lng * 0.08
                perp_lng2 = -d_lat * 0.08
                alt_via_url2 = f"{base_router_url}/{origin_lng},{origin_lat};{round(mid_lng + perp_lat2, 6)},{round(mid_lat + perp_lng2, 6)};{dest_lng},{dest_lat}?overview=full&geometries=geojson&steps=true"
                alt_res2 = self._fetch_osrm_endpoint(alt_via_url2, travel_mode, f"{provider_label} (Corridor C)", mode_verb, speed_mode=speed_mode if travel_mode != "DRIVE" else None)
                if alt_res2 and alt_res2[0]["waypoints"]:
                    alt_route2 = alt_res2[0]
                    alt_route2["routeIndex"] = len(routes)
                    alt_route2["isAlternative"] = True
                    routes.append(alt_route2)
            except Exception as e:
                logger.debug(f"[RoutingService] Note on secondary corridor queries: {e}")

        if routes:
            return routes

        return None

    def _fetch_osrm_endpoint(
        self,
        url: str,
        travel_mode: str,
        provider_label: str,
        mode_verb: str,
        speed_mode: Optional[str] = None,
    ) -> Optional[List[Dict[str, Any]]]:
        """Performs HTTP request to OSRM endpoint and parses routes, geojson waypoints, and maneuvers."""
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "LandslideGuardAIService/1.0 (disaster-response@landslideguard.org)"},
            )

            with urllib.request.urlopen(req, timeout=6) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    if data.get("code") != "Ok":
                        return None

                    raw_routes = data.get("routes", [])
                    parsed_routes = []

                    for idx, r in enumerate(raw_routes):
                        distance_m = float(r.get("distance", 0))
                        duration_sec = float(r.get("duration", 0))

                        # If adapting from driving profile to walk/bike speeds:
                        if speed_mode == "WALK":
                            # Average walking speed ~ 4.5 km/h = 1.25 m/s
                            duration_sec = distance_m / 1.25
                        elif speed_mode == "BICYCLE":
                            # Average cycling speed ~ 15 km/h = 4.16 m/s
                            duration_sec = distance_m / 4.16

                        geojson_coords = r.get("geometry", {}).get("coordinates", [])
                        waypoints = [[round(pt[1], 6), round(pt[0], 6)] for pt in geojson_coords]
                        if not waypoints:
                            continue

                        # Extract mode-appropriate maneuvers
                        steps = []
                        step_num = 1
                        legs = r.get("legs", [])
                        for leg in legs:
                            for s in leg.get("steps", []):
                                road_name = s.get("name") or ("Pedestrian Path" if travel_mode == "WALK" else ("Cycleway" if travel_mode == "BICYCLE" else "Connecting Road"))
                                maneuver = s.get("maneuver", {}).get("type", "turn")
                                modifier = s.get("maneuver", {}).get("modifier", "")
                                dist = int(s.get("distance", 0))

                                if maneuver == "depart":
                                    instruction = f"{mode_verb} {modifier or 'forward'} on {road_name} away from hazard sector."
                                elif maneuver == "arrive":
                                    instruction = f"Arrive at Safe Relief Center entrance on {road_name}."
                                elif modifier:
                                    instruction = f"Turn {modifier.replace('_', ' ')} onto {road_name}."
                                else:
                                    instruction = f"Continue on {road_name}."

                                steps.append({
                                    "stepNumber": step_num,
                                    "instruction": instruction,
                                    "distanceMeters": dist,
                                    "status": "SAFE",
                                })
                                step_num += 1

                        if not steps:
                            mode_desc = "footway" if travel_mode == "WALK" else ("cycleway" if travel_mode == "BICYCLE" else "road network")
                            steps = [{
                                "stepNumber": 1,
                                "instruction": f"Follow {mode_desc} directly to relief shelter.",
                                "distanceMeters": int(distance_m),
                                "status": "SAFE",
                            }]

                        parsed_routes.append({
                            "routeIndex": idx,
                            "isAlternative": idx > 0,
                            "travelMode": travel_mode,
                            "provider": provider_label,
                            "distanceMeters": distance_m,
                            "distanceKm": round(distance_m / 1000.0, 2),
                            "durationSeconds": duration_sec,
                            "estimatedTimeMin": max(1, round(duration_sec / 60.0)),
                            "polyline": encode_polyline(waypoints),
                            "waypoints": waypoints,
                            "steps": steps,
                        })

                    return parsed_routes
        except Exception as exc:
            logger.debug(f"[RoutingService] OSRM fetch attempt note ({url}): {exc}")
            return None

# Global Singleton Instance
routing_service = RoutingService()

# Module-level convenience functions
def get_route(origin: Any, destination: Any, travel_mode: str = "DRIVE") -> Optional[Dict[str, Any]]:
    return routing_service.get_route(origin, destination, travel_mode)

def get_alternative_routes(origin: Any, destination: Any, travel_mode: str = "DRIVE") -> List[Dict[str, Any]]:
    return routing_service.get_alternative_routes(origin, destination, travel_mode)
