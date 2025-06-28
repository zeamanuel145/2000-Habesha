from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from dotenv import load_dotenv
import logging
from typing import List
import os

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    GEMINI_API_KEY: str = Field(..., min_length=20)
    GEMINI_MODEL: str = "gemini-1.5-pro-latest"

    # Gemini safety settings (set to block none for dev)
    GEMINI_SAFETY_SETTINGS: list = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
    ]

    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:*",
        "http://127.0.0.1:*"
    ]

    RATE_LIMIT: str = "10/minute"

    @field_validator('GEMINI_API_KEY')
    def validate_api_key(cls, v):
        if not v.startswith("AI"):
            logger.warning("API key format looks unusual.")
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

try:
    settings = Settings()
    logger.info(f"Settings loaded successfully for environment: {settings.ENVIRONMENT}")
except Exception as e:
    logger.critical(f"Failed to load settings: {e}")
    raise
