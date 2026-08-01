"""
gmail.py
--------
Gmail integration router for OAuth flow and email fetching.
"""

import sys
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
from typing import Optional
from pydantic import BaseModel
from app.services.gmail_fetcher import GmailFetcher
from app.db.supabase_client import get_supabase
import uuid

router = APIRouter(prefix="/gmail", tags=["Gmail"])


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_expiry: Optional[str]
    email: Optional[str]


class FetchResponse(BaseModel):
    success: bool
    message: str
    candidates_fetched: int
    candidates_saved: int


class StatusResponse(BaseModel):
    connected: bool
    email: Optional[str]


@router.get("/auth")
async def get_auth_url():
    """Generate Google OAuth authorization URL"""
    try:
        auth_url = GmailFetcher.get_auth_url()
        return {"auth_url": auth_url}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/auth/callback")
async def auth_callback(code: str = Query(...), state: Optional[str] = None, user_id: Optional[str] = None):
    """Handle OAuth callback and store token"""
    try:
        supabase = get_supabase()
        
        # Exchange code for token
        token_data = GmailFetcher.exchange_code_for_token(code)
        
        # For simplicity, create or get a user (in production, use actual auth)
        if not user_id:
            # Create a default user or use the email
            user_email = token_data.get('email')
            if not user_email:
                raise HTTPException(status_code=400, detail="Could not get user email")
            
            # Check if user exists
            existing_user = supabase.table('users').select('id').eq('email', user_email).execute()
            
            if existing_user.data:
                user_id = existing_user.data[0]['id']
            else:
                # Create new user
                new_user = supabase.table('users').insert({
                    'email': user_email,
                    'full_name': user_email.split('@')[0],
                    'first_name': user_email.split('@')[0],
                    'last_name': '',
                    'password_hash': 'temp',
                    'role': 'recruiter'
                }).execute()
                user_id = new_user.data[0]['id']
        
        # Store or update token
        existing_token = supabase.table('gmail_tokens').select('*').eq('user_id', user_id).execute()
        
        if existing_token.data:
            # Update existing token
            supabase.table('gmail_tokens').update({
                'email': token_data.get('email'),
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_expiry': token_data.get('token_expiry'),
                'updated_at': 'NOW()'
            }).eq('user_id', user_id).execute()
        else:
            # Insert new token
            supabase.table('gmail_tokens').insert({
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'email': token_data.get('email'),
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_expiry': token_data.get('token_expiry')
            }).execute()
        
        # Redirect to frontend
        return RedirectResponse(url="http://localhost:5173/settings?gmail_connected=true")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch", response_model=FetchResponse)
async def fetch_emails(user_id: str = Query(...), job_id: str = Query(None)):
    """Fetch emails from Gmail, parse resumes, and save candidates"""
    print(f"\n🔵 === GMAIL FETCH STARTED ===", flush=True)
    print(f"🔵 User ID: {user_id}", flush=True)
    sys.stdout.flush()
    
    try:
        supabase = get_supabase()
        print(f"🔵 Supabase connected successfully", flush=True)
        sys.stdout.flush()
        
        # Get user's Gmail token
        print(f"🔵 Fetching Gmail token for user...", flush=True)
        sys.stdout.flush()
        token_data = supabase.table('gmail_tokens').select('*').eq('user_id', user_id).execute()
        print(f"🔵 Token query result: {len(token_data.data)} tokens found", flush=True)
        sys.stdout.flush()
        
        if not token_data.data:
            print(f"🔴 No Gmail token found for user", flush=True)
            sys.stdout.flush()
            raise HTTPException(status_code=404, detail="Gmail not connected for this user")
        
        token = token_data.data[0]
        print(f"🔵 Token found for email: {token.get('email')}", flush=True)
        sys.stdout.flush()
        
        # Create credentials from token
        print(f"🔵 Creating Gmail credentials from token...", flush=True)
        sys.stdout.flush()
        credentials = GmailFetcher.credentials_from_token(token)
        print(f"🔵 Credentials created successfully", flush=True)
        sys.stdout.flush()
        
        # Fetch emails with attachments
        print(f"🔵 Fetching emails from Gmail...", flush=True)
        sys.stdout.flush()
        emails = GmailFetcher.fetch_emails_with_attachments(credentials)
        print(f"🔵 Emails fetched: {len(emails)}", flush=True)
        sys.stdout.flush()
        
        if not emails:
            print(f"🟡 No emails with attachments found", flush=True)
            sys.stdout.flush()
            return FetchResponse(
                success=True,
                message="No emails with resume attachments found",
                candidates_fetched=0,
                candidates_saved=0
            )
        
        # GET JOB ID
        if job_id:
            print(f"🔵 Using provided job_id: {job_id}", flush=True)
            job_check = supabase.table('jobs').select('id').eq('id', job_id).execute()
            if not job_check.data:
                print(f"🔴 Provided job_id not found, using default", flush=True)
                job_id = None
        else:
            job_result = supabase.table('jobs').select('id').eq('status', 'active').order('created_at', desc=True).limit(1).execute()
            if job_result.data:
                job_id = job_result.data[0]['id']
                print(f"🔵 Using most recent active job_id: {job_id}", flush=True)
            else:
                print(f"🔵 No active jobs found, creating default job for Gmail candidates", flush=True)
                new_job = supabase.table('jobs').insert({
                    'title': 'Gmail Candidates',
                    'description': 'Auto-created for Gmail fetched candidates',
                    'status': 'active',
                    'recruiter_id': user_id
                }).execute()
                job_id = new_job.data[0]['id']
                print(f"🔵 Created new job with id: {job_id}", flush=True)
        sys.stdout.flush()
        
        # PROCESS EMAILS WITH DATABASE CONNECTION
        print(f"🔵 Processing emails to candidates with database...", flush=True)
        sys.stdout.flush()
        
        candidates, saved_count = GmailFetcher.process_emails_to_candidates(
            emails, 
            supabase=supabase, 
            job_id=job_id
        )
        
        print(f"🔵 Candidates processed: {len(candidates)}", flush=True)
        print(f"🔵 Candidates saved in fetcher: {saved_count}", flush=True)
        sys.stdout.flush()
        
        # RUN RANKING
        if saved_count > 0:
            print(f"🔵 Running ranking for job...", flush=True)
            sys.stdout.flush()
            try:
                from app.services.ranking_engine import rank_candidates
                job_data = supabase.table('jobs').select('*').eq('id', job_id).execute().data[0]
                job_description = job_data.get('description', '') or 'Software development position'
                
                all_candidates = supabase.table('candidates').select('*').eq('job_id', job_id).execute().data
                
                for candidate in all_candidates:
                    candidate['filename'] = candidate.get('filename') or candidate.get('name') or 'unknown.pdf'
                    candidate['experience'] = candidate.get('experience') or ''
                    candidate['projects'] = candidate.get('projects') or ''
                    candidate['education'] = candidate.get('education') or ''
                    candidate['certifications'] = candidate.get('certifications') or ''
                    candidate['raw_text'] = candidate.get('raw_text') or ''
                    candidate['skills'] = candidate.get('skills') or []
                    candidate['phone'] = candidate.get('phone') or ''
                
                ranked_candidates = rank_candidates(all_candidates, job_description)
                print(f"🔵 Ranked {len(ranked_candidates)} candidates", flush=True)
                sys.stdout.flush()
                
                for ranked in ranked_candidates:
                    matching_candidate = next((c for c in all_candidates if c.get('email') == ranked.get('email')), None)
                    if matching_candidate:
                        supabase.table('scores').delete().eq('candidate_id', matching_candidate['id']).execute()
                        try:
                            supabase.table('scores').insert({
                                'candidate_id': matching_candidate['id'],
                                'job_id': job_id,
                                'overall_score': ranked.get('overall_score', 0),
                                'skills_score': ranked.get('breakdown', {}).get('skills', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                'experience_score': ranked.get('breakdown', {}).get('experience', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                'education_score': ranked.get('breakdown', {}).get('education', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                'certifications_score': ranked.get('breakdown', {}).get('certifications', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                'projects_score': ranked.get('breakdown', {}).get('projects', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                'matched_skills': ranked.get('matched_skills', []),
                                'missing_skills': ranked.get('missing_skills', []),
                                'strengths': ranked.get('strengths', []),
                                'weaknesses': ranked.get('weaknesses', []),
                                'rank': ranked.get('rank', 0)
                            }).execute()
                            print(f"✅ Ranking score created for {ranked.get('name')} - {ranked.get('overall_score', 0)}%", flush=True)
                        except Exception as insert_error:
                            if 'job_id' in str(insert_error):
                                supabase.table('scores').insert({
                                    'candidate_id': matching_candidate['id'],
                                    'overall_score': ranked.get('overall_score', 0),
                                    'skills_score': ranked.get('breakdown', {}).get('skills', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                    'experience_score': ranked.get('breakdown', {}).get('experience', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                    'education_score': ranked.get('breakdown', {}).get('education', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                    'certifications_score': ranked.get('breakdown', {}).get('certifications', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                    'projects_score': ranked.get('breakdown', {}).get('projects', 0) if isinstance(ranked.get('breakdown'), dict) else 0,
                                    'matched_skills': ranked.get('matched_skills', []),
                                    'missing_skills': ranked.get('missing_skills', []),
                                    'strengths': ranked.get('strengths', []),
                                    'weaknesses': ranked.get('weaknesses', []),
                                    'rank': ranked.get('rank', 0)
                                }).execute()
                            else:
                                print(f"⚠️ Score insert error: {insert_error}", flush=True)
                sys.stdout.flush()
                print(f"✅ Ranking complete for job", flush=True)
                sys.stdout.flush()
            except Exception as rank_error:
                print(f"🟡 Ranking failed: {rank_error}", flush=True)
                import traceback
                traceback.print_exc()
                sys.stdout.flush()
        
        print(f"🔵 === GMAIL FETCH COMPLETE ===", flush=True)
        print(f"🔵 Emails fetched: {len(emails)}", flush=True)
        print(f"🔵 Candidates saved: {saved_count}", flush=True)
        sys.stdout.flush()
        
        return FetchResponse(
            success=True,
            message=f"Successfully fetched {len(emails)} emails and saved {saved_count} candidates",
            candidates_fetched=len(emails),
            candidates_saved=saved_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"🔴 === GMAIL FETCH ERROR ===", flush=True)
        print(f"🔴 Error: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=StatusResponse)
async def get_gmail_status(user_id: str = Query(...)):
    """Check Gmail connection status for a user"""
    try:
        supabase = get_supabase()
        token_data = supabase.table('gmail_tokens').select('*').eq('user_id', user_id).execute()
        
        if token_data.data:
            return StatusResponse(
                connected=True,
                email=token_data.data[0].get('email')
            )
        else:
            return StatusResponse(
                connected=False,
                email=None
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))