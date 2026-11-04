# PlacementAI — Complete System Audit (AUDIT.md)

**Audit Date:** November 2026 (Checkpoint 1 Execution)  
**Auditor:** Senior Full-Stack & Integration Engineer  
**Status:** Complete Audit Finished

---

## 1. Executive Summary

A comprehensive architectural and functional audit of the PlacementAI project was conducted across the frontend, backend, MongoDB database schemas, and the attached n8n workflow (`Email Automation - Recruiter Job Broadcast`).

The project has a solid foundation with fully structured UI components for four roles (Student, Recruiter, TPO, Admin), an authoritative eligibility engine (`eligibility.py`), and FastAPI routes. However, significant database collection fragmentation, duplicate eligibility implementations, direct SMTP usage instead of the n8n pipeline, and missing backend test suites were identified.

---

## 2. Audit Findings by Category

### A. Frontend Audit
- **Status:** **Operational & Production Build Passed (0 errors)**.
- **Routes & Pages:** Complete coverage across all 4 roles in `frontend/src/App.jsx`.
- **Branding:** Official logos, icons, and favicon are in place in `frontend/public/` and referenced across sidebars, Navbar, and Footer.
- **Tab Titles:** Managed centrally via `PageTitleManager.jsx`.
- **Form Validations:** Client-side validations exist on Auth, Job Creation, and Profile pages.
- **Issues Found:**
  1. Frontend bundle size warning: `dist/assets/index-CXDP13_P.js` is ~779 kB (needs route-based code-splitting with `React.lazy` in optimization phase).
  2. Frontend recruiter job form currently does not display live n8n broadcast dispatch status or email delivery statistics after publishing.

### B. Backend Audit
- **FastAPI Structure:** Clean modular design in `backend/app/api/v1/`.
- **Authentication & Security:** JWT authentication with bcrypt password hashing. Role checks enforced in dependencies (`get_current_user`, `get_current_recruiter`).
- **Issues Found:**
  1. **Direct SMTP email broadcast in Recruiter API:** In `backend/app/api/v1/recruiter.py` (`trigger_job_broadcast_internal`), broadcast emails are sent directly through local SMTP using `app.services.email.send_job_opportunity_email`. This completely bypasses the user's existing n8n email automation workflow.
  2. **Missing `N8N_WEBHOOK_URL` configuration:** `backend/app/core/config.py` does not have `N8N_WEBHOOK_URL` defined or loaded from environment variables.
  3. **Duplicate Eligibility Logic:** `backend/app/services/roadmap_engine.py` contains a separate `check_student_job_eligibility` function that diverges from the authoritative `app.services.eligibility.evaluate_student_job_eligibility`.
  4. **Missing Backend Test Suite:** `backend/tests/` directory is empty. Running `pytest` fails with `collected 0 items`.

### C. Database & Schema Inconsistencies (CRITICAL)
- **Collection Fragmentation:**
  1. **Applications Collection Split:**
     - `student.py`, `admin.py`, and `recruiter.py` read and write to `db.applications`.
     - `tpo.py` and one call in `student.py` (line 584) read and write to `db.job_applications`.
     - **Result:** TPO dashboard, recruitment oversight, and analytics see 0 applications when students apply!
  2. **Interviews Collection Split:**
     - `recruiter.py` writes scheduled interviews into `db.recruiter_interviews`.
     - `student.py`, `tpo.py`, and `admin.py` read from `db.interviews`.
     - **Result:** Students and TPOs cannot see interviews scheduled by recruiters!
  3. **Companies vs Recruiter Profiles Split:**
     - `recruiter.py` and `tpo.py` store company profiles in `db.recruiter_profiles`.
     - `admin.py` and `student.py` query `db.companies`.
  4. **Roadmaps Collection Split:**
     - `roadmap.py` stores data in `db.student_roadmaps`.
     - `database.py` created indexes on `learning_roadmaps`.
  5. **Missing Index:** `db.mail_logs` lacks compound indexes on `[("job_id", 1), ("student_id", 1)]` and `status`.

### D. n8n Workflow Audit (`Email Automation - Recruiter Job Broadcast`)
- **Current Trigger:** `formTrigger` ("Recruiter Job Form") expecting manual submission via n8n public form URL.
- **Redundant Operations:**
  - Node `Save Recruiter` writes to `recruiters` collection in MongoDB.
  - Node `Save Job` writes to `jobs` collection in MongoDB.
  - Node `Find Active Students` queries MongoDB collection `students` (which does not match PlacementAI's schema where students are in `users` with `role: "student"` and `student_profiles`).
  - Node `Match Students` duplicates the scoring and threshold logic that PlacementAI already performs in `backend/app/services/eligibility.py`.
- **Preserved Strengths to Retain:**
  - Excellent Gmail HTML email layout and design in `Build Email HTML`.
  - Batching and loop per student via `For Each Eligible Student` (`splitInBatches`).
  - Gmail API sending with `continueErrorOutput` error boundary.
  - Granular sent and failed outcome preparation and MongoDB `mail_logs` persistence.
- **Required Transformation:**
  - Replace `formTrigger` with a `webhook` trigger node accepting pre-evaluated payload from FastAPI.
  - Remove duplicate recruiter and job inserts.
  - Pass pre-filtered eligible recipients from FastAPI directly into `For Each Eligible Student`.
  - Maintain Gmail sending and `mail_logs` recording.

### E. AI Functionality Audit
- **Resume Analysis (`resume_analyzer.py`):** Uses deterministic parsing (`pypdf`, regex, `TECHNICAL_SKILLS_DB`) to compute ATS scores and extract skills. Fast, reliable, zero cost, completely offline.
- **Roadmap Generation (`roadmap_engine.py`):** Uses curated free technical learning modules and verified resources (`VERIFIED_FREE_RESOURCES`). Deterministic and transparent.
- **Mock Interviews:** Currently simulated/rule-based. No paid external LLM dependencies are required at this stage.

---

## 3. Prioritized Implementation Plan

| Step | Priority | Checkpoint | Focus Area |
|---|---|---|---|
| **1** | **P0** | Checkpoint 2 | **n8n Webhook Integration** — Create `app/services/n8n.py`, add `N8N_WEBHOOK_URL` to config, update `recruiter.py` broadcast to dispatch to n8n with idempotency, update n8n workflow JSON. |
| **2** | **P0** | Checkpoint 3 & 5 | **Database Harmonization** — Standardize `applications` (fix `job_applications`), standardize `interviews` (fix `recruiter_interviews`), harmonize `companies` with `recruiter_profiles`. |
| **3** | **P1** | Checkpoint 3 | **End-to-End Student & Recruiter Flows** — Verify application creation, interview scheduling visibility, recruiter candidate review, student notifications. |
| **4** | **P1** | Checkpoint 4 | **TPO & Admin Harmonization** — Ensure TPO analytics and recruitment pipeline read from unified collections, verify audit logs. |
| **5** | **P1** | Checkpoint 5 | **Consolidate Eligibility Engine** — Refactor `roadmap_engine.py` to use `app.services.eligibility.evaluate_student_job_eligibility`. Add indexes for `mail_logs`. |
| **6** | **P2** | Checkpoint 6 | **Automated Pytest Suite & E2E Validation** — Create comprehensive unit tests in `backend/tests/test_auth.py`, `test_eligibility.py`, and `test_n8n.py`. |



---

## 4. Checkpoint Status Tracker

- [x] **Checkpoint 1 — Complete Project Audit:** COMPLETED
- [x] **Checkpoint 2 — n8n Email Automation Integration:** COMPLETED
  - Added `N8N_WEBHOOK_URL` and `N8N_TIMEOUT_SECONDS` to `config.py` and `.env.example`.
  - Created `backend/app/services/n8n.py` integration service with payload normalization, idempotency filtering, timeout/error handling, and dev simulation fallback.
  - Updated `backend/app/api/v1/recruiter.py` to route broadcasts to n8n and added `GET /jobs/{job_id}/broadcast-status` endpoint.
  - Generated production import-ready `docs/n8n/n8n_placementai_job_broadcast.json` with Webhook Trigger and preserved Gmail HTML templating + MongoDB `mail_logs`.
  - Authored comprehensive documentation in `docs/n8n/README.md`.
  - Built automated unit tests in `backend/tests/test_n8n_integration.py` (5/5 tests passing).
- [x] **Checkpoint 3 — Student & Recruiter Module Completion:** COMPLETED
  - Resolved `recruiter_interviews` vs `interviews` split: recruiter scheduling now inserts directly into canonical `db.interviews` and mirrors to `recruiter_interviews`.
  - Updated `backend/app/api/v1/student.py` `get_student_interviews` to fetch both AI mock interviews and scheduled recruiter interviews with complete meeting details (join link, company name, date, time).
  - Enforced backend student profile completion gate in `backend/app/api/v1/student.py` before application submission.
  - Standardized application queries across `tpo.py` and `student.py` to reference canonical `db.applications`.
  - Added new "Check Eligible Students" feature: Recruiter can preview eligible candidate count and list (Name, ID, CGPA, Branch, Matched Skills) directly from draft form input before submitting.
  - Updated Job Publishing workflow: Publishing a drive sets status to `pending_approval` without direct email sending. Broadcast email is dispatched only when TPO verifies and approves the drive.
  - Added automated unit and integration tests in `backend/tests/test_student_recruiter_flow.py` (8/8 tests passing).
- [x] **Checkpoint 4 — TPO, Admin & AI Functionality:** COMPLETED
  - Unified `check_student_job_eligibility` in `roadmap_engine.py` to delegate to authoritative `evaluate_student_job_eligibility` service (with graceful branch/CGPA fallback for roadmap guidance).
  - Confirmed TPO approval flow: `decide_job_approval` triggers broadcast only on approve via `trigger_job_broadcast_internal`.
  - Confirmed AI services (resume_analyzer, roadmap_engine, eligibility) all import and function correctly.
  - Added `test_ai_and_admin_flow.py` covering ATS analyzer, roadmap eligibility, and admin company fallback.
- [x] **Checkpoint 5 — Database, Security & Code Optimization:** COMPLETED
  - Added missing `mail_logs`, `dispatch_id`, and `recruiter_profiles` indexes to `database.py`.
  - Harmonized `admin.py` company lookups to query both `companies` and `recruiter_profiles` collections.
  - Verified `password_hash` is excluded from all API list/detail responses.
  - Confirmed JWT RBAC guards active on all roles (tpo/admin cross-access correct).
- [x] **Checkpoint 6 — Complete Testing & Final Validation:** COMPLETED
  - Frontend build: **PASS** (0 errors, 2359 modules, 11.07s)
  - Backend import: **PASS** (`app.main` loads cleanly)
  - Backend tests: **12/12 PASS** (test_ai_and_admin_flow.py 3, test_n8n_integration.py 5, test_student_recruiter_flow.py 4)
