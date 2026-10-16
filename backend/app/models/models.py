import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text
from app.core.database import Base


class AvatarJob(Base):
    __tablename__ = "avatar_jobs"

    id = Column(String(36), primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)
    status = Column(String(20), default="queued", nullable=False)  # queued, processing, succeeded, failed
    original_filename = Column(String(255), nullable=False)
    stored_image_path = Column(String(512), nullable=False)
    model_filename = Column(String(255), nullable=True)
    model_url = Column(String(512), nullable=True)
    provider = Column(String(50), default="mock", nullable=False)
    provider_task_id = Column(String(128), nullable=True)
    progress = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)


class UserSettings(Base):
    __tablename__ = "user_settings"

    session_id = Column(String(64), primary_key=True, index=True)
    sound_enabled = Column(Boolean, default=True, nullable=False)
    sound_volume = Column(Float, default=0.8, nullable=False)
    reduced_motion = Column(Boolean, default=False, nullable=False)
    selected_palette = Column(String(32), default="bubblegum", nullable=False)
    selected_accessory = Column(String(32), default="none", nullable=False)
    selected_environment = Column(String(32), default="playroom", nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)


class GameProgress(Base):
    __tablename__ = "game_progress"

    session_id = Column(String(64), primary_key=True, index=True)
    affection = Column(Integer, default=15, nullable=False)
    happiness = Column(Integer, default=60, nullable=False)
    energy = Column(Integer, default=90, nullable=False)
    interactions_count = Column(Integer, default=0, nullable=False)
    last_action = Column(String(64), default="greet", nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
