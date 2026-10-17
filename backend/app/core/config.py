import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Mimo — Your AI Playmate"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./mimo.db"

    # Storage paths
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "uploads")
    GENERATED_MODELS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "models")
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]
    ALLOWED_IMAGE_MIMES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    # AI Chat configuration
    AI_CHAT_PROVIDER: str = "demo"  # "demo", "gemini", or "openai"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    ENABLE_DEMO_FALLBACK: bool = True

    # 3D Avatar Generation configuration
    IMAGE3D_PROVIDER: str = "none"  # "none" or "meshy"; mock is test-only
    HUMAN_AVATAR_PROVIDER_VERIFIED: bool = False
    APP_ENV: str = "development"
    MESHY_API_KEY: Optional[str] = None
    MESHY_API_BASE_URL: str = "https://api.meshy.ai/openapi/v1"

    # Rate limiting & Safety
    RATE_LIMIT_CHAT_PER_MINUTE: int = 30
    RATE_LIMIT_UPLOAD_PER_MINUTE: int = 10
    MAX_CHAT_INPUT_LENGTH: int = 400

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.GENERATED_MODELS_DIR, exist_ok=True)
