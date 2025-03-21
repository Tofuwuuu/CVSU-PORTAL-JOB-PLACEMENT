from pydantic import BaseModel, EmailStr

# ✅ User Registration Schema (Includes Role)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "admin" or "user"

# ✅ User Login Schema (No Role Needed for Login)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ✅ User Response Schema (Include Role in Response)
class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str  # Include role in response

    class Config:
        from_attributes = True

# ✅ JWT Token Response Schema
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str  # Include role in JWT response

