import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SurakshitSthan AI"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "surakshitsthan-jwt-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./surakshitsthan.db")
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017/surakshitsthan"
    )
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE: bool = False

    CACHE_TTL_MINUTES: int = int(os.getenv("CACHE_TTL_MINUTES", "60"))
    SCRAPER_USER_AGENT: str = os.getenv(
        "SCRAPER_USER_AGENT",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 SurakshitSthan-AI-Scraper/2.4.0"
    )
    SCRAPER_TIMEOUT_SECONDS: int = int(os.getenv("SCRAPER_TIMEOUT_SECONDS", "25"))
    SCRAPER_MAX_RETRIES: int = int(os.getenv("SCRAPER_MAX_RETRIES", "3"))

    model_config = ConfigDict(case_sensitive=True, extra="allow")

settings = Settings()
