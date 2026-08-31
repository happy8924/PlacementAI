# PlacementAI — Premium SaaS Landing Page

PlacementAI is a component-based, production-ready React.js frontend landing page. Engineered using Vite and Tailwind CSS, the platform delivers a premium, dark-mode-first aesthetic showcasing an AI-powered career and placement intelligence system.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd PlacementAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The local environment will load at `http://localhost:3000/`.

4. Build for production:
   ```bash
   npm run build
   ```
   Production artifacts will compile into the `dist/` directory.

---

## 🛠️ Technology Stack

* **Core**: React.js (v18+)
* **Build Tool**: Vite (v5)
* **Styling**: Tailwind CSS (v3) + PostCSS Autoprefixer
* **Typography**: Google Fonts (Inter, Plus Jakarta Sans, Geist Mono)
* **Icons**: Inline SVGs & Lucide icons

---

## 📂 Project Structure

```text
PlacementAI/
├── dist/                   # Production build assets
├── node_modules/           # Node dependencies
├── src/
│   ├── components/         # Reusable React UI components
│   │   ├── AICore.jsx           # Section 7: AI Core reasoning flow diagram
│   │   ├── CollegeSection.jsx   # Section 9: College & TPO monitoring dashboard
│   │   ├── DashboardPreview.jsx # Reusable mockup of the workspace preview
│   │   ├── Features.jsx         # Section 6: 6 core platform capabilities grid
│   │   ├── FinalCTA.jsx         # Section 12: Final conversion section
│   │   ├── Footer.jsx           # Section 13: Footer brand links
│   │   ├── Hero.jsx             # Section 2: Hero section & landing overview
│   │   ├── HowItWorks.jsx       # Section 5: Timeline of 7 platform steps
│   │   ├── Navbar.jsx           # Section 1: Navigation bar & mobile menu
│   │   ├── OnboardingModal.jsx  # Interactive environment setup modal
│   │   ├── Problem.jsx          # Section 3: Fragmented preparation warning cards
│   │   ├── Pricing.jsx          # Section 10: Free, Premium, & College tiers
│   │   ├── Solution.jsx         # Section 4: Unified ecosystem pipeline diagram
│   │   ├── ThemeToggle.jsx      # Light / Dark theme switcher control
│   │   └── TrustSecurity.jsx    # Section 11: Privacy & security compliance
│   ├── pages/
│   │   └── LandingPage.jsx # Parent container assembling the exact page flow
│   ├── App.jsx             # Root React component
│   ├── index.css           # Global design tokens and Tailwind directives
│   └── main.jsx            # React SPA entry mount script
├── index.html              # Main Vite entry document with anti-FOUC script
├── package.json            # Scripts and dependencies configurations
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Custom Tailwind styling tokens
└── vite.config.js          # Development server and bundle config
```

---

## 💎 Design Language

The visual system is designed to convey the authoritative, precise, and sophisticated aesthetic of a premium AI SaaS platform:
* **Backgrounds**: Deep Navy (`#0B132B`) / Charcoal base theme with interactive light mode compatibility.
* **Accents**: Cyan/Teal border highlights paired with Blue-to-Purple brand gradients.
* **Elevation**: Low-contrast hairline dividers (`border-theme`) and diffused ambient shadows.
* **Transitions**: Smooth duration-300 active toggles with FOUC prevention logic in the root head.
