from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StudentProfileCreate(BaseModel):
    user_id: str
    roll_number: str = Field(..., min_length=2, max_length=50)
    branch: str = Field(..., min_length=2, max_length=100)
    graduation_year: int = Field(..., ge=2000, le=2100)
    cgpa: float = Field(..., ge=0.0, le=10.0)
    skills: List[str] = []
    resume_url: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

class StudentProfileResponse(StudentProfileCreate):
    id: str
    created_at: datetime
    updated_at: datetime
