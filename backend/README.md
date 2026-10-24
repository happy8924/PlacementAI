# PlacementAI — Backend

**FastAPI + Python 3.11 + MongoDB backend for the PlacementAI platform.**

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
│   │       ├── auth.py           # Auth routes (register, login, reset password)
│   │       ├── student.py        # Student profile, job feed, applications
│   │       ├── recruiter.py      # Recruiter drive posting, email broadcast
│   │       ├── jobs.py           # Job listings with eligibility filtering
│   │       ├── tpo.py            # TPO approvals, analytics, student/recruiter oversight
│   │       ├── admin.py          # Admin user management
│   │       ├── resume.py         # Resume upload/analysis
│   │       └── roadmap.py        # AI learning roadmap
│   ├── core/
│   │   ├── config.py             # Environment config via pydantic-settings
│   │   ├── database.py           # MongoDB singleton client + index init
│   │   └── security.py           # bcrypt hashing + JWT sign/verify
│   ├── schemas/
│   │   ├── auth.py               # Pydantic request/response schemas
│   │   └── user.py               # User model schemas
│   ├── services/
│   │   ├── eligibility.py        # Strict eligibility evaluation engine
│   │   └── email.py              # SMTP email dispatcher (console fallback)
│   └── main.py                   # FastAPI app, CORS, router registration
├── scripts/
│   └── seed_tpo.py               # Seed script to create a TPO user
├── tests/
│   └── test_auth.py              # Pytest unit tests (uses mongomock)
├── requirements.txt
├── pytest.ini
├── .env.example
└── README.md
```

---

## ⚙️ Authentication Flow

```
POST /api/v1/auth/register
  ├─ Validate via Pydantic schema
  ├─ Check duplicate email
  ├─ Hash password (bcrypt)
  └─ Insert user → return {success, user_id}

POST /api/v1/auth/login
  ├─ Find user by email
  ├─ Verify password (bcrypt)
  ├─ Sign JWT: {sub: user_id, role, exp}
  └─ Return {access_token, token_type, user}

POST /api/v1/auth/forgot-password
  ├─ Generate secrets.token_urlsafe(32)
  ├─ Store SHA-256 hash in DB (60 min TTL)
  └─ Send reset link via email (console fallback)

POST /api/v1/auth/reset-password
  ├─ Hash incoming token → lookup in DB
  ├─ Verify expiry + one-time use
  ├─ Update password hash (bcrypt)
  └─ Mark token used_at = now
```

### JWT Payload
```json
{
  "sub": "<user_id>",
  "role": "student | recruiter | tpo | admin",
  "exp": "<unix_timestamp>"
}
```

---

## 🎯 Eligibility Engine

`app/services/eligibility.py` — Central service enforcing strict eligibility checks:

- **CGPA** threshold matching
- **Branch** whitelist matching
- **Skills** percentage overlap check

Used in:
- `recruiter.py` — filters who receives broadcast emails on new drive
- `jobs.py` — filters which jobs appear in student's job feed
- `student.py` — prevents ineligible applications

---

## 🗺️ API Endpoints

All endpoints prefixed with `/api/v1`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | Register new user |
| `POST` | `/api/v1/auth/login` | None | Login + get JWT |
| `POST` | `/api/v1/auth/forgot-password` | None | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | None | Set new password |

### Student
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/student/jobs` | student | Eligibility-filtered job feed |
| `POST` | `/api/v1/student/apply/{job_id}` | student | Apply to a drive |
| `GET` | `/api/v1/student/applications` | student | View own applications |
| `GET/PUT` | `/api/v1/student/profile` | student | View/update profile |

### Recruiter
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/recruiter/jobs` | recruiter | Post a new drive |
| `GET` | `/api/v1/recruiter/jobs` | recruiter | List own drives |
| `GET` | `/api/v1/recruiter/jobs/{id}/applicants` | recruiter | View applicants |

### TPO
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/tpo/dashboard` | tpo | Stats overview |
| `GET` | `/api/v1/tpo/approvals` | tpo | Pending drive approvals |
| `POST` | `/api/v1/tpo/approvals/{id}` | tpo | Approve/reject drive |
| `GET` | `/api/v1/tpo/students` | tpo | Full student directory |
| `GET` | `/api/v1/tpo/analytics` | tpo | Placement analytics |
| `GET` | `/api/v1/tpo/audit` | tpo | Audit activity timeline |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- MongoDB running locally (port 27017) or Atlas URI

### Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=placement_ai

JWT_SECRET_KEY=your_very_secure_secret_here
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=no-reply@placementai.com

FRONTEND_URL=http://localhost:3000
```

### Start Server

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API: **http://127.0.0.1:8000**
- Swagger Docs: **http://127.0.0.1:8000/docs**

### Seed TPO User

```bash
python scripts/seed_tpo.py
```

---

## 🧪 Running Tests

```bash
python -m pytest
```

Tests use `mongomock` — no real MongoDB required.

---

## 🗄️ MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | All user accounts (student, recruiter, tpo, admin) |
| `jobs` | Job/drive listings posted by recruiters |
| `applications` | Student job applications |
| `password_reset_tokens` | One-time reset tokens (60 min TTL auto-expiry) |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DATABASE` | Yes | Database name |
| `JWT_SECRET_KEY` | Yes | HS256 signing secret |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token validity (default: 60) |
| `SMTP_HOST` | No | SMTP server (blank = console mode) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USERNAME` | No | SMTP login |
| `SMTP_PASSWORD` | No | SMTP password |
| `SMTP_FROM_EMAIL` | No | Sender email |
| `FRONTEND_URL` | No | Used in reset password email links |
