"""
routers/candidates.py
----------------------
Endpoints for uploading resumes (real or sample-generated), parsing them
with resume_parser.py, storing the PDF in Supabase Storage, and writing
the structured result to the `candidates` table.
"""

import io
import uuid

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends

from app.core.config import get_settings
from app.db.models import CandidateResponse
from app.db.supabase_client import get_supabase, upload_resume_file
from app.services.resume_parser import parse_resume
from app.services.cv_generator import SAMPLE_CV_GENERATORS
from app.routers.auth import require_role
from app.routers.ats import _owned_job

router = APIRouter(prefix="/jobs/{job_id}/candidates", tags=["Candidates"])
settings = get_settings()


def _store_candidate(job_id: str, filename: str, file_bytes: bytes) -> dict:
    """Parses one resume PDF, uploads it to Storage, and inserts the row."""
    try:
        parsed = parse_resume(io.BytesIO(file_bytes), filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse '{filename}': {e}")

    candidate_id = str(uuid.uuid4())

    try:
        storage_path = upload_resume_file(job_id, candidate_id, file_bytes)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Storage upload failed for '{filename}': {e}")

    supabase = get_supabase()
    row = {
        "id": candidate_id,
        "job_id": job_id,
        "filename": parsed["filename"],
        "name": parsed["name"],
        "email": parsed["email"],
        "phone": parsed["phone"],
        "skills": parsed["skills"],
        "education": parsed["education"],
        "experience": parsed["experience"],
        "certifications": parsed["certifications"],
        "projects": parsed["projects"],
        "raw_text": parsed["raw_text"],
        "resume_file_path": storage_path,
    }
    result = supabase.table("candidates").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail=f"Failed to save candidate '{filename}'")
    return result.data[0]


@router.post("", response_model=list[CandidateResponse], status_code=201)
async def upload_candidates(job_id: str, files: list[UploadFile] = File(...), user=Depends(require_role('recruiter'))):
    """Upload one or more PDF resumes for a job. Each is parsed and stored."""
    _owned_job(job_id, user['id'])

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    created = []
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=415, detail=f"'{f.filename}' is not a PDF")
        content = await f.read()
        if len(content) > max_bytes:
            raise HTTPException(status_code=413, detail=f"'{f.filename}' exceeds {settings.MAX_UPLOAD_MB}MB limit")
        created.append(_store_candidate(job_id, f.filename, content))

    return created


@router.post("/sample", response_model=list[CandidateResponse], status_code=201)
def generate_sample_candidates(job_id: str, user=Depends(require_role('recruiter'))):
    """Generates the two built-in sample resumes (AI/ML + Full-Stack) and stores them."""
    _owned_job(job_id, user['id'])

    created = []
    for label, generator_fn in SAMPLE_CV_GENERATORS.items():
        filename = label.split(" - ")[0].replace(" ", "_") + ".pdf"
        pdf_bytes = generator_fn()
        created.append(_store_candidate(job_id, filename, pdf_bytes))
    return created


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(job_id: str, candidate_id: str, user=Depends(require_role('recruiter'))):
    """Fetch the full structured profile of a single candidate."""
    _owned_job(job_id, user['id'])
    
    supabase = get_supabase()
    result = (
        supabase.table("candidates")
        .select("*")
        .eq("job_id", job_id)
        .eq("id", candidate_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return result.data[0]


@router.delete("/{candidate_id}", status_code=204)
def delete_candidate(job_id: str, candidate_id: str, user=Depends(require_role('recruiter'))):
    """Remove a candidate (and their score, via cascade) from a job."""
    _owned_job(job_id, user['id'])
    
    supabase = get_supabase()
    existing = (
        supabase.table("candidates").select("id").eq("job_id", job_id).eq("id", candidate_id).execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    supabase.table("candidates").delete().eq("id", candidate_id).execute()
