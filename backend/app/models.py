from pydantic import BaseModel, Field
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

# Job Placement Models
class JobModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: str
    company: str
    location: str
    requirements: str

class ApplicationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    job_id: str
    applicant_email: str
    cover_letter: str
