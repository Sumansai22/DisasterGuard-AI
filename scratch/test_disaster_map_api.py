import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from fastapi.testclient import TestClient

def test_disaster_map_endpoints():
    client = TestClient(app)

    print("Testing GET /api/disaster-map/context for Munnar...")
    resp = client.get("/api/disaster-map/context?latitude=10.0889&longitude=77.0595&radius_km=120")
    assert resp.status_code == 200, f"Failed context: {resp.text}"
    data = resp.json()
    assert "summary" in data
    assert "incidents" in data
    assert "rainfall_stations" in data
    assert "emergency_infrastructure" in data
    print(f"Summary: {data['summary']}")
    print(f"Incidents count: {len(data['incidents'])}")
    print(f"Rainfall stations count: {len(data['rainfall_stations'])}")

    print("\nTesting GET /api/disaster-map/context for Macherla...")
    resp_mach = client.get("/api/disaster-map/context?latitude=16.4806&longitude=79.4328&radius_km=120")
    assert resp_mach.status_code == 200
    data_mach = resp_mach.json()
    print(f"Macherla Summary: {data_mach['summary']}")
    print(f"Macherla Incidents: {[i['title'] for i in data_mach['incidents']]}")

    print("\nTesting GET /api/disaster-map/incidents...")
    resp_inc = client.get("/api/disaster-map/incidents")
    assert resp_inc.status_code == 200
    assert len(resp_inc.json()) >= 5

    print("\nTesting GET /api/disaster-map/summary...")
    resp_sum = client.get("/api/disaster-map/summary")
    assert resp_sum.status_code == 200
    assert resp_sum.json()["active_incidents"] == 12

    print("\n[SUCCESS] All Disaster Management Command Map endpoints verified 100%!")

if __name__ == "__main__":
    test_disaster_map_endpoints()
