from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import UserSettings
from app.schemas.schemas import UserSettingsSchema

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=UserSettingsSchema)
def get_user_settings(session_id: str = Query("guest-session"), db: Session = Depends(get_db)):
    """Retrieve user preferences."""
    record = db.query(UserSettings).filter(UserSettings.session_id == session_id).first()
    if not record:
        record = UserSettings(session_id=session_id)
        db.add(record)
        db.commit()
        db.refresh(record)

    return UserSettingsSchema(
        sound_enabled=record.sound_enabled,
        sound_volume=record.sound_volume,
        reduced_motion=record.reduced_motion,
        selected_palette=record.selected_palette,
        selected_accessory=record.selected_accessory,
        selected_environment=record.selected_environment,
    )


@router.put("", response_model=UserSettingsSchema)
def update_user_settings(
    settings: UserSettingsSchema,
    session_id: str = Query("guest-session"),
    db: Session = Depends(get_db),
):
    """Update user preferences."""
    record = db.query(UserSettings).filter(UserSettings.session_id == session_id).first()
    if not record:
        record = UserSettings(session_id=session_id)
        db.add(record)

    record.sound_enabled = settings.sound_enabled
    record.sound_volume = settings.sound_volume
    record.reduced_motion = settings.reduced_motion
    record.selected_palette = settings.selected_palette
    record.selected_accessory = settings.selected_accessory
    record.selected_environment = settings.selected_environment

    db.commit()
    db.refresh(record)

    return settings


@router.delete("")
def reset_user_settings(session_id: str = Query("guest-session"), db: Session = Depends(get_db)):
    """Reset user settings back to initial defaults."""
    record = db.query(UserSettings).filter(UserSettings.session_id == session_id).first()
    if record:
        db.delete(record)
        db.commit()
    return {"message": "Settings reset to defaults"}
