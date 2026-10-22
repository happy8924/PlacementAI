import re
from typing import Dict, Any, Tuple, List

def evaluate_student_job_eligibility(
    student_user: dict,
    student_profile: dict,
    job: dict
) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Unified, strict placement criteria evaluation:
    A student is strictly eligible ONLY if:
    1. Student account is approved (is_approved=True, approval_status='approved') and active.
    2. Student CGPA >= job min_cgpa (if min_cgpa > 0). Missing CGPA is treated as ineligible.
    3. Student Branch matches eligible_branches (if eligible_branches is specified).
    4. Required Skills match: At least 50% of the job's required skills must match student's skills.
       (If job specifies required skills and student has 0 matching skills, they are ineligible).
    
    Returns:
        (is_eligible: bool, reasons: List[str], metrics: dict)
    """
    reasons = []

    # 1. Verification / Approval check
    if not student_user.get("is_approved", True) or student_user.get("approval_status") == "pending":
        reasons.append("Account pending institutional TPO verification")
        return False, reasons, {}

    if student_user.get("is_active") is False:
        reasons.append("Account is inactive")
        return False, reasons, {}

    # Extract job criteria
    min_cgpa = float(job.get("min_cgpa") or 0.0)
    eligible_branches = [b.strip().lower() for b in (job.get("eligible_branches") or []) if b.strip()]
    req_skills = [s.strip().lower() for s in (job.get("requirements") or job.get("required_skills") or []) if s.strip()]

    # Extract student details
    raw_cgpa = student_profile.get("cgpa")
    st_cgpa = float(raw_cgpa or 0.0)
    st_branch = (
        student_profile.get("branch") or 
        student_user.get("student_details", {}).get("branch") or 
        ""
    ).strip().lower()
    st_skills = [s.strip().lower() for s in (student_profile.get("skills") or []) if s.strip()]

    # Check 1: CGPA
    if min_cgpa > 0.0:
        if raw_cgpa is None or st_cgpa < min_cgpa:
            reasons.append(f"CGPA {st_cgpa:.2f} is below required cutoff of {min_cgpa:.2f}")

    # Check 2: Branch
    if eligible_branches:
        branch_matched = any(
            eb in st_branch or st_branch in eb 
            for eb in eligible_branches
        )
        if not branch_matched or not st_branch:
            reasons.append(f"Branch '{st_branch or 'Unspecified'}' is not in eligible branches list")

    # Check 3: Skills
    matched_skills = []
    if req_skills:
        for r_skill in req_skills:
            pattern = r'\b' + re.escape(r_skill) + r'\b'
            # Check direct substring or regex word boundary match
            if any(re.search(pattern, sk) or r_skill in sk or sk in r_skill for sk in st_skills):
                matched_skills.append(r_skill)

        skill_pct = (len(matched_skills) / len(req_skills)) * 100.0 if req_skills else 100.0
        # Student must have at least 50% matching skills
        if skill_pct < 50.0:
            reasons.append(f"Technical skills match {skill_pct:.0f}% is below required 50% threshold ({len(matched_skills)}/{len(req_skills)} matched)")
    else:
        skill_pct = 100.0

    is_eligible = (len(reasons) == 0)

    metrics = {
        "cgpa": st_cgpa,
        "min_cgpa": min_cgpa,
        "branch": st_branch,
        "matched_skills": matched_skills,
        "total_req_skills": len(req_skills),
        "skill_pct": round(skill_pct, 1)
    }

    return is_eligible, reasons, metrics
