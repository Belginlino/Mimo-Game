import re
from typing import Tuple, Optional
import httpx
from app.core.config import settings
from app.services.ai.base import BaseChatProvider

MIMO_SYSTEM_INSTRUCTION = (
    "You are Mimo, an adorable, playful, kind 3D cartoon virtual pet playmate. "
    "Keep answers short (1-2 cheerful sentences max), enthusiastic, cute, and child-safe. "
    "Do not pretend to be human or claim real biological emotions. "
    "Always append one reaction tag at the very end in brackets: "
    "[HAPPY], [LAUGH], [SURPRISE], [JUMP], [DANCE], or [SLEEP]."
)


class OpenAIChatProvider(BaseChatProvider):
    """Real AI provider adapter using OpenAI Chat Completions API."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.base_url = "https://api.openai.com/v1/chat/completions"

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def generate_response(self, message: str, mood: str = "happy") -> Tuple[str, str]:
        if not self.is_configured():
            raise ValueError("OPENAI_API_KEY is not configured on the backend.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": MIMO_SYSTEM_INSTRUCTION},
                {"role": "user", "content": f"User mood is {mood}. User says: {message}"},
            ],
            "max_tokens": 100,
            "temperature": 0.8,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            raw_text = data["choices"][0]["message"]["content"]
            return self._extract_reaction(raw_text)

    def _extract_reaction(self, text: str) -> Tuple[str, str]:
        reaction = "happy"
        match = re.search(r"\[(HAPPY|LAUGH|SURPRISE|JUMP|DANCE|SLEEP)\]", text, re.IGNORECASE)
        if match:
            tag = match.group(1).lower()
            if tag == "laugh":
                reaction = "laughing"
            elif tag in ("surprise", "surprised"):
                reaction = "surprised"
            elif tag == "jump":
                reaction = "jumping"
            elif tag == "dance":
                reaction = "dancing"
            elif tag == "sleep":
                reaction = "sleeping"
            else:
                reaction = "happy"
            clean_text = re.sub(r"\[(HAPPY|LAUGH|SURPRISE|JUMP|DANCE|SLEEP)\]", "", text, flags=re.IGNORECASE).strip()
        else:
            clean_text = text.strip()

        return clean_text, reaction
