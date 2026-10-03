from pydantic import BaseModel, Field, constr, HttpUrl, validator
from typing import List, Optional, Dict
from datetime import datetime

class SocialLinks(BaseModel):
    github: Optional[HttpUrl] = None
    linkedin: Optional[HttpUrl] = None
    portfolio: Optional[HttpUrl] = None

class ProjectSchema(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    technologies: List[str] = []
    role: Optional[str] = None
    link: Optional[HttpUrl] = None
    github: Optional[HttpUrl] = None

class StudentProfileSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Unique ObjectId reference to users collection")
    full_name: Optional[str] = Field(None, min_length=2)
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$")
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    active_backlogs: Optional[int] = 0
    internship_experience: Optional[str] = None
    preferred_roles: List[str] = []
    skills: List[str] = []
    projects: List[ProjectSchema] = []
    links: Optional[SocialLinks] = Field(default_factory=SocialLinks)
    resume_id: Optional[str] = None
    placement_status: Optional[str] = Field(default="unplaced", description="unplaced | placed | optical")
    interview_readiness_score: Optional[float] = 0.0
    profile_completion: Optional[float] = 0.0
    profile_completed: bool = False
    preferences: Optional[Dict] = Field(default_factory=lambda: {
        "email_notifications": True,
        "interview_alerts": True,
        "job_alerts": True,
        "platform_updates": False,
        "profile_visibility": "public"
    })
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator("tenth_percentage", "twelfth_percentage", "cgpa", "profile_completion", "interview_readiness_score", pre=False)
    def validate_two_decimals(cls, v):
        if v is not None:
            v_str = str(v)
            if '.' in v_str and len(v_str.split('.')[1]) > 2:
                raise ValueError("Only up to two decimal places are allowed")
        return v

    class Config:
        populate_by_name = True
