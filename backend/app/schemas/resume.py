from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResumeSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Reference to users collection")
    file_url: str = Field(..., description="Cloudinary file URL")
    cloudinary_public_id: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    extracted_data: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
    skills_detected: List[str] = []
    missing_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    feedback: Optional[str] = None
    suitable_roles: List[str] = []
    primary_role: Optional[str] = None
    analysis_status: str = Field(default="pending", description="pending | in_progress | completed | failed")
    is_active: bool = Field(default=True, description="Only one active resume per student")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
