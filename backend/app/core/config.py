"""
core/config.py
---------------
Centralised application settings, loaded from environment variables (and a
local .env file in development via python-dotenv). Nothing sensitive is
ever hardcoded — Supabase and Groq credentials only ever live in the
environment / hosting platform's secret manager.
"""

import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()  # no-op in production if there's no .env file present


class Settings:
    # Supabase
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY", "")
    SUPABASE_RESUME_BUCKET: str = os.environ.get("SUPABASE_RESUME_BUCKET", "resumes")

    # Groq
    GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "")

    # CORS - comma-separated list of allowed frontend origins
    ALLOWED_ORIGINS: list = [
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5175").split(",")
        if origin.strip()
    ]

    # App
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")
    MAX_UPLOAD_MB: int = int(os.environ.get("MAX_UPLOAD_MB", "10"))
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    JWT_SECRET: str = os.environ.get("JWT_SECRET") or (
        "local-demo-jwt-secret-change-me-for-preview" if os.environ.get("ENVIRONMENT", "development").lower() == "development" and not os.environ.get("SUPABASE_URL") else ""
    )
    JWT_EXPIRES_MINUTES: int = int(os.environ.get("JWT_EXPIRES_MINUTES", "60"))

    def is_demo_mode(self) -> bool:
        """Local preview mode: a demo backend should run without live Supabase or API keys."""
        return (
            not self.SUPABASE_URL and
            not self.SUPABASE_SERVICE_KEY and
            self.ENVIRONMENT.lower() == "development"
        )

    def has_groq_config(self) -> bool:
        if self.is_demo_mode():
            return False
        return bool(
            self.GROQ_API_KEY and
            self.GROQ_API_KEY.strip() and
            self.GROQ_API_KEY not in {"gsk_your_groq_api_key", "", "demo", "fake-key-for-testing"}
        )

    def validate(self) -> list:
        """Returns a list of missing/misconfigured settings (does not raise —
        the app should still boot so /health can report what's wrong)."""
        problems = []
        if self.is_demo_mode():
            return problems
        if not self.SUPABASE_URL:
            problems.append("SUPABASE_URL is not set")
        if not self.SUPABASE_SERVICE_KEY:
            problems.append("SUPABASE_SERVICE_KEY is not set")
        if not self.GROQ_API_KEY:
            problems.append("GROQ_API_KEY is not set (chat endpoint will fail)")
        if not self.JWT_SECRET:
            problems.append("JWT_SECRET is not set (authenticated endpoints will fail)")
        return problems


@lru_cache
def get_settings() -> Settings:
    return Settings()
