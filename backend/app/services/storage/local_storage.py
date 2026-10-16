import os
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings


class LocalStorageService:
    """Manages file storage safely with path traversal protection and validation."""

    def __init__(self):
        self.upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        self.models_dir = os.path.abspath(settings.GENERATED_MODELS_DIR)
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.models_dir, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> Tuple[str, str]:
        """
        Validates and saves an uploaded image file.
        Returns: (stored_file_path, unique_file_id)
        """
        filename = file.filename or "upload.jpg"
        ext = os.path.splitext(filename)[1].lower()

        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}",
            )

        if file.content_type and file.content_type not in settings.ALLOWED_IMAGE_MIMES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid MIME type '{file.content_type}'. Expected one of: {', '.join(settings.ALLOWED_IMAGE_MIMES)}",
            )

        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}{ext}"
        destination_path = os.path.join(self.upload_dir, safe_filename)

        # Read and check size
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB.",
            )

        with open(destination_path, "wb") as f:
            f.write(content)

        return destination_path, file_id

    def delete_file(self, filepath: str) -> bool:
        """Safely delete a file ensuring it is within allowed storage directories."""
        abs_path = os.path.abspath(filepath)
        is_in_uploads = abs_path.startswith(self.upload_dir)
        is_in_models = abs_path.startswith(self.models_dir)

        if not (is_in_uploads or is_in_models):
            return False

        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
                return True
            except OSError:
                return False
        return False


storage_service = LocalStorageService()
