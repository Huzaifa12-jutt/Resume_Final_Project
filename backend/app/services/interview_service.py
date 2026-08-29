"""
interview_service.py
-------------------
AI-powered interview simulator service.
Handles question generation, answer evaluation, and interview management.
"""

try:
    from groq import Groq
except Exception:  # pragma: no cover
    Groq = None

from app.core.config import get_settings
from app.db.supabase_client import get_supabase
import json

settings = get_settings()


def _generate_demo_questions(resume_text: str, job_description: str = "") -> list:
    lower_resume = (resume_text or "").lower()
    base = [
        {
            "question": "Walk me through a project or experience that best demonstrates your ability to deliver a polished product experience.",
            "category": "Experience",
            "difficulty": "Medium",
            "model_answer": "Explain the challenge, the user impact, and the concrete decisions you made. Include outcome metrics, collaboration, and how you iterated based on feedback."
        },
        {
            "question": "How do you balance product goals with technical feasibility when shipping a feature?",
            "category": "Behavioral",
            "difficulty": "Medium",
            "model_answer": "Describe how you align on user value, define trade-offs, and validate feasibility with engineering constraints before moving into delivery."
        },
    ]

    if any(token in lower_resume for token in ["react", "typescript", "frontend", "ui", "ux", "design"]):
        base.append({
            "question": "Tell me about your experience with React, TypeScript, or front-end product implementation and how you handled performance or UX quality.",
            "category": "Technical",
            "difficulty": "Medium",
            "model_answer": "Discuss component architecture, reusable patterns, performance considerations, and how you used user feedback or metrics to improve the experience."
        })

    if any(token in lower_resume for token in ["python", "sql", "data", "ai", "analytics"]):
        base.append({
            "question": "Describe how you use data, SQL, or analytical thinking to improve product or business outcomes.",
            "category": "Technical",
            "difficulty": "Medium",
            "model_answer": "Explain the problem, the metric, the data or query used, the decision taken, and the measurable result."
        })

    for i, q in enumerate(base):
        q["id"] = str(i + 1)
    return base


def generate_interview_questions(resume_text: str, job_description: str = "") -> list:
    """
    Generate 10 personalized interview questions using Groq AI.
    
    Args:
        resume_text: The candidate's resume text
        job_description: Optional job description for context
    
    Returns:
        List of question dictionaries with id, question, category, difficulty, model_answer
    """
    if not settings.has_groq_config() or Groq is None:
        return _generate_demo_questions(resume_text, job_description)

    client = Groq(api_key=settings.GROQ_API_KEY)

    job_desc_section = ""
    if job_description:
        job_desc_section = f"Job Description:\n{job_description}\n"

    prompt = f"""You are an expert technical interviewer. Based on the following resume, generate 10 personalized interview questions.

Resume Text:
{resume_text}

{job_desc_section}
Requirements:
1. Mix of technical and behavioral questions
2. 5 technical questions (specific to skills/technologies mentioned)
3. 3 experience-based questions
4. 2 problem-solving questions
5. Include difficulty level for each (Easy/Medium/Hard)
6. Include a model answer for evaluation
7. Return as JSON array with fields: question, category, difficulty, model_answer

Example format:
[
    {{
        "question": "Explain your experience with Python...",
        "category": "Technical",
        "difficulty": "Medium",
        "model_answer": "The candidate should mention..."
    }}
]

Return ONLY the JSON array, no additional text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000,
        )
        
        response_text = response.choices[0].message.content
        # Clean up the response to extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        questions = json.loads(response_text)
        
        # Add IDs to questions
        for i, q in enumerate(questions):
            q["id"] = str(i + 1)
        
        return questions
    except Exception as e:
        print(f"Error generating questions: {e}")
        raise Exception(f"Failed to generate interview questions: {str(e)}")


def evaluate_answer(question: str, model_answer: str, candidate_answer: str) -> dict:
    """
    Evaluate a candidate's answer using Groq AI.
    
    Args:
        question: The interview question
        model_answer: The expected/model answer
        candidate_answer: The candidate's answer
    
    Returns:
        Dictionary with score (0-10), feedback, strengths, improvements
    """
    if not settings.has_groq_config() or Groq is None:
        score = max(5, min(10, int((len(candidate_answer.split()) / max(1, len(model_answer.split()) // 2)) * 3)))
        return {
            "score": score,
            "feedback": "Strong answer overall. In a live environment, this would be scored by an AI interviewer using your role-specific rubric.",
            "strengths": ["Clear communication", "Relevant experience discussed", "Good structure"],
            "improvements": ["Add more measurable outcomes", "Tie examples more directly to the role"],
        }

    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are an expert interviewer evaluating a candidate's answer.

Question: {question}
Expected Answer: {model_answer}
Candidate's Answer: {candidate_answer}

Evaluate the answer and return JSON with:
- score: 0-10 (integer)
- feedback: "Good answer but missing X..." (string)
- strengths: ["Good explanation", ...] (array of strings)
- improvements: ["Could mention Y...", ...] (array of strings)

Example format:
{{
    "score": 8,
    "feedback": "Good explanation of the concept, but could have provided more examples.",
    "strengths": ["Clear explanation", "Good technical knowledge"],
    "improvements": ["Add real-world examples", "Mention edge cases"]
}}

Return ONLY the JSON object, no additional text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=500,
        )
        
        response_text = response.choices[0].message.content
        # Clean up the response to extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        evaluation = json.loads(response_text)
        return evaluation
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        # Return default evaluation on error
        return {
            "score": 5,
            "feedback": "Unable to evaluate answer automatically.",
            "strengths": [],
            "improvements": []
        }


def calculate_overall_rating(score: int) -> str:
    """Calculate rating based on overall score."""
    if score >= 90:
        return "Excellent"
    elif score >= 75:
        return "Good"
    elif score >= 60:
        return "Average"
    else:
        return "Poor"


def create_interview(candidate_id: str, resume_text: str, job_id: str = None) -> str:
    """
    Create a new interview and generate questions.
    
    Args:
        candidate_id: The candidate's user ID
        resume_text: The candidate's resume text
        job_id: Optional job ID for context
    
    Returns:
        The interview ID
    """
    supabase = get_supabase()
    
    # Get job description if job_id is provided
    job_description = ""
    if job_id:
        job_result = supabase.table('jobs').select('description').eq('id', job_id).execute()
        if job_result.data:
            job_description = job_result.data[0].get('description', '')
    
    # Generate questions
    questions = generate_interview_questions(resume_text, job_description)
    
    # Create interview record
    interview_result = supabase.table('interviews').insert({
        'candidate_id': candidate_id,
        'job_id': job_id,
        'resume_text': resume_text,
        'status': 'in_progress'
    }).execute()
    
    interview_id = interview_result.data[0]['id']
    
    # Insert questions
    for i, q in enumerate(questions):
        supabase.table('interview_questions').insert({
            'interview_id': interview_id,
            'question': q['question'],
            'category': q['category'],
            'difficulty': q['difficulty'],
            'order_num': i + 1,
            'model_answer': q['model_answer']
        }).execute()
    
    return interview_id


def submit_answer(interview_id: str, question_id: str, answer: str) -> dict:
    """
    Submit an answer for a question and evaluate it.
    
    Args:
        interview_id: The interview ID
        question_id: The question ID
        answer: The candidate's answer
    
    Returns:
        Dictionary with success status and next question info
    """
    supabase = get_supabase()
    
    # Get question details
    question_result = supabase.table('interview_questions').select('*').eq('id', question_id).execute()
    if not question_result.data:
        raise Exception("Question not found")
    
    question = question_result.data[0]
    
    # Evaluate answer
    evaluation = evaluate_answer(question['question'], question['model_answer'], answer)
    
    # Save answer
    supabase.table('interview_answers').insert({
        'interview_id': interview_id,
        'question_id': question_id,
        'answer': answer,
        'score': evaluation['score'],
        'feedback': evaluation['feedback']
    }).execute()
    
    # Get next question
    current_order = question['order_num']
    next_question_result = supabase.table('interview_questions').select('*').eq('interview_id', interview_id).eq('order_num', current_order + 1).execute()
    
    next_question = None
    if next_question_result.data:
        next_question = {
            'id': next_question_result.data[0]['id'],
            'question': next_question_result.data[0]['question'],
            'category': next_question_result.data[0]['category'],
            'difficulty': next_question_result.data[0]['difficulty']
        }
    
    return {
        'success': True,
        'next_question': next_question
    }


def evaluate_interview(interview_id: str) -> dict:
    """
    Evaluate the complete interview and calculate overall score.
    
    Args:
        interview_id: The interview ID
    
    Returns:
        Dictionary with overall evaluation results
    """
    supabase = get_supabase()
    
    # Get all answers for the interview
    answers_result = supabase.table('interview_answers').select('*').eq('interview_id', interview_id).execute()
    answers = answers_result.data
    
    if not answers:
        raise Exception("No answers found for this interview")
    
    # Calculate overall score
    total_score = sum(a['score'] for a in answers)
    overall_score = int((total_score / (len(answers) * 10)) * 100)
    
    # Get detailed results
    detailed_results = []
    for answer in answers:
        question_result = supabase.table('interview_questions').select('question').eq('id', answer['question_id']).execute()
        if question_result.data:
            detailed_results.append({
                'question': question_result.data[0]['question'],
                'answer': answer['answer'],
                'score': answer['score'],
                'feedback': answer['feedback']
            })
    
    # Calculate strengths and weaknesses
    strengths = []
    weaknesses = []
    
    for answer in answers:
        if answer['score'] >= 7:
            # Extract strengths from feedback
            if answer['feedback']:
                strengths.append(f"Good performance on question about {question_result.data[0]['question'][:30]}...")
        else:
            # Extract weaknesses from feedback
            if answer['feedback']:
                weaknesses.append(f"Needs improvement on {question_result.data[0]['question'][:30]}...")
    
    # Generate overall feedback
    rating = calculate_overall_rating(overall_score)
    feedback = f"Your overall performance was {rating}. You scored {overall_score}% on this interview."
    
    # Update interview record
    supabase.table('interviews').update({
        'status': 'completed',
        'score': overall_score,
        'rating': rating,
        'feedback': feedback,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'completed_at': 'now()'
    }).eq('id', interview_id).execute()
    
    return {
        'score': overall_score,
        'total_questions': len(answers),
        'correct': len([a for a in answers if a['score'] >= 7]),
        'incorrect': len([a for a in answers if a['score'] < 7]),
        'strengths': strengths,
        'weaknesses': weaknesses,
        'feedback': feedback,
        'rating': rating,
        'detailed_results': detailed_results
    }


def get_interview_history(candidate_id: str) -> list:
    """
    Get interview history for a candidate.
    
    Args:
        candidate_id: The candidate's user ID
    
    Returns:
        List of interview history items
    """
    supabase = get_supabase()
    
    result = supabase.table('interviews').select('*').eq('candidate_id', candidate_id).order('created_at', desc=True).execute()
    
    history = []
    for interview in result.data:
        history.append({
            'interview_id': interview['id'],
            'date': interview['created_at'],
            'score': interview.get('score'),
            'status': interview['status']
        })
    
    return history


def get_interview_details(interview_id: str) -> dict:
    """
    Get detailed information about an interview.
    
    Args:
        interview_id: The interview ID
    
    Returns:
        Dictionary with interview details
    """
    supabase = get_supabase()
    
    # Get interview
    interview_result = supabase.table('interviews').select('*').eq('id', interview_id).execute()
    if not interview_result.data:
        raise Exception("Interview not found")
    
    interview = interview_result.data[0]
    
    # Get questions
    questions_result = supabase.table('interview_questions').select('*').eq('interview_id', interview_id).order('order_num').execute()
    questions = []
    for q in questions_result.data:
        questions.append({
            'id': q['id'],
            'question': q['question'],
            'category': q['category'],
            'difficulty': q['difficulty']
        })
    
    # Get answers
    answers_result = supabase.table('interview_answers').select('*').eq('interview_id', interview_id).execute()
    answers = []
    for answer in answers_result.data:
        question_result = supabase.table('interview_questions').select('question').eq('id', answer['question_id']).execute()
        if question_result.data:
            answers.append({
                'question': question_result.data[0]['question'],
                'answer': answer['answer'],
                'score': answer['score'],
                'feedback': answer['feedback']
            })
    
    return {
        'interview_id': interview['id'],
        'candidate_id': interview['candidate_id'],
        'job_id': interview.get('job_id'),
        'status': interview['status'],
        'score': interview.get('score'),
        'rating': interview.get('rating'),
        'feedback': interview.get('feedback'),
        'strengths': interview.get('strengths', []),
        'weaknesses': interview.get('weaknesses', []),
        'created_at': interview['created_at'],
        'completed_at': interview.get('completed_at'),
        'questions': questions,
        'answers': answers
    }
