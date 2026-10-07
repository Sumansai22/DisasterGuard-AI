from pathlib import Path
import joblib
import pandas as pd
from app.core.config import settings

MODEL_FEATURES = [
    "Rainfall_mm",
    "Slope_Angle",
    "Soil_Saturation",
    "Vegetation_Cover",
    "Earthquake_Activity",
    "Proximity_to_Water",
    "Soil_Type_Gravel",
    "Soil_Type_Sand",
    "Soil_Type_Silt",
]

class MLService:
    def __init__(self):
        self.model = None
        self.model_path = Path(settings.model_path)
        self.feature_names = MODEL_FEATURES

    def load(self):
        candidate_paths = [
            self.model_path,
            Path("backend") / self.model_path,
            Path("backend/ml_models/landslide_model.pkl"),
            Path("ml_models/landslide_model.pkl"),
            Path(__file__).resolve().parent.parent.parent / "ml_models" / "landslide_model.pkl",
        ]
        resolved = None
        for p in candidate_paths:
            if p.exists():
                resolved = p
                break

        if not resolved:
            return False

        self.model = joblib.load(resolved)
        detected = getattr(self.model, "feature_names_in_", None)
        if detected is not None:
            detected = list(detected)
            if detected != self.feature_names:
                raise RuntimeError(
                    f"Model feature mismatch. Model expects {detected}, "
                    f"but backend is configured for {self.feature_names}."
                )
        if getattr(self.model, "n_features_in_", len(self.feature_names)) != len(self.feature_names):
            raise RuntimeError("Model expects a different number of features.")
        return True

    @property
    def available(self):
        return self.model is not None

    def predict(self, features: dict):
        if not self.available:
            raise RuntimeError(
                f"ML model not found/loaded at {self.model_path}. "
                "Place landslide_model.pkl in backend/ml_models/."
            )
        X = pd.DataFrame([[features[name] for name in self.feature_names]],
                         columns=self.feature_names)
        pred = int(self.model.predict(X)[0])
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X)[0]
            classes = list(getattr(self.model, "classes_", range(len(probs))))
            score = float(probs[classes.index(1)]) if 1 in classes else float(max(probs))
        else:
            score = float(pred)
        return pred, max(0.0, min(1.0, score))

ml_service = MLService()
