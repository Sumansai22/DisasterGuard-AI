"""
Production Place Search & Geocoding Service.
Queries comprehensive geographic index for instant response and queries
OpenStreetMap Nominatim for arbitrary global locations.
"""

from __future__ import annotations
import os
import json
import logging
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

INDIAN_GEOGRAPHIC_INDEX: List[Dict[str, Any]] = [
    # Andhra Pradesh
    {
        "name": "Macherla",
        "address": "Macherla, Palnadu District, Andhra Pradesh, 522426, India",
        "latitude": 16.4806,
        "longitude": 79.4328,
        "place_id": "geo-ap-macherla",
        "type": "town",
        "state": "Andhra Pradesh",
        "country": "India",
    },
    {
        "name": "Nagarjuna Sagar",
        "address": "Nagarjuna Sagar, Palnadu / Nalgonda District, Andhra Pradesh / Telangana, India",
        "latitude": 16.5780,
        "longitude": 79.3140,
        "place_id": "geo-ap-nagarjunasagar",
        "type": "landmark",
        "state": "Andhra Pradesh",
        "country": "India",
    },
    {
        "name": "Guntur",
        "address": "Guntur, Guntur District, Andhra Pradesh, 522002, India",
        "latitude": 16.3067,
        "longitude": 80.4365,
        "place_id": "geo-ap-guntur",
        "type": "city",
        "state": "Andhra Pradesh",
        "country": "India",
    },
    {
        "name": "Vijayawada",
        "address": "Vijayawada, NTR District, Andhra Pradesh, 520001, India",
        "latitude": 16.5062,
        "longitude": 80.6480,
        "place_id": "geo-ap-vijayawada",
        "type": "city",
        "state": "Andhra Pradesh",
        "country": "India",
    },
    {
        "name": "Visakhapatnam",
        "address": "Visakhapatnam, Andhra Pradesh, 530001, India",
        "latitude": 17.6868,
        "longitude": 83.2185,
        "place_id": "geo-ap-visakhapatnam",
        "type": "city",
        "state": "Andhra Pradesh",
        "country": "India",
    },
    {
        "name": "Tirupati",
        "address": "Tirupati, Tirupati District, Andhra Pradesh, 517501, India",
        "latitude": 13.6288,
        "longitude": 79.4192,
        "place_id": "geo-ap-tirupati",
        "type": "city",
        "state": "Andhra Pradesh",
        "country": "India",
    },
    # Telangana
    {
        "name": "Hyderabad",
        "address": "Hyderabad, Hyderabad District, Telangana, 500001, India",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "place_id": "geo-ts-hyderabad",
        "type": "city",
        "state": "Telangana",
        "country": "India",
    },
    {
        "name": "Secunderabad",
        "address": "Secunderabad, Hyderabad, Telangana, 500003, India",
        "latitude": 17.4399,
        "longitude": 78.4983,
        "place_id": "geo-ts-secunderabad",
        "type": "city",
        "state": "Telangana",
        "country": "India",
    },
    {
        "name": "Warangal",
        "address": "Warangal, Warangal District, Telangana, 506002, India",
        "latitude": 17.9689,
        "longitude": 79.5941,
        "place_id": "geo-ts-warangal",
        "type": "city",
        "state": "Telangana",
        "country": "India",
    },
    # Tamil Nadu
    {
        "name": "Chennai",
        "address": "Chennai, Chennai District, Tamil Nadu, 600001, India",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "place_id": "geo-tn-chennai",
        "type": "city",
        "state": "Tamil Nadu",
        "country": "India",
    },
    {
        "name": "Chennai Central",
        "address": "Puratchi Thalaivar Dr. M.G. Ramachandran Central Railway Station, Chennai, Tamil Nadu, 600003",
        "latitude": 13.0827,
        "longitude": 80.2757,
        "place_id": "geo-tn-chennai-central",
        "type": "transport",
        "state": "Tamil Nadu",
        "country": "India",
    },
    {
        "name": "Coimbatore",
        "address": "Coimbatore, Coimbatore District, Tamil Nadu, 641001, India",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "place_id": "geo-tn-coimbatore",
        "type": "city",
        "state": "Tamil Nadu",
        "country": "India",
    },
    {
        "name": "Coonoor",
        "address": "Coonoor, The Nilgiris District, Tamil Nadu, 643101, India",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "place_id": "geo-tn-coonoor",
        "type": "town",
        "state": "Tamil Nadu",
        "country": "India",
    },
    {
        "name": "Ooty",
        "address": "Ooty (Udhagamandalam), The Nilgiris District, Tamil Nadu, 643001, India",
        "latitude": 11.4102,
        "longitude": 76.6950,
        "place_id": "geo-tn-ooty",
        "type": "town",
        "state": "Tamil Nadu",
        "country": "India",
    },
    {
        "name": "Madurai",
        "address": "Madurai, Madurai District, Tamil Nadu, 625001, India",
        "latitude": 9.9252,
        "longitude": 78.1198,
        "place_id": "geo-tn-madurai",
        "type": "city",
        "state": "Tamil Nadu",
        "country": "India",
    },
    # Kerala
    {
        "name": "Munnar",
        "address": "Munnar, Idukki District, Kerala, 685612, India",
        "latitude": 10.0889,
        "longitude": 77.0595,
        "place_id": "geo-kl-munnar",
        "type": "town",
        "state": "Kerala",
        "country": "India",
    },
    {
        "name": "Wayanad",
        "address": "Wayanad District, Kerala, 673121, India",
        "latitude": 11.6854,
        "longitude": 76.1320,
        "place_id": "geo-kl-wayanad",
        "type": "district",
        "state": "Kerala",
        "country": "India",
    },
    {
        "name": "Meppadi",
        "address": "Meppadi, Vythiri Taluk, Wayanad District, Kerala, 673577, India",
        "latitude": 11.5510,
        "longitude": 76.1240,
        "place_id": "geo-kl-meppadi",
        "type": "village",
        "state": "Kerala",
        "country": "India",
    },
    {
        "name": "Chooralmala",
        "address": "Chooralmala, Meppadi, Wayanad District, Kerala, 673577, India",
        "latitude": 11.5362,
        "longitude": 76.1308,
        "place_id": "geo-kl-chooralmala",
        "type": "village",
        "state": "Kerala",
        "country": "India",
    },
    {
        "name": "Kochi",
        "address": "Kochi, Ernakulam District, Kerala, 682001, India",
        "latitude": 9.9312,
        "longitude": 76.2673,
        "place_id": "geo-kl-kochi",
        "type": "city",
        "state": "Kerala",
        "country": "India",
    },
    {
        "name": "Thiruvananthapuram",
        "address": "Thiruvananthapuram, Kerala, 695001, India",
        "latitude": 8.5241,
        "longitude": 76.9366,
        "place_id": "geo-kl-trivandrum",
        "type": "city",
        "state": "Kerala",
        "country": "India",
    },
    # Karnataka
    {
        "name": "Bengaluru",
        "address": "Bengaluru, Bengaluru Urban District, Karnataka, 560001, India",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "place_id": "geo-ka-bengaluru",
        "type": "city",
        "state": "Karnataka",
        "country": "India",
    },
    {
        "name": "Mangaluru",
        "address": "Mangaluru, Dakshina Kannada, Karnataka, 575001, India",
        "latitude": 12.9141,
        "longitude": 74.8560,
        "place_id": "geo-ka-mangaluru",
        "type": "city",
        "state": "Karnataka",
        "country": "India",
    },
    {
        "name": "Madikeri (Coorg)",
        "address": "Madikeri, Kodagu District, Karnataka, 571201, India",
        "latitude": 12.4244,
        "longitude": 75.7382,
        "place_id": "geo-ka-coorg",
        "type": "town",
        "state": "Karnataka",
        "country": "India",
    },
    # Himachal Pradesh
    {
        "name": "Manali",
        "address": "Manali, Kullu District, Himachal Pradesh, 175131, India",
        "latitude": 32.2396,
        "longitude": 77.1887,
        "place_id": "geo-hp-manali",
        "type": "town",
        "state": "Himachal Pradesh",
        "country": "India",
    },
    {
        "name": "Shimla",
        "address": "Shimla, Shimla District, Himachal Pradesh, 171001, India",
        "latitude": 31.1048,
        "longitude": 77.1734,
        "place_id": "geo-hp-shimla",
        "type": "city",
        "state": "Himachal Pradesh",
        "country": "India",
    },
    {
        "name": "Kullu",
        "address": "Kullu, Kullu District, Himachal Pradesh, 175101, India",
        "latitude": 31.9579,
        "longitude": 77.1095,
        "place_id": "geo-hp-kullu",
        "type": "town",
        "state": "Himachal Pradesh",
        "country": "India",
    },
    {
        "name": "Dharamshala",
        "address": "Dharamshala, Kangra District, Himachal Pradesh, 176215, India",
        "latitude": 32.2190,
        "longitude": 76.3234,
        "place_id": "geo-hp-dharamshala",
        "type": "town",
        "state": "Himachal Pradesh",
        "country": "India",
    },
    # Uttarakhand
    {
        "name": "Dehradun",
        "address": "Dehradun, Dehradun District, Uttarakhand, 248001, India",
        "latitude": 30.3165,
        "longitude": 78.0322,
        "place_id": "geo-uk-dehradun",
        "type": "city",
        "state": "Uttarakhand",
        "country": "India",
    },
    {
        "name": "Chamoli",
        "address": "Chamoli Gopeshwar, Chamoli District, Uttarakhand, 246401, India",
        "latitude": 30.4100,
        "longitude": 79.3300,
        "place_id": "geo-uk-chamoli",
        "type": "town",
        "state": "Uttarakhand",
        "country": "India",
    },
    {
        "name": "Joshimath",
        "address": "Joshimath (Jyotirmath), Chamoli District, Uttarakhand, 246443, India",
        "latitude": 30.5562,
        "longitude": 79.5663,
        "place_id": "geo-uk-joshimath",
        "type": "town",
        "state": "Uttarakhand",
        "country": "India",
    },
    {
        "name": "Rishikesh",
        "address": "Rishikesh, Dehradun District, Uttarakhand, 249201, India",
        "latitude": 30.0869,
        "longitude": 78.2676,
        "place_id": "geo-uk-rishikesh",
        "type": "city",
        "state": "Uttarakhand",
        "country": "India",
    },
    # West Bengal & Sikkim
    {
        "name": "Darjeeling",
        "address": "Darjeeling, Darjeeling District, West Bengal, 734101, India",
        "latitude": 26.9854,
        "longitude": 88.2831,
        "place_id": "geo-wb-darjeeling",
        "type": "town",
        "state": "West Bengal",
        "country": "India",
    },
    {
        "name": "Gangtok",
        "address": "Gangtok, East Sikkim District, Sikkim, 737101, India",
        "latitude": 27.3389,
        "longitude": 88.6065,
        "place_id": "geo-sk-gangtok",
        "type": "city",
        "state": "Sikkim",
        "country": "India",
    },
    {
        "name": "Kolkata",
        "address": "Kolkata, West Bengal, 700001, India",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "place_id": "geo-wb-kolkata",
        "type": "city",
        "state": "West Bengal",
        "country": "India",
    },
    # National Metro Hubs
    {
        "name": "Delhi",
        "address": "New Delhi, National Capital Territory of Delhi, 110001, India",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "place_id": "geo-dl-delhi",
        "type": "city",
        "state": "Delhi",
        "country": "India",
    },
    {
        "name": "Mumbai",
        "address": "Mumbai, Mumbai City, Maharashtra, 400001, India",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "place_id": "geo-mh-mumbai",
        "type": "city",
        "state": "Maharashtra",
        "country": "India",
    },
    {
        "name": "Pune",
        "address": "Pune, Pune District, Maharashtra, 411001, India",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "place_id": "geo-mh-pune",
        "type": "city",
        "state": "Maharashtra",
        "country": "India",
    },
]

class GeocodingService:
    def search_places(self, query: str, limit: int = 8) -> List[Dict[str, Any]]:
        clean_query = query.strip()
        if not clean_query or len(clean_query) < 2:
            return []

        results: List[Dict[str, Any]] = []
        seen_keys = set()
        lower_query = clean_query.lower()

        # 1. Instant match against Indian Geographic Index
        for item in INDIAN_GEOGRAPHIC_INDEX:
            name = item["name"]
            addr = item["address"]
            if (
                lower_query == name.lower()
                or lower_query in name.lower()
                or lower_query in addr.lower()
            ):
                key = f"{round(item['latitude'], 3)}_{round(item['longitude'], 3)}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    results.append({
                        **item,
                        "formatted_address": item["address"],
                        "source": "geocoding",
                    })

        # 2. If we need more results or query not found in index, query Nominatim with fast 1.5s timeout
        if len(results) < limit:
            try:
                encoded_q = urllib.parse.quote(clean_query)
                url = f"https://nominatim.openstreetmap.org/search?q={encoded_q}&format=json&limit={limit}&addressdetails=1"
                req = urllib.request.Request(
                    url,
                    headers={
                        "User-Agent": "LandslideGuardAI/2.0 (contact: geocoding@landslideguard.org)",
                        "Accept-Language": "en",
                    },
                )
                with urllib.request.urlopen(req, timeout=1.5) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode("utf-8"))
                        for row in data:
                            display_name = row.get("display_name", "")
                            name = row.get("name") or display_name.split(",")[0]
                            lat = float(row.get("lat", 0.0))
                            lon = float(row.get("lon", 0.0))
                            addr = row.get("address", {})
                            state = addr.get("state")
                            country = addr.get("country", "India")
                            place_type = row.get("type", row.get("class", "place"))

                            key = f"{round(lat, 3)}_{round(lon, 3)}"
                            if key not in seen_keys:
                                seen_keys.add(key)
                                results.append({
                                    "name": name,
                                    "formatted_address": display_name,
                                    "address": display_name,
                                    "latitude": lat,
                                    "longitude": lon,
                                    "place_id": str(row.get("place_id", f"osm-{lat}-{lon}")),
                                    "type": place_type,
                                    "state": state,
                                    "country": country,
                                    "source": "geocoding",
                                })
            except Exception as e:
                logger.info(f"[GeocodingService] Online geocode note for '{clean_query}': {e}")

        return results[:limit]

geocoding_service = GeocodingService()
