from datetime import datetime
from pydantic import BaseModel

class AlertOut(BaseModel):
    id: int
    station_id: int
    prediction_id: int | None
    alert_level: str
    message: str
    is_acknowledged: bool
    created_at: datetime
    acknowledged_at: datetime | None
    model_config = {"from_attributes": True}
