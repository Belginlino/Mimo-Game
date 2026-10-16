from fastapi import APIRouter
from app.core.config import settings
from app.schemas.schemas import PublicConfigResponse
from app.services.ai import get_chat_provider
from app.services.avatar_generation import get_image3d_provider

router = APIRouter(prefix="/config", tags=["Configuration"])


@router.get("/public", response_model=PublicConfigResponse)
def get_public_config():
    """
    Returns public feature flags and availability.
    Crucial: Absolutely no API secrets or sensitive keys are exposed.
    """
    _, chat_name, is_demo = get_chat_provider()
    _, image3d_name, image3d_ready = get_image3d_provider()

    return PublicConfigResponse(
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        chat_provider=chat_name,
        chat_provider_configured=not is_demo,
        image3d_provider=image3d_name,
        image3d_provider_configured=image3d_ready,
        enable_demo_fallback=settings.ENABLE_DEMO_FALLBACK,
        max_upload_size_bytes=settings.MAX_UPLOAD_SIZE_BYTES,
        allowed_image_types=settings.ALLOWED_IMAGE_EXTENSIONS,
    )
