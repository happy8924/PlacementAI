# PlacementAI — Technical Architecture Decisions (DECISIONS.md)

This log records major technical and architectural decisions, the context behind them, and the rationales.

---

## Decision 1: Single Source of Truth for Eligibility Evaluation
- **Date:** November 2026
- **Context:** Eligibility was calculated in multiple places: `backend/app/services/eligibility.py`, `backend/app/services/roadmap_engine.py`, and inside the n8n `Match Students` JavaScript node.
- **Decision:** `backend/app/services/eligibility.py` (`evaluate_student_job_eligibility`) is established as the sole authoritative eligibility engine.
- **Rationale:** Prevents discrepancy where n8n notifies a student who is later flagged as ineligible by the backend when attempting to apply, or vice versa. Ensures 100% consistent criteria across drive broadcasting, student feeds, applications, and roadmaps.

---

## Decision 2: Decoupled n8n Email Dispatch Architecture
- **Date:** November 2026
- **Context:** Recruiter job broadcast was invoking local SMTP synchronously, with potential server blocking and lack of delivery pipeline management. Meanwhile, the user already authored a production n8n Gmail broadcast workflow.
- **Decision:** Transform the n8n workflow into a Webhook Trigger consumer. FastAPI evaluates eligible candidates, prepares a normalized payload with an idempotent `dispatch_id`, and delivers it to the n8n Webhook. n8n executes the templating, Gmail sending, and status logging.
- **Rationale:** Keeps sensitive Gmail OAuth2 tokens isolated inside n8n; offloads email delivery retries and throttling from the FastAPI event loop; reuses the user's battle-tested n8n workflow without manual recruiter form entry.

---

## Decision 3: Harmonization of MongoDB Collections
- **Date:** November 2026
- **Context:** Inconsistencies found during audit:
  - `applications` vs `job_applications`
  - `interviews` vs `recruiter_interviews`
  - `recruiter_profiles` vs `companies`
- **Decision:** Standardize canonical collection names to:
  1. `applications` (for student drive applications across student, recruiter, tpo, and admin)
  2. `interviews` (for scheduled candidate interview rounds across recruiter, student, tpo, and admin)
  3. `recruiter_profiles` (for company profile and recruiter corporate identity)
- **Rationale:** Ensures cross-role synchronization so that actions performed by Recruiters (e.g., scheduling an interview or changing application status) are instantly visible to Students and TPOs.

---

## Decision 4: AI & ATS Strategy (Zero External Cost)
- **Date:** November 2026
- **Context:** External LLM APIs introduce latency, rate limits, credit expiration, and recurring billing.
- **Decision:** Retain the deterministic Python-based ATS resume scoring engine (`pypdf` + regex + verified skill databases) and curated verified learning resources for roadmaps.
- **Rationale:** Provides instant feedback (<200ms) with zero cost, zero external API keys, 100% offline capability, and predictable results for campus environments.


---

## Decision 5: Required Technical Skills Match Threshold Raised to 70%
- **Date:** November 2026
- **Context:** The previous 50% match threshold was too lenient, allowing candidates with superficial overlap to receive broadcast alerts and be marked eligible.
- **Decision:** Increased the required technical skills match threshold from 50% to 70% in `backend/app/services/eligibility.py` and reflected this in the Recruiter Job Management UI and candidate preview modal.
- **Rationale:** Ensures higher relevancy of notified candidates for company campus drives and filters out candidates who do not possess a strong majority of the required tech stack.
