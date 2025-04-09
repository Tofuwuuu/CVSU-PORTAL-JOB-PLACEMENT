from pydantic import BaseModel, Field
from typing import Optional

<<<<<<< HEAD
# User Models
=======
>>>>>>> parent of e26d513 (adding Admin to database)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
<<<<<<< HEAD
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
    applicant_email: Optional[str] = None  # Auto-populated
    cover_letter: str
    status: Optional[str] = "pending"  # New field; default is "pending"

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
=======

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
>>>>>>> parent of e26d513 (adding Admin to database)
