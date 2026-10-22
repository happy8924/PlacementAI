import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Database
from app.api.v1.auth import router as auth_router
from app.api.v1.student import router as student_router
from app.api.v1.admin import router as admin_router
from app.api.v1.resume import router as resume_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.roadmap import router as roadmap_router
from app.api.v1.recruiter import router as recruiter_router
from app.api.v1.tpo import router as tpo_router

# Setup basic logging config
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI to connect/close database."""
    logger.info("Initializing PlacementAI Backend Service...")
    Database.connect_db()
    yield
    logger.info("Shutting down PlacementAI Backend Service...")
    Database.close_db()

app = FastAPI(
    title="PlacementAI API",
    description="Backend Career Readiness & Placement Intelligence API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middlewares configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin Module"])
app.include_router(student_router, prefix="/api/v1/student", tags=["Student Module"])
app.include_router(recruiter_router, prefix="/api/v1/recruiter", tags=["Recruiter Module"])
app.include_router(resume_router, prefix="/api/v1/resume", tags=["Resume Intelligence"])
app.include_router(jobs_router, prefix="/api/v1/jobs", tags=["Job Vacancies"])
app.include_router(roadmap_router, prefix="/api/v1/roadmap", tags=["Career Roadmap Engine"])
app.include_router(tpo_router, prefix="/api/v1/tpo", tags=["TPO Module"])

@app.get("/")
def read_root():
    return {
        "success": True,
        "service": "PlacementAI Core API",
        "status": "online"
    }


