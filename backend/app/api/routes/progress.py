from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import GameProgress
from app.schemas.schemas import GameProgressSchema, InteractionActionRequest

router = APIRouter(prefix="/progress", tags=["Game Progress"])


@router.get("", response_model=GameProgressSchema)
def get_progress(session_id: str = Query("guest-session"), db: Session = Depends(get_db)):
    """Get pet progress, affection, happiness, and energy."""
    record = db.query(GameProgress).filter(GameProgress.session_id == session_id).first()
    if not record:
        record = GameProgress(session_id=session_id)
        db.add(record)
        db.commit()
        db.refresh(record)

    return GameProgressSchema(
        affection=record.affection,
        happiness=record.happiness,
        energy=record.energy,
        interactions_count=record.interactions_count,
        last_action=record.last_action,
    )


@router.post("/interact", response_model=GameProgressSchema)
def record_interaction(request: InteractionActionRequest, db: Session = Depends(get_db)):
    """Record touch or pet care interaction and update pet status values."""
    record = db.query(GameProgress).filter(GameProgress.session_id == request.session_id).first()
    if not record:
        record = GameProgress(session_id=request.session_id)
        db.add(record)

    record.interactions_count += 1
    record.last_action = request.action

    action = request.action.lower()
    if action == "tickle":
        record.happiness = min(100, record.happiness + 5)
        record.affection = min(100, record.affection + 2)
        record.energy = max(0, record.energy - 2)
    elif action == "pat":
        record.happiness = min(100, record.happiness + 4)
        record.affection = min(100, record.affection + 3)
        record.energy = max(0, record.energy - 1)
    elif action == "feed":
        record.energy = min(100, record.energy + 15)
        record.happiness = min(100, record.happiness + 3)
    elif action == "dance":
        record.happiness = min(100, record.happiness + 8)
        record.affection = min(100, record.affection + 2)
        record.energy = max(0, record.energy - 8)
    elif action == "jump":
        record.happiness = min(100, record.happiness + 4)
        record.energy = max(0, record.energy - 5)
    elif action == "sleep":
        record.energy = min(100, record.energy + 30)
        record.happiness = min(100, record.happiness + 2)
    elif action == "talk":
        record.affection = min(100, record.affection + 2)
        record.happiness = min(100, record.happiness + 3)

    db.commit()
    db.refresh(record)

    return GameProgressSchema(
        affection=record.affection,
        happiness=record.happiness,
        energy=record.energy,
        interactions_count=record.interactions_count,
        last_action=record.last_action,
    )


@router.delete("")
def reset_progress(session_id: str = Query("guest-session"), db: Session = Depends(get_db)):
    """Reset pet progression back to starting state."""
    record = db.query(GameProgress).filter(GameProgress.session_id == session_id).first()
    if record:
        record.affection = 15
        record.happiness = 60
        record.energy = 90
        record.interactions_count = 0
        record.last_action = "reset"
        db.commit()
    return {"message": "Game progress reset"}
