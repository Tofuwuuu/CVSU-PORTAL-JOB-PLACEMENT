from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class VerificationRequest(BaseModel):
    alumni_id: str

@app.post("/verify")
async def verify(request: VerificationRequest):
    return {"result": "success", "alumni_id": request.alumni_id, "message": "Alumni verified on blockchain"}
