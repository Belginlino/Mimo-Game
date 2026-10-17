from app.core.config import settings
from app.services.avatar_generation.base import Base3DAvatarProvider
from app.services.avatar_generation.meshy_provider import MeshyAvatarProvider
from app.services.avatar_generation.mock_provider import MockAvatarProvider


def get_image3d_provider() -> tuple[Base3DAvatarProvider, str, bool]:
    """
    Returns (provider_instance, provider_name, is_configured).
    """
    if settings.IMAGE3D_PROVIDER == "meshy":
        provider = MeshyAvatarProvider()
        return provider, "meshy", provider.is_configured() and settings.HUMAN_AVATAR_PROVIDER_VERIFIED

    # The mock is available to automated tests only and is never a production success path.
    mock_p = MockAvatarProvider()
    if settings.APP_ENV == "test" and settings.IMAGE3D_PROVIDER == "mock":
        return mock_p, "mock", True
    return mock_p, "not_configured", False


__all__ = ["Base3DAvatarProvider", "MeshyAvatarProvider", "MockAvatarProvider", "get_image3d_provider"]
