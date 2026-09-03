"""
routers/messaging.py
---------------------
REST API endpoints for the TEEROP messaging system.

All authorization is enforced server-side:
  - sender_id is never accepted from the frontend
  - recruiter ownership verified via job ownership
  - candidate identity verified via conversation.candidate_id
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.routers.auth import current_user
from app.db.models import MessageCreate, MessageResponse, ConversationResponse, UnreadCountResponse
from app.services import messaging_service

router = APIRouter(prefix="/messaging", tags=["Messaging"])


# ---------------------------------------------------------------------------
# List conversations (role-aware)
# ---------------------------------------------------------------------------
@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(user=Depends(current_user)):
    """
    List conversations for the authenticated user.
    - Candidate: returns conversations where candidate_id == user.id
    - Recruiter: returns conversations for jobs owned by the recruiter
    """
    if user["role"] == "candidate":
        return messaging_service.get_conversations_for_candidate(user["id"])
    elif user["role"] == "recruiter":
        return messaging_service.get_conversations_for_recruiter(user["id"])
    else:
        raise HTTPException(403, "Invalid role")


# ---------------------------------------------------------------------------
# Get single conversation
# ---------------------------------------------------------------------------
@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, user=Depends(current_user)):
    """Get a single conversation with authorization check."""
    conv = messaging_service.get_conversation_with_auth(conversation_id, user)
    # Enrich with metadata
    enriched = messaging_service._enrich_conversations([conv], user["id"])
    return enriched[0] if enriched else conv


# ---------------------------------------------------------------------------
# Get messages for a conversation
# ---------------------------------------------------------------------------
@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
def get_messages(
    conversation_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    before: Optional[str] = Query(default=None),
    user=Depends(current_user),
):
    """
    Get paginated messages for a conversation.
    Authorization is checked before returning messages.
    Messages are returned in ascending chronological order.
    """
    # Authorize access
    messaging_service.get_conversation_with_auth(conversation_id, user)

    return messaging_service.get_messages(conversation_id, limit=limit, before=before)


# ---------------------------------------------------------------------------
# Get or create conversation for an application
# ---------------------------------------------------------------------------
@router.post("/conversations/application/{application_id}", response_model=ConversationResponse)
def get_or_create_conversation(application_id: str, user=Depends(current_user)):
    """
    Idempotent: find or create a conversation for the given application.

    The backend determines candidate_id and recruiter_id from the application
    and job ownership. The frontend never provides these values.

    Repeated calls return the same conversation (unique constraint on application_id).
    """
    return messaging_service.get_or_create_conversation(application_id, user)


# ---------------------------------------------------------------------------
# Send message
# ---------------------------------------------------------------------------
@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
def send_message(conversation_id: str, payload: MessageCreate, user=Depends(current_user)):
    """
    Send a message in a conversation.

    - sender_id is set server-side to current_user.id (never from frontend)
    - Only conversation participants can send messages
    - Message is trimmed of leading/trailing whitespace
    """
    # Authorize: must be a participant
    messaging_service.get_conversation_with_auth(conversation_id, user)

    # Trim and validate
    text = payload.trimmed_message
    if not text:
        raise HTTPException(400, "Message cannot be empty")

    return messaging_service.send_message(conversation_id, user["id"], text)


# ---------------------------------------------------------------------------
# Mark messages as read
# ---------------------------------------------------------------------------
@router.post("/conversations/{conversation_id}/read")
def mark_conversation_read(conversation_id: str, user=Depends(current_user)):
    """
    Mark all messages from the other participant as read.
    Only affects unread messages not sent by the current user.
    """
    messaging_service.get_conversation_with_auth(conversation_id, user)
    return messaging_service.mark_conversation_read(conversation_id, user["id"])


# ---------------------------------------------------------------------------
# Unread count
# ---------------------------------------------------------------------------
@router.get("/unread-count", response_model=UnreadCountResponse)
def unread_count(user=Depends(current_user)):
    """
    Get the total unread message count for the authenticated user
    across all accessible conversations.
    """
    count = messaging_service.get_unread_count_for_user(user)
    return UnreadCountResponse(unread_count=count)
