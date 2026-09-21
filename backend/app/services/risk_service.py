from app.core.config import settings

def risk_level(score: float) -> str:
    if score <= settings.low_max:
        return "LOW"
    if score <= settings.moderate_max:
        return "MODERATE"
    if score <= settings.elevated_max:
        return "ELEVATED"
    return "HIGH"
