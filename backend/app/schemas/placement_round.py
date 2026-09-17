from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PlacementRoundSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    application_id: str = Field(..., description="Reference to applications collection")
    round_type: str = Field(..., description="e.g. Aptitude, Technical, HR")
    scheduled_at: Optional[datetime] = None
    result: Optional[str] = Field(default="pending", description="pending | pass | fail | skipped")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
