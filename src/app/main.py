from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
import logging
from config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from typing import Optional

# Configure structured logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Habesha Restaurant Chatbot API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None
)

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(
    settings.GEMINI_MODEL,
    safety_settings=settings.GEMINI_SAFETY_SETTINGS
)

# Context for the chatbot
RESTAURANT_CONTEXT = """
You are HabeshaBot, the AI assistant for 2000 Habesha Restaurant in Addis Ababa. 
You specialize in Ethiopian cuisine, culture, and hospitality. Be warm, professional, 
and knowledgeable about our menu, hours, and cultural events.

Key information:
- Location: Namibia Street, Bole Atlas
- Hours: 10AM-11PM daily
- Specialties: Kitfo, Doro Wat, Tibs, Vegetarian platters
- Cultural shows: Every Friday and Saturday evening
- Reservations: +251 912 838 383 or website

Guidelines:
1. Always respond in Markdown format
2. Keep responses concise (1-3 sentences)
3. For menu questions, suggest popular items
4. For reservations, provide contact info
5. For cultural questions, share interesting facts
"""

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

@app.get("/", include_in_schema=False)
def root():
    return {"status": "running", "service": "Habesha Restaurant Chatbot"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "chatbot",
        "environment": settings.ENVIRONMENT
    }

@app.post("/chat")
@limiter.limit(settings.RATE_LIMIT)
async def chat(request: Request, chat_request: ChatRequest):
    try:
        # Format chat history for Gemini
        history = [
            {"role": "user" if msg["sender"] == "user" else "model", "content": msg["message"]}
            for msg in chat_request.chat_history
        ]
        
        # Start chat session with history
        chat_session = model.start_chat(history=history)
        
        # Generate response with context
        response = chat_session.send_message(
            f"{RESTAURANT_CONTEXT}\n\n{chat_request.user_message}"
        )
        
        return ChatResponse(
            bot_response=response.text,
            timestamp=datetime.now().isoformat()
        )
        
    except google_exceptions.GoogleAPIError as e:
        logger.error(f"Google API Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Our AI service is currently unavailable. Please try again later."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Our team has been notified."
        )