"""
services/file_validator.py
--------------------------
Secure validation of uploaded resume files:
- Checks supported file extensions (.pdf, .png, .jpg, .jpeg)
- Checks MIME / content-type
- Inspects magic bytes (file signature) to prevent extension spoofing
- Enforces file size limits against MAX_UPLOAD_MB
"""

import os
from typing import Tuple
from fastapi import HTTPException
from app.core.config import get_settings

settings = get_settings()

SUPPORTED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

# Map extensions to primary MIME types and allowed aliases
ALLOWED_MIME_TYPES = {
    ".pdf": {"application/pdf", "application/x-pdf", "application/acrobat"},
    ".png": {"image/png", "image/x-png"},
    ".jpg": {"image/jpeg", "image/jpg", "image/pjpeg"},
    ".jpeg": {"image/jpeg", "image/jpg", "image/pjpeg"},
}

# Magic bytes (file signatures)
PDF_SIGNATURE = b"%PDF"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
JPEG_SIGNATURE = b"\xff\xd8\xff"


def validate_resume_file(filename: str, content: bytes, content_type: str = "") -> Tuple[str, str]:
    """
    Validates the uploaded file for:
    1. Empty file
    2. File size limit
    3. Allowed extension (.pdf, .png, .jpg, .jpeg)
    4. Allowed MIME type
    5. Magic bytes signature verification

    Returns:
        (detected_type, normalized_extension)
        where detected_type is 'pdf' or 'image'
        and normalized_extension is e.g. '.pdf', '.png', '.jpg', '.jpeg'

    Raises:
        HTTPException(413) if file exceeds size limit.
        HTTPException(415) if extension, MIME type, or signature is unsupported/invalid.
    """
    if not content:
        raise HTTPException(
            status_code=422,
            detail="The uploaded resume file is empty."
        )

    # 1. Size limit validation
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Resume exceeds the maximum allowed file size ({settings.MAX_UPLOAD_MB}MB)."
        )

    # 2. Extension validation
    _, ext = os.path.splitext(filename.lower())
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Only PDF, PNG, JPG and JPEG resumes are supported."
        )

    # 3. MIME type validation (if provided)
    if content_type:
        clean_content_type = content_type.split(";")[0].strip().lower()
        # If client provided application/octet-stream or generic, rely on extension + magic bytes
        if clean_content_type not in {"application/octet-stream", "binary/octet-stream", ""}:
            valid_mimes = ALLOWED_MIME_TYPES.get(ext, set())
            if clean_content_type not in valid_mimes:
                # Also check if it's any valid resume MIME type
                all_allowed_mimes = {m for mimes in ALLOWED_MIME_TYPES.values() for m in mimes}
                if clean_content_type not in all_allowed_mimes:
                    raise HTTPException(
                        status_code=415,
                        detail="Only PDF, PNG, JPG and JPEG resumes are supported."
                    )

    # 4. Magic bytes validation
    if ext == ".pdf":
        if not content.startswith(PDF_SIGNATURE):
            raise HTTPException(
                status_code=415,
                detail="The uploaded resume could not be processed (invalid PDF signature)."
            )
        return "pdf", ".pdf"

    elif ext == ".png":
        if not content.startswith(PNG_SIGNATURE):
            raise HTTPException(
                status_code=415,
                detail="The uploaded resume could not be processed (invalid PNG signature)."
            )
        return "image", ".png"

    elif ext in {".jpg", ".jpeg"}:
        if not content.startswith(JPEG_SIGNATURE):
            raise HTTPException(
                status_code=415,
                detail="The uploaded resume could not be processed (invalid JPEG signature)."
            )
        return "image", ext

    raise HTTPException(
        status_code=415,
        detail="Only PDF, PNG, JPG and JPEG resumes are supported."
    )
