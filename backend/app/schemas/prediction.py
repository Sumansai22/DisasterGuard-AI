from datetime import datetime
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    station_id: int
    Rainfall_mm: float = Field(ge=0)
    Slope_Angle: float
    Soil_Saturation: float = Field(ge=0)
    Vegetation_Cover: float = Field(ge=0)
    Earthquake_Activity: float = Field(ge=0)
    Proximity_to_Water: float = Field(ge=0)
    Soil_Type_Gravel: float = Field(ge=0, le=1)
    Soil_Type_Sand: float = Field(ge=0, le=1)
    Soil_Type_Silt: float = Field(ge=0, le=1)

class PredictionOut(BaseModel):
    id: int
    station_id: int
    prediction: int
    risk_score: float
    risk_level: str
    message: str
    created_at: datetime
    model_config = {"from_attributes": True}
