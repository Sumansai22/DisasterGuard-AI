"""
Hazards Engine Module
=====================
Handles multi-hazard risk engine, Random Forest landslide predictions,
U-Net segmentation, Gemini vision land scan, and drone vision AI.
"""

from app.services.multi_hazard_engine import multi_hazard_engine
from app.services.ml_service import ml_service
from app.services.segmentation_service import segmentation_service
from app.services.gemini_vision_service import gemini_vision_service
from app.services.drone_vision_service import drone_vision_service
from app.services.alert_service import create_alert_if_needed

class HazardsEngine:
    def __init__(self):
        self.multi_hazard = multi_hazard_engine
        self.random_forest = ml_service
        self.unet = segmentation_service
        self.gemini = gemini_vision_service
        self.drone_vision = drone_vision_service
        self.create_alert_if_needed = create_alert_if_needed

    def evaluate_multi_hazard_risk(self, lat: float, lng: float, location_name: str, rainfall_mm: float = 0.0):
        return self.multi_hazard.calculate_location_risk(lat, lng, location_name, rainfall_mm)

    def predict_landslide(self, features: dict):
        return self.random_forest.predict(features)

    def segment_land(self, image_bytes: bytes):
        return self.unet.segment(image_bytes)

    def analyze_drone_frame(self, frame_bytes: bytes, hazard: str = "FLASH FLOOD"):
        return self.drone_vision.detect_persons(frame_bytes, hazard_context=hazard)

hazards_engine = HazardsEngine()
