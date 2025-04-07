from pydantic import BaseModel, Field, EmailStr
from typing import Optional

# User Models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class JobModel(BaseModel):
    id: Optional[str] = None  # Use "id" directly
    title: str
    description: str
    company: str
    location: str
    requirements: str

    class Config:
        orm_mode = True


class ApplicationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    job_id: str
    applicant_email: Optional[str] = None
    cover_letter: str
    status: Optional[str] = "pending"

    class Config:
        allow_population_by_field_name = True
        orm_mode = True

class UpdateStatusRequest(BaseModel):
    status: str

class StudentProfileModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    skills: Optional[str] = None
    resume_url: Optional[str] = None  # URL to an uploaded resume
    bio: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
