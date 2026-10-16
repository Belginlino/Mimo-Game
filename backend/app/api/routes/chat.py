import datetime
import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.models import GameProgress
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.ai import get_chat_provider
from app.services.ai.demo_provider import DemoChatProvider

router = APIRouter(prefix="/chat", tags=["Chat"])

# Simple sliding window rate limiter: session_id -> list of timestamps
_rate_limit_records = defaultdict(list)


def check_rate_limit(session_id: str):
    now = time.time()
    window_start = now - 60.0
    # Filter timestamps older than 60s
    recent = [ts for ts in _rate_limit_records[session_id] if ts > window_start]
    if len(recent) >= settings.RATE_LIMIT_CHAT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Chat rate limit exceeded. Please wait a moment before sending another message.",
        )
    recent.append(now)
    _rate_limit_records[session_id] = recent


@router.post("", response_model=ChatResponse)
async def chat_with_mimo(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to Mimo and receive a playful reply with an animation reaction.
    Transparently reports whether live AI or local demo fallback was used.
    """
    check_rate_limit(request.session_id or "default")

    provider, provider_name, is_demo = get_chat_provider()

    reply_text = ""
    reaction = "happy"

    try:
        reply_text, reaction = await provider.generate_response(request.message, mood=request.mood or "happy")
    except Exception as e:
        # Graceful fallback to demo mode if allowed
        if settings.ENABLE_DEMO_FALLBACK:
            fallback = DemoChatProvider()
            reply_text, reaction = await fallback.generate_response(request.message, mood=request.mood or "happy")
            provider_name = "demo_local"
            is_demo = True
        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI chat provider error: {str(e)}",
            )

    # Update game progress in database
    progress = db.query(GameProgress).filter(GameProgress.session_id == request.session_id).first()
    if not progress:
        progress = GameProgress(
            session_id=request.session_id or "guest-session",
            affection=15,
            happiness=65,
            energy=90,
            interactions_count=1,
            last_action="chat",
        )
        db.add(progress)
    else:
        progress.interactions_count += 1
        progress.affection = min(100, progress.affection + 1)
        progress.happiness = min(100, progress.happiness + 2)
        progress.last_action = "chat"
    db.commit()

    return ChatResponse(
        reply=reply_text,
        character_reaction=reaction,
        provider_used=provider_name,
        is_demo_fallback=is_demo,
        timestamp=datetime.datetime.utcnow().isoformat(),
    )
