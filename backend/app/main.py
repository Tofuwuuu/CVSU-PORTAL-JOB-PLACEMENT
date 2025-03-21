from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from app.database import get_user_collection
from app.models import UserCreate, UserLogin, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token, get_current_user

app = FastAPI()

# Add CORS middleware so that OPTIONS and other CORS requests are handled
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL (e.g., "http://localhost:5173") in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER a New User
@app.post("/api/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    users = await get_user_collection()
    existing_user = await users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if user.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    hashed_pw = hash_password(user.password)
    new_user = {"name": user.name, "email": user.email, "password": hashed_pw, "role": user.role}
    result = await users.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    return UserResponse(id=new_user["_id"], name=new_user["name"], email=new_user["email"], role=new_user["role"])

# LOGIN User
@app.post("/api/login", response_model=Token)
async def login_user(user: UserLogin):
    users = await get_user_collection()
    db_user = await users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token({"sub": db_user["email"], "role": db_user["role"]}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer", "role": db_user["role"]}

# PROTECTED ADMIN ROUTE
@app.get("/api/admin")
async def admin_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    return {"message": f"Welcome, Admin {user['email']}!"}

# PROTECTED USER DASHBOARD ROUTE
@app.get("/api/dashboard")
async def get_dashboard(user: dict = Depends(get_current_user)):
    print("Decoded user:", user)  # Debugging line
    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="Admins should use /api/admin instead.")
    return {"message": f"Welcome to the user dashboard, {user['email']}!"}
