from fastapi import FastAPI, Depends, HTTPException, status
from app.database import get_user_collection
from app.models import UserCreate, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token
from datetime import timedelta

app = FastAPI()

# Register a New User
@app.post("/api/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    users = await get_user_collection()
    existing_user = await users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    new_user = {"name": user.name, "email": user.email, "password": hashed_pw}

    result = await users.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)  # Convert ObjectId to string

    return UserResponse(id=new_user["_id"], name=new_user["name"], email=new_user["email"])

# Login User
@app.post("/api/login", response_model=Token)
async def login_user(user: UserCreate):
    users = await get_user_collection()
    db_user = await users.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token({"sub": db_user["email"]}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}
