"""
Location Services Module
========================
Handles geocoding, real-world place search, weather APIs, and telemetry stations.
"""

from app.services.geocoding_service import geocoding_service

class LocationServices:
    def __init__(self):
        self.geocoding = geocoding_service

    async def search_places(self, query: str, limit: int = 8):
        return await self.geocoding.search_places(query, limit=limit)

    async def reverse_geocode(self, lat: float, lng: float):
        return await self.geocoding.reverse_geocode(lat, lng)

    def get_popular_locations(self):
        return self.geocoding.get_popular_locations()

location_services = LocationServices()
