from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field
from typing import Optional
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
import logging
from src.app.config import settings
import google.generativeai as genai
from src.app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)




logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Habesha Restaurant Chatbot API",
    version="1.0.0",
    docs_url="/docs"
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel(
    settings.GEMINI_MODEL,
    safety_settings=settings.GEMINI_SAFETY_SETTINGS
)

RESTAURANT_CONTEXT = """You are HabeshaBot, the AI assistant for 2000 Habesha Restaurant.

Respond in Markdown format with:

- **Bold** for important info
- *Italics* for emphasis
- Bullet points for lists

Key information:
• *Hours*: 10AM-11PM daily  
• *Location*: Namibia Street, Bole Atlas  
• *Specials*:  
  - Kitfo  
  - Doro Wat  
  - Vegetarian platters  
• *Reservations*: +251 912 838 383"""

class ChatRequest(BaseModel):
    user_message: str = Field(..., min_length=1, max_length=500)
    chat_history: Optional[list] = Field(default_factory=list)

class ChatResponse(BaseModel):
    bot_response: str
    status: str = "success"
    timestamp: str

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Too many requests, please try again later."}
    )

@app.get("/")
def root():
    return {"status": "running", "service": "Habesha Restaurant Chatbot"}

@app.get("/model-info")
def get_model_info():
    return {"model_in_use": settings.GEMINI_MODEL}

@app.post("/chat")
@limiter.limit(settings.RATE_LIMIT)
async def chat(request: Request, chat_request: ChatRequest):
    try:
        history = [
            {"role": "user" if msg["sender"] == "user" else "model", "content": msg["message"]}
            for msg in chat_request.chat_history
        ]

        chat_session = model.start_chat(history=history)

        response = chat_session.send_message(
            f"{RESTAURANT_CONTEXT}\n\nUser: {chat_request.user_message}"
        )

        return ChatResponse(
            bot_response=response.text,
            timestamp=datetime.now().isoformat()
        )

    except google_exceptions.GoogleAPIError as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Our AI service is currently unavailable"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )
