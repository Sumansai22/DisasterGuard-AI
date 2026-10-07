import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current directory, backend directory, and root workspace
for candidate in [
    Path(".env"),
    Path("backend/.env"),
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent.parent / ".env",
]:
    if candidate.exists():
        load_dotenv(dotenv_path=candidate)

load_dotenv()

@dataclass
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./landslide_guard.db",
    )
    model_path: str = os.getenv("MODEL_PATH", "ml_models/landslide_model.pkl")
    cors_origins: list[str] = None
    low_max: float = float(os.getenv("LOW_MAX", "0.25"))
    moderate_max: float = float(os.getenv("MODERATE_MAX", "0.50"))
    elevated_max: float = float(os.getenv("ELEVATED_MAX", "0.75"))
    high_max: float = float(os.getenv("HIGH_MAX", "1.00"))
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    google_routes_api_key: str = os.getenv("GOOGLE_ROUTES_API_KEY", "")

    def __post_init__(self):
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost:8008",
            "http://127.0.0.1:8008",
        ]
        
        frontend_url = os.getenv("FRONTEND_URL", "").strip()
        if frontend_url:
            for item in frontend_url.split(","):
                cleaned = item.strip().rstrip("/")
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)

        raw_cors = os.getenv("CORS_ORIGINS", "").strip()
        if raw_cors:
            for item in raw_cors.split(","):
                cleaned = item.strip().rstrip("/")
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)

        self.cors_origins = origins

settings = Settings()

