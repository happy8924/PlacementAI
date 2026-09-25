from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class PasswordResetTokenSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

    class Config:
        populate_by_name = True
