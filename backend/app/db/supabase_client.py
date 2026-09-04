"""
db/supabase_client.py
----------------------
Thin wrapper around the Supabase Python client. This is the ONLY module
that talks to Supabase directly — routers/services never import the
`supabase` package themselves, they call functions from here. This keeps
all DB/storage access in one place and makes it easy to swap the backing
store later if needed.

Uses the SERVICE ROLE key (server-side only, never sent to the frontend)
so it can bypass Row Level Security when needed for backend-driven writes.
"""

from functools import lru_cache
from supabase import create_client, Client

from app.core.config import get_settings

settings = get_settings()


@lru_cache
def get_supabase() -> Client:
    if settings.is_demo_mode():
        from app.db.demo_supabase import get_demo_supabase
        return get_demo_supabase()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY "
            "in your environment (see .env.example)."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# ---------------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------------
def upload_resume_file(
    job_id: str,
    candidate_id: str,
    file_bytes: bytes,
    file_extension: str = ".pdf",
    content_type: str = "application/pdf"
) -> str:
    """
    Uploads a resume file (PDF, PNG, JPG, JPEG) to the private `resumes` bucket at
    resumes/{job_id}/{candidate_id}{ext} and returns that storage path
    (NOT a public URL — the bucket is private by design).
    """
    client = get_supabase()
    ext = file_extension if file_extension.startswith(".") else f".{file_extension}"
    path = f"{job_id}/{candidate_id}{ext}"
    client.storage.from_(settings.SUPABASE_RESUME_BUCKET).upload(
        path,
        file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return path


def get_resume_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    """Generates a short-lived signed URL so the frontend can view/download
    a specific resume without the bucket ever being public."""
    client = get_supabase()
    result = client.storage.from_(settings.SUPABASE_RESUME_BUCKET).create_signed_url(
        storage_path, expires_in
    )
    return result.get("signedURL") or result.get("signed_url", "")
