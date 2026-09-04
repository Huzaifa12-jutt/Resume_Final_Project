"""
services/ocr_service.py
-----------------------
Extracts text from resume images (PNG, JPG, JPEG) using Pillow preprocessing
and Tesseract OCR.
"""

import io
import os
import shutil
import logging
from typing import Optional
from PIL import Image, ImageEnhance, ImageFilter
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Try importing pytesseract
try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    pytesseract = None
    PYTESSERACT_AVAILABLE = False


def _configure_tesseract():
    """Locate and configure the Tesseract binary path."""
    if not PYTESSERACT_AVAILABLE:
        return

    # Check explicit env var
    env_cmd = os.environ.get("TESSERACT_CMD")
    if env_cmd and os.path.isfile(env_cmd):
        pytesseract.pytesseract.tesseract_cmd = env_cmd
        return

    # Check shutil.which
    which_cmd = shutil.which("tesseract")
    if which_cmd:
        pytesseract.pytesseract.tesseract_cmd = which_cmd
        return

    # Common Windows install locations
    common_paths = [
        os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
        r"C:\Users\Discount Laptop\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Tesseract-OCR\tesseract.exe",
    ]
    for p in common_paths:
        if os.path.isfile(p):
            pytesseract.pytesseract.tesseract_cmd = p
            tessdata_dir = os.path.join(os.path.dirname(p), "tessdata")
            if os.path.isdir(tessdata_dir) and "TESSDATA_PREFIX" not in os.environ:
                os.environ["TESSDATA_PREFIX"] = tessdata_dir
            return


# Initial configuration attempt
_configure_tesseract()


def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """
    Applies standard, lightweight image preprocessing to improve OCR accuracy:
    1. Convert to RGB (handles RGBA / palettes)
    2. Convert to Grayscale
    3. Auto-scale if image resolution is too small
    4. Contrast enhancement
    """
    # 1. Ensure RGB mode
    if image.mode != "RGB":
        image = image.convert("RGB")

    # 2. Resize if small
    width, height = image.size
    if width < 1200 and height < 1200:
        scale = max(1.5, 1200 / max(width, 1))
        new_width = int(width * scale)
        new_height = int(height * scale)
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # 3. Grayscale
    gray = image.convert("L")

    # 4. Contrast enhancement
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.6)

    return enhanced


def extract_text_from_image(file_bytes_or_stream) -> str:
    """
    Extracts text from an image (bytes or BytesIO) using OCR.

    Raises:
        HTTPException(422) if image cannot be opened or produces insufficient text.
        HTTPException(500) if OCR engine is missing.
    """
    if not PYTESSERACT_AVAILABLE:
        raise HTTPException(
            status_code=500,
            detail="pytesseract is not installed on the server."
        )

    _configure_tesseract()

    try:
        if isinstance(file_bytes_or_stream, bytes):
            image = Image.open(io.BytesIO(file_bytes_or_stream))
        elif hasattr(file_bytes_or_stream, "read"):
            image = Image.open(file_bytes_or_stream)
        else:
            raise ValueError("Unsupported input type for image OCR")
    except Exception as exc:
        logger.warning(f"Failed to open image for OCR: {exc}")
        raise HTTPException(
            status_code=422,
            detail="The uploaded image could not be processed. Please upload a valid PNG or JPG resume."
        )

    try:
        processed_img = preprocess_image_for_ocr(image)
        # Run OCR with English language
        extracted_text = pytesseract.image_to_string(processed_img, lang="eng")
    except pytesseract.TesseractNotFoundError:
        logger.error("Tesseract-OCR binary not found.")
        raise HTTPException(
            status_code=500,
            detail="OCR engine (Tesseract) is not installed or configured on the server."
        )
    except Exception as exc:
        logger.warning(f"OCR execution failed: {exc}")
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from the uploaded image. Please upload a clearer resume."
        )

    clean_text = extracted_text.strip()
    # Check for meaningful content: at least 30 non-whitespace characters
    non_ws_chars = len("".join(clean_text.split()))
    if non_ws_chars < 30:
        raise HTTPException(
            status_code=422,
            detail="We couldn't read enough text from this image. Please upload a clearer PNG or JPG resume."
        )

    return clean_text
