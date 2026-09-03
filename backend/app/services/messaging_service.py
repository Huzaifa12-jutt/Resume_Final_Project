"""
services/messaging_service.py
-------------------------------
Business logic for the TEEROP messaging system.

Enforces:
  - Candidate can only access conversations where candidate_id == user.id
  - Recruiter can only access conversations for jobs they own
  - Sender identity is always determined server-side
  - One conversation per application (idempotent create)
"""

from datetime import datetime, timezone
from fastapi import HTTPException
from app.db.supabase_client import get_supabase


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _verify_job_ownership(job_id: str, recruiter_id: str):
    """Verify the recruiter owns the job. Raises 403 if not."""
    result = get_supabase().table("jobs").select("id").eq("id", job_id).eq("recruiter_id", recruiter_id).execute()
    if not result.data:
        raise HTTPException(403, "You do not have access to this conversation")


def _enrich_conversations(conversations: list, perspective_user_id: str) -> list:
    """
    Enrich raw conversation rows with participant names, job title,
    company name, last message text, and unread count.
    """
    if not conversations:
        return []

    db = get_supabase()

    # Collect IDs for batch lookups
    candidate_ids = list({c["candidate_id"] for c in conversations if c.get("candidate_id")})
    recruiter_ids = list({c["recruiter_id"] for c in conversations if c.get("recruiter_id")})
    job_ids = list({c["job_id"] for c in conversations if c.get("job_id")})
    conv_ids = [c["id"] for c in conversations]

    # Batch fetch users
    user_map = {}
    all_user_ids = list(set(candidate_ids + recruiter_ids))
    if all_user_ids:
        users = db.table("users").select("id, full_name, email").in_("id", all_user_ids).execute().data or []
        user_map = {u["id"]: u for u in users}

    # Batch fetch jobs
    job_map = {}
    if job_ids:
        jobs = db.table("jobs").select("id, title, company_id").in_("id", job_ids).execute().data or []
        job_map = {j["id"]: j for j in jobs}

    # Batch fetch companies
    company_ids = list({j.get("company_id") for j in job_map.values() if j.get("company_id")})
    company_map = {}
    if company_ids:
        companies = db.table("companies").select("id, company_name").in_("id", company_ids).execute().data or []
        company_map = {c["id"]: c for c in companies}

    # Batch fetch last messages (one per conversation)
    last_messages = {}
    if conv_ids:
        for cid in conv_ids:
            msg_result = db.table("messages").select("message").eq("conversation_id", cid).order("created_at", desc=True).limit(1).execute()
            if msg_result.data:
                last_messages[cid] = msg_result.data[0]["message"]

    # Batch fetch unread counts (messages NOT sent by perspective_user_id AND is_read=false)
    unread_counts = {}
    if conv_ids:
        for cid in conv_ids:
            unread_result = (
                db.table("messages")
                .select("id", count="exact")
                .eq("conversation_id", cid)
                .neq("sender_id", perspective_user_id)
                .eq("is_read", False)
                .execute()
            )
            unread_counts[cid] = unread_result.count or 0

    # Assemble enriched results
    enriched = []
    for c in conversations:
        candidate = user_map.get(c.get("candidate_id"), {})
        recruiter = user_map.get(c.get("recruiter_id"), {})
        job = job_map.get(c.get("job_id"), {})
        company = company_map.get(job.get("company_id"), {})

        enriched.append({
            **c,
            "candidate_name": candidate.get("full_name"),
            "recruiter_name": recruiter.get("full_name"),
            "job_title": job.get("title"),
            "company_name": company.get("company_name"),
            "last_message": last_messages.get(c["id"]),
            "unread_count": unread_counts.get(c["id"], 0),
        })

    return enriched


# ---------------------------------------------------------------------------
# Conversation listing
# ---------------------------------------------------------------------------

def get_conversations_for_candidate(user_id: str) -> list:
    """List conversations where candidate_id == user_id."""
    db = get_supabase()
    result = (
        db.table("conversations")
        .select("*")
        .eq("candidate_id", user_id)
        .order("last_message_at", desc=True)
        .execute()
    )
    return _enrich_conversations(result.data or [], user_id)


def get_conversations_for_recruiter(user_id: str) -> list:
    """
    List conversations for jobs owned by the recruiter.
    Authoritative check: conversation.job_id → job.recruiter_id == user_id
    """
    db = get_supabase()

    # Get all job IDs owned by this recruiter
    jobs = db.table("jobs").select("id").eq("recruiter_id", user_id).execute().data or []
    job_ids = [j["id"] for j in jobs]

    if not job_ids:
        return []

    result = (
        db.table("conversations")
        .select("*")
        .in_("job_id", job_ids)
        .order("last_message_at", desc=True)
        .execute()
    )
    return _enrich_conversations(result.data or [], user_id)


# ---------------------------------------------------------------------------
# Single conversation
# ---------------------------------------------------------------------------

def get_conversation(conversation_id: str) -> dict:
    """Fetch a single conversation row. Returns dict or raises 404."""
    db = get_supabase()
    result = db.table("conversations").select("*").eq("id", conversation_id).execute()
    if not result.data:
        raise HTTPException(404, "Conversation not found")
    return result.data[0]


def authorize_conversation_access(conversation: dict, user: dict):
    """
    Verify the user is a participant AND (if recruiter) owns the job.
    Raises 403 on failure.
    """
    user_id = user["id"]
    role = user["role"]

    if role == "candidate":
        if conversation.get("candidate_id") != user_id:
            raise HTTPException(403, "You do not have access to this conversation")
    elif role == "recruiter":
        if conversation.get("recruiter_id") != user_id:
            raise HTTPException(403, "You do not have access to this conversation")
        # Additional ownership check via job
        _verify_job_ownership(conversation["job_id"], user_id)
    else:
        raise HTTPException(403, "You do not have access to this conversation")


def get_conversation_with_auth(conversation_id: str, user: dict) -> dict:
    """Get conversation and verify access in one call."""
    conv = get_conversation(conversation_id)
    authorize_conversation_access(conv, user)
    return conv


# ---------------------------------------------------------------------------
# Get or create conversation
# ---------------------------------------------------------------------------

def get_or_create_conversation(application_id: str, user: dict) -> dict:
    """
    Idempotent: find or create a conversation for the given application.

    Steps:
    1. Load application
    2. Load job
    3. Determine candidate and recruiter (job owner)
    4. Verify the authenticated user is either the candidate or the recruiter
    5. Find existing conversation by application_id
    6. If exists, return it
    7. If not, create it
    """
    db = get_supabase()

    # 1. Load application
    app_result = db.table("applications").select("*").eq("id", application_id).execute()
    if not app_result.data:
        raise HTTPException(404, "Application not found")
    application = app_result.data[0]

    # 2. Load job
    job_id = application["job_id"]
    job_result = db.table("jobs").select("*").eq("id", job_id).execute()
    if not job_result.data:
        raise HTTPException(404, "Job not found")
    job = job_result.data[0]

    # 3. Determine participants
    candidate_id = application["candidate_id"]
    recruiter_id = job.get("recruiter_id")
    if not recruiter_id:
        raise HTTPException(400, "Job does not have an assigned recruiter")

    # 4. Verify the authenticated user is a participant
    user_id = user["id"]
    if user_id != candidate_id and user_id != recruiter_id:
        raise HTTPException(403, "You do not have access to this application")

    # 5. Check for existing conversation
    existing = db.table("conversations").select("*").eq("application_id", application_id).execute()
    if existing.data:
        conv = existing.data[0]
        return _enrich_conversations([conv], user_id)[0]

    # 6. Create new conversation
    new_conv = {
        "application_id": application_id,
        "job_id": job_id,
        "candidate_id": candidate_id,
        "recruiter_id": recruiter_id,
        "status": "active",
    }

    try:
        result = db.table("conversations").insert(new_conv).execute()
        if not result.data:
            raise HTTPException(500, "Failed to create conversation")
        conv = result.data[0]
        return _enrich_conversations([conv], user_id)[0]
    except Exception as e:
        # Handle race condition: unique constraint violation
        error_msg = str(e).lower()
        if "unique" in error_msg or "duplicate" in error_msg or "23505" in error_msg:
            existing = db.table("conversations").select("*").eq("application_id", application_id).execute()
            if existing.data:
                return _enrich_conversations([existing.data[0]], user_id)[0]
        raise HTTPException(500, "Failed to create conversation")


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

def get_messages(conversation_id: str, limit: int = 50, before: str = None) -> list:
    """
    Get messages for a conversation, ordered by created_at ASC.
    Supports cursor-based pagination via 'before' (message ID).
    """
    db = get_supabase()

    query = db.table("messages").select("*").eq("conversation_id", conversation_id)

    if before:
        # Get the created_at of the 'before' message for cursor pagination
        before_msg = db.table("messages").select("created_at").eq("id", before).execute()
        if before_msg.data:
            query = query.lt("created_at", before_msg.data[0]["created_at"])

    # Get the most recent 'limit' messages, then reverse for ASC order
    messages = (
        query
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
        .data or []
    )

    # Reverse to get ascending order
    messages.reverse()
    return messages


def send_message(conversation_id: str, user_id: str, message_text: str) -> dict:
    """
    Insert a message. sender_id is always set server-side.
    The DB trigger will update conversations.last_message_at.
    """
    db = get_supabase()

    row = {
        "conversation_id": conversation_id,
        "sender_id": user_id,
        "message": message_text,
        "is_read": False,
    }

    result = db.table("messages").insert(row).execute()
    if not result.data:
        raise HTTPException(500, "Failed to send message")
    return result.data[0]


# ---------------------------------------------------------------------------
# Read status
# ---------------------------------------------------------------------------

def mark_conversation_read(conversation_id: str, user_id: str):
    """
    Mark all messages NOT sent by the current user as read.
    Only affects unread messages in this conversation.
    """
    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    db.table("messages").update({
        "is_read": True,
        "read_at": now,
    }).eq("conversation_id", conversation_id).neq("sender_id", user_id).eq("is_read", False).execute()

    return {"success": True}


# ---------------------------------------------------------------------------
# Unread count
# ---------------------------------------------------------------------------

def get_unread_count_for_user(user: dict) -> int:
    """
    Count unread messages across all conversations accessible by the user.
    """
    db = get_supabase()
    user_id = user["id"]
    role = user["role"]

    if role == "candidate":
        # Get all conversation IDs for this candidate
        convs = db.table("conversations").select("id").eq("candidate_id", user_id).execute().data or []
    elif role == "recruiter":
        # Get all job IDs owned by this recruiter
        jobs = db.table("jobs").select("id").eq("recruiter_id", user_id).execute().data or []
        job_ids = [j["id"] for j in jobs]
        if not job_ids:
            return 0
        convs = db.table("conversations").select("id").in_("job_id", job_ids).execute().data or []
    else:
        return 0

    conv_ids = [c["id"] for c in convs]
    if not conv_ids:
        return 0

    # Count unread messages not sent by the user
    total = 0
    for cid in conv_ids:
        result = (
            db.table("messages")
            .select("id", count="exact")
            .eq("conversation_id", cid)
            .neq("sender_id", user_id)
            .eq("is_read", False)
            .execute()
        )
        total += result.count or 0

    return total
