import time
from typing import Dict, Any
from app.services.avatar_generation.base import Base3DAvatarProvider


class MockAvatarProvider(Base3DAvatarProvider):
    """
    Mock 3D avatar provider for automated testing and local CI.
    Preserves task state in memory across polling requests.
    """

    _tasks: Dict[str, Dict[str, Any]] = {}

    def is_configured(self) -> bool:
        return True

    async def create_generation_task(self, image_path: str, original_filename: str) -> str:
        task_id = f"mock-task-{int(time.time() * 1000)}"
        self._tasks[task_id] = {
            "status": "queued",
            "progress": 25,
            "created_at": time.time(),
            "model_url": None,
        }
        return task_id

    async def get_task_status(self, provider_task_id: str) -> Dict[str, Any]:
        task = self._tasks.get(provider_task_id)
        if not task:
            return {"status": "failed", "progress": 0, "model_url": None, "error": "Task not found"}

        elapsed = time.time() - task["created_at"]
        if elapsed < 0.5:
            task["status"] = "queued"
            task["progress"] = 25
        elif elapsed < 1.5:
            task["status"] = "processing"
            task["progress"] = 65
        else:
            task["status"] = "succeeded"
            task["progress"] = 100
            task["model_url"] = f"/api/avatars/sample-{provider_task_id}.glb"

        return {
            "status": task["status"],
            "progress": task["progress"],
            "model_url": task["model_url"],
            "error": None,
        }

    async def download_model_glb(self, model_url: str, output_path: str) -> str:
        with open(output_path, "wb") as f:
            f.write(b"glTF\x02\x00\x00\x00\x0c\x00\x00\x00")
        return output_path
