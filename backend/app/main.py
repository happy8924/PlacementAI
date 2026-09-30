import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Database
from app.api.v1.auth import router as auth_router
from app.api.v1.student import router as student_router
from app.api.v1.admin import router as admin_router

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
app.include_router(student_router, prefix="/api/v1/student", tags=["Student Module"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin Module"])

@app.get("/")
def read_root():
    return {
        "success": True,
        "service": "PlacementAI Core API",
        "status": "online"
    }
