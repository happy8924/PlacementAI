import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify raw password against bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Generate signed JWT token containing claims and expiry time."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Store expiration in claims
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def decode_access_token(token: str) -> dict | None:
    """Decode and validate JWT token claims. Returns payload if valid, else None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        return None

def create_otp_token(email: str, expires_minutes: int = None) -> str:
    """Create a short-lived JWT proving that the email's OTP has been verified.
    The frontend sends this token back during the final /register call."""
    if expires_minutes is None:
        expires_minutes = settings.OTP_EXPIRY_MINUTES
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode = {
        "sub": email,
        "exp": expire,
        "otp_verified": True
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")

def verify_otp_token(token: str) -> dict | None:
    """Decode an OTP verification JWT. Returns payload only if it contains the
    'otp_verified' claim. Returns None on any failure."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        if not payload.get("otp_verified"):
            return None
        return payload
    except jwt.PyJWTError:
        return None
