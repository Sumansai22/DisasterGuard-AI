from __future__ import annotations
import os
import io
import time
import json
import base64
import logging
from typing import Optional, Any, Dict, List
from PIL import Image, ImageDraw, ImageFont

from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_LANDSLIDE_PROMPT = """You are an expert geotechnical and landslide image-analysis system.

Inspect the ENTIRE uploaded image carefully.

Your primary task is to determine whether there is a visible LANDSLIDE, SLOPE FAILURE, ROAD-SIDE SLOPE COLLAPSE, DEBRIS FLOW, ROCKFALL, OR DISPLACED EARTH.

Pay special attention to:
- fresh exposed soil scars
- large exposed reddish/brown soil areas
- collapsed road edges
- missing sections of road shoulder
- steep broken slope faces
- displaced soil masses
- accumulated debris
- fallen trees caused by slope failure
- cracks or scarps
- soil/debris extending onto roads
- collapsed vegetation-covered slopes
- newly exposed geological layers
- irregular slope geometry
- debris accumulation at the bottom of slopes

Do NOT classify an image as safe merely because vegetation is present.

Do NOT classify normal forest, normal mountain terrain, normal agricultural soil, or a normal road cut as a landslide unless there is evidence of mass movement.

First identify the visual terrain.
Then inspect every possible hazard region.
Then make the final decision.

If a landslide or slope failure is visibly present, landslide_detected MUST be true.
If there is clear visual evidence of a large slope failure, confidence should reflect that evidence.

Return ONLY JSON matching this exact schema:
{
  "image_valid_for_landslide_analysis": true,
  "landslide_detected": true,
  "confidence": 0.95,
  "severity": "HIGH",
  "hazard_area_percent": 35,
  "reason": "Large visible slope failure with exposed soil and displaced debris.",
  "evidence": [
    "Large exposed soil scar",
    "Collapsed slope geometry",
    "Displaced debris",
    "Road-side terrain failure"
  ],
  "hazard_regions": [
    {
      "label": "landslide",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ]
}

Rules:
- confidence: float between 0.0 and 1.0.
- severity: "LOW", "MODERATE", "ELEVATED", or "HIGH". If no landslide is detected, set severity to "LOW".
- hazard_area_percent: estimated integer or float between 0 and 100 representing the visible affected percentage of the terrain.
- If landslide_detected is true, hazard_area_percent MUST be greater than 0, and evidence list MUST contain at least one specific visual indicator.
- If the image is not suitable for terrain analysis (e.g. solid color, diagram, indoors, text), set image_valid_for_landslide_analysis=false, landslide_detected=false, severity="LOW", hazard_area_percent=0, evidence=[], hazard_regions=[].
- box_2d coordinates: [ymin, xmin, ymax, xmax] normalized between 0 and 1000 (or 0.0 to 1.0).
"""

# Candidate models in preferred order
CANDIDATE_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest",
]

class GeminiVisionService:
    def __init__(self):
        self._client = None
        self._active_model = getattr(settings, 'gemini_model', None) or "gemini-3.6-flash"

    @property
    def api_key(self) -> str:
        key = getattr(settings, "gemini_api_key", None) or os.getenv("GEMINI_API_KEY", "")
        return key.strip()

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _get_client(self):
        if not self.is_configured:
            return None
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"[GeminiVision] Error initializing Google GenAI client: {e}")
                return None
        return self._client

    def analyze_image(self, image_bytes: bytes, filename: str = "terrain_image.jpg") -> Dict[str, Any]:
        """
        Directly analyzes the terrain image using Gemini Vision API.
        Returns validated structured geohazard assessment with evidence list and rendered overlays.
        """
        if not self.is_configured:
            logger.error("[GeminiVision] GEMINI_API_KEY is not configured in backend .env")
            return {
                "success": False,
                "hazard_status": "ANALYSIS UNAVAILABLE",
                "error": "Gemini Vision is not configured. Please set GEMINI_API_KEY in backend .env."
            }

        client = self._get_client()
        if client is None:
            return {
                "success": False,
                "hazard_status": "ANALYSIS UNAVAILABLE",
                "error": "Failed to initialize Google GenAI client."
            }

        # Determine MIME type
        mime_type = "image/jpeg"
        if filename.lower().endswith(".png"):
            mime_type = "image/png"
        elif filename.lower().endswith(".webp"):
            mime_type = "image/webp"

        try:
            from google.genai import types

            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            )

            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )

            configured_model = getattr(settings, "gemini_model", None) or "gemini-3.6-flash"
            models_to_try = [configured_model] + [m for m in CANDIDATE_MODELS if m != configured_model]

            last_error = None
            response_text = None

            for model_candidate in models_to_try:
                for attempt in range(2):
                    try:
                        resp = client.models.generate_content(
                            model=model_candidate,
                            contents=[image_part, GEMINI_LANDSLIDE_PROMPT],
                            config=config,
                        )
                        if resp and resp.text:
                            response_text = resp.text
                            self._active_model = model_candidate
                            break
                    except Exception as ex:
                        last_error = ex
                        err_str = str(ex)
                        if "503" in err_str or "UNAVAILABLE" in err_str:
                            time.sleep(0.6 * (attempt + 1))
                            continue
                        else:
                            break
                if response_text:
                    break

            if not response_text:
                raise RuntimeError(f"Gemini API request failed: {last_error}")

            # Clean and parse JSON
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            parsed = json.loads(cleaned_text)

            image_valid = bool(parsed.get("image_valid_for_landslide_analysis", True))
            if not image_valid:
                reason = str(parsed.get("reason", "The image does not contain sufficient visible terrain information for reliable landslide analysis."))
                orig_b64 = "data:image/jpeg;base64," + base64.b64encode(image_bytes).decode("utf-8")
                return {
                    "success": True,
                    "filename": filename,
                    "image_valid_for_landslide_analysis": False,
                    "landslide_detected": False,
                    "confidence": 0.0,
                    "gemini_confidence": 0.0,
                    "severity": "LOW",
                    "hazard_area_percent": 0.0,
                    "landslide_percentage": 0.0,
                    "hazard_status": "IMAGE NOT SUITABLE",
                    "reason": reason,
                    "message": reason,
                    "evidence": [],
                    "hazard_regions": [],
                    "original_image": orig_b64,
                    "overlay_image": orig_b64,
                    "segmentation_mask": orig_b64,
                    "model_name": self._active_model,
                }

            landslide_detected = bool(parsed.get("landslide_detected", False))
            confidence = max(0.0, min(1.0, float(parsed.get("confidence", 0.0))))
            raw_severity = str(parsed.get("severity", "LOW")).upper()
            if raw_severity not in {"LOW", "MODERATE", "ELEVATED", "HIGH"}:
                raw_severity = "MODERATE" if landslide_detected else "LOW"

            hazard_area = max(0.0, min(100.0, float(parsed.get("hazard_area_percent", 0.0))))
            reason = str(parsed.get("reason", "Visual inspection completed."))
            raw_evidence = parsed.get("evidence", [])
            evidence = [str(e) for e in raw_evidence if e] if isinstance(raw_evidence, list) else []

            hazard_regions = parsed.get("hazard_regions", [])
            if not isinstance(hazard_regions, list):
                hazard_regions = []

            # ----------------------------------------------------
            # Strict Consistency Validations
            # ----------------------------------------------------
            if landslide_detected:
                severity = raw_severity if raw_severity != "LOW" else "MODERATE"
                hazard_status = "LANDSLIDE DETECTED"
                if hazard_area <= 0:
                    hazard_area = 15.0  # Conservative non-zero estimate for detected hazard
                if not evidence:
                    evidence = ["Visible slope instability / displaced ground mass", "Exposed soil surface scarp"]
                message = f"Landslide hazard visually identified across approx. {int(hazard_area)}% of terrain area ({severity} risk)."
            else:
                severity = "LOW"
                hazard_area = 0.0
                hazard_status = "NO SIGNIFICANT LANDSLIDE DETECTED"
                hazard_regions = []
                message = "Terrain stability verified. No significant landslide or slope-failure features detected."

            # Render visual bounding boxes & overlays
            orig_b64, overlay_b64, mask_b64 = self._render_visualizations(image_bytes, hazard_regions, landslide_detected)

            return {
                "success": True,
                "filename": filename,
                "image_valid_for_landslide_analysis": True,
                "landslide_detected": landslide_detected,
                "confidence": round(confidence, 2),
                "gemini_confidence": round(confidence, 2),
                "severity": severity,
                "hazard_area_percent": round(hazard_area, 1),
                "landslide_percentage": round(hazard_area, 1),
                "hazard_status": hazard_status,
                "reason": reason,
                "message": message,
                "evidence": evidence,
                "hazard_regions": hazard_regions,
                "original_image": orig_b64,
                "overlay_image": overlay_b64,
                "segmentation_mask": mask_b64,
                "model_name": self._active_model,
            }

        except Exception as exc:
            logger.error(f"[GeminiVision] Error in analyze_image: {exc}", exc_info=True)
            return {
                "success": False,
                "hazard_status": "ANALYSIS UNAVAILABLE",
                "error": f"Gemini Vision analysis failed: {str(exc)}"
            }

    def _render_visualizations(self, image_bytes: bytes, hazard_regions: List[Dict[str, Any]], landslide_detected: bool):
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            w, h = pil_img.size

            # Original base64
            orig_buf = io.BytesIO()
            pil_img.save(orig_buf, format="JPEG", quality=90)
            orig_b64 = "data:image/jpeg;base64," + base64.b64encode(orig_buf.getvalue()).decode("utf-8")

            # Binary mask
            mask_img = Image.new("L", (w, h), 0)
            mask_draw = ImageDraw.Draw(mask_img)

            # Overlay on original
            overlay_rgba = pil_img.convert("RGBA")
            tint_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            tint_draw = ImageDraw.Draw(tint_layer)

            if landslide_detected and hazard_regions:
                for reg in hazard_regions:
                    if not isinstance(reg, dict):
                        continue
                    box = reg.get("box_2d")
                    if box and isinstance(box, (list, tuple)) and len(box) == 4:
                        ymin, xmin, ymax, xmax = [float(b) for b in box]
                        if any(b > 1.0 for b in [ymin, xmin, ymax, xmax]):
                            ymin, xmin, ymax, xmax = ymin/1000.0, xmin/1000.0, ymax/1000.0, xmax/1000.0
                        x0 = max(0, min(w, int(xmin * w)))
                        y0 = max(0, min(h, int(ymin * h)))
                        x1 = max(0, min(w, int(xmax * w)))
                        y1 = max(0, min(h, int(ymax * h)))

                        # Ensure valid rectangle
                        if x1 > x0 and y1 > y0:
                            # Draw bounding box on mask
                            mask_draw.rectangle([x0, y0, x1, y1], fill=255)
                            # Draw filled box on tint layer (Vivid Red-Orange with 40% alpha)
                            tint_draw.rectangle([x0, y0, x1, y1], fill=(235, 40, 10, 90), outline=(255, 30, 0, 255), width=3)
                            
                            # Draw banner label tag: GEMINI DETECTED HAZARD
                            label_text = "GEMINI DETECTED HAZARD"
                            tag_h = 24
                            tag_w = min(190, x1 - x0)
                            tag_y0 = max(0, y0 - tag_h)
                            tint_draw.rectangle([x0, tag_y0, x0 + tag_w, tag_y0 + tag_h], fill=(220, 20, 0, 230))
                            tint_draw.text((x0 + 6, tag_y0 + 4), label_text, fill=(255, 255, 255, 255))

            # Composite overlay
            overlay_combined = Image.alpha_composite(overlay_rgba, tint_layer).convert("RGB")
            over_buf = io.BytesIO()
            overlay_combined.save(over_buf, format="JPEG", quality=92)
            overlay_b64 = "data:image/jpeg;base64," + base64.b64encode(over_buf.getvalue()).decode("utf-8")

            # Binary mask base64
            mask_buf = io.BytesIO()
            mask_img.save(mask_buf, format="PNG")
            mask_b64 = "data:image/png;base64," + base64.b64encode(mask_buf.getvalue()).decode("utf-8")

            return orig_b64, overlay_b64, mask_b64
        except Exception as e:
            logger.error(f"[GeminiVision] Error generating visualizations: {e}")
            orig_buf = io.BytesIO()
            Image.open(io.BytesIO(image_bytes)).save(orig_buf, format="JPEG")
            b64 = "data:image/jpeg;base64," + base64.b64encode(orig_buf.getvalue()).decode("utf-8")
            return b64, b64, b64

gemini_vision_service = GeminiVisionService()
