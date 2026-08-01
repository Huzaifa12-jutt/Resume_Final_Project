from fastapi import APIRouter, Depends, HTTPException
from app.db.supabase_client import get_supabase
from app.routers.auth import current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def list_notifications(user=Depends(current_user)):
    return get_supabase().table("system_notifications").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute().data or []

@router.patch("/{notification_id}")
def mark_read(notification_id: str, user=Depends(current_user)):
    result = get_supabase().table("system_notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user["id"]).execute()
    if not result.data: raise HTTPException(404, "Notification not found")
    return result.data[0]

@router.delete("/{notification_id}", status_code=204)
def delete_notification(notification_id: str, user=Depends(current_user)):
    result = get_supabase().table("system_notifications").delete().eq("id", notification_id).eq("user_id", user["id"]).execute()
    if not result.data: raise HTTPException(404, "Notification not found")
