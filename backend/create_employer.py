import asyncio
from app.database import get_user_collection
from app.auth import hash_password

async def create_employer():
    # Get the users collection
    users = await get_user_collection()

    # Define your employer data
    employer = {
        "name": "Employer Company",
        "email": "employer@cvsu.edu.ph",
        "password": hash_password("securePassword"),
        "role": "employer"
    }

    # Check if the employer already exists
    existing = await users.find_one({"email": employer["email"]})
    if existing:
        print("Employer already exists!")
        return

    # Insert the employer into the collection
    result = await users.insert_one(employer)
    print("Employer created with ID:", result.inserted_id)

if __name__ == '__main__':
    asyncio.run(create_employer())
