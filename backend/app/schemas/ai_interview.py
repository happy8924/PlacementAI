from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AIInterviewCreate(BaseModel):
    student_id: str
    job_role: str
    overall_score: float = Field(..., ge=0.0, le=100.0)
    feedback: str
    transcript: List[Dict[str, Any]] = []

class AIInterviewResponse(AIInterviewCreate):
    id: str
    created_at: datetime
