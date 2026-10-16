from abc import ABC, abstractmethod
from typing import Dict, Any


class Base3DAvatarProvider(ABC):
    """Abstract interface for Image-to-3D providers."""

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if required API credentials exist."""
        pass

    @abstractmethod
    async def create_generation_task(self, image_path: str, original_filename: str) -> str:
        """Submit image for 3D model generation and return task ID."""
        pass

    @abstractmethod
    async def get_task_status(self, provider_task_id: str) -> Dict[str, Any]:
        """
        Poll task status.
        Returns dict with:
        - status: "queued", "processing", "succeeded", "failed"
        - progress: int (0-100)
        - model_url: Optional[str]
        - error: Optional[str]
        """
        pass

    @abstractmethod
    async def download_model_glb(self, model_url: str, output_path: str) -> str:
        """Download resulting GLB/GLTF file safely to backend storage."""
        pass
