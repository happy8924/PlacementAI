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

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
