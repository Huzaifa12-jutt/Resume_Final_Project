"""
gmail.py
--------
Gmail integration router for OAuth flow and email fetching.
"""

import sys
import uuid
from datetime import datetime, timezone
from urllib.parse import urlsplit
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from fastapi.responses import RedirectResponse
from typing import Optional
from pydantic import BaseModel
from app.core.config import get_settings
from app.services.gmail_fetcher import GmailFetcher
from app.db.supabase_client import get_supabase
from app.routers.auth import current_user

router = APIRouter(prefix="/gmail", tags=["Gmail"])
settings = get_settings()


class FetchResponse(BaseModel):
    success: bool
    message: str
    candidates_fetched: int
    candidates_saved: int


class StatusResponse(BaseModel):
    connected: bool
    email: Optional[str]


@router.get("/auth")
def get_auth_url(user=Depends(current_user)):
    """Generate Google OAuth authorization URL for the logged-in recruiter.

    The authenticated user's id is passed through as the OAuth ``state`` value
    so the callback knows which account to attach the token to — this is what
    makes the connection status show up for the right user.
    """
    try:
        auth_url = GmailFetcher.get_auth_url(state=user["id"])
        return {"auth_url": auth_url}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def process_oauth_callback(request: Request, code: str, state: Optional[str]) -> RedirectResponse:
    """Shared OAuth callback logic.

    Both the real callback route (``/gmail/auth/callback``) and a compatibility
    handler at the API root (``/``) call this — Google will happily redirect
    back to whichever redirect URI is registered on the OAuth client, so we
    make both paths work instead of requiring the console to be configured
    exactly one way.

    On success the browser is bounced back to the recruiter settings page with
    ``?gmail_connected=true``; on failure it is bounced back with
    ``?gmail_connected=error`` so the user is never stranded on a raw JSON
    error page in the middle of the flow.
    """
    frontend_base = settings.FRONTEND_URL.rstrip('/')

    def _fail(reason: str) -> RedirectResponse:
        return RedirectResponse(
            url=f"{frontend_base}/recruiter/settings?gmail_connected=error&reason={reason}"
        )

    try:
        # Google echoes back whatever was passed as `state` — we passed the
        # recruiter's user id when building the auth URL. Only `state` is
        # trusted here (never a caller-supplied user_id) so a completed OAuth
        # flow can only ever attach a token to the account that started it.
        resolved_user_id = state
        if not resolved_user_id:
            return _fail("missing_state")

        # User ids are UUIDs in our schema; reject anything malformed before
        # doing any work (a real Google callback always carries a valid one).
        # Note: only UUID-shaped ids pass — legacy/manual non-UUID user ids
        # would fail here with invalid_state.
        try:
            uuid.UUID(str(resolved_user_id))
        except ValueError:
            return _fail("invalid_state")

        supabase = get_supabase()

        # Derive the exact redirect URI Google used for this callback from the
        # request URL itself (Google echoes back the redirect URI from the auth
        # request, and the token endpoint requires an exact match). This keeps
        # the exchange correct whether the OAuth client is registered with the
        # bare root (http://localhost:8000) or the full callback path.
        parts = urlsplit(str(request.url))
        redirect_uri = f"{parts.scheme}://{parts.netloc}{'' if parts.path == '/' else parts.path}"

        # Exchange code for token using that exact redirect URI
        token_data = GmailFetcher.exchange_code_for_token(code, redirect_uri=redirect_uri)

        # Store or update token against the real (logged-in) recruiter
        existing_token = supabase.table('gmail_tokens').select('*').eq('user_id', resolved_user_id).execute()

        if existing_token.data:
            # Update existing token
            supabase.table('gmail_tokens').update({
                'email': token_data.get('email'),
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_expiry': token_data.get('token_expiry'),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('user_id', resolved_user_id).execute()
        else:
            # Insert new token
            supabase.table('gmail_tokens').insert({
                'id': str(uuid.uuid4()),
                'user_id': resolved_user_id,
                'email': token_data.get('email'),
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_expiry': token_data.get('token_expiry')
            }).execute()

        # Redirect back to the recruiter settings page so the status re-checks
        return RedirectResponse(url=f"{frontend_base}/recruiter/settings?gmail_connected=true")

    except Exception:
        # Never leave the user on a raw error page mid-flow — bounce them back
        # to the app where the error banner explains what happened. (The state
        # checks above already short-circuit with _fail(), so anything reaching
        # here is an exchange/storage failure.)
        return _fail("error")


@router.get("/auth/callback")
def auth_callback(request: Request, code: str = Query(...), state: Optional[str] = None):
    """Handle OAuth callback and store token for the requesting user."""
    return process_oauth_callback(request, code, state)


@router.delete("/disconnect", status_code=204)
def disconnect_gmail(user=Depends(current_user)):
    """Remove the stored Gmail token for the logged-in user."""
    try:
        supabase = get_supabase()
        supabase.table('gmail_tokens').delete().eq('user_id', user['id']).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch", response_model=FetchResponse)
def fetch_emails(job_id: str = Query(None), user=Depends(current_user)):
    """Fetch emails from Gmail, parse resumes, and save candidates for the
    logged-in recruiter."""
    user_id = user["id"]
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
def get_gmail_status(user=Depends(current_user)):
    """Check Gmail connection status for the logged-in recruiter."""
    try:
        supabase = get_supabase()
        token_data = supabase.table('gmail_tokens').select('*').eq('user_id', user['id']).execute()
        
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