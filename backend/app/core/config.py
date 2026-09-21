import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
load_dotenv()

@dataclass
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/landslide_guard",
    )
    model_path: str = os.getenv("MODEL_PATH", "ml_models/landslide_model.pkl")
    cors_origins: list[str] = None
    low_max: float = float(os.getenv("LOW_MAX", "0.25"))
    moderate_max: float = float(os.getenv("MODERATE_MAX", "0.50"))
    elevated_max: float = float(os.getenv("ELEVATED_MAX", "0.75"))
    high_max: float = float(os.getenv("HIGH_MAX", "1.00"))
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    def __post_init__(self):
        raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
        self.cors_origins = [x.strip() for x in raw.split(",") if x.strip()]

settings = Settings()
