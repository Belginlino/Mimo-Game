import base64
import os
import mimetypes
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.services.avatar_generation.base import Base3DAvatarProvider


class MeshyAvatarProvider(Base3DAvatarProvider):
    """
    Real Image-to-3D provider adapter for Meshy API.
    Docs: https://docs.meshy.ai/api/image-to-3d
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.MESHY_API_KEY
        self.base_url = settings.MESHY_API_BASE_URL.rstrip("/")

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def create_generation_task(self, image_path: str, original_filename: str) -> str:
        if not self.is_configured():
            raise ValueError("MESHY_API_KEY is not configured on the backend server.")

        # Read image and convert to data URI
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        mime_type, _ = mimetypes.guess_type(original_filename)
        if not mime_type:
            mime_type = "image/jpeg"

        b64_str = base64.b64encode(image_bytes).decode("utf-8")
        data_uri = f"data:{mime_type};base64,{b64_str}"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "image_url": data_uri,
            "enable_pbr": True,
            "surface_mode": "hard",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/image-to-3d", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            task_id = data.get("result")
            if not task_id:
                raise ValueError(f"Meshy API did not return task ID: {data}")
            return task_id

    async def get_task_status(self, provider_task_id: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "status": "failed",
                "progress": 0,
                "model_url": None,
                "error": "MESHY_API_KEY is not configured.",
            }

        headers = {"Authorization": f"Bearer {self.api_key}"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(f"{self.base_url}/image-to-3d/{provider_task_id}", headers=headers)
            resp.raise_for_status()
            data = resp.json()

            raw_status = data.get("status", "").upper()
            progress = data.get("progress", 0)
            model_urls = data.get("model_urls", {})
            glb_url = model_urls.get("glb")

            if raw_status in ("PENDING", "QUEUED"):
                status = "queued"
            elif raw_status == "IN_PROGRESS":
                status = "processing"
            elif raw_status == "SUCCEEDED":
                status = "succeeded"
            else:
                status = "failed"

            return {
                "status": status,
                "progress": progress,
                "model_url": glb_url,
                "error": data.get("task_error", {}).get("message") if status == "failed" else None,
            }

    async def download_model_glb(self, model_url: str, output_path: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(model_url)
            resp.raise_for_status()
            content = resp.content

            # Validate GLB header magic bytes ("glTF")
            if len(content) < 4 or content[:4] != b"glTF":
                raise ValueError("Downloaded file is not a valid GLB binary asset.")

            with open(output_path, "wb") as f:
                f.write(content)

            return output_path
