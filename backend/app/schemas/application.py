from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    job_id: str
    student_id: str
    resume_url: Optional[str] = None
    cover_note: Optional[str] = None

class ApplicationResponse(ApplicationCreate):
    id: str
    status: str = Field("applied", description="applied, shortlisted, rejected, selected")
    applied_at: datetime
    updated_at: datetime
