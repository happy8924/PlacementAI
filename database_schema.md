# PlacementAI Database Schema Specification

This document contains the canonical schema and index definitions for the **14 MongoDB collections** in the **PlacementAI** platform.

---

## Collections & Field Specifications

### 1. `users`
- `_id`: ObjectId
- `name`: string
- `email`: string (unique)
- `password_hash`: string
- `role`: string (`student` | `recruiter` | `tpo` | `admin`)
- `is_approved`: boolean
- `is_active`: boolean
- `created_at`: datetime
- `updated_at`: datetime
- **Indexes**: `email` (unique), `role`

---

### 2. `student_profiles`
- `_id`: ObjectId
- `user_id`: ObjectId (unique ref `users`)
- `full_name`: string
- `phone`: string
- `college`: string
- `degree`: string
- `branch`: string
- `graduation_year`: integer
- `cgpa`: float
- `skills`: list[string]
- `links`: object `{ github: string, linkedin: string }`
- `resume_id`: ObjectId (ref `resumes`)
- `placement_status`: string
- `interview_readiness_score`: float
- `profile_completion`: float
- `profile_completed`: boolean
- `created_at`: datetime
- `updated_at`: datetime
- **Indexes**: `user_id` (unique), `branch`

---

### 3. `companies`
- `_id`: ObjectId
- `name`: string (unique)
- `description`: string
- `website`: string
- `industry`: string
- `location`: string
- `recruiter_id`: ObjectId (ref `users`)
- `verification_status`: string (`pending` | `verified` | `rejected`)
- `created_at`: datetime
- `updated_at`: datetime
- **Indexes**: `name` (unique), `recruiter_id`

---

### 4. `jobs`
- `_id`: ObjectId
- `company_id`: ObjectId (ref `companies`)
- `recruiter_id`: ObjectId (ref `users`)
- `title`: string
- `description`: string
- `skills_required`: list[string]
- `package_lpa`: float
- `location`: string
- `eligibility`: object `{ min_cgpa: float, allowed_branches: list[string] }`
- `status`: string (`active` | `closed` | `draft`)
- `application_deadline`: datetime
- `created_at`: datetime
- `updated_at`: datetime
- **Indexes**: `company_id`, `recruiter_id`, `status`

---

### 5. `applications`
- `_id`: ObjectId
- `job_id`: ObjectId (ref `jobs`)
- `student_id`: ObjectId (ref `users` / `student_profiles`)
- `resume_id`: ObjectId (ref `resumes`)
- `resume_match_score`: float
- `match_details`: object `{ matched_skills: list[string], missing_skills: list[string] }`
- `status`: string (`applied` | `shortlisted` | `rejected` | `selected`)
- `applied_at`: datetime
- `updated_at`: datetime
- **Indexes**: compound `(job_id, student_id)` (unique), `student_id`, `status`

---

### 6. `resumes`
- `_id`: ObjectId
- `user_id`: ObjectId (ref `users`)
- `file_url`: string (Cloudinary URL - **No binary stored in MongoDB**)
- `cloudinary_public_id`: string
- `file_name`: string
- `file_type`: string
- `file_size`: integer
- `extracted_data`: object
- `ats_score`: float
- `skills_detected`: list[string]
- `missing_skills`: list[string]
- `strengths`: list[string]
- `weaknesses`: list[string]
- `feedback`: string
- `suitable_roles`: list[string]
- `primary_role`: string
- `analysis_status`: string (`pending` | `in_progress` | `completed` | `failed`)
- `is_active`: boolean (Only one active resume per student)
- `uploaded_at`: datetime
- `updated_at`: datetime
- **Indexes**: `user_id`, compound `(user_id, is_active)`

---

### 7. `ai_analysis`
- `_id`: ObjectId
- `resume_id`: ObjectId (ref `resumes`)
- `user_id`: ObjectId (ref `users`)
- `ats_score`: float
- `skills_detected`: list[string]
- `missing_skills`: list[string]
- `strengths`: list[string]
- `weaknesses`: list[string]
- `recommended_skills`: list[string]
- `recommended_roles`: list[string]
- `primary_role`: string
- `match_score`: float
- `generated_at`: datetime
- **Indexes**: `resume_id`, `user_id`

---

### 8. `learning_roadmaps`
- `_id`: ObjectId
- `user_id`: ObjectId (ref `users`)
- `resume_id`: ObjectId (ref `resumes`)
- `ai_analysis_id`: ObjectId (ref `ai_analysis`)
- `target_role`: string
- `skill_gaps`: list[string]
- `roadmap`: list of objects `{ step_number, skill_name, topics_to_cover[], recommended_resources[], completed, completed_at }`
- `overall_progress`: float
- `generated_at`: datetime
- `updated_at`: datetime
- **Indexes**: `user_id`, `resume_id`

---

### 9. `interviews`
- `_id`: ObjectId
- `user_id`: ObjectId (ref `users`)
- `job_role`: string
- `difficulty`: string (`easy` | `medium` | `hard`)
- `transcript`: list of objects `{ speaker, message, timestamp }`
- `grading`: object
- `is_completed`: boolean
- `created_at`: datetime
- `completed_at`: datetime
- **Indexes**: `user_id`, `is_completed`

---

### 10. `placement_rounds`
- `_id`: ObjectId
- `application_id`: ObjectId (ref `applications`)
- `round_type`: string
- `scheduled_at`: datetime
- `result`: string (`pending` | `pass` | `fail` | `skipped`)
- `notes`: string
- **Indexes**: `application_id`

---

### 11. `placement_stats`
- `_id`: ObjectId
- `total_students`: integer
- `total_companies`: integer
- `total_jobs`: integer
- `placements`: integer
- `average_salary`: float
- `last_updated`: datetime
- **Indexes**: None

---

### 12. `activity_logs`
- `_id`: ObjectId
- `user_id`: ObjectId (ref `users`)
- `action`: string
- `details`: object
- `timestamp`: datetime
- **Indexes**: `user_id`, `timestamp`

---

### 13. `otp_codes`
- `_id`: ObjectId
- `email`: string
- `otp`: string
- `created_at`: datetime
- `expires_at`: datetime
- **Indexes**: `email`, TTL index on `expires_at` (`expireAfterSeconds=0`)

---

### 14. `password_reset_tokens`
- `_id`: ObjectId
- `email`: string
- `token`: string
- `created_at`: datetime
- `expires_at`: datetime
- **Indexes**: `email`, TTL index on `expires_at` (`expireAfterSeconds=0`)
