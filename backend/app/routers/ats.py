"""Company, candidate-profile, application, search and analytics endpoints."""
import io, uuid, os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.db.supabase_client import get_supabase, get_resume_signed_url, upload_resume_file
from app.db.models import CompanyUpsert, CandidateProfileUpdate, ApplicationCreate, ApplicationStatusUpdate,PublicJobResponse, RecruiterNotesUpdate, RecruiterJobCreate, RecruiterJobUpdate, AIDescriptionRequest
from app.services.resume_parser import parse_resume
from app.services.file_validator import validate_resume_file
from app.services.ranking_engine import rank_candidates, score_tier
from app.routers.auth import current_user, require_role
from uuid import UUID

router = APIRouter(prefix='/ats', tags=['ATS'])

def _company_for(user_id):
    result=get_supabase().table('companies').select('*').eq('owner_id',user_id).execute()
    return result.data[0] if result.data else None

@router.get('/company')
def get_company(user=Depends(require_role('recruiter'))):
    company=_company_for(user['id'])
    if not company: raise HTTPException(404,'Create your company profile first')
    return company

@router.put('/company')
def upsert_company(payload: CompanyUpsert, user=Depends(require_role('recruiter'))):
    db=get_supabase(); existing=_company_for(user['id']); data=payload.model_dump(exclude_none=True)
    if existing: return db.table('companies').update(data).eq('id',existing['id']).execute().data[0]
    data['owner_id']=user['id']; return db.table('companies').insert(data).execute().data[0]

@router.delete('/company', status_code=204)
def delete_company(user=Depends(require_role('recruiter'))):
    company=_company_for(user['id'])
    if not company: raise HTTPException(404,'Company not found')
    get_supabase().table('companies').delete().eq('id',company['id']).execute()

@router.get('/candidate-profile')
def get_profile(user=Depends(require_role('candidate'))):
    result=get_supabase().table('candidate_profiles').select('*').eq('user_id',user['id']).execute()
    return result.data[0] if result.data else {'user_id': user['id'], 'profile_completion': 0}

@router.put('/candidate-profile')
def upsert_profile(payload: CandidateProfileUpdate, user=Depends(require_role('candidate'))):
    db=get_supabase(); data=payload.model_dump(exclude_none=True); data['user_id']=user['id']
    present=sum(bool(data.get(key)) for key in ('headline','summary','education','experience','skills','certifications','portfolio','linkedin','github'))
    if present: data['profile_completion']=min(100, present * 10 + 10)
    existing=db.table('candidate_profiles').select('user_id').eq('user_id',user['id']).execute()
    if existing.data: return db.table('candidate_profiles').update(data).eq('user_id',user['id']).execute().data[0]
    return db.table('candidate_profiles').insert(data).execute().data[0]

@router.get('/candidate-profile/resume-url')
def profile_resume_url(user=Depends(require_role('candidate'))):
    result=get_supabase().table('candidate_profiles').select('resume_path').eq('user_id',user['id']).execute()
    if not result.data or not result.data[0].get('resume_path'): raise HTTPException(404,'No profile resume uploaded')
    resume_path = result.data[0]['resume_path']
    return {
        'url': get_resume_signed_url(resume_path),
        'file_name': os.path.basename(resume_path),
        'resume_path': resume_path,
    }

@router.post('/candidate-profile/resume')
async def upload_profile_resume(file: UploadFile = File(...), user=Depends(require_role('candidate'))):
    print(f"[INFO] Resume upload request from user: {user['id']}")
    print(f"[INFO] File: {file.filename}, Size: {file.size if hasattr(file, 'size') else 'unknown'}")
    
    content = await file.read()
    detected_type, ext = validate_resume_file(file.filename, content, file.content_type or "")
    
    mime = file.content_type or (
        "application/pdf" if ext == ".pdf"
        else "image/png" if ext == ".png"
        else "image/jpeg"
    )

    try:
        print("[INFO] Parsing resume...")
        parsed = parse_resume(io.BytesIO(content), file.filename, content_type=mime)
        print(f"[INFO] Resume parsed successfully. Skills: {parsed.get('skills', [])}")
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[ERROR] Parse error: {exc}")
        raise HTTPException(422, f'Could not parse resume: {exc}')
    
    try:
        path = upload_resume_file('profiles', user['id'], content, file_extension=ext, content_type=mime)
    except TypeError:
        path = upload_resume_file('profiles', user['id'], content)
    print(f"[INFO] Resume uploaded to: {path}")
    
    db=get_supabase()
    data={'user_id':user['id'],'headline':parsed.get('name'),'skills':parsed.get('skills',[]),'education':parsed.get('education'),'experience':parsed.get('experience'),'certifications':parsed.get('certifications'),'summary':parsed.get('raw_text','')[:1000],'raw_text':parsed.get('raw_text'),'parsed_resume_json':parsed,'resume_path':path,'profile_completion':80}
    
    existing=db.table('candidate_profiles').select('user_id').eq('user_id',user['id']).execute()
    print(f"[INFO] Existing profile: {bool(existing.data)}")
    
    result = (db.table('candidate_profiles').update(data).eq('user_id',user['id']) if existing.data else db.table('candidate_profiles').insert(data)).execute().data[0]
    print(f"[SUCCESS] Resume saved successfully. raw_text length: {len(data.get('raw_text', ''))}")
    
    return result

@router.post('/recruiter/jobs', status_code=201)
def create_recruiter_job(payload: RecruiterJobCreate, user=Depends(require_role('recruiter'))):
    company=_company_for(user['id'])
    if not company: raise HTTPException(400,'Create your company profile before posting jobs')
    row=payload.model_dump(); row.update({'recruiter_id':user['id'],'company_id':company['id'],'created_by':user['id'],'status':'active'})
    return get_supabase().table('jobs').insert(row).execute().data[0]

def _owned_job(job_id, user_id):
    result=get_supabase().table('jobs').select('*').eq('id',job_id).eq('recruiter_id',user_id).execute()
    if not result.data: raise HTTPException(404,'Job not found in your company')
    return result.data[0]

@router.patch('/recruiter/jobs/{job_id}')
def update_recruiter_job(job_id: str, payload: RecruiterJobUpdate, user=Depends(require_role('recruiter'))):
    _owned_job(job_id,user['id']); data=payload.model_dump(exclude_none=True)
    if not data: raise HTTPException(400,'Provide at least one field to update')
    return get_supabase().table('jobs').update(data).eq('id',job_id).execute().data[0]

@router.delete('/recruiter/jobs/{job_id}', status_code=204)
def delete_recruiter_job(job_id: str, user=Depends(require_role('recruiter'))):
    _owned_job(job_id,user['id'])
    get_supabase().table('jobs').delete().eq('id',job_id).execute()

@router.get('/recruiter/jobs')
def recruiter_jobs(user=Depends(require_role('recruiter'))):
    db=get_supabase()
    jobs=db.table('jobs').select('*').eq('recruiter_id',user['id']).order('created_at',desc=True).execute().data or []
    if jobs:
        job_ids=[j['id'] for j in jobs]
        candidate_rows=db.table('candidates').select('job_id').in_('job_id',job_ids).execute().data or []
        counts={}
        for row in candidate_rows:
            counts[row['job_id']]=counts.get(row['job_id'],0)+1
        for j in jobs:
            j['total_candidates']=counts.get(j['id'],0)
    return jobs

@router.get('/recruiter/jobs/{job_id}')
def recruiter_job_detail(job_id: str, user=Depends(require_role('recruiter'))):
    job = _owned_job(job_id, user['id'])
    supabase = get_supabase()
    candidates_result = supabase.table("candidates").select("*, scores(*)").eq("job_id", job_id).execute()

    candidates_data = candidates_result.data or []
    cand_ids = [c["id"] for c in candidates_data]
    app_map = {}
    if cand_ids:
        app_rows = supabase.table('applications').select('id, candidate_resume_id').in_('candidate_resume_id', cand_ids).execute().data or []
        app_map = {a['candidate_resume_id']: a['id'] for a in app_rows if a.get('candidate_resume_id')}

    ranked_response = []
    for c in candidates_data:
        scores_list = c.get("scores") or []
        s = scores_list[0] if scores_list else {}

        ranked_response.append({
            "candidate_id": c["id"],
            "id": c["id"],
            "application_id": app_map.get(c["id"]),
            "filename": c.get("filename"),
            "name": c.get("name"),
            "email": c.get("email"),
            "phone": c.get("phone"),
            "score": s.get("overall_score"),
            "overall_score": s.get("overall_score"),
            "breakdown": {
                "skills": s.get("skills_score", 0),
                "experience": s.get("experience_score", 0),
                "education": s.get("education_score", 0),
                "certifications": s.get("certifications_score", 0),
                "projects": s.get("projects_score", 0)
            } if s else None,
            "matched_skills": s.get("matched_skills") or [],
            "missing_skills": s.get("missing_skills") or [],
            "strengths": s.get("strengths") or [],
            "weaknesses": s.get("weaknesses") or [],
            "rank": s.get("rank"),
            "tier": score_tier(s.get("overall_score", 0)) if s.get("overall_score") is not None else None,
            "skills": c.get("skills", []),
            "source": c.get("source", "manual")
        })

    return {"job": job, "candidates": ranked_response}

@router.get('/recruiter/candidates')
def recruiter_all_candidates(user=Depends(require_role('recruiter'))):
    """Get all candidates across all jobs for a recruiter including Gmail candidates"""
    company=_company_for(user['id'])
    if not company: return []
    
    db=get_supabase()
    jobs=db.table('jobs').select('id,title').eq('company_id',company['id']).execute().data or []
    
    # Get candidates from recruiter's jobs + Gmail candidates (source='gmail')
    if jobs:
        job_ids=[j['id'] for j in jobs]
        job_map={j['id']:j['title'] for j in jobs}
        
        # Get candidates from jobs and also Gmail candidates (source='gmail')
        # Use OR condition: candidates from jobs OR source='gmail'
        candidates=db.table('candidates')\
            .select('*, scores(*)') \
            .or_(f"job_id.in.({','.join(job_ids)}),source.eq.gmail") \
            .execute().data or []
    else:
        # If no jobs, still fetch Gmail candidates
        candidates=db.table('candidates')\
            .select('*, scores(*)') \
            .eq('source', 'gmail') \
            .execute().data or []
        job_map={}
    
    cand_ids = [c['id'] for c in candidates]
    app_map = {}
    if cand_ids:
        app_rows = db.table('applications').select('id, candidate_resume_id').in_('candidate_resume_id', cand_ids).execute().data or []
        app_map = {a['candidate_resume_id']: a['id'] for a in app_rows if a.get('candidate_resume_id')}

    result=[]
    for c in candidates:
        scores_list=c.get('scores') or []
        s=scores_list[0] if scores_list else {}
        
        # Get job title from job_map if job_id exists
        job_title = job_map.get(c.get('job_id')) if c.get('job_id') else None
        
        result.append({
            'id':c['id'],
            'candidate_id':c['id'],
            'application_id': app_map.get(c['id']),
            'name':c.get('name'),
            'email':c.get('email'),
            'phone':c.get('phone'),
            'filename':c.get('filename'),
            'jobTitle':job_title or 'Gmail Candidate',
            'job_id':c.get('job_id'),
            'source':c.get('source', 'manual'),
            'overall_score':s.get('overall_score'),
            'skills':c.get('skills',[]),
            'created_at':c.get('created_at')
        })
    
    return result

@router.post('/jobs/ai-description')
def ai_description(payload: AIDescriptionRequest, user=Depends(require_role('recruiter'))):
    skills=', '.join(payload.skills) or 'relevant domain skills'; duties='; '.join(payload.responsibilities) or 'deliver high-quality work with cross-functional partners'
    return {'title':f'{payload.seniority} {payload.position}'.strip(),'description':f'We are hiring a {payload.seniority} {payload.position}. You will {duties}.','responsibilities':payload.responsibilities or ['Collaborate with stakeholders','Deliver measurable outcomes'],'requirements':[f'{payload.experience} experience'.strip(),skills],'preferred_skills':payload.skills,'benefits':['Professional development','Collaborative team environment']}

@router.get('/jobs/search')
def search_jobs(keyword: str = '', location: str = '', employment_type: str = '', remote_type: str = '', experience: str = '', salary_min: float | None = None, status: str = 'active'):
    query=get_supabase().table('jobs').select('*').eq('status',status)
    if location: query=query.eq('location',location)
    if employment_type: query=query.eq('employment_type',employment_type)
    if remote_type: query=query.eq('remote_type',remote_type)
    rows=query.order('created_at',desc=True).execute().data or []
    needle=keyword.lower().strip()
    def matches(row):
        text=f"{row.get('title','')} {row.get('description','')} {row.get('experience_required','')}".lower()
        return (not needle or needle in text) and (not experience or experience.lower() in text) and (salary_min is None or float(row.get('salary_max') or 0) >= salary_min)
    return [r for r in rows if matches(r)]

@router.get('/jobs/{job_id}', response_model=PublicJobResponse)
def public_job_detail(job_id: UUID):
    result = (
        get_supabase()
        .table('jobs')
        .select(
            'id, title, description, employment_type, location, '
            'remote_type, salary_min, salary_max, experience_required, '
            'education_required, required_skills, openings, status, created_at'
        )
        .eq('id', str(job_id))
        .eq('status', 'active')
        .execute()
    )

    if not result.data:
        raise HTTPException(404, 'Open job not found')

    return result.data[0]

@router.post('/jobs/{job_id}/apply', status_code=201)
def apply(job_id: str, payload: ApplicationCreate, user=Depends(require_role('candidate'))):
    db=get_supabase(); job=db.table('jobs').select('*').eq('id',job_id).eq('status','active').execute()
    if not job.data: raise HTTPException(404,'Open job not found')
    profile=db.table('candidate_profiles').select('*').eq('user_id',user['id']).execute()
    if not profile.data or not profile.data[0].get('resume_path'): raise HTTPException(400,'Upload a resume to your candidate profile before applying')
    if db.table('applications').select('id').eq('candidate_id',user['id']).eq('job_id',job_id).execute().data: raise HTTPException(409,'You have already applied to this job')
    profile_data=profile.data[0]
    parsed=profile_data.get('parsed_resume_json') or {}
    applied_ext = os.path.splitext(profile_data['resume_path'])[1] or '.pdf'
    applied_filename = f"candidate-profile-resume{applied_ext}"
    candidate_row={'job_id':job_id,'filename':applied_filename,'name':user.get('full_name'),'email':user['email'],'phone':user.get('phone'),'skills':profile_data.get('skills') or [],'education':profile_data.get('education') or '', 'experience':profile_data.get('experience') or '', 'certifications':profile_data.get('certifications') or '', 'projects':'', 'raw_text':profile_data.get('raw_text') or '', 'resume_file_path':profile_data['resume_path']}
    candidate=db.table('candidates').insert(candidate_row).execute().data[0]
    ranked=rank_candidates([{**candidate_row, '_id':candidate['id']}], job.data[0]['description'])[0]
    score_row={'candidate_id':candidate['id'],'overall_score':ranked['overall_score'],'skills_score':ranked['breakdown']['skills'],'experience_score':ranked['breakdown']['experience'],'education_score':ranked['breakdown']['education'],'certifications_score':ranked['breakdown']['certifications'],'projects_score':ranked['breakdown']['projects'],'matched_skills':ranked['matched_skills'],'missing_skills':ranked['missing_skills'],'strengths':ranked['strengths'],'weaknesses':ranked['weaknesses'],'rank':ranked['rank']}
    score=db.table('scores').insert(score_row).execute().data[0]
    row={'candidate_id':user['id'],'job_id':job_id,'cover_letter':payload.cover_letter,'status':'Applied','candidate_resume_id':candidate['id'],'score_id':score['id']}
    application=db.table('applications').insert(row).execute().data[0]
    owner=job.data[0].get('recruiter_id')
    if owner: db.table('system_notifications').insert({'user_id':owner,'title':'New application','message':f"A candidate applied to {job.data[0]['title']}",'type':'application','resource_type':'application','resource_id':application['id']}).execute()
    return application

@router.get('/saved-jobs')
def saved_jobs(user=Depends(require_role('candidate'))):
    db = get_supabase()
    saved = db.table('saved_jobs').select('*').eq('user_id',user['id']).order('created_at',desc=True).execute().data or []
    job_ids = [s['job_id'] for s in saved]
    if job_ids:
        jobs = db.table('jobs').select('*').in_('id', job_ids).execute().data or []
        job_map = {j['id']: j for j in jobs}
        for s in saved:
            job = job_map.get(s['job_id'])
            if job:
                s['job'] = job
                s['title'] = job.get('title')
                s['description'] = job.get('description')
                s['location'] = job.get('location')
                s['employment_type'] = job.get('employment_type')
                s['salary_min'] = job.get('salary_min')
                s['salary_max'] = job.get('salary_max')
                s['status'] = job.get('status')
    return saved

@router.post('/jobs/{job_id}/save', status_code=201)
def save_job(job_id: str, user=Depends(require_role('candidate'))):
    db=get_supabase()
    if not db.table('jobs').select('id').eq('id',job_id).eq('status','active').execute().data: raise HTTPException(404,'Open job not found')
    if db.table('saved_jobs').select('job_id').eq('user_id',user['id']).eq('job_id',job_id).execute().data: raise HTTPException(409,'Job is already saved')
    return db.table('saved_jobs').insert({'user_id':user['id'],'job_id':job_id}).execute().data[0]

@router.delete('/jobs/{job_id}/save', status_code=204)
def unsave_job(job_id: str, user=Depends(require_role('candidate'))):
    get_supabase().table('saved_jobs').delete().eq('user_id',user['id']).eq('job_id',job_id).execute()

@router.get('/applications')
def list_applications(user=Depends(current_user)):
    db=get_supabase()
    if user['role']=='candidate':
        applications = db.table('applications').select('*').eq('candidate_id',user['id']).order('applied_at',desc=True).execute().data or []
        job_ids = [a['job_id'] for a in applications]
        if job_ids:
            jobs = db.table('jobs').select('*').in_('id', job_ids).execute().data or []
            job_map = {j['id']: j for j in jobs}
            for app in applications:
                job = job_map.get(app['job_id'])
                if job:
                    app['job_title'] = job.get('title')
                    app['job_description'] = job.get('description')
                    app['company_name'] = job.get('company_name', 'N/A')
                    app['location'] = job.get('location')
                    app['employment_type'] = job.get('employment_type')
        return applications
    company=_company_for(user['id'])
    if not company: return []
    jobs=db.table('jobs').select('id').eq('company_id',company['id']).execute().data or []
    ids=[j['id'] for j in jobs]
    if not ids: return []
    return db.table('applications').select('*').in_('job_id',ids).order('applied_at',desc=True).execute().data or []

@router.get('/applications/{application_id}')
def application_detail(application_id: str, user=Depends(current_user)):
    db=get_supabase(); result=db.table('applications').select('*').eq('id',application_id).execute()
    if not result.data: raise HTTPException(404,'Application not found')
    application=result.data[0]
    if user['role']=='candidate' and application['candidate_id'] != user['id']: raise HTTPException(403,'You do not have permission for this application')
    if user['role']=='recruiter': _owned_job(application['job_id'], user['id'])
    if application.get('score_id'):
        scores=db.table('scores').select('*').eq('id',application['score_id']).execute().data
        application['score']=scores[0] if scores else None
    return application

@router.patch('/applications/{application_id}')
def update_application(application_id: str, payload: ApplicationStatusUpdate, user=Depends(require_role('recruiter'))):
    db=get_supabase(); app=db.table('applications').select('*').eq('id',application_id).execute()
    if not app.data: raise HTTPException(404,'Application not found')
    _owned_job(app.data[0]['job_id'], user['id'])
    data=payload.model_dump(exclude_none=True); updated=db.table('applications').update(data).eq('id',application_id).execute().data[0]
    db.table('system_notifications').insert({'user_id':updated['candidate_id'],'title':'Application updated','message':f"Your application status is now {updated['status']}",'type':'application','resource_type':'application','resource_id':updated['id']}).execute()
    return updated

@router.patch('/applications/{application_id}/notes')
def update_notes(application_id: str, payload: RecruiterNotesUpdate, user=Depends(require_role('recruiter'))):
    db=get_supabase(); app=db.table('applications').select('*').eq('id',application_id).execute()
    if not app.data: raise HTTPException(404,'Application not found')
    _owned_job(app.data[0]['job_id'],user['id'])
    return db.table('applications').update({'recruiter_notes':payload.recruiter_notes}).eq('id',application_id).execute().data[0]

@router.get('/analytics/overview')
def analytics(user=Depends(require_role('recruiter'))):
    company=_company_for(user['id'])
    if not company: return {'total_jobs':0,'total_applications':0,'applications_by_status':{},'average_ai_score':0,'recent_jobs':[],'recent_candidates':[]}

    db = get_supabase()
    jobs=db.table('jobs').select('*').eq('company_id',company['id']).order('created_at',desc=True).execute().data or []
    ids=[j['id'] for j in jobs]

    apps = db.table('applications').select('*').in_('job_id',ids).execute().data if ids else []
    apps = apps or []
    funnel={}
    for a in apps: funnel[a['status']]=funnel.get(a['status'],0)+1

    candidates = []
    if ids:
        candidates_res = db.table('candidates').select('*, scores(*)').in_('job_id', ids).order('created_at', desc=True).execute()
        candidates = candidates_res.data or []
    
    # Also include Gmail candidates (source='gmail') in analytics
    gmail_candidates_res = db.table('candidates').select('*, scores(*)').eq('source', 'gmail').execute()
    gmail_candidates = gmail_candidates_res.data or []
    candidates.extend(gmail_candidates)

    all_scores = [ (c.get('scores') or [{}])[0] for c in candidates if c.get('scores') ]
    average = round(sum(float(s.get('overall_score') or 0) for s in all_scores) / len(all_scores), 2) if all_scores else 0

    recent_jobs = jobs[:5]
    recent_candidates_source = candidates[:10]

    recent_candidates_formatted = []
    for c in recent_candidates_source:
        s_list = c.get('scores') or []
        score_val = s_list[0].get('overall_score', 0) if s_list else 0
        job_match = next((j for j in jobs if j['id'] == c['job_id']), None)
        job_title = job_match['title'] if job_match else 'Gmail Candidate'
        recent_candidates_formatted.append({
            'name': c.get('name') or 'Unknown Candidate',
            'role': job_title,
            'score': round(score_val),
            'initials': (c.get('name') or 'U')[:2].upper(),
            'color': '#2b7fff',
            'source': c.get('source', 'manual')
        })

    return {
        'total_jobs':len(jobs),
        'total_applications':len(apps),
        'applications_by_status':funnel,
        'average_ai_score':average,
        'recent_jobs': recent_jobs,
        'recent_candidates': recent_candidates_formatted
    }