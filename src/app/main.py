from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from app.config import settings

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

app = FastAPI()

# Allow CORS for testing from anywhere
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test GET route to avoid 404 in browser
@app.get("/")
def root():
    return {"message": "Habesha Flavors Chatbot is running"}

# Pydantic model for incoming request
class ChatRequest(BaseModel):
    user_message: str

# Restaurant context for Gemini prompt
restaurant_context = """
You are the AI chatbot for Habesha Flavors Restaurant, based in Addis Ababa.

Your tone: Friendly, warm, culturally authentic Ethiopian host.

Key info you should always include:
- Opening Hours: Daily 10AM–11PM (Live shows in the evening)
- Signature Dishes: Kitfo, Doro Wat, Tibs, Shiro
- Dietary Options: Vegan and Vegetarian (Shiro, Gomen, Vegetarian Combo)
- Location: Namibia Street, Bole Atlas, near Ethiopian Skylight Hotel
- Reservations: Call +251 912 838 383, book on website, or ask in chat
- Contact: Same number above
"""

# POST endpoint for chatbot
@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.user_message.strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="Empty message received.")

    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        full_prompt = f"{restaurant_context}\n\nGuest: {user_message}\n\nYou:"
        response = model.generate_content(full_prompt)
        ai_reply = response.text.strip()

        return {"bot_response": ai_reply}

    except Exception as e:
        print("Error with Gemini API:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error. Please try again later.")
