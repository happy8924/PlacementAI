from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobEligibility(BaseModel):
    min_cgpa: float = 0.0
    allowed_branches: List[str] = []

class JobSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    company_id: str = Field(..., description="Reference to companies collection")
    recruiter_id: str = Field(..., description="Reference to users collection")
    title: str
    description: str
    skills_required: List[str] = []
    package_lpa: Optional[float] = None
    location: Optional[str] = None
    eligibility: JobEligibility = Field(default_factory=JobEligibility)
    status: str = Field(default="active", description="active | closed | draft")
    application_deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
