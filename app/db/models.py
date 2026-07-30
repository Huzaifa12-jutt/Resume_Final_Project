"""
db/models.py
------------
Pydantic schemas used for request validation and response serialization.
These mirror the Supabase table shapes from schema.sql but stay decoupled
from the DB layer on purpose — routers convert between raw Supabase rows
(dicts) and these models explicitly, rather than the DB dictating the API.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from typing import Literal

class AuthRegister(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    email: str
    password: str = Field(min_length=8, max_length=128)
    role: Literal["recruiter", "candidate"]

class AuthLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=50)
    profile_picture: Optional[str] = Field(default=None, max_length=2000)

class VerifyEmail(BaseModel):
    email: str
    code: str = Field(pattern=r"^\d{6}$")

class EmailOnly(BaseModel): email: str
class ResetPassword(BaseModel):
    email: str
    code: str = Field(pattern=r"^\d{6}$")
    password: str = Field(min_length=8, max_length=128)

class AIDescriptionRequest(BaseModel):
    position: str = Field(min_length=1, max_length=200)
    experience: str = ''
    skills: list[str] = []
    seniority: str = ''
    responsibilities: list[str] = []

class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    email_verified: bool = False
    profile_picture: Optional[str] = None
    phone: Optional[str] = None

class CompanyUpsert(BaseModel):
    company_name: str = Field(min_length=1, max_length=200)
    website: Optional[str] = None; logo: Optional[str] = None; description: Optional[str] = None
    industry: Optional[str] = None; company_size: Optional[str] = None; address: Optional[str] = None; city: Optional[str] = None; country: Optional[str] = None

class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None; summary: Optional[str] = None; education: Optional[str] = None
    experience: Optional[str] = None; skills: Optional[list[str]] = None; certifications: Optional[str] = None
    portfolio: Optional[str] = None; linkedin: Optional[str] = None; github: Optional[str] = None

class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = Field(default=None, max_length=5000)

class ApplicationStatusUpdate(BaseModel):
    status: Literal['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected']
    recruiter_notes: Optional[str] = Field(default=None, max_length=5000)

class RecruiterNotesUpdate(BaseModel):
    recruiter_notes: str = Field(max_length=5000)


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------
class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)

class RecruiterJobCreate(JobCreate):
    employment_type: Optional[str] = None; location: Optional[str] = None; remote_type: Optional[str] = None
    salary_min: Optional[float] = None; salary_max: Optional[float] = None; experience_required: Optional[str] = None
    education_required: Optional[str] = None; required_skills: list[str] = []; openings: int = Field(default=1, ge=1)

class RecruiterJobUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, min_length=1)
    status: Optional[Literal['active', 'closed', 'archived']] = None
    employment_type: Optional[str] = None; location: Optional[str] = None; remote_type: Optional[str] = None
    salary_min: Optional[float] = None; salary_max: Optional[float] = None; experience_required: Optional[str] = None
    education_required: Optional[str] = None; required_skills: Optional[list[str]] = None; openings: Optional[int] = Field(default=None, ge=1)


class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Candidates
# ---------------------------------------------------------------------------
class CandidateResponse(BaseModel):
    id: str
    job_id: str
    filename: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    education: Optional[str] = ""
    experience: Optional[str] = ""
    certifications: Optional[str] = ""
    projects: Optional[str] = ""
    resume_file_path: Optional[str] = None
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Scores / Rankings
# ---------------------------------------------------------------------------
class ScoreBreakdown(BaseModel):
    skills: float
    experience: float
    education: float
    certifications: float
    projects: float


class RankedCandidateResponse(BaseModel):
    candidate_id: str
    filename: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    overall_score: float
    breakdown: ScoreBreakdown
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    strengths: list[str] = []
    weaknesses: list[str] = []
    rank: int
    tier: str  # "green" | "yellow" | "red"


class JobWithResultsResponse(BaseModel):
    job: JobResponse
    candidates: list[RankedCandidateResponse]


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)


class ChatMessageResponse(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None


class ChatReplyResponse(BaseModel):
    reply: str
    history: list[ChatMessageResponse] = []


# ---------------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str
    environment: str
    issues: list[str] = []
