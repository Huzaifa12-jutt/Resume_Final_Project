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
from app.db.supabase_client import get_supabase, upload_resume_file, get_resume_signed_url
from app.services.resume_parser import parse_resume
from app.services.file_validator import validate_resume_file
from app.services.cv_generator import SAMPLE_CV_GENERATORS
from app.routers.auth import require_role
from app.routers.ats import _owned_job

router = APIRouter(prefix="/jobs/{job_id}/candidates", tags=["Candidates"])
settings = get_settings()


def _store_candidate(
    job_id: str,
    filename: str,
    file_bytes: bytes,
    file_extension: str = ".pdf",
    content_type: str = "application/pdf"
) -> dict:
    """Parses one resume (PDF, PNG, JPG, JPEG), uploads it to Storage, and inserts the row."""
    try:
        parsed = parse_resume(io.BytesIO(file_bytes), filename, content_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse '{filename}': {e}")

    candidate_id = str(uuid.uuid4())

    try:
        try:
            storage_path = upload_resume_file(
                job_id,
                candidate_id,
                file_bytes,
                file_extension=file_extension,
                content_type=content_type,
            )
        except TypeError:
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
    """Upload one or more PDF/image resumes for a job. Each is validated, parsed and stored."""
    _owned_job(job_id, user['id'])

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    created = []
    for f in files:
        content = await f.read()
        detected_type, ext = validate_resume_file(f.filename, content, f.content_type or "")
        
        # Determine appropriate MIME type for storage
        mime = f.content_type or (
            "application/pdf" if ext == ".pdf"
            else "image/png" if ext == ".png"
            else "image/jpeg"
        )
        
        created.append(_store_candidate(
            job_id=job_id,
            filename=f.filename,
            file_bytes=content,
            file_extension=ext,
            content_type=mime
        ))

    return created


@router.post("/sample", response_model=list[CandidateResponse], status_code=201)
def generate_sample_candidates(job_id: str, user=Depends(require_role('recruiter'))):
    """Generates the two built-in sample resumes (AI/ML + Full-Stack) and stores them."""
    _owned_job(job_id, user['id'])

    created = []
    for label, generator_fn in SAMPLE_CV_GENERATORS.items():
        filename = label.split(" - ")[0].replace(" ", "_") + ".pdf"
        pdf_bytes = generator_fn()
        created.append(_store_candidate(job_id, filename, pdf_bytes, file_extension=".pdf", content_type="application/pdf"))
    return created


@router.get("/{candidate_id}/resume-url")
def get_candidate_resume_url(job_id: str, candidate_id: str, user=Depends(require_role('recruiter'))):
    """Generates a signed URL for a recruiter to view or download a candidate's resume."""
    _owned_job(job_id, user['id'])
    
    supabase = get_supabase()
    result = (
        supabase.table("candidates")
        .select("resume_file_path, filename")
        .eq("job_id", job_id)
        .eq("id", candidate_id)
        .execute()
    )
    if not result.data or not result.data[0].get("resume_file_path"):
        raise HTTPException(status_code=404, detail="Candidate resume not found")
    
    storage_path = result.data[0]["resume_file_path"]
    signed_url = get_resume_signed_url(storage_path)
    return {
        "url": signed_url,
        "filename": result.data[0].get("filename") or "resume",
        "resume_file_path": storage_path,
    }


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
