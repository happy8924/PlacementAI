from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AIAnalysisSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    resume_id: str = Field(..., description="Reference to resumes collection")
    user_id: str = Field(..., description="Reference to users collection")
    ats_score: Optional[float] = None
    skills_detected: List[str] = []
    missing_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommended_skills: List[str] = []
    recommended_roles: List[str] = []
    primary_role: Optional[str] = None
    match_score: Optional[float] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
