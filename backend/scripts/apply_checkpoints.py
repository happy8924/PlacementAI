import re

# 1. Update database.py indexes
with open('backend/app/core/database.py', 'r', encoding='utf-8') as f:
    db_content = f.read()

if 'mail_logs.create_index' not in db_content:
    old_str = 'cls.db.bookmarks.create_index("user_id")'
    new_str = '''cls.db.bookmarks.create_index("user_id")

                # 16. mail_logs collection indexes
                cls.db.mail_logs.create_index([("job_id", 1), ("student_id", 1)])
                cls.db.mail_logs.create_index("status")
                cls.db.mail_logs.create_index("dispatch_id")

                # 17. recruiter_profiles collection indexes
                cls.db.recruiter_profiles.create_index("user_id", unique=True)'''
    db_content = db_content.replace(old_str, new_str)
    with open('backend/app/core/database.py', 'w', encoding='utf-8') as f:
        f.write(db_content)
    print("1. database.py indexes added successfully.")

# 2. Update roadmap_engine.py eligibility logic
with open('backend/app/services/roadmap_engine.py', 'r', encoding='utf-8') as f:
    rm_content = f.read()

old_func_start = 'def check_student_job_eligibility(student_profile: Dict[str, Any], db_jobs: List[Dict[str, Any]]) -> Tuple[bool, List[Dict[str, Any]], str]:'
if old_func_start in rm_content:
    new_func = '''def check_student_job_eligibility(student_profile: Dict[str, Any], db_jobs: List[Dict[str, Any]], student_user: Optional[Dict[str, Any]] = None) -> Tuple[bool, List[Dict[str, Any]], str]:
    """
    Authoritative eligibility check for learning roadmaps:
    Uses app.services.eligibility.evaluate_student_job_eligibility for uniform criteria.
    Falls back to branch and academic criteria so students can prepare for potential roles.
    """
    from app.services.eligibility import evaluate_student_job_eligibility

    open_jobs = [j for j in db_jobs if j.get("status") in ("open", "active")]
    if not open_jobs:
        return False, [], "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he."

    user_context = student_user or {
        "_id": student_profile.get("user_id", ""),
        "role": "student",
        "is_approved": True,
        "is_active": True
    }

    eligible_jobs = []
    for job in open_jobs:
        is_ok, reasons, metrics = evaluate_student_job_eligibility(user_context, student_profile, job)
        if is_ok:
            eligible_jobs.append(job)

    # Preparation fallback: if strict tech stack match not yet met, match by branch/CGPA for guided upskilling
    if not eligible_jobs:
        st_branch = (student_profile.get("branch") or "").strip().lower()
        st_cgpa = float(student_profile.get("cgpa") or 0.0)
        for job in open_jobs:
            min_cgpa = float(job.get("min_cgpa") or 0.0)
            branches = [b.strip().lower() for b in (job.get("eligible_branches") or []) if b.strip()]
            branch_match = not branches or "all" in branches or any(st_branch in b or b in st_branch for b in branches)
            cgpa_match = (st_cgpa == 0.0) or (st_cgpa >= min_cgpa)
            if branch_match and cgpa_match:
                eligible_jobs.append(job)

    if not eligible_jobs:
        return False, [], "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he."

    return True, eligible_jobs, "Eligible jobs found."'''

    # Replace from old_func_start to 'return True, eligible_jobs, "Eligible jobs found."'
    pattern = re.compile(r'def check_student_job_eligibility\(.*?\n    return True, eligible_jobs, "Eligible jobs found\."', re.DOTALL)
    rm_content = pattern.sub(new_func, rm_content, count=1)
    with open('backend/app/services/roadmap_engine.py', 'w', encoding='utf-8') as f:
        f.write(rm_content)
    print("2. roadmap_engine.py updated with authoritative eligibility engine.")

# 3. Update admin.py for company profiles & dual ID harmonization
with open('backend/app/api/v1/admin.py', 'r', encoding='utf-8') as f:
    admin_content = f.read()

# Replace total_companies
admin_content = admin_content.replace(
    'total_companies = db.companies.count_documents({})',
    'total_companies = db.companies.count_documents({}) or db.recruiter_profiles.count_documents({})'
)

# Replace recruiter company lookups
old_comps = '''    elif user.get("role") == "recruiter":
        comps = db.companies.find({"recruiter_id": user["_id"]})
        companies = [serialize_doc(c) for c in comps]'''

new_comps = '''    elif user.get("role") == "recruiter":
        comps = list(db.companies.find({"recruiter_id": {"$in": [user["_id"], user_id_str]}}))
        if not comps:
            comps = list(db.recruiter_profiles.find({"user_id": {"$in": [user["_id"], user_id_str]}}))
        companies = [serialize_doc(c) for c in comps]'''

admin_content = admin_content.replace(old_comps, new_comps)

with open('backend/app/api/v1/admin.py', 'w', encoding='utf-8') as f:
    f.write(admin_content)
print("3. admin.py company harmonization updated.")

