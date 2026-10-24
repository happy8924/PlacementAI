# PlacementAI

**AI-powered Campus Placement Management Platform** — A full-stack SaaS application connecting Students, Recruiters, TPO Officers, and Admins through an intelligent, role-based placement ecosystem.

---

## 🚀 Overview

PlacementAI automates and streamlines the entire campus placement lifecycle:
- **Students** build profiles, get AI-matched job recommendations, and track applications
- **Recruiters** post drives, broadcast to eligible students via email, and manage interviews
- **TPO Officers** oversee placements, approve/reject drives, monitor student pipelines, and view analytics
- **Admins** manage platform users, system settings, and audit logs

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| Database | MongoDB 6+ |
| Auth | JWT (HS256) + bcrypt |
| Email | SMTP with console fallback |
| Icons | Lucide React |

---

## 📂 Project Structure

```
PlacementAI/
├── frontend/          # React + Vite client application
│   ├── public/        # Static assets (logo, favicon, icons)
│   └── src/
│       ├── components/  # Shared + role-specific UI components
│       ├── pages/       # Route-level page components (student, recruiter, tpo, admin)
│       ├── services/    # Axios API clients per module
│       └── context/     # Auth context + global state
├── backend/           # FastAPI + MongoDB server
│   ├── app/
│   │   ├── api/v1/    # REST API routers (auth, student, recruiter, tpo, admin)
│   │   ├── services/  # Business logic (eligibility, email)
│   │   ├── schemas/   # Pydantic models
│   │   └── core/      # Config, DB, security
│   └── scripts/       # Seed scripts
└── .agent/            # AI planning and workflow files
```

---

## ⚡ Quick Start

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env   # fill in values
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```powershell
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:8000**
- Swagger Docs: **http://localhost:8000/docs**

---

## 👥 User Roles

| Role | Access |
|---|---|
| `student` | Profile, job feed (eligibility-filtered), applications, roadmap |
| `recruiter` | Post drives, broadcast emails to eligible students, view applicants |
| `tpo` | Approve drives, student directory, recruitment oversight, analytics |
| `admin` | Full platform management, user control, system audit |

---

## 🔐 Key Features

- **Strict Eligibility Engine** — Jobs broadcast and displayed only to students matching CGPA, branch, and skills
- **Role-Based JWT Auth** — Protected routes enforced on both frontend (RouteGuard) and backend (Depends)
- **TPO Module** — Full placement officer portal with approvals queue, analytics, and audit timeline
- **Email Notifications** — Automated broadcast emails to eligible students on new drive creation
- **Dynamic Page Titles** — SEO-friendly route-based browser tab titles via `PageTitleManager`
- **Official Branding** — Consistent logo and favicon across all pages and sidebars

---

## 📄 Documentation

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
