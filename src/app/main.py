from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import logging
from .config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI with rate limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

# Production CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# Restaurant context (consider moving to config.py)
RESTAURANT_CONTEXT = """..."""

class ChatRequest(BaseModel):
    user_message: str

@app.get("/")
def root():
    return {"status": "running", "service": "Habesha Flavors Chatbot"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gemini_ready": True
    }

@app.post("/chat")
@limiter.limit("5/minute")
async def chat(request: Request, chat_request: ChatRequest):
    try:
        if not chat_request.user_message.strip():
            raise HTTPException(status_code=400, detail="Empty message")
            
        full_prompt = f"{RESTAURANT_CONTEXT}\n\nGuest: {chat_request.user_message}\n\nYou:"
        response = model.generate_content(full_prompt)
        
        if not response.text:
            raise HTTPException(status_code=502, detail="Empty AI response")
            
        return {"bot_response": response.text.strip()}
        
    except genai.APIError as e:
        logger.error(f"Gemini API Error: {e}")
        raise HTTPException(status_code=502, detail="AI service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500)