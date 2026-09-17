from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class SocialLinks(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None

class StudentProfileSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Unique ObjectId reference to users collection")
    full_name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    skills: List[str] = []
    links: Optional[SocialLinks] = Field(default_factory=SocialLinks)
    resume_id: Optional[str] = None
    placement_status: Optional[str] = Field(default="unplaced", description="unplaced | placed | optical")
    interview_readiness_score: Optional[float] = 0.0
    profile_completion: Optional[float] = 0.0
    profile_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
