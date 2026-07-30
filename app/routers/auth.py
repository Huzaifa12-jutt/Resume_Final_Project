"""Authentication routes. Email delivery is handled via app.core.email; verification codes are never returned."""
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.core.email import send_verification_email, send_password_reset_email
from app.db.supabase_client import get_supabase
from app.db.models import AuthRegister, AuthLogin, VerifyEmail, AuthToken, UserResponse, EmailOnly, ResetPassword, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer = HTTPBearer()

RESEND_COOLDOWN_SECONDS = 60


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    claims = decode_access_token(credentials.credentials)
    result = get_supabase().table("users").select("*").eq("id", claims["sub"]).execute()
    if not result.data or not result.data[0].get("is_active", True): raise HTTPException(401, "Account is unavailable")
    return result.data[0]

def require_role(role: str):
    def dependency(user=Depends(current_user)):
        if user["role"] != role: raise HTTPException(403, "You do not have permission for this resource")
        return user
    return dependency

@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: AuthRegister, background_tasks: BackgroundTasks):
    db = get_supabase()
    if db.table("users").select("id").eq("email", payload.email.lower()).execute().data: raise HTTPException(409, "Email is already registered")
    code = f"{secrets.randbelow(1_000_000):06d}"
    row = {"full_name": payload.full_name, "email": payload.email.lower(), "password_hash": hash_password(payload.password), "role": payload.role, "verification_code": code, "verification_expiry": (datetime.now(timezone.utc)+timedelta(minutes=15)).isoformat(), "email_verified": False, "is_active": True}
    result = db.table("users").insert(row).execute()
    background_tasks.add_task(send_verification_email, payload.email.lower(), code)
    return result.data[0]

@router.post("/verify-email", response_model=AuthToken)
def verify_email(payload: VerifyEmail):
    db=get_supabase(); result=db.table("users").select("*").eq("email", payload.email.lower()).eq("verification_code", payload.code).execute()
    if not result.data: raise HTTPException(400, "Invalid verification code")
    user=result.data[0]
    if datetime.fromisoformat(user["verification_expiry"].replace("Z", "+00:00")) < datetime.now(timezone.utc): raise HTTPException(400, "Verification code expired")
    db.table("users").update({"email_verified": True, "verification_code": None, "verification_expiry": None}).eq("id",user["id"]).execute()
    return AuthToken(access_token=create_access_token(user["id"],user["role"]), role=user["role"])

@router.post("/login", response_model=AuthToken)
def login(payload: AuthLogin):
    result=get_supabase().table("users").select("*").eq("email",payload.email.lower()).execute()
    if not result.data or not verify_password(payload.password,result.data[0]["password_hash"]): raise HTTPException(401,"Invalid email or password")
    user=result.data[0]
    if not user.get("email_verified"): raise HTTPException(403,"Verify your email before signing in")
    return AuthToken(access_token=create_access_token(user["id"],user["role"]), role=user["role"])

@router.get("/me", response_model=UserResponse)
def me(user=Depends(current_user)): return user

@router.patch('/me', response_model=UserResponse)
def update_me(payload: UserUpdate, user=Depends(current_user)):
    data=payload.model_dump(exclude_none=True)
    if not data: raise HTTPException(400,'Provide at least one field to update')
    return get_supabase().table('users').update(data).eq('id',user['id']).execute().data[0]

@router.post('/resend-code', status_code=204)
def resend_code(payload: EmailOnly, background_tasks: BackgroundTasks):
    db=get_supabase(); result=db.table('users').select('*').eq('email',payload.email.lower()).execute()
    if not result.data: return
    user=result.data[0]
    existing_expiry = user.get('verification_expiry')
    if existing_expiry:
        expiry_dt = datetime.fromisoformat(existing_expiry.replace('Z','+00:00'))
        issued_at = expiry_dt - timedelta(minutes=15)
        if datetime.now(timezone.utc) - issued_at < timedelta(seconds=RESEND_COOLDOWN_SECONDS):
            raise HTTPException(429, "Please wait before requesting another code")
    code=f"{secrets.randbelow(1_000_000):06d}"
    db.table('users').update({'verification_code':code,'verification_expiry':(datetime.now(timezone.utc)+timedelta(minutes=15)).isoformat()}).eq('id',user['id']).execute()
    background_tasks.add_task(send_verification_email, payload.email.lower(), code)

@router.post('/forgot-password', status_code=204)
def forgot_password(payload: EmailOnly, background_tasks: BackgroundTasks):
    db=get_supabase(); result=db.table('users').select('*').eq('email',payload.email.lower()).execute()
    if not result.data: return
    code=f"{secrets.randbelow(1_000_000):06d}"
    db.table('users').update({'password_reset_code':code,'password_reset_expiry':(datetime.now(timezone.utc)+timedelta(minutes=15)).isoformat()}).eq('id',result.data[0]['id']).execute()
    background_tasks.add_task(send_password_reset_email, payload.email.lower(), code)

@router.post('/reset-password', status_code=204)
def reset_password(payload: ResetPassword):
    db=get_supabase(); result=db.table('users').select('*').eq('email',payload.email.lower()).eq('password_reset_code',payload.code).execute()
    if not result.data: raise HTTPException(400,'Invalid reset code')
    user=result.data[0]
    if datetime.fromisoformat(user['password_reset_expiry'].replace('Z','+00:00')) < datetime.now(timezone.utc): raise HTTPException(400,'Reset code expired')
    db.table('users').update({'password_hash':hash_password(payload.password),'password_reset_code':None,'password_reset_expiry':None}).eq('id',user['id']).execute()

@router.post('/logout', status_code=204)
def logout(user=Depends(current_user)):
    # Access tokens are stateless; clients discard them. Add a token denylist if
    # immediate server-side invalidation is required.
    return None