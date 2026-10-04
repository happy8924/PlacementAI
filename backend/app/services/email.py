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


def send_job_opportunity_email(student_email: str, student_name: str, job_data: dict, company_name: str) -> tuple[bool, str]:
    """
    Send structured job opportunity email to an eligible student via SMTP.
    Returns (success: bool, error_message: str).
    """
    job_title = job_data.get("title") or job_data.get("job_title") or "Placement Opportunity"
    role = job_data.get("role") or job_title
    location = job_data.get("location") or "Remote / On-site"
    work_mode = job_data.get("work_mode") or "Full-Time"
    salary = job_data.get("salary_package") or job_data.get("salary_stipend") or "Best in Industry"
    min_cgpa = job_data.get("min_cgpa", 0.0)
    skills = ", ".join(job_data.get("requirements") or job_data.get("required_skills") or ["Relevant Tech Stack"])
    deadline = job_data.get("deadline") or "As per drive schedule"
    description = job_data.get("description") or job_data.get("job_description") or "New career opportunity available."
    apply_link = job_data.get("apply_link") or f"{settings.FRONTEND_URL}/student/jobs"

    subject = f"🎯 Exclusive Placement Drive: {job_title} at {company_name}"
    smtp_host, smtp_port, smtp_username, smtp_password, from_address = _get_smtp_credentials()

    text_body = f"""Hello {student_name},

Great news! You have matched the eligibility criteria for a new placement drive:

Job Title: {job_title}
Company: {company_name}
Role: {role}
Location: {location} ({work_mode})
Salary Package: {salary}
Minimum CGPA: {min_cgpa}
Required Skills: {skills}
Deadline: {deadline}

Job Description:
{description}

Apply now on PlacementAI: {apply_link}

Best regards,
PlacementAI Career Intelligence Platform
"""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0b132b; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .brand {{ font-size: 22px; font-weight: 800; color: #2563eb; margin-bottom: 20px; font-family: monospace; }}
        .badge {{ display: inline-block; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }}
        .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }}
        .label {{ font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; font-weight: bold; }}
        .val {{ font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 10px; margin-top: 20px; text-align: center; }}
        .footer {{ font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-family: monospace; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">Placement<span style="color: #4f46e5;">AI</span></div>
        <div class="badge">Eligible Candidate Match</div>
        <h2 style="font-size: 20px; margin: 0; color: #0f172a;">New Drive: {job_title}</h2>
        <p style="font-size: 14px; color: #475569; margin-top: 6px;">Hello <strong>{student_name}</strong>, you've matched the recruiter requirements for <strong>{company_name}</strong>!</p>
        
        <div class="card">
          <div class="grid">
            <div>
              <div class="label">Company</div>
              <div class="val">{company_name}</div>
            </div>
            <div>
              <div class="label">Job Role</div>
              <div class="val">{role}</div>
            </div>
            <div>
              <div class="label">Location / Mode</div>
              <div class="val">{location} ({work_mode})</div>
            </div>
            <div>
              <div class="label">Salary Package</div>
              <div class="val">{salary}</div>
            </div>
            <div>
              <div class="label">Min CGPA Required</div>
              <div class="val">{min_cgpa}</div>
            </div>
            <div>
              <div class="label">Key Tech Skills</div>
              <div class="val">{skills}</div>
            </div>
          </div>
          <div style="margin-top: 16px; border-top: 1px border #e2e8f0; padding-top: 12px;">
            <div class="label">Job Overview</div>
            <p style="font-size: 13px; color: #334155; margin-top: 4px; line-height: 1.5;">{description}</p>
          </div>
        </div>

        <a href="{apply_link}" class="btn" target="_blank">View Job & Apply Now →</a>

        <div class="footer">
          You received this because your candidate profile matched the job criteria on PlacementAI.<br>
          © PlacementAI Career Intelligence System.
        </div>
      </div>
    </body>
    </html>
    """

    if not all([smtp_host, smtp_username, smtp_password]):
        logger.warning(f"SMTP not fully configured. Simulated email to {student_email}")
        return True, "Simulated email dispatch (SMTP incomplete)"

    try:
        msg = MIMEMultipart("alternative")
        msg['From'] = from_address
        msg['To'] = student_email
        msg['Subject'] = subject
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()

        server.login(smtp_username, smtp_password)
        server.sendmail(from_address, student_email, msg.as_string())
        server.quit()
        logger.info(f"Job opportunity email sent to {student_email}")
        return True, ""
    except Exception as e:
        logger.error(f"Failed to send Job Opportunity email to {student_email}: {e}")
        return False, str(e)

