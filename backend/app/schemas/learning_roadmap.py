from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RoadmapStep(BaseModel):
    step_number: int
    skill_name: str
    topics_to_cover: List[str] = []
    recommended_resources: List[str] = []
    completed: bool = False
    completed_at: Optional[datetime] = None

class LearningRoadmapSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(..., description="Reference to users collection")
    resume_id: Optional[str] = Field(None, description="Reference to resumes collection")
    ai_analysis_id: Optional[str] = Field(None, description="Reference to ai_analysis collection")
    target_role: str
    skill_gaps: List[str] = []
    roadmap: List[RoadmapStep] = []
    overall_progress: float = 0.0
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
