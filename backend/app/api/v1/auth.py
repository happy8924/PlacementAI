import secrets
import hashlib
import string
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Header
from typing import Optional
from pymongo.database import Database as MongoDatabase

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_otp_token, verify_otp_token
)
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    RegisterResponse,
    LoginResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GenericResponse,
    UserResponse,
    SendOtpRequest,
    VerifyOtpRequest,
    OtpVerifiedResponse
)
from app.services.email import send_reset_password_email, send_otp_email

router = APIRouter()

OTP_LENGTH = 6

def hash_token(token: str) -> str:
    """Hash token using SHA-256."""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()

def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP."""
    return "".join(secrets.choice(string.digits) for _ in range(OTP_LENGTH))

# ──────────── OTP Endpoints ────────────

@router.post("/send-otp", response_model=GenericResponse, status_code=status.HTTP_200_OK)
def send_otp(
    request: SendOtpRequest,
    background_tasks: BackgroundTasks,
    db: MongoDatabase = Depends(get_db)
):
    """
    Generate a 6-digit OTP, store it (hashed with bcrypt) in the otp_codes collection,
    and email it to the user. If the email is already registered, reject immediately.
    """
    email_clean = request.email.lower()

    # Check if email is already registered
    existing_user = db.users.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    # Generate OTP
    otp = generate_otp()

    # Hash OTP with bcrypt (reusing existing hash_password helper)
    otp_hash = hash_password(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

    # Upsert into otp_codes — replaces any previous OTP for this email
    db.otp_codes.update_one(
        {"email": email_clean},
        {"$set": {
            "otp_hash": otp_hash,
            "expires_at": expires_at,
            "used": False,
            "created_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )

    # Send OTP email in background thread
    background_tasks.add_task(send_otp_email, email_clean, otp)

    return GenericResponse(
        success=True,
        message="OTP has been sent to your email address."
    )

@router.post("/verify-otp", response_model=OtpVerifiedResponse, status_code=status.HTTP_200_OK)
def verify_otp(request: VerifyOtpRequest, db: MongoDatabase = Depends(get_db)):
    """
    Verify the 6-digit OTP. If correct and not expired, return a short-lived
    registration_token (JWT) that the client must send in the Authorization header
    when calling /register.
    """
    email_clean = request.email.lower()

    record = db.otp_codes.find_one({"email": email_clean})
    if not record or record.get("used"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used OTP. Please request a new one."
        )

    # Check expiration
    expires_at = record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )

    # Verify OTP hash
    if not verify_password(request.otp, record["otp_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect OTP code."
        )

    # Mark OTP as used
    db.otp_codes.update_one(
        {"email": email_clean},
        {"$set": {"used": True}}
    )

    # Create a short-lived registration JWT
    registration_token = create_otp_token(email_clean)

    return OtpVerifiedResponse(
        success=True,
        message="Email verified successfully.",
        registration_token=registration_token
    )

# ──────────── Registration ────────────

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserRegister,
    db: MongoDatabase = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Create a new user account. Requires a valid OTP registration_token in the
    Authorization header (obtained from /verify-otp).
    """
    # ── Step 1: Validate OTP registration token ──
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email OTP verification is required before registration."
        )

    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>"
        )

    token_payload = verify_otp_token(parts[1])
    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP verification token. Please verify your email again."
        )

    # Ensure the verified email matches the registration email
    verified_email = token_payload.get("sub", "").lower()
    if verified_email != user_in.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email mismatch: the verified email does not match the registration email."
        )

    # ── Step 2: Check if email is already taken ──
    existing_user = db.users.find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    # ── Step 3: Create user ──
    hashed_pwd = hash_password(user_in.password)
    user_doc = {
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": hashed_pwd,
        "role": user_in.role,
        "email_verified": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # Add student details if role is student
    if user_in.role == "student" and user_in.student_details:
        user_doc["student_details"] = user_in.student_details.model_dump()

    # Insert user
    result = db.users.insert_one(user_doc)
    user_id_str = str(result.inserted_id)

    # Clean up the used OTP record
    db.otp_codes.delete_one({"email": user_in.email.lower()})

    return RegisterResponse(
        success=True,
        message="User registered successfully",
        user_id=user_id_str
    )

# ──────────── Login ────────────

@router.post("/login", response_model=LoginResponse)
def login(credentials: UserLogin, db: MongoDatabase = Depends(get_db)):
    user = db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # Generate JWT
    user_id_str = str(user["_id"])
    token_claims = {
        "sub": user_id_str,
        "role": user["role"]
    }
    access_token = create_access_token(data=token_claims)

    user_response = UserResponse(
        id=user_id_str,
        name=user["name"],
        email=user["email"],
        role=user["role"]
    )

    return LoginResponse(
        success=True,
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

# ──────────── Forgot / Reset Password ────────────

@router.post("/forgot-password", response_model=GenericResponse)
def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: MongoDatabase = Depends(get_db)
):
    email_clean = request.email.lower()
    user = db.users.find_one({"email": email_clean})

    # Return same generic response to prevent email enumeration
    generic_msg = "If an account exists for this email, password reset instructions have been sent."

    if user:
        # Generate random secure token
        raw_token = secrets.token_urlsafe(32)
        hashed = hash_token(raw_token)

        # Store hashed token in 'password_reset_tokens' collection
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=60)
        reset_doc = {
            "user_id": user["_id"],
            "token_hash": hashed,
            "created_at": datetime.now(timezone.utc),
            "expires_at": expires_at,
            "used_at": None
        }
        
        # Save token
        db.password_reset_tokens.insert_one(reset_doc)

        # Queue background task to send email
        background_tasks.add_task(send_reset_password_email, email_clean, raw_token)

    return GenericResponse(
        success=True,
        message=generic_msg
    )

@router.post("/reset-password", response_model=GenericResponse)
def reset_password(request: ResetPasswordRequest, db: MongoDatabase = Depends(get_db)):
    hashed = hash_token(request.token)

    # Retrieve active and unused token
    token_record = db.password_reset_tokens.find_one({
        "token_hash": hashed,
        "used_at": None
    })

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used password reset token."
        )

    # Check expiration
    # Note: Mongo TTL index will clean up expired docs, but we do manual check for precision
    now = datetime.now(timezone.utc)
    # Ensure expires_at is timezone-aware
    expires_at = token_record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired."
        )

    # Get user
    user_id = token_record["user_id"]
    user = db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with this token was not found."
        )

    # Hash new password
    hashed_pwd = hash_password(request.new_password)

    # Update user password
    db.users.update_one(
        {"_id": user_id},
        {"$set": {"password_hash": hashed_pwd, "updated_at": now}}
    )

    # Invalidate token by setting used_at
    db.password_reset_tokens.update_one(
        {"_id": token_record["_id"]},
        {"$set": {"used_at": now}}
    )

    return GenericResponse(
        success=True,
        message="Password has been reset successfully."
    )
