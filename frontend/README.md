# PlacementAI — Frontend

**React 19 + Vite + Tailwind CSS client application for the PlacementAI platform.**

---

## 📋 Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Library |
| Vite | 5 | Build Tool & Dev Server |
| Tailwind CSS | 3 | Styling System |
| React Router DOM | 6 | Client-Side Routing |
| Axios | Latest | HTTP Client |
| Lucide React | Latest | Icons |

---

## 📂 Folder Structure

```
frontend/
├── public/
│   ├── favicon.png             # Official PlacementAI favicon
│   ├── logo-icon.png           # Icon-only logo
│   └── logo-full.png           # Full horizontal logo
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminSidebar.jsx
│   │   ├── recruiter/
│   │   │   └── RecruiterSidebar.jsx
│   │   ├── student/
│   │   │   └── StudentSidebar.jsx
│   │   ├── tpo/
│   │   │   ├── TpoSidebar.jsx
│   │   │   ├── TpoHeader.jsx
│   │   │   └── TpoLayout.jsx
│   │   ├── layout/
│   │   │   └── RouteGuard.jsx       # JWT auth guard for protected routes
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── PageTitleManager.jsx     # Dynamic route-based browser tab titles
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state + localStorage sync
│   ├── hooks/
│   │   └── useAuth.jsx              # useAuth() custom hook
│   ├── pages/
│   │   ├── landing/
│   │   │   └── LandingPage.jsx
│   │   ├── student/
│   │   │   └── StudentDashboardPage.jsx
│   │   ├── recruiter/
│   │   │   └── RecruiterDashboardPage.jsx
│   │   │   └── RecruiterJobsPage.jsx
│   │   ├── tpo/
│   │   │   ├── TpoDashboardPage.jsx
│   │   │   ├── TpoApprovalsPage.jsx
│   │   │   ├── TpoStudentsPage.jsx
│   │   │   ├── TpoRecruitmentPage.jsx
│   │   │   ├── TpoAnalyticsPage.jsx
│   │   │   └── TpoAuditPage.jsx
│   │   ├── admin/
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── AwaitingApprovalPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ResetPasswordPage.jsx
│   ├── services/
│   │   ├── api.js                   # Axios instance with auth interceptors
│   │   ├── auth.js                  # Auth API calls (login, register, forgot, reset)
│   │   └── tpo.js                   # TPO module API calls
│   ├── App.jsx                      # Router tree with RouteGuard + PageTitleManager
│   ├── index.css                    # Tailwind directives + design tokens
│   └── main.jsx                     # React DOM root mount
├── index.html                       # Vite entry HTML with favicon
├── package.json
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
├── .env.example
└── .gitignore
```

---

## 🗺️ Available Routes

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Unified sign-in page |
| `/signup` | Public | Role-based registration |
| `/forgot-password` | Public | Password reset request |
| `/reset-password?token=...` | Public | New password form |
| `/awaiting-approval` | Public | Post-signup approval notice |
| `/student/dashboard` | student | Student workspace & job feed |
| `/recruiter/dashboard` | recruiter | Recruiter hub |
| `/recruiter/jobs` | recruiter | Manage posted drives |
| `/tpo/dashboard` | tpo | TPO overview & stats |
| `/tpo/approvals` | tpo | Approve/reject drive requests |
| `/tpo/students` | tpo | Full student directory |
| `/tpo/recruitment` | tpo | Recruitment oversight |
| `/tpo/analytics` | tpo | Placement analytics |
| `/tpo/audit` | tpo | Activity audit timeline |
| `/admin/dashboard` | admin | System admin terminal |

---

## ⚙️ Authentication Flow

```
User visits /login
        │
        ▼
LoginPage.jsx → authService.login(email, password)
        │
        ▼
api.js (Axios) → POST /api/v1/auth/login
        │
        ▼
AuthContext.jsx → saves token + user to localStorage
        │
        ▼
App.jsx → navigates to role-specific dashboard
        │
        ▼
RouteGuard.jsx → checks isAuthenticated + role
        ├─ NOT AUTHENTICATED → /login
        └─ AUTHENTICATED → render page
```

**Token Handling:**
- JWT stored in `localStorage` under key `token`
- All requests via `api.js` inject `Authorization: Bearer <token>`
- On 401, token cleared and user redirected to `/login?expired=true`

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- npm v10+
- Backend running (see `../backend/README.md`)

### Setup
```bash
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api/v1

npm install
npm run dev
```

Frontend: **http://localhost:3000**

### Production Build
```bash
npm run build
```

---

## 🎨 Design System

- **Background:** Deep Navy (`#0B132B`) / Charcoal dark mode
- **Accents:** Cyan/Teal + Blue-to-Purple gradients
- **Typography:** Inter, Plus Jakarta Sans, Geist Mono
- **Dark mode:** Class-based (`html.dark`)
- **Branding:** Official logo (`logo-full.png`, `logo-icon.png`) + favicon across all sidebars, navbars, and auth pages

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL (default: `http://localhost:8000/api/v1`) |
