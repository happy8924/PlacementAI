# PlacementAI — Backend

**FastAPI + Python 3.11 + MongoDB authentication service for the PlacementAI platform.**

---

## 📋 Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Language |
| FastAPI | 0.115.8 | Web Framework |
| Uvicorn | 0.34.0 | ASGI Server |
| PyMongo | 4.10.1 | MongoDB Driver |
| Pydantic | 2.10.6 | Data Validation & Settings |
| PyJWT | 2.10.1 | JWT Token Signing/Verification |
| Bcrypt | 4.2.0 | Password Hashing |
| MongoDB | 6+ | Database |

---

## 📂 Folder Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── auth.py           # Authentication route controllers
│   ├── core/
│   │   ├── config.py             # Environment config via pydantic-settings
│   │   ├── database.py           # MongoDB singleton client + index init
│   │   └── security.py           # bcrypt hashing + JWT sign/verify
│   ├── schemas/
│   │   └── auth.py               # Pydantic request/response schemas
│   ├── services/
│   │   └── email.py              # SMTP email dispatcher (console fallback)
│   └── main.py                   # FastAPI app, CORS, router registration
├── tests/
│   └── test_auth.py              # Pytest unit tests (uses mongomock)
├── requirements.txt              # Python dependencies
├── pytest.ini                    # Pytest configuration
├── .env.example                  # Environment variable template
└── README.md                     # This file
```

---

## ⚙️ How the Authentication Flow Works (Backend)

```
POST /api/v1/auth/register
  │
  ├─ Validate body via Pydantic (UserRegister schema)
  ├─ Check duplicate email in MongoDB users collection
  ├─ Hash password with bcrypt (never store plaintext)
  └─ Insert user document → return {success, user_id}

POST /api/v1/auth/login
  │
  ├─ Find user by email
  ├─ Verify password with bcrypt.checkpw()
  ├─ Create JWT: payload = {sub: user_id, role, exp}
  └─ Return {success, access_token, token_type, user}

POST /api/v1/auth/forgot-password
  │
  ├─ Accept email (NEVER reveal if account exists)
  ├─ If user found:
  │   ├─ Generate cryptographically secure token (secrets.token_urlsafe)
  │   ├─ SHA-256 hash the token (only hash stored in DB)
  │   ├─ Save to password_reset_tokens collection with 60min expiry
  │   └─ Queue background email task with raw token in URL
  └─ Always return generic success message

POST /api/v1/auth/reset-password
  │
  ├─ Hash the incoming token with SHA-256
  ├─ Find matching token record (token_hash, used_at = None)
  ├─ Check expiration (expires_at > now)
  ├─ Hash new password with bcrypt
  ├─ Update users collection with new password_hash
  └─ Mark reset token as used (used_at = now) — one-time use enforced

Protected Routes (future routers):
  │
  └─ Depends(get_current_user) → decode JWT → verify signature + expiry
```

### JWT Payload Structure
```json
{
  "sub": "<user_id>",
  "role": "student | recruiter | tpo | admin",
  "exp": "<unix_timestamp>"
}
```

### Password Reset Token Security
- Raw token is generated with `secrets.token_urlsafe(32)` (256-bit entropy)
- Only the SHA-256 hash of the token is stored in MongoDB
- Token is single-use (marked with `used_at` on success)
- MongoDB TTL index auto-expires documents after 60 minutes

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- MongoDB running locally (default port 27017) **or** a MongoDB Atlas URI
- pip (Python package manager)

### 1. Create a virtual environment

```bash
cd backend
python -m venv .venv
```

### 2. Activate the virtual environment

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Copy environment configuration

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=placement_ai

# JWT — generate a strong secret:
# python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=your_very_secure_secret_here
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# SMTP — leave empty to use console logging (development mode)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=no-reply@placementai.com

# Frontend URL (used in password reset email links)
FRONTEND_URL=http://localhost:3000
```

> **Note:** If SMTP variables are empty, password reset links are printed to the terminal console instead of being emailed. This is safe for development.

### 5. Start the development server

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API will be available at: **http://127.0.0.1:8000**

Interactive Swagger docs: **http://127.0.0.1:8000/docs**

---

## 🧪 Running Tests

Tests use `mongomock` — no real MongoDB connection required.

```bash
python -m pytest
```

### Test Coverage

| Test | Verifies |
|---|---|
| `test_user_signup_and_duplicate` | Registration success + duplicate email rejection |
| `test_user_login` | Correct login, JWT in response, wrong password rejection |
| `test_protected_route_guard` | JWT Bearer token auth on protected routes |
| `test_forgot_and_reset_password_flow` | Full token lifecycle — issue, use, invalidate, old/new password check |

---

## 🗺️ API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | None | Health check |
| `POST` | `/api/v1/auth/register` | None | Register new user |
| `POST` | `/api/v1/auth/login` | None | Login and get JWT |
| `POST` | `/api/v1/auth/forgot-password` | None | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | None | Set new password with token |

### Register — Request Body
```json
{
  "name": "Aaryan Shah",
  "email": "aaryan@university.edu",
  "password": "SecurePassword123",
  "role": "student",
  "student_details": {
    "roll_number": "22CE001",
    "branch": "Computer Engineering",
    "graduation_year": 2026
  }
}
```

### Login — Request Body
```json
{
  "email": "aaryan@university.edu",
  "password": "SecurePassword123"
}
```

### Login — Success Response
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "64abc123...",
    "name": "Aaryan Shah",
    "email": "aaryan@university.edu",
    "role": "student"
  }
}
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DATABASE` | Yes | `placement_ai` | Database name |
| `JWT_SECRET_KEY` | Yes | (default in code) | HS256 signing secret — **change in production** |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Token validity in minutes |
| `SMTP_HOST` | No | `""` | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USERNAME` | No | `""` | SMTP login username |
| `SMTP_PASSWORD` | No | `""` | SMTP login password |
| `SMTP_FROM_EMAIL` | No | `no-reply@placementai.com` | Sender display email |
| `FRONTEND_URL` | No | `http://localhost:3000` | Used in reset password email links |

---

## 🗄️ MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | User accounts — unique email index |
| `password_reset_tokens` | One-time reset tokens — TTL index (60 min auto-expiry) |

### users document shape
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, lowercase)",
  "password_hash": "string (bcrypt)",
  "role": "student | recruiter | tpo | admin",
  "student_details": { ... },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### password_reset_tokens document shape
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users)",
  "token_hash": "string (SHA-256 of raw token)",
  "created_at": "datetime",
  "expires_at": "datetime (TTL indexed)",
  "used_at": "datetime | null"
}
```
