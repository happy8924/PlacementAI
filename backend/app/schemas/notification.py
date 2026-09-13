from pydantic import BaseModel, Field
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = Field("info", description="info, success, warning, alert")

class NotificationResponse(NotificationCreate):
    id: str
    read: bool = False
    created_at: datetime
