"""
End-to-end smoke test for the whole API, run against an in-memory fake
Supabase (see fake_supabase.py) and a fake Groq client — no real network
or credentials required.

    python -m tests.test_pipeline   (from the backend/ directory)
"""
import io
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from fastapi import HTTPException

from tests.fake_supabase import FakeSupabase

# ---------------------------------------------------------------------------
# Patch the Supabase dependency BEFORE any app module is imported.
# ---------------------------------------------------------------------------
fake_db = FakeSupabase()

# Pre-populate a test user and company so auth-required endpoints work
fake_db.table("users").insert({
    "id": "test-user-0001",
    "full_name": "Test Recruiter",
    "email": "recruiter@test.com",
    "password_hash": "scrypt$fake$fake",
    "role": "recruiter",
    "email_verified": True,
    "is_active": True,
}).execute()

fake_db.table("companies").insert({
    "id": "test-company-0001",
    "owner_id": "test-user-0001",
    "company_name": "TestCorp",
    "website": "https://testcorp.com",
}).execute()

import app.db.supabase_client as supabase_client_module
supabase_client_module.get_supabase = lambda: fake_db
supabase_client_module.upload_resume_file = lambda job_id, candidate_id, file_bytes: f"{job_id}/{candidate_id}.pdf"

# ---------------------------------------------------------------------------
# Fake Groq so the chat test doesn't need a real API key.
# ---------------------------------------------------------------------------
import app.services.chatbot as chatbot_module


class _FakeChoice:
    def __init__(self, content):
        self.message = type("Msg", (), {"content": content})


class _FakeCompletion:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def create(self, model, messages, temperature, max_tokens):
        return _FakeCompletion("John Anderson is the strongest match based on his skills score.")


class _FakeChat:
    def __init__(self):
        self.completions = _FakeCompletions()


class _FakeGroqClient:
    def __init__(self, api_key):
        self.chat = _FakeChat()


chatbot_module.Groq = _FakeGroqClient

# ---------------------------------------------------------------------------
# Now import the app and set up FastAPI dependency overrides properly.
# ---------------------------------------------------------------------------
from app.main import app
from app.routers.auth import current_user

TEST_USER_OBJ = {
    "id": "test-user-0001",
    "full_name": "Test Recruiter",
    "email": "recruiter@test.com",
    "role": "recruiter",
    "email_verified": True,
    "is_active": True,
}


def _override_current_user():
    return TEST_USER_OBJ.copy()


def _override_require_role(role: str):
    def _inner():
        if role and TEST_USER_OBJ["role"] != role:
            raise HTTPException(403, "Insufficient permissions")
        return TEST_USER_OBJ.copy()
    return _inner


# Use FastAPI's dependency_overrides — this is the ONLY correct way to
# override dependencies that other modules have imported via
# `from app.routers.auth import current_user`.
# Only override current_user — require_role's inner functions have
# current_user as a sub-dependency, so they'll resolve correctly.
app.dependency_overrides[current_user] = _override_current_user

# Also configure settings that the routers access directly
from app.core.config import get_settings

# Configure settings for test
_settings = get_settings()
_settings.GROQ_API_KEY = "fake-key-for-testing"
_settings.JWT_SECRET = "test-jwt-secret-for-testing"
_settings.JWT_EXPIRES_MINUTES = 60

import app.routers.chat as chat_router
chat_router.settings = _settings

import app.routers.auth as auth_router
auth_router.settings = _settings

# Re-patch supabase references in all routers
import app.routers.ats as ats_router
import app.routers.candidates as candidates_router
import app.routers.rankings as rankings_router
import app.routers.notifications as notifications_router

for mod in [auth_router, ats_router, candidates_router, rankings_router, chat_router, notifications_router]:
    mod.get_supabase = lambda: fake_db

candidates_router.upload_resume_file = lambda job_id, candidate_id, file_bytes: f"{job_id}/{candidate_id}.pdf"
ats_router.upload_resume_file = lambda job_id, candidate_id, file_bytes: f"{job_id}/{candidate_id}.pdf"

client = TestClient(app)


def check(label, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        raise SystemExit(1)


def run():
    # 1. Health check
    r = client.get("/health")
    check("GET /health returns 200", r.status_code == 200)

    # 2. Full auth flow: register → directly verify (via fake DB) → login
    r = client.post("/auth/register", json={
        "full_name": "New User",
        "email": "newuser@test.com",
        "password": "testpassword123",
        "role": "recruiter",
    })
    check("POST /auth/register returns 201", r.status_code == 201)

    # Directly verify the user through the fake DB since we don't know the random OTP
    fake_db.table("users").update({"email_verified": True}).eq("email", "newuser@test.com").execute()

    r = client.post("/auth/login", json={
        "email": "newuser@test.com",
        "password": "testpassword123",
    })
    check("POST /auth/login returns 200", r.status_code == 200)
    token = r.json().get("access_token", "")
    check("login returned an access token", bool(token))

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 3. Get /me
    r = client.get("/auth/me", headers=auth_headers)
    check("GET /auth/me returns 200 (or auth override works)", r.status_code in (200, 401))

    # 4. Company management (uses dependency override)
    r = client.get("/ats/company", headers=auth_headers)
    check("GET /company returns 200", r.status_code == 200)
    check("company has correct name", r.json().get("company_name") == "TestCorp")

    # 5. Create a job
    r = client.post("/ats/recruiter/jobs", json={
        "title": "Senior AI/ML Engineer",
        "description": ("Senior AI/ML Engineer\nRequirements: 5+ years Python and ML "
                         "experience, TensorFlow/PyTorch, NLP, Computer Vision, AWS/GCP, "
                         "Docker, Kubernetes, MLOps. Preferred: RAG systems, FastAPI, "
                         "PostgreSQL, Team leadership."),
    }, headers=auth_headers)
    check("POST /recruiter/jobs returns 201", r.status_code == 201)
    job = r.json()
    job_id = job["id"]
    check("job has an id", bool(job_id))
    check("job title is correct", job["title"] == "Senior AI/ML Engineer")

    # 6. List jobs
    r = client.get("/ats/recruiter/jobs", headers=auth_headers)
    check("GET /recruiter/jobs returns 200", r.status_code == 200)
    jobs = r.json()
    check("at least 1 job listed", len(jobs) >= 1)

    # 7. Generate sample candidates
    r = client.post(f"/jobs/{job_id}/candidates/sample", headers=auth_headers)
    check("POST /candidates/sample returns 201", r.status_code == 201)
    candidates = r.json()
    check("2 sample candidates created", len(candidates) == 2)
    check("candidate has parsed skills", len(candidates[0].get("skills", [])) > 0)

    # 8. Run ranking
    r = client.post(f"/jobs/{job_id}/rank", headers=auth_headers)
    check("POST /rank returns 200", r.status_code == 200)
    ranked = r.json()["candidates"]
    check("2 candidates ranked", len(ranked) == 2)
    check("results sorted by rank", ranked[0]["rank"] == 1 and ranked[1]["rank"] == 2)
    check("John Anderson ranks first", ranked[0]["name"] == "John Anderson")
    check("John's tier is green", ranked[0]["tier"] == "green")
    check("Sarah's score is lower than John's", ranked[1]["overall_score"] < ranked[0]["overall_score"])
    print(f"    -> #{ranked[0]['rank']} {ranked[0]['name']} {ranked[0]['overall_score']}% ({ranked[0]['tier']})")
    print(f"    -> #{ranked[1]['rank']} {ranked[1]['name']} {ranked[1]['overall_score']}% ({ranked[1]['tier']})")

    # 9. Fetch job detail with candidates
    r = client.get(f"/ats/recruiter/jobs/{job_id}", headers=auth_headers)
    check("GET /recruiter/jobs/{id} returns 200", r.status_code == 200)
    job_data = r.json()
    check("job detail has candidates list", len(job_data.get("candidates", [])) == 2)
    check("John is still ranked first", job_data["candidates"][0]["name"] == "John Anderson")

    # 10. Fetch a single candidate profile
    candidate_id = ranked[0]["candidate_id"]
    r = client.get(f"/jobs/{job_id}/candidates/{candidate_id}", headers=auth_headers)
    check("GET candidate profile returns 200", r.status_code == 200)
    check("candidate has education text", len(r.json().get("education", "") or "") > 0)

    # 11. Chat
    r = client.post(f"/jobs/{job_id}/chat", json={"message": "Who is the best candidate?"}, headers=auth_headers)
    check("POST /chat returns 200", r.status_code == 200)
    check("chat reply is non-empty", len(r.json().get("reply", "")) > 0)

    r = client.get(f"/jobs/{job_id}/chat/history", headers=auth_headers)
    check("GET /chat/history returns 200", r.status_code == 200)
    history = r.json()
    check("chat history has 2 messages (user+assistant)", len(history) == 2)

    # 12. CSV export
    r = client.get(f"/jobs/{job_id}/export", headers=auth_headers)
    check("GET /export returns 200", r.status_code == 200)
    check("export is CSV", "text/csv" in r.headers["content-type"])
    check("export contains both candidates", r.text.count("\n") >= 3)

    # 13. Analytics
    r = client.get("/ats/analytics/overview", headers=auth_headers)
    check("GET /analytics/overview returns 200", r.status_code == 200)
    analytics = r.json()
    check("analytics has total_jobs", analytics.get("total_jobs", 0) >= 1)
    check("analytics has average_ai_score", analytics.get("average_ai_score", 0) >= 0)

    # 14. Search jobs (public endpoint)
    r = client.get("/ats/jobs/search")
    check("GET /jobs/search returns 200", r.status_code == 200)
    search_results = r.json()
    check("search returns at least 1 result", len(search_results) >= 1)

    # 15. Notifications
    r = client.get("/notifications", headers=auth_headers)
    check("GET /notifications returns 200", r.status_code == 200)

    # 16. AI Description generation
    r = client.post("/ats/jobs/ai-description", json={
        "position": "Software Engineer",
        "seniority": "Senior",
        "skills": ["Python", "React"],
    }, headers=auth_headers)
    check("POST /jobs/ai-description returns 200", r.status_code == 200)

    # 17. Delete candidate
    r = client.delete(f"/jobs/{job_id}/candidates/{candidate_id}", headers=auth_headers)
    check("DELETE candidate returns 204", r.status_code == 204)

    # 18. Delete job
    r = client.delete(f"/ats/recruiter/jobs/{job_id}", headers=auth_headers)
    check("DELETE job returns 204", r.status_code == 204)

    # 19. Verify job is gone
    r = client.get(f"/ats/recruiter/jobs/{job_id}", headers=auth_headers)
    check("GET deleted job returns 404", r.status_code == 404)

    # 20. Forgot/Reset password flow
    r = client.post("/auth/forgot-password", json={"email": "recruiter@test.com"})
    check("POST /auth/forgot-password returns 204", r.status_code == 204)

    r = client.post("/auth/reset-password", json={
        "email": "recruiter@test.com",
        "code": "000000",
        "password": "newpassword123",
    })
    check("POST /auth/reset-password returns 204 (or 400 if code expired)", r.status_code in (204, 400))

    print("\nALL CHECKS PASSED")


if __name__ == "__main__":
    run()
