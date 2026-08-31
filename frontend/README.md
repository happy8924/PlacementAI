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
├── public/               # Static assets served directly
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # Route guards, layout wrappers
│   │   │   └── RouteGuard.jsx     # JWT auth guard for protected routes
│   │   ├── AICore.jsx
│   │   ├── CollegeSection.jsx
│   │   ├── DashboardPreview.jsx
│   │   ├── Features.jsx
│   │   ├── FinalCTA.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Navbar.jsx             # Updated with Login/Signup links
│   │   ├── Pricing.jsx
│   │   ├── Problem.jsx
│   │   ├── Solution.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── TrustSecurity.jsx
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth state + localStorage sync
│   ├── hooks/
│   │   └── useAuth.jsx            # useAuth() custom hook
│   ├── pages/
│   │   ├── landing/
│   │   │   └── LandingPage.jsx    # Public landing page
│   │   ├── student/
│   │   │   └── StudentDashboardPage.jsx
│   │   ├── recruiter/
│   │   │   └── RecruiterDashboardPage.jsx
│   │   ├── tpo/
│   │   │   └── TpoDashboardPage.jsx
│   │   ├── admin/
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ResetPasswordPage.jsx
│   ├── services/
│   │   ├── api.js                 # Axios instance with auth interceptors
│   │   └── auth.js                # API calls (login, register, forgot, reset)
│   ├── App.jsx                    # Router tree with RouteGuard protection
│   ├── index.css                  # Tailwind directives + design tokens
│   └── main.jsx                   # React DOM root mount
├── index.html                     # Vite entry HTML with anti-FOUC script
├── package.json
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
├── .env.example                   # Environment variable template
└── .gitignore
```

---

## ⚙️ How the Authentication Flow Works (Frontend)

```
User visits /login
        │
        ▼
LoginPage.jsx → calls authService.login(email, password)
        │
        ▼
api.js (Axios) → POST /api/v1/auth/login
        │
        ▼
AuthContext.jsx → saves token + user to localStorage
        │
        ▼
App.jsx (Router) → navigates to /student/dashboard (or role-specific)
        │
        ▼
RouteGuard.jsx → reads AuthContext, checks isAuthenticated + role
        │
        ├─ NOT AUTHENTICATED → redirect to /login
        └─ AUTHENTICATED → render protected page
```

**Token Handling:**
- JWT is stored in `localStorage` under key `token`
- All outgoing requests via `api.js` automatically inject `Authorization: Bearer <token>`
- On 401 response, token is removed and user is redirected to `/login?expired=true`

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ (v20.18.2 or higher recommended)
- npm v10+
- Backend server running (see `../backend/README.md`)

### 1. Copy environment configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Frontend will start at: **http://localhost:3000**

### 4. Build for production

```bash
npm run build
```

Build artifacts will be in the `dist/` directory.

---

## 🗺️ Available Routes

| Route | Type | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Unified sign-in page |
| `/signup` | Public | Role-based registration |
| `/forgot-password` | Public | Password reset request |
| `/reset-password?token=...` | Public | New password form |
| `/student/dashboard` | Protected (student) | Student workspace |
| `/recruiter/dashboard` | Protected (recruiter) | Recruiter hub |
| `/tpo/dashboard` | Protected (tpo) | Placement officer portal |
| `/admin/dashboard` | Protected (admin) | System admin terminal |

---

## 🎨 Design System

The frontend uses a custom CSS variable-based design system defined in `src/index.css`:

- **Background:** Deep Navy (`#0B132B`) in light mode / Charcoal (`#09090B`) in dark mode
- **Accent colors:** Cyan/Teal + Blue-to-Purple gradients
- **Typography:** Inter, Plus Jakarta Sans (sans), Geist Mono (mono)
- **Dark mode:** Class-based (`html.dark`), toggled via `ThemeToggle` component

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:8000/api/v1` | Backend API base URL |
