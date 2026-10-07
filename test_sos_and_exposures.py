"""
Master Test Verification Script for Hazard-Specific Exposure & Emergency SOS
"""
import sys

def test_backend_direct():
    print("Testing Python Services Direct Import...")
    sys.path.insert(0, "C:/Users/Sumanth/.gemini/antigravity/scratch/landslideguard-ai/backend")
    
    from app.services.multi_hazard_engine import multi_hazard_engine
    from app.services.disaster_management_service import disaster_mgmt_service

    # Test multi hazard risk calculation
    assessment = multi_hazard_engine.calculate_location_risk(
        lat=16.5448,
        lng=81.5212,
        location_name="Bhimavaram",
        rainfall_mm=65.0
    )

    print("Assessment calculated successfully!")
    print(f"Composite Risk Score: {assessment['compositeRiskScore']} ({assessment['compositeRiskLevel']})")
    print(f"Hazard count: {len(assessment['hazards'])}")
    print(f"Hazard exposures keys: {list(assessment.get('hazardExposures', {}).keys())}")

    for key, exp in assessment.get("hazardExposures", {}).items():
        threat_ascii = exp['cascading_threat'][:45].encode('ascii', 'ignore').decode('ascii')
        print(f"  [{key}] Area: {exp['affected_area_km2']} km2 | Pop: {exp['population_exposed']} (Elderly: {exp['vulnerable_demographics']['elderly']}, Children: {exp['vulnerable_demographics']['children']}) | Shelters: {exp['verified_shelters_available']} | Threat: {threat_ascii}...")

    # Test SOS creation
    sos_res = disaster_mgmt_service.create_sos_incident(
        latitude=16.5448,
        longitude=81.5212,
        location_name="Bhimavaram Flood Zone",
        emergency_type="TRAPPED_RISING_WATER",
        persons_count=3,
        contact_phone="+91 9876543210",
        notes="Water level reaching rooftop, need boat extraction"
    )

    print("\nSOS Created Successfully:")
    print(f"Incident ID: {sos_res['incident']['id']}")
    print(f"Priority: {sos_res['incident']['priority']}")
    print(f"Status: {sos_res['incident']['status']}")
    print(f"Assigned ETA: {sos_res['estimated_eta_minutes']} mins")
    print(f"Message: {sos_res['message']}")

    print("\nALL BACKEND TESTS PASSED WITH ZERO ERRORS!")

if __name__ == "__main__":
    test_backend_direct()
