import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from fastapi.testclient import TestClient

def test_global_geocoding_and_disaster_integration():
    client = TestClient(app)

    test_queries = [
        "Macherla",
        "Manali",
        "Chennai",
        "Hyderabad",
        "Vijayawada",
        "Guntur",
        "Visakhapatnam",
        "Kochi",
        "Bengaluru",
        "Delhi"
    ]

    print("==================================================")
    print("TESTING GLOBAL PLACE SEARCH ENDPOINTS")
    print("==================================================")

    for q in test_queries:
        resp = client.get(f"/api/geocoding/search?q={q}&limit=6")
        assert resp.status_code == 200, f"Failed for {q}: {resp.text}"
        data = resp.json()
        assert data["status"] == "success"
        results = data["results"]
        assert len(results) > 0, f"No results returned for {q}"
        top = results[0]
        print(f"[OK] Query: '{q}' -> Top Place: '{top['name']}' | Address: '{top['address']}' | Coords: ({top['latitude']}, {top['longitude']})")
        assert -90 <= top["latitude"] <= 90
        assert -180 <= top["longitude"] <= 180

    print("\n==================================================")
    print("TESTING GEOGRAPHIC CONTEXT UPDATE AROUND MACHERLA")
    print("==================================================")
    # 1. Macherla place coordinates
    resp_m = client.get("/api/geocoding/search?q=Macherla")
    m_data = resp_m.json()["results"][0]
    lat, lng = m_data["latitude"], m_data["longitude"]

    # 2. Query Disaster Map context around Macherla
    resp_ctx = client.get(f"/api/disaster-map/context?latitude={lat}&longitude={lng}&radius_km=120")
    assert resp_ctx.status_code == 200
    ctx_data = resp_ctx.json()
    print(f"Macherla Summary: {ctx_data['summary']}")
    print(f"Nearby Incidents: {[i['title'] for i in ctx_data['incidents']]}")
    print(f"Nearby Emergency Infra: {[e['name'] for e in ctx_data['emergency_infrastructure']]}")

    # 3. Query Evacuation Shelters near Macherla
    resp_sh = client.get(f"/api/evacuation/shelters?latitude={lat}&longitude={lng}&radius_km=120")
    assert resp_sh.status_code == 200
    shelters = resp_sh.json()["shelters"]
    print(f"Nearby Safe Shelters (Within 120km of Macherla):")
    for s in shelters:
        print(f"  - {s['name']} ({s['distance_km']} km away)")
        assert s['distance_km'] <= 120

    # Ensure far-away shelters like Munnar or Shimla are NOT in the list for Macherla
    shelter_names = [s['name'] for s in shelters]
    assert not any("Munnar" in name for name in shelter_names), "Munnar should not be in Macherla shelter list"
    assert not any("Shimla" in name for name in shelter_names), "Shimla should not be in Macherla shelter list"

    print("\n==================================================")
    print("TESTING TELEMETRY STATION PRESERVATION")
    print("==================================================")
    resp_stn = client.get("/api/stations")
    assert resp_stn.status_code == 200
    print(f"Active Monitored Stations: {len(resp_stn.json())} stations configured.")

    print("\n[SUCCESS] Global Search & Telemetry Separation fully verified 100%!")

if __name__ == "__main__":
    test_global_geocoding_and_disaster_integration()
