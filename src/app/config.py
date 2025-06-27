from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from dotenv import load_dotenv
import logging
from typing import List, Optional

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv(verbose=True)

class Settings(BaseSettings):
    # Google Gemini Configuration
    GEMINI_API_KEY: str = Field(..., min_length=20)
    GEMINI_MODEL: str = "gemini-1.5-pro"
    GEMINI_SAFETY_SETTINGS: Optional[dict] = {
        "HARASSMENT": "BLOCK_NONE",
        "HATE_SPEECH": "BLOCK_NONE",
        "SEXUAL": "BLOCK_NONE",
        "DANGEROUS": "BLOCK_NONE"
    }
    
    # Application Configuration
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:*",
        "http://127.0.0.1:*",
        "https://habesha-restaurant.com"
    ]
    
    # Rate Limiting
    RATE_LIMIT: str = "10/minute"
    
    @field_validator('GEMINI_API_KEY')
    def validate_api_key(cls, v):
        if not v.startswith("AI"):
            logger.warning("API key format looks unusual")
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'

try:
    settings = Settings()
    logger.info(f"Settings loaded successfully for {settings.ENVIRONMENT}")
except Exception as e:
    logger.critical(f"Failed to load settings: {e}")
    raise