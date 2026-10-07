import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_multi_hazard_suite():
    print("==================================================")
    print("TESTING MULTI-HAZARD ENGINE & API ENDPOINTS")
    print("==================================================")

    # 1. Test /api/hazard/types
    res_types = client.get("/api/hazard/types")
    assert res_types.status_code == 200, f"Failed types endpoint: {res_types.text}"
    types_data = res_types.json()
    assert types_data["count"] >= 7, f"Expected at least 7 hazard types, got {types_data['count']}"
    print(f"[OK] Hazard Types ({types_data['count']} registered): {[h['name'] for h in types_data['hazard_types'][:4]]}...")

    # 2. Test /api/hazard/assessment for Munnar (monitored station)
    res_munnar = client.get(
        "/api/hazard/assessment",
        params={
            "lat": 10.0889,
            "lng": 77.0595,
            "location_name": "Munnar Tea Estate Zone A",
            "rainfall_mm": 115.0,
            "slope_angle": 38.5,
            "soil_saturation": 85.0,
            "vegetation_cover": 40.0,
            "earthquake_activity": 0.25,
            "proximity_to_water": 180.0,
            "is_monitored": True,
        }
    )
    assert res_munnar.status_code == 200, f"Failed Munnar assessment: {res_munnar.text}"
    munnar_data = res_munnar.json()
    assert "compositeRiskScore" in munnar_data
    assert "hazards" in munnar_data
    assert len(munnar_data["hazards"]) >= 7
    assert "cascadingChain" in munnar_data
    assert "impactExposure" in munnar_data
    assert "emergencyResponse" in munnar_data
    print(f"[OK] Munnar Multi-Hazard Composite Score: {munnar_data['compositeRiskScore']}/100 ({munnar_data['compositeRiskLevel']}) | Dominant: {munnar_data['dominantHazard']}")
    print(f"     SOP Protocol: {munnar_data['emergencyResponse']['ndmaProtocolCode']} | Evacuation Priority: {munnar_data['emergencyResponse']['evacuationPriority']}")

    # 3. Test /api/hazard/assessment for Macherla (non-monitored place)
    res_macherla = client.get(
        "/api/hazard/assessment",
        params={
            "lat": 16.4806,
            "lng": 79.4328,
            "location_name": "Macherla",
            "rainfall_mm": 35.0,
            "slope_angle": 12.0,
            "soil_saturation": 45.0,
            "vegetation_cover": 60.0,
            "earthquake_activity": 0.05,
            "proximity_to_water": 450.0,
            "is_monitored": False,
        }
    )
    assert res_macherla.status_code == 200, f"Failed Macherla assessment: {res_macherla.text}"
    macherla_data = res_macherla.json()
    print(f"[OK] Macherla Multi-Hazard Composite Score: {macherla_data['compositeRiskScore']}/100 ({macherla_data['compositeRiskLevel']}) | Dominant: {macherla_data['dominantHazard']}")

    # 4. Test /api/hazard/summary
    res_summary = client.get("/api/hazard/summary?lat=16.4806&lng=79.4328")
    assert res_summary.status_code == 200, f"Failed summary endpoint: {res_summary.text}"
    sum_data = res_summary.json()
    assert "composite_risk_score" in sum_data
    print(f"[OK] Multi-Hazard Summary: {sum_data}")

    print("\n[SUCCESS] All Multi-Hazard decision-support endpoints verified 100%!")

if __name__ == "__main__":
    test_multi_hazard_suite()
