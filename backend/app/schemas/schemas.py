from typing import Optional, List
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    service: str = "Mimo Backend API"
    timestamp: str


class PublicConfigResponse(BaseModel):
    project_name: str
    version: str
    chat_provider: str
    chat_provider_configured: bool
    image3d_provider: str
    image3d_provider_configured: bool
    enable_demo_fallback: bool
    max_upload_size_bytes: int
    allowed_image_types: List[str]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=400, description="User message to Mimo")
    session_id: Optional[str] = Field(default="guest-session", max_length=64)
    mood: Optional[str] = Field(default="happy", max_length=32)


class ChatResponse(BaseModel):
    reply: str
    character_reaction: str  # "happy", "laughing", "surprised", "jumping", "dancing", "talking"
    provider_used: str  # "gemini", "openai", or "demo_local"
    is_demo_fallback: bool
    timestamp: str


class AvatarUploadResponse(BaseModel):
    job_id: str
    status: str  # "queued", "processing", "succeeded", "failed"
    message: str
    original_filename: str
    created_at: str


class AvatarStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    model_url: Optional[str] = None
    error_message: Optional[str] = None
    is_rigged: bool = False
    provider: str


class UserSettingsSchema(BaseModel):
    sound_enabled: bool = True
    sound_volume: float = Field(default=0.8, ge=0.0, le=1.0)
    reduced_motion: bool = False
    selected_palette: str = "bubblegum"
    selected_accessory: str = "none"
    selected_environment: str = "playroom"


class GameProgressSchema(BaseModel):
    affection: int = Field(default=15, ge=0, le=100)
    happiness: int = Field(default=60, ge=0, le=100)
    energy: int = Field(default=90, ge=0, le=100)
    interactions_count: int = 0
    last_action: Optional[str] = "greet"


class InteractionActionRequest(BaseModel):
    action: str = Field(..., description="Action name: tickle, pat, feed, dance, sleep, jump")
    session_id: str = Field(default="guest-session", max_length=64)
