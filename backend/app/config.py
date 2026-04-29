# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import list


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Career Copilot"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str                   # postgresql+asyncpg://user:pass@host/db
    DATABASE_URL_SYNC: str              # postgresql://user:pass@host/db (for Alembic)

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # S3 / MinIO
    S3_BUCKET: str = "career-copilot-cvs"
    S3_REGION: str = "eu-west-2"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_ENDPOINT_URL: str = ""          # set for MinIO local dev

    # GitHub OAuth
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_REDIRECT_URI: str

    # OpenAI / Anthropic
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Adzuna Jobs API
    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""

    # SendGrid
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@career-copilot.com"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://your-domain.com"]

    # Sentry
    SENTRY_DSN: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()