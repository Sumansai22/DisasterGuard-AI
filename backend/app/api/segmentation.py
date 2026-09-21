from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.land_scan import LandScanResult
from app.services.segmentation_service import segmentation_service
from app.services.gemini_vision_service import gemini_vision_service

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.get("/status", summary="Get Land Scan AI Model Status")
def get_model_status():
    """
    Returns status of both the underlying SIH26001 U-Net artifact and the active Google Gemini Vision inference engine.
    """
    candidate_paths = [
        Path("ml_models/SIH26001_Landslide_UNet.keras"),
        Path("backend/ml_models/SIH26001_Landslide_UNet.keras"),
        Path(__file__).resolve().parent.parent.parent / "ml_models" / "SIH26001_Landslide_UNet.keras",
    ]
    unet_file_exists = any(p.exists() for p in candidate_paths)
    unet_status = segmentation_service.get_status()
    gemini_configured = gemini_vision_service.is_configured

    return {
        "unet_available": bool(unet_file_exists or unet_status.get("is_ready", False)),
        "gemini_available": gemini_configured,
        "ai_land_scan_provider": "Google Gemini Vision",
        "gemini_model": getattr(gemini_vision_service, "_active_model", "gemini-3.6-flash"),
        "unet_details": unet_status,
        "status": "OPERATIONAL" if gemini_configured else "DEGRADED",
    }

@router.post("/predict", summary="Analyze Land / Terrain Image using Gemini Vision")
async def predict_land_scan(
    file: UploadFile = File(..., description="Terrain, satellite, or drone image (.jpg, .jpeg, .png, .webp, max 10MB)"),
    db: Session = Depends(get_db),
):
    """
    Accepts an uploaded terrain image, verifies size and format, and executes visual geohazard
    analysis via Google Gemini Vision API.
    """
    filename = file.filename or "unknown_image.jpg"
    ext = Path(filename).suffix.lower()

    # 1. Validate File Extension
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: .jpg, .jpeg, .png, .webp",
        )

    # 2. Validate MIME Type if provided
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{file.content_type}'. Please upload an image file.",
        )

    # 3. Read & Validate File Size
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded image stream: {str(exc)}",
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty.",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the 10 MB limit (received {round(len(contents) / (1024 * 1024), 2)} MB).",
        )

    # 4. Run Gemini Vision Inference
    result = gemini_vision_service.analyze_image(contents, filename)

    if not result.get("success", True):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result.get("error", "Gemini Vision analysis service is unavailable."),
        )

    # 5. Save Scan Metadata to Database if valid
    try:
        scan_record = LandScanResult(
            filename=filename,
            landslide_detected=bool(result.get("landslide_detected", False)),
            landslide_percentage=float(result.get("hazard_area_percent", result.get("landslide_percentage", 0.0))),
            severity=str(result.get("severity", "LOW")),
            confidence=float(result.get("gemini_confidence", result.get("confidence", 0.0))),
        )
        db.add(scan_record)
        db.commit()
        db.refresh(scan_record)
        result["scan_id"] = scan_record.id
        result["created_at"] = scan_record.created_at.isoformat()
    except Exception as db_exc:
        db.rollback()
        result["scan_id"] = None
        result["created_at"] = None

    return result

@router.get("/history", summary="Get Recent Land Scan History")
def get_scan_history(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    Returns real scan history records stored in the database.
    """
    try:
        scans = (
            db.query(LandScanResult)
            .order_by(desc(LandScanResult.created_at))
            .limit(min(100, max(1, limit)))
            .all()
        )
        return {
            "total": len(scans),
            "scans": [
                {
                    "id": s.id,
                    "filename": s.filename,
                    "landslide_detected": s.landslide_detected,
                    "landslide_percentage": s.landslide_percentage,
                    "hazard_area_percent": s.landslide_percentage,
                    "severity": s.severity,
                    "confidence": s.confidence,
                    "gemini_confidence": s.confidence,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in scans
            ],
        }
    except Exception:
        return {"total": 0, "scans": []}
