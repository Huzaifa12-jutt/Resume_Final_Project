"""
routers/interview.py
--------------------
AI-powered interview simulator endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.db.models import (
    InterviewGenerateRequest,
    InterviewGenerateResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewEvaluateResponse,
    InterviewHistoryItem,
    InterviewDetailResponse
)
from app.db.supabase_client import get_supabase
from app.services.interview_service import (
    create_interview,
    submit_answer,
    evaluate_interview,
    get_interview_history,
    get_interview_details
)
from app.routers.auth import require_role, current_user

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/generate", response_model=InterviewGenerateResponse)
def generate_interview(
    payload: InterviewGenerateRequest,
    user=Depends(require_role('candidate'))
):
    """Generate a new interview with AI questions based on resume."""
    try:
        interview_id = create_interview(
            candidate_id=user['id'],
            resume_text=payload.resume_text,
            job_id=payload.job_id
        )
        
        # Get questions for the interview
        supabase = get_supabase()
        questions_result = supabase.table('interview_questions').select('*').eq('interview_id', interview_id).order('order_num').execute()
        
        questions = []
        for q in questions_result.data:
            questions.append({
                'id': q['id'],
                'question': q['question'],
                'category': q['category'],
                'difficulty': q['difficulty']
            })
        
        return InterviewGenerateResponse(
            interview_id=interview_id,
            questions=questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/answer", response_model=InterviewAnswerResponse)
def submit_interview_answer(
    payload: InterviewAnswerRequest,
    user=Depends(require_role('candidate'))
):
    """Submit an answer for an interview question."""
    try:
        # Verify the interview belongs to the user
        supabase = get_supabase()
        interview_result = supabase.table('interviews').select('*').eq('id', payload.interview_id).execute()
        if not interview_result.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview_result.data[0]['candidate_id'] != user['id']:
            raise HTTPException(status_code=403, detail="You don't have permission for this interview")
        
        result = submit_answer(
            interview_id=payload.interview_id,
            question_id=payload.question_id,
            answer=payload.answer
        )
        
        return InterviewAnswerResponse(
            success=result['success'],
            next_question=result['next_question']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate", response_model=InterviewEvaluateResponse)
def evaluate_interview_results(
    interview_id: str,
    user=Depends(require_role('candidate'))
):
    """Evaluate the complete interview and generate results."""
    try:
        # Verify the interview belongs to the user
        supabase = get_supabase()
        interview_result = supabase.table('interviews').select('*').eq('id', interview_id).execute()
        if not interview_result.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview_result.data[0]['candidate_id'] != user['id']:
            raise HTTPException(status_code=403, detail="You don't have permission for this interview")
        
        result = evaluate_interview(interview_id)
        
        return InterviewEvaluateResponse(
            score=result['score'],
            total_questions=result['total_questions'],
            correct=result['correct'],
            incorrect=result['incorrect'],
            strengths=result['strengths'],
            weaknesses=result['weaknesses'],
            feedback=result['feedback'],
            rating=result['rating'],
            detailed_results=result['detailed_results']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=list[InterviewHistoryItem])
def get_candidate_interview_history(user=Depends(require_role('candidate'))):
    """Get interview history for the current candidate."""
    try:
        history = get_interview_history(user['id'])
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{interview_id}", response_model=InterviewDetailResponse)
def get_interview_by_id(
    interview_id: str,
    user=Depends(require_role('candidate'))
):
    """Get detailed information about an interview."""
    try:
        # Verify the interview belongs to the user
        supabase = get_supabase()
        interview_result = supabase.table('interviews').select('*').eq('id', interview_id).execute()
        if not interview_result.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview_result.data[0]['candidate_id'] != user['id']:
            raise HTTPException(status_code=403, detail="You don't have permission for this interview")
        
        details = get_interview_details(interview_id)
        
        return InterviewDetailResponse(
            interview_id=details['interview_id'],
            candidate_id=details['candidate_id'],
            job_id=details['job_id'],
            status=details['status'],
            score=details['score'],
            rating=details['rating'],
            feedback=details['feedback'],
            strengths=details['strengths'],
            weaknesses=details['weaknesses'],
            created_at=details['created_at'],
            completed_at=details['completed_at'],
            questions=details['questions'],
            answers=details['answers']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
