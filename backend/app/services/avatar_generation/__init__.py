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
        return provider, "meshy", provider.is_configured()

    # Default is mock provider
    mock_p = MockAvatarProvider()
    return mock_p, "mock", True


__all__ = ["Base3DAvatarProvider", "MeshyAvatarProvider", "MockAvatarProvider", "get_image3d_provider"]
