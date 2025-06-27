from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from dotenv import load_dotenv
import logging
from typing import Optional, List

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables first
load_dotenv(verbose=True)  # Will show which .env file is loaded

class Settings(BaseSettings):
    # Required variables
    GEMINI_API_KEY: str = Field(
        min_length=20,
        description="Google Gemini API key"
    )
    
    # CORS settings (single definition)
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",    # React/Vite default
        "http://127.0.0.1:8000",    # FastAPI default
        "http://127.0.0.1:5500",    # VS Code Live Server
        "http://localhost:5500",    # Alternative Live Server
        # Add production domains when ready:
        # "https://yourdomain.com"
    ]
    
    # Optional variables with defaults
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Production-specific variables (optional)
    DATABASE_URL: Optional[str] = None
    SENTRY_DSN: Optional[str] = None
    
    @field_validator('GEMINI_API_KEY')
    def validate_api_key(cls, v):
        if not v.startswith("AI"):
            logger.warning("API key format looks unusual")
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'  # Ignore extra env variables

# Instantiate settings
try:
    settings = Settings()
    logger.info(f"Settings loaded for {settings.ENVIRONMENT} environment")
    logger.debug(f"Allowed origins: {settings.ALLOWED_ORIGINS}")
except Exception as e:
    logger.error(f"Failed to load settings: {e}")
    raisemkd