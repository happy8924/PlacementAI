import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_smtp_credentials():
    smtp_host = (settings.SMTP_HOST or "").strip()
    smtp_port = settings.SMTP_PORT or 587
    smtp_username = (settings.SMTP_USERNAME or "").strip()
    smtp_password = (settings.SMTP_PASSWORD or "").replace(" ", "").strip()
    from_address = (settings.SMTP_FROM_EMAIL or smtp_username).strip()
    return smtp_host, smtp_port, smtp_username, smtp_password, from_address

def send_reset_password_email(email: str, token: str):
    """
    Send password reset instructions to the requested email.
    Uses HTML + Plain text email format over SMTP.
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "PlacementAI — Reset Your Password"
    
    smtp_host, smtp_port, smtp_username, smtp_password, from_address = _get_smtp_credentials()

    # Plain text version
    text_body = f"""Hello,

We received a request to reset your password on PlacementAI.
Please click the link below to set a new password:

{reset_url}

This link is single-use and will expire in 60 minutes.

If you did not request a password reset, please ignore this email.

Best regards,
The PlacementAI Team
"""

    # HTML version for modern email clients
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0b132b; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
        .brand {{ font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 24px; font-family: monospace; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-family: monospace; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">Placement<span style="color: #4f46e5;">AI</span></div>
        <h2 style="font-size: 18px; margin-top: 0;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your PlacementAI account.</p>
        <p>Click the button below to set a new password:</p>
        <a href="{reset_url}" class="btn" target="_blank">Reset Password →</a>
        <p style="font-size: 12px; color: #64748b;">Or copy and paste this URL into your browser:<br><a href="{reset_url}" style="color: #2563eb;">{reset_url}</a></p>
        <p style="font-size: 12px; color: #64748b;">This link will expire in 60 minutes.</p>
        <div class="footer">
          If you did not request a password reset, please ignore this email.<br>
          © PlacementAI Intelligence Platform.
        </div>
      </div>
    </body>
    </html>
    """

    if not all([smtp_host, smtp_username, smtp_password]):
        logger.warning("SMTP credentials incomplete. Falling back to console printing.")
        print("\n" + "=" * 60)
        print("DEVELOPMENT MODE: PASSWORD RESET EMAIL SIMULATION")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"Reset Link: {reset_url}")
        print("=" * 60 + "\n")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg['From'] = from_address
        msg['To'] = email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()

        server.login(smtp_username, smtp_password)
        server.sendmail(from_address, email, msg.as_string())
        server.quit()
        logger.info(f"Password reset email sent to {email}")
        print(f"✓ Password reset email successfully dispatched to {email}")
    except Exception as e:
        logger.error(f"Failed to send Password Reset email via SMTP to {email}: {e}")
        print("\n" + "!" * 60)
        print("SMTP SEND ERROR: Could not send password reset email via SMTP server.")
        print(f"Error Details: {e}")
        print(f"To: {email}")
        print(f"Reset Link: {reset_url}")
        print("!" * 60 + "\n")


def send_otp_email(email: str, otp: str):
    """
    Send a 6-digit OTP for email verification during registration.
    """
    subject = "PlacementAI — Your Email Verification OTP"
    
    smtp_host, smtp_port, smtp_username, smtp_password, from_address = _get_smtp_credentials()

    text_body = f"""Hello,

Your email verification code for PlacementAI registration is:

    {otp}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.

Best regards,
The PlacementAI Team
"""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0b132b; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
        .brand {{ font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 24px; font-family: monospace; }}
        .otp-box {{ background: #f1f5f9; border: 1px border #cbd5e1; border-radius: 8px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #1e293b; padding: 16px; text-align: center; margin: 20px 0; font-family: monospace; }}
        .footer {{ font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-family: monospace; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">Placement<span style="color: #4f46e5;">AI</span></div>
        <h2 style="font-size: 18px; margin-top: 0;">Email Verification OTP</h2>
        <p>Hello,</p>
        <p>Your one-time email verification code for PlacementAI registration is:</p>
        <div class="otp-box">{otp}</div>
        <p style="font-size: 12px; color: #64748b;">This verification code will expire in 10 minutes.</p>
        <div class="footer">
          If you did not request this code, please ignore this email.<br>
          © PlacementAI Intelligence Platform.
        </div>
      </div>
    </body>
    </html>
    """

    if not all([smtp_host, smtp_username, smtp_password]):
        logger.warning("SMTP credentials incomplete. Falling back to console OTP logging.")
        print("\n" + "=" * 60)
        print("DEVELOPMENT MODE: OTP EMAIL SIMULATION")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"OTP Code: {otp}")
        print("=" * 60 + "\n")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg['From'] = from_address
        msg['To'] = email
        msg['Subject'] = subject

        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()

        server.login(smtp_username, smtp_password)
        server.sendmail(from_address, email, msg.as_string())
        server.quit()
        logger.info(f"OTP email sent to {email}")
        print(f"✓ OTP Email successfully dispatched to {email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email via SMTP to {email}: {e}")
        print("\n" + "!" * 60)
        print("SMTP SEND ERROR: Could not send OTP email via SMTP server.")
        print(f"Error Details: {e}")
        print(f"To: {email}")
        print(f"OTP Code: {otp}")
        print("!" * 60 + "\n")
