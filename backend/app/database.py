from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "cvsu_alumni"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def get_user_collection():
    return db["users"]
