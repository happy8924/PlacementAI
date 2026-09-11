import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_reset_password_email(email: str, token: str):
    """
    Send password reset instructions.
    If SMTP server credentials are not fully configured, defaults to printing the token
    and instructions to the application console (safe local dev mode).
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    subject = "PlacementAI — Reset Your Password"
    body = f"""Hello,

We received a request to reset your password on PlacementAI.
Please click the link below to set a new password:

{reset_url}

This link is single-use and will expire in 60 minutes.

If you did not request a password reset, please ignore this email.

Best regards,
The PlacementAI Team
"""

    # Check if SMTP configuration is present
    if not all([settings.SMTP_HOST, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
        logger.warning("SMTP is not configured. Falling back to console logging.")
        print("\n" + "=" * 60)
        print("DEVELOPMENT MODE: PASSWORD RESET EMAIL SIMULATION")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"Reset Link: {reset_url}")
        print("=" * 60 + "\n")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Standard SMTP connection
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, email, msg.as_string())
        server.quit()
        logger.info(f"Password reset email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send email via SMTP to {email}: {e}")
        # Log to console as emergency fallback
        print("\n" + "!" * 60)
        print("SMTP SEND ERROR: FALLING BACK TO CONSOLE PRINTING")
        print(f"To: {email}")
        print(f"Reset Link: {reset_url}")
        print("!" * 60 + "\n")


def send_otp_email(email: str, otp: str):
    """
    Send a 6-digit OTP for email verification during registration.
    Falls back to console printing in local dev mode (same as password reset).
    """
    subject = "PlacementAI — Your Email Verification OTP"
    body = f"""Hello,

Your email verification code for PlacementAI registration is:

    {otp}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.

Best regards,
The PlacementAI Team
"""

    # Check if SMTP configuration is present
    if not all([settings.SMTP_HOST, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
        logger.warning("SMTP is not configured. Falling back to console OTP logging.")
        print("\n" + "=" * 60)
        print("DEVELOPMENT MODE: OTP EMAIL SIMULATION")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"OTP Code: {otp}")
        print("=" * 60 + "\n")
        return

    smtp_host = settings.SMTP_HOST.strip()
    smtp_username = settings.SMTP_USERNAME.strip()
    smtp_password = settings.SMTP_PASSWORD.replace(" ", "").strip()
    from_address = (settings.SMTP_FROM_EMAIL or smtp_username).strip()

    try:
        msg = MIMEMultipart()
        msg['From'] = from_address
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(smtp_host, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(smtp_host, settings.SMTP_PORT)
            server.starttls()

        server.login(smtp_username, smtp_password)
        server.sendmail(from_address, email, msg.as_string())
        server.quit()
        logger.info(f"OTP email sent to {email}")
        print(f"✓ OTP Email successfully dispatched to {email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email via SMTP to {email}: {e}")
        print("\n" + "!" * 60)
        print("SMTP SEND ERROR: Could not send email via SMTP server.")
        print(f"Error Details: {e}")
        print(f"To: {email}")
        print(f"OTP Code: {otp}")
        print("!" * 60 + "\n")
