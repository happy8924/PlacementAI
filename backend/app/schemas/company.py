from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CompanySchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str = Field(..., description="Unique company name")
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    recruiter_id: Optional[str] = Field(None, description="Reference to users collection")
    verification_status: str = Field(default="pending", description="pending | verified | rejected")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
