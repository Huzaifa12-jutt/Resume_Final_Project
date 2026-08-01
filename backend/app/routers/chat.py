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
    
    # Get candidates from job
    candidates_result = (
        supabase.table("candidates").select("*, scores(*)").eq("job_id", job_id).execute()
    )
    
    # Also get Gmail candidates (source='gmail')
    gmail_result = (
        supabase.table("candidates").select("*, scores(*)").eq("source", "gmail").execute()
    )
    
    # Combine both
    all_candidates = (candidates_result.data or []) + (gmail_result.data or [])

    ranked = []
    for c in all_candidates:
        scores_list = c.get("scores") or []
        if not scores_list:
            # If no score, create a default score
            s = {"overall_score": 0, "rank": 999, "matched_skills": [], "missing_skills": [], 
                 "skills_score": 0, "experience_score": 0, "education_score": 0, 
                 "certifications_score": 0, "projects_score": 0,
                 "strengths": [], "weaknesses": []}
        else:
            s = scores_list[0]
        
        ranked.append({
            "rank": s.get("rank", 0),
            "name": c.get("name") or "Unknown Candidate",
            "email": c.get("email") or "",
            "phone": c.get("phone") or "",
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
            "skills": c.get("skills") or [],
            "education": c.get("education") or "",
            "experience": c.get("experience") or "",
            "certifications": c.get("certifications") or "",
            "projects": c.get("projects") or "",
            "source": c.get("source", "manual")
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
        raise HTTPException(status_code=400, detail="No candidates found for this job. Upload resumes first.")

    # Save user message
    supabase.table("chat_messages").insert({
        "job_id": job_id, 
        "role": "user", 
        "content": payload.message
    }).execute()

    # Get chat history for context
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
            settings.GROQ_API_KEY, 
            payload.message, 
            ranked_candidates,
            job["description"], 
            chat_history,
        )
    except Exception as e:
        print(f"🔴 Chatbot error: {e}")
        raise HTTPException(status_code=502, detail=f"Chatbot request failed: {e}")

    # Save assistant response
    supabase.table("chat_messages").insert({
        "job_id": job_id, 
        "role": "assistant", 
        "content": reply
    }).execute()

    # Get updated history
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