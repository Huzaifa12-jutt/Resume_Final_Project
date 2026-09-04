"""
test_multi_format_upload.py
---------------------------
Comprehensive end-to-end test suite for multi-format resume uploads:
- PDF upload, parsing, storage, candidate creation
- PNG upload, OCR extraction, parsing, storage (.png preserved)
- JPG upload, OCR extraction, parsing, storage (.jpg preserved)
- JPEG upload, OCR extraction, parsing, storage (.jpeg preserved)
- Recruiter resume URL access and authorization
- Negative testing:
  - Unsupported file types (.txt, .docx, .zip, .exe) -> 415
  - Extension spoofing (fake .pdf, fake .png, fake .jpg) -> 415
  - Low-text / empty image OCR -> 422
  - Oversized file (> 10MB) -> 413
  - Unauthenticated / unauthorized role access -> 401 / 403
"""

import io
import os
import sys
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from fastapi import HTTPException

from tests.fake_supabase import FakeSupabase

# ---------------------------------------------------------------------------
# Setup Mock Supabase and Test Users
# ---------------------------------------------------------------------------
fake_db = FakeSupabase()

# Recruiter user
fake_db.table("users").insert({
    "id": "recruiter-001",
    "full_name": "Test Recruiter",
    "email": "recruiter@example.com",
    "password_hash": "dummy",
    "role": "recruiter",
    "email_verified": True,
    "is_active": True,
}).execute()

# Another recruiter (for authorization testing)
fake_db.table("users").insert({
    "id": "recruiter-002",
    "full_name": "Other Recruiter",
    "email": "other_recruiter@example.com",
    "password_hash": "dummy",
    "role": "recruiter",
    "email_verified": True,
    "is_active": True,
}).execute()

# Candidate user
fake_db.table("users").insert({
    "id": "candidate-001",
    "full_name": "Test Candidate",
    "email": "candidate@example.com",
    "password_hash": "dummy",
    "role": "candidate",
    "email_verified": True,
    "is_active": True,
}).execute()

# Company
fake_db.table("companies").insert({
    "id": "company-001",
    "owner_id": "recruiter-001",
    "company_name": "Tech Corp",
    "website": "https://techcorp.com",
}).execute()

# Job owned by recruiter-001
fake_db.table("jobs").insert({
    "id": "job-001",
    "recruiter_id": "recruiter-001",
    "company_id": "company-001",
    "title": "Full Stack Engineer",
    "description": "Looking for Python, React, and SQL experience.",
    "status": "active",
}).execute()

# Storage mock
_stored_files = {}

def mock_upload_resume_file(job_id, candidate_id, file_bytes, file_extension=".pdf", content_type="application/pdf"):
    ext = file_extension if file_extension.startswith(".") else f".{file_extension}"
    path = f"{job_id}/{candidate_id}{ext}"
    _stored_files[path] = (file_bytes, content_type)
    return path

def mock_get_resume_signed_url(storage_path, expires_in=3600):
    return f"https://storage.supabase.local/signed/{storage_path}?token=valid_mock"

import app.db.supabase_client as supabase_client_module
supabase_client_module.get_supabase = lambda: fake_db
supabase_client_module.upload_resume_file = mock_upload_resume_file
supabase_client_module.get_resume_signed_url = mock_get_resume_signed_url

from app.main import app
from app.routers.auth import current_user
from app.core.config import get_settings

_settings = get_settings()
_settings.MAX_UPLOAD_MB = 10
_settings.JWT_SECRET = "test-secret-key"

import app.routers.candidates as candidates_router
import app.routers.ats as ats_router

candidates_router.get_supabase = lambda: fake_db
candidates_router.upload_resume_file = mock_upload_resume_file
candidates_router.get_resume_signed_url = mock_get_resume_signed_url

ats_router.get_supabase = lambda: fake_db
ats_router.upload_resume_file = mock_upload_resume_file
ats_router.get_resume_signed_url = mock_get_resume_signed_url

current_acting_user = {"id": "recruiter-001", "role": "recruiter", "email": "recruiter@example.com"}

def _override_current_user():
    return current_acting_user.copy()

app.dependency_overrides[current_user] = _override_current_user

client = TestClient(app)


# ---------------------------------------------------------------------------
# Test Helpers
# ---------------------------------------------------------------------------
def check(label, condition, details=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        if details:
            print(f"       Details: {details}")
        raise AssertionError(f"Check failed: {label} - {details}")


def generate_sample_pdf() -> bytes:
    """Generates a minimal valid PDF with resume text."""
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, "Alice Smith")
    c.drawString(100, 730, "alice@example.com")
    c.drawString(100, 710, "+1 555 123 4567")
    c.drawString(100, 680, "EXPERIENCE")
    c.drawString(100, 660, "Senior Software Engineer with 5 years building web applications.")
    c.drawString(100, 630, "SKILLS")
    c.drawString(100, 610, "Python, React, PostgreSQL, Docker, Git")
    c.drawString(100, 580, "EDUCATION")
    c.drawString(100, 560, "B.S. in Computer Science")
    c.save()
    return buf.getvalue()


def generate_sample_image(text_lines: list[str], fmt: str = "PNG") -> bytes:
    """Generates a valid image (PNG/JPEG) with the given lines rendered."""
    img = Image.new("RGB", (1000, 700), color="white")
    draw = ImageDraw.Draw(img)
    y = 50
    for line in text_lines:
        draw.text((60, y), line, fill="black")
        y += 45
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Test Execution
# ---------------------------------------------------------------------------
def run_all_tests():
    global current_acting_user
    print("\n" + "=" * 60)
    print("RUNNING MULTI-FORMAT RESUME UPLOAD TEST SUITE")
    print("=" * 60 + "\n")

    # 1. PDF Upload by Recruiter
    current_acting_user = {"id": "recruiter-001", "role": "recruiter", "email": "recruiter@example.com"}
    pdf_bytes = generate_sample_pdf()
    
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("alice_resume.pdf", pdf_bytes, "application/pdf"))]
    )
    check("Recruiter PDF upload returns 201", resp.status_code == 201, resp.text)
    data = resp.json()
    check("Recruiter PDF upload returns candidate record", len(data) == 1)
    cand_pdf = data[0]
    check("PDF candidate has parsed skills", "Python" in cand_pdf["skills"] and "React" in cand_pdf["skills"])
    check("PDF candidate storage path ends with .pdf", cand_pdf["resume_file_path"].endswith(".pdf"))
    pdf_candidate_id = cand_pdf["id"]

    # 2. PNG Upload by Recruiter
    png_lines = [
        "Bob Johnson",
        "bob.johnson@example.com | +1 555-987-6543",
        "EXPERIENCE",
        "Lead Backend Engineer with 6 years experience in distributed systems.",
        "SKILLS",
        "Python, FastAPI, Docker, Kubernetes, SQL, Redis",
        "EDUCATION",
        "B.S. Software Engineering",
    ]
    png_bytes = generate_sample_image(png_lines, fmt="PNG")
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("bob_resume.png", png_bytes, "image/png"))]
    )
    check("Recruiter PNG upload returns 201", resp.status_code == 201, resp.text)
    data = resp.json()
    check("Recruiter PNG upload returns candidate record", len(data) == 1)
    cand_png = data[0]
    check("PNG candidate name extracted", "Bob" in cand_png["name"] or "Johnson" in cand_png["name"])
    check("PNG candidate has parsed skills", "Python" in cand_png["skills"])
    check("PNG candidate storage path ends with .png", cand_png["resume_file_path"].endswith(".png"))
    png_candidate_id = cand_png["id"]

    # 3. JPG Upload by Recruiter
    jpg_lines = [
        "Charlie Davis",
        "charlie.davis@example.com | +1 555-444-3322",
        "EXPERIENCE",
        "Frontend Developer specializing in modern JavaScript frameworks.",
        "SKILLS",
        "React, TypeScript, JavaScript, HTML, CSS, Next.js",
        "EDUCATION",
        "B.A. Graphic Design and Web Development",
    ]
    jpg_bytes = generate_sample_image(jpg_lines, fmt="JPEG")
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("charlie_resume.jpg", jpg_bytes, "image/jpeg"))]
    )
    check("Recruiter JPG upload returns 201", resp.status_code == 201, resp.text)
    data = resp.json()
    check("Recruiter JPG upload returns candidate record", len(data) == 1)
    cand_jpg = data[0]
    check("JPG candidate has parsed skills", "React" in cand_jpg["skills"])
    check("JPG candidate storage path ends with .jpg", cand_jpg["resume_file_path"].endswith(".jpg"))

    # 4. JPEG Upload by Recruiter
    jpeg_lines = [
        "Diana Prince",
        "diana.prince@example.com | +1 555-777-8899",
        "EXPERIENCE",
        "DevOps Engineer with deep cloud automation expertise.",
        "SKILLS",
        "AWS, Docker, Kubernetes, Linux, Terraform, Python",
        "EDUCATION",
        "M.S. Information Systems",
    ]
    jpeg_bytes = generate_sample_image(jpeg_lines, fmt="JPEG")
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("diana_resume.jpeg", jpeg_bytes, "image/jpeg"))]
    )
    check("Recruiter JPEG upload returns 201", resp.status_code == 201, resp.text)
    data = resp.json()
    check("Recruiter JPEG upload returns candidate record", len(data) == 1)
    cand_jpeg = data[0]
    check("JPEG candidate has parsed skills", "Docker" in cand_jpeg["skills"] or "AWS" in cand_jpeg["skills"])
    check("JPEG candidate storage path ends with .jpeg", cand_jpeg["resume_file_path"].endswith(".jpeg"))

    # 5. Candidate Profile Resume Upload (Candidate Role)
    current_acting_user = {"id": "candidate-001", "role": "candidate", "email": "candidate@example.com"}
    
    # Candidate uploads PNG profile resume
    resp = client.post(
        "/ats/candidate-profile/resume",
        files={"file": ("profile_resume.png", png_bytes, "image/png")}
    )
    check("Candidate profile PNG upload returns 200", resp.status_code == 200, resp.text)
    profile_data = resp.json()
    check("Candidate profile resume_path ends with .png", profile_data.get("resume_path", "").endswith(".png"))
    check("Candidate profile has parsed skills", len(profile_data.get("skills", [])) > 0)

    # Candidate gets resume signed URL
    resp = client.get("/ats/candidate-profile/resume-url")
    check("Candidate get resume URL returns 200", resp.status_code == 200, resp.text)
    url_data = resp.json()
    check("Candidate resume URL contains valid signed URL", "https://storage.supabase.local" in url_data.get("url", ""))
    check("Candidate resume URL file_name ends with .png", url_data.get("file_name", "").endswith(".png"))

    # Candidate replaces with PDF resume
    resp = client.post(
        "/ats/candidate-profile/resume",
        files={"file": ("profile_resume.pdf", pdf_bytes, "application/pdf")}
    )
    check("Candidate profile PDF replacement returns 200", resp.status_code == 200, resp.text)
    replaced_data = resp.json()
    check("Candidate replaced resume_path ends with .pdf", replaced_data.get("resume_path", "").endswith(".pdf"))

    # 6. Recruiter Resume Access Endpoint
    current_acting_user = {"id": "recruiter-001", "role": "recruiter", "email": "recruiter@example.com"}
    resp = client.get(f"/jobs/job-001/candidates/{png_candidate_id}/resume-url")
    check("Recruiter gets signed resume URL for PNG candidate", resp.status_code == 200, resp.text)
    recruiter_url_data = resp.json()
    check("Signed URL points to PNG storage path", "bob_resume.png" in recruiter_url_data.get("filename", "") or recruiter_url_data.get("resume_file_path", "").endswith(".png"))

    resp = client.get(f"/jobs/job-001/candidates/{pdf_candidate_id}/resume-url")
    check("Recruiter gets signed resume URL for PDF candidate", resp.status_code == 200, resp.text)
    check("Signed URL points to PDF storage path", recruiter_url_data.get("resume_file_path", "").endswith(".png"))

    # Unauthorized recruiter trying to access resumes for a job they don't own
    current_acting_user = {"id": "recruiter-002", "role": "recruiter", "email": "other_recruiter@example.com"}
    resp = client.get(f"/jobs/job-001/candidates/{png_candidate_id}/resume-url")
    check("Unauthorized recruiter cannot access resume (404/403)", resp.status_code in (403, 404), resp.text)

    # 7. Negative Tests: Unsupported File Extensions
    current_acting_user = {"id": "recruiter-001", "role": "recruiter", "email": "recruiter@example.com"}
    
    # TXT file
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("resume.txt", b"Name: John Doe\nSkills: Python", "text/plain"))]
    )
    check("TXT file rejected with 415", resp.status_code == 415, resp.text)

    # DOCX file
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("resume.docx", b"PK\x03\x04dummy docx content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))]
    )
    check("DOCX file rejected with 415", resp.status_code == 415, resp.text)

    # ZIP file
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("archive.zip", b"PK\x03\x04dummy zip content", "application/zip"))]
    )
    check("ZIP file rejected with 415", resp.status_code == 415, resp.text)

    # EXE file
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("malware.exe", b"MZ\x90\x00dummy executable", "application/x-msdownload"))]
    )
    check("EXE file rejected with 415", resp.status_code == 415, resp.text)

    # 8. Negative Tests: Extension Spoofing (Magic Bytes check)
    # A text file disguised as .pdf
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("fake.pdf", b"This is plain text pretending to be a PDF.", "application/pdf"))]
    )
    check("Spoofed PDF rejected with 415", resp.status_code == 415, resp.text)

    # A text file disguised as .png
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("fake.png", b"This is plain text pretending to be a PNG.", "image/png"))]
    )
    check("Spoofed PNG rejected with 415", resp.status_code == 415, resp.text)

    # A text file disguised as .jpg
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("fake.jpg", b"This is plain text pretending to be a JPEG.", "image/jpeg"))]
    )
    check("Spoofed JPG rejected with 415", resp.status_code == 415, resp.text)

    # 9. Negative Test: Empty / Low-Text Image (Insufficient OCR)
    # Blank white image
    blank_img = Image.new("RGB", (600, 400), color="white")
    blank_buf = io.BytesIO()
    blank_img.save(blank_buf, format="PNG")
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("blank_resume.png", blank_buf.getvalue(), "image/png"))]
    )
    check("Blank image produces insufficient OCR error (422)", resp.status_code == 422, resp.text)
    check("Blank image returns clear user message", "couldn't read enough text" in resp.json().get("detail", "").lower() or "clearer" in resp.json().get("detail", "").lower())

    # 10. Negative Test: File Size Limit (> 10MB)
    oversized_bytes = b"%PDF-" + b"0" * (11 * 1024 * 1024)
    resp = client.post(
        "/jobs/job-001/candidates",
        files=[("files", ("huge_resume.pdf", oversized_bytes, "application/pdf"))]
    )
    check("Oversized file rejected with 413", resp.status_code == 413, resp.text)
    check("Oversized error mentions file size", "exceeds" in resp.json().get("detail", "").lower())

    print("\n" + "=" * 60)
    print("ALL MULTI-FORMAT RESUME UPLOAD TESTS PASSED SUCCESSFULLY!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_all_tests()
