import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.config import BACKEND_DIR

UPLOADS_DIR = BACKEND_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


async def save_image(file: UploadFile) -> str:
    """Saves an uploaded image to backend/uploads and returns its public URL path."""
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)
    if not extension:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP, GIF or SVG images are allowed")

    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")

    file_name = f"{uuid.uuid4().hex}{extension}"
    Path(UPLOADS_DIR / file_name).write_bytes(data)
    return f"/uploads/{file_name}"
