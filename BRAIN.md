# PlacementAI — System Architecture & Knowledge Base (BRAIN.md)

**Project Name:** PlacementAI — AI-Powered Placement Intelligence & Recruitment Platform  
**Repository:** https://github.com/happy8924/PlacementAI  
**Active Working Branch:** `feature/tpo-module`  
**Last Updated:** November 2026 (Checkpoint 1 Audit)

---

## 1. System Overview & Technology Stack

| Layer | Technology | Version / Spec | Role & Scope |
|---|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS | React 19, Vite 5, Tailwind 3 | Unified responsive Single Page Application with dynamic role-based dashboards |
| **Backend** | Python FastAPI | FastAPI 0.115.8, Python 3.11+ | Asynchronous RESTful microservice handling business logic, eligibility, auth & dispatch |
| **Database** | MongoDB | MongoDB 6.0+ via PyMongo 4.10.1 | Document store for users, profiles, jobs, applications, logs |
| **Authentication** | JWT (HS256) + Bcrypt | PyJWT 2.10.1, bcrypt 4.2.0 | Stateless Bearer token auth with role guards on both client and API |
| **Email Automation** | n8n Workflow + Gmail API | n8n (External), Gmail OAuth2 | Decoupled event-driven job broadcast notification pipeline |
| **NLP / ATS Engine** | Python `pypdf` + regex | Custom deterministic parser | ATS scoring, skill extraction, and gap analysis |

---

## 2. Directory & Component Architecture

```
PlacementAI/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── admin.py          # Admin endpoints: user governance, system metrics, reports
│   │   │   ├── auth.py           # Authentication: register, login, OTP, password reset
│   │   │   ├── jobs.py           # Public & student job feed with eligibility filtering
│   │   │   ├── recruiter.py      # Recruiter profiles, job creation, applicants, interviews
│   │   │   ├── resume.py         # PDF resume upload, ATS parsing, active resume toggle
│   │   │   ├── roadmap.py        # Personalized career roadmap generation
│   │   │   ├── student.py        # Student profiles, applications, bookmarks, interviews
│   │   │   └── tpo.py            # TPO approvals queue, student directory, recruitment oversight
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic BaseSettings (.env reader)
│   │   │   ├── database.py       # MongoDB client singleton & index initializer
│   │   │   └── security.py       # JWT creation/decoding and bcrypt hashing
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── eligibility.py    # Authoritative PlacementAI strict eligibility engine
│   │   │   ├── email.py          # SMTP email service (console fallback for dev)
│   │   │   ├── n8n.py            # n8n webhook email broadcast dispatcher & payload contract
│   │   │   ├── resume_analyzer.py# PDF parsing & ATS evaluation
│   │   │   └── roadmap_engine.py # Learning curriculum & resource builder
│   │   └── main.py               # FastAPI app definition, CORS, lifespan, router mount
│   ├── scripts/
│   │   └── seed_tpo.py           # Development helper to seed initial TPO account
│   └── pytest.ini                # Pytest test suite configuration
├── frontend/
│   ├── public/                   # Static branding: favicon.png, logo-full.png, logo-icon.png
│   ├── src/
│   │   ├── components/           # Role sidebars, headers, PageTitleManager, Navbar, Footer
│   │   │   ├── admin/            # AdminSidebar.jsx
│   │   │   ├── recruiter/        # RecruiterSidebar.jsx
│   │   │   ├── student/          # StudentSidebar.jsx
│   │   │   ├── tpo/              # TpoSidebar.jsx, TpoHeader.jsx, TpoLayout.jsx
│   │   │   └── layout/RouteGuard.jsx # Client-side JWT & role verification guard
│   │   ├── context/AuthContext.jsx # Global auth session & token persistence
│   │   ├── pages/                # Pages for landing, student, recruiter, tpo, and admin
│   │   ├── services/             # Axios API clients (api.js, auth.js, tpo.js)
│   │   ├── App.jsx               # Route tree definitions
│   │   └── index.css             # Tailwind tokens & dark/light theme styling
├── docs/
│   └── n8n/
│       └── Email Automation - Recruiter Job Broadcast (1).json # Source of truth workflow
├── BRAIN.md                      # System architecture & knowledge base
├── AUDIT.md                      # Issues, audit findings, and checklist
└── DECISIONS.md                  # Architectural decisions log
```

---

## 3. Core Workflows & Data Flows

### A. Authentication & Registration Lifecycle
```
User (Student / Recruiter) -> Register (POST /api/v1/auth/register)
  ├─ Password hashed with bcrypt
  ├─ User record created in `users` with `is_approved=False` & `approval_status="pending"`
  ├─ Student / Recruiter profile initialized
  └─ User redirected to `/awaiting-approval`
TPO Reviews Queue (/tpo/approvals) -> Approves User
  ├─ `users.is_approved` set to True, `approval_status` set to "approved"
  └─ User logs in, receives JWT with { sub: user_id, role: role }
```

### B. Recruiter Job Posting & n8n Email Broadcast (Target Checkpoint 2 Architecture)
```
Recruiter creates Drive (POST /api/v1/recruiter/jobs)
  ├─ Saved in `jobs` with `status: "pending_approval"`
TPO approves Drive (POST /api/v1/tpo/approvals/job/{job_id})
  ├─ Job status updated to `open`
  ├─ Backend triggers broadcast pipeline:
      1. Query all active approved students (`users` where role="student", is_approved=True)
      2. Run `evaluate_student_job_eligibility(student, profile, job)`
      3. Filter out candidates who already received email (`mail_logs`)
      4. Prepare payload with `dispatch_id`, `job` data, and `recipients` list
      5. POST payload to `N8N_WEBHOOK_URL`
n8n Webhook:
  ├─ Validates dispatch payload
  ├─ Iterates through eligible recipients
  ├─ Renders Gmail HTML template with job specifications
  ├─ Sends email via Gmail OAuth2
  ├─ Records delivery outcome in MongoDB `mail_logs`
  └─ Returns execution summary to FastAPI
```

### C. Student Job Feed & Application
```
Student visits /student/jobs (GET /api/v1/jobs)
  ├─ Backend runs `evaluate_student_job_eligibility` for each open job
  ├─ Only eligible jobs (or tagged with eligibility breakdown) presented
Student clicks Apply (POST /api/v1/student/applications)
  ├─ Enforces backend eligibility check (CGPA, Branch, Skills)
  ├─ Prevents duplicate applications
  └─ Inserts application record into `applications`
Recruiter reviews candidates (/recruiter/applicants) -> Shortlists -> Schedules Interview
```

---

## 4. Key MongoDB Collections & Relationships

| Collection | Primary ID | Key Relationships | Purpose |
|---|---|---|---|
| `users` | `_id` (ObjectId) | None | Core authentication credentials, role, approval state |
| `student_profiles` | `_id` | `user_id` -> `users._id` | Academic metrics (CGPA, branch, degree), skills, contact |
| `recruiter_profiles` | `_id` | `user_id` -> `users._id` | Corporate registration, industry, logo, headquarters |
| `jobs` | `_id` | `recruiter_id` -> `users._id` | Job specifications, eligibility thresholds, status |
| `applications` | `_id` | `job_id` -> `jobs._id`, `student_id` -> `users._id` | Student drive applications, status pipeline |
| `interviews` | `_id` | `application_id`, `student_id`, `recruiter_id` | Scheduled interview rounds, meet links, timings |
| `resumes` | `_id` | `user_id` -> `users._id` | Uploaded resume files, ATS scores, parsed data |
| `student_roadmaps` | `_id` | `user_id` -> `users._id` | AI personalized skill development curriculum |
| `bookmarks` | `_id` | `user_id`, `job_id` | Saved job postings |
| `mail_logs` | `_id` | `job_id`, `student_id` | Audit trail of email broadcasts via n8n/SMTP |
| `activity_logs` | `_id` | `user_id` | Security and audit timeline events |

