from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PlacementStatsSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    total_students: int = 0
    total_companies: int = 0
    total_jobs: int = 0
    placements: int = 0
    average_salary: float = 0.0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
