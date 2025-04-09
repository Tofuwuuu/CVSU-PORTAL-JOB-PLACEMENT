from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
import requests  # For calling external blockchain API if needed
from bson import ObjectId
from app.database import get_user_collection, get_job_collection, get_application_collection
from app.models import UserCreate, UserLogin, UserResponse, Token, JobModel, ApplicationModel
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from pydantic import BaseModel
from typing import List, Optional
<<<<<<< HEAD
=======

>>>>>>> parent of e9a4337 (job and student profile)



def dummy_blockchain_verification(alumni_id: str):
    if alumni_id:
        return {"result": "success", "alumni_id": alumni_id, "message": "Alumni verified on blockchain"}
    else:
        raise HTTPException(status_code=400, detail="Invalid alumni ID")

app = FastAPI(
    title="CVSU Portal API",
    description="Unified API for user authentication, blockchain verification, and job placement for CVSU Alumni Portal",
    version="1.0.0"
)

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Authentication Endpoints
# --------------------------
@app.post("/api/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    users = await get_user_collection()
    existing_user = await users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if user.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    hashed_pw = hash_password(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": user.role
    }
    result = await users.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)  # Ensure the field 'id' exists
    return UserResponse(**new_user)

@app.post("/api/login", response_model=Token)
async def login_user(user: UserLogin):
    users = await get_user_collection()
    db_user = await users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(
        {"sub": db_user["email"], "role": db_user["role"]},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer", "role": db_user["role"]}

# --------------------------
# User Endpoints
# --------------------------
@app.get("/api/dashboard")
async def get_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="Admins should use /api/admin instead.")
    return {"message": f"Welcome to the user dashboard, {user['email']}!"}

# --------------------------
# Admin Endpoints
# --------------------------
@app.get("/api/admin")
async def admin_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    users = await get_user_collection()
    user_list = await users.find({}, {"password": 0}).to_list(100)
    for user_doc in user_list:
        user_doc["_id"] = str(user_doc["_id"])
    return user_list

@app.get("/api/admin/alumni")
async def get_alumni_data(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    users = await get_user_collection()
    alumni = await users.find({"role": "user"}).to_list(100)
    for alumnus in alumni:
        alumnus["_id"] = str(alumnus["_id"])
    return alumni

@app.post("/api/admin/verify/{alumni_id}")
async def verify_alumni_on_blockchain(alumni_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    try:
        result = dummy_blockchain_verification(alumni_id)
        return {"message": "Verification successful", "status": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")

# --------------------------
# Job Placement Endpoints
# --------------------------
@app.post("/api/admin/job", response_model=JobModel)
async def create_job(job: JobModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can create job postings")
    jobs = await get_job_collection()
    # Exclude the "id" field from the dictionary to allow MongoDB to generate _id
    job_data = job.dict(exclude={"id"})
    # Store employer's email for later filtering
    job_data["employer_email"] = user["email"]
    result = await jobs.insert_one(job_data)
    # Assign the generated _id to job.id
    job.id = str(result.inserted_id)
    return job

@app.get("/api/jobs", response_model=List[JobModel])
async def list_jobs():
    jobs = await get_job_collection()
    job_list = await jobs.find({}).to_list(100)
    for job in job_list:
        # Convert the generated _id to string and assign to "id"
        job["id"] = str(job["_id"])
        job.pop("_id", None)
    return job_list

@app.post("/api/admin/job", response_model=JobModel)
async def create_job(job: JobModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can create job postings")
    jobs = await get_job_collection()
    # Exclude the "id" field so that MongoDB auto-generates an _id
    job_data = job.dict(exclude={"id"})
    # Save the employer's email along with the job posting
    job_data["employer_email"] = user["email"]
    result = await jobs.insert_one(job_data)
    job.id = str(result.inserted_id)
    return job




@app.delete("/api/admin/job/{job_id}")
async def delete_job(job_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    jobs = await get_job_collection()
    result = await jobs.delete_one({"_id": ObjectId(job_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

@app.post("/api/user/apply", response_model=ApplicationModel)
async def apply_for_job(application: ApplicationModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Access forbidden: Only students can apply for jobs")
    
    applications = await get_application_collection()
    # Exclude applicant_email from the input so MongoDB doesn't get a null value
    application_data = application.dict(exclude={"applicant_email"}, exclude_unset=True)
    # Auto-populate applicant_email using the user's email from the token
    application_data["applicant_email"] = user["email"]
    
<<<<<<< HEAD
    
=======
>>>>>>> parent of e9a4337 (job and student profile)
    result = await applications.insert_one(application_data)
    application.id = str(result.inserted_id)
    application.applicant_email = user["email"]
    return application



<<<<<<< HEAD

=======
>>>>>>> parent of e9a4337 (job and student profile)
@app.post("/api/admin/create_employer", response_model=UserResponse)
async def create_employer(user: UserCreate, current_user: dict = Depends(get_current_user)):
    # Only allow this if the current user is an admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    
    # Enforce that the new user role must be 'employer'
    if user.role != "employer":
        raise HTTPException(status_code=400, detail="This endpoint is for creating employer accounts only. Set role to 'employer'.")
    
    users = await get_user_collection()
    existing_user = await users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_pw = hash_password(user.password)
    
    # Create a new employer user
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "role": "employer"
    }
    result = await users.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)  # Map the inserted_id to 'id'
    
    return UserResponse(**new_user)

@app.post("/api/user/apply", response_model=ApplicationModel)
async def apply_for_job(application: ApplicationModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Access forbidden: Alumni only")
    
    # Create a dictionary from the application payload, excluding applicant_email
    application_data = application.dict(exclude={"applicant_email"}, exclude_unset=True)
    # Auto-populate applicant_email from the authenticated user
    application_data["applicant_email"] = user["email"]
    
    applications = await get_application_collection()
    result = await applications.insert_one(application_data)
    
    # Update the application model with the generated id and the applicant email
    application.id = str(result.inserted_id)
    application.applicant_email = user["email"]
    
    return application

@app.get("/api/employer/applications/{job_id}", response_model=List[ApplicationModel])
async def get_applications_for_job(job_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can view applications")
    
    applications = await get_application_collection()
    app_list = await applications.find({"job_id": job_id}).to_list(100)
    for app in app_list:
        app["id"] = str(app["_id"])
        app.pop("_id", None)
    return app_list

@app.get("/api/employer/jobs", response_model=List[JobModel])
async def list_employer_jobs(user: dict = Depends(get_current_user)):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can access this endpoint")
    jobs = await get_job_collection()
    # Assuming you store an "employer_email" field when creating a job
    job_list = await jobs.find({"employer_email": user["email"]}).to_list(100)
    for job in job_list:
        job["id"] = str(job["_id"])
        job.pop("_id", None)
    return job_list

@app.get("/api/employer/job_stats", response_model=List[dict])
async def get_job_stats(user: dict = Depends(get_current_user)):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can access this endpoint")
    jobs = await get_job_collection()
    applications = await get_application_collection()
    
    # Filter jobs by the logged-in employer's email
    job_list = await jobs.find({"employer_email": user["email"]}).to_list(100)
    stats = []
    for job in job_list:
        job_id_str = str(job["_id"])
        # Count applications with job_id equal to this job's id (ensure job_id is stored as string in applications)
        app_count = await applications.count_documents({"job_id": job_id_str})
        stats.append({
            "job_id": job_id_str,
            "title": job.get("title", ""),
            "applications_count": app_count
        })
    return stats

# Example: Update application status endpoint for employers
@app.put("/api/employer/application/{application_id}/status")
async def update_application_status(application_id: str, status: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can update application status")
<<<<<<< HEAD
=======
    
>>>>>>> parent of e9a4337 (job and student profile)
    if status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Status must be either 'accepted' or 'declined'")
    
    applications = await get_application_collection()
    result = await applications.update_one({"_id": ObjectId(application_id)}, {"$set": {"status": status}})
<<<<<<< HEAD
    result = await applications.update_one({"_id": ObjectId(application_id)}, {"$set": {"status": status}})
=======
>>>>>>> parent of e9a4337 (job and student profile)
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found or status unchanged")
    
    return {"message": f"Application status updated to {status}"}
<<<<<<< HEAD

=======
>>>>>>> parent of e9a4337 (job and student profile)
