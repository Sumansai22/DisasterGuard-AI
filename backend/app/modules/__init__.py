"""
DisasterGuard AI — Multi-Hazard Disaster Management Platform Core Modules
========================================================================
Pillar 1: Location Services (Geocoding, Open-Meteo, Stations, Context)
Pillar 2: Hazards Engine (Multi-Hazard, Random Forest, U-Net, Gemini, Alerts)
Pillar 3: Response Engine (Routing Corridors, Shelters, Drone Rescue)
"""

from .location import location_services
from .hazards import hazards_engine
from .response import response_engine

__all__ = ["location_services", "hazards_engine", "response_engine"]
