from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class InterviewTranscriptItem(BaseModel):
    speaker: str = Field(..., description="ai | user")
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class InterviewSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Reference to users collection")
    job_role: str
    difficulty: str = Field(default="medium", description="easy | medium | hard")
    transcript: List[InterviewTranscriptItem] = []
    grading: Optional[Dict[str, Any]] = None
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
