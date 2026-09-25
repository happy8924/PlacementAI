from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ActivityLogSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Reference to users collection")
    action: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
