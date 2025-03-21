from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr

# Updated email configuration (adjust with your credentials)
conf = ConnectionConfig(
    MAIL_USERNAME="cc.roderick.salise@cvsu.edu.ph",
    MAIL_PASSWORD="cc.roderick.salise@cvsu.edu.ph",
    MAIL_FROM="your-email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="Your Name or App",
    MAIL_STARTTLS=True,      # Instead of MAIL_TLS
    MAIL_SSL_TLS=False,      # Instead of MAIL_SSL
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Email schema for password reset
class ResetPasswordEmail(BaseModel):
    email: EmailStr
    token: str

# Send password reset email
async def send_reset_email(email: str, token: str):
    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email],
        body=f"Click the link to reset your password: http://localhost:5173/reset-password?token={token}",
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
