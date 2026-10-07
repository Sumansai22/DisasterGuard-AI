import sys
import os
import io
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.drone_vision_service import drone_vision_service, SimpleTracker
from app.services.drone_incident_service import drone_incident_service
from app.schemas.drone_rescue import DroneTelemetry, RescueAlertDispatchPayload
from app.services.ml_service import ml_service
from app.services.segmentation_service import segmentation_service

def test_object_tracker():
    print("\n--- TEST 1: Object Tracker & Non-Duplicate Counting ---")
    tracker = SimpleTracker(max_disappeared=5, distance_threshold=0.20)
    
    # Frame 1: 2 persons detected
    f1_detections = [
        {"x": 0.40, "y": 0.40, "width": 0.08, "height": 0.15, "confidence": 0.95},
        {"x": 0.70, "y": 0.30, "width": 0.06, "height": 0.12, "confidence": 0.91},
    ]
    t1 = tracker.update(f1_detections, frame_num=1, timestamp_sec=0.5)
    assert len(t1) == 2, f"Expected 2 tracks, got {len(t1)}"
    p1_id = t1[0]["tracking_id"]
    p2_id = t1[1]["tracking_id"]
    print(f"Frame 1 registered tracks: {t1[0]['person_id']}, {t1[1]['person_id']}")
    
    # Frame 2: Same persons slightly moved
    f2_detections = [
        {"x": 0.41, "y": 0.41, "width": 0.08, "height": 0.15, "confidence": 0.96},
        {"x": 0.71, "y": 0.31, "width": 0.06, "height": 0.12, "confidence": 0.90},
    ]
    t2 = tracker.update(f2_detections, frame_num=2, timestamp_sec=1.0)
    assert len(t2) == 2, f"Expected 2 tracks, got {len(t2)}"
    assert t2[0]["tracking_id"] == p1_id, "Person 1 ID must persist across frames"
    assert t2[1]["tracking_id"] == p2_id, "Person 2 ID must persist across frames"
    assert t2[0]["frames_tracked"] == 2
    print(f"Frame 2 tracked persistent IDs: {t2[0]['person_id']} (frames: {t2[0]['frames_tracked']})")
    print("[PASS] Object Tracker Test PASSED")

def test_distress_scoring():
    print("\n--- TEST 2: Possible Distress Scoring & Multi-Hazard Indicators ---")
    # Case A: Lying person prostrate in flood water (high distress)
    score_a, prio_a, ind_a, post_a = drone_vision_service.calculate_distress_indicators(
        bbox={"x": 0.40, "y": 0.45, "width": 0.12, "height": 0.06},  # w > h -> horizontal / lying
        hazard_context="FLASH FLOOD",
        frames_tracked=5,
        history=[(0.40, 0.45, {}, 0.0), (0.40, 0.45, {}, 2.0)],  # stationary
        other_bboxes=[],
        img_width=1280,
        img_height=720,
    )
    print(f"Case A (Lying in Flood): Distress Score = {score_a * 100:.0f}%, Priority = {prio_a}, Posture = {post_a}")
    print(f"  Indicators: {ind_a}")
    assert prio_a in ("CRITICAL", "HIGH"), f"Expected CRITICAL/HIGH, got {prio_a}"
    assert "Lying posture" in str(ind_a)
    assert "Flood water" in str(ind_a)

    # Case B: Walking person with vertical aspect ratio (normal)
    score_b, prio_b, ind_b, post_b = drone_vision_service.calculate_distress_indicators(
        bbox={"x": 0.20, "y": 0.60, "width": 0.04, "height": 0.12},  # normal standing
        hazard_context="FLASH FLOOD",
        frames_tracked=1,
        history=[],
        other_bboxes=[{"x": 0.22, "y": 0.60, "width": 0.04, "height": 0.12}],
        img_width=1280,
        img_height=720,
    )
    print(f"Case B (Walking Normal): Distress Score = {score_b * 100:.0f}%, Priority = {prio_b}, Posture = {post_b}")
    assert prio_b in ("LOW", "MEDIUM"), f"Expected LOW/MEDIUM, got {prio_b}"
    print("[PASS] Distress Scoring Test PASSED")

def test_georeferencing_integrity():
    print("\n--- TEST 3: Georeferencing & No Fake GPS Rule ---")
    # Test when GPS is available
    tel_with_gps = DroneTelemetry(
        drone_id="DRONE-01",
        connected=True,
        altitude_m=50.0,
        latitude=16.5448,
        longitude=81.5212,
    )
    lat, lng, avail, label = drone_vision_service.georeference_detection(
        bbox={"x": 0.5, "y": 0.5, "width": 0.1, "height": 0.1},
        telemetry=tel_with_gps,
        frame_w=1280,
        frame_h=720,
    )
    assert avail is True
    assert lat is not None and lng is not None
    print(f"GPS Available Result: {label}")

    # Test when GPS is unavailable -> MUST NOT FAKE COORDINATES
    tel_no_gps = DroneTelemetry(drone_id="DRONE-01", connected=False)
    lat_no, lng_no, avail_no, label_no = drone_vision_service.georeference_detection(
        bbox={"x": 0.42, "y": 0.35, "width": 0.08, "height": 0.12},
        telemetry=tel_no_gps,
        frame_w=1280,
        frame_h=720,
    )
    assert avail_no is False, "GPS availability must be False"
    assert lat_no is None and lng_no is None, "Latitude/Longitude must be None when GPS unavailable"
    assert "GPS unavailable — detection location is image-relative" in label_no
    print(f"GPS Unavailable Result: {label_no}")
    print("[PASS] Georeferencing Rule PASSED")

def test_incident_lifecycle():
    print("\n--- TEST 4: Incident Verification & Dispatch Lifecycle ---")
    inc_list = drone_incident_service.list_incidents()
    assert len(inc_list) > 0, "Expected seeded rescue incidents"
    target_inc = inc_list[0]["incident_id"]
    
    # 1. Verify detection
    verified = drone_incident_service.update_incident_status(target_inc, "VERIFIED", "Operator verified drone video")
    assert verified["status"] == "VERIFIED"
    print(f"Incident {target_inc} status: {verified['status']}")

    # 2. Dispatch rescue alert
    payload = RescueAlertDispatchPayload(
        incident_id=target_inc,
        person_id="PERSON #12",
        priority="CRITICAL",
        distress_score=0.91,
        confidence=0.94,
        hazard="FLASH FLOOD",
        destination="NDRF Search & Rescue Battalion (Unit 10)",
        notes="Rapid inflatable watercraft dispatched",
        latitude=16.5466,
        longitude=81.5198,
    )
    disp_result = drone_incident_service.dispatch_rescue(payload)
    assert disp_result["success"] is True
    assert disp_result["status"] == "DISPATCHED"
    print(f"Dispatch result: {disp_result['message']}")
    print("[PASS] Incident Lifecycle Test PASSED")

def test_existing_models_intact():
    print("\n--- TEST 5: Verify Existing ML Models Are Intact ---")
    rf_path = os.path.join(os.path.dirname(__file__), "..", "backend", "ml_models", "landslide_model.pkl")
    unet_path = os.path.join(os.path.dirname(__file__), "..", "backend", "ml_models", "SIH26001_Landslide_UNet.keras")
    assert os.path.exists(rf_path), f"Random Forest model must exist at {rf_path}"
    assert os.path.exists(unet_path), f"U-Net model must exist at {unet_path}"
    print(f"Random Forest model exists: {rf_path}")
    print(f"U-Net model exists: {unet_path}")
    print("[PASS] Existing Models Intact Test PASSED")

if __name__ == "__main__":
    test_object_tracker()
    test_distress_scoring()
    test_georeferencing_integrity()
    test_incident_lifecycle()
    test_existing_models_intact()
    print("\n==========================================")
    print("ALL DRONE RESCUE SCANNER TESTS PASSED 100%")
    print("==========================================\n")
