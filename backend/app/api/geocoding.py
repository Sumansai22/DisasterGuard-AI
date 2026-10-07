"""
Global Geocoding & Place Search API Router
Exposes geographic place resolution endpoints for arbitrary cities, towns,
villages, and districts worldwide without requiring predefined telemetry stations.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from app.services.geocoding_service import geocoding_service

router = APIRouter()

@router.get("/search", summary="Search real-world geographic places and resolve coordinates")
@router.get("/places", summary="Alias for place search")
def search_places(
    q: str = Query(..., min_length=1, description="Search query string (e.g. Macherla, Manali, Chennai)"),
    limit: int = Query(8, ge=1, le=20, description="Max results to return")
) -> Dict[str, Any]:
    results = geocoding_service.search_places(query=q, limit=limit)
    return {
        "status": "success",
        "query": q,
        "count": len(results),
        "results": results
    }
