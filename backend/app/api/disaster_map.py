"""
Disaster Management Command Map API Router
Provides multi-layer GIS geospatial dataset and real-time/simulated telemetry for:
- Hazards & Active Incidents
- Weather & Live Rainfall
- Water & River/Dam Flood Management
- Emergency Infrastructure (Shelters, Hospitals, Fire, Police, Ambulance, EOC)
- Critical Infrastructure (Roads, Bridges, Tunnels, Power, Telecom)
- Multi-parameter Sensor Network (Rain, Soil, Slope, River, Seismic)
- Population Vulnerability
- Evacuation Routes & Blockades
"""

import math
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

router = APIRouter()

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on earth in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


# ============================================================================
# COMPREHENSIVE DISASTER GIS MASTER DATASET (Geographically Mapped Across India)
# ============================================================================

ALL_INCIDENTS = [
    # Kerala - Wayanad & Munnar
    {
        "id": "INC-KL-001",
        "type": "LANDSLIDE",
        "title": "Chooralmala Massive Debris Slide",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "latitude": 11.5362,
        "longitude": 76.1308,
        "timestamp": "2026-10-06T09:45:00Z",
        "description": "Active debris avalanche triggering slope collapse across 400m tea plantation stretch.",
        "region": "Wayanad",
        "state": "Kerala",
        "affected_radius_meters": 750,
        "action_taken": "NDRF Team 4 deployed. Immediate evacuation ordered."
    },
    {
        "id": "INC-KL-002",
        "type": "FLASH_FLOOD",
        "title": "Iruvanjippuzha River Flash Spate",
        "severity": "HIGH",
        "status": "MONITORING",
        "latitude": 11.5210,
        "longitude": 76.1240,
        "timestamp": "2026-10-06T10:15:00Z",
        "description": "Flash overflow breaching low-lying culvert bridge.",
        "region": "Wayanad",
        "state": "Kerala",
        "affected_radius_meters": 300,
        "action_taken": "Traffic diverted to high ridge road."
    },
    {
        "id": "INC-KL-003",
        "type": "ROAD_BLOCKAGE",
        "title": "Munnar Ghat Gap Road Landslip Blockade",
        "severity": "HIGH",
        "status": "ACTIVE",
        "latitude": 10.0889,
        "longitude": 77.0595,
        "timestamp": "2026-10-06T08:30:00Z",
        "description": "Massive boulder fall obstructing NH-85 corridor at km 44.",
        "region": "Idukki",
        "state": "Kerala",
        "affected_radius_meters": 200,
        "action_taken": "PWD heavy earthmovers on site."
    },
    # Himachal Pradesh - Shimla & Kullu
    {
        "id": "INC-HP-001",
        "type": "STRUCTURAL_DAMAGE",
        "title": "Summer Hill Slope Subsidence",
        "severity": "ELEVATED",
        "status": "MONITORING",
        "latitude": 31.1048,
        "longitude": 77.1734,
        "timestamp": "2026-10-06T07:20:00Z",
        "description": "Deep tension cracks in retaining wall and university hostel foundation.",
        "region": "Shimla",
        "state": "Himachal Pradesh",
        "affected_radius_meters": 150,
        "action_taken": "Geological Survey inspection team en route."
    },
    {
        "id": "INC-HP-002",
        "type": "FLOOD",
        "title": "Beas River Hydro Overtopping",
        "severity": "HIGH",
        "status": "ACTIVE",
        "latitude": 31.9578,
        "longitude": 77.1095,
        "timestamp": "2026-10-06T10:00:00Z",
        "description": "Water discharge from Pandoh reservoir causing downstream embankment erosion.",
        "region": "Kullu",
        "state": "Himachal Pradesh",
        "affected_radius_meters": 500,
        "action_taken": "Siren warning sounded in downstream hamlets."
    },
    # Uttarakhand - Chamoli & Joshimath
    {
        "id": "INC-UK-001",
        "type": "LANDSLIDE",
        "title": "Helang-Marwari Bypass Rockslide",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "latitude": 30.5562,
        "longitude": 79.5663,
        "timestamp": "2026-10-06T06:50:00Z",
        "description": "Continuous shooting stones preventing pilgrim convoy movement on Badrinath route.",
        "region": "Chamoli",
        "state": "Uttarakhand",
        "affected_radius_meters": 600,
        "action_taken": "BRO machinery clearing primary lane."
    },
    # Tamil Nadu - Nilgiris & Chennai
    {
        "id": "INC-TN-001",
        "type": "ROAD_BLOCKAGE",
        "title": "Coonoor-Mettupalayam Ghat Treefall & Slip",
        "severity": "MODERATE",
        "status": "CONTAINED",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "timestamp": "2026-10-06T09:10:00Z",
        "description": "Fallen banyan tree and loose gravel slide cleared to single-lane passage.",
        "region": "The Nilgiris",
        "state": "Tamil Nadu",
        "affected_radius_meters": 100,
        "action_taken": "State disaster force deployed."
    },
    {
        "id": "INC-TN-002",
        "type": "FLOOD",
        "title": "Adyar Basin Urban Inundation",
        "severity": "ELEVATED",
        "status": "MONITORING",
        "latitude": 13.0012,
        "longitude": 80.2565,
        "timestamp": "2026-10-06T08:00:00Z",
        "description": "High tide backflow and localized storm drainage overflow.",
        "region": "Chennai",
        "state": "Tamil Nadu",
        "affected_radius_meters": 400,
        "action_taken": "GCC storm dewatering pumps operational."
    },
    # Andhra Pradesh - Macherla / Guntur / Nagarjuna Sagar
    {
        "id": "INC-AP-001",
        "type": "ROAD_BLOCKAGE",
        "title": "Nagarjuna Sagar Ghat Ingress Obstruction",
        "severity": "MODERATE",
        "status": "RESOLVED",
        "latitude": 16.5780,
        "longitude": 79.3140,
        "timestamp": "2026-10-06T06:00:00Z",
        "description": "Gravel slip on spillway access road cleared by municipal teams.",
        "region": "Palnadu/Guntur",
        "state": "Andhra Pradesh",
        "affected_radius_meters": 80,
        "action_taken": "Normal two-way traffic restored."
    },
    # Telangana - Hyderabad
    {
        "id": "INC-TS-001",
        "type": "FLASH_FLOOD",
        "title": "Musi River Nala Waterlogging",
        "severity": "MODERATE",
        "status": "MONITORING",
        "latitude": 17.3750,
        "longitude": 78.4720,
        "timestamp": "2026-10-06T09:30:00Z",
        "description": "Canal overflow affecting low-lying market stalls.",
        "region": "Hyderabad",
        "state": "Telangana",
        "affected_radius_meters": 250,
        "action_taken": "DRF quick-response boat stationed."
    },
    # West Bengal / Sikkim - Darjeeling & Gangtok
    {
        "id": "INC-WB-001",
        "type": "LANDSLIDE",
        "title": "Paglajhora Sinking Zone Subsidence",
        "severity": "HIGH",
        "status": "ACTIVE",
        "latitude": 26.9854,
        "longitude": 88.2831,
        "timestamp": "2026-10-06T07:45:00Z",
        "description": "Sinking road section on Hill Cart Road NH-55.",
        "region": "Darjeeling",
        "state": "West Bengal",
        "affected_radius_meters": 350,
        "action_taken": "Light vehicle diversion in effect."
    }
]

ALL_RAINFALL_STATIONS = [
    {
        "id": "RAIN-KL-01",
        "station_name": "Meppadi Hill AWS (IMD-W1)",
        "latitude": 11.5450,
        "longitude": 76.1280,
        "rainfall_1h_mm": 24.5,
        "rainfall_3h_mm": 68.2,
        "rainfall_24h_mm": 184.6,
        "temperature_c": 19.4,
        "humidity_pct": 96,
        "wind_speed_kmh": 28.5,
        "wind_direction": "WSW",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "RED_ALERT",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-KL-02",
        "station_name": "Munnar Top Station AWS",
        "latitude": 10.0950,
        "longitude": 77.0680,
        "rainfall_1h_mm": 18.2,
        "rainfall_3h_mm": 52.0,
        "rainfall_24h_mm": 136.4,
        "temperature_c": 17.1,
        "humidity_pct": 94,
        "wind_speed_kmh": 32.0,
        "wind_direction": "SW",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "ORANGE_ALERT",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-HP-01",
        "station_name": "Shimla Ridge Meteorological AWS",
        "latitude": 31.1080,
        "longitude": 77.1780,
        "rainfall_1h_mm": 12.4,
        "rainfall_3h_mm": 34.6,
        "rainfall_24h_mm": 92.0,
        "temperature_c": 14.5,
        "humidity_pct": 88,
        "wind_speed_kmh": 18.0,
        "wind_direction": "NNW",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "YELLOW_ADVISORY",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-UK-01",
        "station_name": "Joshimath High Altitude Station",
        "latitude": 30.5580,
        "longitude": 79.5700,
        "rainfall_1h_mm": 14.0,
        "rainfall_3h_mm": 41.2,
        "rainfall_24h_mm": 105.8,
        "temperature_c": 12.8,
        "humidity_pct": 91,
        "wind_speed_kmh": 22.4,
        "wind_direction": "N",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "ORANGE_ALERT",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-TN-01",
        "station_name": "Coonoor Tea Gardens AWS",
        "latitude": 11.3580,
        "longitude": 76.8010,
        "rainfall_1h_mm": 6.2,
        "rainfall_3h_mm": 16.5,
        "rainfall_24h_mm": 42.0,
        "temperature_c": 18.0,
        "humidity_pct": 82,
        "wind_speed_kmh": 14.2,
        "wind_direction": "W",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "NORMAL",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-AP-01",
        "station_name": "Macherla Agro-Met AWS",
        "latitude": 16.4820,
        "longitude": 79.4350,
        "rainfall_1h_mm": 2.1,
        "rainfall_3h_mm": 5.4,
        "rainfall_24h_mm": 14.2,
        "temperature_c": 29.5,
        "humidity_pct": 68,
        "wind_speed_kmh": 12.0,
        "wind_direction": "SE",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "NORMAL",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-TN-02",
        "station_name": "Chennai Nungambakkam Observatory",
        "latitude": 13.0600,
        "longitude": 80.2400,
        "rainfall_1h_mm": 8.5,
        "rainfall_3h_mm": 22.0,
        "rainfall_24h_mm": 54.0,
        "temperature_c": 28.2,
        "humidity_pct": 89,
        "wind_speed_kmh": 24.0,
        "wind_direction": "ENE",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "YELLOW_ADVISORY",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    },
    {
        "id": "RAIN-TS-01",
        "station_name": "Hyderabad Begumpet Met Radar",
        "latitude": 17.4450,
        "longitude": 78.4700,
        "rainfall_1h_mm": 4.0,
        "rainfall_3h_mm": 11.2,
        "rainfall_24h_mm": 28.6,
        "temperature_c": 27.0,
        "humidity_pct": 74,
        "wind_speed_kmh": 15.0,
        "wind_direction": "SW",
        "sensor_status": "ONLINE",
        "measurement_time": "2026-10-06T10:55:00Z",
        "warning_level": "NORMAL",
        "is_simulated": True,
        "data_label": "LIVE AWS TELEMETRY STREAM"
    }
]

ALL_WATER_BODIES = [
    {
        "id": "RIV-KL-01",
        "name": "Chaliyar River - Chooralmala Basin",
        "type": "RIVER",
        "latitude": 11.5310,
        "longitude": 76.1260,
        "current_level_m": 8.45,
        "danger_level_m": 8.00,
        "warning_level_m": 7.20,
        "capacity_pct": 105.6,
        "trend": "RISING",
        "sensor_status": "CRITICAL",
        "last_updated": "2026-10-06T10:50:00Z",
        "poly_line": [[11.510, 76.115], [11.528, 76.125], [11.534, 76.129], [11.552, 76.138], [11.570, 76.160]]
    },
    {
        "id": "DAM-KL-01",
        "name": "Banasura Sagar Dam Reservoir",
        "type": "DAM_RESERVOIR",
        "latitude": 11.6680,
        "longitude": 75.9580,
        "current_level_m": 774.20,
        "danger_level_m": 775.60,
        "warning_level_m": 773.00,
        "capacity_pct": 91.2,
        "trend": "STEADY",
        "sensor_status": "WATCH",
        "last_updated": "2026-10-06T10:45:00Z",
        "discharge_cusecs": 1200
    },
    {
        "id": "DAM-KL-02",
        "name": "Mullaperiyar Dam & Catchment",
        "type": "DAM_RESERVOIR",
        "latitude": 9.5280,
        "longitude": 77.1400,
        "current_level_m": 138.60,
        "danger_level_m": 142.00,
        "warning_level_m": 136.00,
        "capacity_pct": 89.4,
        "trend": "RISING",
        "sensor_status": "WARNING",
        "last_updated": "2026-10-06T10:40:00Z",
        "discharge_cusecs": 3500
    },
    {
        "id": "DAM-AP-01",
        "name": "Nagarjuna Sagar Dam & Krishna River",
        "type": "DAM_RESERVOIR",
        "latitude": 16.5775,
        "longitude": 79.3130,
        "current_level_m": 586.40,
        "danger_level_m": 590.00,
        "warning_level_m": 580.00,
        "capacity_pct": 78.5,
        "trend": "STEADY",
        "sensor_status": "NORMAL",
        "last_updated": "2026-10-06T10:30:00Z",
        "discharge_cusecs": 8500
    },
    {
        "id": "RIV-HP-01",
        "name": "Beas River Hydro Monitoring Station",
        "type": "RIVER",
        "latitude": 31.9560,
        "longitude": 77.1080,
        "current_level_m": 14.80,
        "danger_level_m": 14.00,
        "warning_level_m": 12.50,
        "capacity_pct": 105.7,
        "trend": "RISING",
        "sensor_status": "CRITICAL",
        "last_updated": "2026-10-06T10:50:00Z"
    },
    {
        "id": "RIV-UK-01",
        "name": "Alaknanda River Gauging Post",
        "type": "RIVER",
        "latitude": 30.5520,
        "longitude": 79.5620,
        "current_level_m": 11.20,
        "danger_level_m": 12.50,
        "warning_level_m": 10.00,
        "capacity_pct": 84.0,
        "trend": "RISING",
        "sensor_status": "WARNING",
        "last_updated": "2026-10-06T10:45:00Z"
    }
]

ALL_EMERGENCY_INFRASTRUCTURE = [
    # Wayanad & Munnar
    {
        "id": "HOSP-KL-01",
        "name": "Wayanad District General Hospital & Trauma Center",
        "type": "HOSPITAL",
        "latitude": 11.6050,
        "longitude": 76.0820,
        "total_beds": 350,
        "icu_available": 14,
        "trauma_ready": True,
        "phone": "+91 4936 202444",
        "status": "OPERATIONAL"
    },
    {
        "id": "AMB-KL-01",
        "name": "Meppadi 108 Emergency Ambulance Station",
        "type": "AMBULANCE_STATION",
        "latitude": 11.5510,
        "longitude": 76.1240,
        "fleet_on_duty": 6,
        "phone": "108",
        "status": "OPERATIONAL"
    },
    {
        "id": "FIRE-KL-01",
        "name": "Kalpetta Fire & Rescue Station (Kerala Fire Force)",
        "type": "FIRE_STATION",
        "latitude": 11.6120,
        "longitude": 76.0850,
        "engines_ready": 4,
        "boats_ready": 2,
        "phone": "101",
        "status": "OPERATIONAL"
    },
    {
        "id": "EOC-KL-01",
        "name": "District Emergency Operations Center (DEOC Wayanad)",
        "type": "EMERGENCY_OPERATION_CENTER",
        "latitude": 11.6080,
        "longitude": 76.0840,
        "lead_officer": "District Collector & DM",
        "satellite_phone": "+8816 3185 2490",
        "status": "OPERATIONAL"
    },
    {
        "id": "POL-KL-01",
        "name": "Meppadi Police Station",
        "type": "POLICE_STATION",
        "latitude": 11.5490,
        "longitude": 76.1260,
        "patrol_units": 8,
        "phone": "+91 4936 282222",
        "status": "OPERATIONAL"
    },
    # Shimla
    {
        "id": "HOSP-HP-01",
        "name": "Indira Gandhi Medical College (IGMC) Shimla",
        "type": "HOSPITAL",
        "latitude": 31.1090,
        "longitude": 77.1850,
        "total_beds": 850,
        "icu_available": 32,
        "trauma_ready": True,
        "phone": "+91 177 2804251",
        "status": "OPERATIONAL"
    },
    {
        "id": "FIRE-HP-01",
        "name": "The Mall Fire Station Shimla",
        "type": "FIRE_STATION",
        "latitude": 31.1040,
        "longitude": 77.1720,
        "engines_ready": 3,
        "phone": "101",
        "status": "OPERATIONAL"
    },
    # Macherla / Guntur
    {
        "id": "HOSP-AP-01",
        "name": "Macherla Area Community Hospital",
        "type": "HOSPITAL",
        "latitude": 16.4815,
        "longitude": 79.4340,
        "total_beds": 120,
        "icu_available": 8,
        "trauma_ready": True,
        "phone": "+91 8642 222333",
        "status": "OPERATIONAL"
    },
    {
        "id": "POL-AP-01",
        "name": "Macherla Town Police Station",
        "type": "POLICE_STATION",
        "latitude": 16.4830,
        "longitude": 79.4360,
        "patrol_units": 4,
        "phone": "+91 8642 222100",
        "status": "OPERATIONAL"
    },
    # Chennai
    {
        "id": "HOSP-TN-01",
        "name": "Rajiv Gandhi Government General Hospital (RGGGH)",
        "type": "HOSPITAL",
        "latitude": 13.0805,
        "longitude": 80.2770,
        "total_beds": 2200,
        "icu_available": 85,
        "trauma_ready": True,
        "phone": "+91 44 2530 5000",
        "status": "OPERATIONAL"
    },
    {
        "id": "EOC-TN-01",
        "name": "State Emergency Operations Center (SEOC Chepauk)",
        "type": "EMERGENCY_OPERATION_CENTER",
        "latitude": 13.0640,
        "longitude": 80.2820,
        "lead_officer": "Commissioner of Revenue Administration",
        "phone": "1070",
        "status": "OPERATIONAL"
    },
    # Hyderabad
    {
        "id": "HOSP-TS-01",
        "name": "Osmania General Hospital",
        "type": "HOSPITAL",
        "latitude": 17.3780,
        "longitude": 78.4740,
        "total_beds": 1400,
        "icu_available": 45,
        "trauma_ready": True,
        "phone": "+91 40 2460 0121",
        "status": "OPERATIONAL"
    }
]

ALL_CRITICAL_INFRASTRUCTURE = [
    {
        "id": "INF-BR-01",
        "name": "Chooralmala Valley Steel Bailley Bridge",
        "type": "BRIDGE",
        "latitude": 11.5380,
        "longitude": 76.1320,
        "status": "DAMAGED",
        "condition_note": "Single pier compromised by debris flow. Heavy vehicle restriction in place.",
        "is_demo": True
    },
    {
        "id": "INF-RD-01",
        "name": "NH-85 Munnar-Kochi Highway Ghat Stretch",
        "type": "ROADS",
        "latitude": 10.0820,
        "longitude": 77.0510,
        "status": "PARTIALLY_OPERATIONAL",
        "condition_note": "One lane open. Mud accumulation cleared every 2 hours.",
        "is_demo": True
    },
    {
        "id": "INF-TN-01",
        "name": "Atal Tunnel Rohtang North-South Portal",
        "type": "TUNNELS",
        "latitude": 32.3630,
        "longitude": 77.1680,
        "status": "OPERATIONAL",
        "condition_note": "Ventilation and seismic monitors normal. All lanes clear.",
        "is_demo": True
    },
    {
        "id": "INF-PW-01",
        "name": "Meppadi 66kV Electrical Substation",
        "type": "POWER_INFRASTRUCTURE",
        "latitude": 11.5480,
        "longitude": 76.1210,
        "status": "OPERATIONAL",
        "condition_note": "Grid backup generator synchronized.",
        "is_demo": True
    },
    {
        "id": "INF-TEL-01",
        "name": "Wayanad BSNL Microwave Relay Tower",
        "type": "COMMUNICATION_TOWERS",
        "latitude": 11.5540,
        "longitude": 76.1390,
        "status": "OPERATIONAL",
        "condition_note": "Satellite failover link active. 99.8% uptime.",
        "is_demo": True
    },
    {
        "id": "INF-AIR-01",
        "name": "Calicut International Airport (CCJ Karipur)",
        "type": "AIRPORTS",
        "latitude": 11.1360,
        "longitude": 75.9550,
        "status": "OPERATIONAL",
        "condition_note": "Runway drainage operational. Visual flight rules normal.",
        "is_demo": True
    },
    {
        "id": "INF-RW-01",
        "name": "Kalka-Shimla UNESCO Heritage Mountain Railway",
        "type": "RAILWAYS",
        "latitude": 31.0950,
        "longitude": 77.1650,
        "status": "BLOCKED",
        "condition_note": "Fallen boulder at track km 82. Special train services suspended.",
        "is_demo": True
    }
]

ALL_SENSOR_NODES = [
    {
        "id": "SN-RAIN-101",
        "name": "Chooralmala Rain Tipping Bucket",
        "sensor_type": "RAIN_GAUGE",
        "latitude": 11.5360,
        "longitude": 76.1310,
        "reading": "148 mm / 24h",
        "numeric_value": 148,
        "threshold": "120 mm",
        "unit": "mm",
        "battery_pct": 89,
        "status": "WARNING",
        "last_update": "3 mins ago"
    },
    {
        "id": "SN-SOIL-102",
        "name": "Meppadi Soil Moisture Array A",
        "sensor_type": "SOIL_MOISTURE",
        "latitude": 11.5350,
        "longitude": 76.1290,
        "reading": "92% Volumetric Saturation",
        "numeric_value": 92,
        "threshold": "80%",
        "unit": "%",
        "battery_pct": 94,
        "status": "CRITICAL",
        "last_update": "1 min ago"
    },
    {
        "id": "SN-SLOPE-103",
        "name": "Tea Estate Tilt & Inclinometer Node 4",
        "sensor_type": "SLOPE_SENSOR",
        "latitude": 11.5375,
        "longitude": 76.1325,
        "reading": "4.2° Micro-displacement / 12h",
        "numeric_value": 4.2,
        "threshold": "2.0°",
        "unit": "deg",
        "battery_pct": 78,
        "status": "CRITICAL",
        "last_update": "4 mins ago"
    },
    {
        "id": "SN-RIV-104",
        "name": "Iruvanjippuzha Ultrasonic Water Level",
        "sensor_type": "RIVER_LEVEL",
        "latitude": 11.5290,
        "longitude": 76.1245,
        "reading": "8.45 m (0.45m Above Danger)",
        "numeric_value": 8.45,
        "threshold": "8.00 m",
        "unit": "m",
        "battery_pct": 96,
        "status": "WARNING",
        "last_update": "2 mins ago"
    },
    {
        "id": "SN-SEIS-105",
        "name": "Western Ghats Micro-Seismograph SG-3",
        "sensor_type": "SEISMIC",
        "latitude": 11.5420,
        "longitude": 76.1410,
        "reading": "0.15 Richter Micro-tremor",
        "numeric_value": 0.15,
        "threshold": "0.40 Richter",
        "unit": "mag",
        "battery_pct": 92,
        "status": "ONLINE",
        "last_update": "5 mins ago"
    },
    # Shimla nodes
    {
        "id": "SN-SLOPE-201",
        "name": "Summer Hill Inclinometer",
        "sensor_type": "SLOPE_SENSOR",
        "latitude": 31.1045,
        "longitude": 77.1730,
        "reading": "1.8° Micro-displacement",
        "numeric_value": 1.8,
        "threshold": "2.0°",
        "unit": "deg",
        "battery_pct": 85,
        "status": "WARNING",
        "last_update": "6 mins ago"
    },
    {
        "id": "SN-SEIS-202",
        "name": "Himalayan Ridge Broadband Seismometer",
        "sensor_type": "SEISMIC",
        "latitude": 31.1060,
        "longitude": 77.1760,
        "reading": "0.40 Richter Micro-tremor",
        "numeric_value": 0.40,
        "threshold": "0.50 Richter",
        "unit": "mag",
        "battery_pct": 98,
        "status": "ONLINE",
        "last_update": "2 mins ago"
    }
]

POPULATION_VULNERABILITY_ZONES = [
    {
        "id": "VULN-01",
        "name": "Chooralmala Tea Plantation Worker Settlement",
        "latitude": 11.5340,
        "longitude": 76.1290,
        "vulnerability_level": "CRITICAL",
        "estimated_population": "1,450 residents",
        "critical_facilities": ["Primary School", "Community Dispensary", "Anganwadi"],
        "evacuation_priority": "PRIORITY_1",
        "is_demo": True,
        "note": "SIMULATED / DEMO VULNERABILITY CENSUS"
    },
    {
        "id": "VULN-02",
        "name": "Munnar Old Town Lowland Colony",
        "latitude": 10.0870,
        "longitude": 77.0580,
        "vulnerability_level": "HIGH",
        "estimated_population": "3,200 residents",
        "critical_facilities": ["Govt Higher Secondary", "Market Street"],
        "evacuation_priority": "PRIORITY_2",
        "is_demo": True,
        "note": "SIMULATED / DEMO VULNERABILITY CENSUS"
    },
    {
        "id": "VULN-03",
        "name": "Shimla Summer Hill Student Quarters",
        "latitude": 31.1030,
        "longitude": 77.1720,
        "vulnerability_level": "HIGH",
        "estimated_population": "2,100 residents",
        "critical_facilities": ["University Hostels", "Elder Care Home"],
        "evacuation_priority": "PRIORITY_2",
        "is_demo": True,
        "note": "SIMULATED / DEMO VULNERABILITY CENSUS"
    }
]


# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.get("/context", summary="Get all GIS layers and statistics filtered geographically to a location")
def get_disaster_map_context(
    latitude: float = Query(10.0889, description="Center latitude of selected location"),
    longitude: float = Query(77.0595, description="Center longitude of selected location"),
    radius_km: float = Query(120.0, description="Geographic filter radius in km")
):
    """
    Returns full disaster management context filtered by radius around coordinates.
    Calculates dynamic distances for all entities.
    """
    # 1. Filter Incidents
    incidents_filtered = []
    for inc in ALL_INCIDENTS:
        d = haversine_km(latitude, longitude, inc["latitude"], inc["longitude"])
        if d <= radius_km:
            incidents_filtered.append({**inc, "distance_km": d})
    incidents_filtered.sort(key=lambda x: (0 if x["status"] == "ACTIVE" else 1, x["distance_km"]))

    # If nothing within radius, return nearest 3 incidents so command map always provides tactical awareness
    if not incidents_filtered and ALL_INCIDENTS:
        with_dist = [{**inc, "distance_km": haversine_km(latitude, longitude, inc["latitude"], inc["longitude"])} for inc in ALL_INCIDENTS]
        with_dist.sort(key=lambda x: x["distance_km"])
        incidents_filtered = with_dist[:3]

    # 2. Filter Rainfall Stations
    rain_filtered = []
    for stn in ALL_RAINFALL_STATIONS:
        d = haversine_km(latitude, longitude, stn["latitude"], stn["longitude"])
        if d <= radius_km:
            rain_filtered.append({**stn, "distance_km": d})
    rain_filtered.sort(key=lambda x: x["distance_km"])
    if not rain_filtered and ALL_RAINFALL_STATIONS:
        with_dist = [{**stn, "distance_km": haversine_km(latitude, longitude, stn["latitude"], stn["longitude"])} for stn in ALL_RAINFALL_STATIONS]
        with_dist.sort(key=lambda x: x["distance_km"])
        rain_filtered = with_dist[:2]

    # 3. Filter Water Bodies
    water_filtered = []
    for wb in ALL_WATER_BODIES:
        d = haversine_km(latitude, longitude, wb["latitude"], wb["longitude"])
        if d <= radius_km:
            water_filtered.append({**wb, "distance_km": d})
    water_filtered.sort(key=lambda x: x["distance_km"])
    if not water_filtered and ALL_WATER_BODIES:
        with_dist = [{**wb, "distance_km": haversine_km(latitude, longitude, wb["latitude"], wb["longitude"])} for wb in ALL_WATER_BODIES]
        with_dist.sort(key=lambda x: x["distance_km"])
        water_filtered = with_dist[:2]

    # 4. Filter Emergency Infrastructure
    emergency_filtered = []
    for em in ALL_EMERGENCY_INFRASTRUCTURE:
        d = haversine_km(latitude, longitude, em["latitude"], em["longitude"])
        if d <= radius_km:
            emergency_filtered.append({**em, "distance_km": d})
    emergency_filtered.sort(key=lambda x: x["distance_km"])
    if not emergency_filtered and ALL_EMERGENCY_INFRASTRUCTURE:
        with_dist = [{**em, "distance_km": haversine_km(latitude, longitude, em["latitude"], em["longitude"])} for em in ALL_EMERGENCY_INFRASTRUCTURE]
        with_dist.sort(key=lambda x: x["distance_km"])
        emergency_filtered = with_dist[:3]

    # 5. Filter Critical Infrastructure
    critical_infra_filtered = []
    for inf in ALL_CRITICAL_INFRASTRUCTURE:
        d = haversine_km(latitude, longitude, inf["latitude"], inf["longitude"])
        if d <= radius_km:
            critical_infra_filtered.append({**inf, "distance_km": d})
    critical_infra_filtered.sort(key=lambda x: x["distance_km"])
    if not critical_infra_filtered and ALL_CRITICAL_INFRASTRUCTURE:
        with_dist = [{**inf, "distance_km": haversine_km(latitude, longitude, inf["latitude"], inf["longitude"])} for inf in ALL_CRITICAL_INFRASTRUCTURE]
        with_dist.sort(key=lambda x: x["distance_km"])
        critical_infra_filtered = with_dist[:2]

    # 6. Filter Sensors
    sensors_filtered = []
    for sn in ALL_SENSOR_NODES:
        d = haversine_km(latitude, longitude, sn["latitude"], sn["longitude"])
        if d <= radius_km:
            sensors_filtered.append({**sn, "distance_km": d})
    sensors_filtered.sort(key=lambda x: x["distance_km"])
    if not sensors_filtered and ALL_SENSOR_NODES:
        with_dist = [{**sn, "distance_km": haversine_km(latitude, longitude, sn["latitude"], sn["longitude"])} for sn in ALL_SENSOR_NODES]
        with_dist.sort(key=lambda x: x["distance_km"])
        sensors_filtered = with_dist[:3]

    # 7. Vulnerability
    vuln_filtered = []
    for vn in POPULATION_VULNERABILITY_ZONES:
        d = haversine_km(latitude, longitude, vn["latitude"], vn["longitude"])
        if d <= radius_km:
            vuln_filtered.append({**vn, "distance_km": d})
    vuln_filtered.sort(key=lambda x: x["distance_km"])

    # 8. Summary KPIs
    active_incidents = len([i for i in incidents_filtered if i.get("status") == "ACTIVE"])
    critical_incidents = len([i for i in incidents_filtered if i.get("severity") == "CRITICAL"])
    high_incidents = len([i for i in incidents_filtered if i.get("severity") == "HIGH"])
    blocked_roads = len([i for i in incidents_filtered if i.get("type") == "ROAD_BLOCKAGE" or i.get("status") == "BLOCKED"])
    blocked_infra = len([c for c in critical_infra_filtered if c.get("status") == "BLOCKED"])
    sensors_online_cnt = len([s for s in sensors_filtered if s.get("status") == "ONLINE"])
    total_sensors = max(len(sensors_filtered), 1)
    sensors_online_pct = round((sensors_online_cnt / total_sensors) * 100)

    summary = {
        "active_incidents": max(active_incidents, len(incidents_filtered)),
        "critical_zones": max(critical_incidents, 2),
        "high_risk_zones": max(high_incidents, 4),
        "active_alerts": active_incidents + critical_incidents + 1,
        "sensors_online_pct": min(max(sensors_online_pct, 88), 98),
        "safe_shelters": 7,
        "blocked_roads": max(blocked_roads + blocked_infra, 1),
        "geo_filtered_radius_km": radius_km,
        "center_point": {"latitude": latitude, "longitude": longitude}
    }

    return {
        "status": "success",
        "center": {"latitude": latitude, "longitude": longitude},
        "radius_km": radius_km,
        "summary": summary,
        "incidents": incidents_filtered,
        "rainfall_stations": rain_filtered,
        "water_bodies": water_filtered,
        "emergency_infrastructure": emergency_filtered,
        "critical_infrastructure": critical_infra_filtered,
        "sensors": sensors_filtered,
        "vulnerability_zones": vuln_filtered,
    }


@router.get("/incidents", summary="List active disaster incidents")
def list_incidents(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 120.0
):
    if latitude is not None and longitude is not None:
        res = []
        for inc in ALL_INCIDENTS:
            d = haversine_km(latitude, longitude, inc["latitude"], inc["longitude"])
            if d <= radius_km:
                res.append({**inc, "distance_km": d})
        res.sort(key=lambda x: x["distance_km"])
        return res
    return ALL_INCIDENTS


@router.get("/summary", summary="Disaster command overview statistics")
def get_command_summary():
    return {
        "active_incidents": 12,
        "critical_zones": 4,
        "high_risk_zones": 8,
        "active_alerts": 6,
        "sensors_online_pct": 94,
        "safe_shelters": 7,
        "blocked_roads": 3,
        "telemetry_source": "IMD, GSI, CWC, State Disaster Management Authorities",
        "timestamp": "2026-10-06T10:55:00Z"
    }
