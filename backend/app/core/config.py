from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend directory

class Settings(BaseSettings):
    # MongoDB Config
    MONGODB_URI: str = Field(default="mongodb://localhost:27017")
    MONGODB_DATABASE: str = Field(default="placement_ai")

    # JWT Config
    JWT_SECRET_KEY: str = Field(default="9476839af7d3b5bc1a52e987c126dcf9f5e27a69b76c8c18730999af1d3b76e1")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # SMTP Config
    SMTP_HOST: str = Field(default="")
    SMTP_PORT: int = Field(default=587)
    SMTP_USERNAME: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_FROM_EMAIL: str = Field(default="")

    # Frontend URL
    FRONTEND_URL: str = Field(default="http://localhost:3000")

    # OTP Config
    OTP_EXPIRY_MINUTES: int = Field(default=10)

    # n8n Email Automation Webhook Config
    N8N_WEBHOOK_URL: str = Field(default="")
    N8N_TIMEOUT_SECONDS: int = Field(default=30)

    # Rate Limiting Config
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_DEFAULT_LIMIT: int = Field(default=100)
    RATE_LIMIT_DEFAULT_WINDOW: int = Field(default=60)
    RATE_LIMIT_UNAUTH_LIMIT: int = Field(default=30)
    RATE_LIMIT_UNAUTH_WINDOW: int = Field(default=60)

    # Endpoint Specific Protection Limits
    RATE_LIMIT_LOGIN_LIMIT: int = Field(default=5)
    RATE_LIMIT_LOGIN_WINDOW: int = Field(default=60)

    RATE_LIMIT_REGISTER_LIMIT: int = Field(default=10)
    RATE_LIMIT_REGISTER_WINDOW: int = Field(default=60)

    RATE_LIMIT_OTP_GEN_LIMIT: int = Field(default=3)
    RATE_LIMIT_OTP_GEN_WINDOW: int = Field(default=60)

    RATE_LIMIT_OTP_VERIFY_LIMIT: int = Field(default=5)
    RATE_LIMIT_OTP_VERIFY_WINDOW: int = Field(default=60)

    RATE_LIMIT_FORGOT_PASSWORD_LIMIT: int = Field(default=3)
    RATE_LIMIT_FORGOT_PASSWORD_WINDOW: int = Field(default=60)

    RATE_LIMIT_RESET_PASSWORD_LIMIT: int = Field(default=5)
    RATE_LIMIT_RESET_PASSWORD_WINDOW: int = Field(default=60)

    RATE_LIMIT_RESUME_UPLOAD_LIMIT: int = Field(default=10)
    RATE_LIMIT_RESUME_UPLOAD_WINDOW: int = Field(default=60)

    RATE_LIMIT_AI_ANALYSIS_LIMIT: int = Field(default=5)
    RATE_LIMIT_AI_ANALYSIS_WINDOW: int = Field(default=60)

    RATE_LIMIT_AI_MOCK_INTERVIEW_LIMIT: int = Field(default=5)
    RATE_LIMIT_AI_MOCK_INTERVIEW_WINDOW: int = Field(default=60)

    # Trusted reverse proxies for client IP extraction
    RATE_LIMIT_TRUSTED_PROXIES: str = Field(default="127.0.0.1,::1")
    REDIS_URL: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
