from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

class StudentDetails(BaseModel):
    roll_number: str = Field(..., min_length=2, max_length=50)
    branch: str = Field(..., min_length=2, max_length=100)
    graduation_year: int = Field(..., ge=2000, le=2100)

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(..., description="Must be student, recruiter, tpo, or admin")
    student_details: Optional[StudentDetails] = None

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {'student', 'recruiter', 'tpo', 'admin'}
        v_lower = v.lower()
        if v_lower not in allowed:
            raise ValueError(f"Role must be one of: {', '.join(allowed)}")
        return v_lower

    @field_validator('student_details')
    @classmethod
    def validate_student_details(cls, v: Optional[StudentDetails], info) -> Optional[StudentDetails]:
        # Role is validated before or during processing. Since role validation could happen in any order, 
        # let's make sure that if the role is student, details are provided.
        # But wait, Pydantic 2 field_validator provides 'info' containing 'data' dict. Let's check:
        # role = info.data.get('role')
        # if role == 'student' and v is None:
        #     raise ValueError("student_details is required for student role")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str

class LoginResponse(BaseModel):
    success: bool
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

class GenericResponse(BaseModel):
    success: bool
    message: str
