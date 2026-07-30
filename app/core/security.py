"""Small dependency-free password and HS256 JWT helpers."""
import base64, hashlib, hmac, json, os, time
from fastapi import HTTPException, status
from app.core.config import get_settings

def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${_b64(salt)}${_b64(digest)}"

def verify_password(password: str, encoded: str) -> bool:
    try:
        _, salt, expected = encoded.split("$")
        actual = hashlib.scrypt(password.encode(), salt=base64.urlsafe_b64decode(salt + "=="), n=2**14, r=8, p=1)
        return hmac.compare_digest(_b64(actual), expected)
    except (ValueError, TypeError): return False

def create_access_token(user_id: str, role: str) -> str:
    settings = get_settings()
    if not settings.JWT_SECRET: raise HTTPException(503, "JWT_SECRET is not configured")
    header = _b64(json.dumps({"alg":"HS256","typ":"JWT"}, separators=(",", ":")).encode())
    payload = _b64(json.dumps({"sub":user_id,"role":role,"exp":int(time.time()) + settings.JWT_EXPIRES_MINUTES * 60}, separators=(",", ":")).encode())
    sig = _b64(hmac.new(settings.JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
    return f"{header}.{payload}.{sig}"

def decode_access_token(token: str) -> dict:
    settings = get_settings()
    try:
        header, payload, signature = token.split(".")
        expected = _b64(hmac.new(settings.JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
        data = json.loads(base64.urlsafe_b64decode(payload + "=="))
        if not hmac.compare_digest(signature, expected) or data["exp"] < time.time(): raise ValueError
        return data
    except Exception: raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired access token")
