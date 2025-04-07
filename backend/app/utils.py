import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables from a .env file (if you choose to use one)
load_dotenv()

def send_email_notification(recipient: str, subject: str, body: str):
    """
    Sends an email notification using the CVSU SMTP settings.
    The SMTP configuration is loaded from environment variables.
    """
    # Example SMTP settings: adjust these with your actual credentials
    smtp_server = os.getenv("SMTP_SERVER", "smtp.cvsu.edu.ph")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "cc.roderick.salise@cvsu.edu.ph")
    smtp_pass = os.getenv("SMTP_PASS", "dekdek812")  # Replace with your password or app password

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = recipient

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Start TLS for security
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print(f"Email sent to {recipient}")
    except Exception as e:
        print(f"Error sending email: {str(e)}")
