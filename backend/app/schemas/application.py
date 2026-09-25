from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ApplicationMatchDetails(BaseModel):
    matched_skills: List[str] = []
    missing_skills: List[str] = []

class ApplicationSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    job_id: str = Field(..., description="Reference to jobs collection")
    student_id: str = Field(..., description="Reference to users/student_profiles collection")
    resume_id: Optional[str] = Field(None, description="Reference to resumes collection")
    resume_match_score: Optional[float] = None
    match_details: ApplicationMatchDetails = Field(default_factory=ApplicationMatchDetails)
    status: str = Field(default="applied", description="applied | shortlisted | rejected | selected")
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
