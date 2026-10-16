from abc import ABC, abstractmethod
from typing import Tuple


class BaseChatProvider(ABC):
    """Abstract base class for Mimo AI Chat Providers."""

    @abstractmethod
    async def generate_response(self, message: str, mood: str = "happy") -> Tuple[str, str]:
        """
        Generate a conversational response from Mimo.

        Returns:
            Tuple[str, str]: (reply_text, character_reaction)
            character_reaction should be one of:
            "happy", "laughing", "surprised", "jumping", "dancing", "talking"
        """
        pass
