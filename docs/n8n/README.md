# PlacementAI — n8n Email Automation Integration Guide

This guide describes how to configure, import, test, and troubleshoot the integrated Recruiter Job Broadcast workflow between **PlacementAI (FastAPI)** and **n8n**.

---

## 1. Architecture & Responsibility Separation

```
PlacementAI Recruiter Dashboard
          │
          ▼
FastAPI Backend (POST /api/v1/recruiter/jobs)
          │
          ├─ Validates Job & Saves to MongoDB `jobs`
          ├─ Evaluates strict candidate eligibility (CGPA, Branch, Skills)
          ├─ Filters out previously notified students (Idempotency)
          └─ Calls n8n Webhook (`N8N_WEBHOOK_URL`)
                    │
                    ▼
          n8n Webhook Trigger (`placementai-job-broadcast`)
                    │
                    ├─ Validates payload contract & unpacks recipient queue
                    ├─ Generates branded HTML email for each student
                    ├─ Dispatches personalized email via Gmail OAuth2 API
                    ├─ Logs delivery results (`sent` or `failed`) in MongoDB `mail_logs`
                    └─ Returns execution status to PlacementAI
```

---

## 2. Payload Contract Specification

### Webhook Request (FastAPI -> n8n)
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `X-PlacementAI-Dispatch-Id: DISP-<jobId>-<timestamp>-<uuid>`

```json
{
  "dispatch_id": "DISP-6724cb12-1730450000-a1b2c3",
  "source": "PlacementAI",
  "timestamp": "2026-11-01T08:30:00Z",
  "job": {
    "jobId": "6724cb1234567890abcdef12",
    "jobTitle": "Full Stack Developer",
    "role": "Software Engineer",
    "department": "Engineering",
    "companyName": "Google",
    "recruiterName": "John Doe",
    "recruiterEmail": "recruiter@company.com",
    "employmentType": "Full-time",
    "numberOfOpenings": 5,
    "location": "Bengaluru",
    "workMode": "Hybrid",
    "salaryOrStipend": "18-24 LPA",
    "experienceRequired": "0-2 Years",
    "minimumCGPA": 7.5,
    "eligibleBranches": ["Computer Science", "Information Technology"],
    "requiredSkills": ["Python", "FastAPI", "React", "MongoDB"],
    "preferredSkills": ["Docker", "Tailwind CSS"],
    "jobDescription": "Full stack development across modern web systems.",
    "responsibilities": ["Build APIs", "Create frontend pages"],
    "selectionProcess": ["Online Test", "Technical Interview", "HR Interview"],
    "applicationDeadline": "2026-11-30",
    "joiningDate": "2027-01-15",
    "applyLink": "http://localhost:3000/student/jobs",
    "hrContactEmail": "hr@company.com"
  },
  "recipients": [
    {
      "studentId": "6724a1234567890abcdef11",
      "studentName": "Aaryan Shah",
      "studentEmail": "aaryan@student.edu",
      "matchScore": 92.5,
      "matchedSkills": ["Python", "FastAPI", "React"]
    }
  ],
  "meta": {
    "total_recipients": 1,
    "platform_version": "1.0.0"
  }
}
```

### Webhook Response (n8n -> FastAPI)
```json
{
  "success": true,
  "status": "completed",
  "message": "Job broadcast execution finished. Emails processed and logged in MongoDB mail_logs."
}
```

---

## 3. How to Import the Workflow into n8n

1. Open your n8n workspace (self-hosted or cloud).
2. Click **Add Workflow** -> Click **...** (top-right menu) -> Select **Import from File**.
3. Select the file:
   `docs/n8n/n8n_placementai_job_broadcast.json`
4. Reconnect your credentials:
   - **Gmail node (`Send Gmail`):** Connect your existing Gmail OAuth2 credential (`BCGZ45OPYYDOL3Rp` or select your active Gmail account).
   - **MongoDB nodes (`Save Mail Log`, `Save Mail Log (Failed)`):** Connect your MongoDB account credential (`dRrnl8KfhVxf8vAQ` or select your active MongoDB connection).
5. Switch the workflow toggle from **Inactive** to **Active** (in top-right).
6. Copy the **Production Webhook URL**:
   Example: `https://your-n8n.com/webhook/placementai-job-broadcast`

---

## 4. Backend Environment Configuration

Add the copied Webhook URL to `backend/.env`:

```env
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/placementai-job-broadcast
N8N_TIMEOUT_SECONDS=30
```

> **Note on Local Development without n8n:**  
> If `N8N_WEBHOOK_URL` is left empty or not provided, PlacementAI automatically falls back to safe simulation mode. It logs the eligible candidates to MongoDB `mail_logs` without breaking the recruiter workflow.

---

## 5. Verification & Testing Procedure

### Step 1: Run Automated Integration Tests
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest tests/test_n8n_integration.py -v
```
All 5 automated test cases verify:
- Data normalization
- Empty recipient edge cases
- Simulation fallback
- Idempotency & duplicate prevention
- HTTP timeout / network failure resilience

### Step 2: Triggering Broadcast from Recruiter Dashboard
1. Log in as a Recruiter (`/login`).
2. Post a new Job vacancy (`/recruiter/jobs`).
3. If approved, click **Broadcast Job to Candidates**.
4. The backend evaluates eligibility and dispatches the payload to n8n.
5. Check delivery status via API:
   `GET /api/v1/recruiter/jobs/{job_id}/broadcast-status`
6. Check MongoDB collection `mail_logs` to inspect recorded entries.

---

## 6. Troubleshooting

| Symptom | Root Cause | Fix |
|---|---|---|
| `Cannot broadcast job before TPO approval` | Job status is `pending_approval` | Log in as TPO, visit `/tpo/approvals`, and approve the job. |
| `dispatched_count: 0, status: already_broadcasted` | Idempotency guard activated | Candidates have already received an email for this `jobId`. To re-send, remove old entries from `mail_logs`. |
| `n8n webhook error 404` | Workflow is not Active in n8n | Ensure the workflow toggle is switched to **Active** in n8n. Test URLs end in `/webhook-test/...` while production URLs end in `/webhook/...`. |
| `Failed to connect to n8n webhook` | Network / firewall / invalid URL | Verify that `N8N_WEBHOOK_URL` is reachable from the server running FastAPI. |

