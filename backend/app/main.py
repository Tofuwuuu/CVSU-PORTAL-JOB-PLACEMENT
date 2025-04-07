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
from app.database import get_application_collection
from app.auth import get_current_user
from app.models import UpdateStatusRequest  # Adjust import as needed
from app.models import ApplicationModel
from app.utils import send_email_notification
from app.database import get_profile_collection
from app.models import StudentProfileModel
from app.models import JobModel 


# Dummy blockchain verification function and model
class VerificationRequest(BaseModel):
    alumni_id: str

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
    application_data = application.dict(exclude={"applicant_email"}, exclude_unset=True)
    application_data["applicant_email"] = user["email"]
    result = await applications.insert_one(application_data)
    application.id = str(result.inserted_id)
    application.applicant_email = user["email"]
    
    # Send email notification to the employer
    # You need to retrieve the employer's email; assume it's stored in the job posting.
    # For demonstration, let's say the employer's email is "employer@cvsu.edu.ph"
    send_email_notification(
        recipient="employer@cvsu.edu.ph",
        subject="New Job Application Received",
        body=f"A new application for job {application_data.get('job_id')} has been submitted by {user['email']}."
    )
    
    return application


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
    
    # Ensure we convert _id to a string and store it as "id"
    for app in app_list:
        if "_id" in app:
            app["id"] = str(app["_id"])
            del app["_id"]
    
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

@app.put("/api/employer/application/{application_id}/status")
async def update_application_status(
    application_id: str,
    update: UpdateStatusRequest,
    user: dict = Depends(get_current_user)
):
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Access forbidden: Only employers can update application status")
    
    if update.status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Status must be either 'accepted' or 'declined'")
    
    applications = await get_application_collection()
    
    result = await applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found or status unchanged")
    
    # Retrieve the updated application to get the applicant's email
    updated_application = await applications.find_one({"_id": ObjectId(application_id)})
    applicant_email = updated_application.get("applicant_email", "unknown@example.com")
    
    send_email_notification(
        recipient=applicant_email,
        subject="Application Status Update",
        body=f"Your application for job {updated_application.get('job_id')} has been {update.status}."
    )
    
    return {"message": f"Application status updated to {update.status}"}

# GET endpoint to retrieve a student's profile
@app.get("/api/user/profile", response_model=StudentProfileModel)
async def get_student_profile(user: dict = Depends(get_current_user)):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Access forbidden: Only students have profiles")
    
    profiles = await get_profile_collection()
    profile = await profiles.find_one({"email": user["email"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Convert MongoDB _id to string and assign to id
    profile["id"] = str(profile["_id"])
    del profile["_id"]
    return profile

# PUT endpoint to update a student's profile
@app.put("/api/user/profile", response_model=StudentProfileModel)
async def update_student_profile(updated_profile: StudentProfileModel, user: dict = Depends(get_current_user)):
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="Access forbidden: Only students have profiles")
    
    profiles = await get_profile_collection()
    result = await profiles.update_one(
        {"email": user["email"]},
        {"$set": updated_profile.dict(exclude_unset=True)}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Profile not updated")
    
    return await get_student_profile(user)

@app.get("/api/job/{job_id}", response_model=JobModel)
async def get_job_detail(job_id: str, user: dict = Depends(get_current_user)):
    """
    Retrieves full job details by job ID.
    """
    jobs = await get_job_collection()
    try:
        job = await jobs.find_one({"_id": ObjectId(job_id)})
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    if job:
        job["id"] = str(job["_id"])  # Convert ObjectId to string
        del job["_id"]
        return job
    else:
        raise HTTPException(status_code=404, detail="Job not found")