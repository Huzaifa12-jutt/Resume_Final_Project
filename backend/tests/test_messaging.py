"""
tests/test_messaging.py
------------------------
Comprehensive test suite for the TEEROP messaging system:
  - Candidate conversation listing
  - Recruiter conversation listing with job ownership enforcement
  - IDOR and cross-role authorization checks (403)
  - Get or create conversation idempotency
  - Sending messages (sender_id verified server-side)
  - Read receipts and unread counts
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from tests.fake_supabase import FakeSupabase
import app.db.supabase_client as supabase_client_module

# Setup fake DB
fake_db = FakeSupabase()
supabase_client_module.get_supabase = lambda: fake_db

# Patch chatbot so we don't call Groq
import app.services.chatbot as chatbot_module
class _FakeChatbot:
    def chat(self, *args, **kwargs): return "fake"
chatbot_module.get_chatbot = lambda: _FakeChatbot()

from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

# ---------------------------------------------------------------------------
# Setup Seed Data
# ---------------------------------------------------------------------------

# Recruiter 1
RECRUITER_1_ID = "recruiter-0001"
fake_db.table("users").insert({
    "id": RECRUITER_1_ID,
    "full_name": "Alice Recruiter",
    "email": "alice@company.com",
    "password_hash": "fake",
    "role": "recruiter",
    "email_verified": True,
    "is_active": True,
}).execute()
TOKEN_RECRUITER_1 = create_access_token(RECRUITER_1_ID, "recruiter")

# Recruiter 2 (unauthorized competitor)
RECRUITER_2_ID = "recruiter-0002"
fake_db.table("users").insert({
    "id": RECRUITER_2_ID,
    "full_name": "Bob Recruiter",
    "email": "bob@other.com",
    "password_hash": "fake",
    "role": "recruiter",
    "email_verified": True,
    "is_active": True,
}).execute()
TOKEN_RECRUITER_2 = create_access_token(RECRUITER_2_ID, "recruiter")

# Candidate 1
CANDIDATE_1_ID = "candidate-0001"
fake_db.table("users").insert({
    "id": CANDIDATE_1_ID,
    "full_name": "Charlie Candidate",
    "email": "charlie@gmail.com",
    "password_hash": "fake",
    "role": "candidate",
    "email_verified": True,
    "is_active": True,
}).execute()
TOKEN_CANDIDATE_1 = create_access_token(CANDIDATE_1_ID, "candidate")

# Candidate 2
CANDIDATE_2_ID = "candidate-0002"
fake_db.table("users").insert({
    "id": CANDIDATE_2_ID,
    "full_name": "David Candidate",
    "email": "david@gmail.com",
    "password_hash": "fake",
    "role": "candidate",
    "email_verified": True,
    "is_active": True,
}).execute()
TOKEN_CANDIDATE_2 = create_access_token(CANDIDATE_2_ID, "candidate")

# Company 1
fake_db.table("companies").insert({
    "id": "company-0001",
    "owner_id": RECRUITER_1_ID,
    "company_name": "TEEROP Tech",
}).execute()

# Job 1 owned by Recruiter 1
JOB_1_ID = "job-0001"
fake_db.table("jobs").insert({
    "id": JOB_1_ID,
    "title": "Senior Full-Stack Engineer",
    "description": "Build high-performance ATS features.",
    "company_id": "company-0001",
    "recruiter_id": RECRUITER_1_ID,
    "created_by": RECRUITER_1_ID,
    "status": "active",
}).execute()

# Application 1: Candidate 1 applied to Job 1
APP_1_ID = "app-0001"
fake_db.table("applications").insert({
    "id": APP_1_ID,
    "candidate_id": CANDIDATE_1_ID,
    "job_id": JOB_1_ID,
    "status": "Applied",
}).execute()

# Application 2: Candidate 2 applied to Job 1
APP_2_ID = "app-0002"
fake_db.table("applications").insert({
    "id": APP_2_ID,
    "candidate_id": CANDIDATE_2_ID,
    "job_id": JOB_1_ID,
    "status": "Applied",
}).execute()


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def run_all_tests():
    print("=== STARTING TEEROP MESSAGING TESTS ===")

    # 1. Candidate 1 lists conversations before any exists
    r = client.get("/messaging/conversations", headers=auth_headers(TOKEN_CANDIDATE_1))
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert len(r.json()) == 0, f"Expected 0, got {len(r.json())}"
    print("[PASS] 1. Candidate conversation listing when empty passed")

    # 2. Candidate 1 creates conversation for their application
    r = client.post(f"/messaging/conversations/application/{APP_1_ID}", headers=auth_headers(TOKEN_CANDIDATE_1))
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    conv = r.json()
    conv_id = conv["id"]
    assert conv["application_id"] == APP_1_ID
    assert conv["candidate_id"] == CANDIDATE_1_ID
    assert conv["recruiter_id"] == RECRUITER_1_ID
    print("[PASS] 2. Candidate creates conversation for application passed")

    # 3. Idempotency: Calling create again for APP_1_ID returns the exact same conversation
    r = client.post(f"/messaging/conversations/application/{APP_1_ID}", headers=auth_headers(TOKEN_CANDIDATE_1))
    assert r.status_code == 200
    assert r.json()["id"] == conv_id
    print("[PASS] 3. Conversation creation idempotency passed")

    # 4. Recruiter 2 (who does NOT own Job 1) attempts to get or create conversation for APP_1_ID -> 403 Forbidden
    r = client.post(f"/messaging/conversations/application/{APP_1_ID}", headers=auth_headers(TOKEN_RECRUITER_2))
    assert r.status_code == 403, f"Expected 403, got {r.status_code}"
    print("[PASS] 4. Unauthorized recruiter blocked from application conversation passed")

    # 5. Candidate 2 attempts to get or create conversation for Candidate 1's application -> 403 Forbidden
    r = client.post(f"/messaging/conversations/application/{APP_1_ID}", headers=auth_headers(TOKEN_CANDIDATE_2))
    assert r.status_code == 403, f"Expected 403, got {r.status_code}"
    print("[PASS] 5. Unauthorized candidate blocked from another candidate's application passed")

    # 6. Recruiter 1 (owner) can list conversations and sees Conversation 1
    r = client.get("/messaging/conversations", headers=auth_headers(TOKEN_RECRUITER_1))
    assert r.status_code == 200
    convs = r.json()
    assert len(convs) == 1
    assert convs[0]["id"] == conv_id
    print("[PASS] 6. Recruiter 1 lists conversations for owned jobs passed")

    # 7. Recruiter 2 lists conversations -> sees 0 conversations
    r = client.get("/messaging/conversations", headers=auth_headers(TOKEN_RECRUITER_2))
    assert r.status_code == 200
    assert len(r.json()) == 0
    print("[PASS] 7. Recruiter 2 isolated from Recruiter 1's conversations passed")

    # 8. Candidate 1 sends a message
    r = client.post(
        f"/messaging/conversations/{conv_id}/messages",
        json={"message": "Hello, thank you for considering my application!"},
        headers=auth_headers(TOKEN_CANDIDATE_1),
    )
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    msg_1 = r.json()
    assert msg_1["sender_id"] == CANDIDATE_1_ID
    assert msg_1["message"] == "Hello, thank you for considering my application!"
    assert msg_1["is_read"] is False
    print("[PASS] 8. Candidate sends message with server-side sender_id passed")

    # 9. Recruiter 2 attempts to send message to conv_id -> 403 Forbidden
    r = client.post(
        f"/messaging/conversations/{conv_id}/messages",
        json={"message": "I am an unauthorized party!"},
        headers=auth_headers(TOKEN_RECRUITER_2),
    )
    assert r.status_code == 403
    print("[PASS] 9. Unauthorized recruiter blocked from sending message passed")

    # 10. Candidate 2 attempts to send message to conv_id -> 403 Forbidden
    r = client.post(
        f"/messaging/conversations/{conv_id}/messages",
        json={"message": "I am a different candidate!"},
        headers=auth_headers(TOKEN_CANDIDATE_2),
    )
    assert r.status_code == 403
    print("[PASS] 10. Unauthorized candidate blocked from sending message passed")

    # 11. Recruiter 1 checks unread count -> 1 unread message
    r = client.get("/messaging/unread-count", headers=auth_headers(TOKEN_RECRUITER_1))
    assert r.status_code == 200
    assert r.json()["unread_count"] == 1
    print("[PASS] 11. Recruiter unread count calculation passed")

    # 12. Candidate 1 checks unread count -> 0 (own messages do not count as unread)
    r = client.get("/messaging/unread-count", headers=auth_headers(TOKEN_CANDIDATE_1))
    assert r.status_code == 200
    assert r.json()["unread_count"] == 0
    print("[PASS] 12. Sender's own messages do not count towards unread passed")

    # 13. Recruiter 1 opens conversation, reads messages
    r = client.get(f"/messaging/conversations/{conv_id}/messages", headers=auth_headers(TOKEN_RECRUITER_1))
    assert r.status_code == 200
    messages = r.json()
    assert len(messages) == 1
    assert messages[0]["id"] == msg_1["id"]
    print("[PASS] 13. Recruiter fetches conversation messages passed")

    # 14. Recruiter 1 marks conversation as read
    r = client.post(f"/messaging/conversations/{conv_id}/read", headers=auth_headers(TOKEN_RECRUITER_1))
    assert r.status_code == 200
    assert r.json()["success"] is True

    # Check unread count is now 0
    r = client.get("/messaging/unread-count", headers=auth_headers(TOKEN_RECRUITER_1))
    assert r.json()["unread_count"] == 0
    print("[PASS] 14. Mark as read updates unread count passed")

    # 15. Recruiter 1 replies
    r = client.post(
        f"/messaging/conversations/{conv_id}/messages",
        json={"message": "We loved your resume. Are you free for an interview tomorrow?"},
        headers=auth_headers(TOKEN_RECRUITER_1),
    )
    assert r.status_code == 201
    msg_2 = r.json()
    assert msg_2["sender_id"] == RECRUITER_1_ID
    print("[PASS] 15. Recruiter replies with server-side sender_id passed")

    # 16. Candidate 1 checks unread count -> 1
    r = client.get("/messaging/unread-count", headers=auth_headers(TOKEN_CANDIDATE_1))
    assert r.json()["unread_count"] == 1
    print("[PASS] 16. Candidate sees recruiter's reply as unread passed")

    # 17. Candidate 1 marks read
    client.post(f"/messaging/conversations/{conv_id}/read", headers=auth_headers(TOKEN_CANDIDATE_1))
    r = client.get("/messaging/unread-count", headers=auth_headers(TOKEN_CANDIDATE_1))
    assert r.json()["unread_count"] == 0
    print("[PASS] 17. Candidate marks recruiter message as read passed")

    print("\n=== ALL 17 TEEROP MESSAGING TESTS PASSED SUCCESSFULLY! ===\n")


if __name__ == "__main__":
    run_all_tests()
