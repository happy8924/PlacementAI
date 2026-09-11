import pytest
import hashlib
from fastapi import FastAPI, Depends, Security
from fastapi.testclient import TestClient
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
import mongomock

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token, create_otp_token
from app.api.v1.auth import router as auth_router

# Create a test FastAPI app to run the tests against
app = FastAPI()
app.include_router(auth_router, prefix="/api/v1/auth")

# Setup bearer security helper
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return payload

@app.get("/api/v1/protected-route")
def protected_route_endpoint(user: dict = Depends(get_current_user)):
    return {"success": True, "user_id": user["sub"], "role": user["role"]}

# Mock Database Client for unit tests (isolated and fast)
class TestDatabase:
    client = None
    db = None

    @classmethod
    def get_test_db(cls):
        if cls.client is None:
            # We use mongomock to avoid requiring a running mongodb server for tests
            cls.client = mongomock.MongoClient()
            cls.db = cls.client["placement_ai_test"]
            # Setup unique index in mongomock
            cls.db.users.create_index("email", unique=True)
        return cls.db

# Override the database dependency in FastAPI
app.dependency_overrides[get_db] = TestDatabase.get_test_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    db = TestDatabase.get_test_db()
    db.users.delete_many({})
    db.password_reset_tokens.delete_many({})
    db.otp_codes.delete_many({})
    yield

def helper_get_verified_otp_token(email: str) -> str:
    """Helper to get registration token via send-otp and verify-otp or direct token creation."""
    return create_otp_token(email)

def test_user_signup_and_duplicate():
    email = "student@college.edu"
    
    # 1. Signup without OTP token should fail (401)
    signup_data = {
        "name": "Test Student",
        "email": email,
        "password": "SecurePassword123",
        "role": "student",
        "student_details": {
            "roll_number": "1CS22CS001",
            "branch": "Computer Science",
            "graduation_year": 2026
        }
    }
    res_no_otp = client.post("/api/v1/auth/register", json=signup_data)
    assert res_no_otp.status_code == 401

    # 2. Send OTP
    res_send_otp = client.post("/api/v1/auth/send-otp", json={"email": email})
    assert res_send_otp.status_code == 200
    assert res_send_otp.json()["success"] is True

    # 3. Signup with valid OTP registration token
    otp_token = helper_get_verified_otp_token(email)
    headers = {"Authorization": f"Bearer {otp_token}"}
    
    response = client.post("/api/v1/auth/register", json=signup_data, headers=headers)
    assert response.status_code == 201
    res_json = response.json()
    assert res_json["success"] is True
    assert "user_id" in res_json

    # 4. Duplicate registration check
    response_dup = client.post("/api/v1/auth/register", json=signup_data, headers=headers)
    assert response_dup.status_code == 409
    assert "detail" in response_dup.json()

def test_user_login():
    email = "tester@college.edu"
    otp_token = helper_get_verified_otp_token(email)
    headers = {"Authorization": f"Bearer {otp_token}"}

    # 1. Register user
    signup_data = {
        "name": "Login Tester",
        "email": email,
        "password": "SecurePassword123",
        "role": "recruiter"
    }
    client.post("/api/v1/auth/register", json=signup_data, headers=headers)

    # 2. Login successfully
    login_data = {
        "email": email,
        "password": "SecurePassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert "access_token" in res_json
    assert res_json["user"]["email"] == email
    assert res_json["user"]["role"] == "recruiter"

    # 3. Login with incorrect password
    bad_login = {
        "email": email,
        "password": "WrongPassword"
    }
    response_bad = client.post("/api/v1/auth/login", json=bad_login)
    assert response_bad.status_code == 401

def test_protected_route_guard():
    email = "guard@college.edu"
    otp_token = helper_get_verified_otp_token(email)
    headers_reg = {"Authorization": f"Bearer {otp_token}"}

    # 1. Register & Login
    signup_data = {
        "name": "Guard Tester",
        "email": email,
        "password": "SecurePassword123",
        "role": "tpo"
    }
    client.post("/api/v1/auth/register", json=signup_data, headers=headers_reg)

    login_data = {
        "email": email,
        "password": "SecurePassword123"
    }
    res_login = client.post("/api/v1/auth/login", json=login_data).json()
    token = res_login["access_token"]

    # 2. Try accessing protected route with JWT
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/protected-route", headers=headers)
    assert response.status_code == 200
    assert response.json()["role"] == "tpo"

    # 3. Try accessing protected route without JWT or with bad JWT
    response_bad = client.get("/api/v1/protected-route", headers={"Authorization": "Bearer badtoken"})
    assert response_bad.status_code == 401

def test_forgot_and_reset_password_flow():
    email = "reset@college.edu"
    otp_token = helper_get_verified_otp_token(email)
    headers_reg = {"Authorization": f"Bearer {otp_token}"}

    # 1. Register user
    signup_data = {
        "name": "Reset Tester",
        "email": email,
        "password": "OldSecurePassword123",
        "role": "student",
        "student_details": {
            "roll_number": "1CS22CS002",
            "branch": "Computer Science",
            "graduation_year": 2026
        }
    }
    client.post("/api/v1/auth/register", json=signup_data, headers=headers_reg)

    # 2. Forgot Password Request
    response_forgot = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert response_forgot.status_code == 200
    assert response_forgot.json()["success"] is True

    # 3. Access DB to get token
    db = TestDatabase.get_test_db()
    raw_token = "my_super_secret_test_token"
    token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
    
    from datetime import datetime, timezone, timedelta
    reset_doc = {
        "user_id": db.users.find_one({"email": email})["_id"],
        "token_hash": token_hash,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "used_at": None
    }
    db.password_reset_tokens.insert_one(reset_doc)

    # 4. Reset Password successfully
    reset_data = {
        "token": raw_token,
        "new_password": "NewSecurePassword123"
    }
    response_reset = client.post("/api/v1/auth/reset-password", json=reset_data)
    assert response_reset.status_code == 200
    assert response_reset.json()["success"] is True

    # 5. Try resetting again with same token (should fail)
    response_reset_dup = client.post("/api/v1/auth/reset-password", json=reset_data)
    assert response_reset_dup.status_code == 400

    # 6. Try logging in with old password (should fail)
    response_old_login = client.post("/api/v1/auth/login", json={"email": email, "password": "OldSecurePassword123"})
    assert response_old_login.status_code == 401

    # 7. Login with new password (should succeed)
    response_new_login = client.post("/api/v1/auth/login", json={"email": email, "password": "NewSecurePassword123"})
    assert response_new_login.status_code == 200
    assert response_new_login.json()["success"] is True
