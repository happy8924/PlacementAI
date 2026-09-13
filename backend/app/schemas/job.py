from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    company_name: str = Field(..., min_length=2, max_length=150)
    location: str
    job_type: str = Field("Full-time", description="Full-time, Part-time, Internship")
    description: str
    requirements: List[str] = []
    min_cgpa: float = Field(0.0, ge=0.0, le=10.0)
    eligible_branches: List[str] = []
    salary_package: str
    deadline: datetime
    status: str = Field("open", description="open or closed")

class JobResponse(JobCreate):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
