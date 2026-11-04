import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from pymongo.database import Database as MongoDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)

def format_n8n_job_payload(job: dict, apply_url: Optional[str] = None) -> dict:
    """
    Normalize a PlacementAI job document into the schema expected by the n8n Gmail workflow.
    Ensures seamless compatibility with the HTML email generator and MongoDB log nodes.
    """
    job_id = str(job.get("_id") or job.get("job_id") or "")
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    fallback_apply = f"{frontend_base}/student/jobs"

    def clean_list(val):
        if isinstance(val, list):
            return [str(item).strip() for item in val if str(item).strip()]
        if isinstance(val, str) and val.strip():
            return [s.strip() for s in val.split(",") if s.strip()]
        return []

    req_skills = clean_list(job.get("requirements") or job.get("requiredSkills") or job.get("required_skills"))
    pref_skills = clean_list(job.get("preferred_skills") or job.get("preferredSkills"))
    branches = clean_list(job.get("eligible_branches") or job.get("eligibleBranches"))
    responsibilities = clean_list(job.get("responsibilities"))
    selection_process = clean_list(job.get("selection_process") or job.get("selectionProcess"))

    return {
        "jobId": job_id,
        "job_id": job_id,
        "jobTitle": job.get("title") or job.get("jobTitle") or "Job Opening",
        "role": job.get("role") or job.get("title") or "Graduate Trainee",
        "department": job.get("department") or "",
        "companyName": job.get("company_name") or job.get("companyName") or "PlacementAI Partner Company",
        "recruiterName": job.get("recruiter_name") or job.get("recruiterName") or "Recruiter",
        "recruiterEmail": job.get("official_email") or job.get("recruiterEmail") or "",
        "employmentType": job.get("employment_type") or job.get("job_type") or job.get("employmentType") or "Full-time",
        "numberOfOpenings": job.get("number_of_openings") or job.get("numberOfOpenings") or 1,
        "location": job.get("location") or "Onsite",
        "workMode": job.get("work_mode") or job.get("workMode") or "On-site",
        "salaryOrStipend": str(job.get("salary_package") or job.get("salaryOrStipend") or "Not Disclosed"),
        "experienceRequired": job.get("experience_required") or job.get("experienceRequired") or "0-2 Years",
        "minimumCGPA": float(job.get("min_cgpa") or job.get("minimumCGPA") or 0.0),
        "eligibleBranches": branches,
        "requiredSkills": req_skills,
        "preferredSkills": pref_skills,
        "jobDescription": job.get("description") or job.get("jobDescription") or "",
        "responsibilities": responsibilities,
        "selectionProcess": selection_process,
        "applicationDeadline": str(job.get("deadline") or job.get("applicationDeadline") or ""),
        "joiningDate": str(job.get("joining_date") or job.get("joiningDate") or ""),
        "applyLink": job.get("apply_link") or apply_url or fallback_apply,
        "hrContactEmail": job.get("hr_contact_email") or job.get("hrContactEmail") or ""
    }

def dispatch_job_broadcast_to_n8n(
    db: MongoDatabase,
    job_id_str: str,
    job: dict,
    recipients: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Authoritative dispatch pipeline:
    FastAPI -> (n8n Webhook OR direct Gmail SMTP) -> MongoDB mail_logs.
    
    Includes idempotency protection (skips already delivered recipients),
    connection timeouts, error logging, and direct SMTP sending.
    """
    dispatch_id = f"DISP-{job_id_str[:8]}-{int(datetime.now(timezone.utc).timestamp())}-{uuid.uuid4().hex[:6]}"
    normalized_job = format_n8n_job_payload(job)

    # Idempotency filter: Do not re-send to candidates who have a successful 'sent' log for this job
    # (Exclude simulated_local logs from previous tests so real emails get dispatched)
    existing_sent = set(
        db.mail_logs.distinct(
            "student_id",
            {"job_id": job_id_str, "status": "sent", "mode": {"$ne": "simulated_local"}}
        )
    )

    pending_recipients = [
        r for r in recipients
        if str(r.get("student_id") or r.get("studentId")) not in existing_sent
    ]

    total_eligible = len(recipients)
    already_sent_count = total_eligible - len(pending_recipients)

    if not pending_recipients:
        return {
            "success": True,
            "status": "already_broadcasted" if already_sent_count > 0 else "no_eligible_candidates",
            "dispatch_id": dispatch_id,
            "eligible_count": total_eligible,
            "dispatched_count": 0,
            "stats": {
                "emails_dispatched": 0,
                "emails_failed": 0,
                "already_sent": already_sent_count,
                "eligible_candidates": total_eligible
            },
            "already_sent_count": already_sent_count,
            "message": "All eligible candidates have already been notified." if already_sent_count > 0 else "No eligible candidates match this job's criteria."
        }

    # Format recipient list for webhook or SMTP
    formatted_recipients = []
    for r in pending_recipients:
        st_id = str(r.get("student_id") or r.get("studentId"))
        formatted_recipients.append({
            "studentId": st_id,
            "student_id": st_id,
            "studentName": r.get("student_name") or r.get("studentName") or "Candidate",
            "studentEmail": r.get("student_email") or r.get("studentEmail"),
            "matchScore": r.get("match_score", 100.0),
            "matchedSkills": r.get("matched_skills", [])
        })

    webhook_payload = {
        "dispatch_id": dispatch_id,
        "source": "PlacementAI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "job": normalized_job,
        "recipients": formatted_recipients,
        "meta": {
            "total_recipients": len(formatted_recipients),
            "platform_version": "1.0.0"
        }
    }

    webhook_url = (settings.N8N_WEBHOOK_URL or "").strip()

    # If N8N webhook is NOT configured, dispatch real emails directly via Gmail SMTP!
    if not webhook_url:
        logger.info(f"N8N_WEBHOOK_URL not configured. Dispatching real emails via direct Gmail SMTP for {len(formatted_recipients)} candidates.")
        from app.services.email import send_job_opportunity_email

        sent_count = 0
        failed_count = 0
        mail_records = []
        company_name = normalized_job.get("companyName") or job.get("company_name") or "Company"

        for r in formatted_recipients:
            st_email = r["studentEmail"]
            st_name = r["studentName"]
            if not st_email:
                continue

            success, err_msg = send_job_opportunity_email(st_email, st_name, job, company_name)
            status_val = "sent" if success else "failed"
            if success:
                sent_count += 1
            else:
                failed_count += 1

            mail_records.append({
                "job_id": job_id_str,
                "jobId": job_id_str,
                "student_id": r["studentId"],
                "studentId": r["studentId"],
                "student_name": st_name,
                "student_email": st_email,
                "company_name": company_name,
                "job_title": normalized_job.get("jobTitle") or job.get("title", ""),
                "sent_at": datetime.now(timezone.utc),
                "status": status_val,
                "mode": "smtp_direct",
                "dispatch_id": dispatch_id,
                "error_message": err_msg or ""
            })

        if mail_records:
            db.mail_logs.insert_many(mail_records)

        # Log action in activity_logs
        db.activity_logs.insert_one({
            "user_id": str(job.get("recruiter_id", "system")),
            "role": "recruiter",
            "action": "JOB_BROADCAST_SMTP_DISPATCHED",
            "details": {
                "dispatch_id": dispatch_id,
                "job_id": job_id_str,
                "sent_count": sent_count,
                "failed_count": failed_count,
                "recipients_count": len(formatted_recipients)
            },
            "timestamp": datetime.now(timezone.utc)
        })

        return {
            "success": True,
            "status": "dispatched",
            "dispatch_id": dispatch_id,
            "eligible_count": total_eligible,
            "dispatched_count": sent_count,
            "stats": {
                "emails_dispatched": sent_count,
                "emails_failed": failed_count,
                "eligible_candidates": total_eligible
            },
            "already_sent_count": already_sent_count,
            "message": f"Broadcast completed: Sent {sent_count} email(s) successfully to eligible candidates via SMTP."
        }

    # Dispatch to live n8n Webhook
    timeout = settings.N8N_TIMEOUT_SECONDS or 30
    try:
        logger.info(f"Dispatching broadcast payload to n8n webhook: {webhook_url} for job {job_id_str}")
        with httpx.Client(timeout=timeout) as client:
            response = client.post(
                webhook_url,
                json=webhook_payload,
                headers={
                    "Content-Type": "application/json",
                    "X-PlacementAI-Dispatch-Id": dispatch_id,
                    "User-Agent": "PlacementAI-FastAPI/1.0"
                }
            )

        if response.status_code in (200, 201, 202):
            resp_data = {}
            try:
                resp_data = response.json()
            except Exception:
                resp_data = {"raw_text": response.text}

            logger.info(f"n8n webhook responded successfully ({response.status_code}) for dispatch {dispatch_id}")
            
            # Record dispatch event in activity_logs
            db.activity_logs.insert_one({
                "user_id": str(job.get("recruiter_id", "system")),
                "role": "recruiter",
                "action": "JOB_BROADCAST_N8N_DISPATCHED",
                "details": {
                    "dispatch_id": dispatch_id,
                    "job_id": job_id_str,
                    "recipients_count": len(formatted_recipients),
                    "n8n_status": response.status_code,
                    "n8n_response": resp_data
                },
                "timestamp": datetime.now(timezone.utc)
            })

            return {
                "success": True,
                "status": "dispatched",
                "dispatch_id": dispatch_id,
                "eligible_count": total_eligible,
                "dispatched_count": len(formatted_recipients),
                "stats": {
                    "emails_dispatched": len(formatted_recipients),
                    "emails_failed": 0,
                    "eligible_candidates": total_eligible
                },
                "already_sent_count": already_sent_count,
                "n8n_response": resp_data,
                "message": f"Successfully handed off {len(formatted_recipients)} candidate notifications to n8n email pipeline."
            }
        else:
            err_msg = f"n8n webhook error {response.status_code}: {response.text[:200]}"
            logger.error(err_msg)
            # Log failure in mail_logs for audit
            for r in formatted_recipients:
                db.mail_logs.insert_one({
                    "job_id": job_id_str,
                    "jobId": job_id_str,
                    "student_id": r["studentId"],
                    "studentId": r["studentId"],
                    "student_name": r["studentName"],
                    "student_email": r["studentEmail"],
                    "company_name": normalized_job["companyName"],
                    "job_title": normalized_job["jobTitle"],
                    "sent_at": datetime.now(timezone.utc),
                    "status": "failed",
                    "dispatch_id": dispatch_id,
                    "error_message": err_msg
                })

            return {
                "success": False,
                "status": "failed",
                "dispatch_id": dispatch_id,
                "eligible_count": total_eligible,
                "dispatched_count": 0,
                "stats": {
                    "emails_dispatched": 0,
                    "emails_failed": len(formatted_recipients),
                    "eligible_candidates": total_eligible
                },
                "error": err_msg
            }

    except httpx.TimeoutException:
        err_msg = f"n8n webhook timed out after {timeout}s"
        logger.error(err_msg)
        return {
            "success": False,
            "status": "timeout",
            "dispatch_id": dispatch_id,
            "eligible_count": total_eligible,
            "dispatched_count": 0,
            "stats": {
                "emails_dispatched": 0,
                "emails_failed": len(formatted_recipients),
                "eligible_candidates": total_eligible
            },
            "error": err_msg
        }
    except Exception as e:
        err_msg = f"Failed to connect to n8n webhook: {str(e)}"
        logger.error(err_msg)
        return {
            "success": False,
            "status": "error",
            "dispatch_id": dispatch_id,
            "eligible_count": total_eligible,
            "dispatched_count": 0,
            "stats": {
                "emails_dispatched": 0,
                "emails_failed": len(formatted_recipients),
                "eligible_candidates": total_eligible
            },
            "error": err_msg
        }
