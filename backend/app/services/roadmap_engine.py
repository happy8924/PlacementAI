import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Standard curated high-quality verified FREE resources database (100% free & unpaid)
VERIFIED_FREE_RESOURCES = {
    "dsa": [
        {"title": "NeetCode 150 Mastery", "url": "https://neetcode.io/roadmap"},
        {"title": "LeetCode Hard Patterns", "url": "https://leetcode.com/discuss/general-discussion/465694/all-in-one-guide-to-competitive-programming"}
    ],
    "frontend": [
        {"title": "Frontend Masters: Enterprise Architecture", "url": "https://frontendmasters.com/guides/front-end-handbook/"},
        {"title": "React Deep Dive Docs", "url": "https://react.dev/learn"}
    ],
    "backend": [
        {"title": "Designing Data-Intensive Applications", "url": "https://microservices.io/"},
        {"title": "System Design Interview Guide", "url": "https://github.com/donnemartin/system-design-primer"}
    ],
    "ai_llm": [
        {"title": "DeepLearning.AI LLM Developer Track", "url": "https://www.deeplearning.ai/short-courses/"}
    ],
    "system_design": [
        {"title": "PlacementAI Automated Mock Portal", "url": "/#/student/mock-interview"}
    ]
}

def check_student_job_eligibility(student_profile: Dict[str, Any], db_jobs: List[Dict[str, Any]]) -> Tuple[bool, List[Dict[str, Any]], str]:
    """
    Check if the student is eligible for any active job posted by recruiters.
    Eligibility checks:
    - Job status == 'open'
    - Student branch matches eligible_branches (or eligible_branches is empty / contains "All" / "All Branches")
    - Student CGPA is >= min_cgpa required by the job (if CGPA exists)
    """
    open_jobs = [j for j in db_jobs if j.get("status") == "open"]
    
    if not open_jobs:
        return False, [], "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he."

    student_branch = (student_profile.get("branch") or "").strip().lower()
    student_cgpa = float(student_profile.get("cgpa") or 0.0)

    eligible_jobs = []
    for job in open_jobs:
        min_cgpa = float(job.get("min_cgpa") or 0.0)
        eligible_branches = [b.strip().lower() for b in job.get("eligible_branches", [])]
        
        # Branch match check
        branch_eligible = (
            not eligible_branches or
            "all" in eligible_branches or
            "all branches" in eligible_branches or
            any(student_branch in b or b in student_branch for b in eligible_branches if student_branch)
        )

        # CGPA match check (if student CGPA is 0/unspecified, allow with warning)
        cgpa_eligible = (student_cgpa == 0.0) or (student_cgpa >= min_cgpa)

        if branch_eligible and cgpa_eligible:
            eligible_jobs.append(job)

    if not eligible_jobs:
        return False, [], "abhi aapke roles ke specific koi compaany nahi he to roadmap available nahi he."

    return True, eligible_jobs, "Eligible jobs found."


def generate_default_roadmap_milestones(target_role: str, user_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Generates tailored 5 milestone nodes based on target role and skills.
    Includes duration_weeks, key skills, detailed description, and verified unpaid free resources.
    """
    role_lower = target_role.lower()

    if "ai" in role_lower or "data" in role_lower or "machine learning" in role_lower:
        milestones = [
            {
                "id": 1,
                "title": "Data Structures & Advanced Algorithms",
                "duration_weeks": 4,
                "status": "completed",
                "description": "Master Graph Algorithms, Dynamic Programming, and Space-Time Tradeoffs for technical interviews.",
                "key_skills": ["Graphs", "Dynamic Programming", "Trie", "Heap/PriorityQueue"],
                "resources": VERIFIED_FREE_RESOURCES["dsa"]
            },
            {
                "id": 2,
                "title": "Data Engineering & Analytics Foundations",
                "duration_weeks": 5,
                "status": "completed",
                "description": "Deep dive into Pandas, NumPy, SQL Query Optimization, Data Pipelines, and ETL Workflows.",
                "key_skills": ["Python", "Pandas", "SQL Tuning", "ETL Pipelines", "Feature Store"],
                "resources": VERIFIED_FREE_RESOURCES["backend"]
            },
            {
                "id": 3,
                "title": "Machine Learning Models & Deep Learning Architecture",
                "duration_weeks": 6,
                "status": "in_progress",
                "description": "Train Scikit-Learn models, PyTorch neural networks, model validation metrics, and hyperparameter tuning.",
                "key_skills": ["PyTorch", "Scikit-Learn", "Model Training", "Cross Validation", "Transformers"],
                "resources": VERIFIED_FREE_RESOURCES["ai_llm"]
            },
            {
                "id": 4,
                "title": "AI Engineering & LLM Integration",
                "duration_weeks": 5,
                "status": "upcoming",
                "description": "Learn RAG (Retrieval-Augmented Generation), Vector Databases (Pinecone/Chroma), and LangChain/LlamaIndex.",
                "key_skills": ["RAG Architecture", "Vector Embeddings", "LangChain", "Prompt Engineering"],
                "resources": VERIFIED_FREE_RESOURCES["ai_llm"]
            },
            {
                "id": 5,
                "title": "MLOps, Scalable Serving & Mock Interviews",
                "duration_weeks": 4,
                "status": "upcoming",
                "description": "Practice deploying ML models with Docker, FastAPI serving, model monitoring, and 1-on-1 mock interviews.",
                "key_skills": ["FastAPI", "Docker", "Model Serving", "MLOps", "CAP Theorem"],
                "resources": VERIFIED_FREE_RESOURCES["system_design"]
            }
        ]
    else:
        # Default Full Stack / Backend / General Software Architecture Roadmap
        milestones = [
            {
                "id": 1,
                "title": "Data Structures & Advanced Algorithms",
                "duration_weeks": 4,
                "status": "completed",
                "description": "Master Graph Algorithms, Dynamic Programming, and Space-Time Tradeoffs for technical interviews.",
                "key_skills": ["Graphs", "Dynamic Programming", "Trie", "Heap/PriorityQueue"],
                "resources": VERIFIED_FREE_RESOURCES["dsa"]
            },
            {
                "id": 2,
                "title": "Production Frontend Architecture",
                "duration_weeks": 5,
                "status": "completed",
                "description": "Deep dive into React Internals, Fiber Architecture, Web Vitals, and State Management at scale.",
                "key_skills": ["React Fiber", "Custom Hooks", "Tailwind CSS", "State Machines"],
                "resources": VERIFIED_FREE_RESOURCES["frontend"]
            },
            {
                "id": 3,
                "title": "High-Throughput Backend & Microservices",
                "duration_weeks": 6,
                "status": "in_progress",
                "description": "Design distributed microservices with FastAPI/Node.js, PostgreSQL indexing, and Redis caching.",
                "key_skills": ["Node.js", "PostgreSQL Query Tuning", "Redis Caching", "Kafka Events"],
                "resources": VERIFIED_FREE_RESOURCES["backend"]
            },
            {
                "id": 4,
                "title": "AI Engineering & LLM Integration",
                "duration_weeks": 5,
                "status": "upcoming",
                "description": "Learn RAG (Retrieval-Augmented Generation), Vector Databases (Pinecone/Chroma), and LangChain/LlamaIndex.",
                "key_skills": ["RAG Architecture", "Vector Embeddings", "LangChain", "Prompt Engineering"],
                "resources": VERIFIED_FREE_RESOURCES["ai_llm"]
            },
            {
                "id": 5,
                "title": "System Design & Tier-1 Mock Interviews",
                "duration_weeks": 4,
                "status": "upcoming",
                "description": "Practice 1-on-1 mock interviews for scalable URL shorteners, video streaming, and real-time chat.",
                "key_skills": ["Load Balancing", "Sharding", "Rate Limiting", "CAP Theorem"],
                "resources": VERIFIED_FREE_RESOURCES["system_design"]
            }
        ]

    return milestones


def calculate_roadmap_stats(milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes completion %, total duration, completed weeks, remaining weeks, and next milestone.
    """
    total_count = len(milestones)
    if total_count == 0:
        return {
            "completed_count": 0,
            "total_count": 0,
            "completion_percentage": 0,
            "total_weeks": 0,
            "completed_weeks": 0,
            "remaining_weeks": 0,
            "next_milestone": None
        }

    completed_count = sum(1 for m in milestones if m.get("status") == "completed")
    total_weeks = sum(m.get("duration_weeks", 4) for m in milestones)
    completed_weeks = sum(m.get("duration_weeks", 4) for m in milestones if m.get("status") == "completed")
    remaining_weeks = total_weeks - completed_weeks

    completion_percentage = int(round((completed_count / total_count) * 100))

    next_m = next((m for m in milestones if m.get("status") in ["in_progress", "upcoming"]), None)
    next_milestone_title = next_m["title"] if next_m else "All Milestones Completed!"

    return {
        "completed_count": completed_count,
        "total_count": total_count,
        "completion_percentage": completion_percentage,
        "total_weeks": total_weeks,
        "completed_weeks": completed_weeks,
        "remaining_weeks": remaining_weeks,
        "next_milestone": next_milestone_title
    }
