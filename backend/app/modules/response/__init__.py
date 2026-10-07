"""
Response Engine Module
======================
Handles evacuation route calculation with safety classification,
location-based safe shelters, critical infrastructure GIS, and search & rescue dispatch.
"""

from app.services.routing_service import routing_service
from app.services.route_safety import route_safety_service
from app.services.drone_incident_service import drone_incident_service

class ResponseEngine:
    def __init__(self):
        self.routing = routing_service
        self.safety_evaluator = route_safety_service
        self.incidents = drone_incident_service

    async def calculate_evacuation(self, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float, hazard_type: str = "ALL"):
        return await self.routing.calculate_evacuation_routes(origin_lat, origin_lng, dest_lat, dest_lng, hazard_type=hazard_type)

    def get_safe_shelters(self, lat: float, lng: float, radius_km: float = 30.0):
        return self.routing.get_nearby_safehouses(lat, lng, radius_km=radius_km)

    def dispatch_rescue_alert(self, payload: dict):
        return self.incidents.dispatch_alert(payload)

response_engine = ResponseEngine()
