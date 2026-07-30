"""
routers/chat.py
----------------
The AI HR chatbot endpoint. The Groq API key lives only in the backend's
environment (app.core.config) — it is never sent to or accepted from the
frontend, unlike the original Streamlit prototype where it was typed into
a sidebar field.
"""

from fastapi import APIRouter, HTTPException, Depends

from app.core.config import get_settings
from app.db.models import ChatRequest, ChatReplyResponse, ChatMessageResponse
from app.db.supabase_client import get_supabase
from app.services.chatbot import ask_chatbot
from app.services.ranking_engine import score_tier
from app.routers.auth import require_role
from app.routers.ats import _owned_job

router = APIRouter(prefix="/jobs/{job_id}/chat", tags=["Chat"])
settings = get_settings()


def _load_ranked_candidates_for_chat(job_id: str) -> list:
    """Rebuilds the ranked-candidate shape ask_chatbot() expects, straight
    from the stored scores (so the chatbot always answers from the last
    ranking that was run, without recomputing it)."""
    supabase = get_supabase()
    candidates_result = (
        supabase.table("candidates").select("*, scores(*)").eq("job_id", job_id).execute()
    )

    ranked = []
    for c in candidates_result.data or []:
        scores_list = c.get("scores") or []
        if not scores_list:
            continue
        s = scores_list[0]
        ranked.append({
            "rank": s.get("rank", 0),
            "name": c.get("name"),
            "overall_score": s.get("overall_score", 0),
            "matched_skills": s.get("matched_skills") or [],
            "missing_skills": s.get("missing_skills") or [],
            "breakdown": {
                "skills": s.get("skills_score", 0),
                "experience": s.get("experience_score", 0),
                "education": s.get("education_score", 0),
                "certifications": s.get("certifications_score", 0),
                "projects": s.get("projects_score", 0),
            },
            "strengths": s.get("strengths") or [],
            "weaknesses": s.get("weaknesses") or [],
        })
    ranked.sort(key=lambda r: (r["rank"] == 0, r["rank"]))
    return ranked


@router.post("", response_model=ChatReplyResponse)
def chat_with_candidates(job_id: str, payload: ChatRequest, user=Depends(require_role('recruiter'))):
    """Ask the AI HR assistant a question about the ranked candidates for this job."""
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is not configured on the server")

    job = _owned_job(job_id, user['id'])
    supabase = get_supabase()

    ranked_candidates = _load_ranked_candidates_for_chat(job_id)
    if not ranked_candidates:
        raise HTTPException(status_code=400, detail="Run /rank for this job before using the chatbot")

    history_result = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("job_id", job_id)
        .order("created_at")
        .execute()
    )
    chat_history = [{"role": m["role"], "content": m["content"]} for m in (history_result.data or [])]

    try:
        reply = ask_chatbot(
            settings.GROQ_API_KEY, payload.message, ranked_candidates,
            job["description"], chat_history,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chatbot request failed: {e}")

    supabase.table("chat_messages").insert({"job_id": job_id, "role": "user", "content": payload.message}).execute()
    supabase.table("chat_messages").insert({"job_id": job_id, "role": "assistant", "content": reply}).execute()

    updated_history = supabase.table("chat_messages").select("*").eq("job_id", job_id).order("created_at").execute()

    return ChatReplyResponse(reply=reply, history=updated_history.data or [])


@router.get("/history", response_model=list[ChatMessageResponse])
def get_chat_history(job_id: str, user=Depends(require_role('recruiter'))):
    """Fetch the full chat history for a job, oldest first."""
    _owned_job(job_id, user['id'])
    
    supabase = get_supabase()
    result = (
        supabase.table("chat_messages")
        .select("role, content, created_at")
        .eq("job_id", job_id)
        .order("created_at")
        .execute()
    )
    return result.data or []
