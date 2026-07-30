"""
routers/rankings.py
--------------------
Runs the actual scoring pipeline (ranking_engine.rank_candidates) against
every candidate stored for a job, persists the results to the `scores`
table, and offers a CSV export of the same data.
"""

import csv
import io

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from app.db.models import JobWithResultsResponse, RankedCandidateResponse, ScoreBreakdown
from app.db.supabase_client import get_supabase
from app.services.ranking_engine import rank_candidates, score_tier
from app.routers.auth import require_role
from app.routers.ats import _owned_job

router = APIRouter(prefix="/jobs/{job_id}", tags=["Rankings"])


def _load_job_and_candidates(job_id: str, user_id: str):
    job = _owned_job(job_id, user_id)
    
    supabase = get_supabase()
    candidates_result = supabase.table("candidates").select("*").eq("job_id", job_id).execute()
    candidates = candidates_result.data or []
    if not candidates:
        raise HTTPException(status_code=400, detail="This job has no candidates yet — upload resumes first")

    return job, candidates


@router.post("/rank", response_model=JobWithResultsResponse)
def run_ranking(job_id: str, user=Depends(require_role('recruiter'))):
    """
    Scores and ranks every candidate currently stored for this job against
    its job description, using the same TF-IDF + weighted scoring pipeline
    as the rest of the system. Overwrites any previous scores for this job.
    """
    job, candidates = _load_job_and_candidates(job_id, user['id'])
    supabase = get_supabase()

    # ranking_engine expects dicts shaped like resume_parser's output
    pipeline_input = [{
        "name": c.get("name"),
        "filename": c.get("filename"),
        "email": c.get("email"),
        "phone": c.get("phone"),
        "skills": c.get("skills") or [],
        "education": c.get("education") or "",
        "experience": c.get("experience") or "",
        "certifications": c.get("certifications") or "",
        "projects": c.get("projects") or "",
        "raw_text": c.get("raw_text") or "",
        "_id": c["id"],  # carried through, not used by the scoring logic itself
    } for c in candidates]

    # rank_candidates doesn't know about `_id`, so track it via list position/name+filename
    results = rank_candidates(pipeline_input, job["description"])

    # Match results back to candidate rows (name+filename is a safe-enough key
    # since both come from the same parsed record)
    id_lookup = {(c["name"], c["filename"]): c["_id"] for c in pipeline_input}

    ranked_response = []
    for r in results:
        candidate_id = id_lookup.get((r["name"], r["filename"]))
        if not candidate_id:
            continue

        score_row = {
            "candidate_id": candidate_id,
            "overall_score": r["overall_score"],
            "skills_score": r["breakdown"]["skills"],
            "experience_score": r["breakdown"]["experience"],
            "education_score": r["breakdown"]["education"],
            "certifications_score": r["breakdown"]["certifications"],
            "projects_score": r["breakdown"]["projects"],
            "matched_skills": r["matched_skills"],
            "missing_skills": r["missing_skills"],
            "strengths": r["strengths"],
            "weaknesses": r["weaknesses"],
            "rank": r["rank"],
        }
        # One score row per candidate: delete any previous one, then insert fresh
        supabase.table("scores").delete().eq("candidate_id", candidate_id).execute()
        supabase.table("scores").insert(score_row).execute()

        ranked_response.append(RankedCandidateResponse(
            candidate_id=candidate_id,
            filename=r["filename"],
            name=r["name"],
            email=r["email"],
            phone=r["phone"],
            overall_score=r["overall_score"],
            breakdown=ScoreBreakdown(**r["breakdown"]),
            matched_skills=r["matched_skills"],
            missing_skills=r["missing_skills"],
            strengths=r["strengths"],
            weaknesses=r["weaknesses"],
            rank=r["rank"],
            tier=score_tier(r["overall_score"]),
        ))

    return JobWithResultsResponse(job=job, candidates=ranked_response)


@router.get("/export")
def export_rankings_csv(job_id: str, user=Depends(require_role('recruiter'))):
    """Downloads the current rankings for a job as a CSV file."""
    _owned_job(job_id, user['id'])
    
    supabase = get_supabase()
    candidates_result = (
        supabase.table("candidates").select("*, scores(*)").eq("job_id", job_id).execute()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Rank", "Candidate", "Overall", "Skills", "Experience", "Education", "Certifications", "Projects"])

    rows = []
    for c in candidates_result.data or []:
        scores_list = c.get("scores") or []
        s = scores_list[0] if scores_list else {}
        rows.append((
            s.get("rank", 0) or 0, c.get("name", ""), s.get("overall_score", 0) or 0,
            s.get("skills_score", 0) or 0, s.get("experience_score", 0) or 0,
            s.get("education_score", 0) or 0, s.get("certifications_score", 0) or 0,
            s.get("projects_score", 0) or 0,
        ))
    rows.sort(key=lambda r: (r[0] == 0, r[0]))
    for row in rows:
        writer.writerow(row)

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=rankings_{job_id}.csv"},
    )
