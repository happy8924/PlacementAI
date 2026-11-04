# PlacementAI

**AI-Powered Campus Placement Intelligence & Recruitment Platform**

A full-stack SaaS application that automates the entire campus placement lifecycle — from student registration and AI-driven resume analysis to recruiter job broadcasting, TPO approval workflows, and final placement tracking.

---

## 🎯 Platform Overview

```
Student Registration → Profile → Resume Upload → AI Analysis → Job Discovery
→ Eligibility Check → Application → AI Prep Roadmap → Mock Interviews
→ Recruiter Interview → TPO Oversight → Offer → Final Placement
```

### Four Roles

| Role | Responsibilities |
|---|---|
| **Student** | Build profile, upload resume, discover jobs, apply, prep with AI roadmap |
| **Recruiter** | Post drives, preview eligible candidates, broadcast emails after TPO approval |
| **TPO Officer** | Approve/reject job drives, oversee student pipelines, view placement analytics |
| **Admin** | Manage all users, view audit logs, platform configuration |

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | React 19, Vite 5 |
| Backend | FastAPI + Python | 3.11+ |
| Database | MongoDB Atlas | 6+ |
| Auth | JWT (HS256) + bcrypt | — |
| Email | Gmail SMTP / n8n Webhook | — |
| PDF Export | jsPDF + jspdf-autotable | — |
| Icons | Lucide React | — |

---

## 📂 Project Structure

```
PlacementAI/
├── frontend/              # React 19 + Vite client application
│   ├── src/
│   │   ├── components/    # Reusable UI components per role
│   │   ├── pages/         # Role-based page components
│   │   │   ├── admin/
│   │   │   ├── recruiter/
│   │   │   ├── student/
│   │   │   └── tpo/
│   │   ├── services/      # Axios API service modules
│   │   └── App.jsx        # Routes and role-based navigation
│   └── README.md
│
├── backend/               # FastAPI + Python backend
│   ├── app/
│   │   ├── api/v1/        # Route handlers per role
│   │   ├── core/          # Config, DB connection, security
│   │   └── services/      # Business logic (eligibility, email, AI)
│   ├── tests/             # Pytest test suite (12 tests)
│   ├── .env               # Environment variables (not committed)
│   └── README.md
│
├── docs/
│   └── n8n/               # n8n workflow JSON + integration docs
│
├── BRAIN.md               # Architecture reference for developers
├── AUDIT.md               # Audit findings and checkpoint tracker
├── DECISIONS.md           # Technical decisions log
└── README.md              # This file
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB Atlas account (or local MongoDB 6+)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/happy8924/PlacementAI.git
cd PlacementAI
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=placement_ai

# JWT
JWT_SECRET_KEY=your_64_char_hex_secret_here
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Gmail SMTP (for email broadcasts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM_EMAIL=your@gmail.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# n8n Webhook (optional — leave blank to use direct SMTP)
N8N_WEBHOOK_URL=
N8N_TIMEOUT_SECONDS=30
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords. Generate a 16-char password for "Mail".

#### Start the Backend

```bash
# From inside /backend with venv active
uvicorn app.main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

### 4. Run Backend Tests

```bash
cd backend
# With venv active
python -m pytest
```

Expected: **12 passed**

---

## 🔑 Default Roles & Test Accounts

Register accounts via the UI at `http://localhost:3000/register`.

| Role | Select during registration |
|---|---|
| Student | Role: Student |
| Recruiter | Role: Recruiter |
| TPO | Role: TPO (requires admin activation) |
| Admin | Seed via script or MongoDB direct insert |

> **TPO/Admin accounts** need to be manually set `is_approved: true` and `role: "tpo"` / `role: "admin"` in MongoDB if the approval flow is not yet wired for those roles.

---

## 🔄 Core Workflow

### Recruiter Flow
1. Login → Job Management → **Post New Job Vacancy**
2. Fill all required fields (Job Title, Location, Salary, CGPA, Branches, Skills, Description)
3. Click **Check Eligible Students** — preview matching candidates with PDF export
4. Click **Submit for TPO Approval** — drive saved as `pending_approval`

### TPO Flow
1. Login → Pending Approvals → Review drive details
2. **Approve** → System auto-broadcasts email to all eligible students via SMTP
3. **Reject** → Drive closed, recruiter notified

### Student Flow
1. Login → Complete Profile (Branch, CGPA, Skills)
2. Upload Resume → AI analysis (ATS score, skill gaps, recommendations)
3. Browse Jobs → Check eligibility → Apply
4. Track applications → View interview schedule → Follow learning roadmap

---

## 📧 Email Broadcast Architecture

```
Recruiter creates drive (pending_approval)
        ↓
TPO approves drive
        ↓
FastAPI evaluates eligible students (70% skill match threshold)
        ↓
N8N_WEBHOOK_URL set?
  ├── YES → Dispatch payload to n8n → Gmail OAuth2 → Student inboxes
  └── NO  → Direct Gmail SMTP → Student inboxes
        ↓
Results logged to mail_logs collection (idempotent — no duplicate emails)
```

---

## 🗄️ MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | All user accounts (students, recruiters, tpo, admin) |
| `student_profiles` | Extended student details (branch, CGPA, skills) |
| `jobs` | Recruiter job postings |
| `applications` | Student job applications |
| `interviews` | Scheduled interview rounds |
| `resumes` | Uploaded resume metadata |
| `ai_analysis` | Resume ATS analysis results |
| `student_roadmaps` | Personalized AI learning roadmaps |
| `mail_logs` | Email broadcast audit log |
| `activity_logs` | Platform-wide action audit trail |
| `otp_codes` | Email OTP tokens (auto-expire TTL) |
| `password_reset_tokens` | Password reset links (auto-expire TTL) |

---

## 🧪 Testing

```bash
cd backend
python -m pytest -v
```

| Test File | Tests | Coverage |
|---|---|---|
| `test_ai_and_admin_flow.py` | 3 | AI resume analyzer, roadmap eligibility, admin company fallback |
| `test_n8n_integration.py` | 5 | n8n payload formatting, dispatch, idempotency, webhook mock |
| `test_student_recruiter_flow.py` | 4 | Eligibility engine, application flow, interview scheduling |

---

## 📄 Key Project Files

| File | Purpose |
|---|---|
| [`BRAIN.md`](./BRAIN.md) | Full architecture map, API relationships, collection schemas |
| [`AUDIT.md`](./AUDIT.md) | Findings, bugs found/fixed, checkpoint status tracker |
| [`DECISIONS.md`](./DECISIONS.md) | Why each technical decision was made |
| [`docs/n8n/README.md`](./docs/n8n/README.md) | n8n webhook integration setup guide |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test: `python -m pytest` + `npm run build`
4. Commit: `git commit -m "feat: your feature description"`
5. Push and open a Pull Request against `main`

---

## 📜 License

MIT License — See [LICENSE](./LICENSE) for details.

---

*Built with ❤️ for campus placement automation.*
