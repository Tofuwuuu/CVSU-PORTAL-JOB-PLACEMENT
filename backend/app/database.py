import motor.motor_asyncio

client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
db = client["cvsu_portal"]

async def get_user_collection():
    return db["users"]

async def get_job_collection():
    return db["jobs"]

async def get_application_collection():
    return db["applications"]
