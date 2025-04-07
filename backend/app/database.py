import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file if you use one

# Set up your MongoDB connection details (adjust as necessary)
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.get_database("cvsu_portal")  # Use your database name

# Collections
users_collection = database.get_collection("users")
jobs_collection = database.get_collection("jobs")
applications_collection = database.get_collection("applications")
profiles_collection = database.get_collection("profiles")  # Collection for student profiles

# Function to get collections
async def get_user_collection():
    return users_collection

async def get_job_collection():
    return jobs_collection

async def get_application_collection():
    return applications_collection

async def get_profile_collection():
    return profiles_collection
