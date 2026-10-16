from app.core.config import settings
from app.services.ai.base import BaseChatProvider
from app.services.ai.demo_provider import DemoChatProvider
from app.services.ai.gemini_provider import GeminiChatProvider
from app.services.ai.openai_provider import OpenAIChatProvider


def get_chat_provider() -> tuple[BaseChatProvider, str, bool]:
    """
    Returns (provider_instance, provider_name, is_demo_fallback).
    """
    if settings.AI_CHAT_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiChatProvider(), "gemini", False

    if settings.AI_CHAT_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return OpenAIChatProvider(), "openai", False

    # Default to transparent local demo provider
    return DemoChatProvider(), "demo_local", True


__all__ = ["BaseChatProvider", "DemoChatProvider", "GeminiChatProvider", "OpenAIChatProvider", "get_chat_provider"]
