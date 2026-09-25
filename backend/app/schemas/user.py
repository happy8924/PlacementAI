from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., description="student | recruiter | tpo | admin")
    is_approved: bool = False
    is_active: bool = True

class UserCreate(UserBase):
    password_hash: str

class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
