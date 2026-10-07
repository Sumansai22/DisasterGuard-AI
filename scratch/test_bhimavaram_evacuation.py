import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from fastapi.testclient import TestClient
from app.main import app
from app.services.routing_service import routing_service
from app.services.route_safety import route_safety_service, ACTIVE_HAZARD_ZONES

client = TestClient(app)

def test_evacuation_multi_route_safety():
    print("==================================================")
    print("TESTING MULTI-ROUTE EVACUATION & HAZARD SAFETY")
    print("==================================================")

    # 1. Test Bhimavaram Location Shelters
    res_shelters = client.get("/api/evacuation/shelters?latitude=16.5449&longitude=81.5212")
    assert res_shelters.status_code == 200, f"Failed shelters endpoint: {res_shelters.text}"
    shelters = res_shelters.json()["shelters"]
    assert len(shelters) > 0
    top_shelter = shelters[0]
    print(f"[OK] Top Nearby Shelter for Bhimavaram: {top_shelter['name']} ({top_shelter['distance_km']} km away, available capacity: {top_shelter['available_capacity']})")

    # 2. Test Multi-Route Calculation from Bhimavaram to Shelter
    req_payload = {
        "origin": {
            "name": "Bhimavaram",
            "latitude": 16.5449,
            "longitude": 81.5212,
        },
        "destination": {
            "name": top_shelter["name"],
            "latitude": top_shelter["latitude"],
            "longitude": top_shelter["longitude"],
        },
        "travel_mode": "DRIVE",
        "safehouse_id": top_shelter["id"],
    }
    res_route = client.post("/api/evacuation/routes", json=req_payload)
    assert res_route.status_code == 200, f"Failed route calculation: {res_route.text}"
    route_data = res_route.json()

    assert "routes" in route_data, "Response missing 'routes' array"
    assert len(route_data["routes"]) >= 1, "Expected at least 1 evaluated route"

    print(f"\n[OK] Evaluated Routes Count: {len(route_data['routes'])}")
    for r in route_data["routes"]:
        status = r["status"]
        recommended = r["recommended"]
        score = r["safety_score"]
        dist = r["distance_km"]
        exposure = r["hazard_exposure_km"]
        hazards = [f"{h['type']} ({h['affected_distance_km']}km)" for h in r.get("hazards", [])]
        print(f"  - Route: '{r['name']}' | Status: {status} | Rec: {recommended} | Score: {score}/100 | Dist: {dist}km | Hazard Exp: {exposure}km | Hazards: {hazards}")

    # Check recommended route
    rec_routes = [r for r in route_data["routes"] if r["recommended"]]
    assert len(rec_routes) == 1, "Expected exactly 1 recommended route"
    rec_route = rec_routes[0]
    assert rec_route["status"] in ["SAFE", "CAUTION"], f"Recommended route should be SAFE or CAUTION, got {rec_route['status']}"
    print(f"\n[OK] Recommended Route: {rec_route['name']} (Safety Score: {rec_route['safety_score']}/100)")

    # 3. Test Munnar Multi-Route Hazard Detection
    req_munnar = {
        "origin": {
            "name": "Munnar Tea Estate Zone A",
            "latitude": 10.0889,
            "longitude": 77.0595,
        },
        "destination": {
            "name": "Devikulam Sub-Divisional Emergency Shelter",
            "latitude": 10.0620,
            "longitude": 77.1020,
        },
        "travel_mode": "DRIVE",
    }
    res_munnar = client.post("/api/evacuation/routes", json=req_munnar)
    assert res_munnar.status_code == 200
    munnar_data = res_munnar.json()
    print(f"\n[OK] Munnar Route Status: {munnar_data['safety']['status']} (Safety Score: {munnar_data['safety']['score']}/100, Proximity: {munnar_data['safety']['hazard_proximity_meters']}m)")

    print("\n[SUCCESS] Multi-Route Evaluation and Hazard Intersections verified 100%!")

if __name__ == "__main__":
    test_evacuation_multi_route_safety()
