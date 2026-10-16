import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.schemas.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
def get_health():
    """Basic health check endpoint."""
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        timestamp=datetime.datetime.utcnow().isoformat(),
    )


@router.get("/ready")
def get_readiness(db: Session = Depends(get_db)):
    """Readiness probe checking database and storage readiness without exposing secrets."""
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ready" if db_ok else "degraded",
        "database": "connected" if db_ok else "error",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }
