import io
import re
import logging
from typing import Dict, List, Tuple, Any
from pypdf import PdfReader

logger = logging.getLogger(__name__)

# Master Technical Skills Dictionary
TECHNICAL_SKILLS_DB = {
    # Languages
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "c": "C",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "php": "PHP",
    "ruby": "Ruby",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",
    "html5": "HTML5",
    "css3": "CSS3",

    # Frontend
    "react": "React.js",
    "react.js": "React.js",
    "reactjs": "React.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "redux": "Redux",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",

    # Backend & Frameworks
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "rest api": "REST API",
    "graphql": "GraphQL",
    "microservices": "Microservices",

    # Databases
    "mongodb": "MongoDB",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "redis": "Redis",
    "firebase": "Firebase",

    # AI / ML / Data Science
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "nlp": "NLP",
    "data science": "Data Science",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",

    # Core & Tools
    "data structures": "Data Structures & Algorithms",
    "dsa": "Data Structures & Algorithms",
    "algorithms": "Data Structures & Algorithms",
    "git": "Git",
    "github": "GitHub",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "linux": "Linux",
    "ci/cd": "CI/CD"
}

# Role Mapping
ROLE_KEYWORD_MAP = {
    "Frontend Developer": ["react", "react.js", "javascript", "typescript", "html", "css", "tailwind", "next.js", "redux"],
    "Backend Developer": ["node.js", "python", "java", "express", "fastapi", "django", "sql", "mongodb", "postgresql", "rest api"],
    "Full Stack Developer": ["react", "node.js", "javascript", "python", "sql", "mongodb", "express", "rest api", "git"],
    "AI / ML Engineer": ["python", "machine learning", "deep learning", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn"],
    "Data Analyst / Data Engineer": ["sql", "python", "pandas", "numpy", "postgresql", "mysql", "data science"],
    "DevOps / Cloud Engineer": ["docker", "kubernetes", "aws", "linux", "git", "ci/cd"],
    "Software Engineer (SDE)": ["data structures", "algorithms", "c++", "java", "python", "git", "sql"]
}

ACTION_VERBS = [
    "developed", "implemented", "engineered", "designed", "built", "created",
    "optimized", "architected", "deployed", "automated", "integrated", "spearheaded",
    "reduced", "increased", "enhanced", "accelerated", "refactored", "managed"
]

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract full raw text from PDF bytes."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text.append(t)
        return "\n".join(extracted_text)
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        raise ValueError("Failed to extract text from PDF resume. Ensure it is a valid PDF document.")

def verify_student_identity(resume_text: str, student_name: str, student_email: str) -> Tuple[bool, str]:
    """
    Cross-checks candidate identity in resume text against student's account.
    Returns (verified: bool, reason: str).
    """
    if not resume_text or len(resume_text.strip()) < 50:
        return False, "Resume content is empty or unreadable text."

    # Look at header text (first 600 characters)
    header_text = resume_text[:600].lower()
    full_text_lower = resume_text.lower()

    # 1. Clean student name tokens
    clean_name = re.sub(r'[^a-zA-Z\s]', '', student_name).strip().lower()
    name_tokens = [token for token in clean_name.split() if len(token) >= 2]

    # Check how many name tokens match in header
    matching_tokens = [token for token in name_tokens if token in header_text or token in full_text_lower]
    
    # 2. Check email if present in resume
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', full_text_lower)
    resume_email = email_match.group(0).strip() if email_match else None

    # Verification Decision
    if len(name_tokens) > 0 and len(matching_tokens) == 0:
        # No name tokens found at all
        return False, f"Verification Failed: Resume candidate name does not match your registered account name ('{student_name}'). Please upload your own resume."

    if resume_email and student_email:
        # If resume has an email, verify it doesn't belong to a totally different email
        if resume_email.lower() != student_email.lower():
            # If name match is weak AND email doesn't match
            if len(matching_tokens) < len(name_tokens):
                return False, f"Verification Failed: Resume email ({resume_email}) does not match your registered email ({student_email})."

    return True, "Identity verified successfully."

def analyze_resume_content(resume_text: str, student_name: str) -> Dict[str, Any]:
    """
    Calculates ATS score (0-100), extracts skills, recommends target roles,
    and returns actionable improvement feedback.
    """
    text_lower = resume_text.lower()
    words = re.findall(r'\w+', text_lower)
    word_count = len(words)

    # 1. Section Header Check (20 points)
    sections = {
        "contact_info": bool(re.search(r'(email|phone|contact|linkedin|github)', text_lower)),
        "education": bool(re.search(r'(education|academic|degree|university|college|b\.tech|bca|mca|b\.e)', text_lower)),
        "experience_projects": bool(re.search(r'(experience|project|projects|work|internship)', text_lower)),
        "skills": bool(re.search(r'(skill|skills|technical skills|technologies|tools)', text_lower)),
    }
    section_score = sum(5 for present in sections.values() if present)

    # 2. Tech Skills Extraction (35 points)
    detected_skills = []
    seen_skills = set()
    for kw_key, kw_label in TECHNICAL_SKILLS_DB.items():
        if re.search(r'\b' + re.escape(kw_key) + r'\b', text_lower):
            if kw_label not in seen_skills:
                seen_skills.add(kw_label)
                detected_skills.append(kw_label)

    skill_count = len(detected_skills)
    skill_score = min(35, skill_count * 4)

    # 3. Target Tech Roles Recommendation
    role_scores = {}
    for role_name, keywords in ROLE_KEYWORD_MAP.items():
        match_count = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
        if match_count > 0:
            role_scores[role_name] = match_count

    # Sort top recommended roles
    recommended_roles = [r[0] for r in sorted(role_scores.items(), key=lambda x: x[1], reverse=True)[:4]]
    if not recommended_roles:
        recommended_roles = ["Software Engineer (SDE)", "Full Stack Developer"]

    # 4. Impact & Action Verbs (25 points)
    matched_action_verbs = [verb for verb in ACTION_VERBS if re.search(r'\b' + verb + r'\b', text_lower)]
    verb_score = min(25, len(matched_action_verbs) * 5)

    # 5. Metrics & Quantifiable Achievements (20 points)
    # Look for percentages, numbers, currency, multipliers (e.g. 50%, $10k, 2.5x, 100+ users)
    metrics = re.findall(r'(\d+%\s*|\$\d+|\b\d+\+\s*|\b\d+x\b)', text_lower)
    metrics_score = min(20, len(metrics) * 5)

    # Final ATS Score (0 - 100)
    total_ats_score = min(100, section_score + skill_score + verb_score + metrics_score)

    # Generate Strengths & Feedback
    strengths = []
    if section_score >= 15:
        strengths.append("Well-structured layout with essential standard resume sections.")
    if skill_count >= 5:
        strengths.append(f"Strong technical skill density ({skill_count} relevant technologies detected).")
    if len(matched_action_verbs) >= 3:
        strengths.append("Good usage of strong engineering action verbs.")
    if len(metrics) >= 2:
        strengths.append("Includes quantifiable impact metrics (e.g., percentages, project counts).")

    improvements = []
    missing_keywords = []
    
    if not sections["skills"]:
        improvements.append("Add a clear 'Technical Skills' section heading for ATS parsers.")
    if skill_count < 5:
        improvements.append("Include more industry-standard technical skills relevant to your target roles.")
        missing_keywords.extend(["Python", "SQL", "React.js", "Git", "Docker"])
    if len(matched_action_verbs) < 3:
        improvements.append("Use more strong action verbs like 'Engineered', 'Optimized', 'Architected' in your bullet points.")
    if len(metrics) < 2:
        improvements.append("Add measurable outcomes (e.g., 'Improved performance by 30%', 'Served 500+ users').")
    if word_count < 150:
        improvements.append("Resume content appears too short. Expand on key technical projects and responsibilities.")

    return {
        "ats_score": round(total_ats_score, 1),
        "verified": True,
        "score_breakdown": {
            "section_structure": section_score,
            "skill_density": skill_score,
            "action_verbs": verb_score,
            "impact_metrics": metrics_score
        },
        "detected_skills": detected_skills,
        "recommended_roles": recommended_roles,
        "word_count": word_count,
        "strengths": strengths,
        "improvements": improvements,
        "missing_keywords": list(set(missing_keywords))[:5]
    }
